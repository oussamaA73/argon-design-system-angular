/* =====================================================================
   VUES PARTICIPANT (Sana B.) — P1 Accueil · P4 Ma session · P5/P6 Évaluations
   · P7 Badges & certifications · P8 Chat formateur
   (P2 Catalogue, C3 Fiche et P3 Inscription sont dans views-common.js)
   ===================================================================== */
(function () {
  const { icon, esc, pageHead, pill, stat, toast } = window.ui;
  const SID = () => window.SFA_FIL_ROUGE;
  const ME = 'sana';
  const COLD_SID = 's-cloud101-0520'; // session « Cloud — les fondamentaux » du 20 mai (évaluation à froid)
  const C = () => window.SFA_C;

  /* ---------- Helpers ---------- */
  const mySessions = () => Store.data.sessions
    .filter((s) => (s.inscrits.includes(ME) || (s.pending || []).includes(ME)) && s.date >= window.SFA_TODAY && s.status !== 'terminée' && s.status !== 'annulée')
    .sort((a, b) => a.date.localeCompare(b.date));
  const myStatusOn = (s) => Store.enrollmentStatus(s.id, ME);
  const coldDone = () => Store.data.coldEvals.some((c) => c.pid === ME && c.sessionId === COLD_SID);
  const hotDone = () => (Store.session(SID()).evaluatedBy || []).includes(ME);
  const trainerName = (s) => (s.trainerId ? Store.person(s.trainerId).name : null);
  const statusPill = (st) => st === 'confirmée' ? `<span class="pill ok">${icon('check-circle', { cls: 'sm' })}Confirmée</span>` : `<span class="pill orange">${icon('clock', { cls: 'sm' })}En attente</span>`;

  /** Visuel de badge SVG (hexagone dégradé + pictogramme) */
  let gradN = 0;
  function badgeArt(b, o = {}) {
    const size = o.size || 96; const id = 'bgr' + (++gradN);
    return `<div class="bdg ${o.locked ? 'is-locked' : ''}" style="--c:${window.ui.colorVar(b.color)};width:${size}px;height:${size}px">
      <svg viewBox="0 0 100 100" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:var(--c)"/><stop offset="1" style="stop-color:color-mix(in srgb, var(--c) 55%, var(--blue-d))"/></linearGradient></defs>
        <polygon points="50,3 91,26.5 91,73.5 50,97 9,73.5 9,26.5" fill="url(#${id})"/>
        <polygon points="50,11 84,30.5 84,69.5 50,89 16,69.5 16,30.5" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="1.6"/>
        <path d="M18 34 L50 15 L82 34" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="3" stroke-linecap="round"/></svg>
      <span class="bdg-ico">${icon(o.locked ? 'lock' : b.icon, { cls: size > 80 ? 'xl' : 'lg' })}</span></div>`;
  }

  /* =====================================================================
     P1 — Accueil
     ===================================================================== */
  App.view({
    id: 'P1', path: '/p/accueil', roles: ['participant'], phase: 'participant', title: 'Accueil',
    render(el, ctx) {
      const u = Store.data.users.sana;
      el.innerHTML = pageHead({ num: 'P1', eyebrow: 'Accueil participant', titleHtml: `Bonjour <span class="gradient-text">${esc(u.name.split(' ')[0])}</span>`, lead: 'Content de vous revoir. Voici où vous en êtes dans votre parcours de montée en compétences.' }) + '<div id="p1-dyn" class="stack-lg"></div>';
      const dyn = el.querySelector('#p1-dyn');

      const draw = (flashNext) => {
        const vide = ctx.scenario === 'vide';
        const list = vide ? [] : mySessions(); const next = list[0];
        const confirmed = list.filter((s) => myStatusOn(s) === 'confirmée').length;
        const badges = Store.badgesOf(ME).length;
        const days = next ? Store.daysUntil(next.date) : null;
        const fil = Store.session(SID()); const inFil = fil.inscrits.includes(ME);

        /* bannières temps réel */
        let alerts = '';
        if (inFil && fil.live.quiz === 'running' && !Store.data.quizResults[SID()][ME]) alerts += window.ui.banner({ color: 'teal', icon: 'help-circle', html: '<b>Le quiz est lancé !</b> Votre formateur vous attend : répondez en 2 minutes.', actions: '<a class="btn btn-primary btn-sm" href="#/p/session">Répondre au quiz</a>' });
        if (inFil && fil.live.feedback === 'open' && !hotDone()) alerts += window.ui.banner({ color: 'blue', icon: 'star', html: '<b>Votre avis compte.</b> Le formulaire d\'évaluation (anonyme) est ouvert.', actions: '<a class="btn btn-primary btn-sm" href="#/p/evaluation">Donner mon avis</a>' });
        if (!vide && !coldDone()) alerts += window.ui.banner({ color: ctx.scenario === 'alerte' ? 'orange' : 'blue', icon: 'refresh-cw', html: `<b>Évaluation à froid — « Cloud — les fondamentaux » (20 mai).</b> Racontez-nous comment vous mettez la formation en pratique : 3 questions, 2 minutes.`, actions: '<a class="btn btn-soft btn-sm" href="#/p/evaluation?tab=froid">Répondre</a>' });

        /* carte prochaine session */
        let nextCard;
        if (!next) {
          nextCard = `<section class="card reveal">${window.ui.empty({ icon: 'calendar', color: 'cyan', title: 'Aucune session à venir', text: 'Parcourez le catalogue et demandez votre inscription à votre prochaine formation.', cta: '<a class="btn btn-primary" href="#/catalogue">Explorer le catalogue</a>' })}</section>`;
        } else {
          const f = Store.formation(next.formationId); const st = myStatusOn(next); const fl = Store.fill(next); const tn = trainerName(next);
          nextCard = `<section class="card next-card ${flashNext ? 'flash-in' : ''}" style="--accent:${window.ui.colorVar(f.color)}" aria-live="polite">
            <div class="nc-count"><span class="nc-j">J-${days}</span><span class="nc-d">${Store.fmtDateShort(next.date)}</span></div>
            <div class="grow">
              <div class="row between" style="align-items:flex-start"><div><span class="eyebrow" style="--phase-accent:var(--cyan)"><span class="num">Ma prochaine session</span></span><h2 style="margin-top:10px;font-size:var(--fs-xl)">${esc(f.title)}</h2></div><span class="${flashNext ? 'pulse-once' : ''}">${statusPill(st)}</span></div>
              <div class="nc-meta"><div>${icon('calendar', { cls: 'sm' })} ${Store.fmtDate(next.date)} · ${esc(next.time)}</div><div>${icon('map-pin', { cls: 'sm' })} ${esc(next.location)}</div><div>${icon('user', { cls: 'sm' })} ${tn ? 'Animée par ' + esc(tn) : 'Formateur à confirmer'}</div></div>
              <p class="small muted mt-1">${st === 'confirmée' ? 'Votre place est réservée. Pensez à relire la fiche mémo avant la séance.' : (tn ? esc(tn) : 'L\'équipe Academy') + ' examine votre demande : vous serez notifiée dès sa décision.'}</p>
              <div class="row mt-2"><a class="btn btn-soft btn-sm" href="#/catalogue/${f.id}">Voir la fiche</a>${next.id === SID() ? '<a class="btn btn-primary btn-sm" href="#/p/session">Ma session</a><a class="btn btn-ghost btn-sm" href="#/p/chat">' + icon('message-circle', { cls: 'sm' }) + 'Écrire au formateur</a>' : ''}</div>
              <div class="mt-2" style="max-width:360px">${window.ui.gauge({ value: fl.n, min: fl.min, max: fl.max, label: 'Inscrits' })}</div>
            </div></section>`;
        }

        /* recommandations */
        const doneF = new Set(Store.data.sessions.filter((s) => s.status === 'terminée' && s.inscrits.includes(ME)).map((s) => s.formationId));
        const busyF = new Set(list.map((s) => s.formationId));
        const reco = vide ? [] : Store.data.formations.filter((f) => f.status === 'validée' && !doneF.has(f.id) && !busyF.has(f.id) && C().nextSession(f.id) &&
          f.prerequisites.filter((p) => p.badgeId).every((p) => Store.hasBadge(ME, p.badgeId))).slice(0, 3);
        const recoHtml = reco.length ? `<div class="grid-3">${reco.map((f) => {
          const s = C().nextSession(f.id); const bp = f.prerequisites.filter((p) => p.badgeId);
          return `<a class="card hover reco-card" style="--accent:${window.ui.colorVar(f.color)}" href="#/catalogue/${f.id}"><span class="icon-chip" style="--accent:${window.ui.colorVar(f.color)}">${icon('graduation-cap')}</span>
            <h3 style="font-size:var(--fs-md)">${esc(f.title)}</h3><div class="row" style="gap:6px"><span class="pill outline">${esc(f.level)}</span><span class="pill outline">${esc(f.format)}</span></div>
            <div class="dim">${bp.length ? '<span class="ok-txt">' + icon('check', { cls: 'sm' }) + ' Vos prérequis sont validés</span>' : 'Aucun prérequis'}</div>
            <div class="dim">${icon('calendar', { cls: 'sm' })} ${Store.fmtDateMid(s.date)}</div></a>`;
        }).join('')}</div>` : window.ui.empty({ icon: 'lightbulb', color: 'cyan', title: 'Pas encore de recommandation', text: 'Gagnez un badge pour débloquer de nouvelles formations adaptées à votre profil.' });

        dyn.innerHTML = `${alerts ? `<div class="stack">${alerts}</div>` : ''}
          <div class="grid-3">
            ${stat({ i: 0, num: String(vide ? 0 : u.formationsSuivies), label: 'Formations suivies', sub: confirmed ? `+ ${confirmed} session${confirmed > 1 ? 's' : ''} confirmée${confirmed > 1 ? 's' : ''}` : 'Votre parcours depuis 2025', icon: 'graduation-cap', color: 'cyan' })}
            ${stat({ i: 1, num: String(vide ? 0 : badges), label: 'Badges de compétences', sub: 'Cloud Fundamentals, Facilitateur agile…', icon: 'award', color: 'teal' })}
            ${stat({ i: 2, num: next ? `J-${days}` : '—', label: 'Prochaine session', sub: next ? esc(Store.formation(next.formationId).short) + ' · ' + Store.fmtDateShort(next.date) : 'À planifier', icon: 'calendar', color: 'blue' })}
          </div>
          <div class="grid-main">${nextCard}
            <div class="live reveal"><span class="icon-chip" style="--accent:#fff;background:rgba(255,255,255,.2);color:#fff;margin-bottom:12px">${icon('compass')}</span><h3>Découvrir le catalogue</h3><p class="small" style="margin:8px 0 16px">Plus de ${Store.data.formations.filter((f) => f.status === 'validée').length} formations animées par des experts Sofrecom.</p><a class="btn btn-white" href="#/catalogue">Explorer${icon('arrow-right', { cls: 'sm' })}</a></div></div>
          <section class="reveal"><div class="row between mb-2"><h2 class="sec-h" style="margin:0">Recommandé pour vous</h2><a class="small strong" href="#/catalogue">Tout le catalogue</a></div>${recoHtml}</section>`;
        window.ui.stagger(dyn);
      };
      draw(false);
      ctx.on('inscriptions', (p) => { if (p && p.pid && p.pid !== ME && p.kind === 'sim') return; draw(true); });
      ctx.on('live', () => draw(false));
      ctx.on('evaluations', () => draw(false));
      ctx.on('quiz', () => draw(false));
    }
  });

  /* =====================================================================
     P4 — Ma session (en direct)
     ===================================================================== */
  function signatureModal(onSigned) {
    window.ui.modal({
      title: 'Signer ma présence', eyebrow: 'P4 · Émargement', accent: 'var(--cyan)',
      body: `<p class="small muted mb-2">Dessinez votre signature dans le cadre ci-dessous, à la souris ou au doigt.</p>
        <div class="sig-pad"><canvas id="sig-c" aria-label="Zone de signature" role="img"></canvas><span class="sig-hint" id="sig-hint">${icon('pen-line', { cls: 'sm' })} Signez ici</span><span class="sig-line"></span></div>`,
      foot: `<button class="btn btn-ghost" id="sig-clear">Effacer</button><button class="btn btn-primary" id="sig-ok">${icon('check', { cls: 'sm' })}Signer</button>`,
      onOpen(el, close) {
        const cv = el.querySelector('#sig-c'); const hint = el.querySelector('#sig-hint');
        const dpr = window.devicePixelRatio || 1; const w = cv.clientWidth, h = cv.clientHeight;
        cv.width = w * dpr; cv.height = h * dpr;
        const g = cv.getContext('2d'); g.scale(dpr, dpr); g.lineWidth = 2.6; g.lineCap = 'round'; g.lineJoin = 'round';
        g.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--blue-d').trim() || '#21527C';
        let drawing = false, last = null, empty = true, busy = false;
        const pos = (e) => { const r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
        cv.addEventListener('pointerdown', (e) => { drawing = true; last = pos(e); cv.setPointerCapture(e.pointerId); empty = false; hint.style.opacity = 0; e.preventDefault(); });
        cv.addEventListener('pointermove', (e) => { if (!drawing) return; const p = pos(e); g.beginPath(); g.moveTo(last.x, last.y); g.lineTo(p.x, p.y); g.stroke(); last = p; });
        const stop = () => { drawing = false; };
        cv.addEventListener('pointerup', stop); cv.addEventListener('pointercancel', stop);
        el.querySelector('#sig-clear').addEventListener('click', () => { g.clearRect(0, 0, w, h); empty = true; hint.style.opacity = 1; });
        /* signature automatique si le cadre est vide (démo) */
        const autoSign = (cb) => {
          const pts = []; const n = 70;
          for (let i = 0; i <= n; i++) { const t = i / n; pts.push({ x: w * (0.14 + 0.72 * t), y: h * (0.5 + 0.22 * Math.sin(t * 15) * (1 - t * 0.5) - 0.12 * Math.sin(t * 5)) }); }
          let i = 1; g.beginPath(); g.moveTo(pts[0].x, pts[0].y); hint.style.opacity = 0;
          const tm = setInterval(() => { if (i > n) { clearInterval(tm); g.beginPath(); g.moveTo(w * .2, h * .78); g.lineTo(w * .82, h * .7); g.stroke(); cb(); return; } g.lineTo(pts[i].x, pts[i].y); g.stroke(); i++; }, 10);
        };
        el.querySelector('#sig-ok').addEventListener('click', () => {
          if (busy) return; busy = true;
          const finish = () => setTimeout(() => { close(); onSigned(); }, 250);
          if (empty) autoSign(finish); else finish();
        });
      }
    });
  }

  App.view({
    id: 'P4', path: '/p/session', roles: ['participant'], phase: 'participant', title: 'Ma session',
    render(el, ctx) {
      const sid = SID(); const sess = () => Store.session(sid);
      const status = () => Store.enrollmentStatus(sid, ME);
      const f = Store.formation(sess().formationId);
      el.innerHTML = pageHead({ num: 'P4', eyebrow: 'Ma session en direct', title: 'Ma séance', lead: 'Émargement, quiz et supports : tout ce dont vous avez besoin pendant la formation, au même endroit.' }) + '<div id="p4-root"></div>';
      const root = el.querySelector('#p4-root');

      if (ctx.scenario === 'vide' || status() !== 'confirmée') {
        const pend = status() === 'en_attente' && ctx.scenario !== 'vide';
        root.innerHTML = pend
          ? `<div class="card reveal">${window.ui.empty({ icon: 'clock', color: 'orange', title: 'En attente de confirmation par le formateur', text: `Votre demande pour « ${esc(f.title)} » du ${Store.fmtDate(sess().date)} a bien été envoyée. Cet écran s'activera dès sa confirmation.`, cta: '<a class="btn btn-soft" href="#/p/accueil">Retour à l\'accueil</a>' })}</div>`
          : `<div class="card reveal">${window.ui.empty({ icon: 'monitor', color: 'cyan', title: 'Aucune séance en cours pour vous', text: 'Inscrivez-vous à une formation pour retrouver ici votre émargement, vos quiz et vos supports le jour J.', cta: '<a class="btn btn-primary" href="#/catalogue">Explorer le catalogue</a>' })}</div>`;
        ctx.on('inscriptions', () => ctx.refresh());
        return;
      }

      root.innerHTML = `<div id="p4-fb"></div>
        <header class="card p4-head reveal" style="--accent:${window.ui.colorVar(f.color)}"><div class="grow"><div class="row" style="gap:8px"><span id="p4-live"></span></div>
          <h2 style="margin:8px 0 6px;font-size:var(--fs-xl)">${esc(f.title)}</h2>
          <div class="dim">${icon('calendar', { cls: 'sm' })} ${Store.fmtDate(sess().date)} · ${esc(sess().time)} &nbsp; ${icon('map-pin', { cls: 'sm' })} ${esc(sess().location)}</div></div>
          <div class="row" style="gap:8px">${sess().trainerId ? `${window.ui.avatar(sess().trainerId)}<div><b>${esc(Store.person(sess().trainerId).name)}</b><div class="dim">Formateur</div></div>` : '<span class="pill outline">Formateur à confirmer</span>'}</div></header>
        <div class="grid-main mt-3"><div class="stack-lg"><section class="card reveal" id="p4-pres"></section><section class="card reveal" id="p4-quiz"></section></div>
          <aside class="stack-lg"><section class="card reveal" id="p4-slide"></section></aside></div>`;

      const quiz = (Store.data.content['f-cloud5g'].quiz || []).slice(0, 5);
      const Q = { i: 0, picked: null, score: 0 };
      let quizMode = null;

      const drawLive = () => {
        const s = sess();
        root.querySelector('#p4-live').innerHTML = s.live.started ? `<span class="pill ok"><span class="live-dot"></span>Séance en cours</span>` : `<span class="pill outline">${icon('clock', { cls: 'sm' })}Démarre le ${Store.fmtDateShort(s.date)} à ${esc(s.time.slice(0, 5))}</span>`;
        const fb = root.querySelector('#p4-fb');
        const want = s.live.feedback === 'open' && !hotDone();
        if (want && !fb.firstChild) fb.innerHTML = `<div class="stack mb-3">${window.ui.banner({ color: 'blue', icon: 'star', html: '<b>La séance se termine : donnez votre avis !</b> Un formulaire anonyme de 2 minutes pour aider votre formateur à progresser.', actions: '<a class="btn btn-primary btn-sm" href="#/p/evaluation">Évaluer la séance</a>' })}</div>`;
        if (!want) fb.innerHTML = '';
      };
      const drawPres = (flash) => {
        const at = (sess().signatures || {})[ME]; const box = root.querySelector('#p4-pres');
        box.innerHTML = at ? `<div class="pres-done ${flash ? 'flash-in' : ''}"><span class="icon-chip" style="--accent:var(--green-ok)">${icon('check-circle', { cls: 'lg' })}</span><div><h3 style="font-size:var(--fs-md)">Présence signée à ${Store.fmtTime(at) || '09:04'} ✔</h3><p class="small muted">Votre émargement est transmis au formateur. Bonne séance !</p></div></div>`
          : `<div class="row between" style="gap:16px"><div class="row nowrap"><span class="icon-chip" style="--accent:var(--cyan)">${icon('pen-line', { cls: 'lg' })}</span><div><h3 style="font-size:var(--fs-md)">Émargement</h3><p class="small muted">Signez pour confirmer votre présence à la séance.</p></div></div><button class="btn btn-primary btn-lg" id="p4-sign">${icon('pen-line')}Signer ma présence</button></div>`;
        const b = box.querySelector('#p4-sign');
        if (b) b.addEventListener('click', () => signatureModal(() => { Store.signAttendance(sid, ME); toast('Présence signée, merci !', 'ok', { icon: 'pen-line' }); drawPres(true); }));
      };

      /* --- Quiz --- */
      const head = (txt, right) => `<div class="row between"><div class="row nowrap"><span class="icon-chip" style="--accent:var(--teal)">${icon('help-circle', { cls: 'lg' })}</span><div><h3 style="font-size:var(--fs-md)">Quiz en cours</h3><p class="small muted">${txt}</p></div></div>${right || ''}</div>`;
      const drawQuiz = (force) => {
        const s = sess(); const res = Store.data.quizResults[sid][ME];
        const mode = res ? 'done' : s.live.quiz === 'running' ? 'running' : s.live.quiz === 'closed' ? 'closed' : 'idle';
        if (mode === quizMode && !force) return; quizMode = mode;
        const box = root.querySelector('#p4-quiz');
        if (mode === 'idle') box.innerHTML = `<div class="quiz-idle">${head('Le quiz s\'activera quand le formateur le lancera.', '<span class="pill outline">Inactif</span>')}<div class="quiz-ghost" aria-hidden="true"><span></span><span></span><span></span></div></div>`;
        else if (mode === 'closed') box.innerHTML = head('Le quiz est terminé. Vos résultats seront partagés avec le formateur.', '<span class="pill outline">Clôturé</span>');
        else if (mode === 'done') {
          const pct = Math.round((res.score / res.total) * 100);
          box.innerHTML = `<div class="flash-in">${head('Vos réponses sont enregistrées.', '<span class="pill ok">Terminé</span>')}<div class="quiz-score"><div class="qs-num"><b>${res.score}</b><span>/${res.total}</span></div><div class="grow"><b>${res.score >= res.total - 1 ? 'Excellent travail !' : 'Bien joué, vous progressez !'}</b><p class="small muted">${pct} % de bonnes réponses. ${res.score < res.total ? 'Les notions à revoir seront reprises par le formateur.' : 'Sans faute.'}</p>${window.ui.progress(pct, { label: 'Score' })}</div></div></div>`;
        } else drawQ();
      };
      const drawQ = () => {
        const box = root.querySelector('#p4-quiz'); const q = quiz[Q.i]; const n = quiz.length;
        const L = ['A', 'B', 'C', 'D'];
        box.innerHTML = `${head(`Question ${Q.i + 1} sur ${n}`, '<span class="pill teal"><span class="live-dot"></span>En direct</span>')}
          <div class="mt-2">${window.ui.progress(Math.round((Q.i / n) * 100), { label: 'Progression du quiz' })}</div>
          <h3 class="q-text" id="q-t">${esc(q.q)}</h3>
          <div class="stack" role="group" aria-labelledby="q-t">${q.options.map((o, k) => {
            let cls = ''; if (Q.picked != null) { if (k === q.answer) cls = 'is-right'; else if (k === Q.picked) cls = 'is-wrong'; else cls = 'is-dim'; }
            return `<button class="q-opt ${cls}" data-k="${k}" ${Q.picked != null ? 'disabled' : ''}><span class="q-let">${L[k]}</span><span class="grow">${esc(o)}</span>${Q.picked != null && k === q.answer ? icon('check-circle') : ''}</button>`;
          }).join('')}</div>
          ${Q.picked != null ? `<div class="q-fb ${Q.picked === q.answer ? 'ok' : 'ko'}" role="status">${Q.picked === q.answer ? icon('check-circle', { cls: 'sm' }) + ' <b>Bonne réponse !</b>' : icon('info', { cls: 'sm' }) + ' <b>Pas tout à fait.</b> La bonne réponse : ' + esc(q.options[q.answer]) + '.'}</div>
          <div class="row mt-2" style="justify-content:flex-end"><button class="btn btn-primary" id="q-next">${Q.i === n - 1 ? 'Voir mon score' : 'Question suivante'}${icon('arrow-right', { cls: 'sm' })}</button></div>` : ''}`;
        box.querySelectorAll('.q-opt').forEach((b) => b.addEventListener('click', () => { Q.picked = +b.dataset.k; if (Q.picked === q.answer) Q.score++; drawQ(); }));
        const nx = box.querySelector('#q-next');
        if (nx) { nx.focus(); nx.addEventListener('click', () => {
          if (Q.i === n - 1) { Store.submitQuiz(sid, ME, Q.score, n); toast(`Quiz terminé : ${Q.score}/${n}`, 'ok', { icon: 'help-circle' }); quizMode = null; drawQuiz(); }
          else { Q.i++; Q.picked = null; drawQ(); }
        }); }
      };

      /* --- Support --- */
      let lastSlide = -1;
      const drawSlide = () => {
        const slides = Store.data.content['f-cloud5g'].slides; const files = Store.data.content['f-cloud5g'].files;
        const i = Math.min(sess().live.slide || 0, slides.length - 1); const box = root.querySelector('#p4-slide');
        const sl = slides[i];
        box.innerHTML = `<div class="row between mb-2"><h3 style="font-size:var(--fs-md)">Support de séance</h3><span class="pill outline" aria-live="polite">Diapo ${i + 1}/${slides.length}</span></div>
          <div class="slide-view ${lastSlide !== -1 && lastSlide !== i ? 'flash-in' : ''}"><span class="eyebrow" style="--phase-accent:var(--cyan)"><span class="num">${String(i + 1).padStart(2, '0')}</span></span><h4>${esc(sl.title)}</h4><p>${esc(sl.text)}</p></div>
          <p class="dim mt-1">${s_live_hint()}</p>
          <div class="mt-2 stack">${files.map((fi) => `<button class="file-row" data-file="${esc(fi.name)}">${icon('file-text', { cls: 'sm' })}<span class="grow truncate">${esc(fi.name)}</span><span class="dim">${esc(fi.size)}</span>${icon('download', { cls: 'sm' })}</button>`).join('')}</div>`;
        lastSlide = i;
        box.querySelectorAll('[data-file]').forEach((b) => b.addEventListener('click', () => toast(`Téléchargement de « ${esc(b.dataset.file)} » (simulation)`, 'info', { icon: 'download' }))); // MOCK
      };
      const s_live_hint = () => sess().live.started ? 'La diapositive suit la présentation du formateur.' : 'Les diapositives apparaîtront au démarrage de la séance.';

      drawLive(); drawPres(); drawQuiz(true); drawSlide();
      ctx.on('live', () => { drawLive(); drawQuiz(); drawSlide(); });
      ctx.on('attendance', (p) => { if (!p || p.pid === ME) drawPres(); });
      ctx.on('inscriptions', () => { if (status() !== 'confirmée') ctx.refresh(); });
    }
  });

  /* =====================================================================
     P5 — Évaluation à chaud (LET'S RATE!) + P6 — Évaluation à froid
     ===================================================================== */
  App.view({
    id: 'P5', path: '/p/evaluation', roles: ['participant'], phase: 'participant', title: 'Évaluations',
    render(el, ctx) {
      const sid = SID(); const f = Store.formation(Store.session(sid).formationId);
      const tab = (ctx.params.query && ctx.params.query.tab) === 'froid' ? 'froid' : 'chaud';
      const forced = { v: false };
      el.innerHTML = pageHead({ num: 'P5', eyebrow: 'Évaluations', title: 'Votre avis nous fait progresser', lead: 'Aidez votre formateur à progresser : quelques minutes pour partager votre ressenti, sans aucune pression.' }) +
        window.ui.tabsHtml('evals', [{ id: 'chaud', label: 'À chaud · fin de séance', icon: 'star' }, { id: 'froid', label: 'À froid · J+30', icon: 'refresh-cw' }], tab) +
        window.ui.tabPanel('evals', 'chaud', tab, '<div id="hot"></div>') + window.ui.tabPanel('evals', 'froid', tab, '<div id="cold"></div>');
      window.ui.bindTabs(el);
      const hot = el.querySelector('#hot'); const cold = el.querySelector('#cold');

      const anon = `<div class="anon-note" role="note"><span class="icon-chip" style="--accent:var(--teal)">${icon('shield-check', { cls: 'lg' })}</span><div><b>Vos réponses sont anonymes.</b><div class="small muted">Votre nom n'est jamais associé à votre évaluation. Le formateur ne voit que les résultats agrégés et des commentaires sans identité.</div></div></div>`;

      const drawHot = () => {
        const s = Store.session(sid); const open = s.live.feedback === 'open' || forced.v;
        if (hotDone()) {
          hot.innerHTML = `<div class="card thanks flash-in"><div class="thanks-ico">${icon('heart', { cls: 'xl' })}</div><h2>Merci pour votre retour !</h2><p class="muted">Votre évaluation anonyme a bien été transmise. Elle aidera ${s.trainerId ? esc(Store.person(s.trainerId).name) : 'votre formateur'} à enrichir la prochaine session.</p><a class="btn btn-primary mt-2" href="#/p/accueil">Retour à l'accueil</a></div>`; return;
        }
        if (!open) {
          hot.innerHTML = `<div class="card">${window.ui.empty({ icon: 'clock', color: 'cyan', title: 'Le formulaire s\'ouvrira à la fin de la séance', text: `Votre formateur l'activera à la fin de « ${esc(f.short)} ». Vous serez notifiée immédiatement.`, cta: '<button class="btn-link-discreet" id="hot-force">Ouvrir le formulaire (démo)</button>' })}</div>`;
          hot.querySelector('#hot-force').addEventListener('click', () => { forced.v = true; drawHot(); }); return;
        }
        const crit = Store.data.criteria; const hints = { clarte: 'Les explications étaient-elles claires ?', rythme: 'Le tempo de la séance vous a-t-il convenu ?', interactivite: 'Avez-vous pu participer, échanger ?', supports: 'Supports et exercices utiles ?', utilite: 'Pourrez-vous l\'appliquer sur le terrain ?' };
        hot.innerHTML = `${anon}<form class="card eval-form mt-3" id="hot-form" novalidate><h3 style="margin-bottom:4px">${esc(f.title)}</h3><p class="small muted mb-2">${Store.fmtDate(s.date)}</p>
          ${crit.map((c) => `<div class="crit-row"><div class="grow"><b>${esc(c.label)}</b><div class="dim">${esc(hints[c.id] || '')}</div></div>${window.ui.rating('r-' + c.id, c.label, 0)}</div>`).join('')}
          <div class="field mt-3"><label for="hot-c">Un mot pour votre formateur <span class="dim">(facultatif)</span></label><textarea class="textarea" id="hot-c" placeholder="Ce qui vous a plu, ce qui pourrait être encore mieux…"></textarea></div>
          <div class="row between mt-3"><span class="small muted" id="hot-n" aria-live="polite">0 / ${crit.length} critères notés</span><button class="btn btn-primary btn-lg" id="hot-send" disabled>${icon('send')}Envoyer mon avis</button></div></form>`;
        const form = hot.querySelector('#hot-form');
        const count = () => { const n = crit.filter((c) => form.querySelector(`input[name="r-${c.id}"]:checked`)).length; hot.querySelector('#hot-n').textContent = `${n} / ${crit.length} critères notés`; hot.querySelector('#hot-send').disabled = n < crit.length; };
        form.addEventListener('change', count);
        form.addEventListener('submit', (e) => {
          e.preventDefault(); const ev = {};
          crit.forEach((c) => { ev[c.id] = +form.querySelector(`input[name="r-${c.id}"]:checked`).value; });
          ev.comment = form.querySelector('#hot-c').value.trim();
          Store.submitEvaluation(sid, ME, ev); // MOCK : transmis de façon anonyme au formateur (W10)
          toast('Merci, votre avis a été transmis anonymement', 'ok', { icon: 'heart' }); drawHot();
        });
      };

      /* --- P6 : à froid --- */
      const drawCold = () => {
        const cs = Store.session(COLD_SID); const cf = Store.formation(cs.formationId);
        const badge = Store.data.badges.find((b) => b.id === 'b-cloud'); const mine = Store.data.coldEvals.find((c) => c.pid === ME && c.sessionId === COLD_SID);
        if (mine) {
          cold.innerHTML = `<div class="card thanks flash-in"><div class="bdg-hero">${badgeArt(badge, { size: 132 })}</div><span class="pill ok">${icon('badge-check', { cls: 'sm' })}Compétence confirmée</span><h2 style="margin-top:12px">« ${esc(badge.name)} » confirmé</h2><p class="muted">Merci ! Votre mise en pratique de « ${esc(cf.title)} » valide durablement ce badge, acquis le ${Store.fmtDateMid(C().badgeDate(ME, badge.id))}.</p><a class="btn btn-primary mt-2" href="#/p/badges">Voir mes badges</a></div>`; return;
        }
        const Qs = [
          { id: 'application', q: 'Avez-vous mis en pratique ce que vous avez appris ?', opts: ['Pas encore', 'Un peu', 'Régulièrement', 'Au quotidien'] },
          { id: 'impact', q: 'Quel impact sur votre travail ?', opts: ['Aucun', 'Gain de temps', 'Meilleure qualité', 'Nouvelles responsabilités'] }
        ];
        cold.innerHTML = `${anon.replace('Vos réponses sont anonymes.', 'Vos réponses restent confidentielles.').replace(/Votre nom n.est jamais[^<]*/, 'Elles servent à confirmer votre badge et à améliorer la formation ; seuls des résultats agrégés sont partagés.')}<form class="card eval-form mt-3" id="cold-form"><div class="row between mb-2"><div><span class="eyebrow" style="--phase-accent:var(--cyan)"><span class="num">P6</span>Mise en pratique</span><h3 style="margin-top:10px">${esc(cf.title)}</h3><p class="small muted">Session du ${Store.fmtDate(cs.date)} · 3 questions</p></div>${badgeArt(badge, { size: 64 })}</div>
          ${Qs.map((q, i) => `<fieldset class="cq"><legend><span class="cq-n">${i + 1}</span>${esc(q.q)}</legend><div class="chips">${q.opts.map((o) => `<label class="chip cq-chip"><input type="radio" name="c-${q.id}" value="${esc(o)}" class="sr-only">${esc(o)}</label>`).join('')}</div></fieldset>`).join('')}
          <div class="field cq"><label for="c-ob"><span class="cq-n">3</span>Quel frein ou quel besoin d'accompagnement avez-vous rencontré ? <span class="dim">(facultatif)</span></label><textarea class="textarea" id="c-ob" placeholder="Ex. : manque de temps, besoin d'un atelier pratique…"></textarea></div>
          <div class="row between mt-3"><span class="small muted">Votre badge « ${esc(badge.name)} » sera confirmé.</span><button class="btn btn-primary btn-lg" id="cold-send" disabled>${icon('send')}Envoyer</button></div></form>`;
        const form = cold.querySelector('#cold-form');
        form.addEventListener('change', (e) => {
          if (e.target.type === 'radio') form.querySelectorAll(`input[name="${e.target.name}"]`).forEach((r) => r.parentElement.classList.toggle('is-on', r.checked));
          cold.querySelector('#cold-send').disabled = !(form.querySelector('input[name="c-application"]:checked') && form.querySelector('input[name="c-impact"]:checked'));
        });
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          Store.submitColdEval(COLD_SID, ME, { application: form.querySelector('input[name="c-application"]:checked').value, impact: form.querySelector('input[name="c-impact"]:checked').value, obstacle: form.querySelector('#c-ob').value.trim() });
          toast('Merci ! Votre badge de compétence est confirmé', 'ok', { icon: 'badge-check' }); drawCold();
        });
      };
      drawHot(); drawCold();
      ctx.on('live', () => { const hasForm = hot.querySelector('#hot-form'); if (!hasForm) drawHot(); });
    }
  });

  /* =====================================================================
     P7 — Badges & certifications
     ===================================================================== */
  const CERT = { 'b-cloud': 'Certification Cloud Practitioner', 'b-agile': 'Agile Facilitator Certified', 'b-5g': '5G Associate', 'b-kube': 'Kubernetes CKA', 'b-cyber': 'Security Fundamentals Mobile', 'b-edge': 'Edge Computing Specialist' };
  const CERT_SESSION = { 'b-cloud': COLD_SID, 'b-agile': 's-agile-0612' };
  const voucherPill = (v) => v.status === 'validé' ? '<span class="pill ok">' + icon('check-circle', { cls: 'sm' }) + 'Validé</span>' : v.status === 'refusé' ? '<span class="pill outline">Refusé</span>' : '<span class="pill orange">' + icon('clock', { cls: 'sm' }) + 'En attente de validation formateur</span>';

  App.view({
    id: 'P7', path: '/p/badges', roles: ['participant'], phase: 'participant', title: 'Badges & certifications',
    render(el, ctx) {
      el.innerHTML = pageHead({ num: 'P7', eyebrow: 'Badges & certifications', title: 'Mes compétences, reconnues', lead: 'Chaque badge atteste d\'une compétence validée. Transformez-les en certifications officielles grâce aux vouchers.', actions: `<button class="btn btn-primary" id="v-req">${icon('ticket')}Demander un voucher</button>` }) + '<div id="p7-dyn" class="stack-lg"></div>';
      const dyn = el.querySelector('#p7-dyn'); let flashId = null;
      const draw = () => {
        const vide = ctx.scenario === 'vide';
        const all = Store.data.badges; const mine = vide ? [] : all.filter((b) => Store.hasBadge(ME, b.id)); const locked = all.filter((b) => !mine.includes(b));
        const vs = Store.data.vouchers.filter((v) => v.participantId === ME);
        dyn.innerHTML = `<section class="reveal"><h2 class="sec-h">Badges obtenus <span class="pill teal">${mine.length}</span></h2>${mine.length ? `<div class="grid-3">${mine.map((b) => `<div class="card badge-card" style="--accent:${window.ui.colorVar(b.color)}">${badgeArt(b, { size: 104 })}<h3 style="font-size:var(--fs-md)">${esc(b.name)}</h3><span class="pill ok">${icon('check', { cls: 'sm' })}Acquis le ${Store.fmtDateMid(C().badgeDate(ME, b.id))}</span><p class="small muted">${esc(b.rule)}</p></div>`).join('')}</div>` : window.ui.empty({ icon: 'award', color: 'cyan', title: 'Votre premier badge vous attend', text: 'Suivez une formation et réussissez le quiz pour obtenir votre premier badge.', cta: '<a class="btn btn-primary" href="#/catalogue">Explorer le catalogue</a>' })}</section>
          <section class="reveal"><h2 class="sec-h">À débloquer</h2><div class="grid-3">${locked.map((b) => `<div class="card badge-card is-locked">${badgeArt(b, { size: 80, locked: true })}<h3 style="font-size:var(--fs-md)">${esc(b.name)}</h3><p class="small muted">${esc(b.rule)}</p></div>`).join('')}</div></section>
          <section class="reveal"><h2 class="sec-h">Mes vouchers de certification</h2>${vs.length ? `<div class="table-wrap"><table class="table"><thead><tr><th>Certification</th><th>Demandé le</th><th>Éligibilité</th><th>Statut</th></tr></thead><tbody>${vs.map((v) => `<tr data-v="${v.id}" class="${flashId === v.id ? 'flash-in' : ''}"><td><b>${esc(v.certification)}</b></td><td>${Store.fmtDateMid(v.requestedAt)}</td><td class="muted">${esc(v.eligibility)}</td><td>${voucherPill(v)}</td></tr>`).join('')}</tbody></table></div>` : window.ui.empty({ icon: 'ticket', color: 'cyan', title: 'Aucun voucher demandé', text: 'Demandez un voucher pour passer une certification liée à vos badges.' })}</section>`;
        window.ui.stagger(dyn);
      };
      draw();
      ctx.on('vouchers', (p) => { flashId = p && p.id; draw(); toast_if(p); });
      function toast_if(p) { if (p && p.status) toast(`Votre voucher a été ${p.status}`, p.status === 'validé' ? 'ok' : 'info', { icon: 'ticket' }); }

      el.querySelector('#v-req').addEventListener('click', () => {
        const have = new Set(Store.data.vouchers.filter((v) => v.participantId === ME).map((v) => v.certification));
        const elig = Store.badgesOf(ME).filter((b) => !have.has(CERT[b.id]));
        window.ui.modal({
          title: 'Demander un voucher', eyebrow: 'P7 · Certification', accent: 'var(--cyan)',
          body: elig.length ? `<p class="small muted mb-2">Choisissez la certification à préparer. Votre formateur validera l'achat du voucher.</p><div class="stack" role="radiogroup">${elig.map((b, i) => `<label class="sess-opt ${i === 0 ? 'is-sel' : ''}"><input type="radio" name="v-b" value="${b.id}" ${i === 0 ? 'checked' : ''}><span class="grow"><b>${esc(CERT[b.id] || b.name)}</b><span class="dim d-block">Éligible — badge « ${esc(b.name)} » acquis</span></span>${badgeArt(b, { size: 44 })}</label>`).join('')}</div>`
            : window.ui.empty({ icon: 'ticket', color: 'cyan', title: 'Aucune certification disponible', text: 'Tous vos badges ont déjà une demande de voucher. Obtenez un nouveau badge pour en demander un autre.' }),
          foot: `<button class="btn btn-ghost" data-close>Annuler</button>${elig.length ? `<button class="btn btn-primary" id="v-go">${icon('send', { cls: 'sm' })}Envoyer la demande</button>` : ''}`,
          onOpen(m, close) {
            m.querySelectorAll('input[name="v-b"]').forEach((r) => r.addEventListener('change', () => m.querySelectorAll('.sess-opt').forEach((l) => l.classList.toggle('is-sel', l.contains(r) && r.checked))));
            const go = m.querySelector('#v-go'); if (!go) return;
            go.addEventListener('click', () => {
              const bid = m.querySelector('input[name="v-b"]:checked').value;
              Store.requestVoucher(ME, CERT[bid] || Store.data.badges.find((b) => b.id === bid).name, CERT_SESSION[bid] || null); // MOCK : demande transmise au formateur (W11)
              close(); flashId = Store.data.vouchers[0].id; draw(); toast('Demande de voucher envoyée au formateur', 'ok', { icon: 'ticket' });
            });
          }
        });
      });
    }
  });

  /* =====================================================================
     P8 — Chat avec le formateur
     ===================================================================== */
  App.view({
    id: 'P8', path: '/p/chat', roles: ['participant'], phase: 'participant', title: 'Chat formateur',
    render(el, ctx) {
      el.innerHTML = pageHead({ num: 'P8', eyebrow: 'Échanger', title: 'Chat avec votre formateur', lead: 'Posez vos questions avant ou après la séance, ou échangez avec le groupe.' }) + '<div id="p8-wrap"></div>';
      const wrap = el.querySelector('#p8-wrap');
      const convs = Store.conversationsOf(ME);
      if (ctx.scenario === 'vide' || !convs.length) { wrap.innerHTML = `<div class="card">${window.ui.empty({ icon: 'message-circle', color: 'cyan', title: 'Pas encore de conversation', text: 'Dès que vous serez inscrite à une session, vous pourrez échanger avec votre formateur ici.', cta: '<a class="btn btn-primary" href="#/catalogue">Explorer le catalogue</a>' })}</div>`; return; }
      let cur = convs[0].id; let off = null;
      const unread = (c) => c.messages[c.messages.length - 1];
      const draw = () => {
        wrap.innerHTML = `<div class="p8-grid"><nav class="card p8-list" aria-label="Conversations">${convs.map((c) => {
          const last = unread(c); const direct = c.type === 'direct';
          return `<button class="p8-conv ${c.id === cur ? 'is-on' : ''}" data-c="${c.id}" aria-current="${c.id === cur}">${direct ? window.ui.avatar(c.trainerId) : `<span class="icon-chip" style="--accent:var(--purple)">${icon('users')}</span>`}<span class="grow" style="min-width:0"><b class="d-block truncate">${direct ? esc(Store.person(c.trainerId).name) + ' · formateur' : esc(c.title)}</b><span class="dim d-block truncate">${last ? esc(Store.person(last.from).name.split(' ')[0]) + ' : ' + esc(last.text) : 'Nouvelle conversation'}</span></span></button>`;
        }).join('')}</nav><div class="p8-chat" id="p8-chat"></div></div>`;
        wrap.querySelectorAll('.p8-conv').forEach((b) => b.addEventListener('click', () => { cur = b.dataset.c; draw(); }));
        mount();
      };
      const mount = () => {
        if (off) off(); const c = convs.find((x) => x.id === cur); const direct = c.type === 'direct';
        off = window.ui.chat(wrap.querySelector('#p8-chat'), { convId: cur, me: ME, title: direct ? 'Karim M. — formateur' : c.title, subtitle: Store.sessionTitle(Store.session(c.sessionId)), quick: direct ? ['Merci beaucoup !', 'Puis-je avoir le support en avance ?'] : null, autoReply: { from: 'karim', texts: ['Merci pour votre message, je vous réponds dans la journée !', 'Bonne question, nous la verrons ensemble pendant la séance.', 'Je partage le support la veille de la session, pas d\'inquiétude.'] } });
      };
      draw();
      ctx.track(() => { if (off) off(); });
    }
  });
})();
