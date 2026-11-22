// UI state shared by views and actions, plus render hooks.
// Modules that need to trigger a redraw call these hooks instead of importing
// render.js, which keeps the import graph free of cycles. main.js wires them up.

import { dayIdx, todayStr } from '../lib/dates.js';

export const ui = {
  view: 'training',
  trainDay: dayIdx(new Date()), // selected day on Training
  pday: dayIdx(new Date()),   // selected day on Plan
  edit: -1,                   // plan row being edited
  lib: null,                  // exercise picker: { q, g, form }
  legal: null,                // licences sheet: { text }
  run: null,                  // id of the session on screen
  draft: {}, draftKey: '',    // values typed for the current set
  summary: null,              // id of the finished session being shown
  modal: null, modalCb: null,
  toast: '',
  trEx: null, trRange: 'M', trMetric: null, trSel: null,
  bwRange: 'M', bwSel: null, bwDate: todayStr(), bwVal: ''
};

let fns = { render() {}, renderLayer() {} };
export function setRenderers(f) { fns = f; }

export const render = () => fns.render();         // redraw everything
export const renderLayer = () => fns.renderLayer(); // redraw overlays only

let toastTimer = null;
export function toast(text) {
  ui.toast = text;
  renderLayer();
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { ui.toast = ''; renderLayer(); }, 3200);
}

// In-page confirm dialog (window.confirm is blocked in sandboxed frames).
export function ask(text, okLabel, cb, danger) {
  ui.modal = { text, okLabel, danger };
  ui.modalCb = cb;
  renderLayer();
}
