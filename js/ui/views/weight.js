import { S } from '../../state.js';
import { fdate, todayStr } from '../../lib/dates.js';
import { esc } from '../../lib/util.js';
import { fnum } from '../../lib/format.js';
import { bwPoints } from '../../stats.js';
import { RANGES, changeStat, chart, seg } from '../components.js';
import { ui } from '../hooks.js';
import { icon } from '../icons.js';

export function vWeight() {
  const pts = bwPoints(S.body.entries, ui.bwRange);
  if (ui.bwSel != null && ui.bwSel >= pts.length) ui.bwSel = null;
  const ents = S.body.entries.slice().sort((a, b) => a.d < b.d ? 1 : -1);
  const cur = ents[0];
  return `<h2>Body weight</h2>
    <div class="stack">
      <div class="row">
        <input class="field" id="bw-date" type="date" value="${esc(ui.bwDate)}" max="${todayStr()}" aria-label="Date" style="flex:0 0 150px">
        <input class="field grow" id="bw-val" inputmode="decimal" placeholder="${cur ? fnum(cur.kg, 1) : 'kg'}" value="${esc(ui.bwVal)}" aria-label="Weight in kg" autocomplete="off">
        <button class="icon-btn fh acc" data-a="bwsave" aria-label="Save weight" title="Save">${icon('save')}</button>
      </div>
      ${seg('bwr', ui.bwRange, RANGES)}
    </div>
    ${chart(pts, 'kg', ui.bwSel, 'bwpt')}
    ${pts.length ? `<div class="stats"><div><small>Latest</small><b>${cur ? fnum(cur.kg, 1) : '—'}</b></div><div><small>Lowest</small><b>${fnum(Math.min(...pts.map(p => p.v)), 1)}</b></div><div><small>Change</small><b>${changeStat(pts, 1)}</b></div></div>` : ''}
    ${ents.length ? `<div class="stack"><h3>Entries</h3><ul class="list">${ents.slice(0, 14).map(e =>
      `<li><div class="li"><div class="name num">${fdate(e.d)} <span class="mute">${esc(String(e.d).slice(0, 4))}</span></div><div class="meta">${fnum(e.kg, 1)} kg</div><button class="icon-btn plain" data-a="bwdel" data-d="${esc(e.d)}" aria-label="Delete ${fdate(e.d)}">×</button></div></li>`).join('')}</ul></div>` : ''}`;
}
