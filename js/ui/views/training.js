import { S, activeSession, dayState, exGroup, exName, sessionsOn } from '../../state.js';
import { DAYS, DAY_L, DAY_S, fdate, todayStr, weekDates, ymd } from '../../lib/dates.js';
import { esc } from '../../lib/util.js';
import { lastLine, targetLabel } from '../components.js';
import { ui } from '../hooks.js';

const STATE_PILL = { done: 'good', rest: '', missed: 'bad', plan: 'acc' };

// Training tab: this week's days, the selected day's plan or log, and starting a session.
export function vTraining() {
  const wd = weekDates(), t0 = todayStr(), sel = ui.trainDay, date = ymd(wd[sel]);
  const items = S.profile.plan[DAYS[sel]];
  const st = dayState(date, items);
  const act = activeSession();

  const chips = wd.map((d, i) => {
    const ds = ymd(d), s = dayState(ds, S.profile.plan[DAYS[i]]);
    return `<button class="wk st-${s}${i === sel ? ' on' : ''}${ds === t0 ? ' today' : ''}" data-a="trainday" data-i="${i}" aria-label="${DAY_L[i]} ${fdate(ds)}"><span>${DAY_S[i].toUpperCase()}</span><b>${d.getDate()}</b><i></i></button>`;
  }).join('');

  const label = { done: 'Done', rest: 'Rest', missed: 'Missed', plan: items.length + ' exercise' + (items.length === 1 ? '' : 's') }[st];

  // A logged day shows what was done; any other day shows the plan, greyed out once the day has passed.
  const logged = sessionsOn(date).flatMap(s => s.items.filter(x => x.log && x.log.length));
  const list = logged.length
    ? `<ul class="list">${logged.map(x => `<li><div class="li"><div class="name">${esc(exName(x.ex) !== x.ex ? exName(x.ex) : (x.name || x.ex))}<small class="num">${esc(lastLine(x.t, x.log))}</small></div></div></li>`).join('')}</ul>`
    : items.length
      ? `<h3>Planned</h3><ul class="list${date < t0 ? ' past' : ''}">${items.map(it => `<li><div class="li"><div class="name">${esc(exName(it.ex))}<small>${esc(exGroup(it.ex))}</small></div><div class="meta">${targetLabel(it)}</div></div></li>`).join('')}</ul>`
      : '';

  let actions;
  if (act) actions = `<button class="btn pri big" data-a="resume">Resume session</button>`;
  else if (items.length) actions = `<button class="btn pri big" data-a="start" data-i="${sel}">${date < t0 ? 'Log session for ' + fdate(date) : 'Start session'}</button>`;
  else actions = `<a class="btn full" href="#plan" data-a="editday" data-i="${sel}">Add exercises</a>`;
  // Added after the main choice, never in the middle of it.
  if (sessionsOn(date).length) actions += `<button class="btn quiet danger full" data-a="delday" data-d="${date}">Delete session</button>`;

  return `
    <div class="week">${chips}</div>
    <div class="stack">
      <div class="row"><h2 class="grow">${DAY_L[sel]} <span class="mute">${fdate(date)}</span></h2><span class="pill ${STATE_PILL[st]}">${label}</span></div>
      ${list}
    </div>
    <div class="stack">${actions}</div>`;
}
