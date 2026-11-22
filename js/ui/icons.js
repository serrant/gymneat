// Small 24×24 line icons for icon-only buttons, drawn with currentColor (styled by .ic).
const PATHS = {
  plus: '<path d="M12 5v14M5 12h14"/>',
  copy: '<rect x="8.5" y="8.5" width="11.5" height="11.5" rx="2.5"/><path d="M15.5 8.5V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7.5a2 2 0 0 0 2 2h2.5"/>',
  download: '<path d="M12 4v11M7.5 10.5 12 15l4.5-4.5"/><path d="M5 19.5h14"/>',
  save: '<path d="M5 6a1.5 1.5 0 0 1 1.5-1.5h9.5L19.5 8v10a1.5 1.5 0 0 1-1.5 1.5H6.5A1.5 1.5 0 0 1 5 18z"/><path d="M8.5 4.5V8.5h6V4.5"/><path d="M8 19.5v-5h8v5"/>',
  upload: '<path d="M12 15.5V4.5M7.5 9 12 4.5 16.5 9"/><path d="M5 19.5h14"/>'
};
export const icon = name => `<svg class="ic" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${PATHS[name]}</svg>`;
