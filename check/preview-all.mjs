import { writeFileSync } from 'node:fs';
import { bandSvg, homeX, plan } from '../hooks/crabs.ts';
import { LOOKS } from '../hooks/states.ts';
const out = process.argv[2] ?? 'preview.html', Z = Number(process.argv[3] ?? 2), EACH = 6;
const SHOW = [['think', []], ['read', []], ['web', []], ['edit', []], ['run', []], ['dispatch', ['read', 'web']], ['dispatch', ['edit', 'run', 'think', 'read', 'web']],
    ['wait', []], ['error', []], ['done', []], ['compact', []], ['tool', []]];
const items = SHOW.map(([s, hs]) => {
    const { segs } = plan(s, 'main', homeX('main')), act = segs.filter(g => g.act)[1] ?? segs[0], start = Math.max(0, act.t0 - .8);
    const crabs = [{ key: 'main', state: s, since: 0 }, ...hs.slice(0, 2).map((h, j) => ({ key: 'bot' + j, state: h, since: 0 }))];
    return { svg: bandSvg(crabs, hs.slice(2).map((h, j) => ({ key: 'r' + j, state: h })), start * 1000), cap: `小克${LOOKS[s].zh}：${LOOKS[s].how}${hs.length ? `　｜　另外 ${Math.min(2, hs.length)} 只小克：${hs.slice(0, 2).map(h => LOOKS[h].zh).join('、')}` : ''}${hs.length > 2 ? `　｜　${hs.length - 2} 个小机器人跟着主线小克跑` : ''}` };
});
writeFileSync(out, `<!doctype html><meta charset="utf-8"><title>小克 mod 预览</title><style>
body{margin:0;background:#1f1e1d;font-family:PingFang SC,system-ui;color:#d6d2ca;display:flex;align-items:center;justify-content:center;height:100vh}
.wrap{transform:scale(${Z});transform-origin:center;width:600px}.band{height:34px;background:#2b2a28;border-radius:10px 10px 0 0;padding:0 20px}
.prompt{background:#30302e;border:1px solid #3d3c39;border-radius:0 0 12px 12px;padding:9px 12px;font-size:11px;color:#8b877f}
.cap{font-size:8px;margin-top:6px;height:22px;line-height:11px}.n{color:#8b877f}</style>
<div class="wrap"><div class="band" id="b"></div><div class="prompt">Reply…</div><div class="cap"><span class="n" id="n"></span> <span id="c"></span></div></div>
<script>const I=${JSON.stringify(items)},E=${EACH};let cur=-1;const t0=performance.now();
function tick(){const k=Math.floor((performance.now()-t0)/1000/E)%I.length;if(k!==cur){cur=k;document.getElementById('b').innerHTML='<img width="560" height="34" src="data:image/svg+xml;charset=utf-8,'+encodeURIComponent(I[k].svg)+'">';document.getElementById('c').textContent=I[k].cap;document.getElementById('n').textContent=(k+1)+' / '+I.length}requestAnimationFrame(tick)}tick()</script>`);
console.log('写好了', out, '全长', SHOW.length * EACH, '秒');
