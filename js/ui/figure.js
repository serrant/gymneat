// Draws an exercise figure as SVG and moves it gently between its start and end pose.

import { FAMILIES, EXERCISE_FIGURES } from '../data/figures.js';
import { esc } from '../lib/util.js';

const PERIOD = 2600; // ms for one start → end → start cycle

// Which figure an exercise uses. Custom exercises (and anything unmapped) get the generic figure.
export function figureFor(exId) {
  const m = EXERCISE_FIGURES[exId];
  if (!m) return { key: 'generic', fam: FAMILIES.generic, tool: null, rev: false };
  const fam = FAMILIES[m[0]];
  return { key: m[0], fam, tool: m[1] == null ? (fam.tool || null) : m[1], rev: !!m[2] };
}

// Joint positions at t (0 = start pose, 1 = end pose).
export function poseAt(fig, t) {
  const a = fig.rev ? fig.fam.B : fig.fam.A, b = fig.rev ? fig.fam.A : fig.fam.B;
  const out = {};
  for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const pa = a[k] || b[k], pb = b[k] || a[k];
    out[k] = [pa[0] + (pb[0] - pa[0]) * t, pa[1] + (pb[1] - pa[1]) * t];
  }
  return out;
}

const n1 = v => Math.round(v * 10) / 10;
const pt = p => n1(p[0]) + ',' + n1(p[1]);
const circle = (c, r, cls) => `<circle class="${cls}" cx="${n1(c[0])}" cy="${n1(c[1])}" r="${r}"/>`;
const line = (a, b, cls, w) => `<line class="${cls}" x1="${n1(a[0])}" y1="${n1(a[1])}" x2="${n1(b[0])}" y2="${n1(b[1])}"${w ? ` style="stroke-width:${w}"` : ''}/>`;

function staticMarkup(fam) {
  let s = fam.floor === false ? '' : line([4, 92], [116, 92], 'fl');
  for (const q of fam.eq || []) {
    if (q.t === 'line') s += line(q.a, q.b, 'eq', q.w);
    else if (q.t === 'circle') s += circle(q.c, q.r, 'eq');
    else if (q.t === 'poly') s += `<polyline class="eq" points="${q.pts.map(pt).join(' ')}"${q.w ? ` style="stroke-width:${q.w}"` : ''}/>`;
    else if (q.t === 'ellipse') s += `<ellipse class="eq" cx="${q.c[0]}" cy="${q.c[1]}" rx="${q.rx}" ry="${q.ry}"/>`;
  }
  return s;
}

function bodyMarkup(fig, P) {
  let s = '';
  const hands = [P.w, P.w2].filter(Boolean);
  if (fig.fam.cable && P.w) s += line(P.w, fig.fam.cable, 'eq', 2) + circle(fig.fam.cable, 3, 'eq');
  if (P.e2) s += `<polyline class="bd far" points="${pt(P.n)} ${pt(P.e2)} ${pt(P.w2)}"/>`;
  if (P.k2) s += `<polyline class="bd far" points="${pt(P.p)} ${pt(P.k2)} ${pt(P.f2)}"/>`;
  s += `<polyline class="bd" points="${pt(P.p)} ${pt(P.k)} ${pt(P.f)}"/>`;
  s += line(P.n, P.p, 'bd');
  s += `<polyline class="bd" points="${pt(P.n)} ${pt(P.e)} ${pt(P.w)}"/>`;
  s += circle(P.h, 6.5, 'hd');
  switch (fig.tool) {
    case 'plate': s += circle(P.w, 7, 'wt'); break;
    case 'db': hands.forEach(h => { s += circle(h, 4.5, 'wt'); }); break;
    case 'grip': hands.forEach(h => { s += circle(h, 3, 'wt'); }); break;
    case 'kb': s += circle([P.w[0], P.w[1] + 6], 6, 'wt'); break;
    case 'wheel': s += circle(P.w, 5.5, 'wt'); break;
    case 'plateV': s += line([P.f[0] - 4, P.f[1] - 9], [P.f[0] + 4, P.f[1] + 9], 'wl'); break;
    case 'plateP': s += circle([P.p[0], P.p[1] - 8], 7, 'wt'); break;
    case 'padF': s += circle(P.f, 4, 'wt'); break;
    case 'padK': [P.k, P.k2].filter(Boolean).forEach(k => { s += circle(k, 4, 'wt'); }); break;
  }
  return s;
}

// The figure for one exercise, drawn at its start pose; startFigures() animates it.
export function figureSvg(exId, name, t = 0) {
  const fig = figureFor(exId);
  return `<svg class="fig" viewBox="0 -10 120 110" role="img" aria-label="${esc(name)}: how it's done" data-ex="${esc(exId)}">`
    + `<g>${staticMarkup(fig.fam)}</g><g class="fig-body">${bodyMarkup(fig, poseAt(fig, t))}</g></svg>`;
}

// One animation loop for whatever figure is on screen. Still (end pose) when the phone asks for reduced motion.
let started = false;
export function startFigures() {
  if (started || typeof requestAnimationFrame !== 'function') return;
  started = true;
  const mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  const frame = now => {
    const els = document.querySelectorAll('svg.fig[data-ex]');
    if (els.length) {
      const t = mq && mq.matches ? 1 : 0.5 - 0.5 * Math.cos(2 * Math.PI * now / PERIOD);
      els.forEach(el => {
        const g = el.querySelector('.fig-body');
        const fig = figureFor(el.dataset.ex);
        if (g) g.innerHTML = bodyMarkup(fig, poseAt(fig, t));
      });
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}
