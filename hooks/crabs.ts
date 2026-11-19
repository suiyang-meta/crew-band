import { ClawdMoves } from './vendor/clawd-lib.js';
import type { State } from './states';
export type Helper = {
    key: string;
    state: State;
};
export const BAND_W = 560, BAND_H = 34, MAX_CRABS = 3, MAX_HELPERS = 6, SVG_LIMIT = 126000;
const GROUND = BAND_H - 3, G = 2, FPS = 8;
const INK = '#3A332D';
const r1 = (n: number) => Math.round(n * 10) / 10;
const tidy = (s: string) => s.replace(/-?\d+\.\d+e-\d+/g, '0').replace(/-?\d+\.\d+/g, m => String(Math.round(Number(m) * 2) / 2));
function rng(seed: number) { let s = (seed ^ 0x9e3779b9) >>> 0 || 1; const f = () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; f(); f(); f(); return f; }
export function hash(str: string) { let h = 2166136261; for (const ch of str) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619);
} return h >>> 0; }
const ACT: Record<State, {
    move: string;
    o?: Record<string, unknown>;
    walk: boolean;
}> = {
    think: { move: 'magic', walk: true },
    read: { move: 'search', walk: true },
    web: { move: 'scan', walk: true },
    edit: { move: 'work', walk: true },
    run: { move: 'cook', walk: true },
    dispatch: { move: 'assign', walk: true },
    wait: { move: 'point', o: { dir: -1 }, walk: false },
    error: { move: 'flinch', walk: true },
    done: { move: 'music', walk: true },
    compact: { move: 'sleepBook', walk: false },
    tool: { move: 'shrug', walk: true },
};
function robot(id: string, seed: number) {
    const R = rng(seed), css: string[] = [], RP = 6, n = RP * FPS;
    const pts: number[] = [];
    for (let k = 0; k < 4; k++)
        pts.push((R() < .5 ? -1 : 1) * (22 + R() * 42));
    const xs: {
        x: number;
        flip: boolean;
    }[] = [];
    for (let i = 0; i < n; i++) {
        const t = i / n * pts.length, k = Math.floor(t), f = Math.min(1, (t - k) * 1.6), a = pts[k % pts.length]!, b = pts[(k + 1) % pts.length]!;
        xs.push({ x: a + (b - a) * f, flip: b < a });
    }
    const pc = (j: number) => r1((j / n) * 100), ph = r1(-(R() * RP));
    let prev = '';
    const A: string[] = [], B: string[] = [];
    xs.forEach((p, j) => { const v = `transform:translate(${r1(p.x)}px,${j % 2 ? -1 : 0}px)`; if (v !== prev)
        A.push(`${pc(j)}%{${v}}`); prev = v; });
    prev = '';
    xs.forEach((p, j) => { const v = `transform:scaleX(${p.flip ? -1 : 1})`; if (v !== prev)
        B.push(`${pc(j)}%{${v}}`); prev = v; });
    css.push(`@keyframes ${id}m{${A.join('')}100%{transform:translate(${r1(xs[0]!.x)}px,0)}}.${id}m{animation:${id}m ${RP}s linear ${ph}s infinite}`, `@keyframes ${id}f{${B.join('')}}.${id}f{animation:${id}f ${RP}s step-end ${ph}s infinite}`, `.${id}l{animation:${id}l .22s step-end infinite}.${id}r{animation:${id}l .22s step-end -.11s infinite}@keyframes ${id}l{0%{transform:translateY(-1.2px)}50%{transform:translateY(0)}}`, `.${id}a{animation:${id}a .8s step-end infinite}@keyframes ${id}a{0%{fill:#FF6B5B}50%{fill:#FFD34D}}`);
    const body = `<path d="M0 -13 v-3" stroke="#8A919C" stroke-width=".9"/><circle class="${id}a" cx="0" cy="-17" r="1.3" fill="#FF6B5B"/>`
        + `<rect x="-5" y="-13" width="10" height="7.5" rx="2" fill="#E6E9EE" stroke="#8A919C" stroke-width=".7"/><rect x="-3.6" y="-11.8" width="7.2" height="5" rx="1.3" fill="#1F2430"/>`
        + `<rect x="-2.2" y="-10.3" width="1.4" height="1.9" rx=".4" fill="#5CE1E6"/><rect x=".8" y="-10.3" width="1.4" height="1.9" rx=".4" fill="#5CE1E6"/>`
        + `<rect x="-3.4" y="-5.6" width="6.8" height="3" rx=".8" fill="#C9CED6"/>`
        + `<g class="${id}l"><rect x="-2.7" y="-2.6" width="1.7" height="2.6" fill="#8A919C"/></g><g class="${id}r"><rect x="1" y="-2.6" width="1.7" height="2.6" fill="#8A919C"/></g>`;
    return { svg: `<g class="${id}m"><ellipse cx="0" cy="1" rx="5" ry="1" fill="rgba(0,0,0,.2)"/><g class="${id}f">${body}</g></g>`, css: css.join('') };
}
export type CrabIn = {
    key: string;
    state: State;
    x0?: number;
    since?: number;
};
export const homeX = (key: string) => { const R = rng(hash(key)); return 30 + R() * (BAND_W - 70); };
type Seg = {
    t0: number;
    t1: number;
    x0: number;
    x1: number;
    act: boolean;
};
export function plan(state: State, key: string, x0: number): {
    P: number;
    segs: Seg[];
    dur: number;
} {
    const seed = hash(key + state), R = rng(seed), xmin = 30, xmax = BAND_W - 40, a = ACT[state], dur = (ClawdMoves.moves[a.move]?.dur ?? 3) + .2;
    if (!a.walk)
        return { P: dur, segs: [{ t0: 0, t1: dur, x0, x1: x0, act: true }], dur };
    const dist = 90 + R() * 200, x1 = Math.min(xmax, Math.max(xmin, x0 + (x0 > (xmin + xmax) / 2 ? -dist : dist)));
    const speed = state === 'run' ? 46 : state === 'think' ? 26 : 34, w = Math.abs(x1 - x0) / speed;
    const segs: Seg[] = [{ t0: 0, t1: dur, x0, x1: x0, act: true }, { t0: dur, t1: dur + w, x0, x1, act: false },
        { t0: dur + w, t1: 2 * dur + w, x0: x1, x1, act: true }, { t0: 2 * dur + w, t1: 2 * dur + 2 * w, x0: x1, x1: x0, act: false }];
    return { P: 2 * w + 2 * dur, segs, dur };
}
export function posAt(c: CrabIn, nowMs: number) {
    const x0 = c.x0 ?? homeX(c.key), { P, segs } = plan(c.state, c.key, x0);
    const t = (((nowMs - (c.since ?? 0)) / 1000) % P + P) % P, g = segs.find(s => t >= s.t0 && t <= s.t1) ?? segs[segs.length - 1]!;
    return g.x0 + (g.x1 - g.x0) * (g.t1 > g.t0 ? (t - g.t0) / (g.t1 - g.t0) : 0);
}
function crab(c: CrabIn, id: string, nowMs: number, afps: number, bots: Helper[]) {
    const main = c.state, key = c.key, css: string[] = [], seed = hash(key + main), a = ACT[main], acc = ClawdMoves.moves[a.move]?.crew as string | undefined;
    const { P, segs, dur } = plan(main, key, c.x0 ?? homeX(key));
    const phase = r1(-((((nowMs - (c.since ?? 0)) / 1000) % P + P) % P)), pc = (t: number) => r1((t / P) * 100);
    const xs: string[] = [], fs: string[] = [];
    let flip = false;
    segs.forEach(g => {
        if (!g.act && g.x1 !== g.x0)
            flip = g.x1 < g.x0;
        xs.push(`${pc(g.t0)}%{transform:translateX(${r1(g.x0)}px)}`);
        fs.push(`${pc(g.t0)}%{transform:scaleX(${flip ? -1 : 1})}`);
    });
    xs.push(`100%{transform:translateX(${r1(segs[segs.length - 1]!.x1)}px)}`);
    css.push(`@keyframes ${id}m{${xs.join('')}}.${id}m{animation:${id}m ${r1(P)}s linear ${phase}s infinite}`, `@keyframes ${id}f{${fs.join('')}}.${id}f{animation:${id}f ${r1(P)}s step-end ${phase}s infinite}`);
    const layers: string[] = [];
    const show = (cls: string, wins: [
        number,
        number
    ][], byOpacity = false) => {
        const on = byOpacity ? 'opacity:1' : 'visibility:visible', off = byOpacity ? 'opacity:0' : 'visibility:hidden';
        const k: string[] = [`0%{${off}}`];
        wins.forEach(([s, e]) => { k.push(`${pc(s)}%{${on}}`, `${pc(e)}%{${off}}`); });
        css.push(`@keyframes ${cls}{${k.join('')}100%{${off}}}.${cls}{${off};animation:${cls} ${r1(P)}s step-end ${phase}s infinite}`);
    };
    const draw = (p: Record<string, unknown>) => tidy(ClawdMoves.draw(0, 0, G, p, acc ? { acc } : {}));
    const walkSegs = segs.filter(s => !s.act);
    if (walkSegs.length) {
        const base = ClawdMoves.at('idle', 0, 0, { g: G, seed });
        const wf = [draw({ ...base, legLift: [.6, 0, .6, 0], y: -.25 }), draw({ ...base, legLift: [0, .6, 0, .6] })];
        show(`${id}W`, walkSegs.map(g => [g.t0, g.t1] as [
            number,
            number
        ]), true);
        css.push(`.${id}w0{animation:${id}fw .3s step-end infinite}.${id}w1{animation:${id}fw .3s step-end -.15s infinite}@keyframes ${id}fw{0%{visibility:visible}50%{visibility:hidden}100%{visibility:hidden}}`);
        layers.push(`<g class="${id}W">${wf.map((f, j) => `<g class="${id}w${j}">${f}</g>`).join('')}</g>`);
    }
    const actSegs = segs.filter(s => s.act), steps = Math.max(5, Math.round(dur * afps));
    const frames: {
        svg: string;
        wins: [
            number,
            number
        ][];
    }[] = [];
    for (let i = 0; i < steps; i++) {
        const tt = (dur * i) / steps;
        const p = ClawdMoves.at(a.move, tt, tt + (seed % 7), { g: G, seed, ...(a.o ?? {}) });
        const f = draw({ ...p, x: 0 }), last = frames[frames.length - 1];
        const wins = actSegs.map(s => [s.t0 + tt, s.t0 + tt + dur / steps] as [
            number,
            number
        ]);
        if (last && last.svg === f)
            last.wins.forEach((w, j) => { w[1] = wins[j]![1]; });
        else
            frames.push({ svg: f, wins });
    }
    frames.forEach((f, j) => { const cls = `${id}a${j}`; show(cls, f.wins); layers.push(`<g class="${cls}">${f.svg}</g>`); });
    const robots = bots.map((h, j) => { const b = robot(`${id}r${j}`, hash(h.key)); css.push(b.css); return b.svg; }).join('');
    const shadow = `<ellipse cx="0" cy="1" rx="13" ry="1.5" fill="rgba(0,0,0,.2)"/>`;
    return { css: css.join(''), svg: `<g class="${id}m">${robots}${shadow}<g class="${id}f">${layers.join('')}</g></g>` };
}
export function bandSvg(crabs: CrabIn[], bots: Helper[] = [], nowMs = Date.now()) {
    if (!crabs.length)
        return `<svg xmlns="http://www.w3.org/2000/svg" width="${BAND_W}" height="${BAND_H}"/>`;
    crabs = crabs.slice(0, MAX_CRABS);
    bots = bots.slice(0, MAX_HELPERS);
    let svg = '';
    for (const [afps, side] of [[5, 5], [4, 4], [4, 2], [3, 2], [2, 2]] as const) {
        const parts = crabs.map((c, i) => crab(c, `k${i}`, nowMs, i === 0 ? afps : side, i === 0 ? bots : []));
        svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${BAND_W}" height="${BAND_H}" viewBox="0 0 ${BAND_W} ${BAND_H}">${ClawdMoves.DEFS}<style>svg g{transform-box:view-box}${parts.map(p => p.css).join('')}</style><g transform="translate(0 ${GROUND})">${parts.map(p => p.svg).join('')}</g></svg>`;
        if (svg.length <= SVG_LIMIT)
            break;
    }
    return svg;
}
