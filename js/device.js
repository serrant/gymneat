// Beep, vibration and keeping the screen on. All best-effort: each fails silently
// where the browser doesn't allow it (vibration doesn't exist on iPhone).

import { isApp, vibrate } from './native.js';

let actx = null, wakeLock = null;

// Must be called from a tap: browsers only allow audio that a user gesture started.
export function initAudio() {
  try {
    if (!actx) { const AC = window.AudioContext || window.webkitAudioContext; if (AC) actx = new AC(); }
    if (actx && actx.state === 'suspended') actx.resume();
  } catch (e) { /* no audio */ }
}

export function beep() {
  try {
    if (actx) {
      const t = actx.currentTime;
      [0, 0.22, 0.44].forEach((o, i) => {
        const os = actx.createOscillator(), g = actx.createGain();
        os.frequency.value = i === 2 ? 1175 : 880;
        g.gain.setValueAtTime(0.0001, t + o);
        g.gain.exponentialRampToValueAtTime(0.35, t + o + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, t + o + 0.16);
        os.connect(g).connect(actx.destination);
        os.start(t + o); os.stop(t + o + 0.18);
      });
    }
  } catch (e) { /* no audio */ }
  try {
    if (isApp) { vibrate(180); setTimeout(() => vibrate(180), 270); } // Android app: native vibration
    else if (navigator.vibrate) navigator.vibrate([180, 90, 180]);
  } catch (e) { /* no vibration */ }
}

export async function wake() {
  try {
    if ('wakeLock' in navigator && !wakeLock) {
      wakeLock = await navigator.wakeLock.request('screen');
      wakeLock.addEventListener('release', () => { wakeLock = null; });
    }
  } catch (e) { /* not allowed */ }
}

export function unwake() {
  try { wakeLock && wakeLock.release(); } catch (e) { /* already released */ }
  wakeLock = null;
}
