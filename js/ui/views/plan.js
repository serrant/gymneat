import { S, allEx, exGroup, exName } from '../../state.js';
import { DAYS, DAY_L, DAY_S, dayIdx } from '../../lib/dates.js';
import { esc } from '../../lib/util.js';
import { GROUPS, TYPE_LABEL } from '../../data/exercises.js';
import { restText, stepper, targetLabel } from '../components.js';
import { ui } from '../hooks.js';
import { icon } from '../icons.js';

function editor(it, i, count) {
  const repsLabel = it.t === 'C' ? 'Time' : it.t === 'S' ? 'Hold' : 'Reps';
  const repsVal = it.t === 'C' ? it.reps + ' min' : it.t === 'S' ? it.reps + ' s' : it.reps;
  return `<div class="editor">
    ${it.t !== 'C' ? stepper('sets', it.sets, 'Sets') : ''}
    ${stepper('reps', repsVal, repsLabel)}
    ${stepper('rest', it.t === 'C' && !it.rest ? '0' : restText(it.rest), it.t === 'C' ? 'Rest after' : 'Rest')}
    <div class="editor-actions">
      <button class="btn sm" data-a="pmove" data-d="-1" ${i === 0 ? 'disabled' : ''} aria-label="Move up">↑</button>
      <button class="btn sm" data-a="pmove" data-d="1" ${i === count - 1 ? 'disabled' : ''} aria-label="Move down">↓</button>
      <span class="grow"></span>
      <button class="btn sm danger" data-a="pdel">Remove</button>
    </div></div>`;
}

export function vPlan() {
  const d = ui.pday, items = S.profile.plan[DAYS[d]], today = dayIdx(new Date());
  // Same strip as Training. The plan repeats every week, so each day shows its exercise count, not a date.
  const strip = DAYS.map((k, i) => {
    const n = S.profile.plan[k].length;
    return `<button class="wk${n ? ' st-plan' : ''}${i === d ? ' on' : ''}${i === today ? ' today' : ''}" data-a="pday" data-i="${i}" aria-label="${DAY_L[i]}, ${n ? n + ' exercise' + (n === 1 ? '' : 's') : 'rest day'}"><span>${DAY_S[i].toUpperCase()}</span><b class="num${n ? '' : ' mute'}">${n || '–'}</b><i></i></button>`;
  }).join('');
  const rows = items.map((it, i) => {
    const open = ui.edit === i;
    return `<li><button class="li" data-a="pedit" data-i="${i}" aria-expanded="${open}"><div class="name">${esc(exName(it.ex))}<small>${esc(exGroup(it.ex))}</small></div><div class="meta">${targetLabel(it)}</div></button>${open ? editor(it, i, items.length) : ''}</li>`;
  }).join('');
  // Copy: an icon over a native picker, so the phone's own day list opens.
  const copy = items.length
    ? `<label class="icon-btn lg icon-pick" title="Copy ${DAY_L[d]} to another day">${icon('copy')}<select id="copy-to" aria-label="Copy ${DAY_L[d]} to"><option value="">Copy ${DAY_L[d]} to…</option>${DAYS.map((k, i) => i === d ? '' : `<option value="${i}">${DAY_L[i]}</option>`).join('')}</select></label>`
    : '';
  return `
    <div class="week">${strip}</div>
    <div class="stack">
      <div class="row"><h2 class="grow">${DAY_L[d]}</h2>${copy}<button class="icon-btn lg acc" data-a="libopen" aria-label="Add exercises to ${DAY_L[d]}" title="Add exercises">${icon('plus')}</button></div>
      ${items.length ? `<ul class="list">${rows}</ul>` : `<div class="empty">Rest day</div>`}
    </div>`;
}

/* ---- exercise picker (full-screen sheet) ---- */

export function libRows() {
  const L = ui.lib, q = L.q.trim().toLowerCase(), items = S.profile.plan[DAYS[ui.pday]];
  const list = allEx().filter(e => (L.g === 'All' || e.g === L.g) && (!q || e.name.toLowerCase().includes(q)));
  if (!list.length) return `<li><div class="li mute">No match</div></li>`;
  return list.map(e => {
    const n = items.filter(it => it.ex === e.id).length;
    return `<li><button class="li" data-a="libadd" data-id="${esc(e.id)}"><div class="name">${esc(e.name)}<small>${esc(e.g)} · ${TYPE_LABEL[e.t]}</small></div>${n ? `<span class="add-count num">${n}</span>` : `<span class="plus" aria-hidden="true">+</span>`}</button></li>`;
  }).join('');
}

function newExerciseForm(f) {
  return `<div class="stack" style="padding:12px 0 16px;border-bottom:1px solid var(--line)">
    <input class="field" id="nx-name" placeholder="Name" maxlength="60" value="${esc(f.name)}" autocomplete="off">
    <div class="row">
      <select class="field grow" id="nx-g" aria-label="Muscle group">${GROUPS.map(g => `<option${g === f.g ? ' selected' : ''}>${g}</option>`).join('')}</select>
      <select class="field grow" id="nx-t" aria-label="Tracking">${Object.keys(TYPE_LABEL).map(t => `<option value="${t}"${t === f.t ? ' selected' : ''}>${TYPE_LABEL[t]}</option>`).join('')}</select>
    </div>
    <div class="row"><button class="btn sm quiet" data-a="nxcancel">Cancel</button><span class="grow"></span><button class="btn sm pri" data-a="nxsave">Create and add</button></div>
  </div>`;
}

export function vLib() {
  const L = ui.lib;
  return `<div class="sheet" role="dialog" aria-label="Add exercises to ${DAY_L[ui.pday]}">
    <div class="sheet-head"><input class="field grow" id="lib-q" type="search" placeholder="Search" value="${esc(L.q)}" autocomplete="off"><button class="btn sm pri" data-a="libclose">Done</button></div>
    <div class="sheet-head" style="padding-top:0"><div class="chips">${['All'].concat(GROUPS).map(g => `<button class="chip${L.g === g ? ' on' : ''}" data-a="libg" data-g="${esc(g)}">${g}</button>`).join('')}</div></div>
    <div class="sheet-body">
      ${L.form ? newExerciseForm(L.form) : ''}
      <ul class="list" id="lib-list">${libRows()}</ul>
      ${L.form ? '' : `<button class="btn quiet full" data-a="nxopen">New exercise</button>`}
    </div>
  </div>`;
}
