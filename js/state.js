// The data model, its copy in this browser, and read helpers.
// `S` is a shared object: mutate its fields, never reassign it. Every data change ends with saveLocal().

import { DAYS, todayStr } from './lib/dates.js';
import { LIB, LIB_LIST, DEF } from './data/exercises.js';

const LS_KEY = 'gymneat.v1';

export function blank() {
  const plan = {};
  DAYS.forEach(d => { plan[d] = []; });
  return { profile: { plan, custom: [] }, body: { entries: [] }, sessions: {} };
}

export const S = blank();
export let hadLocal = false;

export function normalize() {
  const b = blank();
  S.profile = Object.assign(b.profile, S.profile || {});
  S.profile.plan = Object.assign(blank().profile.plan, S.profile.plan || {});
  DAYS.forEach(d => { if (!Array.isArray(S.profile.plan[d])) S.profile.plan[d] = []; });
  if (!Array.isArray(S.profile.custom)) S.profile.custom = [];
  S.body = Object.assign(b.body, S.body || {});
  if (!Array.isArray(S.body.entries)) S.body.entries = [];
  delete S.skips; // cancelled days: a removed feature
  if (!S.sessions || typeof S.sessions !== 'object') S.sessions = {};
}

export function saveLocal() {
  try { localStorage.setItem(LS_KEY, JSON.stringify(S)); } catch (e) { /* storage unavailable */ }
}

export function loadLocal() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const o = JSON.parse(raw);
      if (o && typeof o === 'object') { Object.assign(S, o); hadLocal = true; }
    }
  } catch (e) { /* corrupt or unavailable: start empty */ }
  normalize();
}

/* ---- exercises ---- */
export const exById = id => LIB[id] || S.profile.custom.find(c => c.id === id) || null;
export const allEx = () => LIB_LIST.concat(S.profile.custom);
export const exName = id => { const e = exById(id); return e ? e.name : id; };
export const exGroup = id => { const e = exById(id); return e ? e.g : ''; };

/* ---- sessions and days ---- */
export const sessionsList = () => Object.values(S.sessions).filter(s => s && s.items);
export const activeSession = () => sessionsList().find(s => s.status === 'active');
export const loggedSets = s => s.items.reduce((a, x) => a + (x.log ? x.log.length : 0), 0);
// Sessions saved for a day: finished ones, and unfinished ones (e.g. left with Back).
export const sessionsOn = date => sessionsList().filter(s => s.date === date && (s.status === 'active' || loggedSets(s) > 0));
// A day is done as soon as any set was logged for it, finished or not.
export const doneOn = date => sessionsList().some(s => s.date === date && loggedSets(s) > 0);

export function dayState(date, items) {
  if (doneOn(date)) return 'done';
  if (!items.length) return 'rest';
  return date < todayStr() ? 'missed' : 'plan';
}

// First-run plan, so the app doesn't open empty.
export function examplePlan() {
  const mk = id => { const e = LIB[id]; return Object.assign({ ex: id, t: e.t }, DEF[e.t]); };
  const p = blank().profile.plan;
  p.mon = ['bench-press', 'incline-dumbbell-press', 'cable-fly', 'treadmill-run'].map(mk);
  p.tue = ['lat-pulldown', 'seated-cable-row', 'pull-ups', 'dumbbell-row', 'crunches', 'barbell-curl', 'hammer-curl', 'preacher-curl'].map(mk);
  return p;
}
