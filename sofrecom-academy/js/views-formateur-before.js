/* =====================================================================
   Formateur (Karim M.) — Dashboard (W1) + phase Before (W2 → W8)
   MOCK : toutes les données viennent du Store en mémoire.
   ===================================================================== */
(function () {
  const { icon, esc, avatar, avatarStack, pill, statusPill, pageHead, stat, gauge, banner, empty, toast, modal } = window.ui;
  const K = 'karim';
  const S = () => window.Store;
  const ME = () => S().data.users[K];

  /* ---------- Helpers ---------- */
  const pad = (n) => String(n).padStart(2, '0');
  const iso = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;
  const isoOf = (dt) => iso(dt.getFullYear(), dt.getMonth(), dt.getDate());
  const addDays = (isoStr, n) => { const d = S().parseDate(isoStr); d.setDate(d.getDate() + n); return isoOf(d); };
  const today = () => window.SFA_TODAY;
  const FORMAT_ICON = { 'Présentiel': 'building', 'Distanciel': 'video', 'Hybride': 'layers' };
  const mySessions = () => S().sessionsOfTrainer(K).filter((s) => s.status !== 'annulée');
  const upcomingMine = () => mySessions().filter((s) => s.status !== 'terminée' && s.date >= today()).sort((a, b) => a.date.localeCompare(b.date));
  const metaLine = (s) => `<span class="meta-item">${icon('calendar', { cls: 'sm' })}${S().fmtDate(s.date)}</span><span class="meta-item">${icon('map-pin', { cls: 'sm' })}${esc(s.location)}</span><span class="meta-item">${icon(FORMAT_ICON[s.format] || 'layers', { cls: 'sm' })}${esc(s.format)}</span>`;
  const trainerPill = (s) => (s.trainerId ? `<span class="pill outline">${icon('user', { cls: 'sm' })}${esc(S().person(s.trainerId).name)}</span>` : pill('Sans animateur', 'red', { dot: true }));
  const sessionG = (s, liveId) => gauge({ value: s.inscrits.length, min: s.min, max: s.max, liveId });
  const prereqChips = (f) => (f.prerequisites && f.prerequisites.length ? f.prerequisites.map((p) => `<span class="pill outline">${p.badgeId ? icon('award', { cls: 'sm' }) : ''}${esc(p.label)}</span>`).join('') : '<span class="pill outline">Aucun prérequis</span>');
  const myAvg = () => { const h = S().data.trainerHistory[K] || []; return h.length ? h[h.length - 1].avg : null; };

  /* =====================================================================
     W1 — Tableau de bord
     ===================================================================== */
  App.view({
    id: 'W1', path: '/f/dashboard', roles: ['formateur'], phase: 'hub', title: 'Tableau de bord',
    render(el, ctx) {
      const St = S();
      const year = St.trainerYear(K);
      const status = St.badgeStatus(K);
      const mine = upcomingMine();
      const empt = ctx.scenario === 'vide';
      const next = empt ? [] : mine.slice(0, 3);
      const open = empt ? [] : St.openSessions().slice(0, 3);
      const inscritsAVenir = empt ? 0 : mine.reduce((a, s) => a + s.inscrits.length, 0);

      let bn = '';
      if (status !== 'actif') {
        bn = banner({ color: 'orange', icon: 'alert-triangle', role: 'alert',
          html: `<b>${year.total}/2 formations animées en 2026 — badge en sursis au 1er novembre</b><div class="small muted">Il vous manque ${2 - year.total} session${2 - year.total > 1 ? 's' : ''} d'ici fin décembre pour conserver votre badge Formateur certifié.</div>`,
          actions: `<div class="row banner-actions"><a class="btn btn-primary btn-sm" href="#/before/dispos">Déclarer mes dispos</a><a class="btn btn-soft btn-sm" href="#/before/sessions-ouvertes">Voir les sessions ouvertes</a></div>` });
      } else {
        bn = banner({ color: 'ok', icon: 'badge-check',
          html: `<b>Seuil annuel atteint ${Math.min(year.total, 2)}/2</b><div class="small muted">Votre badge Formateur certifié est actif. Merci pour votre engagement.</div>`,
          actions: `<a class="btn btn-soft btn-sm" href="#/transverse/badge">Voir mon badge</a>` });
      }

      let alerts = '';
      if (ctx.scenario === 'alerte') {
        const low = St.data.sessions.filter((s) => s.status !== 'terminée' && s.date >= today() && s.inscrits.length < s.min);
        alerts += banner({ color: 'red', icon: 'alert-triangle', role: 'alert',
          html: '<b>Alerte logistique — salle Carthage</b><div class="small muted">Le vidéoprojecteur de la session « Cloud &amp; 5G » du 24 nov. est signalé en panne. L\'équipe Academy a été prévenue.</div>',
          actions: '<a class="btn btn-soft btn-sm" href="#/before/session/s-cloud5g-1124">Voir la session</a>' });
        low.slice(0, 1).forEach((s) => {
          alerts += banner({ color: 'orange', icon: 'users', role: 'alert',
            html: `<b>Sous-effectif — ${esc(St.sessionTitle(s))}</b><div class="small muted">${s.inscrits.length} inscrits pour un minimum de ${s.min} (${St.fmtDateShort(s.date)}). Pensez à relayer la session.</div>`,
            actions: `<a class="btn btn-soft btn-sm" href="#/before/session/${s.id}">Ouvrir</a>` });
        });
      }

      const timeline = next.length
        ? `<div class="timeline">${next.map((s) => `<div class="tl-item ${s.status === 'confirmée' ? '' : 'warn'}">
            <div class="tl-date">${St.fmtDate(s.date)} · ${esc(s.time)}</div>
            <a class="tl-title" href="#/before/session/${s.id}">${esc(St.sessionTitle(s))}</a>
            <div class="tl-text">${icon('map-pin', { cls: 'sm' })} ${esc(s.location)} · ${s.inscrits.length}/${s.max} inscrits</div></div>`).join('')}</div>`
        : (empt || !open.length
          ? empty({ icon: 'calendar', title: 'Aucune session à venir', text: 'Vous n\'avez aucune session programmée. Déclarez vos disponibilités ou positionnez-vous sur une session ouverte.', cta: '<a class="btn btn-primary" href="#/before/dispos">Déclarer mes dispos</a>' })
          : `<p class="small muted mb-2">Vous n'avez pas encore de session programmée. Ces sessions cherchent un animateur :</p><div class="timeline">${open.map((s) => `<div class="tl-item warn">
            <div class="tl-date">${St.fmtDate(s.date)}</div>
            <a class="tl-title" href="#/before/sessions-ouvertes">${esc(St.sessionTitle(s))}</a>
            <div class="tl-text">${esc(s.location)} · ${s.inscrits.length} inscrits ${pill('Sans animateur', 'red')}</div></div>`).join('')}</div>`);

      el.innerHTML = `
        ${pageHead({ num: 'W1', eyebrow: 'Accueil formateur', title: `Bonjour ${ME().name.split(' ')[0]}`, lead: 'Votre activité de formateur en un coup d\'œil : sessions, seuil annuel du badge et raccourcis pour animer.',
          actions: '<a class="btn btn-primary" href="#/before/sessions-ouvertes">' + icon('calendar-plus', { cls: 'sm' }) + ' Sessions ouvertes</a>' })}
        <div class="stack">
          ${bn}${alerts}
          <div class="grid-4">
            ${stat({ num: `${year.total} / ${year.threshold}`, label: 'Formations 2026', sub: `${year.done} animée${year.done > 1 ? 's' : ''} · ${year.scheduled} programmée${year.scheduled > 1 ? 's' : ''}`, icon: 'graduation-cap', color: 'blue', i: 1 })}
            ${stat({ num: inscritsAVenir, label: 'Inscrits à venir', sub: next.length ? `sur ${mine.length} session${mine.length > 1 ? 's' : ''}` : 'aucune session programmée', icon: 'users', color: 'teal', i: 2 })}
            ${stat({ num: St.fmtNum(myAvg()), label: 'Note moyenne', sub: `repère Academy ${St.fmtNum(St.data.academyAverage)}`, icon: 'star', color: 'orange', i: 3 })}
            ${stat({ num: statusPill(status), label: 'Statut du badge', sub: status === 'actif' ? 'Seuil annuel atteint' : 'Seuil annuel : 2 formations', icon: 'award', color: status === 'actif' ? 'ok' : 'orange', i: 4 })}
          </div>
          <div class="grid-main">
            <section class="card reveal" aria-labelledby="w1-next">
              <div class="card-title"><h3 id="w1-next">Mes prochaines sessions</h3><a class="btn btn-ghost btn-sm" href="#/before/calendrier">Calendrier ${icon('arrow-right', { cls: 'sm' })}</a></div>
              ${timeline}
            </section>
            <div class="stack">
              <section class="live reveal">
                <h3>Déclarer mes dispos</h3>
                <p class="small mt-1">Indiquez vos créneaux matin / après-midi pour que l'équipe Academy puisse vous proposer des sessions.</p>
                <a class="btn btn-white mt-2" href="#/before/dispos">${icon('calendar-check', { cls: 'sm' })} Déclarer mes dispos</a>
              </section>
              <section class="card reveal">
                <div class="card-title"><h3>Raccourcis</h3></div>
                <div class="shortcuts">
                  <a class="shortcut" href="#/during/seance"><span class="icon-chip" style="--accent:var(--green-ok)">${icon('monitor', { cls: 'sm' })}</span><span class="grow"><b>Mode séance</b><small>Présence, quiz, feedback</small></span>${icon('chevron-right', { cls: 'sm' })}</a>
                  <a class="shortcut" href="#/after/progression"><span class="icon-chip" style="--accent:var(--teal)">${icon('trending-up', { cls: 'sm' })}</span><span class="grow"><b>Ma progression</b><small>Mes évaluations, sans classement</small></span>${icon('chevron-right', { cls: 'sm' })}</a>
                  <button class="shortcut" type="button" data-assist><span class="icon-chip" style="--accent:var(--teal)">${icon('sparkles', { cls: 'sm' })}</span><span class="grow"><b>Smart Assist</b><small>Générer quiz, résumés, relances</small></span>${icon('chevron-right', { cls: 'sm' })}</button>
                </div>
              </section>
            </div>
          </div>
        </div>`;
      el.querySelector('[data-assist]').addEventListener('click', () => { if (App.openSmartAssist) App.openSmartAssist(); else toast('Smart Assist arrive bientôt', 'smart'); });
      ['sessions', 'inscriptions', 'dispos'].forEach((t) => ctx.on(t, () => ctx.refresh()));
    }
  });

  /* =====================================================================
     W2 — Mes formations
     ===================================================================== */
  App.view({
    id: 'W2', path: '/before/formations', roles: ['formateur'], phase: 'before', title: 'Mes formations',
    render(el, ctx) {
      const St = S();
      let fStatus = 'all', q = '', mode = 'table';
      const mineF = () => (ctx.scenario === 'vide' ? [] : St.data.formations.filter((f) => (f.trainerIds || []).includes(K) || f.authorId === K));
      const nextSession = (f) => St.data.sessions.filter((s) => s.formationId === f.id && s.status !== 'terminée' && s.date >= today() && (s.trainerId === K || !s.trainerId)).sort((a, b) => a.date.localeCompare(b.date))[0];
      const role = (f) => (f.authorId === K ? 'Auteur' : 'Animateur');
      const note = (f) => {
        const p = St.data.proposals.find((x) => x.id === f.proposalId);
        return p && p.comment && ['modifs', 'refusée'].includes(f.status) ? `<div class="small muted mt-1">${icon('message-square', { cls: 'sm' })} Leïla : « ${esc(p.comment)} »</div>` : '';
      };
      el.innerHTML = `
        ${pageHead({ num: 'W2', eyebrow: 'Before · Mes formations', title: 'Mes formations', lead: 'Les formations que vous animez et celles que vous avez proposées, avec leur statut de validation.',
          actions: `<a class="btn btn-primary" href="#/before/proposer">${icon('plus', { cls: 'sm' })} Proposer une formation</a>` })}
        <div class="toolbar reveal">
          <div class="input-icon grow">${icon('search', { cls: 'sm' })}<label class="sr-only" for="w2q">Rechercher</label><input class="input" id="w2q" placeholder="Rechercher une formation…" autocomplete="off"></div>
          <label class="sr-only" for="w2s">Statut</label>
          <select class="select toolbar-select" id="w2s"><option value="all">Tous les statuts</option><option value="validée">Validée</option><option value="en_attente">En attente de validation</option><option value="modifs">Modifications demandées</option><option value="refusée">Refusée</option></select>
          <div class="seg" role="group" aria-label="Affichage"><button type="button" data-mode="table" aria-pressed="true">${icon('list', { cls: 'sm' })} Tableau</button><button type="button" data-mode="cards" aria-pressed="false">${icon('grid', { cls: 'sm' })} Cartes</button></div>
        </div>
        <div id="w2list" class="mt-2" aria-live="polite"></div>`;
      const box = el.querySelector('#w2list');
      function draw(flashId) {
        const list = mineF().filter((f) => (fStatus === 'all' || f.status === fStatus) && (!q || (f.title + f.theme).toLowerCase().includes(q)));
        if (!list.length) { box.innerHTML = empty({ icon: 'book-open', title: 'Aucune formation', text: ctx.scenario === 'vide' ? 'Vous n\'avez pas encore de formation.' : 'Aucune formation ne correspond à ces filtres.', cta: '<a class="btn btn-primary" href="#/before/proposer">Proposer une formation</a>' }); return; }
        if (mode === 'table') {
          box.innerHTML = `<div class="table-wrap reveal"><table class="table"><thead><tr><th>Formation</th><th>Statut</th><th>Rôle</th><th>Format</th><th>Prochaine session</th><th class="num-cell">Note</th></tr></thead><tbody>
            ${list.map((f) => { const s = nextSession(f); return `<tr data-fid="${f.id}" class="${f.id === flashId ? 'flash-in' : ''}">
              <td><a class="strong" href="#/catalogue/${f.id}">${esc(f.title)}</a><div class="small muted">${esc(f.theme)} · ${esc(f.level)} · ${f.durationDays} j</div>${note(f)}</td>
              <td>${statusPill(f.status)}</td><td>${role(f)}</td><td>${esc(f.format)}</td>
              <td>${s ? `<a href="#/before/session/${s.id}">${St.fmtDateShort(s.date)} · ${s.inscrits.length}/${s.max}</a>` : '<span class="dim">—</span>'}</td>
              <td class="num-cell">${f.rating ? St.fmtNum(f.rating) : '—'}</td></tr>`; }).join('')}</tbody></table></div>`;
        } else {
          box.innerHTML = `<div class="grid-3">${list.map((f) => { const s = nextSession(f); return `<article class="card f-card ${f.id === flashId ? 'flash-in' : ''}" style="--accent:${ui.colorVar(f.color)}" data-fid="${f.id}">
            <div class="row between">${statusPill(f.status)}<span class="small muted">${role(f)}</span></div>
            <h3><a href="#/catalogue/${f.id}">${esc(f.title)}</a></h3>
            <div class="small muted">${esc(f.theme)} · ${esc(f.level)} · ${esc(f.format)} · ${f.durationDays} j</div>${note(f)}
            <div class="f-card-foot">${s ? `<a class="btn btn-soft btn-sm" href="#/before/session/${s.id}">${icon('calendar', { cls: 'sm' })} ${St.fmtDateShort(s.date)} · ${s.inscrits.length}/${s.max}</a>` : '<span class="small dim">Aucune session à venir</span>'}<a class="btn btn-ghost btn-sm" href="#/catalogue/${f.id}">Fiche ${icon('arrow-right', { cls: 'sm' })}</a></div></article>`; }).join('')}</div>`;
        }
      }
      draw();
      el.querySelector('#w2q').addEventListener('input', (e) => { q = e.target.value.trim().toLowerCase(); draw(); });
      el.querySelector('#w2s').addEventListener('change', (e) => { fStatus = e.target.value; draw(); });
      el.querySelectorAll('[data-mode]').forEach((b) => b.addEventListener('click', () => { mode = b.dataset.mode; el.querySelectorAll('[data-mode]').forEach((x) => x.setAttribute('aria-pressed', x === b)); draw(); }));
      ctx.on('proposals', (p) => { draw(p && p.id ? (S().data.formations.find((f) => f.proposalId === p.id) || {}).id : null); });
      ctx.on('sessions', () => draw());
    }
  });

  /* =====================================================================
     W3 — Détail session + inscriptions en direct
     ===================================================================== */
  App.view({
    id: 'W3', path: '/before/session/:id', roles: ['formateur'], phase: 'before', title: 'Inscriptions en direct',
    render(el, ctx) {
      const St = S();
      const sid = ctx.params.id;
      const s0 = St.session(sid);
      if (!s0) { el.innerHTML = empty({ icon: 'calendar', title: 'Session introuvable', cta: '<a class="btn btn-primary" href="#/before/formations">Mes formations</a>' }); return; }
      const f = St.formation(s0.formationId);
      const isFil = sid === window.SFA_FIL_ROUGE;
      const sess = () => St.session(sid);
      let known = new Set(sess().inscrits);
      let knownPending = new Set(sess().pending);
      let lastCount = sess().inscrits.length;
      const feed = [{ text: 'Ouverture des inscriptions', at: '11 nov. 09:00' }];

      const personRow = (pid, cls = '') => { const p = St.person(pid); return `<li class="person-row ${cls}" data-pid="${pid}">${avatar(p)}<div class="grow"><b>${esc(p.fullName || p.name)}</b><div class="small muted">${esc(p.title || '')}</div></div>${cls ? pill('Nouveau', 'teal', { dot: true }) : ''}</li>`; };
      const pendingRow = (pid, cls = '') => { const p = St.person(pid); const mot = (sess().motivations || {})[pid];
        return `<li class="pending-row ${cls}" data-pid="${pid}"><div class="row">${avatar(p)}<div class="grow"><b>${esc(p.fullName || p.name)}</b><div class="small muted">${esc(p.title || '')}</div></div>${pill('En attente', 'orange', { dot: true })}</div>
          ${mot ? `<p class="small quote">« ${esc(mot)} »</p>` : ''}
          <div class="row end"><button class="btn btn-ghost btn-sm" data-decline="${pid}">Décliner</button><button class="btn btn-ok btn-sm" data-confirm="${pid}">${icon('check', { cls: 'sm' })} Confirmer</button></div></li>`; };

      function alertHtml() {
        const s = sess(); const fl = St.fill(s);
        if (fl.low) return banner({ color: 'orange', icon: 'alert-triangle', role: 'alert', html: `<b>Sous-effectif : alerter l'équipe Academy</b><div class="small muted">${fl.n} inscrits pour un minimum de ${s.min}. La session risque d'être annulée si le seuil n'est pas atteint.</div>`, actions: '<button class="btn btn-primary btn-sm" id="w3alert">Alerter l\'équipe</button>' });
        if (fl.full) return banner({ color: 'teal', icon: 'check-circle', html: `<b>Session complète</b><div class="small muted">${fl.n}/${s.max} places occupées. Les nouvelles demandes passent en liste d'attente.</div>` });
        return '';
      }
      function shell() {
        const s = sess(); const k = St.data.kpis[sid]; const live = s.live || {};
        el.innerHTML = `
          ${pageHead({ num: 'W3', eyebrow: 'Before · Inscriptions en direct', title: St.sessionTitle(s), lead: 'Suivez en temps réel les inscriptions et confirmez les demandes en attente.',
            actions: `<a class="btn btn-soft" href="#/catalogue/${s.formationId}">${icon('file-text', { cls: 'sm' })} Fiche catalogue</a>` })}
          <div class="stack">
            <section class="card reveal session-head">
              <div class="row between wrap"><div class="row wrap gap-1"><span class="id-tag">${esc(s.code)}</span>${trainerPill(s)}${isFil ? pill('Session fil rouge', 'blue') : ''}${statusPill(s.status)}</div></div>
              <div class="meta-line">${metaLine(s)}<span class="meta-item">${icon('clock', { cls: 'sm' })}${esc(s.time)}</span></div>
              <div id="w3gauge">${sessionG(s, 'w3count')}</div>
              <div class="row between wrap"><button class="btn btn-ghost btn-sm" id="w3check">${icon('target', { cls: 'sm' })} Vérifier la limite</button><span class="small muted">Min ${s.min} · Max ${s.max}</span></div>
            </section>
            <div id="w3banner" aria-live="polite">${alertHtml()}</div>
            <div class="reveal">
              ${ui.tabsHtml('w3', [{ id: 'before', label: 'Before · Inscrits', icon: 'users' }, { id: 'during', label: 'During · Séance', icon: 'monitor', accent: 'var(--green-ok)' }, { id: 'after', label: 'After · Résultats', icon: 'trending-up', accent: 'var(--teal)' }], 'before')}
              ${ui.tabPanel('w3', 'before', 'before', `<div class="grid-main">
                <div class="stack">
                  <section class="card" id="w3pendingCard" ${s.pending.length ? '' : 'hidden'}><div class="card-title"><h3>Demandes en attente <span id="w3pcount" class="pill orange">${s.pending.length}</span></h3></div><ul class="plain" id="w3pending" aria-live="polite">${s.pending.map((p) => pendingRow(p)).join('')}</ul></section>
                  <section class="card"><div class="card-title"><h3>Inscrits <span class="pill blue" id="w3icount">${s.inscrits.length}</span></h3></div><ul class="plain" id="w3list" aria-live="polite">${s.inscrits.map((p) => personRow(p)).join('')}</ul></section>
                </div>
                <section class="card"><div class="card-title"><h3>Activité récente</h3><span class="small muted"><span class="live-dot"></span> en direct</span></div><ul class="plain feed" id="w3feed"></ul></section>
              </div>`)}
              ${ui.tabPanel('w3', 'during', 'before', `<div class="card" id="w3during"></div>`)}
              ${ui.tabPanel('w3', 'after', 'before', `<div class="card">${k ? `<div class="grid-4">${[['Satisfaction', St.fmtNum(k.satisfaction)], ['Présence', k.presence + ' %'], ['Réussite quiz', k.reussite + ' %'], ['Recommandation', k.recommandation + ' %']].map(([l, v]) => `<div class="stat"><span class="num">${v}</span><span class="label">${l}</span></div>`).join('')}</div>` : '<p class="muted small">Les résultats seront disponibles après la séance.</p>'}<a class="btn btn-soft mt-2" href="#/after/progression">${icon('trending-up', { cls: 'sm' })} Voir ma progression</a></div>`)}
            </div>
          </div>`;
        ui.bindTabs(el);
        drawDuring(); drawFeed();
        bind();
      }
      function drawDuring() {
        const b = el.querySelector('#w3during'); if (!b) return; const live = sess().live || {};
        const state = live.started ? `${pill('Séance en cours', 'ok', { dot: true })} <span class="small muted">Quiz : ${esc(live.quiz || 'idle')} · Feedback : ${esc(live.feedback || 'idle')}</span>` : `${pill('Pas encore démarrée', '', { dot: true })} <span class="small muted">Le mode séance s'ouvre le jour J.</span>`;
        b.innerHTML = `<div class="row between wrap"><div class="row wrap gap-1">${state}</div><a class="btn btn-primary" href="#/during/seance">${icon('monitor', { cls: 'sm' })} Ouvrir le mode séance</a></div>`;
      }
      function drawFeed(add) {
        const ul = el.querySelector('#w3feed'); if (!ul) return;
        if (add) feed.unshift(add);
        ul.innerHTML = feed.slice(0, 6).map((a, i) => `<li class="${i === 0 && add ? 'flash-in' : ''}">${icon(a.icon || 'activity', { cls: 'sm' })}<span class="grow">${a.text}</span><span class="small dim">${esc(a.at)}</span></li>`).join('');
      }
      function bind() {
        const root = el;
        const a = root.querySelector('#w3alert');
        if (a) a.addEventListener('click', () => { const s = sess(); St.notify('leila', { icon: 'alert-triangle', text: `Sous-effectif : ${St.sessionTitle(s)} (${St.fmtDateShort(s.date)}) — ${s.inscrits.length}/${s.min} inscrits`, route: '#/o/sessions' }); toast('Équipe Academy alertée', 'ok', { icon: 'send' }); });
        const c = root.querySelector('#w3check');
        if (c) c.addEventListener('click', () => { const fl = St.fill(sess()); toast(fl.low ? `Sous-effectif : ${fl.n}/${sess().min} inscrits` : fl.full ? 'Session complète' : `${fl.n}/${sess().max} inscrits — ${fl.left} place${fl.left > 1 ? 's' : ''} restante${fl.left > 1 ? 's' : ''}`, fl.low ? 'warn' : 'ok'); });
        root.querySelector('#w3pending')?.addEventListener('click', onPending);
      }
      function onPending(e) {
        const c = e.target.closest('[data-confirm]'); const d = e.target.closest('[data-decline]');
        if (c) { St.confirmEnrollment(sid, c.dataset.confirm); toast(`${St.person(c.dataset.confirm).name} confirmé(e)`, 'ok'); }
        if (d) { St.declineEnrollment(sid, d.dataset.decline); toast('Demande déclinée', 'info'); }
      }
      function update(p) {
        const s = sess(); const n = s.inscrits.length;
        const gz = el.querySelector('#w3gauge'); if (!gz) return;
        gz.innerHTML = sessionG(s, 'w3count');
        if (n !== lastCount) { const c = el.querySelector('#w3count'); if (c) { c.classList.remove('pulse-once'); void c.offsetWidth; c.classList.add('pulse-once'); } }
        lastCount = n;
        el.querySelector('#w3banner').innerHTML = alertHtml();
        const a = el.querySelector('#w3alert'); if (a) a.addEventListener('click', () => { St.notify('leila', { icon: 'alert-triangle', text: `Sous-effectif : ${St.sessionTitle(s)} — ${n}/${s.min} inscrits`, route: '#/o/sessions' }); toast('Équipe Academy alertée', 'ok', { icon: 'send' }); });
        const list = el.querySelector('#w3list'); const pl = el.querySelector('#w3pending');
        list.innerHTML = s.inscrits.map((pid) => personRow(pid, known.has(pid) ? '' : 'flash-in')).join('');
        pl.innerHTML = s.pending.map((pid) => pendingRow(pid, knownPending.has(pid) ? '' : 'flash-in')).join('');
        el.querySelector('#w3pendingCard').hidden = !s.pending.length;
        el.querySelector('#w3pcount').textContent = s.pending.length;
        el.querySelector('#w3icount').textContent = n;
        if (p && p.pid) {
          const nm = St.person(p.pid).name;
          const txt = { pending: `<b>${esc(nm)}</b> demande à s'inscrire`, confirmed: `<b>${esc(nm)}</b> est confirmé(e)`, declined: `Demande de <b>${esc(nm)}</b> déclinée`, sim: `<b>${esc(nm)}</b> s'est inscrit(e)` }[p.kind];
          drawFeed({ text: txt, at: St.fmtTime(St.nowISO()) || 'à l\'instant', icon: p.kind === 'confirmed' || p.kind === 'sim' ? 'user-check' : 'user-plus' });
        }
        known = new Set(s.inscrits); knownPending = new Set(s.pending);
      }
      shell();
      ctx.on('inscriptions', (p) => { if (!p || p.sessionId === sid) update(p); });
      ctx.on('live', () => drawDuring());
      ctx.on('sessions', () => ctx.refresh());
      // MOCK : flux d'activité simulé. Jamais d'inscrit ajouté à la session fil rouge (le 9→10 vient de Sana).
      const viewers = ['hatem', 'lucie', 'walid', 'thomas', 'nizar', 'emma'];
      let tick = 0;
      ctx.every(8000, () => {
        const pid = viewers[tick++ % viewers.length];
        if (!isFil && tick % 3 === 0 && St.fill(sess()).n < sess().max) { St.simulateInscription(sid); return; }
        drawFeed({ text: `<b>${esc(St.person(pid).name)}</b> a consulté la fiche`, at: St.fmtTime(St.nowISO()) || 'à l\'instant', icon: 'eye' });
      });
    }
  });

  /* =====================================================================
     W4 — Mes disponibilités
     ===================================================================== */
  App.view({
    id: 'W4', path: '/before/dispos', roles: ['formateur'], phase: 'before', title: 'Mes disponibilités',
    render(el, ctx) {
      const St = S();
      const months = [[2026, 10], [2026, 11]];
      let mi = 0;
      const MIN_M = 0, MAX_M = months.length - 1;
      const declared = () => { let n = 0; Object.values(St.data.dispos[K] || {}).forEach((d) => { if (d.am === 'dispo') n++; if (d.pm === 'dispo') n++; }); return n; };
      const sessOn = (date) => mySessions().find((s) => s.date === date);
      el.innerHTML = `
        ${pageHead({ num: 'W4', eyebrow: 'Before · Mes disponibilités', title: 'Mes disponibilités', lead: 'Cliquez sur un créneau pour alterner : disponible, indisponible, non renseigné.',
          actions: '<button class="btn btn-primary" id="w4save">' + icon('check', { cls: 'sm' }) + ' Enregistrer mes dispos</button>' })}
        <section class="card reveal">
          <div class="row between wrap cal-bar">
            <div class="row"><button class="btn btn-ghost btn-icon btn-sm" id="w4prev" aria-label="Mois précédent">${icon('chevron-left')}</button><h2 class="cal-title" id="w4title" aria-live="polite"></h2><button class="btn btn-ghost btn-icon btn-sm" id="w4next" aria-label="Mois suivant">${icon('chevron-right')}</button></div>
            <span class="pill teal" id="w4count" aria-live="polite"></span>
          </div>
          <div class="legend mb-2"><span><i style="background:color-mix(in srgb,var(--teal) 30%,white)"></i>Disponible</span><span><i style="background:var(--blue)"></i>Affecté</span><span><i style="background:var(--bg-2);border:1px solid var(--line-2)"></i>Indisponible</span><span><i style="border:1px dashed var(--line-2)"></i>Non renseigné</span></div>
          <div id="w4cal" class="cal-wrap"></div>
        </section>`;
      function draw() {
        const [y, m] = months[mi];
        el.querySelector('#w4title').textContent = `${St.MONTHS_LONG[m][0].toUpperCase()}${St.MONTHS_LONG[m].slice(1)} ${y}`;
        el.querySelector('#w4prev').disabled = mi === MIN_M; el.querySelector('#w4next').disabled = mi === MAX_M;
        const n = declared(); el.querySelector('#w4count').textContent = `${n} créneau${n > 1 ? 'x' : ''} déclaré${n > 1 ? 's' : ''}`;
        const first = new Date(y, m, 1); const lead = (first.getDay() + 6) % 7; const dim = new Date(y, m + 1, 0).getDate();
        let h = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((d) => `<div class="cal-dow">${d}</div>`).join('');
        for (let i = 0; i < lead; i++) h += '<div class="cal-day out" aria-hidden="true"></div>';
        for (let d = 1; d <= dim; d++) {
          const date = iso(y, m, d); const dow = (new Date(y, m, d).getDay() + 6) % 7; const we = dow >= 5;
          const dd = (St.data.dispos[K] || {})[date] || {};
          const slot = (k, long, short) => {
            const v = dd[k];
            if (v === 'affecte') { const ss = sessOn(date); const nm = ss ? St.formation(ss.formationId).short : 'Session'; return `<div class="slot affecte" title="${esc(nm)} — ${long}" aria-label="${long} : affecté, ${esc(nm)}"><span class="slot-t">${esc(nm)}</span></div>`; }
            const lbl = v === 'dispo' ? 'disponible' : v === 'indispo' ? 'indisponible' : 'non renseigné';
            return `<button type="button" class="slot ${v || ''}" data-date="${date}" data-slot="${k}" aria-label="${date} ${long} : ${lbl}">${v === 'dispo' ? icon('check', { cls: 'sm' }) : v === 'indispo' ? icon('x', { cls: 'sm' }) : ''}<span class="l-long">${long}</span><span class="l-short">${short}</span></button>`;
          };
          h += `<div class="cal-day ${we ? 'weekend' : ''} ${date === today() ? 'today' : ''}"><span class="d">${d}${date === today() ? ' <span class="today-tag">Aujourd\'hui</span>' : ''}</span>${we ? '' : slot('am', 'Matin', 'M') + slot('pm', 'Après-midi', 'AM')}</div>`;
        }
        el.querySelector('#w4cal').innerHTML = `<div class="cal">${h}</div>`;
      }
      draw();
      el.querySelector('#w4cal').addEventListener('click', (e) => {
        const b = e.target.closest('.slot[data-date]'); if (!b) return;
        const cur = (((St.data.dispos[K] || {})[b.dataset.date]) || {})[b.dataset.slot] || null;
        const nxt = cur === null ? 'dispo' : cur === 'dispo' ? 'indispo' : null;
        St.setDispo(K, b.dataset.date, b.dataset.slot, nxt); // → ctx.on('dispos') redessine
        const nb = el.querySelector(`.slot[data-date="${b.dataset.date}"][data-slot="${b.dataset.slot}"]`); if (nb) nb.focus();
      });
      ctx.on('dispos', draw);
      el.querySelector('#w4prev').addEventListener('click', () => { mi = Math.max(MIN_M, mi - 1); draw(); });
      el.querySelector('#w4next').addEventListener('click', () => { mi = Math.min(MAX_M, mi + 1); draw(); });
      // MOCK : en production, l'enregistrement enverrait les dispos à l'équipe Academy
      el.querySelector('#w4save').addEventListener('click', () => toast(`Disponibilités enregistrées — ${declared()} créneaux déclarés`, 'ok', { icon: 'check-circle' }));
    }
  });

  /* =====================================================================
     W5 — Sessions ouvertes
     ===================================================================== */
  App.view({
    id: 'W5', path: '/before/sessions-ouvertes', roles: ['formateur'], phase: 'before', title: 'Sessions ouvertes',
    render(el, ctx) {
      const St = S();
      let justDone = null;
      el.innerHTML = `${pageHead({ num: 'W5', eyebrow: 'Before · Sessions ouvertes', title: 'Sessions ouvertes', lead: 'Ces sessions cherchent un animateur. Positionnez-vous en un clic : elles comptent pour votre seuil annuel.' })}<div id="w5body" class="stack"></div>`;
      const body = el.querySelector('#w5body');
      function draw() {
        const list = ctx.scenario === 'vide' ? [] : St.openSessions();
        const year = St.trainerYear(K);
        let h = '';
        if (justDone) h += banner({ color: 'ok', icon: 'badge-check', html: `<b>Badge : seuil ${Math.min(year.total, 2)}/2 atteint</b><div class="small muted">Vous êtes positionné(e) sur « ${esc(justDone)} ». Votre badge Formateur certifié reste actif en 2026.</div>`, actions: '<a class="btn btn-soft btn-sm" href="#/f/dashboard">Tableau de bord</a>' });
        else if (St.badgeStatus(K) !== 'actif') h += banner({ color: 'orange', icon: 'alert-triangle', html: `<b>${year.total}/2 formations en 2026</b><div class="small muted">Une session de plus suffit pour atteindre le seuil annuel et conserver votre badge.</div>` });
        if (!list.length) h += empty({ icon: 'calendar-check', title: 'Aucune session ouverte', text: 'Toutes les sessions ont un animateur. Déclarez vos dispos pour être sollicité(e) en priorité.', cta: '<a class="btn btn-primary" href="#/before/dispos">Déclarer mes dispos</a>' });
        else h += `<div class="grid-3 open-grid">${list.map((s) => { const f = St.formation(s.formationId); return `<article class="card open-card" data-sid="${s.id}" style="--accent:${ui.colorVar(f.color)}">
          <div class="row between"><span class="id-tag">${esc(s.code)}</span>${pill('Sans animateur', 'red', { dot: true })}</div>
          <h3>${esc(f.title)}</h3>
          <div class="meta-col">${metaLine(s).replace(/<\/span><span/g, '</span><span')}</div>
          ${sessionG(s)}
          <div><div class="label small mb-1">Prérequis</div><div class="row wrap gap-1">${prereqChips(f)}</div></div>
          <div class="open-foot"><a class="btn btn-ghost btn-sm" href="#/before/session/${s.id}">Détail</a><button class="btn btn-primary" data-take="${s.id}">Me positionner</button></div></article>`; }).join('')}</div>`;
        body.innerHTML = h;
        body.querySelectorAll('[data-take]').forEach((b) => b.addEventListener('click', () => confirmTake(b.dataset.take)));
      }
      function confirmTake(id) {
        const s = St.session(id); const f = St.formation(s.formationId); const year = St.trainerYear(K);
        modal({ title: 'Se positionner sur cette session ?', eyebrow: 'Confirmation',
          body: `<p><b>${esc(f.title)}</b></p><p class="muted small">${St.fmtDate(s.date)} · ${esc(s.location)} · ${esc(s.format)}</p>
            <div class="banner teal mt-2"><span class="icon-chip">${icon('award')}</span><div class="grow small">Cette session comptera pour votre seuil annuel : <b>${Math.min(year.total + 1, 2)}/2</b>.</div></div>`,
          foot: '<button class="btn btn-ghost" data-close>Annuler</button><button class="btn btn-primary" id="w5ok">Confirmer</button>',
          onOpen(m, close) { m.querySelector('#w5ok').addEventListener('click', () => { close(); justDone = f.title; St.assignTrainer(id, K); toast(`Vous animez « ${f.short} » le ${St.fmtDateShort(s.date)}`, 'ok', { icon: 'check-circle' }); }); } });
      }
      draw();
      ctx.on('sessions', draw); // la carte disparaît (openSessions) et le message badge s'affiche
    }
  });

  /* =====================================================================
     W6 — Proposer une formation
     ===================================================================== */
  App.view({
    id: 'W6', path: '/before/proposer', roles: ['formateur'], phase: 'before', title: 'Proposer une formation',
    render(el, ctx) {
      const St = S();
      const form = { title: 'Edge Computing — niveau 2', theme: 'Cloud', level: 'Intermédiaire', format: 'Hybride', durationDays: 1, audience: 'Ingénieurs cloud et architectes réseau',
        objectives: 'Concevoir une architecture edge multi-sites\nDéployer une application MEC\nMesurer les gains de latence', syllabus: 'Rappels edge niveau 1\nOrchestration multi-sites\nAtelier : déployer une application MEC', description: 'Approfondissement du niveau 1 : conception, déploiement et exploitation de plateformes edge pour les opérateurs.',
        prerequisites: [{ label: 'Edge Explorer', badgeId: 'b-edge' }] };
      let step = 0; let done = null;
      const labels = ['Infos', 'Prérequis', 'Validation'];
      const lines = (t) => t.split('\n').map((x) => x.trim()).filter(Boolean);
      const THEMES = ['Cloud', 'Réseaux & 5G', 'Cybersécurité', 'Data & IA', 'Agilité', 'Fibre & Transmission'];
      const opt = (arr, v) => arr.map((x) => `<option ${x === v ? 'selected' : ''}>${esc(x)}</option>`).join('');
      el.innerHTML = `${pageHead({ num: 'W6', eyebrow: 'Before · Proposer une formation', title: 'Proposer une formation', lead: 'Soumettez votre idée à l\'équipe Academy : elle sera validée avant d\'entrer au catalogue.' })}<div id="w6" class="stack"></div>`;
      const root = el.querySelector('#w6');
      function collect() {
        const g = (id) => { const x = root.querySelector('#' + id); return x ? x.value : null; };
        ['title', 'theme', 'level', 'format', 'audience', 'objectives', 'syllabus', 'description'].forEach((k) => { const v = g('w6-' + k); if (v !== null) form[k] = v; });
        const d = g('w6-durationDays'); if (d !== null) form.durationDays = Math.max(1, Math.min(5, Number(d) || 1));
      }
      function stepper() { return `<ol class="steps reveal" aria-label="Étapes">${labels.map((l, i) => `<li class="step ${i === step ? 'is-active' : i < step ? 'is-done' : ''}" ${i === step ? 'aria-current="step"' : ''}><span class="badge">${i < step ? icon('check', { cls: 'sm' }) : i + 1}</span>${l}</li>`).join('')}</ol>`; }
      function draw() {
        if (done) {
          root.innerHTML = `<section class="card success reveal">${`<span class="icon-chip" style="--accent:var(--green-ok)">${icon('check-circle', { cls: 'lg' })}</span>`}<h2>Proposition envoyée</h2><p class="muted">« ${esc(done.title)} » a été transmise à l'équipe Academy.</p><div>${statusPill('en_attente')}</div><div class="row gap-1 wrap center"><a class="btn btn-primary" href="#/before/formations">Voir Mes formations</a><a class="btn btn-ghost" href="#/f/dashboard">Tableau de bord</a></div></section>`; return;
        }
        let body = '';
        if (step === 0) body = `<div class="form-grid">
          <div class="field span-2"><label for="w6-title">Titre de la formation</label><input class="input" id="w6-title" value="${esc(form.title)}" required></div>
          <div class="field"><label for="w6-theme">Thème</label><select class="select" id="w6-theme">${opt(THEMES, form.theme)}</select></div>
          <div class="field"><label for="w6-level">Niveau</label><select class="select" id="w6-level">${opt(['Fondamental', 'Intermédiaire', 'Avancé'], form.level)}</select></div>
          <div class="field"><label for="w6-format">Format</label><select class="select" id="w6-format">${opt(['Présentiel', 'Distanciel', 'Hybride'], form.format)}</select></div>
          <div class="field"><label for="w6-durationDays">Durée (jours)</label><input class="input" id="w6-durationDays" type="number" min="1" max="5" value="${form.durationDays}"></div>
          <div class="field span-2"><label for="w6-audience">Public cible</label><input class="input" id="w6-audience" value="${esc(form.audience)}"></div>
          <div class="field span-2"><label for="w6-description">Description</label><textarea class="textarea" id="w6-description" rows="3">${esc(form.description)}</textarea></div>
          <div class="field"><label for="w6-objectives">Objectifs pédagogiques</label><textarea class="textarea" id="w6-objectives" rows="5">${esc(form.objectives)}</textarea><span class="hint">Un objectif par ligne</span></div>
          <div class="field"><label for="w6-syllabus">Programme</label><textarea class="textarea" id="w6-syllabus" rows="5">${esc(form.syllabus)}</textarea><span class="hint">Un module par ligne</span></div></div>`;
        if (step === 1) {
          const have = new Set(form.prerequisites.map((p) => p.label));
          const sugg = St.data.badges.filter((b) => !have.has(b.name));
          body = `<div class="stack"><div><div class="label mb-1">Prérequis demandés aux participants</div><div class="chips" id="w6chips">${form.prerequisites.length ? form.prerequisites.map((p, i) => `<span class="chip ok">${p.badgeId ? icon('award', { cls: 'sm' }) : ''}${esc(p.label)}<button class="x" type="button" data-rm="${i}" aria-label="Retirer ${esc(p.label)}">${icon('x', { cls: 'sm' })}</button></span>`).join('') : '<span class="small muted">Aucun prérequis pour l\'instant.</span>'}</div></div>
            <div><div class="label mb-1">Suggestions de badges existants</div><div class="chips">${sugg.map((b) => `<button type="button" class="chip" data-add-badge="${b.id}">${icon('plus', { cls: 'sm' })}${esc(b.name)}</button>`).join('')}</div></div>
            <form class="row" id="w6custom"><label class="sr-only" for="w6free">Autre prérequis</label><input class="input grow" id="w6free" placeholder="Autre prérequis (ex. Notions de réseaux IP)"><button class="btn btn-soft" type="submit">Ajouter</button></form></div>`;
        }
        if (step === 2) body = `<div class="summary"><h3>${esc(form.title)}</h3><div class="row wrap gap-1 mt-1">${pill(form.theme, 'blue')}${pill(form.level, 'teal')}${pill(form.format, 'outline')}${pill(form.durationDays + ' jour' + (form.durationDays > 1 ? 's' : ''), 'outline')}</div>
          <p class="mt-2">${esc(form.description)}</p><dl class="dl"><dt>Public</dt><dd>${esc(form.audience)}</dd><dt>Objectifs</dt><dd><ul>${lines(form.objectives).map((o) => `<li>${esc(o)}</li>`).join('')}</ul></dd><dt>Programme</dt><dd><ul>${lines(form.syllabus).map((o) => `<li>${esc(o)}</li>`).join('')}</ul></dd><dt>Prérequis</dt><dd>${form.prerequisites.length ? form.prerequisites.map((p) => esc(p.label)).join(', ') : 'Aucun'}</dd></dl></div>`;
        root.innerHTML = `${stepper()}<section class="card reveal"><h3 class="mb-2">${['Informations générales', 'Prérequis', 'Récapitulatif avant envoi'][step]}</h3>${body}
          <div class="row between wrap mt-3"><button class="btn btn-ghost" id="w6prev" ${step === 0 ? 'disabled' : ''}>${icon('arrow-left', { cls: 'sm' })} Précédent</button>${step < 2 ? `<button class="btn btn-primary" id="w6next">Continuer ${icon('arrow-right', { cls: 'sm' })}</button>` : '<button class="btn btn-primary" id="w6submit">Soumettre à l\'équipe Academy</button>'}</div></section>`;
        bind();
      }
      function bind() {
        const n = root.querySelector('#w6next'); const p = root.querySelector('#w6prev'); const sb = root.querySelector('#w6submit');
        if (p) p.addEventListener('click', () => { collect(); step--; draw(); });
        if (n) n.addEventListener('click', () => { collect(); if (step === 0 && !form.title.trim()) { toast('Le titre est obligatoire', 'warn'); root.querySelector('#w6-title').focus(); return; } step++; draw(); });
        root.querySelectorAll('[data-rm]').forEach((b) => b.addEventListener('click', () => { form.prerequisites.splice(Number(b.dataset.rm), 1); draw(); }));
        root.querySelectorAll('[data-add-badge]').forEach((b) => b.addEventListener('click', () => { const bd = St.data.badges.find((x) => x.id === b.dataset.addBadge); form.prerequisites.push({ label: bd.name, badgeId: bd.id }); draw(); }));
        const fm = root.querySelector('#w6custom'); if (fm) fm.addEventListener('submit', (e) => { e.preventDefault(); const v = root.querySelector('#w6free').value.trim(); if (v) { form.prerequisites.push({ label: v }); draw(); } });
        if (sb) sb.addEventListener('click', () => {
          St.submitProposal({ title: form.title.trim(), authorId: K, theme: form.theme, level: form.level, format: form.format, durationDays: form.durationDays, audience: form.audience, objectives: lines(form.objectives), syllabus: lines(form.syllabus), prerequisites: form.prerequisites.slice(), description: form.description });
          done = { title: form.title.trim() }; toast('Proposition soumise à l\'équipe Academy', 'ok', { icon: 'send' }); draw();
        });
      }
      draw();
    }
  });

  /* =====================================================================
     W7 — Contenu & quiz (auteur)
     ===================================================================== */
  App.view({
    id: 'W7', path: '/before/contenu', roles: ['formateur'], phase: 'before', title: 'Contenu & quiz',
    render(el, ctx) {
      const St = S();
      const mineF = St.data.formations.filter((f) => (f.trainerIds || []).includes(K) || f.authorId === K).filter((f) => St.data.content[f.id]);
      let fid = (ctx.params.query && ctx.params.query.f) || 'f-cloud5g';
      if (!St.formation(fid)) fid = 'f-cloud5g';
      const content = () => (St.data.content[fid] = St.data.content[fid] || { files: [], slides: [], quiz: [] });
      const f = St.formation(fid);
      const FAKE = ['Annexe_exercices_v1.pdf', 'Schema_architecture.png', 'Support_atelier_v2.pptx', 'Glossaire_5G.pdf'];
      let fakeI = 0;
      const kindIcon = (k) => (k === 'pdf' ? 'file-text' : k === 'png' || k === 'jpg' ? 'image' : 'paperclip');
      const commit = (extra) => St.commit('content', Object.assign({ formationId: fid, self: true }, extra));
      el.innerHTML = `${pageHead({ num: 'W7', eyebrow: 'Before · Contenu & quiz', title: 'Contenu & quiz', lead: 'Déposez vos supports et construisez le quiz de fin de séance.',
        actions: `<label class="sr-only" for="w7f">Formation</label><select class="select" id="w7f" style="min-width:240px">${(mineF.length ? mineF : [f]).map((x) => `<option value="${x.id}" ${x.id === fid ? 'selected' : ''}>${esc(x.short)}</option>`).join('')}</select>` })}
        <div class="grid-main"><section class="card reveal" aria-labelledby="w7s"><div class="card-title"><h3 id="w7s">Supports</h3></div><div id="w7files"></div></section>
        <section class="card reveal"><div class="card-title"><h3>Quiz QCM <span class="pill blue" id="w7qn"></span></h3></div><div class="stack"><button class="btn btn-teal" id="w7gen">${icon('sparkles', { cls: 'sm' })} Générer avec Smart Assist</button><button class="btn btn-soft" id="w7addq">${icon('plus', { cls: 'sm' })} Ajouter une question</button><p class="small muted">Chaque question compte 1 point. Cochez la bonne réponse.</p></div></section></div>
        <div id="w7quiz" class="stack mt-3"></div>`;
      function drawFiles() {
        const c = content();
        el.querySelector('#w7files').innerHTML = `<div class="dropzone" id="w7drop" tabindex="0" role="button" aria-label="Déposer des fichiers ou ajouter un support">${icon('upload', { cls: 'lg' })}<b>Glissez vos supports ici</b><span class="small muted">PDF, PPTX, images — 20 Mo max</span><button class="btn btn-soft btn-sm" type="button" id="w7addf">${icon('plus', { cls: 'sm' })} Ajouter un support</button></div>
          <ul class="plain files mt-2" aria-live="polite">${c.files.length ? c.files.map((x, i) => `<li class="${x._new ? 'flash-in' : ''}"><span class="icon-chip" style="--accent:var(--blue);width:34px;height:34px">${icon(kindIcon(x.kind), { cls: 'sm' })}</span><div class="grow"><b>${esc(x.name)}</b><div class="small muted">${esc(x.size)} · mis à jour ${St.fmtDateShort(x.updated)}</div></div><button class="btn btn-ghost btn-icon btn-sm" data-rmf="${i}" aria-label="Supprimer ${esc(x.name)}">${icon('trash', { cls: 'sm' })}</button></li>`).join('') : '<li class="small muted">Aucun support.</li>'}</ul>`;
        c.files.forEach((x) => { delete x._new; });
        const drop = el.querySelector('#w7drop');
        const addF = (name) => { const ext = (name.split('.').pop() || '').toLowerCase(); content().files.unshift({ name, size: (Math.random() * 5 + 0.5).toFixed(1).replace('.', ',') + ' Mo', kind: ext, updated: today(), _new: true }); commit(); toast(`« ${name} » ajouté`, 'ok', { icon: 'upload' }); };
        el.querySelector('#w7addf').addEventListener('click', () => addF(FAKE[fakeI++ % FAKE.length])); // MOCK : fichier fictif
        ['dragenter', 'dragover'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add('is-over'); }));
        ['dragleave', 'drop'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove('is-over'); }));
        drop.addEventListener('drop', (e) => { const fl = [...(e.dataTransfer ? e.dataTransfer.files : [])]; if (fl.length) fl.forEach((x) => addF(x.name)); else addF(FAKE[fakeI++ % FAKE.length]); });
        el.querySelectorAll('[data-rmf]').forEach((b) => b.addEventListener('click', () => { content().files.splice(Number(b.dataset.rmf), 1); commit(); }));
      }
      function drawQuiz() {
        const qz = content().quiz;
        el.querySelector('#w7qn').textContent = `${qz.length} question${qz.length > 1 ? 's' : ''}`;
        el.querySelector('#w7quiz').innerHTML = qz.length ? qz.map((q, i) => `<article class="card q-card reveal ${q.generated && !q._ack ? 'flash-in' : ''}" data-qi="${i}">
          <div class="row between wrap"><div class="row gap-1"><span class="q-num">${i + 1}</span>${q.generated ? pill('Généré par Smart Assist', 'teal', { icon: 'sparkles' }) : ''}</div><button class="btn btn-ghost btn-icon btn-sm" data-delq="${i}" aria-label="Supprimer la question ${i + 1}">${icon('trash', { cls: 'sm' })}</button></div>
          <div class="field mt-1"><label for="q${i}">Question</label><textarea class="textarea" id="q${i}" rows="2" data-f="q">${esc(q.q)}</textarea></div>
          <fieldset class="opts"><legend class="label">Réponses — cochez la bonne</legend>${q.options.map((o, j) => `<div class="opt ${q.answer === j ? 'is-right' : ''}"><input type="radio" name="ans${i}" value="${j}" ${q.answer === j ? 'checked' : ''} aria-label="Bonne réponse : option ${j + 1}"><label class="sr-only" for="q${i}o${j}">Option ${j + 1}</label><input class="input" id="q${i}o${j}" data-f="o" data-j="${j}" value="${esc(o)}" placeholder="Option ${j + 1}"></div>`).join('')}</fieldset></article>`).join('')
          : empty({ icon: 'help-circle', title: 'Aucune question', text: 'Ajoutez une question ou laissez Smart Assist en proposer.' });
        setTimeout(() => { content().quiz.forEach((x) => { if (x.generated) x._ack = true; }); }, 1500);
      }
      const redraw = () => { drawFiles(); drawQuiz(); ui.stagger(el); };
      redraw();
      const quizBox = el.querySelector('#w7quiz');
      quizBox.addEventListener('input', (e) => { // saisie : persistance sans re-render (pas de perte de focus)
        const card = e.target.closest('[data-qi]'); if (!card) return; const q = content().quiz[Number(card.dataset.qi)];
        if (e.target.dataset.f === 'q') q.q = e.target.value; else if (e.target.dataset.f === 'o') q.options[Number(e.target.dataset.j)] = e.target.value;
        St.save();
      });
      quizBox.addEventListener('change', (e) => { if (e.target.type !== 'radio') return; const card = e.target.closest('[data-qi]'); content().quiz[Number(card.dataset.qi)].answer = Number(e.target.value); St.save(); card.querySelectorAll('.opt').forEach((o, j) => o.classList.toggle('is-right', j === Number(e.target.value))); });
      quizBox.addEventListener('click', (e) => { const d = e.target.closest('[data-delq]'); if (d) { content().quiz.splice(Number(d.dataset.delq), 1); commit(); toast('Question supprimée', 'info'); } });
      el.querySelector('#w7addq').addEventListener('click', () => { content().quiz.push({ q: '', options: ['', '', '', ''], answer: 0 }); commit(); const t = el.querySelectorAll('.q-card textarea'); if (t.length) t[t.length - 1].focus(); });
      el.querySelector('#w7gen').addEventListener('click', () => { if (App.openSmartAssist) App.openSmartAssist({ action: 'quiz', formationId: fid }); else toast('Smart Assist arrive bientôt', 'smart'); });
      el.querySelector('#w7f').addEventListener('change', (e) => App.go('#/before/contenu?f=' + e.target.value));
      // Smart Assist (autre agent) commit 'content' ; nos propres commits aussi → un seul rendu
      ctx.on('content', (p) => { if (!p || !p.formationId || p.formationId === fid) redraw(); });
    }
  });

  /* =====================================================================
     W8 — Calendrier global
     ===================================================================== */
  App.view({
    id: 'W8', path: '/before/calendrier', roles: ['formateur'], phase: 'before', title: 'Calendrier',
    render(el, ctx) {
      const St = S();
      let view = 'month'; let cur = St.parseDate(today());
      const DOW = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
      el.innerHTML = `${pageHead({ num: 'W8', eyebrow: 'Before · Calendrier', title: 'Calendrier', lead: 'Vos sessions, les sessions à pourvoir et vos disponibilités sur une seule vue.',
        actions: '<div class="seg" role="group" aria-label="Vue"><button type="button" data-v="month" aria-pressed="true">Mois</button><button type="button" data-v="week" aria-pressed="false">Semaine</button></div>' })}
        <section class="card reveal"><div class="row between wrap cal-bar"><div class="row"><button class="btn btn-ghost btn-icon btn-sm" id="w8p" aria-label="Précédent">${icon('chevron-left')}</button><h2 class="cal-title" id="w8t" aria-live="polite"></h2><button class="btn btn-ghost btn-icon btn-sm" id="w8n" aria-label="Suivant">${icon('chevron-right')}</button><button class="btn btn-ghost btn-sm" id="w8today">Aujourd'hui</button></div>
        <div class="legend"><span><i style="background:var(--blue)"></i>Mes sessions</span><span><i style="background:var(--orange)"></i>À pourvoir</span><span><i style="background:var(--teal)"></i>Mes dispos</span></div></div><div id="w8cal" class="mt-2"></div></section>`;
      const evOf = (date) => {
        if (ctx.scenario === 'vide') return { mine: [], open: [], dispo: [] };
        const mine = mySessions().filter((s) => s.date === date);
        const open = St.openSessions().filter((s) => s.date === date);
        const dd = (St.data.dispos[K] || {})[date] || {};
        const dispo = ['am', 'pm'].filter((k) => dd[k] === 'dispo').map((k) => (k === 'am' ? 'Matin' : 'Après-midi'));
        return { mine, open, dispo };
      };
      const chips = (date, wide) => { const e = evOf(date);
        return e.mine.map((s) => `<a class="cal-event" style="--ev:var(--blue)" href="#/before/session/${s.id}" title="${esc(St.sessionTitle(s))}">${esc(St.formation(s.formationId).short)}${wide ? `<small>${esc(s.time)} · ${esc(s.location)}</small>` : ''}</a>`).join('')
          + e.open.map((s) => `<a class="cal-event" style="--ev:var(--orange)" href="#/before/sessions-ouvertes" title="${esc(St.sessionTitle(s))} — à pourvoir">À pourvoir · ${esc(St.formation(s.formationId).short)}${wide ? `<small>${esc(s.location)}</small>` : ''}</a>`).join('')
          + e.dispo.map((l) => `<span class="cal-event" style="--ev:var(--teal)">Dispo · ${l}</span>`).join(''); };
      function draw() {
        const box = el.querySelector('#w8cal'); const t = el.querySelector('#w8t');
        if (view === 'month') {
          const y = cur.getFullYear(), m = cur.getMonth(); const lead = (new Date(y, m, 1).getDay() + 6) % 7; const dim = new Date(y, m + 1, 0).getDate();
          t.textContent = `${St.MONTHS_LONG[m][0].toUpperCase()}${St.MONTHS_LONG[m].slice(1)} ${y}`;
          let h = DOW.map((d) => `<div class="cal-dow">${d}</div>`).join('');
          for (let i = 0; i < lead; i++) h += '<div class="cal-day out" aria-hidden="true"></div>';
          for (let d = 1; d <= dim; d++) { const date = iso(y, m, d); const we = (new Date(y, m, d).getDay() + 6) % 7 >= 5; h += `<div class="cal-day cal-day-lg ${we ? 'weekend' : ''} ${date === today() ? 'today' : ''}"><span class="d">${d}</span>${chips(date, false)}</div>`; }
          box.innerHTML = `<div class="cal">${h}</div>`;
        } else {
          const dow = (cur.getDay() + 6) % 7; const start = addDays(isoOf(cur), -dow);
          t.textContent = `Semaine du ${St.fmtDateShort(start)} au ${St.fmtDateMid(addDays(start, 6))}`;
          box.innerHTML = `<div class="week">${DOW.map((n, i) => { const date = addDays(start, i); const c = chips(date, true); return `<div class="week-day ${i >= 5 ? 'weekend' : ''} ${date === today() ? 'today' : ''}"><div class="week-h"><span class="cal-dow">${n}</span><b>${S().parseDate(date).getDate()}</b></div>${c || '<span class="small dim">—</span>'}</div>`; }).join('')}</div>`;
        }
      }
      const step = (dir) => { if (view === 'month') cur = new Date(cur.getFullYear(), cur.getMonth() + dir, 1); else cur = St.parseDate(addDays(isoOf(cur), 7 * dir)); draw(); };
      el.querySelector('#w8p').addEventListener('click', () => step(-1));
      el.querySelector('#w8n').addEventListener('click', () => step(1));
      el.querySelector('#w8today').addEventListener('click', () => { cur = St.parseDate(today()); draw(); });
      el.querySelectorAll('[data-v]').forEach((b) => b.addEventListener('click', () => { view = b.dataset.v; el.querySelectorAll('[data-v]').forEach((x) => x.setAttribute('aria-pressed', x === b)); draw(); }));
      draw();
      ['sessions', 'dispos'].forEach((tp) => ctx.on(tp, draw));
    }
  });
})();
