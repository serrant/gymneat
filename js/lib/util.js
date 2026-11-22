// Small generic helpers with no app knowledge.

export const $ = id => document.getElementById(id);

export const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const clone = v => v == null ? v : JSON.parse(JSON.stringify(v));

export const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
