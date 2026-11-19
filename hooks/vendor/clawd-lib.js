function clawdOfficial(o = {}) {
    const g = o.g ?? 24, col = o.col ?? '#DE886D', ink = o.ink ?? '#141416', dark = o.dark ?? '#B9654D';
    const sk = Math.min(1.4, Math.max(0, o.sink ?? 0));
    const X = c => (c - 5.5) * g, Y = r => (r - 9) * g + ((o.dy ?? 0) + sk) * g, YL = r => (r - 9) * g + (o.dy ?? 0) * g;
    const R = (c, r, w, h, fill = col, extra = '') => `<rect x="${X(c)}" y="${Y(r)}" width="${w * g}" height="${h * g}" fill="${fill}" ${extra}/>`;
    const sh = o.shade ?? true, side = o.side ?? -1, sd = o.sideCol ?? '#C5694C';
    const legs = (fill = col) => [1, 3, 7, 9].map((c, i) => `<g transform="translate(0 ${(o.legLift?.[i] ?? 0) * -g})"><rect x="${X(c)}" y="${YL(7)}" width="${g}" height="${2 * g}" fill="${fill}"/>${sh && fill === col ? `<rect x="${X(side < 0 ? c : c + .55)}" y="${YL(7)}" width="${.45 * g}" height="${2 * g}" fill="${sd}"/>` : ''}</g>`).join('');
    const armShade = (c0, back) => sh ? R(c0, 4.45, 2.7, .55, sd) + (back ? R(side < 0 ? c0 : c0 + 2.15, 3, .55, 2, sd) : '') : '';
    const armL = (fill = col) => `<g transform="rotate(${o.armL ?? 0} ${X(0)} ${Y(5)})">${R(-2, 3, 2.7, 2, fill)}${fill === col ? armShade(-2, side < 0) : ''}</g>`;
    const armR = (fill = col) => `<g transform="rotate(${-(o.armR ?? 0)} ${X(11)} ${Y(5)})">${R(10.3, 3, 2.7, 2, fill)}${fill === col ? armShade(10.3, side > 0) : ''}</g>`;
    const holdL = h => h ? `<g transform="rotate(${o.armL ?? 0} ${X(0)} ${Y(5)})"><g transform="translate(${X(-2)} ${Y(4)})">${h}</g></g>` : '';
    const holdR = h => h ? `<g transform="rotate(${-(o.armR ?? 0)} ${X(11)} ${Y(5)})"><g transform="translate(${X(13)} ${Y(4)})">${h}</g></g>` : '';
    let s = '';
    const ex = (o.extrude ?? 0) * .45 * g;
    if (ex)
        s += `<g transform="translate(${ex} ${ex})">${legs(dark)}${armL(dark)}${armR(dark)}${R(0, 0, 11, 7, dark)}</g>`;
    const acc = o.acc;
    const ACC = typeof clawdAcc === 'function' ? clawdAcc(acc, g, X, Y, R, ink) : {};
    s += (ACC.behind || '') + legs() + armL() + armR() + R(0, 0, 11, 7);
    if (sh)
        s += R(side < 0 ? 0 : 10, 0, 1, 7, sd) + (ACC.brim ? R(0, 0, 11, .55, sd) : '');
    const e = o.eyes ?? 'slit', sw = .55 * g;
    const chev = (c, up) => `<path d="M${X(c - .3)} ${Y(up ? 3.55 : 2.45)} L${X(c + .5)} ${Y(up ? 2.55 : 3.45)} L${X(c + 1.3)} ${Y(up ? 3.55 : 2.45)}" fill="none" stroke="${ink}" stroke-width="${sw}" stroke-linejoin="miter" stroke-linecap="butt"/>`;
    const eo = Math.min(1, Math.max(0, o.eyeOpen ?? 1)), eX = o.eyeX ?? 0, ey = o.eyeY ?? 0;
    const slit = (c, dx = 0) => { const h = Math.max(.16, 2 * eo), w = 1 + .3 * (1 - eo); return R(c + dx + eX - (w - 1) / 2, 4 - h + ey, w, h, ink); };
    for (const c of [2, 8]) {
        if (e === 'slit')
            s += slit(c);
        else if (e === 'look-l')
            s += slit(c, -.4);
        else if (e === 'look-r')
            s += slit(c, .4);
        else if (e === 'roll') {
            const [px, py] = o.pupil ?? [0, -1];
            s += R(c - .15, 1.8, 1.3, 2.3, '#fff') + R(c + .32 + px * .3 + eX * .5, 2.62 + py * .66, .66, .66, ink);
        }
        else if (e === 'squeeze')
            s += `<path d="M${X(c + (c < 5 ? -.1 : 1.1))} ${Y(2.2 + ey)} L${X(c + (c < 5 ? 1.1 : -.1))} ${Y(3 + ey)} L${X(c + (c < 5 ? -.1 : 1.1))} ${Y(3.8 + ey)}" fill="none" stroke="${ink}" stroke-width="${sw}" stroke-linejoin="miter"/>`;
        else if (e === 'happy')
            s += chev(c, true);
        else if (e === 'sad')
            s += chev(c, false);
        else if (e === 'closed')
            s += R(c - .25, 3, 1.5, .5, ink);
        else if (e === 'wink')
            s += c < 5 ? slit(c) : R(c - .25, 3, 1.5, .5, ink);
        else if (e === 'narrow')
            s += R(c - .15, 2.7, 1.3, .7, ink);
        else if (e === 'wide')
            s += R(c - .2, 1.6, 1.4, 2.6, '#fff') + R(c + .2, 2.3, .6, 1.3, ink);
        else if (e === 'star') {
            const cx = X(c + .5), cy = Y(3), r = .95 * g;
            s += `<path d="M${cx} ${cy - r} L${cx + r * .28} ${cy - r * .28} L${cx + r} ${cy} L${cx + r * .28} ${cy + r * .28} L${cx} ${cy + r} L${cx - r * .28} ${cy + r * .28} L${cx - r} ${cy} L${cx - r * .28} ${cy - r * .28}Z" fill="#FFB547"/>`;
        }
    }
    if (o.mouth === 'o')
        s += R(5.1, 4.6, .8, .8, ink);
    if (o.mouth === 'flat')
        s += R(4.6, 4.9, 1.8, .35, ink);
    if (o.glasses)
        s += [2, 8].map(c => `<rect x="${X(c - .7)}" y="${Y(1.5)}" width="${2.4 * g}" height="${2.6 * g}" fill="rgba(255,255,255,.18)" stroke="${ink}" stroke-width="${.35 * g}"/>`).join('') + `<rect x="${X(3.7)}" y="${Y(2.4)}" width="${3.6 * g}" height="${.35 * g}" fill="${ink}"/>`;
    s += (ACC.front || '') + holdL(o.holdL ?? ACC.holdL) + holdR(o.holdR ?? ACC.holdR);
    const em = o.emote;
    if (em === 'sweat')
        s += `<path d="M${X(11.6)} ${Y(-1.6)} q${.7 * g} ${1 * g} 0 ${1.7 * g} q${-.7 * g} ${-.7 * g} 0 ${-1.7 * g}Z" fill="#7FB8FF"/>`;
    if (em === 'zzz')
        s += [[11.2, -.6, .9], [12.4, -1.9, 1.2], [13.9, -3.4, 1.5]].map(([c, r, k]) => `<path d="M${X(c)} ${Y(r)} h${k * g} l${-k * g} ${k * g} h${k * g}" fill="none" stroke="${ink}" stroke-width="${.3 * g}" stroke-linejoin="miter"/>`).join('');
    if (em === 'spark')
        s += [[11.8, -1.6, 1], [13.3, .2, .6]].map(([c, r, k]) => { const cx = X(c), cy = Y(r), q = k * g; return `<path d="M${cx} ${cy - q} L${cx + q * .3} ${cy - q * .3} L${cx + q} ${cy} L${cx + q * .3} ${cy + q * .3} L${cx} ${cy + q} L${cx - q * .3} ${cy + q * .3} L${cx - q} ${cy} L${cx - q * .3} ${cy - q * .3}Z" fill="#FFB547"/>`; }).join('');
    if (em === 'bang')
        s += R(12, -2.6, .7, 2, '#FF3B30') + R(12, -.2, .7, .7, '#FF3B30');
    if (em === 'heart') {
        const cx = X(12.2), cy = Y(-1.2), k = .55 * g;
        s += `<path d="M${cx} ${cy + k * 1.6} L${cx - k * 1.6} ${cy} A${k * .8} ${k * .8} 0 0 1 ${cx} ${cy - k * .9} A${k * .8} ${k * .8} 0 0 1 ${cx + k * 1.6} ${cy}Z" fill="#FF3B30"/>`;
    }
    return `<g shape-rendering="${o.crisp ? 'crispEdges' : 'auto'}">${s}</g>`;
}
function clawdAcc(acc, g, X, Y, R, ink) {
    const star = (cx, cy, r, f) => `<path d="M${cx} ${cy - r} L${cx + r * .28} ${cy - r * .28} L${cx + r} ${cy} L${cx + r * .28} ${cy + r * .28} L${cx} ${cy + r} L${cx - r * .28} ${cy + r * .28} L${cx - r} ${cy} L${cx - r * .28} ${cy - r * .28}Z" fill="${f}"/>`;
    if (acc === 'headphones') {
        const c = '#2F5D9E';
        return { behind: `<path d="M${X(.2)} ${Y(1.2)} L${X(.2)} ${Y(-.6)} L${X(1.4)} ${Y(-1.6)} L${X(9.6)} ${Y(-1.6)} L${X(10.8)} ${Y(-.6)} L${X(10.8)} ${Y(1.2)}" fill="none" stroke="${c}" stroke-width="${.7 * g}" stroke-linejoin="miter"/>`,
            front: R(-.7, .9, 1.5, 3, c) + R(10.2, .9, 1.5, 3, c) };
    }
    if (acc === 'beret') {
        const hat = `<path d="M${X(1.5)} ${Y(.15)} Q${X(2)} ${Y(-1.9)} ${X(6)} ${Y(-1.7)} Q${X(9.6)} ${Y(-1.5)} ${X(8.8)} ${Y(.15)}Z" fill="#FF3B30"/>` + R(5.6, -2.3, .7, .8, '#FF3B30');
        const board = `<g transform="rotate(${20})"><rect x="${-.2 * g}" y="${-3.2 * g}" width="${2.6 * g}" height="${3.4 * g}" rx="${.15 * g}" fill="#C89B6D"/><rect x="${.1 * g}" y="${-2.6 * g}" width="${2 * g}" height="${2.5 * g}" fill="#fff"/><rect x="${.55 * g}" y="${-3.5 * g}" width="${1.1 * g}" height="${.6 * g}" fill="#6b6670"/>${[0, 1, 2].map(i => `<rect x="${.35 * g}" y="${(-2.2 + i * .65) * g}" width="${1.5 * g}" height="${.22 * g}" fill="#BDB7AE"/>`).join('')}</g>`;
        return { front: hat, holdL: board, brim: true };
    }
    if (acc === 'detective') {
        const c = '#8A5A3B', d = '#6E4429';
        const hat = R(.8, -.55, 9.4, .7, d) + `<path d="M${X(2.2)} ${Y(-.4)} L${X(2.8)} ${Y(-2.3)} L${X(8.2)} ${Y(-2.3)} L${X(8.8)} ${Y(-.4)}Z" fill="${c}"/>` + R(2.6, -1.1, 5.8, .45, '#141416');
        const mag = `<line x1="0" y1="0" x2="${1.4 * g}" y2="${-1.4 * g}" stroke="#6E4429" stroke-width="${.45 * g}" stroke-linecap="square"/><circle cx="${2.4 * g}" cy="${-2.4 * g}" r="${1.25 * g}" fill="rgba(170,215,255,.45)" stroke="#141416" stroke-width="${.35 * g}"/>`;
        return { front: hat, holdR: mag, brim: true };
    }
    if (acc === 'wizard') {
        const c = '#2F4A9E', d = '#223878';
        const cone = [[2.6, -1.9, 5.8], [3.3, -2.6, 4.5], [4.0, -3.3, 3.4], [4.8, -4.0, 2.4], [5.8, -4.7, 1.7], [6.9, -5.3, 1.2]];
        const hat = R(.4, -.7, 10.2, .75, c) + R(.4, -.7, .9, .75, d) + R(2.4, -1.3, 6.2, .65, '#F2E3B6')
            + cone.map(([x, y, w]) => R(x, y, w, .72, c) + R(x, y, .55, .72, d)).join('');
        const wand = `<rect x="0" y="${-.17 * g}" width="${2.8 * g}" height="${.34 * g}" fill="#6E4429"/>` + star(3.3 * g, 0, .75 * g, '#FFB547');
        return { front: hat, holdR: wand, brim: true };
    }
    if (acc === 'chef') {
        const w = '#FBF9F4', d = '#DCD6CC', e = '#B9B0A3';
        const hat = R(1.35, -1.45, 8.3, 1.6, e) + R(.95, -3.65, 9.1, 2.6, e) + R(1.55, -4.35, 2.8, 1.1, e) + R(4.15, -4.65, 2.8, 1.4, e) + R(6.75, -4.35, 2.8, 1.1, e)
            + R(1.6, -1.3, 7.8, 1.3, w) + R(1.6, -1.3, .6, 1.3, d) + R(1.6, -.25, 7.8, .25, d)
            + R(1.2, -3.4, 8.6, 2.2, w) + R(1.2, -3.4, .6, 2.2, d) + R(1.8, -4.1, 2.3, .8, w) + R(4.4, -4.4, 2.3, 1.1, w) + R(7.0, -4.1, 2.3, .8, w);
        const pan = `<rect x="0" y="${-.18 * g}" width="${1.9 * g}" height="${.38 * g}" fill="#2A2A2E"/><rect x="${1.9 * g}" y="${-.7 * g}" width="${3.4 * g}" height="${.95 * g}" fill="#2A2A2E"/><rect x="${2.1 * g}" y="${-.7 * g}" width="${3.0 * g}" height="${.22 * g}" fill="#55555C"/>`;
        return { front: hat, holdR: pan, brim: true };
    }
    if (acc === 'book') {
        const pg = '#F4E7C6', ed = '#A0522D';
        const book = R(.2, -.5, 10.6, .5, ed) + R(.5, -1.2, 4.9, .8, pg) + R(5.6, -1.2, 4.9, .8, pg) + R(.3, -.9, .5, .9, pg) + R(10.2, -.9, .5, .9, pg)
            + R(5.25, -1.5, .5, 1.5, '#8A4A2A') + [1.2, 2.6, 6.3, 7.7].map(x => R(x, -.95, 1.0, .14, '#D9C9A3')).join('');
        return { front: book, brim: true };
    }
    if (acc === 'laptop') {
        const lid = R(.9, 3.0, 9.2, 4.4, '#2A2A2E') + R(.9, 3.0, 9.2, .3, '#4A4A52') + R(5.0, 4.8, 1.0, 1.0, '#3C3C44');
        return { front: lid + R(.4, 7.4, 10.2, .6, '#3C3C44') };
    }
    if (acc === 'binoculars') {
        const k = '#2A2A2E';
        return { front: R(1.4, 1.5, 2.4, 2.2, k) + R(7.2, 1.5, 2.4, 2.2, k) + R(3.8, 2.2, 3.4, .8, k) + R(1.8, 1.9, .7, .7, '#7FB8FF') + R(7.6, 1.9, .7, .7, '#7FB8FF') };
    }
    if (acc === 'checker') {
        const glasses = [2, 8].map(c => `<rect x="${X(c - .7)}" y="${Y(1.5)}" width="${2.4 * g}" height="${2.6 * g}" fill="rgba(255,255,255,.18)" stroke="${ink}" stroke-width="${.35 * g}"/>`).join('') + R(3.7, 2.4, 3.6, .35, ink);
        const pen = `<g transform="rotate(-60)"><rect x="${-.3 * g}" y="${-3 * g}" width="${.6 * g}" height="${3 * g}" fill="#FF3B30"/><path d="M${-.3 * g} 0 L0 ${.7 * g} L${.3 * g} 0Z" fill="#F3D5C8"/></g>`;
        return { front: glasses, holdR: pen };
    }
    return {};
}
if (typeof module !== 'undefined')
    module.exports = { clawdOfficial, clawdAcc };
