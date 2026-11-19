import { writeFileSync } from 'node:fs';
import { bandSvg } from '../hooks/crabs.ts';
import { LOOKS } from '../hooks/states.ts';
const out = process.argv[2] ?? 'sheet.html', Z = Number(process.argv[3] ?? 2), now = Date.now();
const img = svg => `<img src="data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}" width="${560 * Z}" height="${34 * Z}">`;
const rows = Object.keys(LOOKS).map((s, i) => {
    const svg = bandSvg([{ key: 'main' + i, state: s }, ...(i % 3 === 2 ? [] : [{ key: 'a' + i, state: 'read' }, { key: 'b' + i, state: 'run' }])], [], now);
    return `<div class="r"><b>${LOOKS[s].zh}</b><small>${LOOKS[s].how} · ${(svg.length / 1024).toFixed(1)} KB</small><div class="band">${img(svg)}</div></div>`;
});
const big = bandSvg([{ key: 'm', state: 'think' }, { key: 'x1', state: 'think' }, { key: 'x2', state: 'think' }], Array.from({ length: 6 }, (_, j) => ({ key: 'r' + j, state: 'read' })), now);
rows.unshift(`<div class="r"><b>最重：三只小克都在变魔法 + 6 个机器人</b><small>${(big.length / 1024).toFixed(1)} KB（上限 128 KB）</small><div class="band">${img(big)}</div></div>`);
writeFileSync(out, `<!doctype html><meta charset="utf-8"><style>body{background:#1f1e1d;color:#ddd;font-family:PingFang SC,system-ui;margin:12px}.r{margin:0 0 4px}.r b{display:inline-block;min-width:110px;font-size:13px}.r small{color:#888;font-size:11px}.band{background:#2b2a28;border-radius:10px;width:${560 * Z}px}.band img{display:block}</style>${rows.join('')}`);
console.log('写好了', out, '最多那张', (big.length / 1024).toFixed(1), 'KB');
