// Copies the app (index.html, css, js, fonts, LICENSE) into www/, the folder Capacitor packs into the
// Android app, and loads Capacitor's core script first so js/native.js can reach the native plugins.
// www/ is generated: edit the files at the project root, never www/.
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const www = join(root, 'www');

rmSync(www, { recursive: true, force: true });
mkdirSync(www);
// LICENSE.txt, THIRD-PARTY-NOTICES.txt and fonts/OFL.txt travel with the app, as the licences require,
// and PRIVACY.md, as Google Play requires (the Licences and Privacy sheets in Trends → Data show them).
// Keep the extensions: Capacitor answers extensionless paths with index.html.
// icons/ and manifest.json are the web version's tab and home-screen icons; they travel too so that
// the links in index.html resolve inside the app instead of asking its local server for missing files.
for (const p of ['index.html', 'css', 'js', 'fonts', 'icons', 'manifest.json', 'LICENSE.txt', 'THIRD-PARTY-NOTICES.txt', 'PRIVACY.md']) cpSync(join(root, p), join(www, p), { recursive: true });
cpSync(join(root, 'node_modules/@capacitor/core/dist/capacitor.js'), join(www, 'capacitor.js'));

// Classic scripts run before modules, so window.Capacitor is complete when main.js starts.
const index = join(www, 'index.html');
const tag = '<script type="module" src="js/main.js"></script>';
const html = readFileSync(index, 'utf8');
if (!html.includes(tag)) throw new Error('copy-web: the main.js script tag in index.html has changed; update ' + tag);
writeFileSync(index, html.replace(tag, '<script src="capacitor.js"></script>\n' + tag));
console.log('copy-web: app copied into www/');
