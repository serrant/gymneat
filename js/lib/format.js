import { pad2 } from './dates.js';

// Number with at most `d` decimals, trailing zeros dropped.
export const fnum = (n, d = 1) => (n == null || isNaN(n)) ? '—' : String(+(+n).toFixed(d));

// Accepts "82,5" as well as "82.5" (phones in Finland and Spain show a comma).
export const parseNum = s => {
  if (s == null) return NaN;
  const t = String(s).trim().replace(',', '.');
  return t === '' ? NaN : Number(t);
};

export const mmss = sec => {
  sec = Math.max(0, Math.round(sec));
  const h = Math.floor(sec / 3600), m = Math.floor(sec % 3600 / 60), s = sec % 60;
  return h ? h + ':' + pad2(m) + ':' + pad2(s) : m + ':' + pad2(s);
};

export const fmtRest = s => s ? (s >= 60 ? mmss(s) : s + ' s') : 'No rest';
