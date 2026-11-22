// What happens on tap and input. Buttons carry data-a="<action>" plus data-* arguments;
// main.js routes every click on such an element to `act`.

import { S, activeSession, exById, loggedSets, saveLocal, sessionsOn } from './state.js';
import { DAYS, DAY_L, fdate, todayStr } from './lib/dates.js';
import { $, clone } from './lib/util.js';
import { parseNum } from './lib/format.js';
import { DEF } from './data/exercises.js';
import { initAudio, unwake, wake } from './device.js';
import { completeSet, endRest, finishSession, sess, skipExercise, startSession } from './session.js';
import { doCopy, doExport, importFile, loadLegal } from './io.js';
import { ui, ask, render, renderLayer } from './ui/hooks.js';
import { libRows } from './ui/views/plan.js';

const planItems = () => S.profile.plan[DAYS[ui.pday]];

// [step, min, max] for the plan editor steppers
const STEPS = {
  sets: () => [1, 1, 10],
  rest: () => [15, 0, 600],
  reps: t => t === 'C' ? [5, 5, 240] : t === 'S' ? [5, 5, 600] : [1, 1, 100]
};
// Step for the +/− buttons during a session (2.5 kg = smallest common plate jump)
const RUN_STEP = { kg: 2.5, reps: 1, sec: 5, min: 1, km: 0.5 };

const handlers = {
  /* training */
  trainday: ds => { ui.trainDay = +ds.i; render(); },
  editday: ds => { ui.pday = +ds.i; ui.edit = -1; }, // the link's href does the navigation
  start: ds => startSession(+ds.i),
  resume: () => {
    const s = activeSession();
    if (s) { ui.run = s.id; ui.draftKey = ''; initAudio(); wake(); render(); }
  },
  delday: ds => {
    // Every session saved for that day (usually one), finished or not.
    const list = sessionsOn(ds.d);
    if (!list.length) return;
    const sets = list.reduce((a, s) => a + loggedSets(s), 0);
    const what = list.length > 1 ? `${list.length} sessions` : 'the session';
    ask(`Delete ${what} for ${fdate(ds.d)}? ${sets} set${sets === 1 ? '' : 's'} will be removed.`, 'Delete', () => {
      list.forEach(s => {
        if (ui.run === s.id) { ui.run = null; unwake(); }
        delete S.sessions[s.id];
      });
      saveLocal(); render();
    }, true);
  },

  /* plan */
  pday: ds => { ui.pday = +ds.i; ui.edit = -1; render(); },
  pedit: ds => { ui.edit = ui.edit === +ds.i ? -1 : +ds.i; render(); },
  pstep: ds => {
    const it = planItems()[ui.edit]; if (!it) return;
    const [st, mn, mx] = STEPS[ds.f](it.t);
    it[ds.f] = Math.min(mx, Math.max(mn, it[ds.f] + +ds.d * st));
    saveLocal(); render();
  },
  pmove: ds => {
    const L = planItems(), i = ui.edit, j = i + +ds.d;
    if (j < 0 || j >= L.length) return;
    [L[i], L[j]] = [L[j], L[i]];
    ui.edit = j; saveLocal(); render();
  },
  pdel: () => { planItems().splice(ui.edit, 1); ui.edit = -1; saveLocal(); render(); },

  /* exercise picker */
  libopen: () => { ui.lib = { q: '', g: 'All', form: null }; render(); },
  libclose: () => { ui.lib = null; render(); },
  libg: ds => { ui.lib.g = ds.g; renderLayer(); },
  libadd: ds => {
    const e = exById(ds.id); if (!e) return;
    planItems().push(Object.assign({ ex: e.id, t: e.t }, DEF[e.t]));
    saveLocal();
    const sc = document.querySelector('.sheet-body'), top = sc ? sc.scrollTop : 0;
    render();
    const sc2 = document.querySelector('.sheet-body'); if (sc2) sc2.scrollTop = top;
  },
  nxopen: () => {
    ui.lib.form = { name: ui.lib.q, g: ui.lib.g !== 'All' ? ui.lib.g : 'Chest', t: ui.lib.g === 'Cardio' ? 'C' : 'W' };
    renderLayer();
    setTimeout(() => { const n = $('nx-name'); if (n) n.focus(); }, 0);
  },
  nxcancel: () => { ui.lib.form = null; renderLayer(); },
  nxsave: () => {
    const name = ($('nx-name').value || '').trim();
    if (!name) { $('nx-name').classList.add('err'); return; }
    const e = { id: 'c-' + Date.now().toString(36), name, g: $('nx-g').value, t: $('nx-t').value };
    S.profile.custom.push(e);
    planItems().push(Object.assign({ ex: e.id, t: e.t }, DEF[e.t]));
    ui.lib.form = null; ui.lib.q = '';
    saveLocal(); render();
  },

  /* session */
  setdone: () => completeSet(),
  rstep: ds => {
    const f = ds.f, cur = parseNum(ui.draft[f]);
    const nv = Math.max(0, +((isNaN(cur) ? 0 : cur) + +ds.d * RUN_STEP[f]).toFixed(2));
    ui.draft[f] = String(nv);
    const inp = $('in-' + f); if (inp) { inp.value = ui.draft[f]; inp.classList.remove('err'); }
    initAudio();
  },
  skipex: () => skipExercise(),
  restskip: () => endRest(),
  runhide: () => { ui.run = null; render(); },
  runend: () => {
    const s = sess();
    const any = s && s.items.some(x => x.log.length);
    ask(any ? 'End session now?' : 'Nothing logged yet. Discard session?', any ? 'End' : 'Discard', finishSession, !any);
  },
  sumclose: () => {
    ui.summary = null; ui.view = 'training';
    if (location.hash !== '#training') location.hash = 'training';
    render();
  },

  /* trends */
  trr: ds => { ui.trRange = ds.k; ui.trSel = null; render(); },
  trm: ds => { ui.trMetric = ds.k; ui.trSel = null; render(); },
  trpt: ds => { ui.trSel = +ds.i; render(); },
  delentry: ds => ask('Delete this entry?', 'Delete', () => {
    const s = S.sessions[ds.sid]; if (!s) return;
    s.items.splice(+ds.idx, 1);
    if (!s.items.some(x => x.log && x.log.length) && s.status !== 'active') delete S.sessions[ds.sid];
    saveLocal(); render();
  }, true),

  /* body weight */
  bwr: ds => { ui.bwRange = ds.k; ui.bwSel = null; render(); },
  bwpt: ds => { ui.bwSel = +ds.i; render(); },
  bwsave: () => {
    const date = $('bw-date').value || todayStr(), v = parseNum($('bw-val').value);
    if (isNaN(v) || v < 20 || v > 400) { $('bw-val').classList.add('err'); return; }
    // One entry per date: saving again replaces it.
    S.body.entries = S.body.entries.filter(e => e.d !== date);
    S.body.entries.push({ d: date, kg: +v.toFixed(1) });
    ui.bwVal = ''; ui.bwDate = todayStr(); ui.bwSel = null;
    saveLocal(); render();
  },
  bwdel: ds => ask('Delete the entry for ' + fdate(ds.d) + '?', 'Delete', () => {
    S.body.entries = S.body.entries.filter(e => e.d !== ds.d);
    saveLocal(); render();
  }, true),

  /* data (bottom of Trends) */
  export: () => doExport(),
  copyjson: () => doCopy(),
  legal: ds => { const kind = ds.k === 'privacy' ? 'privacy' : 'licences'; ui.legal = { kind, text: null }; renderLayer(); loadLegal(kind); },
  legalclose: () => { ui.legal = null; renderLayer(); },

  /* dialog */
  mok: () => { const cb = ui.modalCb; ui.modal = null; ui.modalCb = null; renderLayer(); if (cb) cb(); },
  mclose: () => { ui.modal = null; ui.modalCb = null; renderLayer(); }
};

