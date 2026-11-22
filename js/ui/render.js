// Draws the current tab into #app and overlays (session, picker, dialog, toast) into #layer.

import { S } from '../state.js';
import { esc } from '../lib/util.js';
import { ui } from './hooks.js';
import { vTraining } from './views/training.js';
import { vPlan, vLib } from './views/plan.js';
import { vTrends } from './views/trends.js';
import { vWeight } from './views/weight.js';
import { vRun, vSummary } from './views/run.js';
import { vLegal } from './views/legal.js';

export const VIEWS = ['training', 'plan', 'trends', 'weight'];
const TAB_LABELS = { training: 'Training', plan: 'Plan', trends: 'Trends', weight: 'Weight' };
// 24×24 line icons, drawn with currentColor (styled in .tabs svg).
const TAB_ICONS = {
  // calendar with today marked
  training: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/><rect x="7" y="13" width="4.5" height="4.5" rx="1" fill="currentColor" stroke="none"/>',
  // clipboard with the week's list
  plan: '<path d="M9 4.5H7a2 2 0 0 0-2 2V19a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6.5a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="3.5" rx="1"/><path d="M9 11h6M9 14.5h6M9 18h3.5"/>',
  // rising line chart
  trends: '<path d="M3.5 3.5v17h17"/><path d="M7.5 15l3.5-3.5 3 3L19 9"/><path d="M15 9h4v4"/>',
  // bathroom scale
  weight: '<rect x="3.5" y="3.5" width="17" height="17" rx="4"/><path d="M7.5 11a4.5 4.5 0 0 1 9 0z"/><path d="M12 11l2-2.5"/>'
};
const VIEW_FNS = { training: vTraining, plan: vPlan, trends: vTrends, weight: vWeight };

export function render() {
  const run = ui.run && S.sessions[ui.run];
  if (ui.run && (!run || run.status !== 'active' || !run.cur)) ui.run = null;
  const v = ui.view;
  const tabs = `<nav class="tabs" aria-label="Sections">${VIEWS.map(k =>
    `<a href="#${k}" class="${k === v ? 'on' : ''}"${k === v ? ' aria-current="page"' : ''}><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${TAB_ICONS[k]}</svg><span>${TAB_LABELS[k]}</span></a>`).join('')}</nav>`;
  document.getElementById('app').innerHTML = (VIEW_FNS[v] || vTraining)() + tabs;
  renderLayer();
}

function modal(M) {
  const danger = M.danger ? ' style="background:var(--bad);border-color:var(--bad);color:#fff"' : '';
  return `<div class="modal-bg" data-a="mclose"><div class="modal" role="dialog" aria-modal="true">
    ${M.text ? `<p>${esc(M.text)}</p>` : ''}${M.html || ''}
    <div class="row"><button class="btn grow" data-a="mclose">${M.cancel || 'Cancel'}</button>${M.okLabel ? `<button class="btn pri grow" data-a="mok"${danger}>${esc(M.okLabel)}</button>` : ''}</div>
  </div></div>`;
}

export function renderLayer() {
  let h = '';
  const libOpen = ui.lib && ui.view === 'plan';
  if (ui.summary) h += vSummary();
  else if (ui.run) h += vRun();
  else if (ui.legal) h += vLegal();
  else if (libOpen) h += vLib();
  if (ui.modal) h += modal(ui.modal);
  if (ui.toast) h += `<div class="toast" role="status">${esc(ui.toast)}</div>`;
  document.getElementById('layer').innerHTML = h;
  document.body.style.overflow = (ui.run || ui.summary || ui.legal || libOpen) ? 'hidden' : '';
}
