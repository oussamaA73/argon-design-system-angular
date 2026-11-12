/* =====================================================================
   App mobile LET'S CONNECT! — router hash, écrans M1–M8, bottom sheets.
   Données partagées avec le portail via Store (localStorage). MOCK : aucune API.
   ===================================================================== */
(function () {
  const { icon, esc, avatar, avatarStack, toast } = window.ui;
  const $ = (s, r = document) => r.querySelector(s);
  const ONB_KEY = 'sfa-mobile-onboarded';
  const ROLE_LABEL = { formateur: 'Formateur', observateur: 'Observateur', participant: 'Participant' };
  const ROLE_COLOR = { formateur: 'blue', observateur: 'purple', participant: 'cyan' };
  const FILTERS = [
    ['all', 'Tous'], ['bonne_pratique', 'Bonnes pratiques'], ['ressource', 'Ressources'], ['entraide', 'Entraide'], ['annonce', 'Annonces Academy']
  ];
  const TYPE_PILL = { annonce: ['Annonce Academy', 'purple'], bonne_pratique: ['Bonne pratique', 'green'], ressource: ['Ressource', 'cyan'], question: ['Question', 'orange'], entraide: ['Entraide', 'purple'] };
  const ENT_KIND = { 'co-animation': 'Co-animation', remplacement: 'Remplacement', question: 'Question ouverte' };
  const MOCK_FILES = [
    { title: 'Retour d\'expérience — atelier 5G', kind: 'pdf', file: 'Retour-atelier-5G.pdf' },
    { title: 'Kit d\'animation — cas fil rouge', kind: 'zip', file: 'Kit-animation.zip' },
    { title: 'Grille d\'observation des ateliers', kind: 'xlsx', file: 'Grille-observation.xlsx' }
  ];

  const state = { filter: 'all', panel: null, sheet: null };
  let navCount = 0;

  /* ---------- Utilisateur ---------- */
  if (!Store.user) Store.setUser('karim');
  const me = () => Store.user || Store.data.users.karim;
  const roleOf = (id) => { const p = Store.person(id); return p.role || p.kind || 'participant'; };
  const rolePill = (id) => { const r = roleOf(id); return `<span class="pill m-role ${ROLE_COLOR[r] || ''}">${ROLE_LABEL[r] || ''}</span>`; };
  const upcoming = (s) => s.status !== 'terminée' && s.date >= window.SFA_TODAY;
  const sortByDate = (a, b) => a.date.localeCompare(b.date);

  /* Notification « dernière minute » (mock) : complète les données pour la démo */
  function seed() {
    const k = Store.data.notifications.karim = Store.data.notifications.karim || [];
    if (!k.some((n) => n.id === 'n-m-lastmin')) k.push({ id: 'n-m-lastmin', icon: 'user-plus', text: 'Inscription de dernière minute : Hatem Z. s\'est inscrit à « Cloud & 5G » (24 nov.)', at: '2026-11-12T08:10', route: '#/before/session/s-cloud5g-1124', read: false });
    const l = Store.data.notifications.leila = Store.data.notifications.leila || [];
    if (!l.some((n) => n.id === 'n-m-lastmin')) l.push({ id: 'n-m-lastmin', icon: 'user-plus', text: 'Inscription de dernière minute : « Cloud & 5G » compte désormais 9 inscrits (min. 6)', at: '2026-11-12T08:10', route: '#/o/sessions', read: true });
  }

  /* ---------- Contexte desktop ---------- */
  $('#m-logo').innerHTML = ui.logo({ href: 'index.html' });
  $('#m-link-portail').innerHTML = `${icon('external-link', { cls: 'sm' })}Ouvrir le portail web`;
  $('#m-link-hub').innerHTML = `${icon('layers', { cls: 'sm' })}Hub de démo`;

  /* ---------- Fragments ---------- */
  const markSvg = () => icon('users', { cls: 'lg' });
  const bellBtn = () => {
    const n = Store.unreadCount(me().id);
    return `<a class="m-iconbtn" href="#/notifs" aria-label="Notifications${n ? ` (${n} non lue${n > 1 ? 's' : ''})` : ''}">${icon('bell', { cls: 'lg' })}${n ? `<span class="m-badge" aria-hidden="true">${n}</span>` : ''}</a>`;
  };
  const backBtn = (label) => `<button class="m-iconbtn" data-act="back" aria-label="${esc(label || 'Retour')}">${icon('arrow-left', { cls: 'lg' })}</button>`;
  const head = (title, o = {}) => `<header class="m-head">
    <div class="m-head-row">${o.back ? backBtn(o.back) : ''}<h1>${esc(title)}</h1>${o.right === undefined ? bellBtn() : o.right}</div>
    ${o.sub ? `<p class="m-sub">${o.sub}</p>` : ''}</header>`;
  const fileIcon = (k) => (k === 'zip' ? 'folder' : k === 'xlsx' ? 'grid' : 'file-text');

  /* ---------- Posts ---------- */
  function resourceCard(p, mode) {
    if (!p.resource) return '';
    const saved = p.savedBy.includes(me().id);
    return `<div class="m-resource stacked">
      <span class="icon-chip">${icon(fileIcon(p.resource.kind), { cls: 'lg' })}</span>
      <div class="r-main"><div class="r-title">${esc(p.resource.title)}</div><div class="r-meta">${esc((p.resource.kind || 'fichier').toUpperCase())} · ressource jointe</div></div>
      <button class="btn btn-sm m-save" data-act="save" data-id="${p.id}" aria-pressed="${saved}" aria-label="${saved ? 'Ressource enregistrée' : 'Enregistrer la ressource'} : ${esc(p.resource.title)}">${icon(saved ? 'check' : 'bookmark', { cls: 'sm' })}${saved ? 'Enregistrée' : 'Enregistrer la ressource'}</button>
    </div>`;
  }

  function postHtml(p, mode) {
    const u = me(), a = Store.person(p.authorId), liked = p.reactedBy.includes(u.id);
    const tp = TYPE_PILL[p.type];
    const pills = [];
    if (tp && !p.pinned) pills.push(`<span class="pill ${tp[1]}">${tp[0]}</span>`);
    if (p.fromRate) pills.push(`<span class="pill teal">${icon('sparkles', { cls: 'sm' })}Issu de LET'S RATE!</span>`);
    const cover = p.pinned ? `<div class="m-cover"><span class="m-cover-mark">${icon('megaphone', { cls: 'lg' })}</span><span class="label">${icon('pin', { cls: 'sm' })}Épinglé</span><strong>Annonce officielle · Sofrecom Academy</strong></div>` : '';
    return `<article class="post m-post ${mode === 'feed' ? 'is-feed is-link' : ''} ${p.pinned ? 'is-pinned' : ''} reveal" data-id="${p.id}" data-open="${mode === 'feed' ? p.id : ''}">
      ${cover}
      <div class="post-head">${avatar(a, { size: 'lg', title: false })}
        <div class="who"><div class="name">${esc(a.fullName || a.name)}${rolePill(p.authorId)}</div><div class="when">${esc(Store.fmtRelative(p.at))}</div></div></div>
      ${pills.length ? `<div class="m-pills">${pills.join('')}</div>` : ''}
      <div class="post-body">${esc(p.text)}</div>
      ${resourceCard(p, mode)}
      <div class="post-actions">
        <button data-act="react" data-id="${p.id}" aria-pressed="${liked}" aria-label="${liked ? 'Retirer ma réaction' : 'Réagir'} (${p.reactions})">${icon('thumbs-up')}<span class="cnt">${p.reactions}</span></button>
        ${mode === 'feed' ? `<button data-act="open-post" data-id="${p.id}" aria-label="Commentaires (${p.comments.length})">${icon('message-circle')}<span class="cnt">${p.comments.length}</span></button>` : `<span class="m-note" style="align-self:center;padding:0 8px">${p.comments.length} commentaire${p.comments.length > 1 ? 's' : ''}</span>`}
        <button data-act="share" data-id="${p.id}" aria-label="Partager">${icon('share')}<span>Partager</span></button>
      </div></article>`;
  }

  /* ---------- M2 Fil ---------- */
  function viewFil() {
    const f = state.filter, posts = Store.data.posts;
    const match = (p) => f === 'all' || (f === 'bonne_pratique' && p.type === 'bonne_pratique') ||
      (f === 'ressource' && (p.type === 'ressource' || (p.resource && p.type !== 'annonce'))) ||
      (f === 'entraide' && (p.type === 'question' || p.type === 'entraide')) || (f === 'annonce' && p.type === 'annonce');
    const list = [...posts.filter((p) => p.pinned && match(p)), ...posts.filter((p) => !p.pinned && match(p))];
    let body = '';
    if (f === 'entraide') {
      body += `<div class="m-section-title">${icon('hand-heart')}LET'S SHARE! · appels en cours</div>` + Store.data.entraide.slice(0, 3).map(entCard).join('') +
        `<a class="btn btn-soft-purple" href="#/entraide">Voir toute l'entraide${icon('arrow-right', { cls: 'sm' })}</a>`;
    }
    body += list.length ? list.map((p) => postHtml(p, 'feed')).join('') : (f === 'entraide' ? '' : ui.empty({ icon: 'inbox', title: 'Rien ici pour le moment', text: 'Soyez le premier à publier dans cette catégorie.', color: 'purple' }));
    return {
      sb: 'light', tab: 'fil',
      html: `<header class="m-hero"><div class="m-hero-row"><span class="m-hero-mark">${markSvg()}</span><div class="grow"><h1>LET'S CONNECT!</h1><p>La communauté des formateurs Sofrecom Academy</p></div>${bellBtn()}</div></header>
      <div class="m-chips" role="toolbar" aria-label="Filtrer le fil">${FILTERS.map(([id, l]) => `<button class="chip" data-act="filter" data-v="${id}" aria-pressed="${f === id}">${l}</button>`).join('')}</div>
      <div class="m-body">${body}</div>`
    };
  }

  /* ---------- M3 Détail ---------- */
  function viewPost(id) {
    const p = Store.data.posts.find((x) => x.id === id);
    if (!p) return null;
    const comments = p.comments.map((c) => {
      const a = Store.person(c.authorId);
      return `<div class="m-comment">${avatar(a, { title: false })}<div class="m-bubble"><div class="name">${esc(a.name)}${rolePill(c.authorId)}<span class="when">${esc(Store.fmtRelative(c.at))}</span></div><p>${esc(c.text)}</p></div></div>`;
    }).join('');
    return {
      sb: 'dark', tab: 'fil', compose: true,
      html: `${head('Publication', { back: 'Retour au fil', right: '' })}
      <div class="m-body">${postHtml(p, 'detail')}
        <div class="m-section-title">${icon('message-circle')}Commentaires (${p.comments.length})</div>
        <div class="m-comments" aria-live="polite">${comments || `<p class="m-note">Pas encore de commentaire. Lancez la discussion !</p>`}</div></div>
      <form class="m-compose" data-form="comment" data-id="${p.id}">
        ${avatar(me(), { title: false })}
        <input class="input" name="c" placeholder="Ajouter un commentaire…" aria-label="Votre commentaire" autocomplete="off" maxlength="400">
        <button class="btn btn-purple" type="submit" aria-label="Envoyer le commentaire">${icon('send')}</button></form>`
    };
  }

  /* ---------- M4 Entraide ---------- */
  function dateTile(iso) {
    const d = Store.parseDate(iso);
    return `<div class="m-date" aria-hidden="true"><b>${d.getDate()}</b><span>${Store.MONTHS[d.getMonth()].replace('.', '')}</span></div>`;
  }
  function entCard(e) {
    const u = me(), s = e.sessionId ? Store.session(e.sessionId) : null, a = Store.person(e.authorId);
    const resp = e.responders.includes(u.id), mine = e.authorId === u.id, isQ = e.kind === 'question';
    const meta = [];
    if (e.date) meta.push(`<span>${icon('calendar')}${esc(Store.fmtDate(e.date))}</span>`);
    if (e.location) meta.push(`<span>${icon('map-pin')}${esc(e.location)}</span>`);
    if (s) meta.push(`<span>${icon('graduation-cap')}${esc(Store.sessionTitle(s))}${s.trainerId ? ` · ${esc(Store.person(s.trainerId).name)}` : ' · sans animateur'}</span>`);
    let cta = '';
    if (u.role === 'formateur' && !mine) {
      if (s && e.kind === 'remplacement' && !s.trainerId) cta += `<button class="btn btn-purple" data-act="assign" data-sid="${s.id}">${icon('user-check', { cls: 'sm' })}Me positionner</button>`;
      if (s && s.trainerId === u.id) cta += `<span class="pill ok">${icon('check', { cls: 'sm' })}Vous animez cette session</span>`;
      if (isQ) cta += `<button class="btn btn-soft-purple" data-act="reply-open" data-id="${e.id}">${icon('message-square', { cls: 'sm' })}Répondre</button>`;
      else cta += resp ? `<button class="btn btn-ok" disabled>${icon('check', { cls: 'sm' })}Dispo confirmée</button>` : `<button class="btn ${s && !s.trainerId ? 'btn-soft-purple' : 'btn-purple'}" data-act="respond" data-id="${e.id}">${icon('hand-heart', { cls: 'sm' })}Je suis dispo</button>`;
    } else if (mine) cta = `<span class="pill purple">Votre appel</span>`;
    const replies = (e.replies || []).slice(-2).map((r) => `<div class="m-reply"><b>${esc(Store.person(r.authorId).name)}</b> · ${esc(r.text)}</div>`).join('');
    const respLine = e.responders.length ? `<div class="m-resp">${avatarStack(e.responders, 4)}<span>${isQ ? `${e.responders.length} réponse${e.responders.length > 1 ? 's' : ''}` : `${e.responders.length} dispo : ${esc(e.responders.slice(0, 2).map((r) => Store.person(r).name).join(', '))}${e.responders.length > 2 ? '…' : ''}`}</span></div>` : `<div class="m-resp"><span>${isQ ? 'Aucune réponse pour l\'instant' : 'Personne n\'a encore répondu'}</span></div>`;
    return `<article class="card m-ent reveal"><div class="m-ent-top">${e.date ? dateTile(e.date) : `<span class="icon-chip">${icon('help-circle', { cls: 'xl' })}</span>`}
      <div class="grow" style="min-width:0"><div class="m-pills" style="margin:0 0 6px"><span class="pill purple">${ENT_KIND[e.kind] || 'Entraide'}</span></div><h3>${esc(e.title)}</h3>
      <div class="m-meta">${meta.join('')}</div></div></div>
      <p class="small" style="color:var(--ink-soft)">${esc(e.text)}</p>
      <div class="m-resp" style="gap:8px">${avatar(a, { size: 'sm', title: false })}<span>${esc(a.fullName || a.name)}</span>${rolePill(e.authorId)}</div>
      ${replies}${respLine}${cta ? `<div class="m-ent-cta">${cta}</div>` : ''}</article>`;
  }
  function viewEntraide() {
    const u = me(), all = Store.data.entraide;
    const calls = all.filter((e) => e.kind !== 'question'), qs = all.filter((e) => e.kind === 'question');
    const canPublish = u.role !== 'participant';
    const banner = u.role === 'participant' ? ui.banner({ color: 'blue', icon: 'info', html: '<b>Lecture seule.</b> Les appels à co-animation et remplacements sont publiés par les formateurs et l\'équipe Academy.' }) : '';
    const suggest = u.id === 'karim' ? `<button class="m-suggest" data-act="compose-ent"><span class="icon-chip">${icon('lightbulb', { cls: 'lg' })}</span><span><b>Besoin d'un co-animateur le 3 déc ?</b><span class="s">Publier l'appel en un geste, déjà rédigé.</span></span></button>` : '';
    return {
      sb: 'dark', tab: 'entraide',
      html: `${head('LET\'S SHARE!', { sub: 'Entraide entre formateurs : co-animation, remplacements, questions.' })}
      <div class="m-body">${banner}${suggest}
        ${canPublish ? `<button class="btn btn-purple btn-block" data-act="compose-ent">${icon('plus', { cls: 'sm' })}Publier un appel</button>` : ''}
        <div class="m-section-title">${icon('hand-heart')}Co-animation &amp; remplacement</div>
        ${calls.map(entCard).join('') || ui.empty({ icon: 'hand-heart', title: 'Aucun appel en cours', color: 'purple' })}
        <div class="m-section-title">${icon('help-circle')}Questions ouvertes</div>
        ${qs.map(entCard).join('') || ui.empty({ icon: 'help-circle', title: 'Aucune question ouverte', color: 'purple' })}
      </div>`
    };
  }

  /* ---------- M5 Sessions ---------- */
  function sessMeta(s) {
    return `<div class="m-meta"><span>${icon('calendar')}${esc(Store.fmtDate(s.date))} · ${esc(s.time)}</span><span>${icon('map-pin')}${esc(s.location)}</span><span>${icon('monitor')}${esc(s.format)}${s.remote ? ' · ' + esc(s.remote) : ''}</span></div>`;
  }
  function viewSessions() {
    const u = me(); let inner = '';
    if (u.role === 'formateur') {
      const mine = Store.sessionsOfTrainer(u.id).filter(upcoming).sort(sortByDate);
      const s = mine[0] || Store.filRouge(), own = s.trainerId === u.id, f = Store.fill(s);
      const att = s.attendance || {}, present = s.inscrits.filter((p) => att[p]).length, alerts = (s.live.alerts || []).filter((a) => a.status === 'ouverte').length;
      inner = `<div class="m-section-title">${icon('calendar-check')}Prochaine session</div>
      <article class="card m-sess reveal"><div class="m-pills" style="margin:0"><span class="pill ${own ? 'ok' : 'orange'}">${own ? 'Vous animez' : 'Sans animateur'}</span><span class="pill outline">${esc(s.code)}</span></div>
        <h2>${esc(Store.sessionTitle(s))}</h2>${sessMeta(s)}${ui.gauge({ value: f.n, min: s.min, max: s.max })}
        ${own ? '' : `<button class="btn btn-purple btn-block" data-act="assign" data-sid="${s.id}">${icon('user-check', { cls: 'sm' })}Me positionner sur cette session</button>`}</article>
      <div class="m-quick reveal">
        <button class="m-tile" data-act="panel" data-v="emarg" aria-expanded="${state.panel === 'emarg'}"><span class="icon-chip" style="--accent:var(--purple-ink)">${icon('list-checks', { cls: 'lg' })}</span>Émargement<small>${present}/${s.inscrits.length} présents</small></button>
        <button class="m-tile" data-act="alert-open"><span class="icon-chip" style="--accent:var(--orange-ink)">${icon('alert-triangle', { cls: 'lg' })}</span>Alerte logistique<small>${alerts ? `${alerts} ouverte${alerts > 1 ? 's' : ''}` : 'Signaler un problème'}</small></button>
      </div>
      ${state.panel === 'emarg' ? `<section class="m-card reveal" aria-label="Émargement"><h3>${icon('list-checks')}Émargement · ${present}/${s.inscrits.length}</h3><div class="m-att">${s.inscrits.map((pid) => { const on = !!att[pid], p = Store.person(pid); return `<button class="m-att-row" data-act="att" data-sid="${s.id}" data-pid="${pid}" aria-pressed="${on}">${avatar(p, { size: 'sm', title: false })}${esc(p.name)}<span class="state">${icon(on ? 'check-circle' : 'clock', { cls: 'sm' })}${on ? 'Présent' : 'À pointer'}</span></button>`; }).join('')}</div></section>` : ''}
      ${mine.length > 1 ? `<div class="m-section-title">${icon('calendar')}Ensuite</div>${mine.slice(1).map(sessMini).join('')}` : ''}`;
    } else if (u.role === 'participant') {
      const mine = Store.sessionsOfParticipant(u.id).filter(upcoming).sort(sortByDate);
      if (!mine.length) {
        const s = Store.filRouge();
        inner = `<div class="m-section-title">${icon('graduation-cap')}Session suggérée</div><article class="card m-sess reveal"><h2>${esc(Store.sessionTitle(s))}</h2>${sessMeta(s)}
          <p class="small" style="color:var(--ink-soft)">Vous n'êtes inscrite à aucune session à venir.</p>
          <button class="btn btn-purple" data-act="enroll" data-sid="${s.id}">${icon('user-plus', { cls: 'sm' })}Demander mon inscription</button>
          <a class="m-link" href="portail.html#/catalogue">Voir le catalogue${icon('external-link', { cls: 'sm' })}</a></article>`;
      } else {
        const s = mine[0], st = Store.enrollmentStatus(s.id, u.id), signed = !!(s.attendance || {})[u.id];
        const q = s.live && s.live.quiz;
        inner = `<div class="m-section-title">${icon('calendar-check')}Prochaine session</div>
        <article class="card m-sess reveal"><div class="m-pills" style="margin:0">${st === 'confirmée' ? '<span class="pill ok">Inscription confirmée</span>' : '<span class="pill orange">En attente de confirmation</span>'}</div>
          <h2>${esc(Store.sessionTitle(s))}</h2>${sessMeta(s)}
          ${st === 'confirmée' ? (signed ? ui.banner({ color: 'ok', icon: 'check-circle', html: `<b>Présence signée</b>${s.signatures && s.signatures[u.id] ? ' à ' + esc(Store.fmtTime(s.signatures[u.id])) : ''}.` }) : `<button class="btn btn-primary btn-lg" data-act="sign" data-sid="${s.id}">${icon('pencil', { cls: 'sm' })}Signer ma présence</button>`) : ''}
          ${q === 'running' ? ui.banner({ color: 'teal', icon: 'help-circle', html: '<b>Le quiz est lancé !</b> Répondez avant la fin de la séance.', actions: '' }) + `<a class="btn btn-teal" href="portail.html#/p/session">${icon('play', { cls: 'sm' })}Répondre au quiz</a>` :
            q === 'closed' ? `<p class="m-note">${icon('check-circle', { cls: 'sm' })} Quiz terminé.</p>` : `<p class="m-note">${icon('help-circle', { cls: 'sm' })} Le quiz sera disponible ici dès que le formateur le lance.</p>`}
          ${s.live && s.live.feedback === 'open' ? `<a class="btn" href="portail.html#/p/evaluation">${icon('star', { cls: 'sm' })}Donner mon avis (anonyme)</a>` : ''}</article>
        ${mine.length > 1 ? `<div class="m-section-title">${icon('calendar')}Ensuite</div>${mine.slice(1).map(sessMini).join('')}` : ''}`;
      }
    } else {
      const today = Store.data.sessions.filter((s) => s.date === window.SFA_TODAY && s.status !== 'annulée');
      const open = Store.data.sessions.filter((s) => !s.trainerId && s.status !== 'annulée' && upcoming(s)).sort(sortByDate);
      inner = `<div class="m-section-title">${icon('calendar-check')}Sessions du jour</div>
      ${today.length ? today.map((s) => sessMini(s)).join('') : `<div class="m-card reveal"><p class="small" style="color:var(--ink-soft)">Aucune session aujourd'hui (${esc(Store.fmtDateMid(window.SFA_TODAY))}).</p></div>`}
      <div class="m-section-title">${icon('alert-triangle')}Sans animateur · ${open.length}</div>
      ${open.map((s) => { const called = Store.data.entraide.some((e) => e.sessionId === s.id && e.kind === 'remplacement'); return `<article class="card m-sess reveal"><div class="m-pills" style="margin:0"><span class="pill red">Sans animateur</span><span class="pill outline">${Store.fill(s).n}/${s.max} inscrits</span></div><h2>${esc(Store.sessionTitle(s))}</h2>${sessMeta(s)}
        <button class="btn ${called ? '' : 'btn-purple'}" ${called ? 'disabled' : ''} data-act="call" data-sid="${s.id}">${icon(called ? 'check' : 'megaphone', { cls: 'sm' })}${called ? 'Appel publié' : 'Lancer un appel'}</button></article>`; }).join('') || ui.empty({ icon: 'check-circle', title: 'Toutes les sessions ont un animateur', color: 'ok' })}`;
    }
    const sub = { formateur: 'Votre prochaine session, émargement et alertes.', participant: 'Votre prochaine session et vos accès rapides.', observateur: 'Sessions du jour et sessions à pourvoir.' }[u.role];
    return { sb: 'dark', tab: 'sessions', html: `${head('Mes sessions', { sub })}<div class="m-body">${inner}</div>` };
  }
  function sessMini(s) {
    return `<article class="card m-sess reveal" style="padding:14px"><div class="m-pills" style="margin:0">${ui.statusPill(s.status)}</div><h3 style="font-size:16px">${esc(Store.sessionTitle(s))}</h3><div class="m-meta"><span>${icon('calendar')}${esc(Store.fmtDateShort(s.date))} · ${esc(s.time)}</span><span>${icon('map-pin')}${esc(s.location)}</span></div></article>`;
  }

  /* ---------- M6 Notifications ---------- */
  function viewNotifs() {
    const u = me(), list = Store.notificationsOf(u.id).slice().sort((a, b) => b.at.localeCompare(a.at));
    const unread = list.filter((n) => !n.read).length;
    const item = (n) => `<div class="m-push ${n.read ? '' : 'unread'} reveal" data-act="notif" data-id="${n.id}" role="button" tabindex="0">
      <span class="m-push-app">${icon(n.icon || 'bell', { cls: 'lg' })}</span>
      <div class="grow"><div class="m-push-meta"><b>Sofrecom Academy</b><span>·</span><span>${esc(Store.fmtRelative(n.at))}</span></div><p>${esc(n.text)}</p>
      ${n.route ? `<a class="m-link" href="portail.html${esc(n.route)}">Ouvrir dans le portail${icon('arrow-right', { cls: 'sm' })}</a>` : ''}</div></div>`;
    const today = list.filter((n) => n.at.slice(0, 10) === window.SFA_TODAY), earlier = list.filter((n) => n.at.slice(0, 10) !== window.SFA_TODAY);
    return {
      sb: 'dark', tab: '',
      html: `${head('Notifications', { back: 'Retour', right: `<button class="btn btn-sm btn-ghost" data-act="mark-all" ${unread ? '' : 'disabled'}>Tout lire</button>`, sub: unread ? `${unread} non lue${unread > 1 ? 's' : ''}` : 'Vous êtes à jour' })}
      <div class="m-body">${list.length ? `${today.length ? `<div class="m-section-title">Aujourd'hui</div>${today.map(item).join('')}` : ''}${earlier.length ? `<div class="m-section-title">Plus tôt</div>${earlier.map(item).join('')}` : ''}` : ui.empty({ icon: 'bell', title: 'Aucune notification', text: 'Vous serez prévenu ici des nouveautés de la communauté.', color: 'purple' })}</div>`
    };
  }

  /* ---------- M7 Profil ---------- */
  function viewProfil() {
    const u = me(), posts = Store.data.posts;
    const mine = posts.filter((p) => p.authorId === u.id);
    const stats = [[mine.length, 'publications'], [mine.reduce((a, p) => a + p.reactions, 0), 'réactions reçues'], [posts.filter((p) => p.savedBy.includes(u.id)).length, 'ressources enregistrées']];
    let role = '';
    if (u.role === 'formateur') {
      const y = Store.trainerYear(u.id), st = Store.badgeStatus(u.id);
      role = `<section class="m-card reveal"><h3>${icon('award')}Badge formateur ${ui.statusPill(st)}</h3>
        <div class="stat"><span class="num">${y.total}<small> / ${y.threshold}</small></span><span class="label">formations animées ou programmées en 2026</span></div>${ui.progress(Math.min(100, Math.round(y.total / y.threshold * 100)), { label: 'Compteur annuel' })}
        <p class="small" style="color:var(--ink-soft)">${y.done} animée${y.done > 1 ? 's' : ''} · ${y.scheduled} programmée${y.scheduled > 1 ? 's' : ''}.${y.total < y.threshold ? ' Positionnez-vous sur une session pour conserver votre badge.' : ' Votre badge est actif.'}</p>
        ${y.total < y.threshold ? `<a class="btn btn-soft" href="portail.html#/before/sessions-ouvertes">${icon('calendar-plus', { cls: 'sm' })}Voir les sessions ouvertes</a>` : ''}</section>`;
    } else if (u.role === 'participant') {
      const bs = Store.badgesOf(u.id);
      role = `<section class="m-card reveal"><h3>${icon('award')}Mes badges · ${bs.length}</h3>${bs.map((b) => { const aw = b.awarded.find((a) => a.personId === u.id); return `<div class="m-badge-row"><span class="icon-chip" style="--accent:${ui.colorVar(b.color)}">${icon(b.icon || 'award', { cls: 'lg' })}</span><div><b>${esc(b.name)}</b><span class="s">Obtenu le ${esc(Store.fmtDateMid(aw.date))}</span></div></div>`; }).join('') || '<p class="small">Pas encore de badge.</p>'}<a class="btn btn-soft" href="portail.html#/p/badges">${icon('ticket', { cls: 'sm' })}Voucher & certifications</a></section>`;
    } else {
      const risk = Store.trainers().filter((t) => Store.badgeStatus(t.id) !== 'actif').length;
      role = `<section class="m-card reveal"><h3>${icon('shield-check')}Gouvernance des badges</h3><div class="stat"><span class="num">${risk}</span><span class="label">formateurs à accompagner (badge en sursis ou désactivé)</span></div><a class="btn btn-soft" href="portail.html#/o/risques">${icon('users', { cls: 'sm' })}Voir le détail dans le portail</a></section>`;
    }
    const accounts = Object.values(Store.data.users).map((a) => `<button class="m-account reveal" style="--identity:${ui.colorVar(a.color)}" data-act="switch" data-uid="${a.id}" aria-pressed="${a.id === u.id}">${avatar(a, { size: 'lg', title: false })}<span><b>${esc(a.fullName)}</b><small>${esc(a.roleLabel)} · ${esc(a.title.split('·')[0].trim())}</small></span>${a.id === u.id ? icon('check-circle', { cls: 'chk' }) : ''}</button>`).join('');
    return {
      sb: 'dark', tab: 'profil',
      html: `<header class="m-profile-head">${avatar(u, { size: 'xl', ring: true, title: false })}<h1>${esc(u.fullName)}</h1><span class="pill ${ROLE_COLOR[u.role]}">${esc(u.roleLabel)}</span><p class="small" style="color:var(--ink-soft)">${esc(u.title)}</p></header>
      <div class="m-body"><div class="m-stats reveal" aria-label="Contribution">${stats.map(([n, l]) => `<div class="m-stat"><b>${n}</b><span>${l}</span></div>`).join('')}</div>${role}
        <div class="m-section-title">${icon('users')}Changer de compte</div><div class="m-comments">${accounts}</div>
        <div class="m-card m-list reveal" style="padding:6px 14px">
          <a href="#/onboarding">${icon('compass')}Revoir l'onboarding${icon('chevron-right')}</a>
          <a href="portail.html">${icon('external-link')}Ouvrir le portail web${icon('chevron-right')}</a>
          <button class="danger" data-act="reset-open">${icon('rotate-ccw')}Réinitialiser la démo${icon('chevron-right')}</button></div></div>`
    };
  }

  /* ---------- M1 Onboarding ---------- */
  function viewOnboarding() {
    const art = `<svg class="m-onb-art" viewBox="0 0 300 210" role="img" aria-label="Des formateurs reliés entre eux au sein d'une communauté">
      <defs><linearGradient id="onbg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="var(--blue)"/><stop offset="1" stop-color="var(--teal)"/></linearGradient></defs>
      <circle cx="150" cy="108" r="86" fill="color-mix(in srgb, var(--purple) 10%, white)"/><circle cx="150" cy="108" r="58" fill="none" stroke="var(--purple)" stroke-opacity=".35" stroke-dasharray="3 7" stroke-width="2"/>
      <g stroke="var(--line-2)" stroke-width="2.5"><line x1="150" y1="108" x2="64" y2="62"/><line x1="150" y1="108" x2="236" y2="62"/><line x1="150" y1="108" x2="84" y2="170"/><line x1="150" y1="108" x2="222" y2="170"/></g>
      <circle cx="150" cy="108" r="32" fill="url(#onbg)"/><g transform="translate(135 93) scale(1.25)" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></g>
      <circle cx="64" cy="62" r="22" fill="color-mix(in srgb, var(--blue) 18%, white)" stroke="var(--blue)" stroke-width="3"/><text x="64" y="67" text-anchor="middle" font-size="14" font-weight="800" fill="var(--blue-d)" font-family="Inter,sans-serif">KM</text>
      <circle cx="236" cy="62" r="22" fill="color-mix(in srgb, var(--purple) 20%, white)" stroke="var(--purple)" stroke-width="3"/><text x="236" y="67" text-anchor="middle" font-size="14" font-weight="800" fill="var(--purple-ink)" font-family="Inter,sans-serif">LT</text>
      <circle cx="84" cy="170" r="22" fill="color-mix(in srgb, var(--teal) 20%, white)" stroke="var(--teal)" stroke-width="3"/><text x="84" y="175" text-anchor="middle" font-size="14" font-weight="800" fill="var(--teal-ink)" font-family="Inter,sans-serif">NR</text>
      <circle cx="222" cy="170" r="22" fill="color-mix(in srgb, var(--cyan) 20%, white)" stroke="var(--cyan)" stroke-width="3"/><text x="222" y="175" text-anchor="middle" font-size="14" font-weight="800" fill="var(--cyan-ink)" font-family="Inter,sans-serif">SB</text>
      <rect x="150" y="14" width="64" height="30" rx="15" fill="var(--orange)"/><path d="M164 44l-4 9 11-9z" fill="var(--orange)"/><circle cx="168" cy="29" r="3" fill="var(--ink)"/><circle cx="182" cy="29" r="3" fill="var(--ink)"/><circle cx="196" cy="29" r="3" fill="var(--ink)"/></svg>`;
    const P = [['pen-line', 'Publier & réagir', 'Partagez vos bonnes pratiques et ressources, réagissez en un geste.'], ['hand-heart', 'S\'entraider', 'Co-animation, remplacements, questions : la communauté répond.'], ['trending-up', 'Progresser ensemble', 'Gardez votre badge actif et grandissez sans compétition.']];
    return {
      sb: 'dark', tab: '', hideTabs: true,
      html: `<div class="m-onb">${art}<h1>Bienvenue dans <span class="gradient-text">LET'S CONNECT!</span></h1><p class="lead">La communauté des formateurs Sofrecom Academy, dans votre poche.</p>
      <div class="m-promises">${P.map(([i, t, d]) => `<div class="m-promise reveal"><span class="icon-chip">${icon(i, { cls: 'lg' })}</span><div><b>${t}</b><span class="s">${d}</span></div></div>`).join('')}</div>
      <div class="cta"><button class="btn btn-purple btn-lg btn-block" data-act="join">Rejoindre la communauté${icon('arrow-right', { cls: 'sm' })}</button></div></div>`
    };
  }

  /* ---------- Router & rendu ---------- */
  function parseHash() {
    const h = (location.hash || '').replace(/^#\/?/, ''), parts = h.split('/');
    return { name: parts[0] || 'fil', arg: parts[1] ? decodeURIComponent(parts[1]) : null };
  }
  const TABS = [['fil', 'Fil', 'home'], ['entraide', 'Entraide', 'hand-heart'], null, ['sessions', 'Sessions', 'calendar'], ['profil', 'Profil', 'user']];
  function renderTabs(active, hide) {
    const tb = $('#tabbar');
    tb.hidden = !!hide;
    tb.innerHTML = TABS.map((t) => t ? `<a class="m-tab" href="#/${t[0]}" ${active === t[0] ? 'aria-current="page"' : ''}>${icon(t[2])}<span>${t[1]}</span></a>` : `<div class="m-fab-wrap"><button class="m-fab" data-act="compose" aria-label="Publier">${icon('plus')}</button></div>`).join('');
  }
  function render(o = {}) {
    seed();
    const u = me(), r = parseHash(), scr = $('#screen');
    document.body.dataset.user = u.id;
    let v;
    if (r.name === 'post') v = viewPost(r.arg);
    else v = ({ fil: viewFil, entraide: viewEntraide, sessions: viewSessions, profil: viewProfil, notifs: viewNotifs, onboarding: viewOnboarding }[r.name] || viewFil)();
    if (!v) { location.hash = '#/fil'; return; }
    const top = o.keep ? scr.scrollTop : 0;
    scr.classList.toggle('no-anim', !o.animate);
    scr.innerHTML = v.html;
    if (o.animate) ui.stagger(scr);
    $('#app').dataset.sb = v.sb; $('#app').dataset.route = r.name;
    renderTabs(v.tab, v.hideTabs);
    scr.scrollTop = top;
  }
  function onRoute() {
    const r = parseHash();
    if (!safeGet(ONB_KEY) && r.name !== 'onboarding' && !location.hash) { location.replace('#/onboarding'); return; }
    state.panel = null;
    closeSheet(true);
    render({ animate: true });
    $('#screen').scrollTop = 0;
  }
  function safeGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function safeSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { } }

  /* Re-render sur changement du Store (autre onglet / portail inclus), sans casser la saisie */
  let pending = null;
  function refresh() {
    if (state.sheet) { pending = true; return; }
    const ae = document.activeElement;
    if (ae && ae.closest && ae.closest('#screen') && ae.matches('input,textarea') && ae.value) { pending = true; return; }
    render({ keep: true });
  }
  Store.on('change', refresh);
  Store.on('user', refresh);

  /* ---------- Sheets ---------- */
  const sheetRoot = () => $('#sheet-root');
  function openSheet(s) {
    state.sheet = s; lastFocus = document.activeElement;
    sheetRoot().innerHTML = `<div class="m-sheet-wrap"><div class="m-sheet-bd" data-act="sheet-close"></div><div class="m-sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-t"><div class="m-grab"></div>
      <div class="m-sheet-head"><h2 id="sheet-t">${esc(s.title)}</h2><button class="m-iconbtn" data-act="sheet-close" aria-label="Fermer">${icon('x', { cls: 'lg' })}</button></div><div id="sheet-body"></div></div></div>`;
    paintSheet(); const f = $('#sheet-body textarea, #sheet-body input, #sheet-body button'); if (f) setTimeout(() => f.focus({ preventScroll: true }), 60);
  }
  let lastFocus = null;
  function paintSheet() { const s = state.sheet; if (s) $('#sheet-body').innerHTML = s.render(s); }
  function closeSheet(now) {
    if (!state.sheet) return;
    state.sheet = null;
    const w = $('.m-sheet-wrap');
    const done = () => { sheetRoot().innerHTML = ''; if (pending) { pending = null; render({ keep: true }); } };
    if (now || !w) { done(); return; }
    w.classList.add('is-closing'); setTimeout(done, 170);
    if (lastFocus && lastFocus.focus) try { lastFocus.focus({ preventScroll: true }); } catch (e) { }
  }

  /* Composer */
  const COMP_TYPES = () => {
    const r = me().role;
    const base = r === 'participant' ? [['post', 'Post'], ['question', 'Question']] : [['post', 'Post'], ['bonne_pratique', 'Bonne pratique'], ['ressource', 'Ressource'], ['entraide', 'Entraide']];
    if (r === 'observateur') base.push(['annonce', 'Annonce Academy (épinglée)']);
    return base;
  };
  function openCompose(type) {
    const k = me().id === 'karim';
    const c = {
      kind: 'compose', title: 'Publier', type: type || 'post', text: k ? 'Retour sur mon atelier 5G : le cas fil rouge traité par équipe a vraiment fait la différence. Je partage mon support !' : '',
      file: k ? 0 : null, ek: 'co-animation', etitle: k ? 'Besoin d\'un co-animateur le 3 déc' : '', edate: k ? '2026-12-03' : '', eloc: k ? 'Tunis — Centre de compétences' : '', etext: k ? 'Je cherche un binôme pour la partie atelier pratique de l\'après-midi.' : '',
      render: renderCompose
    };
    if (type === 'entraide' && !k) c.etitle = '';
    openSheet(c);
  }
  function renderCompose(c) {
    const types = COMP_TYPES(), role = me().role;
    const typeBar = `<div class="m-typebar" role="radiogroup" aria-label="Type de publication">${types.map(([id, l]) => `<button class="chip" role="radio" aria-checked="${c.type === id}" data-act="comp-type" data-v="${id}">${l}</button>`).join('')}</div>`;
    let f = '';
    if (c.type === 'entraide') {
      const kinds = role === 'observateur' ? [['co-animation', 'Co-animation'], ['remplacement', 'Remplacement']] : [['co-animation', 'Co-animation'], ['remplacement', 'Remplacement'], ['question', 'Question']];
      f = `<div><label class="l" for="c-etitle">Titre de l'appel</label><input class="input" id="c-etitle" data-field="etitle" value="${esc(c.etitle)}" placeholder="Ex. Besoin d'un co-animateur le 3 déc"></div>
        <div><span class="l" style="display:block;font-size:12.5px;font-weight:700;color:var(--ink-soft);margin-bottom:6px">Nature</span><div class="m-typebar" role="radiogroup" aria-label="Nature de l'appel">${kinds.map(([id, l]) => `<button class="chip" role="radio" aria-checked="${c.ek === id}" data-act="comp-kind" data-v="${id}">${l}</button>`).join('')}</div></div>
        ${c.ek !== 'question' ? `<div class="m-two"><div><label class="l" for="c-edate">Date</label><input class="input" id="c-edate" type="date" data-field="edate" value="${esc(c.edate)}"></div><div><label class="l" for="c-eloc">Lieu</label><input class="input" id="c-eloc" data-field="eloc" value="${esc(c.eloc)}" placeholder="Ville / Teams"></div></div>` : ''}
        <div><label class="l" for="c-etext">Détails</label><textarea class="textarea" id="c-etext" data-field="etext" style="min-height:88px" placeholder="Précisez le besoin…">${esc(c.etext)}</textarea></div>`;
    } else {
      f = `<div><label class="l" for="c-text">${c.type === 'annonce' ? 'Message officiel' : c.type === 'question' ? 'Votre question' : 'Votre message'}</label><textarea class="textarea" id="c-text" data-field="text" placeholder="${c.type === 'bonne_pratique' ? 'Quelle pratique a bien fonctionné ?' : 'Partagez avec la communauté…'}">${esc(c.text)}</textarea></div>
        ${c.type === 'annonce' ? `<div class="banner purple" style="--accent:var(--purple-ink);background:color-mix(in srgb,var(--purple) 8%,white);border-color:color-mix(in srgb,var(--purple) 30%,white)"><span class="icon-chip">${icon('pin')}</span><div class="grow">Cette annonce sera <b>épinglée en tête du fil</b>, à la place de l'annonce actuelle.</div></div>` : ''}
        ${c.file != null ? `<div class="m-attach">${icon(fileIcon(MOCK_FILES[c.file].kind), { cls: 'lg' })}<span>${esc(MOCK_FILES[c.file].file)}</span><button class="btn btn-ghost" data-act="comp-res" data-v="-1" aria-label="Retirer la ressource">${icon('x')}</button></div>` :
          `<div><span style="display:block;font-size:12.5px;font-weight:700;color:var(--ink-soft);margin-bottom:6px">${c.type === 'ressource' ? 'Ressource à partager' : 'Ressource (facultatif)'}</span><div class="m-typebar">${MOCK_FILES.map((m, i) => `<button class="chip" data-act="comp-res" data-v="${i}">${icon('paperclip', { cls: 'sm' })}${esc(m.file)}</button>`).join('')}</div></div>`}`;
    }
    return `<div class="m-form">${typeBar}${f}<button class="btn btn-purple btn-lg btn-block" data-act="comp-publish">${icon('send', { cls: 'sm' })}Publier</button><p class="m-note center" style="text-align:center">${c.type === 'entraide' ? 'Visible par toute la communauté dans LET\'S SHARE!' : 'Visible par toute la communauté dans le fil.'}</p></div>`;
  }
  function publish() {
    const c = state.sheet, u = me();
    if (c.type === 'entraide') {
      if (c.etitle.trim().length < 3) { toast('Ajoutez un titre à votre appel', 'warn'); return; }
      Store.addEntraide({ authorId: u.id, kind: c.ek, title: c.etitle.trim(), date: c.ek === 'question' ? null : (c.edate || null), location: c.ek === 'question' ? null : (c.eloc || null), text: c.etext.trim() || 'Contactez-moi directement.', sessionId: null });
      closeSheet(true); toast('Appel publié dans LET\'S SHARE!', 'ok'); setTimeout(() => { location.hash = '#/entraide'; }, 0); return;
    }
    if (c.text.trim().length < 3) { toast('Écrivez un message avant de publier', 'warn'); return; }
    const post = { authorId: u.id, type: c.type, text: c.text.trim() };
    if (c.file != null) post.resource = { title: MOCK_FILES[c.file].title, kind: MOCK_FILES[c.file].kind };
    if (c.type === 'annonce') post.pinned = true;
    if (c.type === 'ressource' && !post.resource) { toast('Ajoutez une ressource à partager', 'warn'); return; }
    const id = Store.addPost(post);
    if (c.type === 'annonce') Store.pinPost(id);
    state.filter = 'all'; closeSheet(true);
    toast(c.type === 'annonce' ? 'Annonce épinglée en tête du fil' : 'Publié dans le fil', 'ok');
    if (parseHash().name !== 'fil') location.hash = '#/fil'; else { render(); $('#screen').scrollTop = 0; }
  }

  /* Alerte logistique */
  const ALERTS = [['visio', 'Lien visio KO', 'wifi-off'], ['materiel', 'Matériel manquant', 'wrench'], ['salle', 'Salle indisponible', 'building'], ['autre', 'Autre problème', 'alert-circle']];
  function openAlert(sid) {
    openSheet({ kind: 'alert', title: 'Alerte logistique', sid, pick: 'visio', render: (c) => `<div class="m-form"><p class="small" style="color:var(--ink-soft)">L'équipe Academy est prévenue immédiatement.</p>
      <div class="m-opts" role="radiogroup" aria-label="Type d'alerte">${ALERTS.map(([id, l, i]) => `<button class="m-opt" role="radio" aria-checked="${c.pick === id}" data-act="alert-pick" data-v="${id}">${icon(i)}${l}</button>`).join('')}</div>
      <button class="btn btn-purple btn-lg btn-block" data-act="alert-send">${icon('send', { cls: 'sm' })}Envoyer l'alerte</button></div>` });
  }

  /* ---------- Événements ---------- */
  const app = $('#app');
  app.addEventListener('click', (e) => {
    const t = e.target.closest('[data-act],[data-open]');
    if (!t) return;
    const a = t.dataset.act, u = me();
    if (!a) { // clic carte du fil
      if (e.target.closest('button,a,input,textarea') || !t.dataset.open) return;
      location.hash = '#/post/' + t.dataset.open; return;
    }
    const id = t.dataset.id;
    switch (a) {
      case 'back': if (navCount > 0) history.back(); else location.hash = '#/fil'; break;
      case 'filter': state.filter = t.dataset.v; render({ keep: false }); break;
      case 'open-post': location.hash = '#/post/' + id; break;
      case 'react': { Store.toggleReaction(id, u.id); const b = $(`[data-act="react"][data-id="${id}"] .ico`); if (b) b.parentElement.classList.add('pop'); break; }
      case 'save': { const p = Store.data.posts.find((x) => x.id === id); const was = p.savedBy.includes(u.id); Store.toggleSave(id, u.id); toast(was ? 'Ressource retirée de vos enregistrements' : 'Ressource enregistrée', 'ok', { icon: was ? 'x' : 'bookmark' }); break; }
      case 'share': toast('Lien du post copié', 'info', { icon: 'share' }); break;
      case 'compose': openCompose(); break;
      case 'compose-ent': openCompose('entraide'); break;
      case 'comp-type': state.sheet.type = t.dataset.v; if (t.dataset.v === 'ressource' && state.sheet.file == null) state.sheet.file = 0; paintSheet(); break;
      case 'comp-kind': state.sheet.ek = t.dataset.v; paintSheet(); break;
      case 'comp-res': state.sheet.file = +t.dataset.v < 0 ? null : +t.dataset.v; paintSheet(); break;
      case 'comp-publish': publish(); break;
      case 'sheet-close': closeSheet(); break;
      case 'respond': Store.respondEntraide(id, u.id); toast('Votre disponibilité est envoyée', 'ok', { icon: 'hand-heart' }); break;
      case 'assign': Store.assignTrainer(t.dataset.sid, u.id); toast('Vous animez désormais cette session', 'ok', { icon: 'user-check' }); break;
      case 'reply-open': openSheet({ kind: 'reply', title: 'Répondre à la question', id, text: '', render: (c) => `<div class="m-form"><div><label class="l" for="c-reply">Votre réponse</label><textarea class="textarea" id="c-reply" data-field="text" placeholder="Partagez votre astuce…">${esc(c.text)}</textarea></div><button class="btn btn-purple btn-lg btn-block" data-act="reply-send">${icon('send', { cls: 'sm' })}Envoyer</button></div>` }); break;
      case 'reply-send': { const c = state.sheet; if (c.text.trim().length < 2) break; const en = Store.data.entraide.find((x) => x.id === c.id); en.replies = (en.replies || []).concat({ authorId: u.id, text: c.text.trim(), at: Store.nowISO() }); closeSheet(true); Store.respondEntraide(c.id, u.id); Store.commit('entraide', { id: c.id }); toast('Réponse envoyée', 'ok'); break; }
      case 'panel': state.panel = state.panel === t.dataset.v ? null : t.dataset.v; render({ keep: true }); break;
      case 'att': { const s = Store.session(t.dataset.sid); Store.setAttendance(s.id, t.dataset.pid, !s.attendance[t.dataset.pid]); break; }
      case 'alert-open': openAlert((Store.sessionsOfTrainer(u.id).filter(upcoming).sort(sortByDate)[0] || Store.filRouge()).id); break;
      case 'alert-pick': state.sheet.pick = t.dataset.v; paintSheet(); break;
      case 'alert-send': { const c = state.sheet, al = ALERTS.find((x) => x[0] === c.pick); Store.addLogisticsAlert(c.sid, { type: al[0], label: al[1], by: u.id }); closeSheet(true); toast('Alerte envoyée à l\'équipe Academy', 'warn'); break; }
      case 'sign': Store.signAttendance(t.dataset.sid, u.id); toast('Présence signée. Merci !', 'ok', { icon: 'pencil' }); break;
      case 'enroll': Store.requestEnrollment(t.dataset.sid, u.id, 'Demande depuis l\'app mobile'); toast('Demande d\'inscription envoyée', 'ok'); break;
      case 'call': { const s = Store.session(t.dataset.sid); Store.addEntraide({ authorId: u.id, kind: 'remplacement', title: 'Animateur recherché — ' + Store.sessionTitle(s), date: s.date, location: s.location, sessionId: s.id, text: 'Session ouverte sans animateur, ' + s.inscrits.length + ' inscrits.' }); toast('Appel publié dans LET\'S SHARE!', 'ok'); break; }
      case 'notif': { const n = Store.notificationsOf(u.id).find((x) => x.id === id); if (n && !n.read) { n.read = true; Store.commit('notifications', u.id); } break; }
      case 'mark-all': Store.markNotificationsRead(u.id); toast('Notifications marquées comme lues', 'ok'); break;
      case 'switch': { if (t.dataset.uid === u.id) break; Store.setUser(t.dataset.uid); render({ animate: false }); const n = me(); toast(`Vous êtes maintenant <b>${esc(n.name)}</b> — ${esc(n.roleLabel)}`, 'identity', { icon: 'user' }); break; }
      case 'join': safeSet(ONB_KEY, '1'); location.hash = '#/fil'; break;
      case 'reset-open': openSheet({ kind: 'reset', title: 'Réinitialiser la démo ?', render: () => `<div class="m-form"><p class="small" style="color:var(--ink-soft)">Les publications, réactions et inscriptions de la démo seront remises à zéro (portail inclus).</p><button class="btn btn-danger btn-lg btn-block" data-act="reset-ok">${icon('rotate-ccw', { cls: 'sm' })}Réinitialiser</button><button class="btn btn-block" data-act="sheet-close">Annuler</button></div>` }); break;
      case 'reset-ok': closeSheet(true); Store.reset(); render({ animate: true }); toast('Démo réinitialisée', 'ok', { icon: 'rotate-ccw' }); break;
    }
  });
  app.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && state.sheet) { closeSheet(); return; }
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('.m-push')) { e.preventDefault(); e.target.click(); }
  });
  app.addEventListener('input', (e) => {
    const f = e.target.dataset && e.target.dataset.field;
    if (f && state.sheet) state.sheet[f] = e.target.value;
  });
  app.addEventListener('submit', (e) => {
    const form = e.target.closest('[data-form="comment"]');
    if (!form) return;
    e.preventDefault();
    const inp = form.querySelector('input'), txt = inp.value.trim();
    if (!txt) return;
    inp.value = ''; inp.blur();
    Store.addComment(form.dataset.id, me().id, txt);
    const sc = $('#screen'); sc.scrollTo({ top: sc.scrollHeight });
    toast('Commentaire publié', 'ok', { icon: 'message-circle' });
  });
  window.addEventListener('hashchange', () => { navCount++; onRoute(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && state.sheet) closeSheet(); });

  /* ---------- Démarrage ---------- */
  onRoute();
})();
