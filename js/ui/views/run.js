// Session screens: the current set, the rest timer, and the summary at the end.

import { S } from '../../state.js';
import { DAY_L, dayIdx, fdate, parseYmd } from '../../lib/dates.js';
import { esc } from '../../lib/util.js';
import { fnum, mmss } from '../../lib/format.js';
import { prefill, sess } from '../../session.js';
import { bigStepper, lastLine } from '../components.js';
import { ui } from '../hooks.js';
import { figureSvg } from '../figure.js';

function header(s, c) {
  const total = s.items.reduce((a, x) => a + x.sets, 0);
  const done = s.items.reduce((a, x) => a + x.log.length, 0);
  const prog = s.items.map((x, i) => Array.from({ length: x.sets }, (_, j) =>
    `<i class="${j < x.log.length ? 'd' : (i === c.i && j === c.s ? 'c' : '')}"></i>`).join('')).join('');
  return `<div class="run-top">
      <button class="btn sm back" data-a="runhide">‹ Back</button>
      <div class="clock" id="clock">${mmss((Date.now() - s.start) / 1000)}</div>
      <button class="btn sm quiet" data-a="runend">End</button>
    </div>
    <div class="progress" aria-label="${done} of ${esc(total)} sets done">${prog}</div>`;
}

function restScreen(s, c, it) {
  const left = Math.max(0, (c.restEnd - Date.now()) / 1000);
  const pct = 100 * (1 - left / (c.restLen || 1));
  const kg = it.t === 'W' ? prefill(s, it, c.s).kg : '';
  const target = it.t === 'W' ? (kg ? kg + ' kg × ' + it.reps : it.reps + ' reps')
    : it.t === 'B' ? it.reps + ' reps' : it.t === 'S' ? it.reps + ' s' : it.reps + ' min';
  return `<div class="run"><div class="run-in">${header(s, c)}
    <div class="stack" style="margin-top:auto"><h3>Rest</h3>
      <div class="timer${left <= 10 ? ' low' : ''}" id="rest-left">${mmss(Math.ceil(left))}</div>
      <div class="bar"><i id="rest-bar" style="width:${pct.toFixed(1)}%"></i></div>
    </div>
    <div class="next"><h3>Next</h3><div class="ex">${esc(it.name)}</div><div class="setno">Set <b>${c.s + 1}</b> / ${esc(it.sets)} · ${esc(target)}</div></div>
    <div class="run-foot"><button class="btn pri big" data-a="restskip">Start set</button></div>
  </div></div>`;
}

function workScreen(s, c, it) {
  const key = s.id + ':' + c.i + ':' + c.s;
  if (ui.draftKey !== key) { ui.draft = prefill(s, it, c.s); ui.draftKey = key; }
  const d = ui.draft;
  const inputs = it.t === 'W' ? bigStepper('kg', 'Weight', d.kg, 'kg') + bigStepper('reps', 'Reps', d.reps)
    : it.t === 'B' ? bigStepper('reps', 'Reps', d.reps)
    : it.t === 'S' ? bigStepper('sec', 'Hold', d.sec, 's')
    : bigStepper('min', 'Time', d.min, 'min') + bigStepper('km', 'Distance', d.km, 'km');
  const target = it.t === 'C' ? it.reps + ' min' : it.t === 'S' ? it.reps + ' s' : it.reps + ' reps';
  const lastSet = c.s + 1 >= it.sets, lastEx = c.i + 1 >= s.items.length;
  return `<div class="run"><div class="run-in">${header(s, c)}
    <div class="stack">
      <h3>Exercise ${c.i + 1} / ${s.items.length}</h3>
      <div class="ex-name">${esc(it.name)}</div>
      <div class="setno">${it.t === 'C' ? '' : `Set <b>${c.s + 1}</b> / ${esc(it.sets)} · `}${esc(target)}</div>
    </div>
    <div class="inputs">${inputs}</div>
    <div class="fig-wrap">${figureSvg(it.ex, it.name)}</div>
    <div class="run-foot">
      <button class="btn pri big" data-a="setdone">${lastSet ? (lastEx ? 'Finish' : 'Done · next exercise') : 'Set done'}</button>
      <button class="btn quiet full" data-a="skipex">Skip exercise</button>
    </div>
  </div></div>`;
}

export function vRun() {
  const s = sess(), c = s.cur, it = s.items[c.i];
  return c.phase === 'rest' ? restScreen(s, c, it) : workScreen(s, c, it);
}

export function vSummary() {
  const s = S.sessions[ui.summary];
  if (!s) { ui.summary = null; return ''; }
  const sets = s.items.reduce((a, x) => a + x.log.length, 0);
  const vol = s.items.reduce((a, x) => a + x.log.reduce((b, l) => b + (l.kg || 0) * (l.reps || 0), 0), 0);
  const km = s.items.reduce((a, x) => a + x.log.reduce((b, l) => b + (l.km || 0), 0), 0);
  const cardioOnly = km > 0 && !vol;
  const rows = s.items.filter(x => x.log.length).map(x =>
    `<li><div class="li"><div class="name">${esc(x.name)}</div><div class="meta">${esc(lastLine(x.t, x.log))}</div></div></li>`).join('');
  return `<div class="run"><div class="run-in">
    <div class="stack" style="padding-top:12px"><h2>Session done</h2><span class="mute">${DAY_L[dayIdx(parseYmd(s.date))]} ${fdate(s.date)}</span></div>
    <div class="tiles">
      <div class="tile"><small>Time</small><b class="num">${mmss((s.end - s.start) / 1000)}</b></div>
      <div class="tile"><small>Sets</small><b class="num">${sets}</b></div>
      <div class="tile"><small>${cardioOnly ? 'Distance' : 'Volume'}</small><b class="num">${cardioOnly ? fnum(km, 1) : Math.round(vol).toLocaleString('en-US').replace(/,/g, ' ')}</b><span>${cardioOnly ? 'km' : 'kg'}</span></div>
    </div>
    <ul class="list" style="overflow-y:auto">${rows}</ul>
    <div class="run-foot"><button class="btn pri big" data-a="sumclose">Close</button></div>
  </div></div>`;
}
