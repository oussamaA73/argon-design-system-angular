/* =====================================================================
   STORE — état partagé en mémoire + persistance localStorage (MOCK)
   Toutes les mutations passent par Store.* pour garantir les effets
   croisés entre rôles (et entre portail.html / mobile.html).
   ===================================================================== */
(function () {
  const KEY = 'sfa-demo-data-v3';
  const SKEY = 'sfa-demo-state';
  const clone = (o) => JSON.parse(JSON.stringify(o));

  function safeGet(storage, key) { try { return storage.getItem(key); } catch (e) { return null; } }
  function safeSet(storage, key, v) { try { storage.setItem(key, v); } catch (e) { /* stockage indisponible : on reste en mémoire */ } }
  function safeDel(storage, key) { try { storage.removeItem(key); } catch (e) { } }

  function load() {
    const raw = safeGet(window.localStorage, KEY);
    if (raw) { try { const d = JSON.parse(raw); if (d && d.version === window.SFA_DEFAULT_DATA.version) return d; } catch (e) { } }
    return clone(window.SFA_DEFAULT_DATA);
  }

  /* ---------- Bus d'événements ---------- */
  const listeners = {};
  function on(topic, fn) { (listeners[topic] = listeners[topic] || []).push(fn); return () => off(topic, fn); }
  function off(topic, fn) { listeners[topic] = (listeners[topic] || []).filter((f) => f !== fn); }
  function emit(topic, payload) {
    [...(listeners[topic] || []), ...(listeners['*'] || [])].forEach((fn) => { try { fn(payload, topic); } catch (e) { console.error(e); } });
  }

  /* ---------- État de session (utilisateur courant, scénario, pause) ---------- */
  function loadState() {
    const raw = safeGet(window.sessionStorage, SKEY) || safeGet(window.localStorage, SKEY);
    let s = { currentUser: null, scenario: 'normal', paused: false };
    if (raw) { try { s = Object.assign(s, JSON.parse(raw)); } catch (e) { } }
    return s;
  }

  const Store = {
    data: load(),
    state: loadState(),
    on, off, emit,

    save() { safeSet(window.localStorage, KEY, JSON.stringify(Store.data)); },
    saveState() {
      const v = JSON.stringify(Store.state);
      safeSet(window.sessionStorage, SKEY, v);
      safeSet(window.localStorage, SKEY, v); // partagé avec mobile.html
    },
    commit(topic, payload) { Store.save(); emit(topic, payload); emit('change', { topic, payload }); },
    reset() {
      Store.data = clone(window.SFA_DEFAULT_DATA);
      safeDel(window.localStorage, KEY);
      Store.save();
      emit('reset'); emit('change', { topic: 'reset' });
    },
    /* Synchronise si l'autre page (portail / mobile) a modifié les données */
    reloadFromStorage() {
      const raw = safeGet(window.localStorage, KEY);
      if (!raw) return;
      try { const d = JSON.parse(raw); if (d && d.version === Store.data.version) { Store.data = d; emit('change', { topic: 'sync' }); } } catch (e) { }
    },

    /* ---------- Utilisateur / scénario ---------- */
    get user() { return Store.state.currentUser ? Store.data.users[Store.state.currentUser] : null; },
    get role() { return Store.user ? Store.user.role : null; },
    setUser(id) { Store.state.currentUser = id; Store.saveState(); emit('user', id); },
    setScenario(s) { Store.state.scenario = s; Store.saveState(); emit('scenario', s); emit('change', { topic: 'scenario' }); },
    setPaused(p) { Store.state.paused = !!p; Store.saveState(); emit('paused', p); },

    /* ---------- Lecture ---------- */
    person(id) { return Store.data.users[id] || Store.data.people[id] || { id, name: id, fullName: id, initials: '?', color: 'blue' }; },
    formation(id) { return Store.data.formations.find((f) => f.id === id); },
    session(id) { return Store.data.sessions.find((s) => s.id === id); },
    filRouge() { return Store.session(window.SFA_FIL_ROUGE); },
    sessionTitle(s) { const f = Store.formation(s.formationId); return f ? f.title : s.code; },
    sessionsOfTrainer(tid) { return Store.data.sessions.filter((s) => s.trainerId === tid); },
    sessionsOfParticipant(pid) { return Store.data.sessions.filter((s) => s.inscrits.includes(pid) || (s.pending || []).includes(pid)); },
    openSessions() { return Store.data.sessions.filter((s) => !s.trainerId && s.status === 'ouverte'); },
    trainers() {
      const list = [Store.data.users.karim];
      Object.values(Store.data.people).forEach((p) => { if (p.kind === 'formateur') list.push(p); });
      return list;
    },
    /** Formations animées (done) + programmées (scheduled) sur l'année 2026 */
    trainerYear(tid, year = '2026') {
      const p = Store.person(tid);
      const own = Store.data.sessions.filter((s) => s.trainerId === tid && s.date.startsWith(year) && s.status !== 'annulée');
      const done = own.filter((s) => s.status === 'terminée').length + (p.extraDone || 0);
      const scheduled = own.filter((s) => s.status !== 'terminée').length + (p.extraScheduled || 0);
      return { done, scheduled, total: done + scheduled, threshold: 2 };
    },
    /** actif (≥ 2) · en_sursis (1) · desactive (0) */
    badgeStatus(tid) {
      const t = Store.trainerYear(tid).total;
      return t >= 2 ? 'actif' : t === 1 ? 'en_sursis' : 'desactive';
    },
    fill(s) {
      const n = s.inscrits.length;
      return { n, min: s.min, max: s.max, pct: Math.round((n / s.max) * 100), low: n < s.min, full: n >= s.max, left: Math.max(0, s.max - n) };
    },
    hasBadge(pid, badgeId) { const b = Store.data.badges.find((x) => x.id === badgeId); return !!(b && b.awarded.some((a) => a.personId === pid)); },
    badgesOf(pid) { return Store.data.badges.filter((b) => b.awarded.some((a) => a.personId === pid)); },
    enrollmentStatus(sessionId, pid) {
      const s = Store.session(sessionId); if (!s) return null;
      if (s.inscrits.includes(pid)) return 'confirmée';
      if ((s.pending || []).includes(pid)) return 'en_attente';
      return null;
    },
    evaluationsOf(sessionId) { return Store.data.evaluations.filter((e) => e.sessionId === sessionId); },
    criteriaAverages(sessionId) {
      const ev = Store.evaluationsOf(sessionId); const out = {};
      Store.data.criteria.forEach((c) => { out[c.id] = ev.length ? Math.round((ev.reduce((a, e) => a + e[c.id], 0) / ev.length) * 10) / 10 : null; });
      return out;
    },
    notificationsOf(uid) { return Store.data.notifications[uid] || []; },
    unreadCount(uid) { return Store.notificationsOf(uid).filter((n) => !n.read).length; },
    paymentsOf(tid) { return Store.data.payments.filter((p) => p.trainerId === tid); },
    conversationsOf(uid) {
      const u = Store.person(uid);
      if (u.role === 'formateur') return Store.data.conversations.filter((c) => c.trainerId === uid);
      return Store.data.conversations.filter((c) => c.participantId === uid || (c.type === 'group' && Store.session(c.sessionId).inscrits.includes(uid)));
    },

    /* ---------- Mutations (effets croisés) ---------- */
    notify(uid, n) {
      const list = Store.data.notifications[uid] = Store.data.notifications[uid] || [];
      list.unshift(Object.assign({ id: 'n-' + Date.now() + Math.random().toString(16).slice(2, 6), at: Store.nowISO(), read: false, icon: 'bell' }, n));
      emit('notifications', uid);
    },
    markNotificationsRead(uid) { (Store.data.notifications[uid] || []).forEach((n) => { n.read = true; }); Store.commit('notifications', uid); },

    /** Participant → demande d'inscription (P3) → visible en temps réel chez le formateur (W3) */
    requestEnrollment(sessionId, pid, motivation) {
      const s = Store.session(sessionId);
      if (!s || s.inscrits.includes(pid) || s.pending.includes(pid)) return;
      s.pending.push(pid);
      s.motivations = s.motivations || {}; if (motivation) s.motivations[pid] = motivation;
      const p = Store.person(pid);
      if (s.trainerId) Store.notify(s.trainerId, { icon: 'user-plus', text: `${p.name} demande à s'inscrire à « ${Store.sessionTitle(s)} »`, route: '#/before/session/' + s.id });
      Store.notify('leila', { icon: 'user-plus', text: `Nouvelle demande d'inscription : ${p.name} — ${Store.formation(s.formationId).short}`, route: '#/o/sessions', read: true });
      Store.commit('inscriptions', { sessionId, pid, kind: 'pending' });
    },
    confirmEnrollment(sessionId, pid) {
      const s = Store.session(sessionId); if (!s) return;
      s.pending = s.pending.filter((x) => x !== pid);
      if (!s.inscrits.includes(pid)) s.inscrits.push(pid);
      Store.notify(pid, { icon: 'check-circle', text: `Inscription confirmée : « ${Store.sessionTitle(s)} » le ${Store.fmtDateShort(s.date)}`, route: '#/p/accueil' });
      Store.commit('inscriptions', { sessionId, pid, kind: 'confirmed' });
    },
    declineEnrollment(sessionId, pid) {
      const s = Store.session(sessionId); if (!s) return;
      s.pending = s.pending.filter((x) => x !== pid);
      Store.notify(pid, { icon: 'info', text: `Votre demande pour « ${Store.sessionTitle(s)} » n'a pas pu être acceptée`, route: '#/catalogue' });
      Store.commit('inscriptions', { sessionId, pid, kind: 'declined' });
    },
    /** Simulation temps réel : ajoute un inscrit fictif (hors fil rouge) */
    simulateInscription(sessionId) {
      const s = Store.session(sessionId); if (!s || s.inscrits.length >= s.max) return null;
      const pid = Store.data.simPool.find((x) => !s.inscrits.includes(x) && !s.pending.includes(x));
      if (!pid) return null;
      s.inscrits.push(pid); Store.commit('inscriptions', { sessionId, pid, kind: 'sim' });
      return pid;
    },
    /** Formateur → se positionner sur une session ouverte (W5) */
    assignTrainer(sessionId, tid) {
      const s = Store.session(sessionId); if (!s) return;
      s.trainerId = tid; s.status = s.inscrits.length >= s.min ? 'confirmée' : 'ouverte';
      const f = Store.formation(s.formationId);
      if (!Store.data.payments.some((p) => p.sessionId === sessionId)) {
        Store.data.payments.push({ id: 'pay-' + sessionId, trainerId: tid, sessionId, label: f.short + ' (' + Store.fmtDateShort(s.date) + ')', amount: 1200, status: 'en_attente', date: null });
      }
      // dispos : créneaux de la session passent en « affecté »
      const d = (Store.data.dispos[tid] = Store.data.dispos[tid] || {});
      d[s.date] = { am: 'affecte', pm: 'affecte' };
      Store.notify('leila', { icon: 'check-circle', text: `${Store.person(tid).name} s'est positionné sur « ${f.short} » du ${Store.fmtDateShort(s.date)}`, route: '#/o/sessions' });
      (Store.data.entraide || []).forEach((e) => { if (e.sessionId === sessionId && !e.responders.includes(tid)) e.responders.push(tid); });
      Store.commit('sessions', { sessionId, tid });
      Store.emit('badge', tid);
    },
    setDispo(tid, date, slot, value) {
      const d = (Store.data.dispos[tid] = Store.data.dispos[tid] || {});
      d[date] = d[date] || { am: null, pm: null };
      d[date][slot] = value;
      Store.commit('dispos', { tid, date, slot, value });
    },
    /** Formateur → proposer une formation (W6) → file de validation Observateur (O2) */
    submitProposal(p) {
      const id = 'pr-' + Date.now();
      const prop = Object.assign({ id, status: 'en_attente', submittedAt: window.SFA_TODAY, comment: '' }, p);
      Store.data.proposals.unshift(prop);
      Store.data.formations.push({
        id: 'f-' + id, proposalId: id, title: p.title, short: p.title, theme: p.theme, level: p.level, format: p.format,
        durationDays: p.durationDays || 1, hours: (p.durationDays || 1) * 7, color: 'purple', status: 'en_attente', authorId: p.authorId,
        trainerIds: [p.authorId], rating: null, totalParticipants: 0, description: p.description || '', objectives: p.objectives || [],
        syllabus: p.syllabus || [], prerequisites: p.prerequisites || [], audience: p.audience || ''
      });
      Store.notify('leila', { icon: 'clipboard-check', text: `Nouvelle formation à valider : « ${p.title} » (${Store.person(p.authorId).name})`, route: '#/o/validation' });
      Store.commit('proposals', { id });
      return id;
    },
    /** decision : 'validée' | 'modifs' | 'refusée' */
    decideProposal(id, decision, comment) {
      const p = Store.data.proposals.find((x) => x.id === id); if (!p) return;
      p.status = decision; p.comment = comment || ''; p.decidedAt = window.SFA_TODAY;
      const f = Store.data.formations.find((x) => x.proposalId === id);
      if (f) f.status = decision;
      const label = { 'validée': 'validée ✔', 'modifs': 'à modifier', 'refusée': 'refusée' }[decision];
      Store.notify(p.authorId, { icon: decision === 'validée' ? 'check-circle' : 'info', text: `Votre formation « ${p.title} » est ${label}${comment ? ' — « ' + comment + ' »' : ''}`, route: '#/before/formations' });
      Store.commit('proposals', { id, decision });
    },

    /* --- Séance (During) --- */
    startSession(sessionId) { const s = Store.session(sessionId); s.live.started = true; Store.commit('live', { sessionId, kind: 'start' }); },
    setAttendance(sessionId, pid, present) { const s = Store.session(sessionId); s.attendance[pid] = !!present; Store.commit('attendance', { sessionId, pid, present }); },
    /** Participant → signer sa présence (P4) → case verte chez le formateur (W9) */
    signAttendance(sessionId, pid) {
      const s = Store.session(sessionId); s.attendance[pid] = true; s.signatures = s.signatures || {}; s.signatures[pid] = Store.nowISO();
      if (s.trainerId) Store.notify(s.trainerId, { icon: 'pencil', text: `${Store.person(pid).name} a signé sa présence`, route: '#/during/seance', read: true });
      Store.commit('attendance', { sessionId, pid, present: true, signed: true });
    },
    addLogisticsAlert(sessionId, alert) {
      const s = Store.session(sessionId);
      const a = Object.assign({ id: 'al-' + Date.now(), at: Store.nowISO(), status: 'ouverte' }, alert);
      s.live.alerts.unshift(a);
      Store.notify('leila', { icon: 'alert-triangle', text: `Alerte logistique — ${a.label || a.type} : ${Store.formation(s.formationId).short}`, route: '#/o/cockpit' });
      Store.commit('live', { sessionId, kind: 'alert', alert: a });
      return a;
    },
    resolveLogisticsAlert(sessionId, alertId) { const s = Store.session(sessionId); const a = s.live.alerts.find((x) => x.id === alertId); if (a) a.status = 'résolue'; Store.commit('live', { sessionId, kind: 'alert-resolved' }); },
    setSlide(sessionId, idx) { const s = Store.session(sessionId); s.live.slide = idx; Store.commit('live', { sessionId, kind: 'slide' }); },
    /** Formateur → lancer le quiz (W9) → zone quiz active chez le participant (P4) */
    launchQuiz(sessionId) {
      const s = Store.session(sessionId); s.live.quiz = 'running'; s.live.quizStartedAt = Store.nowISO();
      s.inscrits.forEach((pid) => Store.notify(pid, { icon: 'help-circle', text: `Quiz lancé : « ${Store.formation(s.formationId).short} »`, route: '#/p/session' }));
      Store.commit('live', { sessionId, kind: 'quiz' });
    },
    closeQuiz(sessionId) { const s = Store.session(sessionId); s.live.quiz = 'closed'; Store.commit('live', { sessionId, kind: 'quiz-closed' }); },
    submitQuiz(sessionId, pid, score, total) {
      Store.data.quizResults[sessionId] = Store.data.quizResults[sessionId] || {};
      Store.data.quizResults[sessionId][pid] = { score, total, at: Store.nowISO() };
      Store.commit('quiz', { sessionId, pid, score });
    },
    /** Formateur → lancer le feedback (W9) → évaluation à chaud chez le participant (P5) */
    launchFeedback(sessionId) {
      const s = Store.session(sessionId); s.live.feedback = 'open';
      s.inscrits.forEach((pid) => Store.notify(pid, { icon: 'star', text: `Donnez votre avis sur « ${Store.formation(s.formationId).short} » (anonyme)`, route: '#/p/evaluation' }));
      Store.commit('live', { sessionId, kind: 'feedback' });
    },
    submitEvaluation(sessionId, pid, ev) {
      Store.data.evaluations.push(Object.assign({ sessionId }, ev)); // anonyme : pid non stocké dans l'évaluation
      const s = Store.session(sessionId); s.evaluatedBy = s.evaluatedBy || []; if (!s.evaluatedBy.includes(pid)) s.evaluatedBy.push(pid);
      Store.commit('evaluations', { sessionId });
    },
    submitColdEval(sessionId, pid, answers) {
      Store.data.coldEvals.push({ sessionId, pid, answers, at: window.SFA_TODAY });
      Store.commit('evaluations', { sessionId, cold: true });
    },

    /* --- After / transverse --- */
    requestVoucher(pid, certification, sessionId) {
      if (Store.data.vouchers.some((v) => v.participantId === pid && v.certification === certification)) return;
      Store.data.vouchers.unshift({ id: 'v-' + Date.now(), participantId: pid, certification, sessionId, eligibility: 'Éligible — badge acquis', eligible: true, status: 'en_attente', requestedAt: window.SFA_TODAY });
      Store.notify('karim', { icon: 'ticket', text: `${Store.person(pid).name} demande un voucher « ${certification} »`, route: '#/after/vouchers' });
      Store.commit('vouchers', { pid });
    },
    /** status : 'validé' | 'refusé' */
    decideVoucher(id, status) {
      const v = Store.data.vouchers.find((x) => x.id === id); if (!v) return;
      v.status = status; v.decidedAt = window.SFA_TODAY;
      Store.notify(v.participantId, { icon: 'ticket', text: `Votre voucher « ${v.certification} » est ${status}`, route: '#/p/badges' });
      Store.commit('vouchers', { id, status });
    },
    /** Observateur → marquer payé (O5) → visible chez le formateur (W14) */
    markPaid(paymentId) {
      const p = Store.data.payments.find((x) => x.id === paymentId); if (!p) return;
      p.status = 'payé'; p.date = window.SFA_TODAY;
      Store.notify(p.trainerId, { icon: 'banknote', text: `Paiement reçu : ${p.label} — ${Store.fmtMoney(p.amount)}`, route: '#/transverse/paiements' });
      Store.commit('payments', { id: paymentId });
    },
    remindTrainer(tid) {
      Store.data.reminders.push({ tid, at: window.SFA_TODAY });
      Store.notify(tid, { icon: 'bell', text: 'L\'équipe Academy vous propose des sessions pour atteindre le seuil annuel', route: '#/before/sessions-ouvertes' });
      Store.commit('reminders', { tid });
    },
    sendMessage(convId, from, text) {
      const c = Store.data.conversations.find((x) => x.id === convId); if (!c) return;
      c.messages.push({ from, text, at: Store.nowISO() });
      Store.commit('chat', { convId, from });
    },

    /* --- Communauté (mobile + partage depuis W10) --- */
    addPost(post) {
      const p = Object.assign({ id: 'post-' + Date.now(), at: Store.nowISO(), reactions: 0, reactedBy: [], comments: [], savedBy: [], type: 'post' }, post);
      Store.data.posts.unshift(p); Store.commit('posts', { id: p.id }); return p.id;
    },
    toggleReaction(postId, uid) {
      const p = Store.data.posts.find((x) => x.id === postId); if (!p) return;
      const i = p.reactedBy.indexOf(uid);
      if (i >= 0) { p.reactedBy.splice(i, 1); p.reactions--; } else { p.reactedBy.push(uid); p.reactions++; }
      Store.commit('posts', { id: postId });
    },
    addComment(postId, uid, text) { const p = Store.data.posts.find((x) => x.id === postId); if (!p) return; p.comments.push({ authorId: uid, text, at: Store.nowISO() }); Store.commit('posts', { id: postId }); },
    toggleSave(postId, uid) { const p = Store.data.posts.find((x) => x.id === postId); if (!p) return; const i = p.savedBy.indexOf(uid); if (i >= 0) p.savedBy.splice(i, 1); else p.savedBy.push(uid); Store.commit('posts', { id: postId }); },
    pinPost(postId) { Store.data.posts.forEach((p) => { if (p.type === 'annonce') p.pinned = p.id === postId; }); Store.commit('posts', { id: postId }); },
    addEntraide(e) { const x = Object.assign({ id: 'ent-' + Date.now(), at: Store.nowISO(), responders: [] }, e); Store.data.entraide.unshift(x); Store.commit('entraide', { id: x.id }); return x.id; },
    respondEntraide(id, uid) { const e = Store.data.entraide.find((x) => x.id === id); if (e && !e.responders.includes(uid)) { e.responders.push(uid); if (e.authorId !== uid) Store.notify(e.authorId, { icon: 'users', text: `${Store.person(uid).name} est disponible pour « ${e.title} »`, route: '#/o/sessions' }); Store.commit('entraide', { id }); } },
    markGoodPracticeShared(id) { const g = Store.data.goodPractices.find((x) => x.id === id); if (g) { g.shared = true; Store.commit('goodPractices', { id }); } },

    /* ---------- Formatage ---------- */
    nowISO() { const d = new Date(); const p = (n) => String(n).padStart(2, '0'); return `${window.SFA_TODAY}T${p(d.getHours())}:${p(d.getMinutes())}`; },
    MONTHS: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
    MONTHS_LONG: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
    DAYS: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
    parseDate(iso) { const [y, m, d] = iso.slice(0, 10).split('-').map(Number); return new Date(y, m - 1, d); },
    fmtDate(iso) { const d = Store.parseDate(iso); return `${Store.DAYS[d.getDay()]} ${d.getDate()} ${Store.MONTHS_LONG[d.getMonth()]} ${d.getFullYear()}`; },
    fmtDateShort(iso) { const d = Store.parseDate(iso); return `${d.getDate()} ${Store.MONTHS[d.getMonth()]}`; },
    fmtDateMid(iso) { const d = Store.parseDate(iso); return `${d.getDate()} ${Store.MONTHS[d.getMonth()]} ${d.getFullYear()}`; },
    fmtTime(iso) { return iso && iso.length > 10 ? iso.slice(11, 16) : ''; },
    fmtRelative(iso) {
      if (!iso) return '';
      const day = iso.slice(0, 10);
      if (day === window.SFA_TODAY) return 'Aujourd\'hui ' + Store.fmtTime(iso);
      const diff = Math.round((Store.parseDate(window.SFA_TODAY) - Store.parseDate(day)) / 86400000);
      if (diff === 1) return 'Hier ' + Store.fmtTime(iso);
      if (diff > 1 && diff < 7) return `Il y a ${diff} j`;
      return Store.fmtDateShort(day);
    },
    daysUntil(iso) { return Math.round((Store.parseDate(iso) - Store.parseDate(window.SFA_TODAY)) / 86400000); },
    fmtMoney(n) { return n.toLocaleString('fr-FR').replace(/ | /g, ' ') + ' ' + Store.data.currency; },
    fmtNum(n, digits = 1) { return n == null ? '—' : Number(n).toFixed(digits).replace('.', ','); }
  };

  /* Synchronisation inter-onglets (portail ↔ mobile) */
  window.addEventListener('storage', (e) => { if (e.key === KEY) Store.reloadFromStorage(); });

  window.Store = Store;
})();
