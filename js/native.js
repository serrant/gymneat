// Android app features (Capacitor): back button, app state, rest notifications, vibration, file sharing.
// In a browser Capacitor is missing: `isApp` is false and every function does nothing,
// so the web app behaves exactly as without this file. All calls are best-effort.

const cap = typeof window !== 'undefined' ? window.Capacitor : null;
// capacitor.js (added to the app by scripts/copy-web.js) provides registerPlugin.
export const isApp = !!(cap && cap.registerPlugin && cap.isNativePlatform && cap.isNativePlatform());

const plugins = {};
const plugin = name => isApp ? (plugins[name] = plugins[name] || cap.registerPlugin(name)) : null;

async function call(name, method, opts) {
  const p = plugin(name);
  if (!p) return null;
  try { return await p[method](opts); } catch (e) {
    console.warn('Gymneat:', name + '.' + method, 'failed:', e && e.message);
    return null;
  }
}

const REST_ID = 1;
const ASKED_KEY = 'gymneat.exactAlarmAsked'; // device preference, not user data
let exactOK = false; // exact alarms allowed (Android 14+ turns them off for new apps)

async function refreshExact() {
  const r = await call('LocalNotifications', 'checkExactNotificationSetting');
  exactOK = !!(r && r.exact_alarm === 'granted');
}

export function initApp() {
  if (!isApp) return;
  call('LocalNotifications', 'createChannel', { id: 'rest', name: 'Rest timer', importance: 4, visibility: 1, vibration: true });
  // Android may have closed the app while it was away: on a fresh start no appStateChange
  // arrives, and the app is on screen, so a rest notification left over is stale.
  cancelRestAlert();
  refreshExact();
}

// Android back button. `fn` returns true when it closed something; otherwise the app goes to the background.
export function onBack(fn) {
  const app = plugin('App');
  if (app) app.addListener('backButton', () => { if (!fn()) call('App', 'minimizeApp'); });
}

// The app left the screen (false) or came back (true).
export function onAppState(fn) {
  const app = plugin('App');
  if (app) app.addListener('appStateChange', s => {
    if (s && s.isActive) refreshExact(); // the setting may have changed while away
    fn(!!(s && s.isActive));
  });
}

// Before a session: permission to notify (Android 13+ asks once). Resolves true when it's worth
// offering exact alarms: allowed to notify, exact alarms off, and not offered before on this phone.
export async function prepareRestAlerts() {
  if (!isApp) return false;
  const p = await call('LocalNotifications', 'requestPermissions');
  if (!p || p.display !== 'granted') return false;
  await refreshExact();
  if (exactOK) return false;
  try {
    if (localStorage.getItem(ASKED_KEY)) return false;
    localStorage.setItem(ASKED_KEY, '1');
  } catch (e) { return false; }
  return true;
}

// Opens Android's "Alarms & reminders" screen for this app.
export const openExactAlarmSetting = () => call('LocalNotifications', 'changeExactNotificationSetting');

// A notification at `at` (ms), standing in for the beep while the app is away from the screen.
// Exact only when allowed: asking for an exact alarm without permission would open the settings screen.
export function restAlert(at, title, body) {
  return call('LocalNotifications', 'schedule', { notifications: [{
    id: REST_ID, title, body, channelId: 'rest', isExactNotification: exactOK,
    schedule: { at: new Date(at).toISOString(), allowWhileIdle: true }
  }] });
}

// Cancels a pending rest notification and clears one already shown
// (the plugin's cancel() only affects pending ones; shown ones need removeDeliveredNotifications).
export async function cancelRestAlert() {
  const ids = { notifications: [{ id: REST_ID }] };
  await call('LocalNotifications', 'cancel', ids);
  await call('LocalNotifications', 'removeDeliveredNotifications', ids);
}

export const vibrate = ms => call('Haptics', 'vibrate', { duration: ms });

// Writes a text file to the app's cache and opens Android's share menu (Files, Drive, email…).
// Returns false on failure; closing the share menu counts as done.
export async function shareFile(filename, data) {
  const fs = plugin('Filesystem'), share = plugin('Share');
  if (!fs || !share) return false;
  try {
    const { uri } = await fs.writeFile({ path: filename, data, directory: 'CACHE', encoding: 'utf8' });
    await share.share({ title: filename, files: [uri], dialogTitle: filename });
  } catch (e) {
    if (/cancel/i.test(String(e && e.message))) return true;
    console.warn('Gymneat: sharing', filename, 'failed:', e && e.message);
    return false;
  }
  return true;
}
