import type { AgentInfo, AgentSpawnInput } from 'claude-code';
import { expect, test } from 'claude-code/testing';
const band = (isWorking: boolean) => ({ component: 'AbovePrompt' as const, props: { hasSurvey: false, isCollapsed: false, isWorking, maxRows: 20, bodyColumns: 100, scroll: { offset: 0, bodyRows: 20 }, view: {} } });
const SPAWN = { prompt: 'x', description: 'x', subagentType: 'general-purpose', tool_use_id: 't1' } as unknown as AgentSpawnInput;
const agent = (id: string, type: string, status: AgentInfo['status'] = 'running'): AgentInfo => ({ id, type, description: '', status });
const alt = async (ui: {
    findAll: (q: {
        type: 'Svg';
    }) => Promise<unknown[]>;
}) => (await ui.findAll({ type: 'Svg' })).map(n => (n as {
    props: {
        alt: string;
        source: string;
    };
}).props);
test('没人在做：不出现', async ($, on) => {
    on('ui.render', ($, e) => { const { Box } = $.ui.resolve(e); return <Box />; });
    for (const surface of ['terminal', 'desktop'] as const) {
        const ui = await $.ui.mount({ plugin: 'crew-band', surface, ...band(false) });
        expect(await ui.findAll({ type: 'Svg' })).toHaveLength(0);
        expect(await ui.find({ type: 'Text', text: /🦀/ })).toBeUndefined();
        await ui.unmount();
    }
});
test('主线在工作、还没用工具：在想', async ($, on) => {
    on('ui.render', ($, e) => { const { Box } = $.ui.resolve(e); return <Box />; });
    const ui = await $.ui.mount({ plugin: 'crew-band', surface: 'desktop', ...band(true) });
    const a = await alt(ui);
    expect(a).toHaveLength(1);
    expect(a[0]!.alt).toBe('🦀 小克在想');
    expect(a[0]!.source.length).toBeLessThan(131072);
});
const CASES: [
    string,
    Record<string, unknown>,
    string
][] = [
    ['Read', { file_path: '/tmp/a' }, '🦀 小克在读档'],
    ['Grep', { pattern: 'x' }, '🦀 小克在读档'],
    ['Edit', { file_path: '/tmp/a', old_string: 'a', new_string: 'b' }, '🦀 小克在改档'],
    ['Write', { file_path: '/tmp/a', content: 'a' }, '🦀 小克在改档'],
    ['Bash', { command: 'ls' }, '🦀 小克在跑命令'],
    ['WebSearch', { query: 'x' }, '🦀 小克在上网查'],
    ['WebFetch', { url: 'https://example.com', prompt: 'x' }, '🦀 小克在上网查'],
    ['Agent', { description: 'x', prompt: 'x', subagent_type: 'general-purpose' }, '🦀 小克在派小帮手'],
    ['AskUserQuestion', { questions: [] }, '🦀 小克等你回'],
];
for (const [tool, input, want] of CASES) {
    test(`用 ${tool} 的时候：${want}`, async ($, on) => {
        on('ui.render', ($, e) => { const { Box } = $.ui.resolve(e); return <Box />; });
        let during: string[] = [];
        on('tool.call', async () => {
            const ui = await $.ui.mount({ plugin: 'crew-band', surface: 'desktop', ...band(true) });
            during = (await alt(ui)).map(x => x.alt);
            await ui.unmount();
            return { result: 'ok' } as never;
        });
        await $.tool.call({ tool, ...input } as never);
        expect(during).toEqual([want]);
        const ui = await $.ui.mount({ plugin: 'crew-band', surface: 'desktop', ...band(true) });
        expect((await alt(ui)).map(x => x.alt)).toEqual(['🦀 小克在想']);
    });
}
test('工具出错：缩一下（出错了），停 4 秒才回去', async ($, on) => {
    on('ui.render', ($, e) => { const { Box } = $.ui.resolve(e); return <Box />; });
    on('tool.call', () => ({ result: 'boom', isError: true }) as never);
    await $.tool.call({ tool: 'Bash', command: 'false' } as never);
    const ui = await $.ui.mount({ plugin: 'crew-band', surface: 'desktop', ...band(false) });
    expect((await alt(ui)).map(x => x.alt)).toEqual(['🦀 小克出错了']);
    await ui.unmount();
});
test('subagent 在跑：小克身边多一个小机器人，照它自己的状态', async ($, on) => {
    on('ui.render', ($, e) => { const { Box } = $.ui.resolve(e); return <Box />; });
    on('agent.list', () => ({ value: [agent('a1', 'Explore'), agent('a2', 'general-purpose'), agent('a3', 'x', 'completed')] }));
    on('agent.spawn', () => ({ agentId: 'a1', model: 'sonnet' }));
    let during: string[] = [];
    on('tool.call', async () => {
        const ui = await $.ui.mount({ plugin: 'crew-band', surface: 'desktop', ...band(true) });
        during = (await alt(ui)).map(x => x.alt);
        await ui.unmount();
        return { result: 'ok' } as never;
    });
    await $.agent.spawn(SPAWN);
    await $.tool.call({ tool: 'Read', file_path: '/tmp/a', agentId: 'a1' } as never);
    expect(during).toEqual(['🦀 小克在想 · 2 个小帮手：在读档、在想']);
    const term = await $.ui.mount({ plugin: 'crew-band', surface: 'terminal', ...band(true) });
    expect((await term.find({ type: 'Text', text: /🦀/ }))?.text).toBe('🦀 小克在想 · 2 个小帮手：在想、在想');
});
test('/crew-demo：小克出来表演、带三个小机器人', async ($, on) => {
    on('ui.render', ($, e) => { const { Box } = $.ui.resolve(e); return <Box />; });
    on('command.run', () => ({ text: '' }));
    await $.command.run({ command: 'crew-demo', args: '' } as never);
    const ui = await $.ui.mount({ plugin: 'crew-band', surface: 'desktop', ...band(false) });
    const a = await alt(ui);
    expect(a).toHaveLength(1);
    expect(a[0]!.alt).toContain('3 个小帮手');
});
test('/crew-off 这个窗口不显示，/crew-on 回来', async ($, on) => {
    on('ui.render', ($, e) => { const { Box } = $.ui.resolve(e); return <Box />; });
    on('command.run', () => ({ text: '' }));
    await $.command.run({ command: 'crew-off', args: '' } as never);
    let ui = await $.ui.mount({ plugin: 'crew-band', surface: 'desktop', ...band(true) });
    expect(await ui.findAll({ type: 'Svg' })).toHaveLength(0);
    await ui.unmount();
    await $.command.run({ command: 'crew-on', args: '' } as never);
    ui = await $.ui.mount({ plugin: 'crew-band', surface: 'desktop', ...band(true) });
    expect(await ui.findAll({ type: 'Svg' })).toHaveLength(1);
});
