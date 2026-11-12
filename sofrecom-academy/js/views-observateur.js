/* =====================================================================
   VUES OBSERVATEUR — Leïla T. (Équipe formation) · phase « pilotage »
   O1 Cockpit · O2 Validation · O3 Risques · O4 Sessions · O5 Paiements
   O6 Badges · O7 Qualité (LET'S RATE!)
   ===================================================================== */
(function () {
  const { icon, esc, avatar, pill, statusPill, pageHead, stat, gauge, progress, empty, banner, trend, bars, toast, modal, confirm, tabsHtml, bindTabs, scoreBar } = window.ui;
  const TODAY = () => window.SFA_TODAY;
  const MOBILE = 'mobile.html';
  const mobileLink = (txt) => `<a href="${MOBILE}" target="_blank" rel="noopener"><u>${txt}</u></a>`;
  const fmt1 = (n) => Store.fmtNum(n, 1);

  /* ---------- helpers métier ---------- */
  function upcoming() {
    return Store.data.sessions
      .filter((s) => s.date >= TODAY() && s.status !== 'annulée' && s.status !== 'terminée')
      .sort((a, b) => a.date.localeCompare(b.date));
  }
  /** état d'affichage d'une session : sans_animateur / sous_effectif / complet / statut brut */
  function sessState(s) {
    const f = Store.fill(s);
    if (s.status === 'proposée') return 'proposée';
    if (f.low) return 'sous_effectif';
    if (f.full) return 'complet';
    return s.status;
  }
  const alertDateOf = (id) => Store.person(id).alertDate || '2026-11-01';
  const alertDateLabel = (iso) => (iso === '2026-09-01' ? '1er sept.' : iso === '2026-11-01' ? '1er nov.' : Store.fmtDateShort(iso));
  const remindedToday = (id) => Store.data.reminders.some((r) => r.tid === id && r.at === TODAY());
  const savePlus = () => Store.save();
  const nameOf = (id) => Store.person(id).name;
  const SHORT = (s) => (Store.formation(s.formationId) || {}).short || s.code;
  const TITLE = (s) => Store.sessionTitle(s);

  /** Abonnement multi-topics, avec garde sur les redessins */
  function onAny(ctx, topics, fn) { topics.forEach((t) => ctx.on(t, fn)); }

  /* =====================================================================
     O1 — Cockpit de pilotage
     ===================================================================== */
  function cockpitAlerts(sc) {
    if (sc === 'vide') return [];
    const out = [];
    Store.data.sessions.forEach((s) => {
      ((s.live && s.live.alerts) || []).filter((a) => a.status === 'ouverte').forEach((a) => {
        out.push({ key: 'log-' + a.id, color: 'red', icon: 'alert-triangle', title: `Alerte logistique — ${a.label || a.type}`, text: `${SHORT(s)} · remontée depuis la séance${s.trainerId ? ' par ' + nameOf(s.trainerId) : ''} · ${Store.fmtRelative(a.at)}`, href: '#/o/sessions', cta: 'Suivre' });
      });
    });
    upcoming().forEach((s) => {
      const f = Store.fill(s), d = Store.daysUntil(s.date);
      if (!s.trainerId) out.push({ key: 'noanim-' + s.id, color: 'red', icon: 'user-plus', title: `Sans animateur — ${SHORT(s)}`, text: `${Store.fmtDateShort(s.date)} (J-${d}) · ${f.n} inscrits`, href: '#/o/sessions', cta: 'Proposer' });
      if (f.low) out.push({ key: 'low-' + s.id, color: 'orange', icon: 'users', title: `Sous-effectif — ${SHORT(s)}`, text: `${f.n} / ${s.min} inscrits requis · ${Store.fmtDateShort(s.date)} (J-${d})`, href: '#/o/sessions', cta: 'Voir' });
    });
    const pend = Store.data.proposals.filter((p) => p.status === 'en_attente').length;
    if (pend) out.push({ key: 'val-' + pend, color: 'blue', icon: 'clipboard-check', title: `${pend} formation${pend > 1 ? 's' : ''} à valider`, text: 'Propositions de formateurs en attente de décision', href: '#/o/validation', cta: 'Valider' });
    const risk = Store.trainers().filter((t) => Store.badgeStatus(t.id) !== 'actif').length;
    if (risk) out.push({ key: 'risk-' + risk, color: 'purple', icon: 'hand-heart', title: `${risk} formateur${risk > 1 ? 's' : ''} à accompagner`, text: 'Seuil annuel de 2 formations pas encore atteint', href: '#/o/risques', cta: 'Accompagner' });
    return out;
  }

  App.view({
    id: 'O1', path: '/o/cockpit', roles: ['observateur'], phase: 'pilotage', title: 'Cockpit de pilotage',
    render(el, ctx) {
      const sc = ctx.scenario;
      let seenAlerts = null;
      el.innerHTML = pageHead({
        num: 'O1', eyebrow: 'Pilotage · Cockpit', title: 'Cockpit de pilotage',
        lead: `Vue d'ensemble de l'activité Academy au ${Store.fmtDate(TODAY())} : remplissage, satisfaction et points d'attention du jour.`,
        actions: `<button class="btn btn-primary" id="o1-announce">${icon('megaphone', { cls: 'sm' })}Publier une annonce Academy</button>`
      }) + '<div id="o1-body"></div>';

      function body(redraw) {
        const ups = sc === 'vide' ? [] : upcoming();
        const month = TODAY().slice(0, 7);
        const monthCount = Store.data.sessions.filter((s) => s.date.startsWith(month) && s.status !== 'annulée').length;
        const avgFill = ups.length ? Math.round(ups.reduce((a, s) => a + Store.fill(s).pct, 0) / ups.length) : 0;
        const tr = Store.trainers(), actifs = tr.filter((t) => Store.badgeStatus(t.id) === 'actif').length;
        const monthly = Store.data.monthly;
        const sat = monthly[monthly.length - 1].satisfaction;
        const alerts = cockpitAlerts(sc);
        const fresh = new Set();
        if (seenAlerts) alerts.forEach((a) => { if (!seenAlerts.has(a.key)) fresh.add(a.key); });
        seenAlerts = new Set(alerts.map((a) => a.key));
        const urgent = alerts.filter((a) => a.color === 'red').length;

        const rows = ups.map((s) => {
          const f = Store.fill(s);
          return { label: `${SHORT(s)} · ${Store.fmtDateShort(s.date)}`, value: f.pct, max: 100, display: `${f.n}/${s.max}`, color: f.low ? 'orange' : f.full ? 'teal' : null };
        });

        return `<div class="${redraw ? 'o-redraw' : ''}">
        ${sc === 'alerte' && urgent ? banner({ color: 'red', icon: 'alert-triangle', role: 'alert', html: `<b>${urgent} point${urgent > 1 ? 's' : ''} d'attention prioritaire${urgent > 1 ? 's' : ''}</b> — des sessions n'ont pas d'animateur ou une alerte logistique est remontée de la séance.`, actions: '<a class="btn btn-sm btn-soft" href="#/o/sessions">Traiter</a>' }) + '<div class="mt-2"></div>' : ''}
        <div class="grid-4">
          ${stat({ i: 0, icon: 'calendar', color: 'blue', label: 'Sessions du mois', num: monthCount, sub: `${Store.MONTHS_LONG[+month.slice(5) - 1]} ${month.slice(0, 4)} · hors annulées` })}
          ${stat({ i: 1, icon: 'users', color: 'teal', label: 'Remplissage moyen', num: `${avgFill}<small> %</small>`, sub: 'sur les sessions à venir' })}
          ${stat({ i: 2, icon: 'star', color: 'orange', label: 'Satisfaction moyenne', num: `${fmt1(sat)}<small> / 5</small>`, sub: `repère Academy ${fmt1(Store.data.academyAverage)}` })}
          ${stat({ i: 3, icon: 'badge-check', color: 'purple', label: 'Formateurs actifs', num: `${actifs}<small> / ${tr.length}</small>`, sub: 'badge formateur actif en 2026' })}
        </div>
        <div class="grid-main o-main mt-3">
          <div class="card reveal" style="--i:4">
            <div class="card-title"><h3>Remplissage des sessions à venir</h3>
              <span class="o-key"><i style="--k:var(--orange)"></i>Sous le minimum<i style="--k:var(--teal)"></i>Complet<i style="--k:var(--blue)"></i>En cours</span></div>
            ${rows.length ? bars(rows) : empty({ icon: 'calendar', title: 'Aucune session à venir', text: 'Les prochaines sessions apparaîtront ici dès leur planification.' })}
          </div>
          <div class="card reveal" style="--i:5" aria-live="polite">
            <div class="card-title"><h3>Alertes du jour</h3>${alerts.length ? pill(String(alerts.length), urgent ? 'red' : 'blue') : ''}</div>
            ${alerts.length ? `<ul class="o-alerts">${alerts.map((a) => `
              <li class="o-alert ${fresh.has(a.key) ? 'flash-in' : ''}" style="--accent:${ui.colorVar(a.color)}">
                <span class="icon-chip">${icon(a.icon, { cls: 'sm' })}</span>
                <div class="grow"><b>${esc(a.title)}</b><span class="small muted">${esc(a.text)}</span></div>
                <a class="btn btn-ghost btn-icon btn-sm" href="${a.href}" title="${esc(a.cta)}" aria-label="${esc(a.cta)} : ${esc(a.title)}">${icon('arrow-right', { cls: 'sm' })}</a>
              </li>`).join('')}</ul>`
              : empty({ icon: 'check-circle', color: 'ok', title: 'Rien à signaler', text: 'Toutes les sessions sont couvertes. Beau travail !' })}
          </div>
        </div>
        <div class="grid-2 mt-3">
          <div class="card reveal" style="--i:6">
            <div class="card-title"><h3>Satisfaction mensuelle</h3><span class="small muted">sur 5 · évaluations à chaud</span></div>
            ${trend(monthly.map((m) => ({ label: m.month, value: m.satisfaction })), { ref: Store.data.academyAverage, refLabel: 'Repère Academy', min: 4, max: 5, label: 'Satisfaction mensuelle Academy' })}
          </div>
          <div class="card reveal" style="--i:7">
            <div class="card-title"><h3>Remplissage moyen par mois</h3><span class="small muted">taux d'occupation des sessions</span></div>
            ${bars(monthly.map((m) => ({ label: `${m.month} · ${m.sessions} sessions`, value: m.fill, max: 100, display: m.fill + ' %', color: 'teal' })))}
          </div>
        </div></div>`;
      }
      const host = el.querySelector('#o1-body');
      const draw = (redraw) => { host.innerHTML = body(redraw); };
      draw(false);
      onAny(ctx, ['live', 'inscriptions', 'sessions', 'proposals', 'reminders'], () => draw(true));

      el.querySelector('#o1-announce').addEventListener('click', () => {
        modal({
          eyebrow: 'LET\'S SHARE!', title: 'Publier une annonce Academy',
          body: `<div class="field"><label for="o1-ann">Message à toute la communauté</label>
            <textarea class="textarea" id="o1-ann" rows="5" placeholder="Ex. Ouverture des inscriptions au parcours Cloud & 5G de décembre…"></textarea>
            <span class="hint">L'annonce sera épinglée en tête du fil LET'S SHARE! (application mobile).</span></div>`,
          foot: `<button class="btn btn-ghost" data-close>Annuler</button><button class="btn btn-primary" data-ok>${icon('megaphone', { cls: 'sm' })}Publier et épingler</button>`,
          onOpen(m, close) {
            m.querySelector('[data-ok]').addEventListener('click', () => {
              const text = m.querySelector('#o1-ann').value.trim();
              if (!text) { toast('Écrivez un message avant de publier.', 'warn'); return; }
              // MOCK : en production, l'annonce serait diffusée via l'API LET'S SHARE!
              const id = Store.addPost({ authorId: 'leila', type: 'annonce', pinned: true, text });
              Store.pinPost(id);
              close();
              toast(`Annonce publiée et épinglée — ${mobileLink('Voir dans LET\'S SHARE! (mobile)')}`, 'ok', { icon: 'megaphone', duration: 6000 });
            });
          }
        });
      });
    }
  });

  /* =====================================================================
     O2 — Formations à valider
     ===================================================================== */
  App.view({
    id: 'O2', path: '/o/validation', roles: ['observateur'], phase: 'pilotage', title: 'Formations à valider',
    render(el, ctx) {
      const sc = ctx.scenario;
      let tab = 'attente', selected = null, draft = '', err = false;
      const flash = new Set();
      const list = () => (sc === 'vide' ? [] : Store.data.proposals).filter((p) => (tab === 'attente' ? p.status === 'en_attente' : p.status !== 'en_attente'));
      const counts = () => { const all = sc === 'vide' ? [] : Store.data.proposals; return { a: all.filter((p) => p.status === 'en_attente').length, t: all.filter((p) => p.status !== 'en_attente').length }; };

      el.innerHTML = pageHead({
        num: 'O2', eyebrow: 'Pilotage · Validation', title: 'Formations à valider',
        lead: 'Examinez les propositions des formateurs : validez, demandez des modifications ou refusez avec un commentaire bienveillant.'
      }) + '<div id="o2-body"></div>';
      const host = el.querySelector('#o2-body');

      function detail(p) {
        const a = Store.person(p.authorId);
        const done = p.status !== 'en_attente';
        return `<article class="card o-detail" aria-label="Détail de la proposition">
          <div class="row between" style="align-items:flex-start;gap:12px;flex-wrap:wrap">
            <div><span class="id-tag">${esc(p.id)}</span><h2 class="mt-1">${esc(p.title)}</h2></div>${statusPill(p.status)}
          </div>
          <div class="row mt-2" style="gap:10px;flex-wrap:wrap">${avatar(a, { size: 'sm' })}<span><b>${esc(a.fullName || a.name)}</b> <span class="muted small">· ${esc(a.title || 'Formateur')} · soumis le ${Store.fmtDateMid(p.submittedAt)}</span></span></div>
          <div class="chips mt-2">${pill(p.theme, 'blue')}${pill(p.level, 'cyan')}${pill(p.format, 'outline')}${pill(`${p.durationDays} jour${p.durationDays > 1 ? 's' : ''}`, 'outline', { icon: 'clock' })}</div>
          <div class="o-sections mt-3">
            <section><h4>Public cible</h4><p>${esc(p.audience || '—')}</p></section>
            <section><h4>Prérequis</h4><div class="chips">${(p.prerequisites || []).map((r) => `<span class="pill outline">${r.badgeId ? icon('award', { cls: 'sm' }) : ''}${esc(r.label)}</span>`).join('') || '<span class="muted small">Aucun</span>'}</div></section>
            <section><h4>Objectifs pédagogiques</h4><ul class="o-ul">${(p.objectives || []).map((o) => `<li>${icon('target', { cls: 'sm' })}<span>${esc(o)}</span></li>`).join('')}</ul></section>
            <section><h4>Syllabus</h4><ol class="o-ol">${(p.syllabus || []).map((o) => `<li>${esc(o)}</li>`).join('')}</ol></section>
          </div>
          ${done ? `<div class="banner ${p.status === 'validée' ? 'ok' : p.status === 'modifs' ? 'blue' : 'orange'} mt-3" style="margin-top:20px">
              <span class="icon-chip">${icon(p.status === 'validée' ? 'check-circle' : 'info')}</span>
              <div class="grow"><b>Décision du ${Store.fmtDateMid(p.decidedAt || TODAY())}</b> — ${esc({ 'validée': 'Formation validée et ajoutée au catalogue.', modifs: 'Modifications demandées à l\'auteur.', 'refusée': 'Proposition refusée.' }[p.status])}
              ${p.comment ? `<p class="small mt-1">« ${esc(p.comment)} »</p>` : ''}</div></div>`
            : `<div class="o-decision mt-3">
              <div class="field"><label for="o2-comment">Commentaire pour ${esc(a.name)} <span class="muted small">(obligatoire pour une demande de modifications ou un refus)</span></label>
                <textarea class="textarea ${err ? 'is-invalid' : ''}" id="o2-comment" rows="3" aria-describedby="o2-err" placeholder="Ex. Très bon sujet : pouvez-vous préciser les prérequis et ajouter un atelier pratique ?">${esc(draft)}</textarea>
                <span class="hint o-err" id="o2-err" ${err ? '' : 'hidden'}>Merci d'ajouter un commentaire pour expliquer votre décision.</span></div>
              <div class="row mt-2" style="gap:10px;flex-wrap:wrap">
                <button class="btn btn-ok" data-dec="validée">${icon('check', { cls: 'sm' })}Valider</button>
                <button class="btn btn-soft" data-dec="modifs">${icon('pencil', { cls: 'sm' })}Demander des modifications</button>
                <button class="btn btn-danger" data-dec="refusée">${icon('x', { cls: 'sm' })}Refuser</button>
              </div></div>`}
        </article>`;
      }

      function draw() {
        const c = counts(), items = list();
        if (!items.some((p) => p.id === selected)) selected = items[0] ? items[0].id : null;
        const sel = items.find((p) => p.id === selected);
        host.innerHTML = tabsHtml('o2', [{ id: 'attente', label: `En attente (${c.a})`, icon: 'clock' }, { id: 'traitees', label: `Traitées (${c.t})`, icon: 'check-circle' }], tab)
          + (items.length ? `<div class="o-split">
              <ul class="o-queue" role="list">${items.map((p) => {
                const a = Store.person(p.authorId);
                return `<li><button class="o-q-item ${p.id === selected ? 'is-on' : ''} ${flash.has(p.id) ? 'flash-in' : ''}" data-sel="${p.id}" aria-pressed="${p.id === selected}">
                  ${avatar(a, { size: 'sm' })}<span class="grow"><b>${esc(p.title)}</b><span class="small muted">${esc(a.name)} · ${Store.fmtDateShort(p.submittedAt)} · ${esc(p.theme)}</span></span>
                  ${tab === 'traitees' ? statusPill(p.status) : flash.has(p.id) ? pill('Nouveau', 'teal') : icon('chevron-right', { cls: 'sm' })}</button></li>`;
              }).join('')}</ul>
              ${sel ? detail(sel) : ''}</div>`
            : empty({ icon: tab === 'attente' ? 'clipboard-check' : 'archive', color: 'teal', title: tab === 'attente' ? 'Aucune proposition en attente' : 'Aucune proposition traitée', text: tab === 'attente' ? 'Toutes les formations proposées ont été examinées. Les nouvelles propositions arriveront ici en direct.' : 'Les décisions prises apparaîtront dans cet onglet.' }));
        bindTabs(host, (t) => { tab = t.id.split('-t-')[1]; draft = ''; err = false; selected = null; draw(); const nt = host.querySelector('[role="tab"][aria-selected="true"]'); if (nt) nt.focus(); });
        host.querySelectorAll('[data-sel]').forEach((b) => b.addEventListener('click', () => { selected = b.dataset.sel; flash.delete(selected); draft = ''; err = false; draw(); }));
        const ta = host.querySelector('#o2-comment');
        if (ta) ta.addEventListener('input', () => { draft = ta.value; });
        host.querySelectorAll('[data-dec]').forEach((b) => b.addEventListener('click', () => {
          const dec = b.dataset.dec, comment = (ta ? ta.value : '').trim();
          if (dec !== 'validée' && !comment) { err = true; draft = ta.value; draw(); host.querySelector('#o2-comment').focus(); toast('Un commentaire est nécessaire pour cette décision.', 'warn'); return; }
          const p = Store.data.proposals.find((x) => x.id === selected);
          if (!p) return;
          Store.decideProposal(p.id, dec, comment);
          draft = ''; err = false; selected = null;
          const msg = { 'validée': `« ${esc(p.title)} » validée — ${esc(nameOf(p.authorId))} est notifié(e). Retrouvez-la dans l'onglet Traitées.`, modifs: `Modifications demandées à ${esc(nameOf(p.authorId))} — dossier déplacé dans Traitées.`, 'refusée': `Proposition refusée — ${esc(nameOf(p.authorId))} reçoit votre commentaire.` }[dec];
          toast(msg, dec === 'refusée' ? 'info' : 'ok');
        }));
      }
      draw();
      ctx.on('proposals', (pl) => {
        if (pl && !pl.decision && pl.id) { flash.add(pl.id); const p = Store.data.proposals.find((x) => x.id === pl.id); if (p) toast(`Nouvelle proposition de ${esc(nameOf(p.authorId))} : « ${esc(p.title)} »`, 'smart', { icon: 'clipboard-check' }); if (tab === 'attente') selected = pl.id; }
        draw();
      });
    }
  });

  /* =====================================================================
     O3 — Formateurs à risque de badge
     ===================================================================== */
  function proposeModal(tid, onDone) {
    const open = Store.openSessions();
    const cand = Store.trainers().filter((t) => Store.badgeStatus(t.id) !== 'actif');
    modal({
      eyebrow: 'Accompagnement', title: 'Proposer une session', size: 'wide',
      body: `${tid ? `<p class="muted">Sessions ouvertes qui pourraient convenir à <b>${esc(nameOf(tid))}</b>.</p>` : `<div class="field" style="max-width:340px"><label for="o3-who">Formateur à accompagner</label><select class="select" id="o3-who">${cand.map((t) => `<option value="${t.id}">${esc(t.fullName || t.name)}</option>`).join('')}</select></div>`}
        <div class="stack mt-2" style="gap:10px">${open.length ? open.map((s) => `
          <div class="o-prop"><span class="icon-chip" style="--accent:${ui.colorVar((Store.formation(s.formationId) || {}).color)}">${icon('calendar-plus', { cls: 'sm' })}</span>
            <div class="grow"><b>${esc(TITLE(s))}</b><span class="small muted">${Store.fmtDate(s.date)} · ${esc(s.location)} · ${s.inscrits.length} inscrits</span></div>
            <button class="btn btn-soft btn-sm" data-prop="${s.id}">Proposer</button></div>`).join('')
          : empty({ icon: 'calendar', title: 'Aucune session ouverte', text: 'Toutes les sessions ont un animateur.' })}</div>`,
      foot: '<button class="btn btn-ghost" data-close>Fermer</button>',
      onOpen(m) {
        m.querySelectorAll('[data-prop]').forEach((b) => b.addEventListener('click', () => {
          const who = tid || m.querySelector('#o3-who').value;
          const s = Store.session(b.dataset.prop);
          // MOCK : en production, notification + e-mail au formateur
          Store.notify(who, { icon: 'calendar-plus', text: `L'équipe Academy vous propose d'animer « ${TITLE(s)} » le ${Store.fmtDateShort(s.date)}`, route: '#/before/sessions-ouvertes' });
          savePlus();
          b.disabled = true; b.textContent = 'Proposée';
          toast(`Proposition envoyée à ${esc(nameOf(who))} pour « ${esc(SHORT(s))} »`, 'ok');
          if (onDone) onDone();
        }));
      }
    });
  }

  App.view({
    id: 'O3', path: '/o/risques', roles: ['observateur'], phase: 'pilotage', title: 'Formateurs à risque de badge',
    render(el, ctx) {
      const sc = ctx.scenario;
      let fDate = 'all', fStatus = 'all';
      const flash = new Set();
      el.innerHTML = pageHead({
        num: 'O3', eyebrow: 'Pilotage · Badge formateur', title: 'Formateurs à risque de badge',
        lead: 'Le badge formateur reste actif avec 2 formations par an. Cette vue sert à accompagner : relancer, proposer une session, ouvrir le dialogue.',
        actions: `<button class="btn btn-primary" id="o3-prop">${icon('calendar-plus', { cls: 'sm' })}Proposer une session</button>`
      }) + '<div id="o3-body"></div>';
      const host = el.querySelector('#o3-body');

      function rows() {
        return (sc === 'vide' ? [] : Store.trainers()).map((t) => ({ t, y: Store.trainerYear(t.id), st: Store.badgeStatus(t.id) }))
          .sort((a, b) => a.y.total - b.y.total || a.t.name.localeCompare(b.t.name, 'fr'));
      }
      function draw() {
        const all = rows();
        const atRisk = all.filter((r) => r.st !== 'actif');
        const shown = all.filter((r) => (fStatus === 'all' || r.st === fStatus) && (fDate === 'all' || (r.st !== 'actif' && alertDateOf(r.t.id) === fDate)));
        host.innerHTML = `
          ${banner({ color: atRisk.length ? 'blue' : 'ok', icon: 'hand-heart', html: atRisk.length
            ? `<b>${atRisk.length} formateur${atRisk.length > 1 ? 's' : ''} à accompagner</b> d'ici le 31 décembre. Un message bienveillant et une session adaptée suffisent souvent à relancer la dynamique.`
            : `<b>Tous les formateurs sont en bonne voie.</b> Le seuil annuel est atteint par l'ensemble de l'équipe.` })}
          <div class="row between mt-2 o-filters" style="gap:12px;flex-wrap:wrap">
            <div class="row" style="gap:10px;flex-wrap:wrap">
              <div class="seg" role="group" aria-label="Filtrer par date d'alerte">${[['all', 'Toutes les alertes'], ['2026-09-01', '1er sept.'], ['2026-11-01', '1er nov.']].map(([v, l]) => `<button aria-pressed="${fDate === v}" data-fd="${v}">${l}</button>`).join('')}</div>
              <div class="seg" role="group" aria-label="Filtrer par statut">${[['all', 'Tous'], ['actif', 'Actif'], ['en_sursis', 'En sursis'], ['desactive', 'Désactivé']].map(([v, l]) => `<button aria-pressed="${fStatus === v}" data-fs="${v}">${l}</button>`).join('')}</div>
            </div>
            <span class="small muted" aria-live="polite">${shown.length} formateur${shown.length > 1 ? 's' : ''}</span>
          </div>
          ${shown.length ? `<div class="table-wrap mt-2"><table class="table">
            <thead><tr><th>Formateur</th><th class="num-cell">Animées</th><th class="num-cell">Programmées</th><th style="min-width:150px">Progression 2026</th><th>Statut</th><th>Date d'alerte</th><th>Action</th></tr></thead>
            <tbody>${shown.map((r) => {
              const rem = remindedToday(r.t.id);
              return `<tr class="${flash.has(r.t.id) ? 'flash-in' : ''}">
                <td><div class="person">${avatar(r.t, { size: 'sm' })}<div><b>${esc(r.t.fullName || r.t.name)}</b><div class="xs muted">${esc(r.t.title || '')}</div></div></div></td>
                <td class="num-cell">${r.y.done}</td><td class="num-cell">${r.y.scheduled}</td>
                <td><div class="o-prog">${progress(Math.min(100, Math.round((r.y.total / r.y.threshold) * 100)), { label: 'Progression vers le seuil' })}<b>${r.y.total} / ${r.y.threshold}</b></div></td>
                <td><div class="row" style="gap:6px;flex-wrap:wrap">${statusPill(r.st)}${rem ? pill('Relancé aujourd\'hui', 'teal', { icon: 'mail' }) : ''}</div></td>
                <td>${r.st === 'actif' ? '<span class="muted">—</span>' : esc(alertDateLabel(alertDateOf(r.t.id)))}</td>
                <td>${r.st === 'actif' ? '<span class="muted small">Aucune action</span>' : `<div class="row" style="gap:6px;flex-wrap:nowrap">
                  <button class="btn btn-soft btn-sm" data-rem="${r.t.id}">${icon('bell', { cls: 'sm' })}${rem ? 'Relancer à nouveau' : 'Relancer'}</button>
                  <button class="btn btn-ghost btn-sm" data-prop="${r.t.id}" aria-label="Proposer une session à ${esc(r.t.name)}">${icon('calendar-plus', { cls: 'sm' })}Proposer</button></div>`}</td></tr>`;
            }).join('')}</tbody></table></div>`
            : `<div class="mt-2">${empty({ icon: 'badge-check', color: 'teal', title: 'Aucun formateur à ce niveau de risque', text: 'Aucun formateur ne correspond à ces filtres pour le moment.' })}</div>`}`;
        host.querySelectorAll('[data-fd]').forEach((b) => b.addEventListener('click', () => { fDate = b.dataset.fd; draw(); }));
        host.querySelectorAll('[data-fs]').forEach((b) => b.addEventListener('click', () => { fStatus = b.dataset.fs; draw(); }));
        host.querySelectorAll('[data-rem]').forEach((b) => b.addEventListener('click', () => {
          const id = b.dataset.rem; Store.remindTrainer(id); flash.add(id);
          toast(`Relance envoyée à ${esc(nameOf(id))}`, 'ok', { icon: 'mail' });
        }));
        host.querySelectorAll('[data-prop]').forEach((b) => b.addEventListener('click', () => proposeModal(b.dataset.prop)));
      }
      draw();
      el.querySelector('#o3-prop').addEventListener('click', () => proposeModal(null));
      onAny(ctx, ['sessions', 'reminders', 'badge'], () => draw());
    }
  });

  /* =====================================================================
     O4 — Sessions & remplissage
     ===================================================================== */
  App.view({
    id: 'O4', path: '/o/sessions', roles: ['observateur'], phase: 'pilotage', title: 'Sessions & remplissage',
    render(el, ctx) {
      const sc = ctx.scenario;
      let fState = 'all', fForm = 'all';
      const seen = new Set(upcoming().map((s) => s.id + ':' + Store.fill(s).n));
      el.innerHTML = pageHead({
        num: 'O4', eyebrow: 'Pilotage · Sessions', title: 'Sessions & remplissage',
        lead: 'Toutes les sessions à venir : effectif par rapport au minimum, animateur affecté et demandes en attente.'
      }) + '<div id="o4-body"></div>';
      const host = el.querySelector('#o4-body');
      const entraideOf = (sid) => Store.data.entraide.find((e) => e.sessionId === sid && e.kind === 'remplacement');

      function draw() {
        const all = sc === 'vide' ? [] : upcoming();
        const nNo = all.filter((s) => !s.trainerId).length, nLow = all.filter((s) => Store.fill(s).low).length, nFull = all.filter((s) => Store.fill(s).full).length;
        const shown = all.filter((s) => (fForm === 'all' || s.formationId === fForm)
          && (fState === 'all' || (fState === 'noanim' && !s.trainerId) || (fState === 'low' && Store.fill(s).low) || (fState === 'full' && Store.fill(s).full)));
        const forms = [...new Set(all.map((s) => s.formationId))];
        host.innerHTML = `
          <div class="row between o-filters" style="gap:12px;flex-wrap:wrap">
            <div class="seg" role="group" aria-label="Filtrer les sessions">${[['all', `Toutes (${all.length})`], ['noanim', `Sans animateur (${nNo})`], ['low', `Sous-effectif (${nLow})`], ['full', `Complètes (${nFull})`]].map(([v, l]) => `<button aria-pressed="${fState === v}" data-fs="${v}">${l}</button>`).join('')}</div>
            <div class="field" style="min-width:220px"><label class="sr-only" for="o4-form">Formation</label>
              <select class="select" id="o4-form"><option value="all">Toutes les formations</option>${forms.map((f) => `<option value="${f}" ${fForm === f ? 'selected' : ''}>${esc((Store.formation(f) || {}).short || f)}</option>`).join('')}</select></div>
          </div>
          ${shown.length ? `<div class="table-wrap mt-2"><table class="table o-sess">
            <thead><tr><th>Formation</th><th>Date</th><th>Formateur</th><th style="min-width:190px">Remplissage</th><th>Statut</th><th class="num-cell">Demandes</th><th>Action</th></tr></thead>
            <tbody>${shown.map((s) => {
              const f = Store.fill(s), st = sessState(s), e = entraideOf(s.id);
              const key = s.id + ':' + f.n, isNew = !seen.has(key);
              return `<tr class="${isNew ? 'flash-in' : ''}">
                <td><b title="${esc(TITLE(s))}">${esc(SHORT(s))}</b><div class="xs muted">${esc(s.location.split('—')[0].trim())} · ${esc(s.format)}</div></td>
                <td style="white-space:nowrap"><b>${Store.fmtDateShort(s.date)}</b><div class="xs muted">J-${Store.daysUntil(s.date)}</div></td>
                <td>${s.trainerId ? `<div class="person">${avatar(s.trainerId, { size: 'sm' })}<span>${esc(nameOf(s.trainerId))}</span></div>` : pill('Sans animateur', 'red', { dot: true })}</td>
                <td class="o-gauge">${gauge({ value: f.n, min: s.min, max: s.max, label: 'Inscrits ' + TITLE(s) })}</td>
                <td>${statusPill(st)}</td>
                <td class="num-cell">${(s.pending || []).length ? pill(String((s.pending || []).length), 'blue') : '<span class="muted">—</span>'}</td>
                <td>${s.status === 'proposée' ? `<button class="btn btn-ok btn-sm" data-confirm="${s.id}">${icon('check', { cls: 'sm' })}Confirmer la session</button>` : !s.trainerId ? (e ? `<span class="pill teal">${icon('check', { cls: 'sm' })}Proposée${e.responders.length ? ' · ' + e.responders.length + ' réponse' + (e.responders.length > 1 ? 's' : '') : ''}</span>` : `<button class="btn btn-soft btn-sm" data-comm="${s.id}">${icon('users', { cls: 'sm' })}Proposer à la communauté</button>`) : '<span class="muted small">—</span>'}</td></tr>`;
            }).join('')}</tbody></table></div>`
            : `<div class="mt-2">${empty({ icon: 'calendar', color: 'teal', title: 'Aucune session à afficher', text: all.length ? 'Aucune session ne correspond à ces filtres.' : 'Aucune session à venir pour le moment.' })}</div>`}`;
        host.querySelectorAll('[data-fs]').forEach((b) => b.addEventListener('click', () => { fState = b.dataset.fs; draw(); }));
        host.querySelector('#o4-form').addEventListener('change', (ev) => { fForm = ev.target.value; draw(); });
        host.querySelectorAll('[data-confirm]').forEach((b) => b.addEventListener('click', () => {
          // MOCK : confirmation d'une session proposée par un formateur sur ses disponibilités
          const s = Store.session(b.dataset.confirm); const fm = Store.formation(s.formationId);
          s.status = 'ouverte'; if (/à confirmer/.test(s.location)) s.location = 'Tunis — Centre de compétences';
          if (!Store.data.payments.some((x) => x.sessionId === s.id)) Store.data.payments.push({ id: 'pay-' + s.id, trainerId: s.trainerId, sessionId: s.id, label: fm.short + ' (' + Store.fmtDateShort(s.date) + ')', amount: 1200, status: 'en_attente', date: null });
          Store.notify(s.trainerId, { icon: 'check-circle', text: `Votre session « ${fm.short} » du ${Store.fmtDateShort(s.date)} est confirmée et ouverte aux inscriptions`, route: '#/before/session/' + s.id });
          Store.commit('sessions', { sessionId: s.id, confirmed: true }); Store.emit('badge', s.trainerId);
          toast(`Session « ${esc(fm.short)} » du ${Store.fmtDateShort(s.date)} confirmée — visible au catalogue`, 'ok', { icon: 'check-circle' });
        }));
        host.querySelectorAll('[data-comm]').forEach((b) => b.addEventListener('click', () => {
          const s = Store.session(b.dataset.comm);
          Store.addEntraide({ authorId: 'leila', kind: 'remplacement', title: `Animateur recherché — ${TITLE(s)}`, date: s.date, location: s.location, sessionId: s.id, text: `Session ouverte sans animateur, ${s.inscrits.length} inscrits. Qui peut animer ? Contactez l'équipe Academy.` });
          toast(`Proposé à la communauté — ${mobileLink('Voir dans LET\'S CONNECT!')}`, 'ok', { icon: 'users', duration: 6000 });
        }));
      }
      draw();
      onAny(ctx, ['inscriptions', 'sessions', 'entraide'], () => draw());
    }
  });

  /* =====================================================================
     O5 — Facturation & paiements
     ===================================================================== */
  App.view({
    id: 'O5', path: '/o/paiements', roles: ['observateur'], phase: 'pilotage', title: 'Facturation & paiements',
    render(el, ctx) {
      const sc = ctx.scenario;
      const seen = new Set(Store.data.payments.map((p) => p.id));
      const flash = new Set();
      el.innerHTML = pageHead({
        num: 'O5', eyebrow: 'Pilotage · Facturation', title: 'Facturation & paiements',
        lead: 'Suivi des honoraires de formation : un paiement est créé dès qu\'un formateur s\'engage sur une session.',
        actions: `<button class="btn btn-soft" id="o5-exp">${icon('download', { cls: 'sm' })}Exporter (CSV)</button>`
      }) + '<div id="o5-body"></div>';
      const host = el.querySelector('#o5-body');
      const ORDER = { en_attente: 0, en_cours: 1, 'payé': 2 };

      function draw() {
        const pays = (sc === 'vide' ? [] : Store.data.payments).slice().sort((a, b) => (ORDER[a.status] - ORDER[b.status]) || ((b.date || '9') > (a.date || '9') ? 1 : -1));
        const sum = (st) => pays.filter((p) => p.status === st).reduce((a, p) => a + p.amount, 0);
        const cnt = (st) => pays.filter((p) => p.status === st).length;
        host.innerHTML = `
          <div class="grid-3">
            ${stat({ i: 0, icon: 'check-circle', color: 'ok', label: 'Payé', num: Store.fmtMoney(sum('payé')), sub: `${cnt('payé')} paiement${cnt('payé') > 1 ? 's' : ''}` })}
            ${stat({ i: 1, icon: 'clock', color: 'blue', label: 'En cours de traitement', num: Store.fmtMoney(sum('en_cours')), sub: `${cnt('en_cours')} paiement${cnt('en_cours') > 1 ? 's' : ''}` })}
            ${stat({ i: 2, icon: 'banknote', color: 'orange', label: 'En attente', num: Store.fmtMoney(sum('en_attente')), sub: `${cnt('en_attente')} paiement${cnt('en_attente') > 1 ? 's' : ''} à traiter` })}
          </div>
          ${pays.length ? `<div class="table-wrap mt-3 reveal" style="--i:3"><table class="table">
            <thead><tr><th>Formateur</th><th>Session</th><th class="num-cell">Montant</th><th>Statut</th><th>Date</th><th>Action</th></tr></thead>
            <tbody>${pays.map((p) => {
              const s = Store.session(p.sessionId), isNew = !seen.has(p.id) || flash.has(p.id);
              return `<tr class="${isNew ? 'flash-in' : ''}">
                <td><div class="person">${avatar(p.trainerId, { size: 'sm' })}<b>${esc(Store.person(p.trainerId).fullName || nameOf(p.trainerId))}</b></div></td>
                <td>${esc(p.label)}${s ? `<div class="xs muted">${Store.fmtDateMid(s.date)}</div>` : ''}</td>
                <td class="num-cell"><b>${Store.fmtMoney(p.amount)}</b></td>
                <td>${statusPill(p.status)}</td>
                <td>${p.date ? Store.fmtDateMid(p.date) : '<span class="muted">—</span>'}</td>
                <td>${p.status === 'payé' ? '<span class="muted small">Réglé</span>' : `<button class="btn btn-soft btn-sm" data-pay="${p.id}">${icon('check', { cls: 'sm' })}Marquer payé</button>`}</td></tr>`;
            }).join('')}</tbody></table></div>`
            : `<div class="mt-3">${empty({ icon: 'banknote', color: 'teal', title: 'Aucun paiement', text: 'Les paiements apparaîtront dès qu\'un formateur s\'engage sur une session.' })}</div>`}`;
        host.querySelectorAll('[data-pay]').forEach((b) => b.addEventListener('click', () => {
          const p = Store.data.payments.find((x) => x.id === b.dataset.pay);
          confirm({
            eyebrow: 'Facturation', title: 'Marquer ce paiement comme payé ?', ok: 'Confirmer le paiement',
            text: `${esc(Store.fmtMoney(p.amount))} à <b>${esc(nameOf(p.trainerId))}</b> pour « ${esc(p.label)} ». Le formateur sera notifié.`,
            onOk() { Store.markPaid(p.id); toast(`Paiement enregistré — visible chez ${esc(nameOf(p.trainerId))}`, 'ok', { icon: 'banknote' }); }
          });
        }));
      }
      draw();
      el.querySelector('#o5-exp').addEventListener('click', () => toast('Export CSV généré (démonstration — aucun fichier réel).', 'info', { icon: 'download' }));
      ctx.on('payments', (pl) => { if (pl && pl.id) flash.add(pl.id); draw(); });
      ctx.on('sessions', () => { draw(); });
    }
  });

  /* =====================================================================
     O6 — Gouvernance des badges
     ===================================================================== */
  App.view({
    id: 'O6', path: '/o/badges', roles: ['observateur'], phase: 'pilotage', title: 'Gouvernance des badges',
    render(el, ctx) {
      const badges = Store.data.badges;
      const hist = [];
      badges.forEach((b) => b.awarded.forEach((a) => hist.push({ b, a })));
      hist.sort((x, y) => y.a.date.localeCompare(x.a.date));
      const tr = Store.trainers(), counts = { actif: 0, en_sursis: 0, desactive: 0 };
      tr.forEach((t) => { counts[Store.badgeStatus(t.id)]++; });
      el.innerHTML = pageHead({
        num: 'O6', eyebrow: 'Qualité & badges · Gouvernance', title: 'Gouvernance des badges',
        lead: 'Catalogue des badges Academy, règles d\'attribution et historique. Les badges valorisent les acquis, sans classement.'
      }) + `
      <div class="grid-3">${badges.map((b, i) => {
        const last = b.awarded.slice().sort((x, y) => y.date.localeCompare(x.date))[0];
        return `<article class="card value-card reveal" style="--i:${i};--accent:${ui.colorVar(b.color)}">
          <div class="row" style="gap:12px"><span class="icon-chip" style="--accent:${ui.colorVar(b.color)}">${icon(b.icon)}</span><div><h3>${esc(b.name)}</h3><span class="small muted">${b.awarded.length} attribué${b.awarded.length > 1 ? 's' : ''}</span></div></div>
          <p class="small muted mt-2"><b class="o-rule-k">Règle</b> ${esc(b.rule)}</p>
          ${last ? `<p class="xs dim mt-1">Dernière attribution : ${Store.fmtDateMid(last.date)} — ${esc(nameOf(last.personId))}</p>` : ''}
        </article>`;
      }).join('')}</div>
      <div class="grid-main mt-4">
        <div class="reveal" style="--i:6"><div class="section-title" style="margin-top:0"><h2>Historique d'attribution</h2><span class="small muted">${hist.length} badges attribués</span></div>
          <div class="table-wrap"><table class="table"><thead><tr><th>Date</th><th>Participant</th><th>Badge</th></tr></thead><tbody>
            ${hist.map(({ b, a }) => `<tr><td style="white-space:nowrap">${Store.fmtDateMid(a.date)}</td>
              <td><div class="person">${avatar(a.personId, { size: 'sm' })}<b>${esc(Store.person(a.personId).fullName || nameOf(a.personId))}</b></div></td>
              <td>${pill(b.name, b.color === 'red' ? 'purple' : b.color, { icon: b.icon })}</td></tr>`).join('')}</tbody></table></div></div>
        <aside class="card reveal" style="--i:7;align-self:start">
          <div class="card-title"><h3>Badge formateur</h3>${pill('2 / an', 'blue')}</div>
          <p class="small muted">Un formateur conserve son badge en animant ou programmant <b>2 formations par année civile</b>.</p>
          <div class="timeline mt-3">
            <div class="tl-item warn"><div class="tl-date">1er septembre</div><div class="tl-title">Première alerte</div><div class="tl-text">Message d'encouragement aux formateurs sous le seuil.</div></div>
            <div class="tl-item warn"><div class="tl-date">1er novembre</div><div class="tl-title">Statut « En sursis »</div><div class="tl-text">Relance personnalisée et propositions de sessions.</div></div>
            <div class="tl-item future"><div class="tl-date">1er janvier</div><div class="tl-title">Désactivation</div><div class="tl-text">Le badge est désactivé s'il manque une formation ; il se réactive dès le seuil atteint.</div></div>
          </div>
          <div class="chips mt-3">${statusPill('actif')}<b>${counts.actif}</b>${statusPill('en_sursis')}<b>${counts.en_sursis}</b>${statusPill('desactive')}<b>${counts.desactive}</b></div>
        </aside>
      </div>`;
    }
  });

  /* =====================================================================
     O7 — Qualité & amélioration continue (LET'S RATE!)
     ===================================================================== */
  function spark(vals) {
    const W = 96, H = 30, min = 3.5, max = 5, p = 4;
    const x = (i) => p + (i * (W - 2 * p)) / (vals.length - 1), y = (v) => p + (1 - (v - min) / (max - min)) * (H - 2 * p);
    const d = vals.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
    return `<svg class="o-spark" viewBox="0 0 ${W} ${H}" role="img" aria-label="Tendance sur ${vals.length} périodes : de ${fmt1(vals[0])} à ${fmt1(vals[vals.length - 1])}"><path d="${d}" fill="none" stroke="var(--teal)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="${x(vals.length - 1)}" cy="${y(vals[vals.length - 1])}" r="3.2" fill="var(--teal)"/></svg>`;
  }

  App.view({
    id: 'O7', path: '/o/qualite', roles: ['observateur'], phase: 'pilotage', title: 'Qualité & amélioration continue',
    render(el, ctx) {
      const sc = ctx.scenario;
      el.innerHTML = pageHead({
        num: 'O7', eyebrow: 'Qualité & badges · LET\'S RATE!', title: 'Qualité & amélioration continue',
        lead: 'Satisfaction à chaud et à froid, par formation, avec les points forts et axes de progression repérés.',
        actions: `<button class="btn btn-soft" id="o7-exp">${icon('download', { cls: 'sm' })}Exporter le rapport</button>`
      }) + '<div id="o7-body"></div>';
      const host = el.querySelector('#o7-body');

      function draw() {
        const q = (sc === 'vide' ? [] : Store.data.quality).slice().sort((a, b) => (Store.formation(a.formationId).title).localeCompare(Store.formation(b.formationId).title, 'fr'));
        const tot = q.reduce((a, r) => a + r.answers, 0) || 1;
        const hot = q.reduce((a, r) => a + r.hot * r.answers, 0) / tot, cold = q.reduce((a, r) => a + r.cold * r.answers, 0) / tot;
        const verb = sc === 'vide' ? [] : Store.data.evaluations.filter((e) => e.comment);
        const gps = sc === 'vide' ? [] : Store.data.goodPractices;
        const extra = sc === 'vide' ? [] : Store.data.posts.filter((p) => p.type === 'bonne_pratique' && !p.gpId && !p.fromRate);
        const monthly = Store.data.monthly;
        host.innerHTML = `
          ${banner({ color: 'teal', icon: 'heart', html: '<b>Pas de classement de formateurs :</b> la qualité se lit par formation, dans une logique d\'amélioration continue.' })}
          ${q.length ? `
          <div class="grid-main mt-3">
            <div class="card reveal" style="--i:1"><div class="card-title"><h3>Tendance Academy</h3><span class="small muted">satisfaction à chaud, sur 5</span></div>
              ${trend(monthly.map((m) => ({ label: m.month, value: m.satisfaction })), { ref: Store.data.academyAverage, refLabel: 'Repère Academy', min: 4, max: 5, label: 'Tendance de satisfaction Academy' })}</div>
            <div class="stack" style="gap:var(--s-3)">
              ${stat({ i: 2, icon: 'star', color: 'orange', label: 'À chaud (pondéré)', num: `${fmt1(hot)}<small> / 5</small>`, sub: `${tot} réponses` })}
              ${stat({ i: 3, icon: 'clock', color: 'teal', label: 'À froid (pondéré)', num: `${fmt1(cold)}<small> / 5</small>`, sub: 'évaluation à 3 mois' })}
            </div>
          </div>
          <div class="section-title"><h2>Qualité par formation</h2><span class="small muted">ordre alphabétique</span></div>
          <div class="table-wrap reveal" style="--i:4"><table class="table o-q">
            <thead><tr><th>Formation</th><th style="min-width:130px">À chaud</th><th style="min-width:130px">À froid</th><th class="num-cell">Réponses</th><th>Tendance</th><th>Point fort</th><th>Axe de progression</th><th></th></tr></thead>
            <tbody>${q.map((r) => `<tr>
              <td><b title="${esc(Store.formation(r.formationId).title)}">${esc(Store.formation(r.formationId).short)}</b></td>
              <td><div class="o-score">${scoreBar(r.hot)}<b>${fmt1(r.hot)}</b></div></td>
              <td><div class="o-score">${scoreBar(r.cold)}<b>${fmt1(r.cold)}</b></div></td>
              <td class="num-cell">${r.answers}</td><td>${spark(r.trend)}</td>
              <td><span class="o-tag o-strength">${icon('thumbs-up', { cls: 'sm' })}${esc(r.strength)}</span></td>
              <td><span class="o-tag o-axis">${icon('target', { cls: 'sm' })}${esc(r.axis)}</span></td>
              <td><button class="btn btn-ghost btn-sm" data-coach="${r.formationId}" title="Proposer un coaching">${icon('hand-heart', { cls: 'sm' })}Coaching</button></td></tr>`).join('')}</tbody></table></div>`
          : '<div class="mt-3">' + empty({ icon: 'star', color: 'teal', title: 'Pas encore d\'évaluations', text: 'Les évaluations à chaud et à froid alimenteront cette vue.' }) + '</div>'}
          ${verb.length ? `<div class="section-title"><h2>Verbatims anonymisés</h2><span class="pill outline">${icon('lock', { cls: 'sm' })}Anonymes</span></div>
            <div class="grid-2">${verb.slice(0, 6).map((e, i) => `<figure class="o-quote reveal" style="--i:${i}"><blockquote>« ${esc(e.comment)} »</blockquote><figcaption>${esc(SHORT(Store.session(e.sessionId)))} · participant</figcaption></figure>`).join('')}</div>` : ''}
          ${gps.length || extra.length ? `<div class="section-title"><h2>Bonnes pratiques repérées</h2><span class="small muted">à partager avec la communauté</span></div>
            <div class="grid-3">${gps.map((g, i) => `<article class="card reveal" style="--i:${i}"><div class="row" style="gap:10px"><span class="icon-chip" style="--accent:var(--teal-ink)">${icon('lightbulb', { cls: 'sm' })}</span><div><b>${esc(g.title)}</b><div class="xs muted">${esc((Store.formation(g.formationId) || {}).short || '')}</div></div></div>
              <p class="small muted mt-2">${esc(g.text)}</p>
              <div class="mt-2">${g.shared ? pill('Publiée dans LET\'S SHARE!', 'teal', { icon: 'check' }) : `<button class="btn btn-soft btn-sm" data-share="${g.id}">${icon('share', { cls: 'sm' })}Mettre en avant dans LET'S SHARE!</button>`}</div></article>`).join('')}
              ${extra.map((p) => `<article class="card"><div class="row" style="gap:10px">${avatar(p.authorId, { size: 'sm' })}<b>${esc(nameOf(p.authorId))}</b></div><p class="small muted mt-2">${esc(p.text)}</p><div class="mt-2">${pill('Dans LET\'S SHARE!', 'teal', { icon: 'check' })}</div></article>`).join('')}</div>` : ''}`;
        host.querySelectorAll('[data-share]').forEach((b) => b.addEventListener('click', () => {
          const g = Store.data.goodPractices.find((x) => x.id === b.dataset.share);
          Store.addPost({ authorId: 'leila', type: 'bonne_pratique', fromRate: true, gpId: g.id, text: `Bonne pratique repérée (${(Store.formation(g.formationId) || {}).short}) : ${g.title}. ${g.text}` });
          Store.markGoodPracticeShared(g.id);
          toast(`Bonne pratique mise en avant — ${mobileLink('Voir dans LET\'S SHARE!')}`, 'ok', { icon: 'share', duration: 6000 });
          draw();
        }));
        host.querySelectorAll('[data-coach]').forEach((b) => b.addEventListener('click', () => coachModal(b.dataset.coach)));
      }
      function coachModal(fid) {
        const f = Store.formation(fid), r = Store.data.quality.find((x) => x.formationId === fid);
        modal({
          eyebrow: 'Amélioration continue', title: `Proposer un coaching — ${f.short}`,
          body: `<div class="insight progress-axis"><span class="icon-chip" style="--accent:var(--blue)">${icon('target')}</span><div><span class="kicker">Axe de progression</span><h4>${esc(r.axis)}</h4><p>Un temps d'échange entre pairs, sans enjeu d'évaluation, pour construire ensemble des pistes.</p></div></div>
            <div class="field mt-2"><label for="o7-who">Formateur invité</label><select class="select" id="o7-who">${f.trainerIds.map((t) => `<option value="${t}">${esc(Store.person(t).fullName || nameOf(t))}</option>`).join('')}</select></div>
            <div class="field mt-2"><label for="o7-msg">Message</label><textarea class="textarea" id="o7-msg" rows="4">Bonjour, bravo pour « ${esc(f.short)} » (point fort : ${esc(r.strength.toLowerCase())}). Seriez-vous disponible pour un échange de 30 minutes sur « ${esc(r.axis.toLowerCase())} » ? L'équipe Academy peut vous mettre en relation avec un pair.</textarea></div>`,
          foot: `<button class="btn btn-ghost" data-close>Annuler</button><button class="btn btn-primary" data-ok>${icon('send', { cls: 'sm' })}Envoyer la proposition</button>`,
          onOpen(m, close) {
            m.querySelector('[data-ok]').addEventListener('click', () => {
              const who = m.querySelector('#o7-who').value;
              // MOCK : en production, notification + e-mail au formateur
              Store.notify(who, { icon: 'hand-heart', text: `L'équipe Academy vous propose un temps d'échange autour de « ${f.short} »`, route: Store.data.users[who] ? Store.data.users[who].home : undefined });
              Store.save(); close();
              toast(`Proposition de coaching envoyée à ${esc(nameOf(who))}`, 'ok', { icon: 'hand-heart' });
            });
          }
        });
      }
      draw();
      el.querySelector('#o7-exp').addEventListener('click', () => toast('Rapport qualité exporté (démonstration — aucun fichier réel).', 'info', { icon: 'download' }));
      onAny(ctx, ['evaluations', 'posts', 'goodPractices'], () => draw());
    }
  });
})();
