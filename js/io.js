// Export and import. The JSON format is documented in docs/data.md.

import { S, normalize, saveLocal, sessionsList } from './state.js';
import { todayStr } from './lib/dates.js';
import { $, esc } from './lib/util.js';
import { isApp, shareFile } from './native.js';
import { ui, ask, toast, render, renderLayer } from './ui/hooks.js';

// Export saves a file through the share menu in the Android app; on the web there is Copy JSON.
export const canDownload = () => isApp;

export function exportObj() {
  return {
    app: 'gymneat', version: 1, // file identifier, checked on import
    exported: new Date().toISOString(),
    plan: S.profile.plan, customExercises: S.profile.custom,
    bodyWeight: S.body.entries,
    sessions: sessionsList().sort((a, b) => (a.start || 0) - (b.start || 0))
  };
}

export async function doExport() {
  const data = JSON.stringify(exportObj(), null, 2), filename = 'gymneat-' + todayStr() + '.json';
  if (!(await shareFile(filename, data))) toast('Export failed. Use Copy JSON instead.');
}

export async function doCopy() {
  const data = JSON.stringify(exportObj(), null, 2);
  try {
    await navigator.clipboard.writeText(data);
    toast('Copied');
  } catch (e) {
    // Clipboard blocked: show the JSON so it can be selected by hand.
    ui.modal = { text: '', html: `<textarea readonly id="json-out">${esc(data)}</textarea>`, cancel: 'Close' };
    ui.modalCb = null;
    renderLayer();
    const ta = $('json-out'); if (ta) ta.select();
  }
}

// Texts shipped with the app, for the Licences and Privacy sheets. Files bundled with the app: no outside request.
// Every file needs an extension: for an extensionless path the Android app's local server returns index.html.
// THIRD-PARTY-NOTICES.txt also carries the font licence, so the sheet needs only these files.
const DOCS = { licences: ['LICENSE.txt', 'THIRD-PARTY-NOTICES.txt'], privacy: ['PRIVACY.md'] };
// LICENSE.txt starts with a header for readers of the repository (it names files); the sheet's own intro replaces it.
const withoutHeader = (f, t) => f === 'LICENSE.txt' && t.includes('\n-----')
  ? t.slice(t.indexOf('\n', t.indexOf('\n-----') + 1) + 1).trimStart() : t;
export async function loadLegal(kind) {
  const get = f => fetch(f).then(r => { if (!r.ok) throw new Error(f); return r.text(); })
    .then(t => { if (/^\s*<(!doctype|html)/i.test(t)) throw new Error(f); return withoutHeader(f, t); }); // HTML: a fallback page, not the file
  let text;
  try { text = (await Promise.all(DOCS[kind].map(get))).join('\n\n\n'); }
  catch (e) { text = 'The texts could not be loaded.'; }
  if (ui.legal && ui.legal.kind === kind) { ui.legal.text = text; renderLayer(); }
}

export function importFile(file) {
  if (!file) return;
  const rd = new FileReader();
  rd.onload = () => {
    let o;
    try { o = JSON.parse(rd.result); } catch (e) { toast('That file is not valid JSON.'); return; }
    if (!o || o.app !== 'gymneat' || !o.plan || !Array.isArray(o.sessions)) { toast('That file is not a Gymneat export.'); return; }
    ask(`Replace all data with this file? It has ${o.sessions.length} sessions and ${(o.bodyWeight || []).length} weight entries.`, 'Replace', () => {
      S.profile = { plan: o.plan, custom: o.customExercises || [] };
      S.body = { entries: o.bodyWeight || [] };
      S.sessions = {};
      o.sessions.forEach(s => {
        if (s && s.id && Array.isArray(s.items)) { if (s.status === 'active') s.status = 'done'; S.sessions[s.id] = s; }
      });
      normalize();
      saveLocal();
      toast('Imported'); render();
    }, true);
  };
  rd.readAsText(file);
}