// Android back button: closes whatever is on top and returns true, or returns false when
// nothing is open on the Training tab (the app then goes to the background).
export function back() {
  if (ui.modal) { handlers.mclose(); return true; }
  if (ui.legal) { handlers.legalclose(); return true; }
  if (ui.summary) { handlers.sumclose(); return true; }
  if (ui.run) { handlers.runhide(); return true; }
  if (ui.lib) { handlers.libclose(); return true; }
  if (ui.view !== 'training') { location.hash = 'training'; return true; }
  return false;
}

export function act(name, el, target) {
  // A tap inside the dialog box bubbles up to the backdrop: only close on the backdrop itself.
  if (name === 'mclose' && el.classList.contains('modal-bg') && el !== target) return;
  const h = handlers[name];
  if (h) h(el.dataset);
}

export function onInput(t) {
  if (t.dataset && t.dataset.dr) { ui.draft[t.dataset.dr] = t.value; t.classList.remove('err'); }
  else if (t.id === 'lib-q') { ui.lib.q = t.value; const l = $('lib-list'); if (l) l.innerHTML = libRows(); }
  else if (t.id === 'bw-val') { ui.bwVal = t.value; t.classList.remove('err'); }
  else if (t.id === 'nx-name' && ui.lib && ui.lib.form) { ui.lib.form.name = t.value; t.classList.remove('err'); }
}

export function onChange(t) {
  if (t.id === 'tr-ex') { ui.trEx = t.value; ui.trMetric = null; ui.trSel = null; render(); }
  else if (t.id === 'bw-date') ui.bwDate = t.value;
  else if (t.id === 'imp') { importFile(t.files[0]); t.value = ''; }
  else if (t.id === 'nx-g' && ui.lib && ui.lib.form) ui.lib.form.g = t.value;
  else if (t.id === 'nx-t' && ui.lib && ui.lib.form) ui.lib.form.t = t.value;
  else if (t.id === 'copy-to' && t.value !== '') {
    const to = +t.value, from = ui.pday;
    const copyDay = () => {
      S.profile.plan[DAYS[to]] = clone(S.profile.plan[DAYS[from]]);
      saveLocal(); ui.pday = to; ui.edit = -1; render();
    };
    if (S.profile.plan[DAYS[to]].length) ask(`Replace ${DAY_L[to]} with ${DAY_L[from]}?`, 'Replace', copyDay);
    else copyDay();
    t.value = '';
  }
}
