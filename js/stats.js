// Pure calculations for trends. No DOM, no global state:
// everything comes in as arguments, so this file is unit-tested in tests/.

import { parseYmd, rangeStart, weekStartStr } from './lib/dates.js';

// Newest first by the day the session was for, then by start time.
// The date comes first because a session can be logged later for a past day.
export const newestFirst = (a, b) => a.date < b.date ? 1 : a.date > b.date ? -1 : (b.start || 0) - (a.start || 0);

const max = a => a.length ? Math.max(...a) : null;
const sum = a => a.length ? a.reduce((x, y) => x + y, 0) : null;

// One number for one exercise in one session, for the given metric key (see METRICS).
export function metricVal(log, m) {
  switch (m) {
    case 'top': return max(log.filter(l => l.kg > 0).map(l => l.kg));
    case 'maxr': return max(log.map(l => l.reps || 0));
    case 'totr': return sum(log.map(l => l.reps || 0));
    case 'maxs': return max(log.map(l => l.sec || 0));
    case 'tots': return sum(log.map(l => l.sec || 0));
    case 'dist': { const v = sum(log.map(l => l.km || 0)); return v > 0 ? v : null; }
    case 'time': return sum(log.map(l => l.min || 0));
    case 'spd': {
      const km = sum(log.map(l => l.km || 0)), mn = sum(log.map(l => l.min || 0));
      return km > 0 && mn > 0 ? km / (mn / 60) : null;
    }
  }
  return null;
}

// Every logged occurrence of an exercise, newest first.
export function itemsFor(sessions, exId, fromDate, excludeSid) {
  const out = [];
  for (const s of sessions) {
    if (s.id === excludeSid) continue;
    if (fromDate && s.date < fromDate) continue;
    s.items.forEach((it, idx) => {
      if (it.ex === exId && it.log && it.log.length) out.push({ date: s.date, start: s.start || 0, log: it.log, t: it.t, sid: s.id, idx });
    });
  }
  return out.sort(newestFirst);
}

// Most reps done at the top weight, shown next to it ("100 kg × 8").
const repsAtTop = (log, kg) => max(log.filter(l => l.kg === kg).map(l => l.reps || 0));

// Trend points: best value per day (per week for the year range).
// For top weight, `reps` is the most reps done at that weight.
export function exPoints(sessions, exId, m, r, today = new Date()) {
  const by = {};
  for (const e of itemsFor(sessions, exId, rangeStart(r, today))) {
    const v = metricVal(e.log, m);
    if (v == null) continue;
    const reps = m === 'top' ? repsAtTop(e.log, v) : null;
    const k = r === 'Y' ? weekStartStr(e.date) : e.date;
    if (!(k in by) || v > by[k].v || (v === by[k].v && reps > by[k].reps)) by[k] = { v, reps };
  }
  return Object.keys(by).sort().map(k => ({ d: k, t: parseYmd(k).getTime(), v: by[k].v, reps: by[k].reps, wk: r === 'Y' }));
}

// Body weight points: every entry, or the weekly average for the year range.
export function bwPoints(entries, r, today = new Date()) {
  const from = rangeStart(r, today);
  const ents = entries.filter(e => e.d >= from).sort((a, b) => a.d < b.d ? -1 : 1);
  if (r !== 'Y') return ents.map(e => ({ d: e.d, t: parseYmd(e.d).getTime(), v: e.kg }));
  const by = {};
  ents.forEach(e => { const k = weekStartStr(e.d); (by[k] = by[k] || []).push(e.kg); });
  return Object.keys(by).sort().map(k => ({ d: k, t: parseYmd(k).getTime(), v: by[k].reduce((a, b) => a + b, 0) / by[k].length, wk: true }));
}
