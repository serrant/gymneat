// Reusable pieces of markup. Each returns an HTML string.

import { fdate } from '../lib/dates.js';
import { fnum, fmtRest, mmss } from '../lib/format.js';
import { esc } from '../lib/util.js';

export const RANGES = [['W', 'Week'], ['M', 'Month'], ['Y', 'Year']];

export function seg(action, current, opts) {
  return `<div class="seg">${opts.map(([k, l]) => `<button class="${k === current ? 'on' : ''}" data-a="${action}" data-k="${k}">${l}</button>`).join('')}</div>`;
}

// "3 × 10 · 1:30", "3 × 30 s · 45 s", "20 min". Escaped: plan values can come from an imported file.
export function targetLabel(it) {
  const rest = ' · ' + fmtRest(it.rest);
  const text = it.t === 'C' ? it.reps + ' min'
    : it.t === 'S' ? it.sets + ' × ' + it.reps + ' s' + rest
    : it.sets + ' × ' + it.reps + rest;
  return esc(text);
}

// "60×10  60×9" etc.
export function lastLine(t, log) {
  if (!log) return '';
  if (t === 'W') return log.map(l => fnum(l.kg, 2) + '×' + l.reps).join('  ');
  if (t === 'B') return log.map(l => l.reps).join('  ');
  if (t === 'S') return log.map(l => l.sec + ' s').join('  ');
  return log.map(l => fnum(l.min) + ' min' + (l.km ? ' · ' + fnum(l.km, 2) + ' km' : '')).join('  ');
}

// Small stepper used in the plan editor.
export function stepper(f, v, label) {
  return `<div class="fld"><label>${label}</label><div class="stp">
    <button data-a="pstep" data-f="${f}" data-d="-1" aria-label="Less ${label}">−</button>
    <span class="num">${esc(v)}</span>
    <button data-a="pstep" data-f="${f}" data-d="1" aria-label="More ${label}">+</button></div></div>`;
}

export const restText = s => s >= 60 ? mmss(s) : s + ' s';

// Large stepper with an editable field, used during a session.
export function bigStepper(f, label, val, unit) {
  return `<div class="bigfld"><label for="in-${f}">${label}${unit ? ' <span style="text-transform:none">(' + unit + ')</span>' : ''}</label>
    <div class="bigstp">
      <button data-a="rstep" data-f="${f}" data-d="-1" aria-label="Decrease ${label}">−</button>
      <input class="bigin" id="in-${f}" data-dr="${f}" inputmode="decimal" autocomplete="off" value="${esc(val)}">
      <button data-a="rstep" data-f="${f}" data-d="1" aria-label="Increase ${label}">+</button>
    </div></div>`;
}

// First-to-last change over the plotted range.
export function changeStat(pts, dec) {
  if (pts.length < 2) return '—';
  const d = pts[pts.length - 1].v - pts[0].v;
  const p = pts[0].v ? d / pts[0].v * 100 : 0;
  return `${d > 0 ? '+' : d < 0 ? '−' : ''}${fnum(Math.abs(d), dec)}<small class="mute" style="font:500 13px var(--f-body)"> ${p ? (p > 0 ? '+' : '−') + fnum(Math.abs(p), 1) + '%' : ''}</small>`;
}

// Line chart drawn as SVG. Points: [{ d, t, v, wk }]. Tapping a point selects it.
export function chart(pts, unit, selIdx, action) {
  if (!pts.length) return `<div class="empty">No data in this range</div>`;
  const W = 340, H = 168, pl = 40, pr = 12, pt = 10, pb = 22;
  const vs = pts.map(p => p.v);
  const dmin = Math.min(...vs), dmax = Math.max(...vs);
  let mn = dmin, mx = dmax;
  if (mn === mx) { mn -= 1; mx += 1; }
  const pad = (mx - mn) * 0.1; mn -= pad; mx += pad;
  const t0 = pts[0].t, t1 = pts[pts.length - 1].t;
  const X = t => t1 === t0 ? pl + (W - pl - pr) / 2 : pl + (t - t0) / (t1 - t0) * (W - pl - pr);
  const Y = v => pt + (1 - (v - mn) / (mx - mn)) * (H - pt - pb);
  const dec = unit === 'reps' || unit === 's' ? 0 : 1;

  // Grid lines only at the real min and max, so every label is a value the chart reaches.
  const ticks = dmin === dmax ? [dmin] : [dmin, dmax];
  let g = ticks.map(v => `<line class="grid" x1="${pl}" x2="${W - pr}" y1="${Y(v).toFixed(1)}" y2="${Y(v).toFixed(1)}"/><text x="${pl - 6}" y="${(Y(v) + 4).toFixed(1)}" text-anchor="end">${fnum(v, dec)}</text>`).join('');
  g += `<text x="${pl}" y="${H - 4}" text-anchor="start">${fdate(pts[0].d)}</text>`;
  if (pts.length > 1) g += `<text x="${W - pr}" y="${H - 4}" text-anchor="end">${fdate(pts[pts.length - 1].d)}</text>`;

  const line = pts.map((p, i) => (i ? 'L' : 'M') + X(p.t).toFixed(1) + ' ' + Y(p.v).toFixed(1)).join(' ');
  const area = pts.length > 1 ? `<path class="ar" d="${line} L${X(t1).toFixed(1)} ${H - pb} L${X(t0).toFixed(1)} ${H - pb} Z"/>` : '';
  const sel = selIdx == null ? pts.length - 1 : selIdx;
  const dots = pts.map((p, i) => `<circle class="pt${i === sel ? ' sel' : ''}" cx="${X(p.t).toFixed(1)}" cy="${Y(p.v).toFixed(1)}" r="${i === sel ? 5 : (pts.length > 40 ? 0 : 3)}"/>`).join('');
  const hits = pts.map((p, i) => `<circle class="hit" data-a="${action}" data-i="${i}" cx="${X(p.t).toFixed(1)}" cy="${Y(p.v).toFixed(1)}" r="14"/>`).join('');
  const sp = pts[sel];
  return `<div class="chart-wrap">
    <div class="readout"><b>${fnum(sp.v, dec)}</b><span>${unit}${sp.reps ? ' × ' + sp.reps : ''} · ${sp.wk ? 'week of ' : ''}${fdate(sp.d)}</span></div>
    <svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Trend, ${pts.length} points">${g}${area}${pts.length > 1 ? `<path class="ln" d="${line}"/>` : ''}${dots}${hits}</svg>
  </div>`;
}
