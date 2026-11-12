/* =====================================================================
   Formateur Mohamed K. — During (W9), After (W10-W11), Transverse (W12-W14)
   + Smart Assist (W15, tiroir global App.openSmartAssist)
   ===================================================================== */
(function () {
  const { icon, esc, avatar, pill, statusPill, pageHead, stat, stars, scoreBar, empty, banner, trend, toast, modal, confirm, drawer } = window.ui;
  const S = window.Store;

  const REDUCED = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const f1 = (n) => S.fmtNum(n, 1);
  const clock = (sec) => { const p = (n) => String(n).padStart(2, '0'); return `${p(Math.floor(sec / 3600))}:${p(Math.floor((sec % 3600) / 60))}:${p(sec % 60)}`; };
  const mmss = (sec) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
  const sessionCard = () => S.filRouge();

  /* =====================================================================
     W9 — Mode séance
     ===================================================================== */
  let chronoSec = 47 * 60 + 12;   // MOCK : séance démarrée à 09:00, on simule 47 min écoulées
  let quizRemaining = null;       // compte à rebours du quiz (s)
  const QUIZ_SECONDS = 120;
  const ALERT_TYPES = [
    { id: 'salle', label: 'Salle', icon: 'building', hint: 'Salle, clim, accès…' },
    { id: 'visio', label: 'Visio', icon: 'video', hint: 'Lien Teams, caméra, son…' },
    { id: 'materiel', label: 'Matériel', icon: 'wrench', hint: 'Projecteur, postes, câbles…' },
    { id: 'reseau', label: 'Réseau', icon: 'wifi-off', hint: 'Wi-Fi, VPN, accès labs…' }
  ];

  App.view({
    id: 'W9', path: '/during/seance', roles: ['formateur'], phase: 'during', title: 'Mode séance',
    render(el, ctx) {
      const s = sessionCard();
      const f = S.formation(s.formationId);
      const content = S.data.content[s.formationId] || { slides: [], quiz: [] };
      const quizTotal = (content.quiz || []).length || 5;

      if (ctx.scenario === 'vide') {
        el.innerHTML = pageHead({ num: 'W9', eyebrow: 'During · Mode séance', title: 'Mode séance', lead: 'Pilotez la présence, le quiz et le feedback depuis un seul écran.' }) +
          `<div class="card reveal">${empty({ icon: 'monitor', title: 'Aucune séance en cours aujourd\'hui', text: 'Le mode séance s\'active le jour J. Votre prochaine séance : « ' + esc(f.short) + ' » le ' + S.fmtDateShort(s.date) + '.', cta: '<a class="btn btn-primary mt-2" href="#/before/sessions-ouvertes">Voir les sessions ouvertes</a>' })}</div>`;
        return;
      }

      if (!s.live.started) S.startSession(s.id); // MOCK : entrer en mode séance démarre la séance
      if (s.live.quiz === 'running' && quizRemaining == null) quizRemaining = QUIZ_SECONDS;

      const people = () => {
        const ids = [...s.inscrits];
        Object.keys(s.attendance || {}).concat(Object.keys(s.signatures || {})).forEach((p) => { if (!ids.includes(p)) ids.push(p); });
        return ids;
      };
      const presentCount = () => people().filter((p) => s.attendance[p]).length;

      el.innerHTML = `
        ${pageHead({ num: 'W9', eyebrow: 'During · Mode séance', title: 'Mode séance', lead: 'Présence, cours, quiz et feedback : tout se pilote d\'ici, lisible en projection.' })}
        ${s.trainerId !== 'karim' ? banner({ color: 'blue', icon: 'info', html: '<b>Vous n\'êtes pas encore positionné sur cette session</b> (démo : actions disponibles).' }) : ''}
        ${ctx.scenario === 'alerte' ? banner({ color: 'orange', icon: 'alert-triangle', html: '<b>Incident détecté :</b> 2 participants à distance signalent un lien Teams inaccessible.', actions: '<button class="btn btn-sm btn-soft" id="alertFromBanner">Signaler à l\'Academy</button>' }) : ''}

        <section class="ws-hero reveal" aria-label="Séance en cours">
          <div class="ws-hero-main">
            <span class="ws-live"><span class="live-dot" aria-hidden="true"></span>Séance en cours</span>
            <h2>${esc(f.title)}</h2>
            <p class="ws-meta">
              <span>${icon('calendar', { cls: 'sm' })}${S.fmtDate(s.date)} · ${esc(s.time)}</span>
              <span>${icon('map-pin', { cls: 'sm' })}${esc(s.location)}</span>
              ${s.remote ? `<span>${icon('video', { cls: 'sm' })}${esc(s.remote)}</span>` : ''}
            </p>
          </div>
          <div class="ws-hero-kpis">
            <div class="ws-kpi"><span class="ws-kpi-l">Temps écoulé</span><span class="ws-kpi-v" id="chrono" role="timer" aria-label="Temps écoulé">${clock(chronoSec)}</span></div>
            <div class="ws-kpi"><span class="ws-kpi-l">Présents</span><span class="ws-kpi-v" id="presCount" aria-live="polite"></span></div>
          </div>
        </section>

        <div class="ws-actions reveal" role="toolbar" aria-label="Actions de séance">
          <button class="btn btn-soft btn-lg" id="actAlert">${icon('alert-triangle')}Alerte logistique</button>
          <button class="btn btn-soft btn-lg" id="actPresence">${icon('users')}Feuille de présence</button>
          <button class="btn btn-soft btn-lg" id="actCourse">${icon('monitor')}Afficher le cours</button>
          <button class="btn btn-primary btn-lg" id="actQuiz">${icon('help-circle')}Lancer le quiz</button>
          <button class="btn btn-teal btn-lg" id="actFeedback">${icon('star')}Lancer le feedback</button>
        </div>

        <div class="ws-grid">
          <section class="card reveal ws-presence" id="presenceCard" aria-labelledby="presTitle">
            <div class="card-title">
              <h3 id="presTitle">${icon('users')} Feuille de présence</h3>
              <button class="btn btn-sm btn-ghost" id="markAll">Pointer tout le monde</button>
            </div>
            <p class="small muted" style="margin:-8px 0 16px">Touchez une carte pour pointer manuellement. La signature numérique des participants s'affiche en direct.</p>
            <div class="pgrid" id="pgrid"></div>
          </section>
          <div class="stack">
            <section class="card reveal" id="quizPanel" aria-live="polite"></section>
            <section class="card reveal" id="fbPanel" aria-live="polite"></section>
            <section class="card reveal" id="alertPanel" aria-live="polite"></section>
          </div>
        </div>`;

      const $ = (q) => el.querySelector(q);

      /* ---- Présence ---- */
      function renderGrid(flashPid) {
        const list = people();
        $('#pgrid').innerHTML = list.map((pid) => {
          const p = S.person(pid); const on = !!s.attendance[pid]; const sig = s.signatures && s.signatures[pid];
          return `<button class="pcell ${on ? 'is-on' : ''} ${flashPid === pid ? 'flash-in' : ''}" data-pid="${pid}" aria-pressed="${on}" aria-label="${esc(p.fullName)} : ${on ? 'présent' : 'absent'}${sig ? ', signé' : ''}">
            ${avatar(p, { size: 'lg', title: false })}
            <span class="pcell-name">${esc(p.name)}</span>
            <span class="pcell-state">${on ? (sig ? `${icon('pencil', { cls: 'sm' })}Signé ${S.fmtTime(sig)}` : `${icon('check', { cls: 'sm' })}Présent·e`) : 'Absent·e'}</span>
          </button>`;
        }).join('');
        const n = presentCount();
        $('#presCount').innerHTML = `${n}<small>/${list.length}</small>`;
      }
      renderGrid();
      $('#pgrid').addEventListener('click', (e) => {
        const b = e.target.closest('[data-pid]'); if (!b) return;
        S.setAttendance(s.id, b.dataset.pid, !s.attendance[b.dataset.pid]);
      });
      $('#markAll').addEventListener('click', () => { people().forEach((p) => { if (!s.attendance[p]) S.setAttendance(s.id, p, true); }); toast('Tous les participants sont pointés présents', 'ok'); });
      ctx.on('attendance', (p) => { renderGrid(p && p.pid); if (p && p.signed) toast(`${esc(S.person(p.pid).name)} a signé sa présence`, 'ok', { icon: 'pencil' }); });
      ctx.on('inscriptions', () => renderGrid());

      /* ---- Quiz ---- */
      function results() { return S.data.quizResults[s.id] || {}; }
      function renderQuiz() {
        const st = s.live.quiz || 'idle'; const res = results(); const ids = Object.keys(res); const total = people().length;
        let h = `<div class="card-title"><h3>${icon('help-circle')} Quiz en direct</h3>${st === 'running' ? '<span class="pill teal"><span class="dot"></span>En cours</span>' : st === 'closed' ? '<span class="pill">Clos</span>' : '<span class="pill outline">Prêt</span>'}</div>`;
        if (st === 'idle') {
          h += `<p class="muted small">${quizTotal} questions issues de « Contenu &amp; Quiz » · durée conseillée 2 min.</p><button class="btn btn-primary btn-block mt-2" id="quizGo">${icon('play')}Lancer le quiz</button>`;
        } else {
          if (st === 'running') h += `<div class="ws-count"><span class="ws-count-v" id="quizClock" role="timer">${mmss(quizRemaining ?? QUIZ_SECONDS)}</span><span class="small muted">Compte à rebours</span></div>`;
          h += `<div class="row between small"><span class="strong">Réponses reçues</span><span><b id="quizN">${ids.length}</b> / ${total}</span></div>${window.ui.progress(total ? Math.round((ids.length / total) * 100) : 0, { label: 'Réponses reçues' })}`;
          if (ids.length) h += `<div class="ws-answers">${ids.map((pid) => `<span class="ws-ans" title="${esc(S.person(pid).fullName)}">${avatar(pid, { size: 'sm', title: false })}<b>${res[pid].score}/${res[pid].total}</b></span>`).join('')}</div>`;
          if (st === 'closed') {
            const avg = ids.length ? ids.reduce((a, p) => a + res[p].score / res[p].total, 0) / ids.length : 0;
            h += `<div class="ws-score mt-2"><span class="ws-score-v">${Math.round(avg * 100)} %</span><span class="small muted">Score moyen · ${f1(avg * quizTotal)} / ${quizTotal} · ${ids.length} réponse${ids.length > 1 ? 's' : ''}</span></div>`;
          } else h += `<button class="btn btn-ghost btn-block mt-2" id="quizStop">${icon('lock')}Clore le quiz</button>`;
        }
        $('#quizPanel').innerHTML = h;
        const go = $('#quizGo'); if (go) go.addEventListener('click', launchQuiz);
        const stop = $('#quizStop'); if (stop) stop.addEventListener('click', closeQuiz);
      }
      function launchQuiz() {
        if (s.live.quiz === 'running') { $('#quizPanel').scrollIntoView({ behavior: REDUCED() ? 'auto' : 'smooth', block: 'center' }); return; }
        quizRemaining = QUIZ_SECONDS; S.data.quizResults[s.id] = {}; S.launchQuiz(s.id);
        toast('Quiz lancé — les participants le reçoivent sur leur écran', 'ok', { icon: 'help-circle' });
        $('#quizPanel').scrollIntoView({ behavior: REDUCED() ? 'auto' : 'smooth', block: 'center' });
      }
      function closeQuiz() { S.closeQuiz(s.id); toast('Quiz clos — résultats consolidés', 'ok'); }
      renderQuiz();
      ctx.on('live', (p) => { if (p && (p.kind === 'quiz' || p.kind === 'quiz-closed')) renderQuiz(); if (p && p.kind === 'feedback') renderFb(); if (p && (p.kind === 'alert' || p.kind === 'alert-resolved')) renderAlerts(); });
      ctx.on('quiz', () => { renderQuiz(); const n = $('#quizN'); if (n) n.parentElement.classList.add('flash-in'); });

      /* ---- Feedback ---- */
      function renderFb() {
        const n = S.evaluationsOf(s.id).length; const open = s.live.feedback === 'open'; const total = people().length;
        $('#fbPanel').innerHTML = `<div class="card-title"><h3>${icon('star')} Feedback à chaud</h3>${open ? '<span class="pill teal"><span class="dot"></span>Ouvert</span>' : '<span class="pill outline">Fermé</span>'}</div>` +
          (open ? `<p class="strong" id="fbN">Feedback ouvert — ${n} réponse${n > 1 ? 's' : ''}</p><p class="small muted">Évaluation anonyme sur 5 critères, sur le téléphone des participants.</p>${window.ui.progress(Math.min(100, Math.round((n / Math.max(total, n)) * 100)), { label: 'Réponses au feedback' })}`
            : `<p class="muted small">Ouvre l'évaluation anonyme (5 critères + commentaire) chez les participants.</p><button class="btn btn-teal btn-block mt-2" id="fbGo">${icon('star')}Lancer le feedback</button>`);
        const g = $('#fbGo'); if (g) g.addEventListener('click', launchFb);
      }
      function launchFb() {
        if (s.live.feedback !== 'open') { S.launchFeedback(s.id); toast('Feedback ouvert — les participants sont invités à répondre', 'ok', { icon: 'star' }); }
        $('#fbPanel').scrollIntoView({ behavior: REDUCED() ? 'auto' : 'smooth', block: 'center' });
      }
      renderFb();
      ctx.on('evaluations', () => { renderFb(); const n = $('#fbN'); if (n) n.classList.add('flash-in'); });

      /* ---- Alertes logistiques ---- */
      function renderAlerts() {
        const al = s.live.alerts || [];
        $('#alertPanel').innerHTML = `<div class="card-title"><h3>${icon('alert-triangle')} Alertes logistiques</h3>${al.filter((a) => a.status === 'ouverte').length ? `<span class="pill orange">${al.filter((a) => a.status === 'ouverte').length} ouverte${al.filter((a) => a.status === 'ouverte').length > 1 ? 's' : ''}</span>` : ''}</div>` +
          (al.length ? `<ul class="ws-alerts">${al.map((a) => {
            const t = ALERT_TYPES.find((x) => x.id === a.type) || ALERT_TYPES[0];
            return `<li class="ws-alert ${a.status === 'résolue' ? 'is-done' : ''}"><span class="icon-chip" style="--accent:${a.status === 'résolue' ? 'var(--green-ok)' : 'var(--orange)'}">${icon(a.status === 'résolue' ? 'check-circle' : t.icon, { cls: 'sm' })}</span><div class="grow"><b>${esc(a.label || t.label)}</b><div class="small muted">${esc(a.message || '')}</div><div class="xs dim">${S.fmtRelative(a.at)} · transmise à l'équipe Academy</div></div>${a.status === 'ouverte' ? `<button class="btn btn-sm btn-soft" data-resolve="${a.id}">Marquer résolue</button>` : '<span class="pill ok">Résolue</span>'}</li>`;
          }).join('')}</ul>` : '<p class="muted small">Aucune alerte. Un souci de salle, de visio, de matériel ou de réseau ? Signalez-le en un clic.</p>');
        $('#alertPanel').querySelectorAll('[data-resolve]').forEach((b) => b.addEventListener('click', () => { S.resolveLogisticsAlert(s.id, b.dataset.resolve); toast('Alerte marquée comme résolue', 'ok'); }));
      }
      renderAlerts();

      function openAlert(preType) {
        let type = preType || 'salle';
        const prefill = { visio: 'Lien visio KO pour les participants à distance', salle: 'Problème dans la salle : ', materiel: 'Matériel défaillant : ', reseau: 'Réseau instable : ' };
        modal({
          title: 'Alerte logistique', eyebrow: 'During · Séance en cours', accent: 'var(--orange)',
          body: `<p class="muted small" style="margin-bottom:14px">L'équipe Academy est notifié(e) immédiatement.</p>
            <div class="al-types" role="radiogroup" aria-label="Type d'alerte">${ALERT_TYPES.map((t) => `<button type="button" class="al-type" role="radio" data-type="${t.id}" aria-checked="${t.id === type}">${icon(t.icon, { cls: 'lg' })}<b>${t.label}</b><span class="xs">${t.hint}</span></button>`).join('')}</div>
            <div class="field mt-2"><label for="alMsg">Message</label><textarea class="textarea" id="alMsg" rows="3" placeholder="Décrivez le problème…"></textarea></div>`,
          foot: '<button class="btn btn-ghost" data-close>Annuler</button><button class="btn btn-primary" data-send>Envoyer l\'alerte</button>',
          onOpen(m, close) {
            const msg = m.querySelector('#alMsg'); msg.value = prefill[type];
            m.querySelectorAll('.al-type').forEach((b) => b.addEventListener('click', () => {
              const was = prefill[type]; type = b.dataset.type;
              m.querySelectorAll('.al-type').forEach((x) => x.setAttribute('aria-checked', x === b));
              if (!msg.value.trim() || msg.value === was) msg.value = prefill[type];
            }));
            m.querySelector('[data-send]').addEventListener('click', () => {
              const t = ALERT_TYPES.find((x) => x.id === type);
              S.addLogisticsAlert(s.id, { type, label: t.label, message: msg.value.trim() }); // MOCK : notification Sihem
              close(); toast(`Alerte « ${t.label} » transmise à l'équipe Academy`, 'warn');
            });
          }
        });
      }

      /* ---- Afficher le cours (projection) ---- */
      function openCourse() {
        const slides = content.slides && content.slides.length ? content.slides : [{ title: f.title, text: 'Aucune diapositive importée.' }];
        let idx = Math.min(s.live.slide || 0, slides.length - 1);
        let keyFn;
        modal({
          title: 'Afficher le cours', eyebrow: 'Projection', size: 'full',
          body: `<div class="proj" id="proj"><div class="proj-slide" id="projSlide" aria-live="polite"></div><div class="proj-bar sf-bar" aria-hidden="true"></div></div>`,
          foot: `<span class="small muted grow">Utilisez les flèches ← / → du clavier</span><button class="btn btn-ghost" id="pPrev" aria-label="Diapositive précédente">${icon('chevron-left')}Précédent</button><span class="proj-count" id="pCount"></span><button class="btn btn-primary" id="pNext" aria-label="Diapositive suivante">Suivant${icon('chevron-right')}</button>`,
          onClose() { document.removeEventListener('keydown', keyFn); },
          onOpen(m) {
            const draw = () => {
              const sl = slides[idx];
              m.querySelector('#projSlide').innerHTML = `<div class="proj-kicker">${esc(f.short)} · Sofrecom Academy</div><h2 class="proj-title">${esc(sl.title)}</h2><p class="proj-text">${esc(sl.text)}</p>`;
              m.querySelector('#pCount').textContent = `${idx + 1} / ${slides.length}`;
              m.querySelector('#pPrev').disabled = idx === 0; m.querySelector('#pNext').disabled = idx === slides.length - 1;
            };
            const go = (d) => { const n = Math.max(0, Math.min(slides.length - 1, idx + d)); if (n === idx) return; idx = n; S.setSlide(s.id, idx); draw(); };
            m.querySelector('#pPrev').addEventListener('click', () => go(-1));
            m.querySelector('#pNext').addEventListener('click', () => go(1));
            keyFn = (e) => { if (e.key === 'ArrowRight') go(1); else if (e.key === 'ArrowLeft') go(-1); };
            document.addEventListener('keydown', keyFn);
            draw();
          }
        });
      }

      $('#actAlert').addEventListener('click', () => openAlert());
      const ab = $('#alertFromBanner'); if (ab) ab.addEventListener('click', () => openAlert('visio'));
      $('#actPresence').addEventListener('click', () => { const c = $('#presenceCard'); c.scrollIntoView({ behavior: REDUCED() ? 'auto' : 'smooth', block: 'start' }); c.classList.remove('pulse-once'); void c.offsetWidth; c.classList.add('pulse-once'); });
      $('#actCourse').addEventListener('click', openCourse);
      $('#actQuiz').addEventListener('click', launchQuiz);
      $('#actFeedback').addEventListener('click', launchFb);

      /* ---- Horloge de simulation (gelée par « Pause démo ») ---- */
      ctx.every(1000, () => {
        chronoSec++; const c = $('#chrono'); if (c) c.textContent = clock(chronoSec);
        if (s.live.quiz === 'running' && quizRemaining > 0) { quizRemaining--; const q = $('#quizClock'); if (q) { q.textContent = mmss(quizRemaining); q.classList.toggle('is-low', quizRemaining <= 15); } }
      });
      // MOCK : d'autres participants répondent au quiz pendant que Hbib (réelle) répond depuis son écran
      ctx.every(3500, () => {
        if (s.live.quiz !== 'running' || quizRemaining <= 0) return;
        const res = results();
        const cand = people().filter((p) => p !== 'sana' && s.attendance[p] && !res[p]);
        if (!cand.length) return;
        S.submitQuiz(s.id, cand[Math.floor(Math.random() * cand.length)], 3 + Math.floor(Math.random() * 3), quizTotal);
      });
    }
  });

  /* =====================================================================
     W10 — Ma progression (LET'S RATE!)
     ===================================================================== */
  const SUGGESTIONS = {
    clarte: ['Ajouter un schéma de synthèse en fin de chaque module', 'Reformuler les points clés avec un exemple issu du terrain'],
    rythme: ['Prévoir une pause de 10 min à 14 h 30', 'Alterner exposé et atelier toutes les 45 minutes', 'Annoncer le minutage au début de chaque demi-journée'],
    interactivite: ['Conserver les quiz éclairs en séance', 'Proposer un « binôme distant » par table en format hybride'],
    supports: ['Envoyer la fiche mémo la veille de la séance', 'Ajouter des liens vers les labs pour prolonger l\'apprentissage'],
    utilite: ['Ouvrir la séance par un cas réel apporté par les participants', 'Terminer par un plan d\'action individuel à 30 jours']
  };

  App.view({
    id: 'W10', path: '/after/progression', roles: ['formateur'], phase: 'after', title: 'Ma progression',
    render(el, ctx) {
      const s = sessionCard(); const f = S.formation(s.formationId);
      const evals = S.evaluationsOf(s.id);
      const head = pageHead({ num: 'W10', eyebrow: 'After · LET\'S RATE!', title: 'Ma progression', lead: `Vos retours sur « ${esc(f.title)} » du ${S.fmtDateShort(s.date)}, pour progresser pas à pas.` });

      if (ctx.scenario === 'vide' || !evals.length) {
        el.innerHTML = head + `<div class="card reveal">${empty({ icon: 'star', color: 'teal', title: 'Pas encore de retours', text: 'Les évaluations anonymes de vos participants apparaîtront ici dès l\'ouverture du feedback.', cta: '<a class="btn btn-primary mt-2" href="#/during/seance">Aller au mode séance</a>' })}</div>`;
        return;
      }

      const k = S.data.kpis[s.id] || { satisfaction: 0, presence: 0, reussite: 0, recommandation: 0 };
      const avgs = S.criteriaAverages(s.id);
      const crits = S.data.criteria.map((c) => ({ ...c, v: avgs[c.id] }));
      const best = crits.reduce((a, b) => (b.v > a.v ? b : a));
      const low = crits.reduce((a, b) => (b.v < a.v ? b : a));
      const hist = S.data.trainerHistory.karim || [];
      const short = (iso) => { const d = S.parseDate(iso); return `${S.MONTHS[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`; };
      const points = hist.map((h) => ({ label: short(h.date), value: h.avg })).concat([{ label: short(s.date), value: k.satisfaction }]);
      const comments = evals.filter((e) => e.comment && e.comment.trim());

      el.innerHTML = `${head}
        ${banner({ color: 'teal', icon: 'shield-check', html: '<b>Vous êtes comparé uniquement à vous-même.</b> Aucun classement, aucun rang : le repère Academy est anonymisé et ne constitue pas une cible.' })}
        <div class="grid-4 mt-3">
          ${stat({ num: `${f1(k.satisfaction)}<small>/5</small>`, label: 'Satisfaction', sub: `${evals.length} avis anonymes`, icon: 'star', color: 'orange', i: 0 })}
          ${stat({ num: `${k.presence}<small> %</small>`, label: 'Présence', sub: 'Participants présents', icon: 'users', color: 'blue', i: 1 })}
          ${stat({ num: `${k.reussite}<small> %</small>`, label: 'Réussite au quiz', sub: 'Score moyen de la classe', icon: 'check-circle', color: 'teal', i: 2 })}
          ${stat({ num: `${k.recommandation}<small> %</small>`, label: 'Recommandation', sub: 'Recommanderaient la formation', icon: 'thumbs-up', color: 'cyan', i: 3 })}
        </div>

        <div class="fa-two mt-3">
          <div class="stack">
            <section class="card reveal" aria-labelledby="critT">
              <div class="card-title"><h3 id="critT">Notation par critère</h3><span class="small muted">Moyenne /5</span></div>
              <div class="crit-list">${crits.map((c) => `<div class="crit-row"><span class="crit-l">${esc(c.label)}</span>${stars(c.v)}<div class="crit-bar">${scoreBar(c.v)}</div><b class="crit-v">${f1(c.v)}</b></div>`).join('')}</div>
            </section>
            <section class="card reveal" aria-labelledby="trT">
              <div class="card-title"><h3 id="trT">Mon évolution</h3><span class="small muted">Sessions précédentes → session actuelle</span></div>
              ${trend(points, { ref: S.data.academyAverage, refLabel: 'Repère Academy (anonymisé) — pas une cible', min: 3.5, max: 5, label: 'Évolution de ma satisfaction moyenne par session' })}
              <p class="small muted mt-1">Votre point le plus récent est mis en avant. La comparaison se fait avec vos propres sessions.</p>
            </section>
          </div>
          <div class="stack">
            <div class="insight strength reveal"><span class="icon-chip" style="--accent:var(--teal-ink)">${icon('thumbs-up')}</span><div class="grow">
              <span class="kicker">Point fort</span><h4>${esc(best.label)} <span class="muted strong">· ${f1(best.v)} / 5</span></h4>
              <p>Vos participants soulignent ce point à l'unanimité. Il mérite d'être partagé avec la communauté de formateurs.</p>
              <button class="btn btn-sm btn-teal mt-2" id="shareBtn">${icon('share', { cls: 'sm' })}Partager cette bonne pratique</button></div></div>
            <div class="insight progress-axis reveal"><span class="icon-chip" style="--accent:var(--blue)">${icon('trending-up')}</span><div class="grow">
              <span class="kicker">Axe de progression</span><h4>${esc(low.label)} <span class="muted strong">· ${f1(low.v)} / 5</span></h4>
              <p>Quelques idées simples à essayer lors de votre prochaine session :</p>
              <ul class="sugg">${(SUGGESTIONS[low.id] || []).map((t) => `<li>${icon('check', { cls: 'sm' })}${esc(t)}</li>`).join('')}</ul>
              <button class="btn btn-sm btn-soft mt-2" id="idBtn">${icon('sparkles', { cls: 'sm' })}Demander des idées à Smart Assist</button></div></div>

            <section class="card reveal" aria-labelledby="verbT">
              <div class="card-title"><h3 id="verbT">Verbatims</h3><span class="pill outline">Anonymes</span></div>
              <div class="verbs">${comments.map((e) => `<figure class="verb"><blockquote>« ${esc(e.comment)} »</blockquote><figcaption>${icon('user', { cls: 'sm' })}Participant anonyme</figcaption></figure>`).join('')}</div>
            </section>
          </div>
        </div>

        <section class="card reveal mt-3" aria-labelledby="myfbT">
          <div class="card-title"><h3 id="myfbT">Mon feedback sur la session</h3><span class="pill outline">Optionnel</span></div>
          <p class="small muted" style="margin-bottom:14px">Un retour pour l'équipe Academy : logistique, supports, accompagnement. Il n'est visible que de l'équipe formation.</p>
          <form id="myFb" class="fa-fb">
            <div class="field"><label for="fbTopic">Sujet</label><select class="select" id="fbTopic"><option>Logistique &amp; salle</option><option>Supports &amp; contenu</option><option>Accompagnement Academy</option><option>Autre</option></select></div>
            <div class="field" style="grid-column:1/-1"><label for="fbText">Votre message</label><textarea class="textarea" id="fbText" rows="3" placeholder="Ce qui a bien fonctionné, ce qui a manqué…"></textarea></div>
            <div style="grid-column:1/-1"><button class="btn btn-primary" type="submit">${icon('send', { cls: 'sm' })}Envoyer à l'Academy</button></div>
          </form>
        </section>`;

      el.querySelector('#idBtn').addEventListener('click', () => App.openSmartAssist({ action: 'feedbacks' }));
      el.querySelector('#myFb').addEventListener('submit', (e) => {
        e.preventDefault(); // MOCK : envoi à l'équipe Academy
        const t = el.querySelector('#fbText'); if (!t.value.trim()) { t.focus(); toast('Écrivez quelques mots avant d\'envoyer', 'warn'); return; }
        t.value = ''; toast('Merci ! Votre retour a été transmis à l\'équipe Academy', 'ok');
      });
      el.querySelector('#shareBtn').addEventListener('click', () => {
        const text = `Bonne pratique ${f.short} : ${best.label.toLowerCase()} notée ${f1(best.v)}/5 par les participants. Mon astuce : un quiz éclair de 3 questions à 14 h pour relancer l'attention après le déjeuner, avec correction commentée en direct. À tester !`;
        modal({
          title: 'Partager cette bonne pratique', eyebrow: 'LET\'S CONNECT!', accent: 'var(--teal)',
          body: `<p class="muted small" style="margin-bottom:12px">Ce message sera publié dans la communauté des formateurs. Modifiez-le librement.</p><div class="field"><label for="gpText">Votre publication</label><textarea class="textarea" id="gpText" rows="5">${esc(text)}</textarea></div>`,
          foot: '<button class="btn btn-ghost" data-close>Annuler</button><button class="btn btn-teal" data-pub>Publier</button>',
          onOpen(m, close) {
            m.querySelector('[data-pub]').addEventListener('click', () => {
              const v = m.querySelector('#gpText').value.trim(); if (!v) return;
              S.addPost({ authorId: 'karim', type: 'bonne_pratique', fromRate: true, text: v });
              if (S.data.goodPractices.some((g) => g.id === 'gp-1' && !g.shared)) S.markGoodPracticeShared('gp-1');
              close(); toast('Bonne pratique publiée. <a href="mobile.html" style="text-decoration:underline">Voir dans LET\'S CONNECT!</a>', 'ok', { icon: 'share', duration: 6000 });
            });
          }
        });
      });
      ctx.on('evaluations', () => { const a = document.activeElement; if (a && el.contains(a) && /TEXTAREA|SELECT|INPUT/.test(a.tagName)) return; ctx.refresh(); });
    }
  });

  /* =====================================================================
     W11 — Vouchers de certification
     ===================================================================== */
  let voucherFilter = 'pending';
  App.view({
    id: 'W11', path: '/after/vouchers', roles: ['formateur'], phase: 'after', title: 'Vouchers',
    render(el, ctx) {
      const head = pageHead({ num: 'W11', eyebrow: 'After · Certifications', title: 'Vouchers de certification', lead: 'Validez les demandes de vouchers de vos apprenants éligibles. Ils sont notifiés immédiatement.' });
      el.innerHTML = `${head}
        <div class="row between mb-2 reveal" style="flex-wrap:wrap;gap:12px"><div class="seg" role="group" aria-label="Filtrer les demandes"><button data-f="pending">En attente <span id="cPend"></span></button><button data-f="done">Traités <span id="cDone"></span></button></div><span class="small muted">Une demande « non éligible » reste à votre appréciation.</span></div>
        <div id="vList" class="reveal"></div>`;
      const list = () => S.data.vouchers.slice().sort((a, b) => (b.id === 'v-sana') - (a.id === 'v-sana'));
      function draw() {
        const all = list(); const pend = all.filter((v) => v.status === 'en_attente'); const done = all.filter((v) => v.status !== 'en_attente');
        el.querySelector('#cPend').textContent = `(${pend.length})`; el.querySelector('#cDone').textContent = `(${done.length})`;
        el.querySelectorAll('[data-f]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.f === voucherFilter));
        const rows = voucherFilter === 'pending' ? pend : done;
        const box = el.querySelector('#vList');
        if (ctx.scenario === 'vide' || !rows.length) { box.innerHTML = `<div class="card">${empty({ icon: 'ticket', color: 'teal', title: voucherFilter === 'pending' ? 'Aucune demande en attente' : 'Aucune demande traitée', text: voucherFilter === 'pending' ? 'Les demandes de vos apprenants apparaîtront ici.' : 'Les vouchers validés ou refusés seront listés ici.' })}</div>`; return; }
        box.innerHTML = `<div class="table-wrap"><table class="table"><thead><tr><th>Apprenant</th><th>Certification</th><th>Session</th><th>Éligibilité</th><th>Demandé le</th><th>Statut</th><th>Actions</th></tr></thead><tbody>${rows.map((v) => {
          const p = S.person(v.participantId); const ss = S.session(v.sessionId); const fm = ss ? S.formation(ss.formationId) : null;
          return `<tr data-id="${v.id}"><td><div class="person">${avatar(p, { size: 'sm' })}<div><b>${esc(p.fullName || p.name)}</b></div></div></td>
            <td><b>${esc(v.certification)}</b></td><td>${fm ? esc(fm.short) : '—'}<div class="xs dim">${ss ? S.fmtDateMid(ss.date) : ''}</div></td>
            <td>${v.eligible ? pill('Éligible', 'ok', { icon: 'check' }) : pill('Non éligible', 'orange', { icon: 'alert-triangle' })}<div class="xs dim" style="margin-top:4px;max-width:210px">${esc(v.eligibility)}</div></td>
            <td>${S.fmtDateMid(v.requestedAt)}</td><td>${statusPill(v.status)}</td>
            <td>${v.status === 'en_attente' ? `<div class="row" style="gap:8px;justify-content:flex-end"><button class="btn btn-sm btn-ok" data-act="validé" data-id="${v.id}">Valider</button><button class="btn btn-sm btn-ghost" data-act="refusé" data-id="${v.id}">Refuser</button></div>` : `<span class="xs dim">${v.decidedAt ? S.fmtDateShort(v.decidedAt) : ''}</span>`}</td></tr>`;
        }).join('')}</tbody></table></div>`;
        box.querySelectorAll('[data-act]').forEach((b) => b.addEventListener('click', () => {
          const v = S.data.vouchers.find((x) => x.id === b.dataset.id); const p = S.person(v.participantId); const ok = b.dataset.act === 'validé';
          confirm({
            title: ok ? 'Valider ce voucher ?' : 'Refuser ce voucher ?', ok: ok ? 'Valider' : 'Refuser', danger: !ok,
            text: `${esc(p.fullName || p.name)} · ${esc(v.certification)}.${!v.eligible && ok ? ' <b>Attention : l\'apprenant n\'est pas éligible selon les critères.</b>' : ''} ${p.name} sera notifié(e) immédiatement.`,
            onOk() { S.decideVoucher(v.id, b.dataset.act); toast(ok ? `Voucher validé — ${esc(p.name)} est notifié` : `Voucher refusé — ${esc(p.name)} est notifié`, ok ? 'ok' : 'info'); }
          });
        }));
      }
      el.querySelectorAll('[data-f]').forEach((b) => b.addEventListener('click', () => { voucherFilter = b.dataset.f; draw(); }));
      draw();
      ctx.on('vouchers', draw);
    }
  });

  /* =====================================================================
     W12 — Chat participants
     ===================================================================== */
  const chatRead = {};
  const readOf = (c) => { if (!(c.id in chatRead)) chatRead[c.id] = c.id === 'c-meriem' ? 0 : c.messages.length; return chatRead[c.id]; };
  const unreadOf = (c) => c.messages.slice(readOf(c)).filter((m) => m.from !== 'karim').length;
  let activeConv = null;

  App.view({
    id: 'W12', path: '/transverse/chat', roles: ['formateur'], phase: 'transverse', title: 'Chat participants',
    render(el, ctx) {
      const head = pageHead({ num: 'W12', eyebrow: 'Transverse · Messagerie', title: 'Chat participants', lead: 'Échangez avec vos participants avant, pendant et après la session.' });
      const convs = () => S.conversationsOf('karim');
      if (ctx.scenario === 'vide' || !convs().length) { el.innerHTML = head + `<div class="card reveal">${empty({ icon: 'message-circle', title: 'Aucune conversation', text: 'Les échanges avec vos participants apparaîtront ici dès leur inscription.' })}</div>`; return; }
      if (!activeConv || !convs().some((c) => c.id === activeConv)) { const un = convs().find((c) => unreadOf(c) > 0); activeConv = (un || convs()[0]).id; }
      el.innerHTML = `${head}<div class="chat-layout reveal"><aside class="card chat-list" aria-label="Conversations" id="convList"></aside><div id="chatPane" class="chat-pane"></div></div>`;
      let off = null;
      ctx.track(() => off && off());

      function drawList() {
        const groups = {}; convs().forEach((c) => (groups[c.sessionId] = groups[c.sessionId] || []).push(c));
        el.querySelector('#convList').innerHTML = Object.keys(groups).map((sid) => {
          const ss = S.session(sid);
          return `<div class="cl-group"><div class="cl-head">${esc(S.formation(ss.formationId).short)} · ${S.fmtDateShort(ss.date)}</div>${groups[sid].map((c) => {
            const last = c.messages[c.messages.length - 1]; const un = unreadOf(c);
            return `<button class="cl-item ${c.id === activeConv ? 'is-active' : ''}" data-c="${c.id}" aria-current="${c.id === activeConv}">${c.type === 'group' ? `<span class="icon-chip" style="--accent:var(--purple);width:40px;height:40px">${icon('users', { cls: 'sm' })}</span>` : avatar(c.participantId, { title: false })}
              <span class="grow cl-txt"><b class="truncate">${esc(c.title)}</b><span class="xs dim truncate">${last ? esc((last.from === 'karim' ? 'Vous : ' : '') + last.text) : ''}</span></span>
              ${un ? `<span class="unread" aria-label="${un} non lu${un > 1 ? 's' : ''}">${un}</span>` : ''}</button>`;
          }).join('')}</div>`;
        }).join('');
        el.querySelectorAll('[data-c]').forEach((b) => b.addEventListener('click', () => { activeConv = b.dataset.c; openConv(); }));
      }
      function openConv() {
        const c = convs().find((x) => x.id === activeConv); if (!c) return;
        chatRead[c.id] = c.messages.length;
        const pane = el.querySelector('#chatPane'); if (off) off();
        const reply = c.type === 'group' ? { from: 'amine', texts: ['Merci Mohamed, c\'est noté !', 'Parfait, à très bientôt.'] } : { from: c.participantId, texts: ['Merci beaucoup Mohamed !', 'C\'est noté, à très vite.', 'Super, merci pour la réponse.'] };
        off = window.ui.chat(pane, { convId: c.id, me: 'karim', quick: ['Le support est en ligne ✔', 'Rendez-vous à 9 h salle Carthage', 'Merci pour votre retour !'], autoReply: reply });
        drawList();
      }
      drawList(); openConv();
      ctx.on('chat', (p) => { if (p && p.convId === activeConv) { const c = convs().find((x) => x.id === activeConv); if (c) chatRead[c.id] = c.messages.length; } drawList(); });
    }
  });

  /* =====================================================================
     W13 — Mon badge formateur
     ===================================================================== */
  function badgeSvg(status) {
    const label = { actif: 'ACTIF', en_sursis: 'EN SURSIS', desactive: 'DÉSACTIVÉ' }[status];
    return `<svg class="bd-svg bd-${status}" viewBox="0 0 240 290" role="img" aria-label="Badge formateur Sofrecom Academy — ${label.toLowerCase()}">
      <defs>
        <linearGradient id="bdG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:var(--b1)"/><stop offset="1" style="stop-color:var(--b2)"/></linearGradient>
        <linearGradient id="bdR" x1="0" y1="0" x2="1" y2="0"><stop offset="0" style="stop-color:var(--b3)"/><stop offset="1" style="stop-color:var(--b2)"/></linearGradient>
      </defs>
      <polygon points="120,8 218,64 218,176 120,232 22,176 22,64" fill="url(#bdG)"/>
      <polygon points="120,22 206,71 206,169 120,218 34,169 34,71" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="2"/>
      <polygon points="120,40 190,80 190,160 120,200 50,160 50,80" fill="#fff" fill-opacity=".14"/>
      <g transform="translate(120 100)"><circle r="30" fill="#fff"/><path d="M0-17l5.2 10.6 11.7 1.7-8.5 8.2 2 11.6L0 8.6l-10.4 5.5 2-11.6-8.5-8.2 11.7-1.7z" style="fill:var(--b2)"/></g>
      <text x="120" y="158" text-anchor="middle" fill="#fff" font-size="13" font-weight="800" letter-spacing="2.4">FORMATEUR</text>
      <text x="120" y="176" text-anchor="middle" fill="#fff" fill-opacity=".9" font-size="10.5" font-weight="600" letter-spacing="1.8">CERTIFIÉ · 2026</text>
      <path d="M40 214h160l-14 22 14 22H40l14-22z" fill="url(#bdR)"/>
      <text x="120" y="242" text-anchor="middle" fill="#fff" font-size="13" font-weight="800" letter-spacing="2">${label}</text>
      <circle cx="120" cy="268" r="0"/>
    </svg>`;
  }

  App.view({
    id: 'W13', path: '/transverse/badge', roles: ['formateur'], phase: 'transverse', title: 'Mon badge',
    render(el, ctx) {
      const st = S.badgeStatus('karim'); const yr = S.trainerYear('karim'); const s = sessionCard();
      const positioned = s.trainerId === 'karim';
      const meta = {
        actif: { pill: 'ok', txt: 'Actif', msg: 'Votre badge est actif : le seuil de 2 formations en 2026 est atteint ou programmé.' },
        en_sursis: { pill: 'orange', txt: 'En sursis', msg: 'Il vous manque 1 formation programmée avant le 31 décembre pour conserver votre badge en 2027.' },
        desactive: { pill: 'red', txt: 'Désactivé', msg: 'Aucune formation en 2026 : votre badge est désactivé. Positionnez-vous sur une session pour le réactiver.' }
      }[st];
      const alerts = (S.data.badgeAlerts.karim || []).map((a) => ({ ...a }));
      if (positioned) {
        const item = { date: s.date, kind: 'done', title: `2ᵉ formation programmée — ${S.fmtDateShort(s.date)}`, text: `${S.formation(s.formationId).title}. Votre badge est actif.` };
        const i = alerts.findIndex((a) => a.date > s.date); alerts.splice(i < 0 ? alerts.length : i, 0, item);
      }
      const fids = S.data.sessions.filter((x) => x.trainerId === 'karim' && x.status === 'terminée').map((x) => x.formationId);
      const given = S.data.badges.filter((b) => fids.some((id) => { const fm = S.formation(id); return fm && b.rule.includes(fm.title); }));

      el.innerHTML = `${pageHead({ num: 'W13', eyebrow: 'Transverse · Badge formateur', title: 'Mon badge formateur', lead: 'Animez au moins 2 formations par an pour conserver votre badge Sofrecom Academy.' })}
        <div class="bd-grid">
          <section class="card reveal bd-card" aria-label="Statut du badge">
            <div class="bd-visual">${badgeSvg(st)}</div>
            <div class="bd-info">
              <div class="row" style="gap:10px;flex-wrap:wrap"><span class="eyebrow">Badge formateur</span>${pill(meta.txt, meta.pill, { dot: true })}</div>
              <h2 class="mt-1">${esc(S.data.users.karim.fullName)}</h2>
              <p class="muted small">Formateur certifié depuis ${S.fmtDateMid(S.data.users.karim.certifiedSince)} · Expert Cloud &amp; Edge</p>
              <p class="mt-2">${meta.msg}</p>
              <div class="quota mt-2"><div class="row between small"><b>Formations 2026</b><span><b>${yr.total}</b> / ${yr.threshold} requises</span></div>
                <div class="quota-seg" role="img" aria-label="${yr.done} animée, ${yr.scheduled} programmée sur ${yr.threshold} requises">${[0, 1].map((i) => `<span class="${i < yr.done ? 'done' : i < yr.done + yr.scheduled ? 'sched' : ''}"></span>`).join('')}</div>
                <div class="legend small"><span><i class="lg done"></i>${yr.done} animée${yr.done > 1 ? 's' : ''}</span><span><i class="lg sched"></i>${yr.scheduled} programmée${yr.scheduled > 1 ? 's' : ''}</span></div></div>
              <a class="btn btn-primary mt-3" href="#/before/sessions-ouvertes">${icon('calendar')}Voir les sessions ouvertes</a>
            </div>
          </section>
          <section class="card reveal" aria-labelledby="tlT"><div class="card-title"><h3 id="tlT">Alertes &amp; échéances</h3></div>
            <div class="timeline">${alerts.map((a) => `<div class="tl-item ${a.kind}"><div class="tl-date">${S.fmtDateMid(a.date)}</div><div class="tl-title">${esc(a.title)}</div><div class="tl-text">${esc(a.text)}</div></div>`).join('')}</div></section>
        </div>
        <section class="card reveal mt-3" aria-labelledby="skT"><div class="card-title"><h3 id="skT">Badges de compétences attribués</h3><span class="small muted">Suite à vos sessions</span></div>
          ${given.length ? `<div class="grid-3">${given.map((b) => `<div class="sk"><span class="icon-chip" style="--accent:${window.ui.colorVar(b.color)};width:44px;height:44px">${icon(b.icon)}</span><div><b>${esc(b.name)}</b><div class="small muted">${b.awarded.length} participant${b.awarded.length > 1 ? 's' : ''}</div><div style="margin-top:6px">${window.ui.avatarStack(b.awarded.map((a) => a.personId), 3)}</div></div></div>`).join('')}</div>` : empty({ icon: 'award', title: 'Aucun badge attribué pour l\'instant', text: 'Vos participants obtiennent des badges à l\'issue de vos sessions.' })}
        </section>`;
      ctx.on('sessions', () => ctx.refresh());
      ctx.on('badge', () => ctx.refresh());
    }
  });

  /* =====================================================================
     W14 — Paiements
     ===================================================================== */
  App.view({
    id: 'W14', path: '/transverse/paiements', roles: ['formateur'], phase: 'transverse', title: 'Paiements',
    render(el, ctx) {
      const head = pageHead({ num: 'W14', eyebrow: 'Transverse · Honoraires', title: 'Mes paiements', lead: 'Suivi de vos honoraires de formation, mis à jour par l\'équipe Academy.' });
      el.innerHTML = `${head}<div id="payBody"></div>`;
      const body = el.querySelector('#payBody');
      function draw(flashId) {
        const pays = S.paymentsOf('karim');
        if (ctx.scenario === 'vide' || !pays.length) { body.innerHTML = `<div class="card reveal">${empty({ icon: 'banknote', title: 'Aucun paiement pour le moment', text: 'Vos honoraires apparaîtront ici dès que vous animez une session.' })}</div>`; return; }
        const paid = pays.filter((p) => p.status === 'payé' && (p.date || '').startsWith('2026')).reduce((a, p) => a + p.amount, 0);
        const wait = pays.filter((p) => p.status !== 'payé').reduce((a, p) => a + p.amount, 0);
        const sorted = pays.slice().sort((a, b) => (b.date || '9999').localeCompare(a.date || '9999'));
        body.innerHTML = `<div class="grid-3">
            ${stat({ num: S.fmtMoney(paid), label: 'Total payé 2026', sub: 'Honoraires versés', icon: 'check-circle', color: 'ok', liveId: 'payPaid', i: 0 })}
            ${stat({ num: S.fmtMoney(wait), label: 'En attente', sub: 'En cours de traitement', icon: 'clock', color: 'orange', liveId: 'payWait', i: 1 })}
            ${stat({ num: String(pays.length), label: 'Sessions facturées', sub: 'Depuis 2025', icon: 'file-text', color: 'blue', i: 2 })}
          </div>
          <div class="table-wrap mt-3 reveal"><table class="table"><thead><tr><th>Session</th><th class="num-cell">Montant</th><th>Date</th><th>Statut</th></tr></thead><tbody>${sorted.map((p) => `<tr data-id="${p.id}" class="${p.id === flashId ? 'flash-in' : ''}"><td><b>${esc(p.label)}</b></td><td class="num-cell strong">${S.fmtMoney(p.amount)}</td><td>${p.status === 'payé' ? S.fmtDateMid(p.date) : p.date ? `Prévu le ${S.fmtDateShort(p.date)}` : '<span class="dim">À planifier</span>'}</td><td>${statusPill(p.status)}</td></tr>`).join('')}</tbody></table></div>`;
      }
      draw();
      ctx.on('payments', (p) => draw(p && p.id));
      ctx.on('sessions', () => draw());
    }
  });

  /* =====================================================================
     W15 — Smart Assist (tiroir global)
     ===================================================================== */
  const GEN_QUESTIONS = [
    { q: 'Dans le cœur 5G SA, quelle fonction réseau gère les sessions de données (allocation d\'adresse IP, sélection de l\'UPF) ?', options: ['AMF', 'SMF', 'UPF', 'NRF'], answer: 1 },
    { q: 'Dans l\'architecture orientée services (SBA), quelle fonction permet aux autres fonctions de se découvrir entre elles ?', options: ['NRF', 'AMF', 'PCF', 'UDM'], answer: 0 },
    { q: 'Comment une tranche réseau (slice) est-elle identifiée en 5G SA ?', options: ['S-NSSAI', 'IMSI', 'SUPI', 'GUTI'], answer: 0 },
    { q: 'Qu\'est-ce qui distingue le mode SA du mode NSA ?', options: ['Il s\'appuie sur le cœur 4G EPC', 'Il dispose d\'un cœur 5GC cloud natif', 'Il n\'utilise pas la radio NR', 'Il supprime le plan usager'], answer: 1 },
    { q: 'Quelle interface relie la gNB à l\'AMF pour le plan de contrôle ?', options: ['N2', 'N3', 'N4', 'N6'], answer: 0 }
  ];
  const LETTERS = ['A', 'B', 'C', 'D'];
  let assist = null; // { api, busy, timer }

  function assistReply(kind, prompt) {
    const s = sessionCard(); const f = S.formation(s.formationId);
    if (kind === 'quiz') return { text: `Voici un quiz de 5 questions à choix multiple sur la 5G SA, calibré pour un niveau intermédiaire. Chaque question comporte une seule bonne réponse (marquée ✓).`, quiz: true };
    if (kind === 'animation') return { text: `Idée d'animation — « Le slice idéal » (10 min)\n\n• 0-2 min : chaque table choisit un secteur (santé, industrie, médias).\n• 2-7 min : elle liste 3 exigences réseau (latence, débit, fiabilité).\n• 7-10 min : restitution éclair, le groupe vote la slice la plus ambitieuse.\n\nÀ placer après la pause de 14 h pour relancer l'attention et rendre le slicing concret.` };
    if (kind === 'activity') return { text: `Activité proposée — « Atelier slice industrie 4.0 » (30 min, équipes de 3)\n\n1. Brief (5 min) : usine connectée, 200 capteurs, robots mobiles.\n2. Conception (15 min) : définir la slice (SLA, S-NSSAI, localisation de l'UPF) et justifier l'edge.\n3. Challenge croisé (10 min) : une équipe tente de « casser » la conception d'une autre.\n\nLivrable : une fiche d'une page à rapporter sur le mur de la salle.` };
    if (kind === 'feedbacks') {
      const ev = S.evaluationsOf(s.id); if (!ev.length) return { text: 'Je n\'ai pas encore de retours à synthétiser pour cette session. Lancez le feedback depuis le mode séance, puis revenez me voir.' };
      const avgs = S.criteriaAverages(s.id); const cr = S.data.criteria.map((c) => ({ ...c, v: avgs[c.id] }));
      const best = cr.reduce((a, b) => (b.v > a.v ? b : a)); const low = cr.reduce((a, b) => (b.v < a.v ? b : a));
      const sg = (SUGGESTIONS[low.id] || []).slice(0, 3).map((t) => '• ' + t).join('\n');
      return { text: `J'ai analysé ${ev.length} retours anonymes de « ${f.short} » (${S.fmtDateShort(s.date)}).\n\nCe qui fonctionne bien\n• ${best.label} : ${f1(best.v)}/5 — les participants citent les quiz en direct et les cas réels.\n• Supports et utilité terrain appréciés (fiche mémo 5G SA).\n\nAxe de progression : ${low.label} (${f1(low.v)}/5)\nPlusieurs participants trouvent l'après-midi un peu dense. C'est un point simple à ajuster, et votre progression globale reste très positive.\n\nIdées à tester\n${sg}\n\nRappel : cette synthèse ne vous compare qu'à vous-même.` };
    }
    return { text: `Merci pour votre demande${prompt ? ' (« ' + prompt.slice(0, 60) + (prompt.length > 60 ? '…' : '') + ' »)' : ''}. En version complète, je m'appuierais sur vos contenus et vos retours participants. Dans cette maquette, essayez l'une des actions suggérées : générer un quiz, préparer une animation, synthétiser les feedbacks ou concevoir une activité.` };
  }
  function detectKind(t) {
    t = t.toLowerCase();
    if (/quiz|question|qcm/.test(t)) return 'quiz';
    if (/feedback|avis|synth|retour|évalua/.test(t)) return 'feedbacks';
    if (/anim|icebreaker|brise|énergi/.test(t)) return 'animation';
    if (/activit|atelier|exercice|jeu/.test(t)) return 'activity';
    return 'other';
  }

  App.openSmartAssist = function (opts = {}) {
    const fid = opts.formationId || 'f-cloud5g';
    const labels = { quiz: 'Génère-moi un quiz de 5 questions sur la 5G SA', animation: 'Prépare-moi une animation pour relancer l\'attention après la pause', feedbacks: 'Synthétise les feedbacks de ma dernière session', activity: 'Conçois une activité de 30 minutes sur le network slicing' };
    if (assist && document.body.contains(assist.api.el)) { if (opts.action) assist.run(opts.action, labels[opts.action]); return; }

    const api = drawer({
      title: 'Smart Assist', cls: 'assist', width: 460,
      headHtml: `<div class="row" style="gap:12px;min-width:0"><span class="icon-chip as-chip">${icon('sparkles')}</span><div><span class="as-kick">LET'S GET SMART!</span><h3 class="as-title">Smart Assist</h3></div></div>`,
      body: `<div class="assist-hero"><b>Bonjour Mohamed 👋</b><p class="small" style="margin-top:4px">Je prépare vos quiz, animations et synthèses. Choisissez une action ou posez-moi une question.</p></div>
        <div class="as-actions" id="asActions">${[['quiz', 'help-circle', 'Générer un quiz', 'QCM prêts à injecter dans votre contenu'], ['animation', 'zap', 'Préparer une animation', 'Un temps fort pour relancer le groupe'], ['feedbacks', 'message-square', 'Synthétiser les feedbacks', 'Points forts et axes de progression'], ['activity', 'lightbulb', 'Concevoir une activité', 'Atelier clé en main, minuté']].map((a) => `<button class="assist-action" data-a="${a[0]}"><span class="icon-chip">${icon(a[1], { cls: 'sm' })}</span><span><b>${a[2]}</b><span class="small muted" style="display:block">${a[3]}</span></span></button>`).join('')}</div>
        <div class="as-log" id="asLog" aria-live="polite"></div>`,
      foot: `<form class="as-form" id="asForm"><label class="sr-only" for="asIn">Votre demande</label><input class="input" id="asIn" placeholder="Ex. Génère-moi un quiz de 5 questions sur la 5G SA" autocomplete="off"><button class="btn btn-teal btn-icon" aria-label="Envoyer">${icon('send')}</button></form><p class="xs dim" style="margin-top:8px;text-align:center">Réponses simulées — maquette</p>`,
      onClose() { if (assist) clearInterval(assist.timer); assist = null; }
    });
    assist = { api, busy: false, timer: null };
    const root = api.el; const log = root.querySelector('#asLog'); const body = root.querySelector('.drawer-body');
    const down = () => { body.scrollTop = body.scrollHeight; };

    function stream(node, text, done) {
      if (REDUCED()) { node.textContent = text; done(); return; }
      let i = 0; node.innerHTML = '<span class="caret"></span>'; const caret = node.querySelector('.caret');
      const tx = document.createTextNode(''); node.insertBefore(tx, caret);
      assist.timer = setInterval(() => {
        i = Math.min(text.length, i + 3); tx.nodeValue = text.slice(0, i); down();
        if (i >= text.length) { clearInterval(assist.timer); caret.remove(); done(); }
      }, 18);
    }

    function run(kind, promptText) {
      if (!assist || assist.busy) return; assist.busy = true;
      const r = assistReply(kind, kind === 'other' ? promptText : '');
      log.insertAdjacentHTML('beforeend', `<div class="assist-msg user">${esc(promptText || labels[kind])}</div><div class="assist-msg as-bot"><span class="as-typing" aria-label="Smart Assist réfléchit"><span></span><span></span><span></span></span></div>`);
      down();
      const bot = log.lastElementChild;
      setTimeout(() => {
        if (!assist) return;
        bot.classList.add('is-streaming'); bot.style.whiteSpace = 'pre-wrap';
        stream(bot, r.text, () => {
          bot.style.whiteSpace = '';
          if (r.quiz) renderQuiz(bot);
          else if (kind === 'feedbacks') bot.insertAdjacentHTML('beforeend', `<div class="as-cta"><a class="btn btn-sm btn-soft" href="#/after/progression" data-close-as>Voir ma progression</a></div>`);
          if (assist) assist.busy = false; down();
          const l = bot.querySelector('[data-close-as]'); if (l) l.addEventListener('click', () => api.close());
        });
      }, REDUCED() ? 0 : 650);
    }
    function renderQuiz(bot) {
      bot.insertAdjacentHTML('beforeend', `<ol class="gq">${GEN_QUESTIONS.map((q) => `<li class="gq-item"><b>${esc(q.q)}</b><ul>${q.options.map((o, i) => `<li class="${i === q.answer ? 'ok' : ''}"><span class="gq-l">${LETTERS[i]}</span>${esc(o)}${i === q.answer ? icon('check', { cls: 'sm' }) : ''}</li>`).join('')}</ul></li>`).join('')}</ol>
        <button class="btn btn-teal btn-block" id="injectBtn">${icon('download')}Injecter dans Contenu &amp; Quiz</button>`);
      bot.querySelector('#injectBtn').addEventListener('click', (e) => {
        e.currentTarget.disabled = true;
        const c = S.data.content[fid] = S.data.content[fid] || { files: [], slides: [], quiz: [] };
        c.quiz = c.quiz || [];
        c.quiz.push(...GEN_QUESTIONS.map((q) => ({ q: q.q, options: q.options.slice(), answer: q.answer, generated: true })));
        S.commit('content', { formationId: fid });
        api.close(); App.go('#/before/contenu?f=' + fid);
        toast('5 questions générées par Smart Assist injectées dans Contenu &amp; Quiz', 'smart');
      });
    }
    assist.run = run;

    root.querySelectorAll('[data-a]').forEach((b) => b.addEventListener('click', () => run(b.dataset.a, labels[b.dataset.a])));
    root.querySelector('#asForm').addEventListener('submit', (e) => {
      e.preventDefault(); const i = root.querySelector('#asIn'); const v = i.value.trim(); if (!v) return;
      i.value = ''; run(detectKind(v), v);
    });
    if (opts.action && labels[opts.action]) run(opts.action, labels[opts.action]);
  };
})();
