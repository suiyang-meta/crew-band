import { atom, read, update } from 'claude-code';
import type { EngineInterface, Register } from 'claude-code';
import type { Slot, Worker } from '../types';
import { BAND_H, BAND_W, MAX_CRABS, bandSvg, posAt, type CrabIn } from './crabs';
import { LINGER, LOOKS, stateOfTool, type State } from './states';
const workers = atom({ plugin: 'crew-band', key: 'workers' } as const, [] as Worker[]);
const slots = atom({ plugin: 'crew-band', key: 'slots' } as const, {} as Record<string, Slot>);
const off = atom({ plugin: 'crew-band', key: 'off' } as const, false);
const demo = atom({ plugin: 'crew-band', key: 'demo' } as const, false);
const LIVE = new Set(['pending', 'running', 'waiting']);
const ORDER = Object.keys(LOOKS) as State[];
const MAIN = 'main';
async function poll($: EngineInterface) {
    const list = await $.agent.list();
    const now: Worker[] = list.filter(a => LIVE.has(a.status)).map(a => ({ id: a.id, type: a.type, description: a.description ?? '' }));
    const before = await read($, workers);
    if (JSON.stringify(before) !== JSON.stringify(now))
        await update($, workers, () => now);
}
function whereNow(key: string, sl: Slot | undefined, now: number) {
    if (!sl)
        return posAt({ key, state: 'think', since: 0 }, now);
    return posAt({ key, state: sl.s === 'gone' ? 'think' : sl.s, x0: sl.x0, since: sl.at }, now);
}
async function set($: EngineInterface, key: string, s: State | undefined) {
    const at = Date.now();
    await update($, slots, cur => {
        const next = { ...cur }, x0 = whereNow(key, cur[key], at);
        if (s)
            next[key] = { s, at, x0 };
        else if (key === MAIN)
            next[key] = { s: 'gone', at, x0 };
        else
            delete next[key];
        return next;
    });
    const linger = s ? LINGER[s] : undefined;
    if (linger)
        $.clock.after(linger, () => {
            const t = Date.now();
            update($, slots, cur => {
                if (cur[key]?.at !== at)
                    return cur;
                const next = { ...cur }, x0 = whereNow(key, cur[key], t);
                if (key === MAIN)
                    next[key] = { s: 'gone', at: t, x0 };
                else
                    delete next[key];
                return next;
            }).catch(() => { });
        });
}
const keyOf = (e: {
    agentId?: string;
}) => e.agentId ?? MAIN;
export const register: Register = on => {
    on('session.start', async ($, e, next) => {
        const r = await next(e);
        await update($, slots, () => ({}));
        $.clock.every(1500, () => { poll($).catch(() => { }); });
        await $.command.register({ name: 'crew-demo', description: '小克轮流换 11 种工作状态、带几个小机器人出来表演 20 秒' });
        await $.command.register({ name: 'crew-off', description: '这个窗口不显示小克（别的窗口不受影响）' });
        await $.command.register({ name: 'crew-on', description: '这个窗口重新显示小克' });
        return r;
    });
    on('turn.start', async ($, e, next) => { const r = await next(e); await set($, keyOf(e), 'think').catch(() => { }); return r; });
    on('tool.call', async ($, e, next) => {
        const key = keyOf(e);
        await set($, key, stateOfTool(String(e.tool))).catch(() => { });
        const r = await next(e);
        const failed = 'deny' in r ? true : !!r.isError;
        await set($, key, failed ? 'error' : 'think').catch(() => { });
        return r;
    });
    on('tool.check', async ($, e, next) => {
        const r = await next(e);
        if (r.decision === 'ask')
            await set($, keyOf(e), 'wait').catch(() => { });
        return r;
    });
    on('session.compact', async ($, e, next) => {
        await set($, MAIN, 'compact').catch(() => { });
        const r = await next(e);
        await set($, MAIN, undefined).catch(() => { });
        return r;
    });
    on('turn.complete', async ($, e, next) => {
        const r = await next(e);
        if (e.agentId) {
            await set($, e.agentId, undefined).catch(() => { });
            poll($).catch(() => { });
        }
        else {
            await set($, MAIN, e.reason === 'answer' ? 'done' : e.reason === 'error' ? 'error' : undefined).catch(() => { });
            if (!(await read($, off))) {
                if (e.reason === 'answer')
                    $.ui.toast('🦀 小克做完了');
                else if (e.reason === 'error')
                    $.ui.toast('🦀 小克出错了，回来看一下');
            }
        }
        return r;
    });
    on('agent.spawn', async ($, e, next) => { const r = await next(e); await poll($).catch(() => { }); return r; });
    on('command.run', { command: 'crew-off' }, async ($) => {
        await update($, off, () => true);
        return { text: '这个窗口的小克收起来了；要再叫出来打 /crew-on。' };
    });
    on('command.run', { command: 'crew-on' }, async ($) => {
        await update($, off, () => false);
        return { text: '这个窗口的小克回来了。' };
    });
    on('command.run', { command: 'crew-demo' }, async ($) => {
        await update($, demo, () => true);
        $.clock.after(22000, () => { update($, demo, () => false).catch(() => { }); });
        ORDER.forEach((st, i) => $.clock.after(i * 2000, () => { set($, MAIN, st).catch(() => { }); }));
        $.clock.after(ORDER.length * 2000, () => { set($, MAIN, undefined).catch(() => { }); });
        return { text: `小克轮流表演 ${ORDER.length} 种状态（每种 2 秒），身边带三个小机器人：${ORDER.map(s => LOOKS[s].zh).join('、')}。` };
    });
    on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
        if (e.props.hasSurvey || (await read($, off)))
            return next(e);
        const isDemo = await read($, demo), map = await read($, slots), list = await read($, workers);
        const sl = map[MAIN], live = sl && sl.s !== 'gone' ? sl.s : undefined;
        const helpers = isDemo ? [{ key: 'demo-a', state: 'read' as State }, { key: 'demo-b', state: 'run' as State }, { key: 'demo-c', state: 'web' as State }]
            : list.map(w => ({ key: w.id, state: map[w.id]?.s === 'gone' ? 'think' as State : (map[w.id]?.s as State | undefined) ?? ('think' as State) }));
        const main: State | undefined = live ?? (e.props.isWorking || isDemo ? 'think' : helpers.length ? 'dispatch' : undefined);
        if (!main && helpers.length === 0)
            return next(e);
        const crabs: CrabIn[] = [
            ...(main ? [{ key: MAIN, state: main, x0: sl?.x0, since: sl?.at }] : []),
            ...helpers.slice(0, MAX_CRABS - 1).map(h => ({ key: h.key, state: h.state, x0: map[h.key]?.x0, since: map[h.key]?.at })),
        ];
        const base = await next(e);
        const words = `🦀 小克${LOOKS[main ?? 'dispatch'].zh}${helpers.length ? ` · ${helpers.length} 个小帮手：${helpers.map(h => LOOKS[h.state].zh).join('、')}` : ''}`;
        if (e.surface === 'terminal') {
            const { Box, Text } = $.ui.resolve(e);
            return (<Box flexDirection="column">
          <Text dimColor>{words}</Text>
          {base}
        </Box>);
        }
        const { Box, Svg } = $.ui.resolve(e);
        return (<Box flexDirection="column">
        <Svg source={bandSvg(crabs, helpers.slice(MAX_CRABS - 1))} alt={words} width={BAND_W} height={BAND_H}/>
        {base}
      </Box>);
    });
};
