/* =====================================================================
   VUES COMMUNES — P2 Catalogue · C3 Fiche formation · P3 Demande d'inscription
   (multi-rôles : participant · formateur · observateur)
   ===================================================================== */
(function () {
  const { icon, esc, pageHead, pill, toast } = window.ui;

  /* ---------- Helpers partagés (exposés à views-participant.js) ---------- */
  const todayISO = () => window.SFA_TODAY;
  const upcoming = (fid) => Store.data.sessions
    .filter((s) => s.formationId === fid && s.date >= todayISO() && s.status !== 'terminée' && s.status !== 'annulée' && s.status !== 'proposée')
    .sort((a, b) => a.date.localeCompare(b.date));
  const nextSession = (fid) => upcoming(fid)[0] || null;
  const fColor = (f) => window.ui.colorVar(f.color);
  const isParticipant = () => Store.role === 'participant';

  /** Statut de Sana sur n'importe quelle session à venir d'une formation */
  function myStatus(fid) {
    for (const s of upcoming(fid)) { const st = Store.enrollmentStatus(s.id, 'sana'); if (st) return { status: st, session: s }; }
    return null;
  }
  function levelColor(l) { return { 'Fondamental': 'teal', 'Intermédiaire': 'blue', 'Avancé': 'purple' }[l] || ''; }
  function formatIcon(f) { return { 'Présentiel': 'building', 'Distanciel': 'video', 'Hybride': 'globe' }[f] || 'monitor'; }
  function placesPill(s) {
    if (!s) return `<span class="pill outline">${icon('calendar', { cls: 'sm' })}Aucune session programmée</span>`;
    const f = Store.fill(s);
    if (f.full) return `<span class="pill orange">Complet ${f.n}/${f.max}</span>`;
    return `<span class="pill teal">${icon('users', { cls: 'sm' })}Places restantes ${f.left}/${f.max}</span>`;
  }
  function badgeNameOf(id) { const b = Store.data.badges.find((x) => x.id === id); return b ? b.name : ''; }
  function badgeDate(pid, badgeId) {
    const b = Store.data.badges.find((x) => x.id === badgeId); const a = b && b.awarded.find((x) => x.personId === pid);
    return a ? a.date : null;
  }

  /* ---------- P3 : demande d'inscription (modale 2 étapes) ---------- */
  function enrollModal(formationId, preSessionId, onDone) {
    const f = Store.formation(formationId); if (!f) return;
    const sessions = upcoming(formationId).filter((s) => !Store.enrollmentStatus(s.id, 'sana'));
    const st = { step: 1, sessionId: preSessionId && sessions.find((s) => s.id === preSessionId) ? preSessionId : (sessions[0] ? sessions[0].id : null), motivation: '', manager: false };
    const missing = f.prerequisites.filter((p) => p.badgeId && !Store.hasBadge('sana', p.badgeId));

    const stepsHtml = () => `<div class="steps" role="list" aria-label="Étapes">
      <div class="step ${st.step === 1 ? 'is-active' : 'is-done'}" role="listitem"><span class="badge">${st.step > 1 ? icon('check', { cls: 'sm' }) : '1'}</span>Prérequis &amp; session</div>
      <div class="step ${st.step === 2 ? 'is-active' : ''}" role="listitem"><span class="badge">2</span>Motivation</div></div>`;

    const prereqHtml = () => f.prerequisites.length ? f.prerequisites.map((p, i) => {
      const ok = p.badgeId ? Store.hasBadge('sana', p.badgeId) : true;
      const sub = p.badgeId ? (ok ? `Badge acquis le ${Store.fmtDateMid(badgeDate('sana', p.badgeId))}` : 'Badge non acquis') : 'Savoir déclaratif — à confirmer';
      return `<li class="pre-row ${ok ? 'is-ok' : 'is-missing'}" style="--i:${i}"><span class="pre-check">${ok ? `<svg viewBox="0 0 24 24" class="pre-tick" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>` : icon('alert-triangle', { cls: 'sm' })}</span>
        <div class="grow"><b>${esc(p.label)}</b><div class="dim">${sub}</div></div>${ok ? '<span class="pill ok">Validé</span>' : '<span class="pill orange">À vérifier</span>'}</li>`;
    }).join('') : `<li class="pre-row is-ok"><span class="pre-check"><svg viewBox="0 0 24 24" class="pre-tick" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span><div class="grow"><b>Aucun prérequis</b><div class="dim">Cette formation est ouverte à tous</div></div></li>`;

    const sessionsHtml = () => sessions.length ? sessions.map((s) => {
      const fl = Store.fill(s); const full = fl.full;
      return `<label class="sess-opt ${st.sessionId === s.id ? 'is-sel' : ''} ${full ? 'is-disabled' : ''}"><input type="radio" name="enr-sess" value="${s.id}" ${st.sessionId === s.id ? 'checked' : ''} ${full ? 'disabled' : ''}>
        <span class="sess-date"><b>${Store.fmtDateShort(s.date)}</b><small>${s.date.slice(0, 4)}</small></span>
        <span class="grow"><b>${Store.fmtDate(s.date)}</b><span class="dim d-block">${esc(s.time)} · ${esc(s.location)}</span>
        <span class="dim d-block">${s.trainerId ? 'Animée par ' + esc(Store.person(s.trainerId).name) : 'Formateur à confirmer'}</span></span>
        ${placesPill(s)}</label>`;
    }).join('') : `<div class="empty" style="padding:24px"><h3>Aucune session à venir</h3><p class="small">Activez une alerte : l'équipe Academy vous préviendra dès l'ouverture d'une session.</p></div>`;

    const body1 = () => `${stepsHtml()}
      <h3 class="mt-3 mb-1" style="font-size:var(--fs-md)">Vos prérequis</h3>
      <p class="small muted mb-2">Vérifiés automatiquement à partir de vos badges acquis.</p>
      <ul class="pre-list">${prereqHtml()}</ul>
      ${missing.length ? `<div class="banner orange mt-2" role="status"><span class="icon-chip">${icon('info')}</span><div class="grow small">Il vous manque <b>${esc(missing.map((m) => m.label).join(', '))}</b>. Vous pouvez tout de même envoyer votre demande : le formateur l'étudiera.</div></div>` : ''}
      <h3 class="mt-3 mb-1" style="font-size:var(--fs-md)">Choisissez votre session</h3>
      <div class="stack" role="radiogroup" aria-label="Sessions disponibles">${sessionsHtml()}</div>`;

    const sel = () => sessions.find((s) => s.id === st.sessionId);
    const body2 = () => { const s = sel(); return `${stepsHtml()}
      <div class="enr-recap mt-3"><span class="icon-chip" style="--accent:${fColor(f)}">${icon('graduation-cap')}</span><div class="grow"><b>${esc(f.title)}</b><div class="dim">${s ? Store.fmtDate(s.date) + ' · ' + esc(s.location) : ''}</div></div></div>
      <div class="field mt-3"><label for="enr-motiv">Votre motivation <span class="dim">(facultatif)</span></label>
        <textarea class="textarea" id="enr-motiv" placeholder="Ex. : je prépare la certification cloud et je souhaite appliquer la 5G SA sur mon projet actuel…">${esc(st.motivation)}</textarea>
        <span class="hint">Ce message sera transmis au formateur pour l'aider à préparer la séance.</span></div>
      <label class="check mt-2"><input type="checkbox" id="enr-mgr" ${st.manager ? 'checked' : ''}><span>J'ai l'accord de mon manager pour participer à cette formation</span></label>`; };

    const m = window.ui.modal({
      title: 'Demande d\'inscription', eyebrow: 'P3 · Inscription', accent: 'var(--cyan)',
      body: '<div id="enr-body"></div>',
      foot: `<button class="btn btn-ghost" data-close>Annuler</button><button class="btn btn-soft" id="enr-back" hidden>${icon('arrow-left', { cls: 'sm' })}Retour</button><button class="btn btn-primary" id="enr-next">Continuer${icon('arrow-right', { cls: 'sm' })}</button>`,
      onOpen(el, close) {
        const bodyEl = el.querySelector('#enr-body'); const next = el.querySelector('#enr-next'); const back = el.querySelector('#enr-back');
        const draw = () => {
          bodyEl.innerHTML = st.step === 1 ? body1() : body2();
          back.hidden = st.step === 1;
          next.innerHTML = st.step === 1 ? `Continuer${icon('arrow-right', { cls: 'sm' })}` : `${icon('send', { cls: 'sm' })}Envoyer ma demande`;
          next.disabled = st.step === 1 ? !st.sessionId : !st.manager;
          bodyEl.querySelectorAll('input[name="enr-sess"]').forEach((r) => r.addEventListener('change', () => {
            st.sessionId = r.value; bodyEl.querySelectorAll('.sess-opt').forEach((l) => l.classList.toggle('is-sel', l.contains(r) && r.checked)); next.disabled = false;
          }));
          const mg = bodyEl.querySelector('#enr-mgr'); if (mg) mg.addEventListener('change', () => { st.manager = mg.checked; next.disabled = !st.manager; });
          const tx = bodyEl.querySelector('#enr-motiv'); if (tx) tx.addEventListener('input', () => { st.motivation = tx.value; });
        };
        draw();
        back.addEventListener('click', () => { st.step = 1; draw(); });
        next.addEventListener('click', () => {
          if (st.step === 1) { st.step = 2; draw(); return; }
          const s = sel(); if (!s) return;
          Store.requestEnrollment(s.id, 'sana', st.motivation.trim()); // MOCK : envoi réel au formateur / à l'équipe Academy
          const who = s.trainerId ? Store.person(s.trainerId).name : 'l\'équipe Academy';
          toast(`Demande envoyée à ${esc(who)}`, 'ok', { icon: 'send' });
          close(); if (onDone) onDone(s);
        });
      }
    });
    return m;
  }

  /* ---------- P2 : Catalogue ---------- */
  App.view({
    id: 'P2', path: '/catalogue', roles: ['participant', 'formateur', 'observateur'], phase: 'commun', title: 'Catalogue',
    render(el, ctx) {
      const role = ctx.role;
      const flt = { q: (ctx.params.query && ctx.params.query.q) || '', theme: '', level: '', format: '', sort: 'date' };
      const base = () => Store.data.formations.filter((f) => f.status === 'validée' || (role === 'observateur' && f.status === 'en_attente'));
      const uniq = (k) => [...new Set(base().map((f) => f[k]))];
      const chipRow = (key, label, vals) => `<div class="flt-group"><span class="flt-label">${label}</span><div class="chips" role="group" aria-label="${label}">
        <button class="chip" data-f="${key}" data-v="" aria-pressed="${!flt[key]}">Tous</button>${vals.map((v) => `<button class="chip" data-f="${key}" data-v="${esc(v)}" aria-pressed="${flt[key] === v}">${esc(v)}</button>`).join('')}</div></div>`;

      el.innerHTML = pageHead({ num: 'P2', eyebrow: 'Catalogue des formations', title: 'Trouvez votre prochaine formation', lead: 'Toutes les formations validées par l\'Academy, avec leurs prochaines sessions et vos prérequis déjà vérifiés.' }) + `
        <div class="card reveal cat-filters">
          <div class="cat-search"><div class="input-icon grow">${icon('search')}<label class="sr-only" for="cat-q">Rechercher une formation</label><input class="input" id="cat-q" type="search" placeholder="Rechercher : 5G, Kubernetes, cybersécurité…" value="${esc(flt.q)}" autocomplete="off"></div>
            <div class="field cat-sort"><label class="sr-only" for="cat-sort">Trier</label><select class="select" id="cat-sort"><option value="date">Tri : prochaine session</option><option value="titre">Tri : titre A-Z</option><option value="note">Tri : mieux notées</option></select></div></div>
          ${chipRow('theme', 'Thème', uniq('theme'))}${chipRow('level', 'Niveau', ['Fondamental', 'Intermédiaire', 'Avancé'])}${chipRow('format', 'Format', ['Présentiel', 'Distanciel', 'Hybride'])}
        </div>
        <div class="row between mt-3 mb-2"><p class="small muted" id="cat-count" aria-live="polite"></p>${role === 'observateur' ? `<span class="pill purple">${icon('eye', { cls: 'sm' })}Vue Observateur : formations en attente incluses</span>` : ''}</div>
        <div class="grid-3 cat-grid" id="cat-grid"></div>`;

      const card = (f, i) => {
        const s = nextSession(f.id); const mine = isParticipant() ? myStatus(f.id) : null;
        const pre = f.prerequisites.length ? f.prerequisites.map((p) => {
          const ok = isParticipant() && p.badgeId && Store.hasBadge('sana', p.badgeId);
          return `<span class="chip ${ok ? 'ok' : ''}" style="cursor:default">${ok ? icon('check', { cls: 'sm' }) : ''}${esc(p.label)}</span>`;
        }).join('') : '<span class="dim">Aucun prérequis</span>';
        return `<a class="card cat-card hover reveal" style="--accent:${fColor(f)};--i:${i}" href="#/catalogue/${f.id}" aria-label="${esc(f.title)}">
          <div class="cat-band"><span class="icon-chip cat-ico">${icon(formatIcon(f.format), { cls: 'lg' })}</span>
            <span class="cat-dur">${f.durationDays} j · ${f.hours} h</span>${f.status === 'en_attente' ? '<span class="pill orange cat-pend">En attente de validation</span>' : ''}</div>
          <div class="cat-body"><h3>${esc(f.title)}</h3>
            <div class="row" style="gap:6px"><span class="pill outline">${esc(f.theme)}</span><span class="pill ${levelColor(f.level)}">${esc(f.level)}</span><span class="pill outline">${esc(f.format)}</span></div>
            <div class="cat-next">${s ? `${icon('calendar', { cls: 'sm' })}<span>Prochaine session : <b>${Store.fmtDateMid(s.date)}</b></span>` : `<span class="dim">Pas de session programmée</span>`}</div>
            <div class="row between" style="gap:8px">${placesPill(s)}${mine ? (mine.status === 'confirmée' ? '<span class="pill ok">Inscrite</span>' : '<span class="pill orange">Demande en attente</span>') : ''}</div>
            <div class="cat-pre"><span class="flt-label">Prérequis</span><div class="chips" style="gap:6px">${pre}</div></div></div></a>`;
      };

      const apply = () => {
        const q = flt.q.trim().toLowerCase();
        let list = base().filter((f) => (!flt.theme || f.theme === flt.theme) && (!flt.level || f.level === flt.level) && (!flt.format || f.format === flt.format) &&
          (!q || (f.title + ' ' + f.short + ' ' + f.theme + ' ' + f.description + ' ' + f.syllabus.join(' ')).toLowerCase().includes(q)));
        list.sort((a, b) => {
          if (flt.sort === 'titre') return a.title.localeCompare(b.title, 'fr');
          if (flt.sort === 'note') return (b.rating || 0) - (a.rating || 0);
          const sa = nextSession(a.id), sb = nextSession(b.id);
          return (sa ? sa.date : '9999').localeCompare(sb ? sb.date : '9999');
        });
        el.querySelector('#cat-count').textContent = `${list.length} formation${list.length > 1 ? 's' : ''} ${list.length > 1 ? 'trouvées' : 'trouvée'}`;
        const grid = el.querySelector('#cat-grid');
        if (ctx.scenario === 'vide' || !list.length) {
          grid.innerHTML = `<div style="grid-column:1/-1">${window.ui.empty({ icon: 'search', color: 'cyan', title: ctx.scenario === 'vide' ? 'Le catalogue se prépare' : 'Aucune formation ne correspond', text: ctx.scenario === 'vide' ? 'Les premières formations seront publiées très bientôt.' : 'Essayez d\'élargir vos filtres ou de modifier votre recherche.', cta: ctx.scenario === 'vide' ? '' : '<button class="btn btn-soft" id="cat-reset">Réinitialiser les filtres</button>' })}</div>`;
          const r = grid.querySelector('#cat-reset'); if (r) r.addEventListener('click', () => { flt.q = ''; flt.theme = flt.level = flt.format = ''; el.querySelector('#cat-q').value = ''; syncChips(); apply(); });
          return;
        }
        grid.innerHTML = list.map(card).join(''); window.ui.stagger(grid);
      };
      const syncChips = () => el.querySelectorAll('.chip[data-f]').forEach((c) => c.setAttribute('aria-pressed', String((flt[c.dataset.f] || '') === c.dataset.v)));
      el.querySelector('#cat-q').addEventListener('input', (e) => { flt.q = e.target.value; apply(); });
      el.querySelector('#cat-sort').addEventListener('change', (e) => { flt.sort = e.target.value; apply(); });
      el.querySelectorAll('.chip[data-f]').forEach((c) => c.addEventListener('click', () => { flt[c.dataset.f] = c.dataset.v; syncChips(); apply(); }));
      apply();
      ctx.on('inscriptions', apply); ctx.on('sessions', apply);
    }
  });

  /* ---------- C3 : Fiche formation ---------- */
  App.view({
    id: 'C3', path: '/catalogue/:id', roles: ['participant', 'formateur', 'observateur'], phase: 'commun', title: 'Fiche formation',
    render(el, ctx) {
      const f = Store.formation(ctx.params.id);
      if (!f) { el.innerHTML = window.ui.empty({ icon: 'search', title: 'Formation introuvable', text: 'Cette formation n\'existe pas ou a été archivée.', cta: '<a class="btn btn-primary" href="#/catalogue">Retour au catalogue</a>' }); return; }
      const role = ctx.role;
      const draw = () => {
        const sess = upcoming(f.id);
        const mine = role === 'participant' ? myStatus(f.id) : null;
        const prereq = f.prerequisites.length ? f.prerequisites.map((p) => {
          if (role === 'participant' && p.badgeId) {
            const ok = Store.hasBadge('sana', p.badgeId);
            return ok ? `<li class="pre-row is-ok"><span class="pre-check"><svg viewBox="0 0 24 24" class="pre-tick" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span><div class="grow"><b>${esc(p.label)} <span class="ok-txt">✔ acquis le ${Store.fmtDateMid(badgeDate('sana', p.badgeId))}</span></b><div class="dim">Validé automatiquement grâce à votre badge</div></div></li>`
              : `<li class="pre-row is-missing"><span class="pre-check">${icon('alert-triangle', { cls: 'sm' })}</span><div class="grow"><b>${esc(p.label)}</b><div class="dim">Badge non acquis — à obtenir avant la session</div></div></li>`;
          }
          return `<li class="pre-row is-neutral"><span class="pre-check">${icon('list-checks', { cls: 'sm' })}</span><div class="grow"><b>${esc(p.label)}</b>${p.badgeId ? `<div class="dim">Badge « ${esc(badgeNameOf(p.badgeId))} »</div>` : ''}</div></li>`;
        }).join('') : '<li class="pre-row is-ok"><span class="pre-check"><svg viewBox="0 0 24 24" class="pre-tick" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span><div class="grow"><b>Aucun prérequis</b></div></li>';

        // CTA principal selon le rôle
        let cta = '';
        if (role === 'participant') {
          if (mine && mine.status === 'confirmée') cta = `<span class="pill ok" style="height:36px;padding:0 14px;font-size:13px">${icon('check-circle', { cls: 'sm' })}Inscription confirmée · ${Store.fmtDateShort(mine.session.date)}</span>`;
          else if (mine) cta = `<span class="pill orange" style="height:36px;padding:0 14px;font-size:13px">${icon('clock', { cls: 'sm' })}Demande en attente · ${Store.fmtDateShort(mine.session.date)}</span>`;
          else cta = sess.length ? `<button class="btn btn-white btn-lg" data-act="enroll">${icon('user-plus')}Demander mon inscription</button>` : `<span class="pill outline" style="background:#fff">Aucune session programmée</span>`;
        } else if (role === 'formateur') cta = `<button class="btn btn-white btn-lg" data-act="position">${icon('calendar-plus')}Me positionner</button>`;
        else cta = `<button class="btn btn-white btn-lg" data-act="edit">${icon('pencil')}Modifier</button><button class="btn btn-ghost btn-lg" style="color:#fff" data-act="archive">${icon('archive')}Archiver</button>`;

        const sessCard = (s) => {
          const fl = Store.fill(s); const st = Store.enrollmentStatus(s.id, 'sana'); const lead = s.trainerId ? Store.person(s.trainerId) : null;
          let act = '';
          if (role === 'participant') act = st === 'confirmée' ? '<span class="pill ok">Confirmée</span>' : st === 'en_attente' ? '<span class="pill orange">En attente</span>' : fl.full ? '<span class="pill outline">Complet</span>' : `<button class="btn btn-soft btn-sm" data-act="enroll" data-sid="${s.id}">Demander</button>`;
          else if (role === 'formateur' && !s.trainerId) act = `<button class="btn btn-soft btn-sm" data-act="position" data-sid="${s.id}">Me positionner</button>`;
          return `<div class="sess-card"><div class="row between nowrap" style="align-items:flex-start"><div><b>${Store.fmtDate(s.date)}</b><div class="dim">${esc(s.time)}</div></div>${act}</div>
            <div class="dim mt-1">${icon('map-pin', { cls: 'sm' })} ${esc(s.location)}${s.remote ? ' · ' + esc(s.remote) : ''}</div>
            <div class="dim mt-1">${lead ? `${window.ui.avatar(lead, { size: 'sm' })} <span style="vertical-align:middle">${esc(lead.name)}</span>` : `${icon('user', { cls: 'sm' })} <span class="orange-txt">Formateur à confirmer</span>`}</div>
            <div class="mt-2">${window.ui.gauge({ value: fl.n, min: fl.min, max: fl.max, label: 'Inscrits' })}</div></div>`;
        };
        const trainers = f.trainerIds.map((id) => Store.person(id));

        el.innerHTML = `<a class="btn btn-ghost btn-sm mb-2" href="#/catalogue">${icon('arrow-left', { cls: 'sm' })}Catalogue</a>
          <header class="fiche-hero reveal" style="--accent:${fColor(f)}"><div class="grow"><span class="eyebrow"><span class="num">C3</span>Fiche formation</span>
            <h1>${esc(f.title)}</h1>
            <div class="row" style="gap:8px;margin-top:12px"><span class="pill outline fh-pill">${esc(f.theme)}</span><span class="pill outline fh-pill">${esc(f.level)}</span><span class="pill outline fh-pill">${icon(formatIcon(f.format), { cls: 'sm' })}${esc(f.format)}</span><span class="pill outline fh-pill">${icon('clock', { cls: 'sm' })}${f.durationDays} j · ${f.hours} h</span>${f.status === 'en_attente' ? '<span class="pill orange">En attente de validation</span>' : ''}</div>
            ${f.rating ? `<div class="fh-rate">${window.ui.stars(f.rating)}<span><b>${Store.fmtNum(f.rating)}</b> · ${f.totalParticipants} participants</span></div>` : ''}</div>
            <div class="fh-cta">${cta}</div></header>
          <div class="grid-main mt-3">
            <div class="stack-lg">
              <section class="card reveal"><h2 class="sec-h">À propos</h2><p class="muted">${esc(f.description)}</p></section>
              <section class="card reveal"><h2 class="sec-h">Objectifs pédagogiques</h2><ul class="obj-list">${f.objectives.map((o) => `<li>${icon('target', { cls: 'sm' })}<span>${esc(o)}</span></li>`).join('')}</ul></section>
              <section class="card reveal"><h2 class="sec-h">Programme</h2>${f.syllabus.map((t, i) => `<div class="toc-row"><span class="num">${String(i + 1).padStart(2, '0')}</span><span>${esc(t)}</span><span></span></div>`).join('')}</section>
              <section class="card reveal"><h2 class="sec-h">Prérequis</h2><ul class="pre-list">${prereq}</ul>${role === 'participant' ? '<p class="dim mt-2">Vos prérequis sont vérifiés automatiquement à partir de vos badges acquis.</p>' : ''}</section>
              <section class="card reveal"><h2 class="sec-h">Public concerné</h2><p class="muted">${icon('users', { cls: 'sm' })} ${esc(f.audience || 'Tout public')}</p></section>
            </div>
            <aside class="stack-lg">
              <section class="card reveal"><h2 class="sec-h">Prochaines sessions</h2>${sess.length ? `<div class="stack">${sess.map(sessCard).join('')}</div>` : window.ui.empty({ icon: 'calendar', title: 'Pas de session programmée', text: 'L\'équipe Academy ouvrira bientôt de nouvelles dates.' })}</section>
              <section class="card reveal"><h2 class="sec-h">Formateurs habilités</h2><div class="stack">${trainers.map((t) => `<div class="row nowrap">${window.ui.avatar(t)}<div class="grow"><b>${esc(t.fullName || t.name)}</b><div class="dim">${esc(t.title || '')}</div></div></div>`).join('')}</div></section>
            </aside></div>`;
        bind();
      };

      function bind() {
        el.querySelectorAll('[data-act="enroll"]').forEach((b) => b.addEventListener('click', () => enrollModal(f.id, b.dataset.sid, draw)));
        el.querySelectorAll('[data-act="position"]').forEach((b) => b.addEventListener('click', () => {
          const free = upcoming(f.id).filter((s) => !s.trainerId);
          if (free.length) App.go('#/before/sessions-ouvertes'); else toast('Toutes les sessions de cette formation ont déjà un animateur.', 'info');
        }));
        const e = el.querySelector('[data-act="edit"]'); if (e) e.addEventListener('click', () => toast('Modification de la fiche : disponible dans la version complète.', 'info')); // MOCK
        const a = el.querySelector('[data-act="archive"]'); if (a) a.addEventListener('click', () => toast(`« ${esc(f.short)} » archivée (simulation).`, 'warn')); // MOCK
      }
      draw();
      ctx.on('inscriptions', () => { if (!document.querySelector('.modal-backdrop')) draw(); });
    }
  });

  window.SFA_C = { upcoming, nextSession, fColor, enrollModal, placesPill, myStatus, badgeDate, levelColor };
})();
