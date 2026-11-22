import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FAMILIES, EXERCISE_FIGURES } from '../js/data/figures.js';
import { LIB_LIST } from '../js/data/exercises.js';
import { figureFor, poseAt } from '../js/ui/figure.js';

test('every built-in exercise has a figure with complete start and end poses', () => {
  for (const e of LIB_LIST) {
    const m = EXERCISE_FIGURES[e.id];
    assert.ok(m, `no figure for ${e.id}`);
    const fam = FAMILIES[m[0]];
    assert.ok(fam, `unknown figure family ${m[0]} for ${e.id}`);
    for (const pose of [fam.A, fam.B]) for (const j of ['h', 'n', 'p', 'e', 'w', 'k', 'f']) assert.ok(pose[j], `${m[0]} misses ${j}`);
  }
});

test('custom exercises get the generic figure', () => {
  assert.equal(figureFor('c-abc123').key, 'generic');
});

test('poses move from start (t=0) to end (t=1)', () => {
  const fig = figureFor('barbell-curl');
  assert.deepEqual(poseAt(fig, 0).w, FAMILIES.curl.A.w);
  assert.deepEqual(poseAt(fig, 1).w, FAMILIES.curl.B.w);
  const mid = poseAt(fig, 0.5).w;
  assert.ok(mid[0] > FAMILIES.curl.A.w[0] && mid[0] < FAMILIES.curl.B.w[0]);
  assert.equal(fig.tool, 'plate'); // barbell override
});
