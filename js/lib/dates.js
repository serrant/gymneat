// Dates are stored as local YYYY-MM-DD strings. Weeks start on Monday.

export const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
export const DAY_S = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const DAY_L = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const pad2 = n => String(n).padStart(2, '0');
export { pad2 };

export const ymd = d => d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
export const parseYmd = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
export const dayIdx = d => (d.getDay() + 6) % 7; // Monday = 0
export const addDays = (d, n) => { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() + n); return x; };
export const todayStr = () => ymd(new Date());

export function weekDates(ref) {
  const r = ref || new Date();
  const monday = addDays(r, -dayIdx(r));
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}

export const fdate = s => { const d = parseYmd(s); return d.getDate() + ' ' + MON[d.getMonth()]; };
export const weekStartStr = s => ymd(addDays(parseYmd(s), -dayIdx(parseYmd(s))));

// Trend windows: W = last 7 days, M = last 30, Y = last 365 (inclusive of today).
export const rangeStart = (r, today = new Date()) =>
  ymd(addDays(today, r === 'W' ? -6 : r === 'M' ? -29 : -364));

// The date a session started from this week's day `dayI` belongs to.
// An earlier day is logged on that day (catching up on a session already done);
// today or a later day is logged today (doing that day's plan now).
export function sessionDate(dayI, now = new Date()) {
  const d = ymd(weekDates(now)[dayI]);
  const today = ymd(now);
  return d < today ? d : today;
}
