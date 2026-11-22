// Run with: npm test   (or: node --test)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { metricVal, exPoints, bwPoints, itemsFor } from '../js/stats.js';
import { addDays, ymd, sessionDate } from '../js/lib/dates.js';
import { parseNum, mmss } from '../js/lib/format.js';
import { S, dayState, sessionsOn } from '../js/state.js';

const TODAY = new Date(2026, 10, 21); // 21 Nov 2026
const day = n => ymd(addDays(TODAY, n));
const session = (id, date, items) => ({ id, date, start: new Date(date).getTime(), status: 'done', items });
const item = (ex, t, log) => ({ ex, t, log });

test('weighted trend is the heaviest weight lifted, with its reps', () => {
  const log = [{ kg: 80, reps: 8 }, { kg: 85, reps: 5 }, { kg: 85, reps: 6 }, { kg: 0, reps: 10 }];
  assert.equal(metricVal(log, 'top'), 85);
  const pts = exPoints([session('a', day(0), [item('squat', 'W', log)])], 'squat', 'top', 'W', TODAY);
  assert.deepEqual(pts.map(p => [p.v, p.reps]), [[85, 6]]);
});

test('a session started from an earlier day this week is logged on that day', () => {
  // TODAY is Saturday 21 Nov 2026; index 0 = Monday 16 Nov
  assert.equal(sessionDate(0, TODAY), '2026-11-16');
  assert.equal(sessionDate(5, TODAY), '2026-11-21'); // today
  assert.equal(sessionDate(6, TODAY), '2026-11-21'); // Sunday's plan done today
});

test('a past-day session logged later sorts and plots by its own date', () => {
  const logged = new Date(2026, 10, 21, 20).getTime(); // entered Saturday evening
  const sessions = [
    { id: 'wed', date: '2026-11-18', start: new Date(2026, 10, 18, 18).getTime(), status: 'done', items: [item('squat', 'W', [{ kg: 105, reps: 5 }])] },
    { id: 'mon', date: '2026-11-16', start: logged, status: 'done', items: [item('squat', 'W', [{ kg: 100, reps: 5 }])] }
  ];
  assert.deepEqual(itemsFor(sessions, 'squat').map(e => e.sid), ['wed', 'mon']);
  assert.deepEqual(exPoints(sessions, 'squat', 'top', 'W', TODAY).map(p => [p.d, p.v]), [['2026-11-16', 100], ['2026-11-18', 105]]);
});

test('cardio speed needs distance', () => {
  assert.equal(metricVal([{ min: 30, km: 5 }], 'spd'), 10);
  assert.equal(metricVal([{ min: 30, km: null }], 'spd'), null);
});

test('trend keeps the best value per day and respects the range', () => {
  const sessions = [
    session('a', day(0), [item('squat', 'W', [{ kg: 100, reps: 5 }])]),
    session('b', day(0), [item('squat', 'W', [{ kg: 105, reps: 5 }])]),
    session('c', day(-10), [item('squat', 'W', [{ kg: 95, reps: 5 }])])
  ];
  const week = exPoints(sessions, 'squat', 'top', 'W', TODAY);
  assert.deepEqual(week.map(p => p.v), [105]);
  const month = exPoints(sessions, 'squat', 'top', 'M', TODAY);
  assert.deepEqual(month.map(p => p.v), [95, 105]);
});

test('year view groups by week (Monday start)', () => {
  const sessions = [
    session('a', '2026-11-16', [item('squat', 'W', [{ kg: 100, reps: 5 }])]), // Monday
    session('b', '2026-11-19', [item('squat', 'W', [{ kg: 102.5, reps: 5 }])]) // Thursday, same week
  ];
  const pts = exPoints(sessions, 'squat', 'top', 'Y', TODAY);
  assert.equal(pts.length, 1);
  assert.equal(pts[0].d, '2026-11-16');
  assert.equal(pts[0].v, 102.5);
});

test('body weight: weekly average in year view', () => {
  const pts = bwPoints([{ d: '2026-11-16', kg: 80 }, { d: '2026-11-18', kg: 79 }], 'Y', TODAY);
  assert.equal(pts.length, 1);
  assert.equal(pts[0].v, 79.5);
});

test('number input accepts a decimal comma', () => {
  assert.equal(parseNum('82,5'), 82.5);
  assert.ok(Number.isNaN(parseNum('')));
  assert.equal(mmss(90), '1:30');
});

test('a day with logged sets is done, even if the session was never finished', () => {
  const plan = [{ ex: 'squat', t: 'W', sets: 3, reps: 5, rest: 90 }];
  S.sessions = {
    open: { id: 'open', date: '2026-11-16', start: 1, status: 'active', items: [item('squat', 'W', [{ kg: 100, reps: 5 }])] },
    empty: { id: 'empty', date: '2026-11-17', start: 1, status: 'active', items: [item('squat', 'W', [])] }
  };
  assert.equal(dayState('2026-11-16', plan), 'done');
  assert.equal(dayState('2026-11-17', plan), 'missed');           // started, nothing logged
  assert.equal(sessionsOn('2026-11-17').length, 1);               // but still deletable
  assert.equal(sessionsOn('2026-11-18').length, 0);
});
