/* =====================================================================
   APP — shell du portail (C0 connexion, C1 sidebar + topbar, C2 notifs),
   router hash avec filtrage par rôle (simulation de droits, pas de sécurité).
   Les écrans s'enregistrent via App.view({...}) dans js/views-*.js
   ===================================================================== */
(function () {
  const { icon, esc, avatar, rolePill, toast } = window.ui;

  /* ---------- Menu par rôle (MENU[role]) ---------- */
  const MENU = {
    formateur: [
      { group: null, phase: 'hub', items: [{ label: 'Tableau de bord', icon: 'dashboard', href: '#/f/dashboard' }] },
      { group: 'Before', phase: 'before', items: [
        { label: 'Mes formations', icon: 'book-open', href: '#/before/formations' },
        { label: 'Inscriptions en direct', icon: 'users', href: '#/before/session/s-cloud5g-1124', match: '#/before/session' },
        { label: 'Mes disponibilités', icon: 'calendar-check', href: '#/before/dispos' },
        { label: 'Sessions ouvertes', icon: 'calendar-plus', href: '#/before/sessions-ouvertes', count: () => Store.openSessions().length },
        { label: 'Proposer une formation', icon: 'lightbulb', href: '#/before/proposer' },
        { label: 'Contenu & quiz', icon: 'file-text', href: '#/before/contenu' },
        { label: 'Calendrier', icon: 'calendar', href: '#/before/calendrier' }
      ] },
      { group: 'During', phase: 'during', items: [{ label: 'Mode séance', icon: 'monitor', href: '#/during/seance' }] },
      { group: 'After', phase: 'after', items: [
        { label: 'Ma progression', icon: 'trending-up', href: '#/after/progression' },
        { label: 'Vouchers', icon: 'ticket', href: '#/after/vouchers', count: () => Store.data.vouchers.filter((v) => v.status === 'en_attente').length }
      ] },
      { group: 'Transverse', phase: 'transverse', items: [
        { label: 'Chat participants', icon: 'message-circle', href: '#/transverse/chat' },
        { label: 'Mon badge', icon: 'award', href: '#/transverse/badge' },
        { label: 'Paiements', icon: 'banknote', href: '#/transverse/paiements' },
        { label: 'Catalogue', icon: 'grid', href: '#/catalogue' }
      ] }
    ],
    participant: [
      { group: null, phase: 'participant', items: [
        { label: 'Accueil', icon: 'home', href: '#/p/accueil' },
        { label: 'Catalogue', icon: 'search', href: '#/catalogue' },
        { label: 'Ma session', icon: 'monitor', href: '#/p/session' },
        { label: 'Évaluations', icon: 'star', href: '#/p/evaluation' },
        { label: 'Badges & certifications', icon: 'award', href: '#/p/badges' },
        { label: 'Chat formateur', icon: 'message-circle', href: '#/p/chat' }
      ] }
    ],
    observateur: [
      { group: null, phase: 'pilotage', items: [{ label: 'Cockpit', icon: 'dashboard', href: '#/o/cockpit' }] },
      { group: 'Pilotage', phase: 'pilotage', items: [
        { label: 'Formations à valider', icon: 'clipboard-check', href: '#/o/validation', count: () => Store.data.proposals.filter((p) => p.status === 'en_attente').length },
        { label: 'Formateurs à risque', icon: 'alert-triangle', href: '#/o/risques' },
        { label: 'Sessions & remplissage', icon: 'users', href: '#/o/sessions' },
        { label: 'Facturation', icon: 'banknote', href: '#/o/paiements' }
      ] },
      { group: 'Qualité & badges', phase: 'pilotage', items: [
        { label: 'Qualité', icon: 'trending-up', href: '#/o/qualite' },
        { label: 'Gouvernance badges', icon: 'award', href: '#/o/badges' },
        { label: 'Catalogue', icon: 'grid', href: '#/catalogue' }
      ] }
    ]
  };

  /* ---------- Registre des vues ---------- */
  const views = [];
  let current = null; // { view, ctx }

  function compile(path) {
    const keys = [];
    const re = new RegExp('^' + path.replace(/:[a-zA-Z]+/g, (m) => { keys.push(m.slice(1)); return '([^/]+)'; }) + '$');
    return { re, keys };
  }

  const App = {
    MENU,
    /**
     * App.view({ id:'W1', path:'/f/dashboard', roles:['formateur'], phase:'hub', title:'Tableau de bord', render(el, ctx) })
     * ctx = { params, user, role, scenario, on(topic, fn), every(ms, fn), refresh(), el }
     */
    view(def) { def._m = compile(def.path); views.push(def); },
    go(hash) { if (location.hash === hash) render(); else location.hash = hash; },
    refresh() { render({ keepScroll: true }); },
    get user() { return Store.user; },
    get role() { return Store.role; },
    get scenario() { return Store.state.scenario; },
    openSmartAssist: null, // défini par views-formateur-after.js (W15)
    switchUser
  };
  window.App = App;

  function match(hash) {
    const [path0, qs] = ((hash || '').replace(/^#/, '') || '/').split('?');
    const path = path0 || '/';
    for (const v of views) {
      const m = path.match(v._m.re);
      if (m) { const params = {}; v._m.keys.forEach((k, i) => (params[k] = decodeURIComponent(m[i + 1]))); params.query = Object.fromEntries(new URLSearchParams(qs || '')); return { view: v, params }; }
    }
    return null;
  }

  /* ---------- Rendu ---------- */
  function render(opts = {}) {
    const user = Store.user;
    if (!user) { renderLogin(); return; }
    ensureShell();
    const found = match(location.hash);
    if (!found) {
      if (location.hash.split('?')[0] !== user.home) { location.replace(user.home); return; }
      const main = document.getElementById('view');
      main.innerHTML = window.ui.empty({ icon: 'compass', title: 'Écran à venir', text: 'Cet écran n\'est pas encore implémenté dans la maquette.' });
      return;
    }
    const { view, params } = found;

    // nettoyage de la vue précédente
    if (current && current.ctx) current.ctx._cleanup();

    const main = document.getElementById('view');
    const scrollY = window.scrollY;
    main.innerHTML = '';
    const section = document.createElement('section');
    section.dataset.view = view.id;
    section.dataset.roles = view.roles.join(',');
    section.dataset.phase = view.phase || 'hub';
    document.querySelector('.main').dataset.phase = view.phase || 'hub';
    main.appendChild(section);

    if (!view.roles.includes(user.role)) {
      section.dataset.phase = 'commun';
      section.innerHTML = `<div class="restricted">${window.ui.empty({ icon: 'lock', color: 'orange', title: 'Écran réservé', text: `Cet écran (« ${esc(view.title)} ») n'est pas accessible avec le rôle <b>${esc(user.roleLabel)}</b>. <br>Simulation de droits — maquette.`, cta: `<a class="btn btn-primary mt-2" href="${user.home}">Revenir à mon accueil</a>` })}</div>`;
      current = { view, ctx: makeCtx(section, params) };
      updateNav();
      return;
    }

    const ctx = makeCtx(section, params);
    current = { view, ctx };
    try { view.render(section, ctx); }
    catch (e) { console.error(e); section.innerHTML = window.ui.empty({ icon: 'alert-circle', color: 'red', title: 'Erreur d\'affichage (maquette)', text: esc(e.message) }); }
    window.ui.stagger(section);
    document.title = `${view.title} · Sofrecom Academy`;
    updateNav();
    if (opts.keepScroll) window.scrollTo(0, scrollY); else window.scrollTo(0, 0);
    document.body.classList.remove('nav-open');
  }

  function makeCtx(el, params) {
    const subs = []; const timers = [];
    return {
      el, params,
      get user() { return Store.user; }, get role() { return Store.role; }, get scenario() { return Store.state.scenario; },
      /** S'abonner à un topic du Store, désabonné automatiquement au changement d'écran */
      on(topic, fn) { subs.push(Store.on(topic, fn)); },
      /** Enregistrer une fonction de nettoyage (ex. retour de ui.chat) */
      track(offFn) { if (typeof offFn === 'function') subs.push(offFn); },
      /** Timer de simulation : ignoré si « Pause démo » */
      every(ms, fn) { timers.push(setInterval(() => { if (!Store.state.paused) fn(); }, ms)); },
      refresh() { render({ keepScroll: true }); },
      _cleanup() { subs.forEach((off) => off()); timers.forEach(clearInterval); }
    };
  }

  /* ---------- Shell (C1) ---------- */
  function ensureShell() {
    const root = document.getElementById('root');
    if (root.dataset.mode === 'shell' && root.dataset.user === Store.user.id) { updateTopbar(); return; }
    root.dataset.mode = 'shell'; root.dataset.user = Store.user.id;
    document.body.dataset.user = Store.user.id;
    root.innerHTML = `
      <a class="sr-only" href="#view" id="skip">Aller au contenu</a>
      <div class="app stage-bg">
        <aside class="sidebar" aria-label="Navigation principale">
          ${window.ui.logo({ href: 'index.html' })}
          <nav id="nav"></nav>
          <div class="sidebar-foot">
            <a class="connect-cta" href="mobile.html">${icon('smartphone')}<span>LET'S CONNECT!<small>Ouvrir l'app communauté</small></span></a>
          </div>
        </aside>
        <div class="main">
          <header class="topbar" id="topbar"></header>
          <main id="view" class="content" tabindex="-1"></main>
        </div>
      </div>
      <div class="sf-bar" aria-hidden="true"></div>`;
    renderNav();
    renderTopbar();
  }

  function renderNav() {
    const nav = document.getElementById('nav'); if (!nav) return;
    const groups = MENU[Store.role] || [];
    nav.innerHTML = groups.map((g) => `<div class="nav-group" data-phase="${g.phase}">${g.group ? `<div class="nav-group-label"><span class="dot"></span>${esc(g.group)}</div>` : ''}
      ${g.items.map((it) => { const c = it.count ? it.count() : 0; return `<a class="nav-item" href="${it.href}" data-match="${it.match || it.href}">${icon(it.icon)}<span>${esc(it.label)}</span>${c ? `<span class="count" aria-label="${c} en attente">${c}</span>` : ''}</a>`; }).join('')}</div>`).join('');
    updateNav();
  }
  function updateNav() {
    const h = location.hash;
    document.querySelectorAll('#nav .nav-item').forEach((a) => {
      const m = a.dataset.match;
      const hp = h.split('?')[0];
      const on = hp === m || hp.startsWith(m + '/');
      if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
  }

  function renderTopbar() {
    const u = Store.user; const tb = document.getElementById('topbar'); if (!tb) return;
    const unread = Store.unreadCount(u.id);
    tb.innerHTML = `
      <button class="tb-btn menu-toggle" id="menuToggle" aria-label="Ouvrir le menu">${icon('menu')}</button>
      <form class="search input-icon" role="search" id="tbSearch">${icon('search', { cls: 'sm' })}<label class="sr-only" for="q">Rechercher</label><input class="input" id="q" placeholder="Rechercher une formation, une session…" autocomplete="off"></form>
      <div class="tb-spacer"></div>
      <div class="tb-tools">
        <div class="demo-tools" title="Outils de démonstration (maquette)">
          <span class="lbl">Démo</span>
          <label class="sr-only" for="scenario">Scénario</label>
          <select class="select" id="scenario" aria-label="Scénario d'affichage">
            <option value="normal" ${Store.state.scenario === 'normal' ? 'selected' : ''}>Scénario : normal</option>
            <option value="alerte" ${Store.state.scenario === 'alerte' ? 'selected' : ''}>Scénario : alerte</option>
            <option value="vide" ${Store.state.scenario === 'vide' ? 'selected' : ''}>Scénario : vide</option>
          </select>
          <label class="switch" title="Gèle la simulation temps réel"><input type="checkbox" id="pauseDemo" ${Store.state.paused ? 'checked' : ''}><span>Pause démo</span></label>
        </div>
        ${u.role === 'formateur' ? `<button class="btn btn-sm assist-btn" id="assistBtn">${icon('sparkles', { cls: 'sm' })}<span>Smart Assist</span></button>` : ''}
        <button class="tb-btn" id="bellBtn" aria-label="Notifications${unread ? ` (${unread} non lues)` : ''}" aria-haspopup="true">${icon('bell')}${unread ? `<span class="badge-count">${unread}</span>` : ''}</button>
        <button class="user-switch" id="userBtn" aria-haspopup="true" aria-label="Changer d'utilisateur — connecté en tant que ${esc(u.name)}, ${esc(u.roleLabel)}">
          ${avatar(u, { ring: true })}<span class="meta"><b>${esc(u.name)}</b>${rolePill(u)}</span>${icon('chevron-down', { cls: 'sm' })}
        </button>
      </div>`;
    tb.querySelector('#menuToggle').addEventListener('click', () => document.body.classList.toggle('nav-open'));
    tb.querySelector('#scenario').addEventListener('change', (e) => { Store.setScenario(e.target.value); toast(`Scénario « ${e.target.value} » appliqué`, 'info', { icon: 'layers' }); App.refresh(); });
    tb.querySelector('#pauseDemo').addEventListener('change', (e) => { Store.setPaused(e.target.checked); toast(e.target.checked ? 'Simulation temps réel en pause' : 'Simulation temps réel relancée', 'info', { icon: e.target.checked ? 'pause' : 'play' }); });
    tb.querySelector('#bellBtn').addEventListener('click', (e) => openNotifications(e.currentTarget));
    tb.querySelector('#userBtn').addEventListener('click', (e) => openUserSwitcher(e.currentTarget));
    tb.querySelector('#tbSearch').addEventListener('submit', (e) => { e.preventDefault(); const q = tb.querySelector('#q').value.trim(); App.go('#/catalogue' + (q ? '?q=' + encodeURIComponent(q) : '')); });
    const ab = tb.querySelector('#assistBtn');
    if (ab) ab.addEventListener('click', () => { if (App.openSmartAssist) App.openSmartAssist(); else toast('Smart Assist arrive bientôt', 'smart'); });
  }
  function updateTopbar() {
    const u = Store.user; const bell = document.getElementById('bellBtn'); if (!bell) return;
    const unread = Store.unreadCount(u.id);
    bell.setAttribute('aria-label', `Notifications${unread ? ` (${unread} non lues)` : ''}`);
    const b = bell.querySelector('.badge-count');
    if (unread) { if (b) b.textContent = unread; else bell.insertAdjacentHTML('beforeend', `<span class="badge-count">${unread}</span>`); }
    else if (b) b.remove();
  }

  /* ---------- Popovers ---------- */
  let openPop = null;
  function closePop() { if (openPop) { openPop.el.remove(); document.removeEventListener('mousedown', openPop.outside); document.removeEventListener('keydown', openPop.esc); const t = openPop.trigger; openPop = null; t && t.focus(); } }
  function popover(trigger, html, onBind) {
    closePop();
    const r = trigger.getBoundingClientRect();
    const el = document.createElement('div'); el.className = 'popover'; el.innerHTML = html; el.setAttribute('role', 'dialog');
    document.body.appendChild(el);
    const w = el.offsetWidth;
    el.style.top = (r.bottom + window.scrollY + 8) + 'px';
    el.style.left = Math.max(12, Math.min(window.innerWidth - w - 12, r.right - w)) + 'px';
    el.style.position = 'absolute';
    const outside = (e) => { if (!el.contains(e.target) && !trigger.contains(e.target)) closePop(); };
    const esc = (e) => { if (e.key === 'Escape') closePop(); };
    setTimeout(() => { document.addEventListener('mousedown', outside); document.addEventListener('keydown', esc); }, 0);
    openPop = { el, outside, esc, trigger };
    if (onBind) onBind(el);
    const f = el.querySelector('button, a'); if (f) f.focus();
  }

  /** C2 — Notifications (contenu dépendant du rôle) */
  function openNotifications(trigger) {
    const u = Store.user; const list = Store.notificationsOf(u.id);
    popover(trigger, `<div class="pop-head row between"><span>Notifications</span>${list.some((n) => !n.read) ? '<button class="btn btn-ghost btn-sm" data-readall>Tout marquer comme lu</button>' : ''}</div>
      <div style="max-height:420px;overflow:auto;width:360px">${list.length ? list.map((n) => `<a class="notif-item ${n.read ? '' : 'unread'}" href="${n.route || '#'}" data-nid="${n.id}"><span class="icon-chip" style="--accent:var(--identity);width:34px;height:34px">${icon(n.icon || 'bell', { cls: 'sm' })}</span><div><div class="small">${esc(n.text)}</div><div class="when">${Store.fmtRelative(n.at)}</div></div></a>`).join('') : '<p class="dim" style="padding:16px">Aucune notification.</p>'}</div>`,
      (el) => {
        el.querySelectorAll('[data-nid]').forEach((a) => a.addEventListener('click', () => { const n = list.find((x) => x.id === a.dataset.nid); if (n) n.read = true; Store.save(); closePop(); updateTopbar(); }));
        const ra = el.querySelector('[data-readall]'); if (ra) ra.addEventListener('click', () => { Store.markNotificationsRead(u.id); closePop(); updateTopbar(); });
      });
  }

  /** Sélecteur d'utilisateur (3 comptes de démo) */
  function openUserSwitcher(trigger) {
    const users = Object.values(Store.data.users);
    popover(trigger, `<div class="pop-head">Se connecter en tant que…</div>
      ${users.map((u) => `<button class="pop-item" data-uid="${u.id}" aria-current="${u.id === Store.user.id}">${avatar(u, { ring: u.id === Store.user.id })}<div class="grow"><b>${esc(u.fullName)}</b> ${rolePill(u)}<div class="desc">${esc(u.title)}</div></div>${u.id === Store.user.id ? icon('check', { cls: 'sm' }) : ''}</button>`).join('')}
      <hr class="divider">
      <button class="pop-item" data-act="mobile">${icon('smartphone')}<span>Ouvrir LET'S CONNECT! (mobile)</span></button>
      <button class="pop-item" data-act="reset">${icon('rotate-ccw')}<span>Réinitialiser la démo</span></button>
      <button class="pop-item" data-act="logout">${icon('log-out')}<span>Revenir à l'écran de connexion</span></button>`,
      (el) => {
        el.querySelectorAll('[data-uid]').forEach((b) => b.addEventListener('click', () => { closePop(); switchUser(b.dataset.uid); }));
        el.querySelector('[data-act="mobile"]').addEventListener('click', () => { location.href = 'mobile.html'; });
        el.querySelector('[data-act="reset"]').addEventListener('click', () => { closePop(); window.ui.confirm({ title: 'Réinitialiser la démo ?', text: 'Toutes les actions effectuées (inscriptions, validations, paiements…) seront effacées et les données de départ restaurées.', ok: 'Réinitialiser', danger: true, onOk() { Store.reset(); toast('Démo réinitialisée', 'ok', { icon: 'rotate-ccw' }); renderNav(); App.go(Store.user.home); App.refresh(); } }); });
        el.querySelector('[data-act="logout"]').addEventListener('click', () => { closePop(); Store.setUser(null); location.hash = ''; render(); });
      });
  }

  function switchUser(id, opts = {}) {
    const u = Store.data.users[id]; if (!u) return;
    const changed = !Store.user || Store.user.id !== id;
    if (changed) { window.ui.closeAll(); closePop(); }
    Store.setUser(id);
    document.body.dataset.user = id;
    const root = document.getElementById('root'); root.dataset.user = ''; // force re-render shell
    if (opts.route) location.hash = opts.route;
    else if (!match(location.hash) || !match(location.hash).view.roles.includes(u.role)) location.hash = u.home;
    render();
    if (changed) toast(`Vous êtes maintenant <b>${esc(u.name)}</b> — ${esc(u.roleLabel)}`, 'identity', { icon: 'user' });
  }

  /* ---------- C0 — Connexion / choix du profil ---------- */
  function renderLogin() {
    const root = document.getElementById('root');
    root.dataset.mode = 'login'; root.dataset.user = '';
    document.body.dataset.user = '';
    document.title = 'Connexion · Sofrecom Academy';
    const accents = { participant: 'var(--cyan)', formateur: 'var(--blue)', observateur: 'var(--purple)' };
        root.innerHTML = `<div class="login">
      <div class="login-top">${window.ui.logo({ dark: true, href: 'index.html' })}<a class="btn btn-sm" style="background:rgba(255,255,255,.1);border-color:rgba(255,255,255,.3);color:#fff" href="index.html">${icon('arrow-left', { cls: 'sm' })} Hub de démo</a></div>
      <div class="login-hero reveal">
        <span class="eyebrow"><span class="num">C0</span>Trainer's Day · 3ᵉ édition · Maquette</span>
        <h1>Sofrecom Academy, <em>un portail pour chaque rôle.</em></h1>
        <p class="lead">Choisissez un compte de démonstration. Les trois profils partagent la même session fil rouge « Cloud &amp; 5G — 24 nov. 2026 » : chaque action d'un rôle est visible chez les autres.</p>
      </div>
      <div class="login-cards">
        ${Object.values(Store.data.users).map((u, i) => `<article class="value-card reveal" style="--accent:${accents[u.role]};--i:${i + 1}">
          <div class="row">${avatar(u, { size: 'lg', ring: true })}<div><h3>${esc(u.fullName)}</h3><div class="row" style="gap:8px;margin-top:4px">${rolePill(u)}<span class="dim">${esc(u.title)}</span></div></div></div>
          <p class="quote">${esc(u.pitch)}</p>
          <ul>${u.demo.map((d) => `<li>${icon('check')}<span>${esc(d)}</span></li>`).join('')}</ul>
          <button class="btn btn-primary btn-lg btn-block" data-login="${u.id}" style="${u.role === 'observateur' ? 'background:var(--purple-ink);border-color:var(--purple-ink)' : u.role === 'participant' ? 'background:var(--cyan-ink);border-color:var(--cyan-ink)' : ''}">Se connecter en tant que ${esc(u.name.split(' ')[0])} ${icon('arrow-right', { cls: 'sm' })}</button>
        </article>`).join('')}
      </div>
      <div class="login-foot"><button class="sso-btn" id="sso"><span class="sq" aria-hidden="true"></span>Connexion SSO groupe Orange</button><span>Bouton décoratif — aucune authentification réelle (maquette).</span></div>
    </div><div class="sf-bar" aria-hidden="true"></div>`;
    root.querySelectorAll('[data-login]').forEach((b) => b.addEventListener('click', () => switchUser(b.dataset.login)));
    root.querySelector('#sso').addEventListener('click', () => toast('SSO décoratif : choisissez un compte de démo ci-dessus', 'info', { icon: 'lock' }));
    window.ui.stagger(root);
  }

  /* ---------- Réactivité globale ---------- */
  Store.on('notifications', () => updateTopbar());
  Store.on('change', (p) => {
    if (!Store.user) return;
    updateTopbar();
    // badges de comptage dans la sidebar
    if (['proposals', 'vouchers', 'sessions', 'reset', 'sync'].includes(p.topic)) renderNav();
    if (p.topic === 'sync' && current && current.view && !current.view.noAutoRefresh) render({ keepScroll: true });
  });

  /* Tick de simulation temps réel (~8 s), désactivable via « Pause démo » */
  setInterval(() => { if (!Store.state.paused && Store.user) Store.emit('tick'); }, 8000);

  window.addEventListener('hashchange', () => render());
  /* Mobile : clic hors du menu latéral → fermeture */
  document.addEventListener('click', (e) => { if (document.body.classList.contains('nav-open') && !e.target.closest('.sidebar') && !e.target.closest('#menuToggle')) document.body.classList.remove('nav-open'); });
  document.addEventListener('DOMContentLoaded', () => {
    // ?as=karim permet d'ouvrir directement un rôle (liens du hub)
    const as = new URLSearchParams(location.search).get('as');
    if (as && Store.data.users[as] && (!Store.user || Store.user.id !== as)) { Store.setUser(as); if (!location.hash) location.hash = Store.data.users[as].home; }
    render();
  });
})();
