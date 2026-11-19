import { writeFileSync } from 'node:fs';
import { bandSvg, posAt } from '../hooks/crabs.ts';
const out = process.argv[2] ?? 'switch.html', STEP = Number(process.argv[3] ?? 3000);
const ORDER = ['think', 'read', 'run', 'done', 'edit', 'web', 'error', 'dispatch', 'think', 'wait', 'compact', 'tool'];
let cur = { key: 'main', state: 'think', x0: undefined, since: 0 };
const frames = ORDER.map((s, i) => {
    const now = i * STEP;
    if (i > 0)
        cur = { key: 'main', state: s, x0: posAt(cur, now), since: now };
    return { svg: bandSvg([cur], [], now), x: Math.round(cur.x0 ?? posAt(cur, now)) };
});
writeFileSync(out, `<!doctype html><meta charset="utf-8"><style>body{margin:0;background:#2b2a28}#b img{display:block}</style><div id="b"></div>
<script>const F=${JSON.stringify(frames.map(f => f.svg))};let k=-1;const t0=performance.now();window.swaps=[];
function tick(){const i=Math.floor((performance.now()-t0)/${STEP});if(i!==k&&i<F.length){k=i;document.getElementById('b').innerHTML='<img width="1120" height="68" src="data:image/svg+xml;charset=utf-8,'+encodeURIComponent(F[i])+'">';window.swaps.push(performance.now()-t0)}requestAnimationFrame(tick)}tick()</script>`);
console.log('写好了', out, '每次换状态时小克应在的位置', frames.map(f => f.x).join(' '));
