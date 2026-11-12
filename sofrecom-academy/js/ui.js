/* =====================================================================
   UI — icônes SVG (set Lucide-like), composants HTML et comportements
   partagés (toast, modal, drawer, tabs, chat, trend…). Pas d'emoji-icône.
   ===================================================================== */
(function () {
  const P = {
    home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
    dashboard: '<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>',
    'book-open': '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    'calendar-check': '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/><path d="m9 16 2 2 4-4"/>',
    'calendar-plus': '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M12 14v6M9 17h6"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    'user-plus': '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/>',
    'user-check': '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="m16 11 2 2 4-4"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
    plus: '<path d="M5 12h14M12 5v14"/>',
    minus: '<path d="M5 12h14"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    'check-circle': '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
    'alert-triangle': '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4M12 17h.01"/>',
    'alert-circle': '<circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
    'chevron-right': '<path d="m9 18 6-6-6-6"/>',
    'chevron-left': '<path d="m15 18-6-6 6-6"/>',
    'chevron-down': '<path d="m6 9 6 6 6-6"/>',
    'chevron-up': '<path d="m18 15-6-6-6 6"/>',
    'arrow-right': '<path d="M5 12h14M12 5l7 7-7 7"/>',
    'arrow-left': '<path d="M19 12H5M12 19l-7-7 7-7"/>',
    'arrow-up-right': '<path d="M7 7h10v10M7 17 17 7"/>',
    'message-circle': '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
    'message-square': '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    send: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
    award: '<circle cx="12" cy="8" r="6"/><path d="M15.48 12.89 17 22l-5-3-5 3 1.52-9.11"/>',
    'badge-check': '<path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m9 12 2 2 4-4"/>',
    star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
    sparkles: '<path d="m12 3-1.91 5.81a2 2 0 0 1-1.28 1.28L3 12l5.81 1.91a2 2 0 0 1 1.28 1.28L12 21l1.91-5.81a2 2 0 0 1 1.28-1.28L21 12l-5.81-1.91a2 2 0 0 1-1.28-1.28Z"/><path d="M5 3v4M19 17v4M3 5h4M17 19h4"/>',
    'credit-card': '<rect width="20" height="14" x="2" y="5" rx="2"/><path d="M2 10h20"/>',
    banknote: '<rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/>',
    ticket: '<path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2M13 17v2M13 11v2"/>',
    'clipboard-check': '<rect width="8" height="4" x="8" y="2" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/>',
    'clipboard-list': '<rect width="8" height="4" x="8" y="2" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4M12 16h4M8 11h.01M8 16h.01"/>',
    'file-text': '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4M10 9H8M16 13H8M16 17H8"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5M12 3v12"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5M12 15V3"/>',
    play: '<polygon points="6 3 20 12 6 21 6 3"/>',
    pause: '<rect x="14" y="4" width="4" height="16" rx="1"/><rect x="6" y="4" width="4" height="16" rx="1"/>',
    monitor: '<rect width="20" height="14" x="2" y="3" rx="2"/><path d="M8 21h8M12 17v4"/>',
    'help-circle': '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01"/>',
    'trending-up': '<path d="m22 7-8.5 8.5-5-5L2 17"/><path d="M16 7h6v6"/>',
    'bar-chart': '<path d="M12 20V10M18 20V4M6 20v-4"/>',
    'pie-chart': '<path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/>',
    'shield-check': '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
    'log-out': '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/>',
    'rotate-ccw': '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
    'map-pin': '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    video: '<path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2"/>',
    'wifi-off': '<path d="M2 2l20 20M8.5 16.5a5 5 0 0 1 7 0M2 8.82a15 15 0 0 1 4.17-2.65M10.66 5c4.01-.36 8.14.9 11.34 3.76M16.85 11.25a10 10 0 0 1 2.22 1.68M5 13a10 10 0 0 1 5.24-2.76M12 20h.01"/>',
    wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
    building: '<rect width="16" height="20" x="4" y="2" rx="2"/><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"/>',
    heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
    'thumbs-up': '<path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"/>',
    share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.59 13.51 6.83 3.98M15.41 6.51l-6.82 3.98"/>',
    bookmark: '<path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>',
    pin: '<path d="M12 17v5M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/>',
    megaphone: '<path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>',
    'life-buoy': '<circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24M14.83 9.17l4.24-4.24M14.83 14.83l4.24 4.24M9.17 14.83l-4.24 4.24"/><circle cx="12" cy="12" r="4"/>',
    'graduation-cap': '<path d="M21.42 10.92a1 1 0 0 0-.02-1.84L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.83l8.57 3.91a2 2 0 0 0 1.66 0z"/><path d="M22 10v6M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>',
    filter: '<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>',
    pencil: '<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>',
    trash: '<path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>',
    eye: '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
    layers: '<path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65M22 12.65l-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>',
    target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
    zap: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
    lightbulb: '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5M9 18h6M10 22h4"/>',
    smartphone: '<rect width="14" height="20" x="5" y="2" rx="2"/><path d="M12 18h.01"/>',
    globe: '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20"/>',
    grid: '<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
    more: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
    menu: '<path d="M4 12h16M4 6h16M4 18h16"/>',
    'external-link': '<path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
    image: '<rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.09-3.09a2 2 0 0 0-2.82 0L6 21"/>',
    paperclip: '<path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/>',
    timer: '<path d="M10 2h4M12 14l3-3"/><circle cx="12" cy="14" r="8"/>',
    folder: '<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>',
    inbox: '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
    lock: '<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7"/>',
    euro: '<path d="M4 10h12M4 14h9M19 6a7.7 7.7 0 0 0-5.2-2A7.9 7.9 0 0 0 6 12c0 4.4 3.5 8 7.8 8 2 0 3.8-.8 5.2-2"/>',
    'refresh-cw': '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
    'thumbs-down': '<path d="M17 14V2"/><path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z"/>',
    rocket: '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09zM12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>',
    compass: '<circle cx="12" cy="12" r="10"/><path d="m16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z"/>',
    'hand-heart': '<path d="M11 14h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 16"/><path d="m7 20 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9M2 15l6 6"/><path d="M19.5 8.5c.7-.7 1.5-1.6 1.5-2.7A2.73 2.73 0 0 0 16 4a2.78 2.78 0 0 0-5 1.8c0 1.2.8 2 1.5 2.8L16 12Z"/>',
    'pen-line': '<path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
    'list-checks': '<path d="m3 17 2 2 4-4M3 7l2 2 4-4M13 6h8M13 12h8M13 18h8"/>',
    activity: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
    archive: '<rect width="20" height="5" x="2" y="3" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8M10 12h4"/>',
    mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
    hash: '<path d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18"/>'
  };

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

  /** icon('bell', {cls:'sm', label:'Notifications'}) — décoratif (aria-hidden) sauf si label */
  function icon(name, opts = {}) {
    const p = P[name] || P['info'];
    const cls = 'ico' + (opts.cls ? ' ' + opts.cls : '');
    const a11y = opts.label ? `role="img" aria-label="${esc(opts.label)}"` : 'aria-hidden="true" focusable="false"';
    const style = opts.style ? ` style="${opts.style}"` : '';
    return `<svg class="${cls}" viewBox="0 0 24 24" ${a11y}${style}>${p}</svg>`;
  }

  const COLOR_VAR = { blue: 'var(--blue)', cyan: 'var(--cyan)', teal: 'var(--teal)', green: 'var(--green)', orange: 'var(--orange)', red: 'var(--red)', purple: 'var(--purple)', ok: 'var(--green-ok)', 'blue-d': 'var(--blue-d)' };
  const colorVar = (c) => COLOR_VAR[c] || c || 'var(--blue)';

  function avatar(personOrId, opts = {}) {
    const p = typeof personOrId === 'string' ? window.Store.person(personOrId) : personOrId;
    const size = opts.size ? ' ' + opts.size : '';
    const ring = opts.ring ? ' ring' : '';
    const title = opts.title === false ? '' : ` title="${esc(p.fullName || p.name)}"`;
    return `<span class="avatar${size}${ring}" style="--c:${colorVar(p.color)}"${title} aria-hidden="true">${esc(p.initials)}</span>`;
  }
  function avatarStack(ids, max = 5) {
    const shown = ids.slice(0, max).map((id) => avatar(id, { size: 'sm' })).join('');
    const more = ids.length > max ? `<span class="avatar sm" style="--c:var(--line-2)">+${ids.length - max}</span>` : '';
    return `<span class="avatar-stack">${shown}${more}</span>`;
  }
  function pill(text, color = '', opts = {}) {
    return `<span class="pill ${color}">${opts.dot ? '<span class="dot"></span>' : ''}${opts.icon ? icon(opts.icon, { cls: 'sm' }) : ''}${esc(text)}</span>`;
  }
  function rolePill(user) { return `<span class="role-pill" data-for="${user.id}">${esc(user.roleLabel)}</span>`; }

  /** Pills de statut normalisées */
  const STATUS = {
    'validée': ['Validée', 'ok'], 'en_attente': ['En attente', 'orange'], 'modifs': ['Modifications demandées', 'blue'], 'refusée': ['Refusée', 'red'], 'archivée': ['Archivée', ''],
    'brouillon': ['Brouillon', ''], 'ouverte': ['Ouverte', 'blue'], 'confirmée': ['Confirmée', 'ok'], 'terminée': ['Terminée', 'teal'], 'annulée': ['Annulée', 'red'],
    'payé': ['Payé', 'ok'], 'en_cours': ['En cours', 'blue'], 'validé': ['Validé', 'ok'], 'refusé': ['Refusé', 'red'],
    'actif': ['Actif', 'ok'], 'en_sursis': ['En sursis', 'orange'], 'desactive': ['Désactivé', 'red'],
    'sans_animateur': ['Sans animateur', 'red'], 'sous_effectif': ['Sous-effectif', 'orange'], 'complet': ['Complet', 'teal']
  };
  function statusPill(status) { const s = STATUS[status] || [status, '']; return pill(s[0], s[1], { dot: true }); }

  function eyebrow(num, text) { return `<span class="eyebrow"><span class="num">${esc(num)}</span>${esc(text)}</span>`; }
  /** pageHead({num:'W1', eyebrow:'Before · Mes formations', title, lead, actions:'<button…>'}) */
  function pageHead(o) {
    return `<header class="page-head reveal"><div>${eyebrow(o.num, o.eyebrow)}<h1>${o.titleHtml || esc(o.title)}</h1>${o.lead ? `<p class="lead">${o.lead}</p>` : ''}</div>${o.actions ? `<div class="actions">${o.actions}</div>` : ''}</header>`;
  }
  function stat(o) {
    return `<div class="card stat reveal" ${o.i != null ? `style="--i:${o.i}"` : ''}>${o.icon ? `<div class="row between"><span class="label">${esc(o.label)}</span><span class="icon-chip" style="--accent:${colorVar(o.color || 'blue')};width:34px;height:34px">${icon(o.icon, { cls: 'sm' })}</span></div>` : ''}<span class="num" ${o.liveId ? `id="${o.liveId}" aria-live="polite"` : ''}>${o.num}</span>${o.icon ? '' : `<span class="label">${esc(o.label)}</span>`}${o.sub ? `<span class="sub">${o.sub}</span>` : ''}</div>`;
  }
  /** Jauge min/max d'inscrits */
  function gauge(o) {
    const pct = Math.min(100, Math.round((o.value / o.max) * 100));
    const minPct = Math.round((o.min / o.max) * 100);
    const cls = o.value < o.min ? 'is-low' : o.value >= o.max ? 'is-full' : '';
    return `<div class="gauge ${cls}" style="--pct:${pct}%;--min-pct:${minPct}%" role="meter" aria-valuemin="0" aria-valuemax="${o.max}" aria-valuenow="${o.value}" aria-label="${esc(o.label || 'Inscrits')}">
      <div class="gauge-track"><div class="gauge-fill"></div><div class="gauge-min" data-label="min ${o.min}"></div></div>
      <div class="gauge-legend"><span><b ${o.liveId ? `id="${o.liveId}" aria-live="polite"` : ''}>${o.value}</b> / ${o.max} ${esc(o.unit || 'inscrits')}</span><span>${o.value < o.min ? `encore ${o.min - o.value} pour confirmer` : o.value >= o.max ? 'complet' : `${o.max - o.value} place${o.max - o.value > 1 ? 's' : ''} restante${o.max - o.value > 1 ? 's' : ''}`}</span></div></div>`;
  }
  function progress(pct, opts = {}) { return `<div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}" ${opts.label ? `aria-label="${esc(opts.label)}"` : ''}><span style="--pct:${pct}%"></span></div>`; }
  function stars(value, max = 5) {
    let h = `<span class="stars" role="img" aria-label="${Store.fmtNum(value)} sur ${max}">`;
    for (let i = 1; i <= max; i++) h += icon('star', { cls: i <= Math.round(value) ? '' : 'off' });
    return h + '</span>';
  }
  /** Notation étoiles accessible (radios). name unique, value initiale */
  function rating(name, label, value = 0) {
    let h = `<fieldset class="rating" aria-label="${esc(label)}"><legend class="sr-only">${esc(label)}</legend>`;
    for (let i = 5; i >= 1; i--) {
      h += `<input type="radio" id="${name}-${i}" name="${name}" value="${i}" ${value === i ? 'checked' : ''}><label for="${name}-${i}" title="${i} / 5">${icon('star', { label: `${i} étoile${i > 1 ? 's' : ''} sur 5` })}</label>`;
    }
    return h + '</fieldset>';
  }
  /** Barre de score neutre → teal (jamais de rouge) */
  function scoreBar(value, max = 5) { return `<div class="score-bar"><span style="--pct:${Math.round((value / max) * 100)}%"></span></div>`; }
  function empty(o) {
    return `<div class="empty">${`<span class="icon-chip" style="--accent:${colorVar(o.color || 'blue')}">${icon(o.icon || 'inbox', { cls: 'lg' })}</span>`}<h3>${esc(o.title)}</h3>${o.text ? `<p class="small">${o.text}</p>` : ''}${o.cta || ''}</div>`;
  }
  function banner(o) {
    return `<div class="banner ${o.color || 'blue'} reveal" role="${o.role || 'status'}"><span class="icon-chip">${icon(o.icon || 'info')}</span><div class="grow">${o.html}</div>${o.actions || ''}</div>`;
  }

  /** Courbe de progression personnelle (SVG inline) — points [{label, value}], ref = repère anonymisé */
  function trend(points, opts = {}) {
    const W = opts.width || 560, H = opts.height || 200, pad = { l: 34, r: 16, t: 22, b: 32 };
    const min = opts.min != null ? opts.min : 3.5, max = opts.max != null ? opts.max : 5;
    const inset = 22; const x = (i) => pad.l + inset + (i * (W - pad.l - pad.r - 2 * inset)) / Math.max(1, points.length - 1);
    const y = (v) => pad.t + (1 - (v - min) / (max - min)) * (H - pad.t - pad.b);
    const line = points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(' ');
    const area = `${line} L${x(points.length - 1).toFixed(1)},${H - pad.b} L${x(0).toFixed(1)},${H - pad.b} Z`;
    const gid = 'trendGrad';
    let g = '';
    for (let v = min; v <= max + 0.001; v += 0.5) g += `<line x1="${pad.l}" x2="${W - pad.r}" y1="${y(v)}" y2="${y(v)}" stroke="var(--line)"/><text x="${pad.l - 8}" y="${y(v) + 4}" text-anchor="end">${Store.fmtNum(v)}</text>`;
    const ref = opts.ref != null ? `<line class="t-ref" x1="${pad.l}" x2="${W - pad.r}" y1="${y(opts.ref)}" y2="${y(opts.ref)}"/><text class="t-ref-label" x="${W - pad.r}" y="${y(opts.ref) + 15}" text-anchor="end">${esc(opts.refLabel || 'Repère Academy (anonymisé)')} · ${Store.fmtNum(opts.ref)}</text>` : '';
    const dots = points.map((p, i) => `<circle class="t-dot${i === points.length - 1 ? ' last' : ''}" cx="${x(i)}" cy="${y(p.value)}" r="${i === points.length - 1 ? 5.5 : 4}"><title>${esc(p.label)} : ${Store.fmtNum(p.value)}</title></circle><text class="t-val" x="${x(i)}" y="${y(p.value) - 10}" text-anchor="middle">${Store.fmtNum(p.value)}</text><text x="${x(i)}" y="${H - 10}" text-anchor="middle">${esc(p.label)}</text>`).join('');
    return `<svg class="trend" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(opts.label || 'Évolution')}"><defs><linearGradient id="${gid}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="var(--teal)" stop-opacity=".22"/><stop offset="1" stop-color="var(--teal)" stop-opacity="0"/></linearGradient></defs>${g}${ref}<path class="t-area" d="${area}" fill="url(#${gid})"/><path class="t-line" d="${line}"/>${dots}</svg>`;
  }
  /** Barres horizontales CSS — rows [{label, value, max, display, color}] */
  function bars(rows) {
    return `<div class="bars">${rows.map((r) => `<div class="bar-row"><span class="truncate">${esc(r.label)}</span><div class="bar" role="img" aria-label="${esc(r.label)} : ${esc(r.display || r.value)}"><span style="--pct:${Math.round((r.value / (r.max || 100)) * 100)}%;${r.color ? `--bar-c:${colorVar(r.color)}` : ''}"></span></div><span class="v">${esc(r.display || r.value)}</span></div>`).join('')}</div>`;
  }

  /* ---------- Toasts ---------- */
  function toast(msg, type = 'ok', opts = {}) {
    let root = document.getElementById('toasts');
    if (!root) { root = document.createElement('div'); root.id = 'toasts'; root.className = 'toasts'; root.setAttribute('aria-live', 'polite'); root.setAttribute('role', 'status'); document.body.appendChild(root); }
    const ico = opts.icon || { ok: 'check', warn: 'alert-triangle', error: 'alert-circle', info: 'info', smart: 'sparkles', identity: 'user' }[type] || 'check';
    const t = document.createElement('div');
    t.className = 'toast ' + type;
    t.innerHTML = `<span class="t-ico">${icon(ico, { cls: 'sm' })}</span><span>${msg}</span>`;
    root.appendChild(t);
    setTimeout(() => { t.classList.add('is-leaving'); setTimeout(() => t.remove(), 160); }, opts.duration || 3400);
  }

  /* ---------- Focus trap util ---------- */
  const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])';
  function trap(container, e) {
    const els = [...container.querySelectorAll(FOCUSABLE)].filter((el) => el.offsetParent !== null || el === document.activeElement);
    if (!els.length) return;
    const first = els[0], last = els[els.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
  const overlayStack = [];
  /** Ferme toutes les modales / drawers ouverts (ex. au changement d'utilisateur) */
  function closeAll() { [...overlayStack].reverse().forEach((o) => o.close()); }
  document.addEventListener('keydown', (e) => {
    const top = overlayStack[overlayStack.length - 1];
    if (!top) return;
    if (e.key === 'Escape') { e.preventDefault(); top.close(); }
    else if (e.key === 'Tab') trap(top.el, e);
  });

  /**
   * modal({ title, body (html), foot (html), size:'wide'|'full', onOpen(el, close), onClose() })
   * Retourne { el, close }. Échap ferme. Les boutons [data-close] ferment.
   */
  function modal(o) {
    const prev = document.activeElement;
    const bd = document.createElement('div');
    bd.className = 'modal-backdrop';
    const id = 'm-' + Math.random().toString(16).slice(2, 8);
    bd.innerHTML = `<div class="modal ${o.size || ''}" role="dialog" aria-modal="true" aria-labelledby="${id}">
      <div class="modal-head"><div>${o.eyebrow ? `<span class="eyebrow" style="--phase-accent:${o.accent || 'var(--blue)'}">${esc(o.eyebrow)}</span>` : ''}<h2 id="${id}" ${o.eyebrow ? 'style="margin-top:8px"' : ''}>${esc(o.title)}</h2></div><button class="btn btn-ghost btn-icon btn-sm" data-close aria-label="Fermer">${icon('x')}</button></div>
      <div class="modal-body">${o.body || ''}</div>${o.foot ? `<div class="modal-foot">${o.foot}</div>` : ''}</div>`;
    document.body.appendChild(bd);
    let closed = false;
    const api = {
      el: bd.querySelector('.modal'),
      close() {
        if (closed) return; closed = true;
        overlayStack.splice(overlayStack.indexOf(api), 1);
        bd.classList.add('is-closing'); setTimeout(() => bd.remove(), 150);
        if (o.onClose) o.onClose();
        if (prev && prev.focus) prev.focus();
      }
    };
    overlayStack.push(api);
    bd.addEventListener('click', (e) => { if (e.target === bd || e.target.closest('[data-close]')) api.close(); });
    if (o.onOpen) o.onOpen(api.el, api.close);
    const f = api.el.querySelector('[autofocus]') || api.el.querySelector('.modal-body ' + FOCUSABLE) || api.el.querySelector(FOCUSABLE);
    if (f) setTimeout(() => f.focus(), 30);
    return api;
  }
  function confirm(o) {
    return modal({
      title: o.title, eyebrow: o.eyebrow, body: `<p class="muted">${o.text}</p>`,
      foot: `<button class="btn btn-ghost" data-close>${esc(o.cancel || 'Annuler')}</button><button class="btn ${o.danger ? 'btn-danger' : 'btn-primary'}" data-ok>${esc(o.ok || 'Confirmer')}</button>`,
      onOpen(el, close) { el.querySelector('[data-ok]').addEventListener('click', () => { close(); o.onOk && o.onOk(); }); }
    });
  }

  /** drawer({ title, body, foot, onOpen(el, close), width }) */
  function drawer(o) {
    const prev = document.activeElement;
    const bd = document.createElement('div'); bd.className = 'drawer-backdrop';
    const dr = document.createElement('aside'); dr.className = 'drawer ' + (o.cls || '');
    dr.setAttribute('role', 'dialog'); dr.setAttribute('aria-modal', 'true'); dr.setAttribute('aria-label', o.title);
    if (o.width) dr.style.width = `min(${o.width}px, 100%)`;
    dr.innerHTML = `<div class="drawer-head">${o.headHtml || `<h3>${esc(o.title)}</h3>`}<button class="btn btn-ghost btn-icon btn-sm" data-close aria-label="Fermer">${icon('x')}</button></div><div class="drawer-body">${o.body || ''}</div>${o.foot ? `<div class="drawer-foot">${o.foot}</div>` : ''}`;
    document.body.append(bd, dr);
    let closed = false;
    const api = {
      el: dr,
      close() {
        if (closed) return; closed = true;
        overlayStack.splice(overlayStack.indexOf(api), 1);
        dr.classList.add('is-closing'); bd.classList.add('is-closing');
        setTimeout(() => { dr.remove(); bd.remove(); }, 150);
        if (o.onClose) o.onClose();
        if (prev && prev.focus) prev.focus();
      }
    };
    overlayStack.push(api);
    bd.addEventListener('click', api.close);
    dr.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) api.close(); });
    if (o.onOpen) o.onOpen(dr, api.close);
    const f = dr.querySelector('[autofocus]') || dr.querySelector('.drawer-body ' + FOCUSABLE) || dr.querySelector(FOCUSABLE);
    if (f) setTimeout(() => f.focus(), 30);
    return api;
  }

  /**
   * Onglets accessibles. Markup :
   * <div class="tabs" role="tablist"><button class="tab" role="tab" aria-selected="true" aria-controls="p1" id="t1">…</button>…</div>
   * <div class="tab-panel" role="tabpanel" id="p1" aria-labelledby="t1">…</div>
   * Appeler ui.bindTabs(rootEl, onChange?)
   */
  function bindTabs(root, onChange) {
    root.querySelectorAll('[role="tablist"]').forEach((list) => {
      const tabs = [...list.querySelectorAll('[role="tab"]')];
      const select = (t, focus) => {
        tabs.forEach((x) => { const on = x === t; x.setAttribute('aria-selected', on); x.tabIndex = on ? 0 : -1; const p = root.querySelector('#' + x.getAttribute('aria-controls')); if (p) p.hidden = !on; });
        if (focus) t.focus();
        if (onChange) onChange(t);
      };
      tabs.forEach((t) => {
        t.tabIndex = t.getAttribute('aria-selected') === 'true' ? 0 : -1;
        t.addEventListener('click', () => select(t));
        t.addEventListener('keydown', (e) => {
          const i = tabs.indexOf(t);
          if (e.key === 'ArrowRight') { e.preventDefault(); select(tabs[(i + 1) % tabs.length], true); }
          if (e.key === 'ArrowLeft') { e.preventDefault(); select(tabs[(i - 1 + tabs.length) % tabs.length], true); }
        });
      });
    });
  }
  function tabsHtml(id, items, active) {
    return `<div class="tabs" role="tablist" aria-label="${esc(id)}">${items.map((it) => `<button class="tab" role="tab" id="${id}-t-${it.id}" aria-controls="${id}-p-${it.id}" aria-selected="${it.id === active}" ${it.accent ? `style="--tab-accent:${it.accent}"` : ''}>${it.icon ? icon(it.icon, { cls: 'sm' }) : ''}${esc(it.label)}</button>`).join('')}</div>`;
  }
  function tabPanel(id, itemId, active, html) { return `<div class="tab-panel" role="tabpanel" id="${id}-p-${itemId}" aria-labelledby="${id}-t-${itemId}" ${itemId === active ? '' : 'hidden'}>${html}</div>`; }

  /**
   * Composant chat partagé (W12 / P8 / mobile).
   * chat(el, { convId, me, title, subtitle, quick:[...], autoReply:{from, texts:[...]} })
   */
  function chat(el, o) {
    const conv = () => Store.data.conversations.find((c) => c.id === o.convId);
    const render = () => {
      const c = conv(); if (!c) { el.innerHTML = empty({ icon: 'message-circle', title: 'Aucune conversation' }); return; }
      el.innerHTML = `<div class="chat">
        <div class="chat-head">${c.type === 'group' ? `<span class="icon-chip" style="--accent:var(--purple)">${icon('users')}</span>` : avatar(c.type === 'direct' && o.me === c.trainerId ? c.participantId : c.trainerId)}
          <div class="grow"><b>${esc(o.title || c.title)}</b><div class="dim">${esc(o.subtitle || Store.sessionTitle(Store.session(c.sessionId)))}</div></div></div>
        <div class="chat-body" aria-live="polite">${c.messages.map((m) => {
          const me = m.from === o.me; const p = Store.person(m.from);
          return `<div class="bubble-row ${me ? 'me' : ''}">${me ? '' : avatar(p, { size: 'sm' })}<div><div class="bubble"><span class="who">${esc(p.name)}</span>${esc(m.text)}</div><div class="bubble-time" ${me ? 'style="text-align:right"' : ''}>${Store.fmtRelative(m.at)}</div></div></div>`;
        }).join('')}</div>
        ${o.quick ? `<div class="chat-quick">${o.quick.map((q) => `<button class="chip" data-quick="${esc(q)}">${esc(q)}</button>`).join('')}</div>` : ''}
        <form class="chat-input"><label class="sr-only" for="${o.convId}-in">Votre message</label><input class="input" id="${o.convId}-in" placeholder="Écrire un message…" autocomplete="off"><button class="btn btn-primary btn-icon" aria-label="Envoyer">${icon('send')}</button></form></div>`;
      const body = el.querySelector('.chat-body'); body.scrollTop = body.scrollHeight;
      const send = (text) => {
        if (!text.trim()) return;
        Store.sendMessage(o.convId, o.me, text.trim());
        if (o.autoReply && !Store.state.paused) {
          setTimeout(() => {
            const b = el.querySelector('.chat-body'); if (!b) return;
            b.insertAdjacentHTML('beforeend', `<div class="bubble-row typing-row">${avatar(o.autoReply.from, { size: 'sm' })}<div class="bubble typing"><span></span><span></span><span></span></div></div>`); b.scrollTop = b.scrollHeight;
          }, 500);
          setTimeout(() => { const t = o.autoReply.texts; Store.sendMessage(o.convId, o.autoReply.from, t[Math.floor(Math.random() * t.length)]); }, 2000);
        }
      };
      el.querySelector('form').addEventListener('submit', (e) => { e.preventDefault(); const i = e.target.querySelector('input'); send(i.value); });
      el.querySelectorAll('[data-quick]').forEach((b) => b.addEventListener('click', () => send(b.dataset.quick)));
    };
    render();
    const offFn = Store.on('chat', (p) => { if (p.convId === o.convId) { const inp = el.querySelector('input'); const v = inp ? inp.value : ''; const focused = document.activeElement === inp; render(); if (p.from !== o.me) { const i2 = el.querySelector('input'); i2.value = v; if (focused) i2.focus(); } else { const i2 = el.querySelector('input'); if (i2) i2.focus(); } } });
    return offFn; // à appeler au démontage (ctx.on gère cela si on passe par ctx.track)
  }

  /** Révèle les éléments .reveal avec stagger (40 ms) */
  function stagger(root) { root.querySelectorAll('.reveal').forEach((el, i) => { if (!el.style.getPropertyValue('--i')) el.style.setProperty('--i', Math.min(i, 12)); }); }

  /** Logo Sofrecom (placeholder vectoriel — logo officiel à fournir, §11 q.3) */
  function logo(opts = {}) {
    return `<a class="sf-logo ${opts.dark ? 'on-dark' : ''}" href="${opts.href || 'index.html'}" aria-label="Sofrecom Academy — accueil">
      <svg class="sf-mark" viewBox="0 0 32 32" aria-hidden="true"><defs><linearGradient id="sfm${opts.dark ? 'd' : ''}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0078BA"/><stop offset=".5" stop-color="#00A3E4"/><stop offset="1" stop-color="#21BCB9"/></linearGradient></defs><rect width="32" height="32" rx="9" fill="${opts.dark ? '#fff' : `url(#sfm${opts.dark ? 'd' : ''})`}"/><path d="M21.5 11.2c-1.2-1.3-3-2-5.1-2-3.1 0-5.2 1.6-5.2 3.9 0 2.2 1.6 3.2 4.7 3.8 2.3.5 3 .9 3 1.8 0 1-1 1.6-2.6 1.6-1.7 0-3.1-.7-4.1-1.9l-2 1.9c1.3 1.7 3.5 2.6 6 2.6 3.4 0 5.6-1.7 5.6-4.2 0-2.3-1.5-3.4-4.9-4-2.1-.4-2.8-.8-2.8-1.6 0-.9.9-1.4 2.3-1.4 1.3 0 2.5.5 3.3 1.3z" fill="${opts.dark ? '#21527C' : '#fff'}"/><circle cx="24.5" cy="23.5" r="2.5" fill="#C1D72F"/></svg>
      <span><span class="sf-word">sofrecom</span><span class="sf-sub">${esc(opts.sub || 'Academy')}</span></span></a>`;
  }

  window.ui = { closeAll, icon, esc, avatar, avatarStack, pill, rolePill, statusPill, eyebrow, pageHead, stat, gauge, progress, stars, rating, scoreBar, empty, banner, trend, bars, toast, modal, confirm, drawer, bindTabs, tabsHtml, tabPanel, chat, stagger, logo, colorVar, ICONS: P };
})();
