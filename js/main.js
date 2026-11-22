// Entry point: load data, wire events and routing.

import { S, activeSession, examplePlan, hadLocal, loadLocal, saveLocal } from './state.js';
import { DAYS } from './lib/dates.js';
import { appVisible, tick } from './session.js';
import { wake } from './device.js';
import { initApp, onAppState, onBack } from './native.js';
import { act, back, onChange, onInput } from './actions.js';
import { ui, setRenderers } from './ui/hooks.js';
import { VIEWS, render, renderLayer } from './ui/render.js';
import { startFigures } from './ui/figure.js';

setRenderers({ render, renderLayer });

/* ---- events ---- */
document.addEventListener('click', e => {
  const el = e.target.closest('[data-a]');
  if (el) act(el.dataset.a, el, e.target);
});
document.addEventListener('input', e => onInput(e.target));
document.addEventListener('change', e => onChange(e.target));
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.target.id === 'bw-val') act('bwsave', e.target, e.target);
  if (e.key === 'Escape' && ui.modal) { ui.modal = null; renderLayer(); }
});
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState !== 'visible') return;
  if (ui.run) { wake(); tick(); }
});
setInterval(tick, 250);
startFigures();
// Android app only (no-ops in a browser): back button, rest notifications while away.
initApp();
onBack(back);
onAppState(appVisible);

/* ---- routing: one tab per #hash ---- */
function route() {
  const h = (location.hash || '').slice(1);
  // #today is the Training tab's old address; keep it working for saved links
  ui.view = VIEWS.includes(h) ? h : 'training';
  if (h === 'today') history.replaceState(null, '', '#training');
  ui.lib = null; ui.legal = null;
}
window.addEventListener('hashchange', () => {
  route();
  if (!ui.summary) ui.run = null;
  window.scrollTo(0, 0);
  render();
});

/* ---- boot ---- */
loadLocal();
// First run: start from the example plan, so the app doesn't open empty.
if (!hadLocal && !DAYS.some(d => S.profile.plan[d].length)) { S.profile.plan = examplePlan(); saveLocal(); }
route();
// Reopen a session that was running when the page was closed (if started in the last 6 hours).
const running = activeSession();
if (running && Date.now() - (running.start || 0) < 6 * 3600e3) { ui.run = running.id; wake(); }
render();
