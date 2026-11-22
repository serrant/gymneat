// Text sheets opened from the notice line in Trends → Data:
// - Licences ("GPL-3.0"): with the copyright line it forms the GPL's "Appropriate Legal Notices" (§0, §5(d)),
//   and it carries the notices of the open-source parts the app ships (THIRD-PARTY-NOTICES.txt).
// - Privacy: PRIVACY.md, the privacy policy Google Play requires inside the app.

import { esc } from '../../lib/util.js';
import { ui } from '../hooks.js';

const TITLES = { licences: 'Licences', privacy: 'Privacy' };

// The Markdown PRIVACY.md uses: "# " title (shown in the sheet head instead), "## " headings,
// "- " list items, plain paragraphs. Everything is escaped.
function doc(md) {
  return md.split(/\n\s*\n/).map(b => b.trim()).filter(b => b && !/^# /.test(b)).map(b =>
    b.startsWith('## ') ? `<h3>${esc(b.slice(3))}</h3>`
      : b.startsWith('- ') ? `<ul>${b.split(/\n(?=- )/).map(li => `<li>${esc(li.slice(2))}</li>`).join('')}</ul>`
        : `<p>${esc(b)}</p>`).join('');
}

export function vLegal() {
  const { kind, text } = ui.legal; // text is loaded by loadLegal() in io.js; null until it arrives
  const body = kind === 'privacy'
    ? (text == null ? '' : `<div class="doc">${doc(text)}</div>`)
    : `<p class="legal-intro">Gymneat © 2026 serrant. Free software under the GNU General Public License version 3: you may share and change it under the same terms. It comes with no warranty.</p>
       ${text == null ? '' : `<pre class="legal">${esc(text)}</pre>`}`;
  return `<div class="sheet" role="dialog" aria-label="${TITLES[kind]}">
    <div class="sheet-head"><h2 class="grow">${TITLES[kind]}</h2><button class="btn sm pri" data-a="legalclose">Done</button></div>
    <div class="sheet-body stack">${body}</div>
  </div>`;
}