(function (root) {
    const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
    const seg = (t, a, b) => clamp((t - a) / (b - a));
    const lerp = (a, b, k) => a + (b - a) * k;
    const E = {
        out: k => 1 - Math.pow(1 - k, 4),
        in: k => k * k * k,
        inOut: k => k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2,
        sine: k => .5 - .5 * Math.cos(Math.PI * k),
    };
    const spr = (t, t0, f = 11, d = 6) => { const u = t - t0; return u <= 0 ? 0 : 1 - Math.exp(-d * u) * (Math.cos(f * u) + d / f * Math.sin(f * u)); };
    const wob = (t, t0, f = 10, d = 5) => { const u = t - t0; return u <= 0 ? 0 : Math.exp(-d * u) * Math.sin(f * u); };
    function trk(t, keys) {
        let v = keys[0][1];
        for (let i = 1; i < keys.length; i++) {
            const [t0, val, how = 's'] = keys[i], dv = val - keys[i - 1][1];
            if (!dv)
                continue;
            let k;
            if (how[0] === 's') {
                const [f, d] = how.length > 1 ? how.slice(1).split(',').map(Number) : [11, 6];
                k = spr(t, t0, f, d);
            }
            else {
                const dur = +how.slice(1), fn = how[0] === 'o' ? E.out : how[0] === 'i' ? E.in : E.inOut;
                k = fn(seg(t, t0, t0 + dur));
            }
            v += dv * k;
        }
        return v;
    }
    const pick = (t, keys) => { let v = keys[0][1]; for (const [t0, val] of keys)
        if (t >= t0)
            v = val; return v; };
    const hash = (n, s = 0) => { const x = Math.sin(n * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); };
    const BL = {};
    function blinkOpen(T, seed = 0) {
        if (!BL[seed]) {
            const a = [];
            let t = .6 + hash(0, seed) * 1.5;
            for (let n = 1; t < 400; n++) {
                a.push(t);
                if (hash(n, seed + 9) < .18)
                    a.push(t + .26);
                t += 2 + 2.6 * hash(n, seed);
            }
            BL[seed] = a;
        }
        let v = 1;
        for (const b of BL[seed]) {
            if (b > T)
                break;
            const u = T - b;
            if (u < .19)
                v = Math.min(v, u < .07 ? 1 - E.sine(u / .07) : E.sine((u - .07) / .12));
        }
        return v;
    }
    function handTip(side, ang, g, sink = 0) {
        const R = side === 'R', a = (R ? -ang : ang) * Math.PI / 180;
        const px = (R ? 5.5 : -5.5) * g, py = (-4 + sink) * g, vx = (R ? 2 : -2) * g, vy = -g;
        return [px + vx * Math.cos(a) - vy * Math.sin(a), py + vx * Math.sin(a) + vy * Math.cos(a)];
    }
    function idle(T, seed = 0) {
        const p = seed * 1.7;
        return {
            x: 0, y: 0, scale: 1, flip: false,
            sink: .16 + .05 * Math.sin(T * 2.1 + p) + .02 * Math.sin(T * 3.3 + p * 2),
            rot: .7 * Math.sin(T * .83 + p) + .35 * Math.sin(T * 1.9 + p * .5),
            armL: 4 + 4 * Math.sin(T * 1.55 + .4 + p), armR: 4 + 4 * Math.sin(T * 1.41 + 1.3 + p),
            eyes: 'slit', eyeOpen: blinkOpen(T, seed), eyeX: .05 * Math.sin(T * .37 + p), eyeY: 0,
            legLift: [0, 0, 0, 0], fxBack: '', fxBody: '', fxGround: '',
        };
    }
    const puff = (x, y, k, g, dir = 1) => k <= 0 || k >= 1 ? '' : [0, 1, 2].map(i => { const kk = clamp(k * 1.25 - i * .12); if (kk <= 0)
        return ''; const r = g * (.45 + 1.1 * E.out(kk)) * (1 - i * .18); return `<circle cx="${x + dir * g * (1.4 * E.out(kk) + i * 1.1)}" cy="${y - g * (.9 * E.out(kk) + i * .5)}" r="${r}" fill="#E2D6CA" opacity="${(.9 * (1 - kk)).toFixed(3)}"/>`; }).join('');
    const dust = (x, k, g, dir = 1) => k <= 0 || k >= 1 ? '' : [0, 1, 2].map(i => `<circle cx="${x - dir * g * (1 + 2.6 * E.out(k)) * (1 + i * .35)}" cy="${-g * (.4 + .5 * i * k)}" r="${g * (.5 + .9 * E.out(k) - i * .12)}" fill="#E8DFD2" opacity="${(.85 * (1 - k)).toFixed(3)}"/>`).join('');
    const sweat = (k, g) => k <= 0 ? '' : `<g transform="translate(${6.4 * g} ${-10.2 * g + g * .8 * E.inOut(clamp(k * 1.4 - .4))}) scale(${spr(k, 0, 14, 7)})"><path d="M0 ${-.9 * g} q${.7 * g} ${1 * g} 0 ${1.7 * g} q${-.7 * g} ${-.7 * g} 0 ${-1.7 * g}Z" fill="#7FB8FF" opacity="${clamp(2.2 - k * 2.2)}"/></g>`;
    const heart = (k, g) => { if (k <= 0 || k >= 1)
        return ''; const s = spr(k * 1.6, 0, 12, 6) * g * .06, y = -10.5 * g - 2.4 * g * E.out(k); return `<path transform="translate(${5.5 * g + Math.sin(k * 7) * g * .3} ${y}) scale(${s})" d="M0 6 C-2 -2 -14 -4 -14 6 C-14 14 -4 18 0 24 C4 18 14 14 14 6 C14 -4 2 -2 0 6Z" fill="#FF3B30" opacity="${clamp(4 - k * 4)}"/>`; };
    const bang = (k, g) => k <= 0 || k >= 1 ? '' : `<g transform="translate(${6.8 * g} ${-11.2 * g}) scale(${spr(k * 1.2, 0, 16, 8)})" opacity="${clamp(5 - k * 5)}"><rect x="0" y="${-2 * g}" width="${.7 * g}" height="${2 * g}" fill="#FF3B30"/><rect x="0" y="${.35 * g}" width="${.7 * g}" height="${.7 * g}" fill="#FF3B30"/></g>`;
    const dots = (t, t0, g, n = 3) => Array.from({ length: n }, (_, i) => { const k = spr(t, t0 + i * .18, 13, 7); return k <= 0 ? '' : `<rect x="${6.3 * g + i * 1.1 * g}" y="${-9.6 * g - .4 * g * Math.sin(Math.PI * clamp((t - t0 - i * .18) / .3))}" width="${.6 * g}" height="${.6 * g}" fill="#141416" opacity="${clamp(k)}"/>`; }).join('');
    const zzz = (k, g) => k <= 0 ? '' : [[0, .9], [1.3, 1.2], [2.8, 1.5]].map(([d, s], i) => { const kk = clamp(k * 1.5 - i * .25); if (kk <= 0)
        return ''; const x = 6.2 * g + d * g, y = -9.5 * g - d * 1.1 * g - g * kk * .6, q = s * g; return `<path d="M${x} ${y} h${q} l${-q} ${q} h${q}" fill="none" stroke="#141416" stroke-width="${.28 * g}" opacity="${kk}" stroke-linejoin="miter"/>`; }).join('');
    const sprites = () => root.ClawdSprites || null;
    function spriteSVG(sp, g) {
        const S = sprites()?.[sp.name];
        if (!S)
            return '';
        const k = Math.max(1, Math.round(g * S.unit)), x0 = -S.ax * k, y0 = -S.ay * k;
        let out = S.layers.map(L => {
            const [dx, dy] = sp.off?.[L.id] ?? [0, 0];
            return `<image href="${L.src}" x="${x0 + dx * k}" y="${y0 + dy * k}" width="${S.w * k}" height="${S.h * k}" preserveAspectRatio="none" style="image-rendering:pixelated"/>`;
        }).join('');
        if (sp.blink && S.eyes)
            out += S.eyes.map(([ex, ey, ew, eh]) => `<rect x="${x0 + ex * k}" y="${y0 + ey * k}" width="${ew * k}" height="${(eh - 1) * k}" fill="${S.lid}"/>`).join('');
        return `<g shape-rendering="crispEdges">${out}</g>`;
    }
    const M = {};
    M.idle = { zh: '待机', dur: 4, loop: true, use: '讲话中间、等下一句；底下一直有它',
        fn: (t, o, T) => idle(T, o.seed) };
    M.sigh = { zh: '叹气垮肩', dur: 2.7, loop: true, use: '「又来了」「主管又……」：讲到离谱的目标、又被丢工作',
        fn(t, o, T) {
            const p = idle(T, o.seed);
            p.sink += trk(t, [[0, 0], [.05, -.14, 'e.45'], [.55, .6, 'o.9'], [1.8, 0, 'e.8']]);
            p.rot += trk(t, [[0, 0], [.05, -2.5, 'e.45'], [.55, 3.5, 'o.9'], [1.8, 0, 'e.8']]);
            p.armL += trk(t, [[0, 0], [.05, 10, 'e.45'], [.62, -34, 's8,5'], [1.85, 0, 'e.7']]);
            p.armR += trk(t, [[0, 0], [.09, 10, 'e.45'], [.7, -32, 's8,5'], [1.9, 0, 'e.7']]);
            p.eyeOpen *= trk(t, [[0, 1], [.1, .55, 'e.4'], [.6, .36, 'o.5'], [1.95, 1, 'e.45']]);
            p.eyeY += trk(t, [[0, 0], [.6, .25, 'o.5'], [1.9, 0, 'e.4']]);
            p.fxBody = puff(6.2 * o.g, -6.4 * o.g, seg(t, .62, 1.75), o.g, 1);
            return p;
        } };
    M.eyeroll = { zh: '翻白眼', dur: 2.5, loop: true, use: '听到主管 / 网上的离谱说法：「蛤，又是这个」的嘲讽',
        fn(t, o, T) {
            const p = idle(T, o.seed);
            p.eyes = pick(t, [[0, 'slit'], [.32, 'roll'], [1.72, 'slit']]);
            const th = trk(t, [[0, -40], [.32, 90, 'e.42'], [.78, 152, 'o.5']]) * Math.PI / 180;
            p.pupil = [Math.cos(th), -Math.sin(th)];
            p.eyeOpen *= p.eyes === 'slit' ? trk(t, [[0, 1], [.04, .6, 'e.22'], [1.72, .42], [2.05, 1, 'e.35']]) : 1;
            p.eyeX += trk(t, [[0, 0], [.04, .3, 'e.22'], [.3, 0, 'e.1'], [1.72, -.25], [2.05, 0, 'e.35']]);
            p.rot += trk(t, [[0, 0], [.3, -4.5, 'o.6'], [1.6, 0, 'e.7']]);
            p.sink += trk(t, [[0, 0], [.3, .28, 'o.5'], [1.6, 0, 'e.7']]);
            p.armR += trk(t, [[0, 0], [.34, 24], [.88, -12, 's9,5'], [1.75, 0, 'e.5']]);
            p.armL += trk(t, [[0, 0], [.45, -12, 'e.4'], [1.75, 0, 'e.5']]);
            return p;
        } };
    M.sideEye = { zh: '斜眼', dur: 2.6, loop: true, use: '酸一句之後看镜头：「你也觉得吧」；讲到别人的骚操作',
        fn(t, o, T) {
            const p = idle(T, o.seed), d = o.dir ?? -1;
            p.eyeX += trk(t, [[0, 0], [.12, .45 * d, 'o.25'], [1.9, 0, 'e.45']]);
            p.eyeOpen *= trk(t, [[0, 1], [.15, .5, 'e.3'], [1.95, 1, 'e.4']]);
            p.rot += trk(t, [[0, 0], [.22, -3 * d, 's7,5'], [1.85, 0, 'e.6']]);
            p.sink += trk(t, [[0, 0], [.22, .2, 'e.4'], [1.85, 0, 'e.6']]);
            p.armL += trk(t, [[0, 0], [.3, -8, 'e.4'], [1.9, 0, 'e.5']]);
            p.armR += trk(t, [[0, 0], [.3, -8, 'e.4'], [1.9, 0, 'e.5']]);
            return p;
        } };
    M.peek = { zh: '探头', dur: 3.2, loop: true, use: '从画面边缘探进来插一句（edge-peek）；讲完缩回去',
        fn(t, o, T) {
            const p = idle(T, o.seed), side = o.side ?? 'r', m = side === 'l' ? -1 : 1;
            if (side === 'b') {
                p.y = trk(t, [[0, 10.5], [.3, 3.4, 's9,6'], [2.35, 3.8, 'e.2'], [2.55, 10.5, 'i.4']]);
                p.rot += trk(t, [[0, 0], [.3, 6, 's6,3'], [1.2, -5, 's6,4'], [2.1, 0, 'e.3']]);
                p.eyeX += trk(t, [[0, 0], [.55, .4, 'e.2'], [1.2, -.4, 'e.25'], [1.75, 0, 'e.2']]);
                return p;
            }
            p.x = m * trk(t, [[0, 10], [.3, 1.4, 's7,5'], [2.3, 1.9, 'e.22'], [2.52, 10, 'i.4']]);
            p.rot += -m * trk(t, [[0, 0], [.3, 11, 's7,4'], [1.15, 7, 'e.5'], [2.3, 13, 'e.22'], [2.6, 0, 'e.4']]);
            p.eyeX += -m * trk(t, [[0, .45], [1.0, 0, 'e.2'], [1.5, .45, 'e.2']]);
            p.armL += trk(t, [[0, 0], [.35, m > 0 ? 18 : -6, 's'], [2.3, 0, 'e.3']]);
            p.armR += trk(t, [[0, 0], [.35, m > 0 ? -6 : 18, 's'], [2.3, 0, 'e.3']]);
            return p;
        } };
    function travel(t, o, T, c) {
        const p = idle(T, o.seed), dir = Math.sign(c.x1 - c.x0) || 1;
        const X = tt => { const k = seg(tt, c.t0, c.t0 + c.D); return lerp(c.x0, c.x1, c.ease(k)); };
        const x = X(t), v = (X(t + .01) - X(t - .01)) / .02, vLag = (X(t - .08) - X(t - .1)) / .02, vmax = Math.abs(c.x1 - c.x0) / c.D * 1.6;
        const ph = Math.abs(x - c.x0) / c.stride * Math.PI, sp = clamp(Math.abs(v) / vmax * 1.3);
        const a = c.lift * Math.max(0, Math.sin(ph)) * sp, b = c.lift * Math.max(0, -Math.sin(ph)) * sp;
        const tA = c.t0 + c.D;
        p.x = x + dir * .35 * wob(t, tA - .05, 9, 5) * (c.over ?? 1);
        p.legLift = [a, b, a, b];
        p.y = -c.bob * Math.abs(Math.sin(ph)) * sp;
        p.rot += dir * (c.lean * clamp(vLag / vmax * 1.5, -1, 1)) - dir * c.back * wob(t, tA - .05, 8, 4.5);
        p.armL += c.swing * Math.sin(ph) * sp;
        p.armR -= c.swing * Math.sin(ph) * sp;
        p.sink += c.crouch * sp;
        p._tA = tA;
        p._dir = dir;
        p._sp = sp;
        return p;
    }
    M.walkIn = { zh: '走进来', dur: 2.8, loop: false, use: '开场从旁边走进来；换场景时走到下一个位置',
        fn(t, o, T) {
            const s = o.from === 'r' ? 1 : -1, p = travel(t, o, T, { x0: (o.dist ?? 24) * s, x1: 0, t0: 0, D: 2.0, ease: E.inOut, stride: 1.7, lift: .5, bob: .12, lean: 7, back: 5, swing: 10, crouch: 0 });
            p.eyeX += trk(t, [[0, -.4 * s], [1.85, 0, 'e.3']]);
            return p;
        } };
    M.walkOut = { zh: '走出去', dur: 2.5, loop: false, use: '讲完下班 / 换场；跟 walkIn 成对',
        fn(t, o, T) {
            const s = o.to === 'l' ? -1 : 1, p = travel(t, o, T, { x0: 0, x1: (o.dist ?? 24) * s, t0: .35, D: 2.1, ease: E.in, stride: 1.7, lift: .5, bob: .12, lean: 7, back: 0, swing: 10, crouch: 0, over: 0 });
            p.eyeX += trk(t, [[0, 0], [.05, .4 * s, 'o.2']]);
            p.rot += -s * trk(t, [[0, 0], [.1, 3, 'e.25'], [.4, 0, 'e.3']]);
            return p;
        } };
    M.runIn = { zh: '跑进来', dur: 2.7, loop: false, use: '结尾冲进来喊 CTA（cta-end）；赶时间、迟到',
        fn(t, o, T) {
            const s = o.from === 'r' ? 1 : -1, p = travel(t, o, T, { x0: (o.dist ?? 28) * s, x1: 0, t0: 0, D: 1.1, ease: E.out, stride: 2.3, lift: .65, bob: .25, lean: 12, back: 9, swing: 22, crouch: .25 });
            const tA = p._tA;
            p.fxGround = dust(0, seg(t, tA - .25, tA + .45), o.g, -s);
            p.sink += .12 * Math.max(0, Math.sin((t - tA) * 9)) * Math.exp(-(t - tA) * 1.6) * (t > tA ? 1 : 0);
            p.eyeOpen *= trk(t, [[0, .6], [tA + .1, .45, 'e.3'], [tA + 1.1, 1, 'e.4']]);
            p.eyeX += trk(t, [[0, -.4 * s], [tA + .2, 0, 'e.3']]);
            return p;
        } };
    M.sneakOff = { zh: '溜走', dur: 3.8, loop: false, use: '「主管来了」「我先下线」：心虚地偷偷溜出画面',
        fn(t, o, T) {
            const s = o.to === 'l' ? -1 : 1, p = travel(t, o, T, { x0: 0, x1: (o.dist ?? 24) * s, t0: 1.15, D: 2.6, ease: E.in, stride: 1.1, lift: .28, bob: .05, lean: 5, back: 0, swing: 4, crouch: .55, over: 0 });
            p.eyeX += trk(t, [[0, 0], [.1, -.45, 'e.2'], [.5, .45, 'e.25'], [.85, -.2, 'e.2'], [1.1, .45 * s, 'e.2']]);
            p.sink += trk(t, [[0, 0], [.85, .3, 'e.35']]);
            p.armL += trk(t, [[0, 0], [.85, -14, 'e.35']]);
            p.armR += trk(t, [[0, 0], [.85, -14, 'e.35']]);
            return p;
        } };
    M.point = { zh: '吐槽指画面', dur: 2.7, loop: true, use: '「你看这个」：指着转载的内容 / 截图卡吐槽；o.dir 1 = 指右（预设）、-1 = 指左',
        fn(t, o, T) {
            const p = idle(T, o.seed), d = o.dir ?? 1, R = d > 0;
            const arm = trk(t, [[0, 0], [.08, -22, 'e.25'], [.33, 16, 's12,6'], [.95, 6, 'e.08'], [1.03, 16, 's14,7'], [1.25, 6, 'e.08'], [1.33, 16, 's14,7'], [2.0, 0, 's8,5']]);
            if (R)
                p.armR += arm;
            else
                p.armL += arm;
            p.rot += d * trk(t, [[0, 0], [.06, -4, 'e.25'], [.33, 5, 's9,5'], [2.0, 0, 'e.6']]);
            p.x += d * (trk(t, [[0, 0], [.06, -.3, 'e.25'], [.33, .35, 's9,5'], [2.0, 0, 'e.6']]) + .12 * (wob(t, 1.03, 14, 7) + wob(t, 1.33, 14, 7)));
            p.eyeX += d * trk(t, [[0, 0], [.02, .45, 'o.15'], [1.55, -.05, 'e.25']]);
            p.eyeOpen *= trk(t, [[0, 1], [1.55, .5, 'e.25'], [2.25, 1, 'e.35']]);
            return p;
        } };
    M.flinch = { zh: '被骂缩一下', dur: 2.8, loop: true, use: '主管 / 检查员骂人、「又被删了」：缩起来、冒汗，慢慢回神',
        fn(t, o, T) {
            const p = idle(T, o.seed), d = o.from ?? 1;
            p.eyes = pick(t, [[0, 'wide'], [.16, 'squeeze'], [1.45, 'slit']]);
            p.x += -d * trk(t, [[0, 0], [0, -.6, 'o.14'], [.3, -.4, 's8,5'], [1.5, 0, 'e.7']]);
            p.rot += -d * trk(t, [[0, 0], [0, 7, 'o.14'], [.3, 4, 's8,5'], [1.5, 0, 'e.7']]);
            p.sink += trk(t, [[0, 0], [.08, .85, 's13,7'], [1.5, .3, 'e.6'], [2.3, 0, 'e.4']]);
            p.armL += trk(t, [[0, 0], [.12, 36, 's12,6'], [1.4, 0, 'e.6']]);
            p.armR += trk(t, [[0, 0], [.16, 36, 's12,6'], [1.45, 0, 'e.6']]);
            p.eyeX += trk(t, [[0, 0], [1.45, -.35 * d], [2.2, 0, 'e.4']]);
            p.eyeOpen *= p.eyes === 'slit' ? trk(t, [[0, 1], [1.45, .55], [2.3, 1, 'e.4']]) : 1;
            p.eyeY += p.eyes === 'slit' ? trk(t, [[0, 0], [1.45, .3], [2.3, 0, 'e.4']]) : 0;
            p.fxBody = sweat(seg(t, .3, 2.4), o.g);
            return p;
        } };
    M.macmini = { zh: '听到 Mac mini 变脸', dur: 3.4, loop: true, use: '一听到「Mac mini」：从累瞬间亮起来、跳一下、冒爱心；o.dir = Mac mini 在哪边',
        fn(t, o, T) {
            const p = idle(T, o.seed), d = o.dir ?? 1;
            p.eyes = pick(t, [[0, 'slit'], [.95, 'wide'], [1.12, 'happy'], [2.85, 'slit']]);
            p.eyeOpen *= p.eyes === 'slit' ? trk(t, [[0, .42], [.5, 1, 'o.08'], [2.85, .42], [3.25, .42]]) : 1;
            p.eyeX += trk(t, [[0, 0], [.5, .42 * d, 'o.1'], [2.85, 0]]);
            p.sink += trk(t, [[0, .3], [.5, 0, 's14,8'], [.95, .55, 'e.15'], [1.1, 0, 'o.16'], [1.48, .5, 's13,7'], [1.75, 0, 's8,5'], [2.85, .3, 'e.4']]);
            p.y = -1.5 * Math.sin(Math.PI * seg(t, 1.1, 1.48));
            p.rot += d * trk(t, [[0, 0], [.5, 2, 's'], [1.1, 7, 'o.2'], [1.48, 3, 's8,4'], [2.85, 0, 'e.45']]) + 3.5 * Math.sin((t - 1.6) * 6) * clamp(seg(t, 1.6, 1.9) * (1 - seg(t, 2.5, 2.85)));
            const up = trk(t, [[0, -18], [.5, 0, 's'], [1.08, 50, 's11,5'], [1.5, 34, 's8,4'], [2.85, -18, 'e.45']]);
            p.armL += up + 6 * Math.sin(t * 7) * clamp(seg(t, 1.6, 1.8) * (1 - seg(t, 2.6, 2.85)));
            p.armR += up + 6 * Math.sin(t * 7 + 1.2) * clamp(seg(t, 1.6, 1.8) * (1 - seg(t, 2.6, 2.85)));
            p.fxBody = bang(seg(t, .88, 1.3), o.g) + heart(seg(t, 1.25, 2.6), o.g);
            return p;
        } };
    M.phone = { zh: '偷看手机', dur: 3.8, loop: true, use: '上班偷滑手机、「我看到一个……」开场；被看到就收起来装没事',
        fn(t, o, T) {
            const p = idle(T, o.seed), g = o.g;
            const out = trk(t, [[0, 0], [.1, 1, 's9,6'], [2.75, 0, 'i.3']]);
            p.armR += trk(t, [[0, -14], [.1, 12, 's9,6'], [2.75, -14, 'i.3'], [3.2, -14]]) + 14;
            const look = pick(t, [[0, 0], [.3, 1], [1.25, 0], [1.6, 1], [2.25, 0]]);
            p.eyeX += trk(t, [[0, 0], [.3, .45, 'e.18'], [1.25, -.4, 'o.15'], [1.6, .45, 'e.2'], [2.25, -.3, 'o.15'], [3.0, 0, 'e.3']]);
            p.eyeY += trk(t, [[0, 0], [.3, .55, 'e.18'], [1.25, 0, 'o.1'], [1.6, .55, 'e.2'], [2.25, 0, 'o.1']]);
            p.eyeOpen *= trk(t, [[0, 1], [.3, .7, 'e.18'], [1.25, 1, 'o.1'], [1.6, .7, 'e.2'], [2.25, 1, 'o.1']]);
            p.rot += trk(t, [[0, 0], [.3, 4, 'e.4'], [1.25, 0, 'o.15'], [1.6, 4, 'e.3'], [2.25, -1, 'o.15'], [3.0, 0, 'e.4']]);
            p.sink += trk(t, [[0, 0], [.3, .3, 'e.4'], [1.25, .05, 'o.15'], [1.6, .3, 'e.3'], [2.25, 0, 'o.15']]);
            const [hx, hy] = handTip('R', p.armR, g, p.sink);
            const scroll = (trk(t, [[0, 0], [.75, 1, 'o.35'], [1.9, 2, 'o.35'], [2.15, 3, 'o.3']]) * 1.1 * g);
            const w = 2.6 * g, h = 4.6 * g, sx = hx - w * .35, sy = hy - h * .8 + (1 - out) * 4 * g;
            const lines = Array.from({ length: 7 }, (_, i) => { const yy = sy + .5 * g + ((i * 1.1 * g - scroll) % (7 * 1.1 * g) + 7 * 1.1 * g) % (7 * 1.1 * g); return yy > sy + h - .7 * g ? '' : `<rect x="${sx + .45 * g}" y="${yy}" width="${(i % 3 ? 1.5 : 1.0) * g}" height="${.42 * g}" rx="${.1 * g}" fill="${i % 3 ? '#D9D3CB' : '#FFB3A0'}"/>`; }).join('');
            p.fxBody = out > .02 ? `<g opacity="${clamp(out * 3)}" transform="rotate(${-8 + 6 * out} ${hx} ${hy})"><rect x="${sx}" y="${sy}" width="${w}" height="${h}" rx="${.4 * g}" fill="#141416"/><rect x="${sx + .2 * g}" y="${sy + .25 * g}" width="${w - .4 * g}" height="${h - .5 * g}" rx="${.25 * g}" fill="#fff"/><svg x="${sx}" y="${sy + .25 * g}" width="${w}" height="${h - .5 * g}" overflow="hidden"><g transform="translate(0 ${-sy - .25 * g})">${lines}</g></svg></g>` : '';
            p._look = look;
            return p;
        } };
    M.sign = { zh: '举牌', dur: 3.4, loop: true, use: '举一块牌子讲重点 / CTA（「主管不在」「帮我 follow」）；o.text 牌子上的字',
        fn(t, o, T) {
            const p = idle(T, o.seed), g = o.g, text = o.text ?? '主管不在';
            p.sink += trk(t, [[0, 0], [.05, .5, 'e.25'], [.32, -.1, 's11,6'], [2.6, .35, 'e.3'], [2.95, 0, 's']]);
            p.armR += trk(t, [[0, 0], [.05, -22, 'e.25'], [.32, 52, 's10,5'], [2.6, -8, 'e.35'], [2.95, 0, 's']]);
            p.armL += trk(t, [[0, 0], [.05, -12, 'e.25'], [.4, 26, 's9,5'], [2.6, 0, 'e.35']]);
            p.rot += trk(t, [[0, 0], [.32, -3, 's7,4'], [2.6, 0, 'e.4']]) + .8 * Math.sin(T * 2.3) * seg(t, .8, 1.2) * (1 - seg(t, 2.4, 2.6));
            p.eyeOpen *= trk(t, [[0, 1], [.9, .55, 'e.4'], [2.6, 1, 'e.3']]);
            const [hx, hy] = handTip('R', p.armR, g, p.sink);
            const up = trk(t, [[0, 0], [.36, 1, 's10,5'], [2.55, 0, 'i.35']]);
            const sway = 7 * wob(t, .45, 7, 3) - 4 * wob(t, 1.4, 6, 3) + 1.5 * Math.sin(T * 1.7);
            const L = 8 * g, cw = Math.max(9, text.length * 1.9 + 2) * g, chh = 4.4 * g;
            p.fxBack = up > .01 ? `<g opacity="${clamp(up * 2.5)}" transform="translate(${hx} ${hy}) rotate(${sway}) translate(0 ${(1 - up) * 5 * g})"><rect x="${-.3 * g}" y="${-L}" width="${.6 * g}" height="${L + .3 * g}" fill="#B9875A"/><rect x="${-cw / 2}" y="${-L - chh + .4 * g}" width="${cw}" height="${chh}" rx="${.6 * g}" fill="#fff" filter="url(#cm-d)"/><text x="0" y="${-L - chh / 2 + 1.25 * g}" font-size="${2.2 * g}" font-weight="900" fill="#141416" text-anchor="middle" style="font-family:var(--font, system-ui)">${text}</text></g>` : '';
            return p;
        } };
    M.shrug = { zh: '摊手', dur: 2.4, loop: true, use: '「就这样咯」「不然呢」：讲完一个无奈的事实',
        fn(t, o, T) {
            const p = idle(T, o.seed);
            const a = trk(t, [[0, 0], [.04, -16, 'e.2'], [.26, 36, 's12,6'], [1.5, 0, 's7,5']]);
            p.armL += a;
            p.armR += trk(t, [[0, 0], [.06, -16, 'e.2'], [.29, 36, 's12,6'], [1.53, 0, 's7,5']]);
            p.sink += trk(t, [[0, 0], [.04, .35, 'e.2'], [.26, -.12, 's12,6'], [1.5, 0, 'e.4']]);
            p.rot += trk(t, [[0, 0], [.3, -6, 's7,4'], [1.5, 0, 'e.5']]);
            p.eyes = pick(t, [[0, 'slit'], [.26, 'closed'], [1.25, 'slit']]);
            p.eyeOpen *= p.eyes === 'slit' ? trk(t, [[0, 1], [1.25, .45], [1.9, 1, 'e.3']]) : 1;
            p.fxBody = dots(t, .45, o.g);
            if (t > 1.35)
                p.fxBody = `<g opacity="${clamp(1 - (t - 1.35) / .3)}">${p.fxBody}</g>`;
            return p;
        } };
    M.tap = { zh: '戳按钮（帮我 follow）', dur: 3.0, loop: true, use: 'CTA：拿出「追踪」按钮、戳下去、变「已追踪」；o.label / o.done 换字',
        fn(t, o, T) {
            const p = idle(T, o.seed), g = o.g, lab = o.label ?? '追踪', done = o.done ?? '已追踪';
            const show = trk(t, [[0, 0], [.05, 1, 's10,5'], [2.5, 0, 'i.3']]);
            const bx = 9.4 * g, by = -5.4 * g;
            p.armR += trk(t, [[0, 0], [.4, 34, 'e.3'], [.82, 6, 'o.12'], [.9, 20, 's10,5'], [2.4, 0, 'e.4']]);
            p.rot += trk(t, [[0, 0], [.4, -4, 'e.3'], [.82, 4, 'o.13'], [.95, 0, 's'], [2.4, 0]]);
            p.x += trk(t, [[0, 0], [.4, -.3, 'e.3'], [.82, .4, 'o.1'], [.95, 0, 's']]);
            p.eyeX += trk(t, [[0, 0], [.1, .45, 'e.2'], [1.35, 0, 'e.25']]);
            p.eyes = pick(t, [[0, 'slit'], [.95, 'happy'], [1.35, 'slit']]);
            p.eyeOpen *= p.eyes === 'slit' ? trk(t, [[0, 1], [1.35, .5], [2.2, 1, 'e.4']]) : 1;
            const press = t > .84 ? 1 - .1 * wob(t, .84, 18, 9) / .7 : 1, on = t >= .86;
            const bw = 7.5 * g, bh = 3 * g;
            p.fxGround = show > .01 ? `<g transform="translate(${bx + 2 * g} ${by - 1.2 * g + (1 - show) * 3 * g}) scale(${show * press})" opacity="${clamp(show * 2)}"><rect x="${-bw / 2}" y="${-bh / 2}" width="${bw}" height="${bh}" rx="${.7 * g}" fill="${on ? '#fff' : '#0095F6'}" stroke="${on ? '#DBDBDB' : 'none'}" stroke-width="${.15 * g}"/><text x="0" y="${.75 * g}" font-size="${1.9 * g}" font-weight="800" fill="${on ? '#141416' : '#fff'}" text-anchor="middle" style="font-family:var(--font, system-ui)">${on ? done : lab}</text></g>` : '';
            return p;
        } };
    M.doze = { zh: '打瞌睡', dur: 3.6, loop: true, use: '「晚上十点上班」「又加班」：眼皮慢慢盖、头一点、惊醒偷看有没有人看到',
        fn(t, o, T) {
            const p = idle(T, o.seed);
            p.eyeOpen = Math.min(p.eyeOpen, trk(t, [[0, 1], [.1, .08, 'e1.5'], [2.05, 1, 'o.1'], [3.3, 1]]));
            p.eyes = pick(t, [[0, 'slit'], [2.05, 'wide'], [2.32, 'slit']]);
            p.rot += trk(t, [[0, 0], [.1, 7, 'e1.7'], [2.05, -3, 's12,6'], [2.5, 0, 'e.5']]);
            p.sink += trk(t, [[0, 0], [.1, .6, 'e1.7'], [2.05, 0, 's12,6']]);
            p.armL += trk(t, [[0, 0], [.2, -26, 'e1.6'], [2.05, 8, 's10,5'], [2.6, 0, 'e.4']]);
            p.armR += trk(t, [[0, 0], [.25, -26, 'e1.6'], [2.08, 8, 's10,5'], [2.6, 0, 'e.4']]);
            p.eyeX += trk(t, [[0, 0], [2.4, -.42, 'e.2'], [2.75, .42, 'e.22'], [3.15, 0, 'e.25']]);
            p.fxBody = `<g opacity="${1 - seg(t, 2.05, 2.2)}">${zzz(seg(t, .8, 2.0), o.g)}</g>`;
            return p;
        } };
    M.lookAround = { zh: '东张西望', dur: 3.0, loop: true, use: '「主管不在吧？」开场前确认四周；过场时的小反应',
        fn(t, o, T) {
            const p = idle(T, o.seed);
            p.eyeX += trk(t, [[0, 0], [.15, -.45, 'e.22'], [.85, .45, 'e.3'], [1.65, 0, 'e.25']]);
            p.rot += trk(t, [[0, 0], [.2, -3, 's7,4'], [.9, 3, 's7,4'], [1.7, 0, 's7,4']]);
            p.x += trk(t, [[0, 0], [.2, -.2, 'e.3'], [.9, .2, 'e.35'], [1.7, 0, 'e.35']]);
            p.eyeOpen *= trk(t, [[0, 1], [1.7, .5, 'e.3'], [2.6, 1, 'e.3']]);
            return p;
        } };
    const beat = (t, b, d = 9) => { const u = t - b; return u <= 0 ? 0 : Math.max(0, Math.exp(-d * u) * Math.sin(Math.min(Math.PI, u * 14))); };
    M.scan = { zh: '哨兵：望远镜扫一圈', dur: 4.2, loop: true, crew: 'binoculars', use: '哨兵（望远镜）：扫新消息 → 看到了！→ 挥手叫大家；快讯件开场、「我们的哨兵今天抓到……」',
        fn(t, o, T) {
            const p = idle(T, o.seed), d = o.dir ?? 1;
            p.acc = 'binoculars';
            p.armL += 26;
            p.armR += 26;
            p.rot += d * trk(t, [[0, 0], [.15, -6, 'e1.0'], [1.25, 5, 'e1.1'], [2.45, 3.5, 'o.15'], [3.6, 0, 'e.55']]);
            p.x += d * trk(t, [[0, 0], [.15, -.3, 'e1.0'], [1.25, .2, 'e1.1'], [2.45, .65, 's9,5'], [3.6, 0, 'e.55']]);
            p.sink += trk(t, [[0, 0], [2.3, .35, 'e.15'], [2.45, 0, 's12,6']]);
            p.armR += trk(t, [[0, 0], [2.85, 18, 's10,5'], [3.55, 0, 'e.4']]) + 9 * wob(t, 3.0, 13, 4.5);
            p.fxBody = bang(seg(t, 2.45, 2.95), o.g);
            return p;
        } };
    M.assign = { zh: '编辑台：夹板打勾、派工', dur: 3.8, loop: true, crew: 'beret', use: '编辑台（贝雷帽 + 夹板）：看排程打勾 → 抬头指一下「这个你做」；讲选题怎么排、派工给小克',
        fn(t, o, T) {
            const p = idle(T, o.seed), d = o.dir ?? 1;
            p.acc = 'beret';
            p.armL += 14;
            const tick = tt => trk(t, [[0, 0], [tt, 16, 'o.07'], [tt + .07, 0, 's14,7']]);
            p.armR += tick(.45) + tick(.85) + tick(1.25);
            p.rot += -1.2 * (beat(t, .5) + beat(t, .9) + beat(t, 1.3)) * 2;
            p.eyeX += trk(t, [[0, -.4], [1.6, .4 * d, 'e.25'], [2.9, -.4, 'e.4']]);
            p.eyeY += trk(t, [[0, .35], [1.6, 0, 'e.25'], [2.9, .35, 'e.4']]);
            p.eyeOpen *= trk(t, [[0, .8], [1.6, 1, 'e.2'], [2.0, .6, 'e.3'], [2.9, .8, 'e.4']]);
            p.armR += trk(t, [[0, 0], [1.75, -18, 'e.2'], [1.95, 14, 's12,6'], [2.8, 0, 'e.4']]);
            p.rot += d * trk(t, [[0, 0], [1.75, -2.5, 'e.2'], [1.95, 4, 's10,5'], [2.8, 0, 'e.45']]);
            p.x += d * trk(t, [[0, 0], [1.95, .3, 's10,5'], [2.8, 0, 'e.45']]);
            return p;
        } };
    M.search = { zh: '侦查员：放大镜找证据', dur: 4.4, loop: true, crew: 'detective', use: '侦查员（侦探帽 + 放大镜）：弯腰一路扫 → 停住凑近 → 找到了举起来；讲「我们去查了官方怎么写」',
        fn(t, o, T) {
            const p = idle(T, o.seed), d = o.dir ?? 1;
            p.acc = 'detective';
            const bend = trk(t, [[0, 0], [.1, 1, 'e.4'], [3.0, 0, 's9,5']]);
            p.sink += .4 * bend;
            p.rot += d * 6 * bend;
            p.armR += trk(t, [[0, 0], [.1, -8, 'e.4'], [.55, 14, 'e.45'], [1.0, -8, 'e.45'], [1.45, 14, 'e.45'], [1.9, -4, 'e.4'], [3.0, 30, 's10,5'], [3.85, 0, 'e.45']]);
            const step = tt => trk(t, [[0, 0], [tt, .5, 'e.3']]);
            p.x += d * (step(.5) + step(1.0) + step(1.5) + step(1.95)) + d * trk(t, [[0, 0], [2.3, .45, 'o.25'], [3.0, 0, 's9,5']]) - d * trk(t, [[0, 0], [3.0, 2.0, 'e.8']]) * 1;
            const lift = tt => .35 * Math.sin(Math.PI * seg(t, tt, tt + .3));
            p.legLift = [lift(.5) + lift(1.5), lift(1.0) + lift(1.95), lift(.5) + lift(1.5), lift(1.0) + lift(1.95)];
            p.eyes = pick(t, [[0, 'slit'], [2.3, 'narrow'], [3.0, 'slit']]);
            p.eyeX += trk(t, [[0, 0], [.1, .42 * d, 'e.3'], [3.05, 0, 'e.3']]);
            p.eyeY += trk(t, [[0, 0], [.1, .4, 'e.3'], [3.05, 0, 'e.3']]);
            p.fxBody = bang(seg(t, 3.0, 3.5), o.g);
            return p;
        } };
    M.produce = { zh: '制作：戴耳机赶工', dur: 4.0, loop: true, crew: 'headphones', use: '制作（耳机）：跟着拍子点头打字、中间闭眼享受一下；讲「片子在做了」「配音、剪片」',
        fn(t, o, T) {
            const p = idle(T, o.seed);
            p.acc = 'headphones';
            const B = [0, .5, 1, 1.5, 2, 2.5, 3, 3.5], acc = [1, .55, .75, .55, 1, .55, .75, .55];
            let nod = 0;
            B.forEach((b, i) => { nod += acc[i] * beat(t, b + .02); });
            p.sink += .22 * nod;
            p.rot += 1.6 * nod;
            const key = (tt, side) => trk(t, [[0, 0], [tt, -10, 'o.06'], [tt + .06, 0, 's16,8']]);
            const ks = [.12, .3, .42, .7, .82, 1.16, 1.32, 1.6, 2.9, 3.05, 3.3, 3.62, 3.8];
            ks.forEach((k, i) => { if (i % 2)
                p.armL += key(k);
            else
                p.armR += key(k); });
            p.armL -= 14;
            p.armR -= 14;
            p.eyes = pick(t, [[0, 'narrow'], [1.95, 'closed'], [2.8, 'narrow']]);
            p.rot += 3 * Math.sin((t - 1.95) * Math.PI * 2 / 1.0) * clamp(seg(t, 1.95, 2.2) * (1 - seg(t, 2.6, 2.85)));
            return p;
        } };
    M.scold = { zh: '检查员：红笔打叉、瞪人', dur: 3.6, loop: true, crew: 'checker', use: '检查员（眼镜 + 红笔）：看稿 → 找到问题 → 红笔一划打叉 → 转头瞪；配小克 flinch（被骂缩一下）用。o.dir = 瞪向哪边',
        fn(t, o, T) {
            const p = idle(T, o.seed), d = o.dir ?? 1;
            p.acc = 'checker';
            p.eyes = 'narrow';
            p.eyeY += trk(t, [[0, .3], [1.45, 0, 'e.15'], [3.0, .3, 'e.4']]);
            p.eyeX += trk(t, [[0, 0], [1.45, .4 * d, 'o.15'], [3.0, 0, 'e.4']]);
            const tap = tt => trk(t, [[0, 0], [tt, 8, 'o.07'], [tt + .07, 0, 's14,7']]);
            p.armR += tap(.35) + tap(.65) + trk(t, [[0, 0], [.95, 46, 'e.3'], [1.3, -24, 'o.15'], [1.47, 30, 'e.12'], [1.62, -20, 'o.13'], [1.85, 12, 's10,5'], [2.9, 0, 'e.4']]);
            p.armR += 7 * (wob(t, 1.9, 16, 7) + wob(t, 2.25, 16, 7));
            p.sink += trk(t, [[0, 0], [.95, .3, 'e.3'], [1.3, 0, 'o.15'], [2.9, 0]]);
            p.rot += d * trk(t, [[0, 0], [.95, -3.5, 'e.3'], [1.3, 6, 'o.15'], [1.6, 4, 's8,5'], [2.9, 0, 'e.5']]);
            p.x += d * trk(t, [[0, 0], [1.3, .45, 'o.12'], [2.9, 0, 'e.5']]);
            if (o.paper !== false) {
                const g = o.g, k1 = E.out(seg(t, 1.3, 1.45)), k2 = E.out(seg(t, 1.62, 1.76)), fade = 1 - E.inOut(seg(t, 3.0, 3.4)), inn = E.out(seg(t, 0, .35));
                const px = d * 11.2 * g, py = -4.6 * g, w = 4.4 * g, h = 5.4 * g, line = (x1, y1, x2, y2, k) => k <= 0 ? '' : `<line x1="${x1}" y1="${y1}" x2="${x1 + (x2 - x1) * k}" y2="${y1 + (y2 - y1) * k}" stroke="#FF3B30" stroke-width="${.55 * g}" stroke-linecap="round"/>`;
                p.fxGround = `<g opacity="${Math.min(fade, inn)}" transform="translate(${px} ${py + (1 - inn) * g}) rotate(${d * 4})"><rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="${.35 * g}" fill="#fff" filter="url(#cm-d)"/>${[0, 1, 2, 3].map(i => `<rect x="${-w / 2 + .6 * g}" y="${-h / 2 + (.8 + i * 1.05) * g}" width="${(i === 3 ? 1.6 : 3.2) * g}" height="${.38 * g}" rx="${.19 * g}" fill="#D9D3CB"/>`).join('')}${line(-1.4 * g, -1.6 * g, 1.4 * g, 1.6 * g, k1)}${line(1.4 * g, -1.6 * g, -1.4 * g, 1.6 * g, k2)}</g>`;
            }
            p.fxBody = bang(seg(t, 1.32, 1.85), o.g);
            return p;
        } };
    const star = (x, y, r, k, f = '#FFB547') => k <= 0 || k >= 1 ? '' : `<g transform="translate(${x} ${y}) scale(${spr(k * 1.4, 0, 13, 6)}) rotate(${k * 90})" opacity="${clamp(3 - k * 3)}"><path d="M0 ${-r} L${r * .28} ${-r * .28} L${r} 0 L${r * .28} ${r * .28} L0 ${r} L${-r * .28} ${r * .28} L${-r} 0 L${-r * .28} ${-r * .28}Z" fill="${f}"/></g>`;
    const note = (x, y, k, g) => k <= 0 || k >= 1 ? '' : `<g transform="translate(${x + Math.sin(k * 6) * .5 * g} ${y - 3 * g * E.out(k)})" opacity="${clamp(3 - k * 3) * clamp(k * 6)}"><rect x="0" y="${-1.6 * g}" width="${.3 * g}" height="${1.6 * g}" fill="#141416"/><rect x="0" y="${-1.6 * g}" width="${.9 * g}" height="${.35 * g}" fill="#141416"/><rect x="${-.55 * g}" y="${-.35 * g}" width="${.85 * g}" height="${.6 * g}" fill="#141416"/></g>`;
    M.magic = { zh: '巫师：挥魔杖变魔法', dur: 3.6, loop: true, crew: 'wizard', use: '巫师（尖帽 + 魔杖）：往後拉 → 一挥 → 杖尖冒星星、眨一只眼；讲「一个指令就变出来」「AI 的魔法」',
        fn(t, o, T) {
            const p = idle(T, o.seed), g = o.g;
            p.acc = 'wizard';
            const a = trk(t, [[0, 0], [.2, -18, 'e.35'], [.6, 58, 's9,5'], [1.5, 40, 'e.4'], [2.7, 0, 'e.6']]);
            p.armR += a + 6 * Math.sin((t - .9) * 9) * clamp(seg(t, .9, 1.1) * (1 - seg(t, 1.6, 1.9)));
            p.armL += trk(t, [[0, 0], [.6, 12, 's9,5'], [2.7, 0, 'e.6']]);
            p.rot += trk(t, [[0, 0], [.2, -3, 'e.35'], [.6, 4, 's9,5'], [2.7, 0, 'e.6']]);
            p.eyes = pick(t, [[0, 'slit'], [.65, 'wink'], [2.3, 'slit']]);
            const [hx, hy] = handTip('R', p.armR, g, p.sink), tip = (k, dx, dy) => [hx + dx * g + 3.3 * g * Math.cos(-p.armR * Math.PI / 180), hy + dy * g + 3.3 * g * Math.sin(-p.armR * Math.PI / 180)];
            p.fxBody = [[.65, 0, 0, .9], [.8, 1.2, -1.4, .6], [.95, -1.0, -1.9, .5], [1.15, 1.8, .6, .45], [1.35, .3, -2.6, .7]]
                .map(([t0, dx, dy, r]) => { const [x, y] = tip(0, dx, dy); return star(x, y, r * g, seg(t, t0, t0 + .9), r > .55 ? '#FFB547' : '#FFD27A'); }).join('');
            return p;
        } };
    M.cook = { zh: '厨师：翻锅', dur: 3.4, loop: true, crew: 'chef', use: '厨师（高帽 + 平底锅）：往下一沉 → 翻锅、蛋飞起来再接住、锅上冒火花；讲「我来料理一下」「把素材煮成片」',
        fn(t, o, T) {
            const p = idle(T, o.seed), g = o.g;
            p.acc = 'chef';
            const toss = tt => trk(t, [[0, 0], [tt - .25, -12, 'e.25'], [tt, 24, 'o.12'], [tt + .15, 0, 's12,6']]);
            p.armR += 6 + toss(.8) + toss(2.1);
            p.sink += trk(t, [[0, 0], [.55, .35, 'e.25'], [.8, 0, 's12,6'], [1.85, .35, 'e.25'], [2.1, 0, 's12,6']]);
            p.rot += trk(t, [[0, 0], [.8, 2.5, 's10,5'], [1.6, 0, 'e.3'], [2.1, 2.5, 's10,5'], [2.9, 0, 'e.3']]);
            p.eyes = pick(t, [[0, 'narrow'], [1.25, 'wink'], [1.75, 'narrow'], [2.55, 'happy'], [3.1, 'narrow']]);
            const [hx, hy] = handTip('R', p.armR, g, p.sink), px = hx + 3.6 * g, py = hy - .9 * g;
            const egg = tt => { const k = seg(t, tt, tt + .6); if (k <= 0 || k >= 1)
                return ''; const y = py - 3.2 * g * 4 * k * (1 - k); return `<g transform="translate(${px} ${y}) rotate(${k * 360})"><rect x="${-.75 * g}" y="${-.45 * g}" width="${1.5 * g}" height="${.9 * g}" fill="#fff"/><rect x="${-.3 * g}" y="${-.3 * g}" width="${.6 * g}" height="${.6 * g}" fill="#FFB547"/></g>`; };
            const sparks = tt => [[-.8, -1.2], [.6, -1.8], [1.4, -.8]].map(([dx, dy], i) => { const k = seg(t, tt + i * .06, tt + .55 + i * .06); return k <= 0 || k >= 1 ? '' : `<rect x="${px + dx * g * (1 + k)}" y="${py + dy * g * (1 + k) - g * k}" width="${.4 * g}" height="${.4 * g}" fill="${i % 2 ? '#FFD27A' : '#FFB547'}" opacity="${clamp(2 - k * 2)}"/>`; }).join('');
            p.fxBody = egg(.8) + egg(2.1) + sparks(.85) + sparks(2.15);
            return p;
        } };
    M.sleepBook = { zh: '盖书睡觉', dur: 4.0, loop: true, crew: 'book', use: '睡觉（书盖在头上）：趴低、慢慢呼吸、冒 Z；讲「读到睡着」「这份文件太长了」「下班」',
        fn(t, o, T) {
            const S = sprites()?.sleepBook;
            if (S) {
                const p = idle(T, o.seed);
                p.rot = 0;
                const ph = t % 2, down = ph > .85 && ph < 1.75 ? 1 : 0;
                p.sprite = { name: 'sleepBook', off: { body: [0, down] } };
                const k = Math.max(1, Math.round(o.g * S.unit));
                p.fxBody = `<g transform="translate(${(S.zAt[0] - S.ax) * k - 6.2 * o.g} ${(S.zAt[1] - S.ay) * k + 9.5 * o.g})">${zzz(seg(t, .3, 3.6), o.g)}</g>`;
                return p;
            }
            const p = idle(T, o.seed);
            p.acc = 'book';
            p.eyes = 'closed';
            const env = E.sine(seg(t, 0, .5)) * (1 - E.sine(seg(t, 3.4, 4.0)));
            p.sink = .9 + .14 * env * Math.sin(t * Math.PI * 2 / 2);
            p.armL = -12 + 3 * env * Math.sin(t * Math.PI);
            p.armR = -12 + 3 * env * Math.sin(t * Math.PI + .6);
            p.rot = .8 * env * Math.sin(t * Math.PI * 2 / 4);
            p.fxBody = zzz(seg(t, .3, 3.6), o.g);
            return p;
        } };
    M.work = { zh: '对着电脑上班', dur: 4.0, loop: true, crew: 'laptop', use: '办公（身前一台笔电）：低头打字、偶尔抬头看一眼镜头再继续；讲「在做了」「我在帮主管回信」',
        fn(t, o, T) {
            const S = sprites()?.work;
            if (S) {
                const p = idle(T, o.seed);
                p.rot = 0;
                const ks = [.1, .28, .4, .62, .8, 1.0, 1.22, 1.4, 1.65, 1.9, 3.3, 3.45, 3.62, 3.85];
                const up = ks.some(k => t > k - .07 && t <= k) ? -1 : 0;
                p.sprite = { name: 'work', off: { arm: [0, up] }, blink: p.eyeOpen < .35 };
                return p;
            }
            const p = idle(T, o.seed);
            p.acc = 'laptop';
            p.eyes = 'narrow';
            const look = trk(t, [[0, 0], [2.3, 1, 'e.2'], [3.2, 0, 'e.3']]);
            p.eyeY += .45 * (1 - look);
            p.eyeOpen *= .85 + .15 * look;
            p.rot += -2 * (1 - look);
            const key = tt => trk(t, [[0, 0], [tt, -10, 'o.06'], [tt + .06, 0, 's16,8']]);
            [.1, .28, .4, .62, .8, 1.0, 1.22, 1.4, 1.65, 1.9, 3.3, 3.45, 3.62, 3.85].forEach((k, i) => { if (i % 2)
                p.armL += key(k);
            else
                p.armR += key(k); });
            p.armL -= 18;
            p.armR -= 18;
            return p;
        } };
    M.music = { zh: '戴耳机听歌', dur: 4.0, loop: true, crew: 'headphones', use: '听歌（耳机）：闭眼跟拍子左右晃、冒音符；讲「放首歌」「下班时间」「心情不错」',
        fn(t, o, T) {
            const p = idle(T, o.seed), g = o.g;
            p.acc = 'headphones';
            p.eyes = 'closed';
            const env = E.sine(seg(t, 0, .5)) * (1 - E.sine(seg(t, 3.4, 4.0)));
            const sw = env * Math.sin(t * Math.PI);
            p.rot += 4 * sw;
            p.x += .25 * sw;
            p.sink += .12 * env * Math.abs(Math.sin(t * Math.PI));
            p.armL += 10 * env * Math.sin(t * Math.PI + .5);
            p.armR += 10 * env * Math.sin(t * Math.PI + .5 + Math.PI);
            p.fxBody = [.2, 1.2, 2.2, 3.2].map((tt, i) => note((i % 2 ? 7 : 5.5) * g, -9 * g, seg(t, tt, tt + 1.4), g)).join('');
            return p;
        } };
    const X = {
        neutral: { zh: '平常', eyes: 'slit' },
        tired: { zh: '累（半睁）', eyeOpen: .45, sink: .35, rot: 2, armL: -14, armR: -14, eyeY: .15 },
        sideEye: { zh: '斜眼（嫌弃）', eyeOpen: .5, eyeX: -.45, rot: 3, sink: .15 },
        eyeroll: { zh: '翻白眼', eyes: 'roll', pupil: [-.85, -.55], rot: -4, sink: .25, armR: 14 },
        phone: { zh: '看手机', eyeOpen: .7, eyeX: .45, eyeY: .55, rot: 4, sink: .3 },
        guilty: { zh: '心虚', eyeOpen: .7, eyeX: -.45, eyeY: .35, rot: -3, sink: .45, armL: -10, armR: -10 },
        scolded: { zh: '被骂', eyes: 'squeeze', sink: .8, rot: -5, armL: 36, armR: 36 },
        shocked: { zh: '吓到', eyes: 'wide', sink: -.12, rot: -4, armL: 20, armR: 20 },
        happy: { zh: '开心（只给 Mac mini）', eyes: 'happy', rot: 3, armL: 34, armR: 34, sink: -.1 },
        sad: { zh: '难过', eyes: 'sad', sink: .6, rot: 4, armL: -30, armR: -30 },
        asleep: { zh: '睡着', eyes: 'closed', sink: .65, rot: 6, armL: -26, armR: -26 },
        focused: { zh: '认真', eyes: 'narrow', rot: -1, sink: .05, armL: 10, armR: 10 },
    };
    function expr(name, T, seed = 0) {
        const p = idle(T, seed), e = X[name] || {};
        for (const k of ['eyes', 'pupil'])
            if (e[k] !== undefined)
                p[k] = e[k];
        for (const k of ['rot', 'sink', 'armL', 'armR', 'eyeX', 'eyeY'])
            if (e[k] !== undefined)
                p[k] += e[k];
        if (e.eyeOpen !== undefined)
            p.eyeOpen *= e.eyeOpen;
        return p;
    }
    function at(name, t, T = t, o = {}) {
        const mv = M[name];
        if (!mv)
            throw new Error('小克没有这个动作：' + name);
        return mv.fn(Math.max(0, t), { g: 24, seed: 0, ...o }, T);
    }
    function blend(a, b, k) {
        if (k <= 0)
            return a;
        if (k >= 1)
            return b;
        const p = { ...b }, kk = E.inOut(k);
        for (const f of ['x', 'y', 'rot', 'sink', 'armL', 'armR', 'eyeOpen', 'eyeX', 'eyeY', 'scale'])
            p[f] = lerp(a[f] ?? (f === 'scale' ? 1 : 0), b[f] ?? (f === 'scale' ? 1 : 0), kk);
        p.legLift = [0, 1, 2, 3].map(i => lerp(a.legLift?.[i] ?? 0, b.legLift?.[i] ?? 0, kk));
        if (k < .5) {
            p.eyes = a.eyes;
            p.pupil = a.pupil;
        }
        for (const f of ['fxBack', 'fxBody', 'fxGround'])
            p[f] = (k < .5 ? (a[f] || '') : '') + (b[f] || '');
        return p;
    }
    function play(seq, T, o = {}) {
        let i = 0;
        for (let k = 0; k < seq.length; k++)
            if (T >= seq[k].at)
                i = k;
        const cur = seq[i], X0 = cur.x ?? 0;
        const Tg = o.T ?? T;
        const poseOf = (s, tt) => { const p = at(s.m, tt - s.at, Tg, { ...o, ...(s.o || {}) }); p.x = (p.x || 0) + (s.x ?? 0); return p; };
        const now = poseOf(cur, T);
        if (i > 0) {
            const prev = seq[i - 1], mv = M[prev.m], end = Math.min(prev.at + mv.dur, cur.at);
            const k = seg(T, cur.at, cur.at + .25);
            if (k < 1)
                return blend(poseOf(prev, Math.min(T, end)), now, k);
        }
        return now;
    }
    function draw(x, y, g, p, extra = {}) {
        const s = p.scale ?? 1, fl = p.flip ? -1 : 1;
        const base = `translate(${(x + (p.x || 0) * g).toFixed(2)} ${(y + (p.y || 0) * g).toFixed(2)})`;
        const body = p.sprite && sprites()?.[p.sprite.name] ? spriteSVG(p.sprite, g)
            : clawdOfficial({ g, eyes: p.eyes, eyeOpen: p.eyeOpen, eyeX: (p.eyeX || 0) * fl, eyeY: p.eyeY, pupil: p.pupil, sink: p.sink, armL: p.armL, armR: p.armR, legLift: p.legLift, emote: p.emote, acc: extra.acc ?? p.acc, glasses: p.glasses, holdL: p.holdL, holdR: p.holdR, shade: extra.shade ?? p.shade });
        const rot = p.sprite ? 0 : (p.rot || 0);
        return `<g transform="${base}">${p.fxGround || ''}<g transform="rotate(${rot.toFixed(3)}) scale(${s})">${p.fxBack || ''}<g transform="scale(${fl} 1)">${body}</g>${p.fxBody || ''}</g></g>`;
    }
    function shadow(x, y, g, p) {
        const h = Math.max(0, -(p.y || 0)), k = 1 / (1 + h * .25);
        return `<ellipse cx="${(x + (p.x || 0) * g).toFixed(2)}" cy="${y + g * .2}" rx="${(6.6 * g * k).toFixed(2)}" ry="${(.75 * g * k).toFixed(2)}" fill="rgba(80,30,20,${(.2 * k).toFixed(3)})" filter="url(#cm-b)"/>`;
    }
    const DEFS = `<defs><filter id="cm-b" x="-50%" y="-200%" width="200%" height="500%"><feGaussianBlur stdDeviation="4"/></filter><filter id="cm-d" x="-30%" y="-30%" width="160%" height="180%"><feDropShadow dx="0" dy="6" stdDeviation="7" flood-color="#501e14" flood-opacity=".16"/></filter></defs>`;
    const ClawdCam = {
        glide(t, A, B, t0, t1) { const k = E.inOut(seg(t, t0, t1)); return { x: lerp(A.x, B.x, k), y: lerp(A.y, B.y, k), z: Math.exp(lerp(Math.log(A.z), Math.log(B.z), k)), r: lerp(A.r || 0, B.r || 0, k) }; },
        crash(t, A, B, t0, hold = 1.2, dur = .14) { const k = E.out(seg(t, t0, t0 + dur)), h = seg(t, t0 + dur, t0 + dur + hold); return { x: lerp(A.x, B.x, k), y: lerp(A.y, B.y, k), z: lerp(A.z, B.z, k) * (1 + .03 * h), r: lerp(A.r || 0, B.r ?? -4, k) }; },
        drift(c, t, t0, t1, amt = .02) { return { ...c, z: c.z * (1 + amt * E.sine(seg(t, t0, t1))) }; },
        follow(xs, t, lag = .35) { return xs(t - lag * .5) * .5 + xs(t - lag) * .5; },
        apply(c, W, H) { return `translate(${W / 2} ${H / 2}) rotate(${c.r || 0}) scale(${c.z}) translate(${-c.x} ${-c.y})`; },
    };
    const API = { moves: M, exprs: X, at, expr, play, blend, draw, shadow, idle, handTip, DEFS, ease: { E, spr, wob, trk, pick, seg, lerp, clamp } };
    root.ClawdMoves = API;
    root.ClawdCam = ClawdCam;
    if (typeof module !== 'undefined')
        module.exports = { ClawdMoves: API, ClawdCam };
})(typeof window !== 'undefined' ? window : globalThis);
export const ClawdMoves = globalThis.ClawdMoves;
export { clawdOfficial, clawdAcc };
