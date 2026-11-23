// Data section at the bottom of Trends: version, licence notice, export and import.

import { canDownload } from '../../io.js';
import { VERSION } from '../../version.js';
import { icon } from '../icons.js';

// The licence notice (GPL-3.0 §5(d)): "GPL-3.0" opens the licences sheet, which carries the copyright
// line, the no-warranty statement, the licence text and the third-party notices — one tap away is still
// the "convenient and prominently visible feature" the licence asks for, so keep this button.
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
