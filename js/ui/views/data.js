// Data section at the bottom of Trends: version, licence notice, export and import.

import { canDownload } from '../../io.js';
import { VERSION } from '../../version.js';
import { icon } from '../icons.js';

// "GPL-3.0" opens the licences sheet: the no-warranty statement, the licence text, and the notices of
// the open-source parts the app ships, which their licences require. Keep this button.
// "Privacy" opens the privacy policy (PRIVACY.md), which Google Play requires inside the app.
const NOTICE = '<button class="lnk" data-a="legal" data-k="licences">GPL-3.0</button>'
  + ' · <button class="lnk" data-a="legal" data-k="privacy">Privacy</button>';

export function vData() {
  return `<div class="stack">
    <h3>Data</h3>
    <div class="mute" style="font-size:13px">Version ${VERSION}<br>${NOTICE}</div>
    <div class="row">
      <span class="mute grow">Backup (JSON)</span>
      ${canDownload() ? `<button class="icon-btn lg" data-a="export" aria-label="Export JSON file" title="Export">${icon('download')}</button>` : ''}
      <button class="icon-btn lg" data-a="copyjson" aria-label="Copy JSON" title="Copy">${icon('copy')}</button>
      <label class="icon-btn lg" for="imp" aria-label="Import JSON file" title="Import">${icon('upload')}</label><input type="file" id="imp" class="hidden-file" accept="application/json,.json">
    </div>
  </div>`;
}
