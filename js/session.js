// Running a session: set → rest → next set → … → finish.
// The cursor (`cur`) is stored in the session itself, so a reload or another
// device resumes at the same set.

import { S, sessionsList, exName, saveLocal } from './state.js';
import { DAYS, sessionDate } from './lib/dates.js';
import { $ } from './lib/util.js';
import { mmss, parseNum } from './lib/format.js';
import { itemsFor } from './stats.js';
import { initAudio, beep, wake, unwake } from './device.js';
import { isApp, prepareRestAlerts, openExactAlarmSetting, restAlert, cancelRestAlert } from './native.js';
import { ui, ask, render } from './ui/hooks.js';

export const sess = () => ui.run ? S.sessions[ui.run] : null;

export function startSession(dayI) {
  const items = (S.profile.plan[DAYS[dayI]] || []).map(it => ({
    ex: it.ex, t: it.t, name: exName(it.ex),
    sets: it.t === 'C' ? 1 : it.sets, reps: it.reps, rest: it.rest, log: []
  }));
  if (!items.length) return;
  const id = 's' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  S.sessions[id] = {
    id, date: sessionDate(dayI), planDay: DAYS[dayI], start: Date.now(), end: null, status: 'active', items,
    cur: { i: 0, s: 0, phase: 'work', restEnd: 0, restLen: 0 }
  };
  ui.run = id; ui.draftKey = '';
  saveLocal(); initAudio(); wake(); render();
  // Android app: permission to notify, then (once per phone) an offer to allow on-time alarms.
  if (isApp) prepareRestAlerts().then(offer => {
    if (offer) ask('Rest alerts can come up to a minute late when the app is in the background. Allow exact alarms?', 'Settings', openExactAlarmSetting);
  });
}

// Android app: while the app is off screen during a rest, a notification stands in for the beep.
export function appVisible(active) {
  if (active) { cancelRestAlert(); if (ui.run) { wake(); tick(); } return; }
  const s = sess(), c = s && s.cur;
  if (!c || c.phase !== 'rest' || c.restEnd <= Date.now()) return;
  const it = s.items[c.i];
  restAlert(c.restEnd, 'Rest over', it.t === 'C' ? it.name : `${it.name} · Set ${c.s + 1} / ${it.sets}`);
}

// Starting values for a set: previous set today, else the same set last session, else the plan.
export function prefill(s, it, si) {
  const prev = it.log[si - 1] || it.log[it.log.length - 1];
  const last = itemsFor(sessionsList(), it.ex, null, s.id)[0];
  const l = last ? (last.log[si] || last.log[last.log.length - 1]) : null;
  if (it.t === 'W') return { kg: prev ? String(prev.kg) : (l && l.kg != null ? String(l.kg) : ''), reps: String(it.reps) };
  if (it.t === 'B') return { reps: String(it.reps) };
  if (it.t === 'S') return { sec: String(it.reps) };
  return {
    min: prev ? String(prev.min) : (l && l.min ? String(l.min) : String(it.reps)),
    km: prev && prev.km != null ? String(prev.km) : (l && l.km != null ? String(l.km) : '')
  };
}

// Validate what was typed; marks bad fields and returns null if anything is missing.
function readDraft(t) {
  const d = ui.draft, bad = [];
  const num = (f, min, int) => {
    const v = parseNum(d[f]);
    if (isNaN(v) || v < min) { bad.push(f); return null; }
    return int ? Math.round(v) : +v.toFixed(2);
  };
  let out;
  if (t === 'W') out = { kg: num('kg', 0), reps: num('reps', 1, true) };
  else if (t === 'B') out = { reps: num('reps', 1, true) };
  else if (t === 'S') out = { sec: num('sec', 1, true) };
  else {
    out = { min: num('min', 0.1) };
    const km = parseNum(d.km);
    out.km = isNaN(km) || km < 0 ? null : +km.toFixed(2);
  }
  if (bad.length) { bad.forEach(f => { const el = $('in-' + f); if (el) el.classList.add('err'); }); return null; }
  return out;
}

export function completeSet() {
  const s = sess(); if (!s) return;
  initAudio();
  const c = s.cur, it = s.items[c.i];
  const v = readDraft(it.t); if (!v) return;
  v.at = Date.now();
  it.log.push(v);
  let ni = c.i, ns = c.s + 1;
  if (ns >= it.sets) { ni = c.i + 1; ns = 0; }
  if (ni >= s.items.length) { finishSession(); return; }
  const rest = it.rest | 0; // the exercise's rest applies after every set, including its last
  s.cur = rest > 0
    ? { i: ni, s: ns, phase: 'rest', restEnd: Date.now() + rest * 1000, restLen: rest }
    : { i: ni, s: ns, phase: 'work', restEnd: 0, restLen: 0 };
  ui.draftKey = '';
  saveLocal(); render();
}

export function skipExercise() {
  const s = sess(); if (!s) return;
  const ni = s.cur.i + 1;
  if (ni >= s.items.length) { finishSession(); return; }
  s.cur = { i: ni, s: 0, phase: 'work', restEnd: 0, restLen: 0 };
  ui.draftKey = '';
  saveLocal(); render();
}

export function endRest() {
  const s = sess(); if (!s) return;
  s.cur.phase = 'work';
  saveLocal(); initAudio(); render();
}

// A session with nothing logged is discarded rather than saved.
export function finishSession() {
  const s = sess(); if (!s) return;
  unwake();
  if (!s.items.some(it => it.log.length)) {
    delete S.sessions[s.id];
    saveLocal(); ui.run = null; render();
    return;
  }
  s.status = 'done'; s.end = Date.now(); s.cur = null;
  saveLocal(); ui.summary = s.id; ui.run = null; render();
}

// Runs 4× a second. Time is computed from timestamps, so it stays right
// after the phone was locked or the tab was in the background.
export function tick() {
  const s = sess(); if (!s) return;
  const clk = $('clock');
  if (clk) clk.textContent = mmss((Date.now() - s.start) / 1000);
  if (s.cur && s.cur.phase === 'rest') {
    const left = (s.cur.restEnd - Date.now()) / 1000;
    if (left <= 0) { s.cur.phase = 'work'; saveLocal(); beep(); render(); return; }
    const tl = $('rest-left');
    if (tl) { tl.textContent = mmss(Math.ceil(left)); tl.classList.toggle('low', left <= 10); }
    const br = $('rest-bar');
    if (br) br.style.width = (100 * (1 - left / (s.cur.restLen || 1))).toFixed(1) + '%';
  }
}
