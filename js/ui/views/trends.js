import { exGroup, exName, sessionsList } from '../../state.js';
import { fdate, rangeStart } from '../../lib/dates.js';
import { esc } from '../../lib/util.js';
import { fnum } from '../../lib/format.js';
import { GROUPS, METRICS } from '../../data/exercises.js';
import { exPoints, itemsFor, newestFirst } from '../../stats.js';
import { RANGES, changeStat, chart, lastLine, seg } from '../components.js';
import { ui } from '../hooks.js';
import { vData } from './data.js';

export function vTrends() {
  const sessions = sessionsList();
  // Exercises that have logged data, most recently done first.
  const seen = new Map();
  sessions.slice().sort(newestFirst).forEach(s =>
    s.items.forEach(it => { if (it.log && it.log.length && !seen.has(it.ex)) seen.set(it.ex, it.t); }));
  if (!seen.size) return `<h2>Trends</h2><div class="empty">No sessions logged yet</div>${vData()}`;

  if (!ui.trEx || !seen.has(ui.trEx)) { ui.trEx = seen.keys().next().value; ui.trMetric = null; ui.trSel = null; }
  const ms = METRICS[seen.get(ui.trEx)];
  if (!ui.trMetric || !ms.some(m => m[0] === ui.trMetric)) ui.trMetric = ms[0][0];
  const m = ms.find(x => x[0] === ui.trMetric);

  const byGroup = {};
  for (const [id] of seen) { const g = exGroup(id) || 'Other'; (byGroup[g] = byGroup[g] || []).push(id); }
  const select = `<select class="field" id="tr-ex" aria-label="Exercise">${GROUPS.concat(['Other']).filter(g => byGroup[g]).map(g =>
    `<optgroup label="${g}">${byGroup[g].map(id => `<option value="${esc(id)}"${id === ui.trEx ? ' selected' : ''}>${esc(exName(id))}</option>`).join('')}</optgroup>`).join('')}</select>`;

  const pts = exPoints(sessions, ui.trEx, ui.trMetric, ui.trRange);
  if (ui.trSel != null && ui.trSel >= pts.length) ui.trSel = null;
  const dec = m[2] === 'reps' || m[2] === 's' ? 0 : 1;
  const best = pts.length ? Math.max(...pts.map(p => p.v)) : null;
  const hist = itemsFor(sessions, ui.trEx, rangeStart(ui.trRange)).slice(0, 12);

  return `<h2>Trends</h2>
    <div class="stack">${select}${seg('trr', ui.trRange, RANGES)}
      ${ms.length > 1 ? `<div class="chips">${ms.map(x => `<button class="chip${x[0] === ui.trMetric ? ' on' : ''}" data-a="trm" data-k="${x[0]}">${x[1]}</button>`).join('')}</div>` : ''}
    </div>
    ${chart(pts, m[2], ui.trSel, 'trpt')}
    ${pts.length ? `<div class="stats"><div><small>Best</small><b>${fnum(best, dec)}</b></div><div><small>Sessions</small><b>${pts.length}</b></div><div><small>Change</small><b>${changeStat(pts, dec)}</b></div></div>` : ''}
    ${hist.length ? `<div class="stack"><h3>Log</h3><ul class="list">${hist.map(h =>
      `<li><div class="li"><div class="name num">${fdate(h.date)}<small>${esc(lastLine(h.t, h.log))}</small></div><button class="icon-btn plain" data-a="delentry" data-sid="${esc(h.sid)}" data-idx="${h.idx}" aria-label="Delete entry from ${fdate(h.date)}">×</button></div></li>`).join('')}</ul></div>` : ''}
    ${vData()}`;
}
