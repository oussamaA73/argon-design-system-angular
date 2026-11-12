/* =====================================================================
   DATA — jeu de données simulé (MOCK) partagé par portail.html et mobile.html
   Fil rouge : session « Cloud & 5G — 24 nov. 2026 » (id s-cloud5g-1124)
   Date de démo : jeudi 12 novembre 2026.
   ===================================================================== */
// MOCK — aucune donnée réelle
window.SFA_TODAY = '2026-11-12';
window.SFA_FIL_ROUGE = 's-cloud5g-1124';

window.SFA_DEFAULT_DATA = {
  version: 3,

  /* ---------- Les 3 comptes de démo ---------- */
  users: {
    sana: {
      id: 'sana', name: 'Sana B.', fullName: 'Sana Belhadj', initials: 'SB', role: 'participant', roleLabel: 'Participant',
      color: 'cyan', title: 'Ingénieure réseau · Direction Technique', home: '#/p/accueil',
      pitch: '« Je veux monter en compétences sur la 5G et décrocher ma certification cloud. »',
      demo: ['Rechercher une formation et demander mon inscription', 'Signer ma présence et répondre au quiz', 'Évaluer la session (anonyme)'],
      badges: ['b-cloud', 'b-agile'], formationsSuivies: 2
    },
    karim: {
      id: 'karim', name: 'Karim M.', fullName: 'Karim Mansouri', initials: 'KM', role: 'formateur', roleLabel: 'Formateur',
      color: 'blue', title: 'Formateur certifié depuis 2023 · Expert Cloud & Edge', home: '#/f/dashboard',
      pitch: '« Je n\'ai animé qu\'une formation cette année : mon badge est en sursis. »',
      demo: ['Déclarer mes dispos et me positionner sur une session', 'Animer la séance : présence, quiz, feedback', 'Suivre ma progression sans classement'],
      certifiedSince: '2023-01-15'
    },
    leila: {
      id: 'leila', name: 'Leïla T.', fullName: 'Leïla Trabelsi', initials: 'LT', role: 'observateur', roleLabel: 'Observateur',
      color: 'purple', title: 'Responsable Sofrecom Academy', home: '#/o/cockpit',
      pitch: '« Je pilote la qualité et j\'accompagne les formateurs, sans les mettre en compétition. »',
      demo: ['Valider les nouvelles formations', 'Suivre les formateurs à risque de badge', 'Piloter remplissage, paiements et qualité']
    }
  },

  /* ---------- Autres personnes (fictives) ---------- */
  people: {
    nadia:   { id: 'nadia',   name: 'Nadia R.',   fullName: 'Nadia Rekik',     initials: 'NR', kind: 'formateur', color: 'teal',   title: 'Formatrice Kubernetes & DevOps', extraDone: 2, extraScheduled: 0 },
    youssef: { id: 'youssef', name: 'Youssef K.', fullName: 'Youssef Karoui',  initials: 'YK', kind: 'formateur', color: 'orange', title: 'Formateur FTTH & Transmission', extraDone: 0, extraScheduled: 0, alertDate: '2026-09-01' },
    claire:  { id: 'claire',  name: 'Claire D.',  fullName: 'Claire Dumont',   initials: 'CD', kind: 'formateur', color: 'green',  title: 'Coach agile & facilitatrice', extraDone: 2, extraScheduled: 0 },
    mehdi:   { id: 'mehdi',   name: 'Mehdi A.',   fullName: 'Mehdi Ayari',     initials: 'MA', kind: 'formateur', color: 'purple', title: 'Architecte cœur de réseau 5G', extraDone: 0, extraScheduled: 0, alertDate: '2026-11-01' },
    ines:    { id: 'ines',    name: 'Inès L.',    fullName: 'Inès Lahmar',     initials: 'IL', kind: 'formateur', color: 'cyan',   title: 'Data scientist & formatrice IA', extraDone: 1, extraScheduled: 1 },
    samir:   { id: 'samir',   name: 'Samir H.',   fullName: 'Samir Haddad',    initials: 'SH', kind: 'formateur', color: 'red',    title: 'Expert cybersécurité mobile', extraDone: 0, extraScheduled: 0, alertDate: '2026-09-01' },
    olivier: { id: 'olivier', name: 'Olivier P.', fullName: 'Olivier Petit',   initials: 'OP', kind: 'formateur', color: 'blue',   title: 'Formateur réseaux IP', extraDone: 3, extraScheduled: 1 },

    amine:   { id: 'amine',   name: 'Amine G.',   fullName: 'Amine Gharbi',    initials: 'AG', kind: 'participant', color: 'blue',   title: 'Ingénieur cloud' },
    rania:   { id: 'rania',   name: 'Rania S.',   fullName: 'Rania Saidi',     initials: 'RS', kind: 'participant', color: 'teal',   title: 'Cheffe de projet radio' },
    thomas:  { id: 'thomas',  name: 'Thomas L.',  fullName: 'Thomas Lefèvre',  initials: 'TL', kind: 'participant', color: 'green',  title: 'Consultant télécom' },
    meriem:  { id: 'meriem',  name: 'Meriem B.',  fullName: 'Meriem Ben Ali',  initials: 'MB', kind: 'participant', color: 'purple', title: 'Ingénieure cœur de réseau' },
    hatem:   { id: 'hatem',   name: 'Hatem Z.',   fullName: 'Hatem Zouari',    initials: 'HZ', kind: 'participant', color: 'orange', title: 'Architecte solutions' },
    lucie:   { id: 'lucie',   name: 'Lucie M.',   fullName: 'Lucie Martin',    initials: 'LM', kind: 'participant', color: 'cyan',   title: 'Product owner' },
    walid:   { id: 'walid',   name: 'Walid T.',   fullName: 'Walid Toumi',     initials: 'WT', kind: 'participant', color: 'blue',   title: 'Ingénieur DevOps' },
    salma:   { id: 'salma',   name: 'Salma F.',   fullName: 'Salma Ferchichi', initials: 'SF', kind: 'participant', color: 'teal',   title: 'Ingénieure sécurité' },
    nizar:   { id: 'nizar',   name: 'Nizar J.',   fullName: 'Nizar Jaziri',    initials: 'NJ', kind: 'participant', color: 'green',  title: 'Ingénieur transmission' },
    emma:    { id: 'emma',    name: 'Emma R.',    fullName: 'Emma Roussel',    initials: 'ER', kind: 'participant', color: 'purple', title: 'Data analyst' },
    oussema: { id: 'oussema', name: 'Oussema D.', fullName: 'Oussema Dridi',   initials: 'OD', kind: 'participant', color: 'orange', title: 'Ingénieur réseau' },
    yasmine: { id: 'yasmine', name: 'Yasmine K.', fullName: 'Yasmine Khelifi', initials: 'YK', kind: 'participant', color: 'cyan',   title: 'Consultante cloud' },
    farah:   { id: 'farah',   name: 'Farah M.',   fullName: 'Farah Mejri',     initials: 'FM', kind: 'participant', color: 'blue',   title: 'Ingénieure qualité' },
    julien:  { id: 'julien',  name: 'Julien B.',  fullName: 'Julien Bernard',  initials: 'JB', kind: 'participant', color: 'teal',   title: 'Chef de projet IT' }
  },

  /* Pool de prénoms pour la simulation « temps réel » (inscriptions sur d'autres sessions) */
  simPool: ['farah', 'julien', 'yasmine', 'oussema', 'emma', 'nizar'],

  /* ---------- Badges de compétences ---------- */
  badges: [
    { id: 'b-cloud',  name: 'Cloud Fundamentals',      color: 'cyan',   icon: 'globe',      rule: 'Réussite au quiz ≥ 70 % et présence 100 % sur « Cloud — les fondamentaux »', awarded: [{ personId: 'sana', date: '2026-05-20' }, { personId: 'amine', date: '2026-05-20' }, { personId: 'yasmine', date: '2026-02-11' }] },
    { id: 'b-5g',     name: '5G Essentials',           color: 'blue',   icon: 'zap',        rule: 'Réussite au quiz ≥ 70 % sur « Cloud & 5G » + évaluation à froid complétée', awarded: [{ personId: 'meriem', date: '2026-06-18' }] },
    { id: 'b-kube',   name: 'Kubernetes Practitioner', color: 'teal',   icon: 'layers',     rule: 'Atelier pratique validé par le formateur', awarded: [{ personId: 'walid', date: '2026-04-02' }, { personId: 'amine', date: '2026-04-02' }] },
    { id: 'b-cyber',  name: 'Cyber Awareness',         color: 'red',    icon: 'shield-check', rule: 'Quiz final ≥ 80 %', awarded: [{ personId: 'salma', date: '2026-03-09' }] },
    { id: 'b-agile',  name: 'Facilitateur agile',      color: 'green',  icon: 'users',      rule: 'Animation d\'un atelier en situation réelle', awarded: [{ personId: 'sana', date: '2025-10-14' }, { personId: 'lucie', date: '2026-01-22' }] },
    { id: 'b-edge',   name: 'Edge Explorer',           color: 'purple', icon: 'target',     rule: 'Présence + projet fil rouge « Edge Computing — niveau 1 »', awarded: [{ personId: 'hatem', date: '2026-03-18' }] }
  ],

  /* ---------- Catalogue des formations ---------- */
  formations: [
    {
      id: 'f-cloud5g', title: 'Cloud & 5G : architectures et cas d\'usage', short: 'Cloud & 5G', theme: 'Réseaux & 5G', level: 'Intermédiaire', format: 'Hybride',
      durationDays: 1, hours: 7, color: 'blue', status: 'validée', authorId: 'karim', trainerIds: ['karim', 'mehdi'], rating: 4.6, totalParticipants: 86,
      description: 'Comprendre comment le cœur 5G Standalone s\'appuie sur le cloud natif, le slicing et l\'edge pour délivrer de nouveaux services opérateurs.',
      objectives: ['Décrire l\'architecture SBA du cœur 5G SA', 'Expliquer le network slicing et ses cas d\'usage', 'Positionner l\'edge computing dans une offre opérateur'],
      syllabus: ['Rappels cloud natif : conteneurs, micro-services, CNF', 'Architecture 5G SA : AMF, SMF, UPF, AUSF', 'Network slicing de bout en bout', 'Edge computing & MEC : latence et cas d\'usage', 'Atelier : concevoir une offre « slice industrie 4.0 »'],
      prerequisites: [{ label: 'Cloud Fundamentals', badgeId: 'b-cloud' }, { label: 'Notions de réseaux IP' }],
      audience: 'Ingénieurs réseau, architectes, chefs de projet techniques'
    },
    {
      id: 'f-edge1', title: 'Edge Computing — niveau 1', short: 'Edge Computing N1', theme: 'Cloud', level: 'Fondamental', format: 'Présentiel',
      durationDays: 1, hours: 7, color: 'teal', status: 'validée', authorId: 'karim', trainerIds: ['karim'], rating: 4.5, totalParticipants: 41,
      description: 'Les fondamentaux de l\'edge computing : architectures, plateformes MEC et premiers cas d\'usage.',
      objectives: ['Définir l\'edge et le MEC', 'Identifier les cas d\'usage pertinents', 'Comparer les plateformes du marché'],
      syllabus: ['Pourquoi l\'edge ?', 'Architecture MEC ETSI', 'Panorama des plateformes', 'Cas d\'usage : vidéo, industrie, retail'],
      prerequisites: [{ label: 'Notions de réseaux IP' }], audience: 'Tout public technique'
    },
    {
      id: 'f-kube', title: 'Kubernetes pour les télécoms', short: 'Kubernetes Télécom', theme: 'Cloud', level: 'Intermédiaire', format: 'Distanciel',
      durationDays: 2, hours: 14, color: 'cyan', status: 'validée', authorId: 'nadia', trainerIds: ['nadia', 'karim'], rating: 4.4, totalParticipants: 64,
      description: 'Déployer et opérer des fonctions réseau conteneurisées (CNF) sur Kubernetes.',
      objectives: ['Déployer une CNF', 'Superviser un cluster', 'Gérer la haute disponibilité'],
      syllabus: ['Pods, services, operators', 'Helm & GitOps', 'Réseau Kubernetes (CNI, Multus)', 'Atelier : déployer un UPF conteneurisé'],
      prerequisites: [{ label: 'Cloud Fundamentals', badgeId: 'b-cloud' }, { label: 'Linux — ligne de commande' }], audience: 'Ingénieurs cloud & DevOps'
    },
    {
      id: 'f-cyber', title: 'Cybersécurité des réseaux mobiles', short: 'Cyber mobile', theme: 'Cybersécurité', level: 'Avancé', format: 'Présentiel',
      durationDays: 2, hours: 14, color: 'red', status: 'validée', authorId: 'samir', trainerIds: ['samir'], rating: 4.3, totalParticipants: 37,
      description: 'Menaces, protocoles de sécurité et bonnes pratiques pour sécuriser un réseau 4G/5G.',
      objectives: ['Cartographier les menaces', 'Comprendre la sécurité 5G (SUCI, SEPP)', 'Mettre en place une supervision sécurité'],
      syllabus: ['Panorama des menaces', 'Authentification 5G-AKA', 'Sécurité des interfaces', 'Exercice de gestion d\'incident'],
      prerequisites: [{ label: 'Cyber Awareness', badgeId: 'b-cyber' }], audience: 'Ingénieurs sécurité et réseau'
    },
    {
      id: 'f-data', title: 'Data & IA pour les opérateurs', short: 'Data & IA', theme: 'Data & IA', level: 'Intermédiaire', format: 'Hybride',
      durationDays: 1, hours: 7, color: 'purple', status: 'validée', authorId: 'ines', trainerIds: ['ines'], rating: 4.7, totalParticipants: 58,
      description: 'Exploiter la donnée réseau et l\'IA pour la maintenance prédictive et l\'expérience client.',
      objectives: ['Identifier les sources de données réseau', 'Construire un cas d\'usage IA', 'Mesurer la valeur'],
      syllabus: ['La donnée opérateur', 'Machine learning appliqué', 'IA générative : opportunités et limites', 'Atelier : prédire une panne'],
      prerequisites: [{ label: 'Bases de Python (souhaité)' }], audience: 'Ingénieurs, data analysts, chefs de projet'
    },
    {
      id: 'f-agile', title: 'Facilitation agile & ateliers collaboratifs', short: 'Facilitation agile', theme: 'Agilité', level: 'Fondamental', format: 'Présentiel',
      durationDays: 1, hours: 7, color: 'green', status: 'validée', authorId: 'claire', trainerIds: ['claire'], rating: 4.8, totalParticipants: 112,
      description: 'Concevoir et animer des ateliers engageants avec les outils de la facilitation.',
      objectives: ['Structurer un atelier', 'Choisir les bons formats', 'Gérer la dynamique de groupe'],
      syllabus: ['Posture du facilitateur', 'Formats : world café, 1-2-4-all…', 'Outils visuels', 'Mise en situation'],
      prerequisites: [], audience: 'Tous collaborateurs'
    },
    {
      id: 'f-fibre', title: 'FTTH : déploiement et exploitation', short: 'FTTH', theme: 'Fibre & Transmission', level: 'Intermédiaire', format: 'Présentiel',
      durationDays: 2, hours: 14, color: 'orange', status: 'validée', authorId: 'youssef', trainerIds: ['youssef'], rating: 4.2, totalParticipants: 49,
      description: 'Ingénierie, déploiement et maintenance d\'un réseau fibre jusqu\'à l\'abonné.',
      objectives: ['Concevoir une architecture PON', 'Piloter un déploiement', 'Diagnostiquer une panne'],
      syllabus: ['Architectures GPON / XGS-PON', 'Ingénierie et piquetage', 'Recette et mesures', 'Exploitation & SAV'],
      prerequisites: [{ label: 'Notions de transmission optique' }], audience: 'Ingénieurs et techniciens réseau fixe'
    },
    {
      id: 'f-5gsa', title: '5G SA : cœur de réseau avancé', short: '5G SA avancé', theme: 'Réseaux & 5G', level: 'Avancé', format: 'Distanciel',
      durationDays: 2, hours: 14, color: 'blue', status: 'validée', authorId: 'mehdi', trainerIds: ['mehdi'], rating: 4.5, totalParticipants: 33,
      description: 'Plongée dans les fonctions du cœur 5G SA, leurs interfaces et leur orchestration.',
      objectives: ['Maîtriser les NF du cœur 5G', 'Analyser des traces', 'Comprendre l\'orchestration'],
      syllabus: ['SBA et interfaces HTTP/2', 'Procédures d\'enregistrement', 'Sessions PDU', 'Orchestration et NFV'],
      prerequisites: [{ label: '5G Essentials', badgeId: 'b-5g' }], audience: 'Ingénieurs cœur de réseau'
    },
    {
      id: 'f-cloud101', title: 'Cloud — les fondamentaux', short: 'Cloud 101', theme: 'Cloud', level: 'Fondamental', format: 'Distanciel',
      durationDays: 1, hours: 7, color: 'cyan', status: 'validée', authorId: 'olivier', trainerIds: ['olivier', 'karim'], rating: 4.6, totalParticipants: 154,
      description: 'Les concepts clés du cloud computing : IaaS, PaaS, SaaS, modèles de déploiement et sécurité.',
      objectives: ['Comprendre les modèles de service', 'Choisir un modèle de déploiement', 'Connaître les bases de la sécurité cloud'],
      syllabus: ['Concepts et vocabulaire', 'Modèles de service', 'Réseau et stockage cloud', 'Sécurité et coûts'],
      prerequisites: [], audience: 'Tout public'
    }
  ],

  /* ---------- Propositions de nouvelles formations (file de validation O2) ---------- */
  proposals: [
    {
      id: 'pr-greenit', title: 'Green IT pour les réseaux télécoms', authorId: 'nadia', theme: 'Cloud', level: 'Fondamental', format: 'Distanciel', durationDays: 1,
      audience: 'Ingénieurs réseau et architectes', objectives: ['Mesurer l\'empreinte d\'un réseau', 'Identifier les leviers de sobriété'],
      syllabus: ['Empreinte environnementale du numérique', 'Mesure et indicateurs', 'Leviers d\'éco-conception'],
      prerequisites: [{ label: 'Aucun' }], status: 'en_attente', submittedAt: '2026-11-04', comment: ''
    },
    {
      id: 'pr-observ', title: 'Observabilité cloud-native', authorId: 'olivier', theme: 'Cloud', level: 'Intermédiaire', format: 'Hybride', durationDays: 1,
      audience: 'Ingénieurs DevOps & SRE', objectives: ['Mettre en place logs, métriques, traces', 'Construire des tableaux de bord utiles'],
      syllabus: ['Les 3 piliers de l\'observabilité', 'OpenTelemetry', 'Alerting et SLO'],
      prerequisites: [{ label: 'Kubernetes Practitioner', badgeId: 'b-kube' }], status: 'en_attente', submittedAt: '2026-11-09', comment: ''
    }
  ],

  /* ---------- Sessions ---------- */
  sessions: [
    {
      id: 's-cloud5g-1124', code: 'SFA-2026-1124', formationId: 'f-cloud5g', date: '2026-11-24', time: '09:00 – 17:00',
      location: 'Tunis — Centre de compétences, salle Carthage', remote: 'Teams (participants à distance)', format: 'Hybride',
      trainerId: null, min: 6, max: 12, status: 'ouverte',
      inscrits: ['amine', 'rania', 'thomas', 'meriem', 'hatem', 'lucie', 'walid', 'salma', 'nizar'], pending: [],
      attendance: {}, signatures: {},
      live: { started: false, quiz: 'idle', quizStartedAt: null, feedback: 'idle', slide: 0, alerts: [] }
    },
    {
      id: 's-edge1-0317', code: 'SFA-2026-0317', formationId: 'f-edge1', date: '2026-03-17', time: '09:00 – 17:00',
      location: 'Tunis — Centre de compétences, salle Atlas', format: 'Présentiel', trainerId: 'karim', min: 6, max: 12, status: 'terminée',
      inscrits: ['hatem', 'amine', 'rania', 'walid', 'emma', 'julien', 'farah', 'nizar', 'lucie', 'thomas'], pending: [],
      attendance: { hatem: true, amine: true, rania: true, walid: true, emma: true, julien: false, farah: true, nizar: true, lucie: true, thomas: true },
      live: { started: true, quiz: 'closed', feedback: 'closed', slide: 0, alerts: [] }
    },
    {
      id: 's-cyber-1127', code: 'SFA-2026-1127', formationId: 'f-cyber', date: '2026-11-27', time: '09:00 – 17:00',
      location: 'Tunis — Centre de compétences, salle Hannibal', format: 'Présentiel', trainerId: null, min: 6, max: 12, status: 'ouverte',
      inscrits: ['salma', 'oussema', 'walid', 'meriem', 'thomas'], pending: [], attendance: {}, live: { quiz: 'idle', feedback: 'idle', alerts: [] }
    },
    {
      id: 's-data-1209', code: 'SFA-2026-1209', formationId: 'f-data', date: '2026-12-09', time: '09:00 – 17:00',
      location: 'Teams', format: 'Distanciel', trainerId: null, min: 6, max: 14, status: 'ouverte',
      inscrits: ['emma', 'lucie', 'julien', 'amine', 'rania', 'farah', 'yasmine', 'hatem'], pending: [], attendance: {}, live: { quiz: 'idle', feedback: 'idle', alerts: [] }
    },
    {
      id: 's-kube-1203', code: 'SFA-2026-1203', formationId: 'f-kube', date: '2026-12-03', time: '09:00 – 17:00',
      location: 'Teams', format: 'Distanciel', trainerId: 'nadia', min: 6, max: 12, status: 'confirmée',
      inscrits: ['walid', 'amine', 'yasmine', 'oussema', 'nizar', 'julien', 'salma'], pending: [], attendance: {}, live: { quiz: 'idle', feedback: 'idle', alerts: [] }
    },
    {
      id: 's-agile-1119', code: 'SFA-2026-1119', formationId: 'f-agile', date: '2026-11-19', time: '09:00 – 17:00',
      location: 'Tunis — Centre de compétences, salle Didon', format: 'Présentiel', trainerId: 'claire', min: 6, max: 12, status: 'confirmée',
      inscrits: ['lucie', 'julien', 'farah', 'emma', 'rania', 'thomas', 'meriem', 'hatem', 'yasmine', 'oussema', 'nizar'], pending: [], attendance: {}, live: { quiz: 'idle', feedback: 'idle', alerts: [] }
    },
    {
      id: 's-fibre-1202', code: 'SFA-2026-1202', formationId: 'f-fibre', date: '2026-12-02', time: '09:00 – 17:00',
      location: 'Sfax — Agence régionale', format: 'Présentiel', trainerId: 'youssef', min: 6, max: 12, status: 'ouverte',
      inscrits: ['nizar', 'oussema', 'thomas', 'farah'], pending: [], attendance: {}, live: { quiz: 'idle', feedback: 'idle', alerts: [] }
    },
    {
      id: 's-5gsa-1215', code: 'SFA-2026-1215', formationId: 'f-5gsa', date: '2026-12-15', time: '09:00 – 17:00',
      location: 'Teams', format: 'Distanciel', trainerId: 'mehdi', min: 6, max: 12, status: 'ouverte',
      inscrits: ['meriem', 'amine', 'hatem', 'walid', 'rania', 'thomas', 'lucie', 'salma', 'nizar', 'emma', 'yasmine', 'oussema'], pending: [], attendance: {}, live: { quiz: 'idle', feedback: 'idle', alerts: [] }
    },
    {
      id: 's-cloud101-1210', code: 'SFA-2026-1210', formationId: 'f-cloud101', date: '2026-12-10', time: '09:00 – 17:00',
      location: 'Teams', format: 'Distanciel', trainerId: 'olivier', min: 6, max: 16, status: 'confirmée',
      inscrits: ['julien', 'farah', 'emma', 'oussema', 'yasmine', 'lucie', 'rania', 'thomas', 'hatem', 'meriem'], pending: [], attendance: {}, live: { quiz: 'idle', feedback: 'idle', alerts: [] }
    },
    /* Sessions passées 2026 (autres formateurs) */
    { id: 's-agile-0612', code: 'SFA-2026-0612', formationId: 'f-agile', date: '2026-06-12', time: '09:00 – 17:00', location: 'Tunis', format: 'Présentiel', trainerId: 'claire', min: 6, max: 12, status: 'terminée', inscrits: ['lucie', 'julien', 'farah', 'emma', 'rania', 'thomas', 'meriem', 'hatem', 'yasmine', 'oussema', 'nizar', 'sana'], pending: [], attendance: {}, live: {} },
    { id: 's-data-0923', code: 'SFA-2026-0923', formationId: 'f-data', date: '2026-09-23', time: '09:00 – 17:00', location: 'Teams', format: 'Distanciel', trainerId: 'ines', min: 6, max: 14, status: 'terminée', inscrits: ['emma', 'lucie', 'julien', 'amine', 'rania', 'farah', 'yasmine', 'hatem', 'walid'], pending: [], attendance: {}, live: {} },
    { id: 's-cloud101-0520', code: 'SFA-2026-0520', formationId: 'f-cloud101', date: '2026-05-20', time: '09:00 – 17:00', location: 'Teams', format: 'Distanciel', trainerId: 'olivier', min: 6, max: 16, status: 'terminée', inscrits: ['sana', 'amine', 'walid', 'julien', 'farah', 'emma', 'oussema', 'nizar'], pending: [], attendance: {}, live: {} },
    { id: 's-fibre-0408', code: 'SFA-2026-0408', formationId: 'f-fibre', date: '2026-04-08', time: '09:00 – 17:00', location: 'Sfax', format: 'Présentiel', trainerId: 'youssef', min: 6, max: 12, status: 'annulée', inscrits: ['nizar', 'oussema', 'thomas'], pending: [], attendance: {}, live: {} },
    /* Historique Karim 2025 (pour la courbe de progression) */
    { id: 's-kube-2502', code: 'SFA-2025-0211', formationId: 'f-kube', date: '2025-02-11', time: '09:00 – 17:00', location: 'Teams', format: 'Distanciel', trainerId: 'karim', min: 6, max: 12, status: 'terminée', inscrits: [], pending: [], attendance: {}, live: {} },
    { id: 's-cloud101-2504', code: 'SFA-2025-0415', formationId: 'f-cloud101', date: '2025-04-15', time: '09:00 – 17:00', location: 'Teams', format: 'Distanciel', trainerId: 'karim', min: 6, max: 16, status: 'terminée', inscrits: [], pending: [], attendance: {}, live: {} },
    { id: 's-cloud5g-2506', code: 'SFA-2025-0612', formationId: 'f-cloud5g', date: '2025-06-12', time: '09:00 – 17:00', location: 'Tunis', format: 'Hybride', trainerId: 'karim', min: 6, max: 12, status: 'terminée', inscrits: [], pending: [], attendance: {}, live: {} },
    { id: 's-edge1-2509', code: 'SFA-2025-0918', formationId: 'f-edge1', date: '2025-09-18', time: '09:00 – 17:00', location: 'Tunis', format: 'Présentiel', trainerId: 'karim', min: 6, max: 12, status: 'terminée', inscrits: [], pending: [], attendance: {}, live: {} },
    { id: 's-cloud5g-2511', code: 'SFA-2025-1120', formationId: 'f-cloud5g', date: '2025-11-20', time: '09:00 – 17:00', location: 'Tunis', format: 'Hybride', trainerId: 'karim', min: 6, max: 12, status: 'terminée', inscrits: [], pending: [], attendance: {}, live: {} }
  ],

  /* ---------- Disponibilités formateur (date → {am, pm}) : dispo | affecte | indispo ---------- */
  dispos: {
    karim: {
      '2026-11-16': { am: 'indispo', pm: 'indispo' }, '2026-11-17': { am: 'indispo', pm: 'indispo' },
      '2026-11-19': { am: 'dispo', pm: null }, '2026-11-26': { am: 'dispo', pm: 'dispo' },
      '2026-12-01': { am: null, pm: 'dispo' }, '2026-12-08': { am: 'indispo', pm: null }
    }
  },

  /* ---------- Contenu & quiz ---------- */
  content: {
    'f-cloud5g': {
      files: [
        { name: 'Cloud-5G_support_v3.pdf', size: '4,2 Mo', kind: 'pdf', updated: '2026-10-28' },
        { name: 'Atelier_slice_industrie.pptx', size: '8,7 Mo', kind: 'pptx', updated: '2026-10-28' },
        { name: 'Fiche_memo_5G-SA.pdf', size: '0,6 Mo', kind: 'pdf', updated: '2026-09-02' }
      ],
      slides: [
        { title: 'Cloud & 5G : architectures et cas d\'usage', text: 'Session du 24 novembre 2026 — Sofrecom Academy' },
        { title: 'Le cœur 5G SA est « cloud natif »', text: 'Architecture orientée services (SBA) : chaque fonction réseau est un micro-service.' },
        { title: 'Network slicing', text: 'Une infrastructure physique, plusieurs réseaux logiques aux garanties différentes.' },
        { title: 'Edge computing & MEC', text: 'Rapprocher le calcul de l\'utilisateur pour réduire la latence.' },
        { title: 'Atelier', text: 'Concevez une offre « slice industrie 4.0 » en 30 minutes, par équipe de 3.' }
      ],
      quiz: [
        { q: 'Quelle fonction du cœur 5G SA gère l\'accès et la mobilité des terminaux ?', options: ['AMF', 'UPF', 'SMF', 'AUSF'], answer: 0 },
        { q: 'Le network slicing permet de…', options: ['Augmenter la puissance des antennes', 'Découper une infrastructure en réseaux logiques dédiés', 'Remplacer la fibre par la radio', 'Chiffrer le trafic utilisateur'], answer: 1 },
        { q: 'Quel est le bénéfice principal de l\'edge computing ?', options: ['Réduire la latence', 'Supprimer le cœur de réseau', 'Diminuer le nombre d\'abonnés', 'Éviter la virtualisation'], answer: 0 },
        { q: 'Quelle fonction achemine les données du plan usager ?', options: ['AMF', 'NRF', 'UPF', 'PCF'], answer: 2 },
        { q: 'En 5G SA, l\'architecture du cœur est dite…', options: ['Monolithique', 'Orientée services (SBA)', 'Propriétaire matérielle', 'Analogique'], answer: 1 }
      ]
    },
    'f-edge1': { files: [{ name: 'Edge_N1_support.pdf', size: '3,1 Mo', kind: 'pdf', updated: '2026-03-01' }], slides: [], quiz: [] }
  },

  /* ---------- Résultats & évaluations ---------- */
  quizResults: { 's-cloud5g-1124': {} },
  /* Évaluations à chaud (anonymes) — critères /5 */
  evaluations: [
    { sessionId: 's-cloud5g-1124', clarte: 5, rythme: 4, interactivite: 5, supports: 5, utilite: 5, comment: 'Atelier slicing très concret, on repart avec une démarche réutilisable.' },
    { sessionId: 's-cloud5g-1124', clarte: 5, rythme: 4, interactivite: 5, supports: 4, utilite: 5, comment: 'Excellente interactivité, les quiz en direct relancent l\'attention.' },
    { sessionId: 's-cloud5g-1124', clarte: 4, rythme: 3, interactivite: 5, supports: 5, utilite: 4, comment: 'Un peu dense l\'après-midi, une pause de plus aurait aidé.' },
    { sessionId: 's-cloud5g-1124', clarte: 5, rythme: 4, interactivite: 5, supports: 4, utilite: 5, comment: 'Le formateur part de nos cas réels, c\'est précieux.' },
    { sessionId: 's-cloud5g-1124', clarte: 4, rythme: 4, interactivite: 5, supports: 5, utilite: 5, comment: '' },
    { sessionId: 's-cloud5g-1124', clarte: 5, rythme: 4, interactivite: 5, supports: 5, utilite: 4, comment: 'Supports clairs, la fiche mémo 5G SA est top.' },
    { sessionId: 's-cloud5g-1124', clarte: 5, rythme: 5, interactivite: 4, supports: 4, utilite: 5, comment: '' },
    { sessionId: 's-cloud5g-1124', clarte: 4, rythme: 4, interactivite: 5, supports: 5, utilite: 5, comment: 'J\'aurais aimé plus de temps sur l\'edge.' }
  ],
  coldEvals: [],
  criteria: [
    { id: 'clarte', label: 'Clarté' }, { id: 'rythme', label: 'Rythme' }, { id: 'interactivite', label: 'Interactivité' },
    { id: 'supports', label: 'Supports' }, { id: 'utilite', label: 'Utilité terrain' }
  ],
  /* KPI de la session fil rouge (affichés en After) */
  kpis: { 's-cloud5g-1124': { satisfaction: 4.6, presence: 89, reussite: 78, recommandation: 92 } },
  /* Historique personnel Karim (6 dernières sessions) — comparaison à soi-même uniquement */
  trainerHistory: {
    karim: [
      { label: 'Kubernetes', date: '2025-02-11', avg: 4.1 },
      { label: 'Cloud 101', date: '2025-04-15', avg: 4.2 },
      { label: 'Cloud & 5G', date: '2025-06-12', avg: 4.3 },
      { label: 'Edge N1', date: '2025-09-18', avg: 4.3 },
      { label: 'Cloud & 5G', date: '2025-11-20', avg: 4.5 },
      { label: 'Edge N1', date: '2026-03-17', avg: 4.5 }
    ]
  },
  academyAverage: 4.3, /* repère anonymisé — jamais une cible */
  /* Qualité agrégée par formation (O7) — pas de vue par formateur */
  quality: [
    { formationId: 'f-cloud5g', hot: 4.6, cold: 4.4, answers: 52, trend: [4.2, 4.3, 4.3, 4.5, 4.6], strength: 'Interactivité', axis: 'Rythme de l\'après-midi' },
    { formationId: 'f-agile', hot: 4.8, cold: 4.6, answers: 97, trend: [4.6, 4.7, 4.7, 4.8, 4.8], strength: 'Mises en situation', axis: 'Supports post-formation' },
    { formationId: 'f-data', hot: 4.7, cold: 4.5, answers: 44, trend: [4.4, 4.5, 4.6, 4.6, 4.7], strength: 'Cas d\'usage concrets', axis: 'Prérequis Python' },
    { formationId: 'f-kube', hot: 4.4, cold: 4.1, answers: 51, trend: [4.0, 4.1, 4.3, 4.3, 4.4], strength: 'Ateliers pratiques', axis: 'Temps d\'installation des labs' },
    { formationId: 'f-cyber', hot: 4.3, cold: 4.2, answers: 29, trend: [4.0, 4.1, 4.1, 4.2, 4.3], strength: 'Exercice de crise', axis: 'Clarté des prérequis' },
    { formationId: 'f-fibre', hot: 4.2, cold: 4.0, answers: 36, trend: [3.9, 4.0, 4.1, 4.1, 4.2], strength: 'Expertise terrain', axis: 'Interactivité' },
    { formationId: 'f-cloud101', hot: 4.6, cold: 4.4, answers: 121, trend: [4.4, 4.5, 4.5, 4.6, 4.6], strength: 'Pédagogie progressive', axis: 'Exemples sectoriels' }
  ],
  goodPractices: [
    { id: 'gp-1', formationId: 'f-cloud5g', title: 'Quiz éclair en début d\'après-midi', text: 'Un quiz de 3 questions à 14 h relance l\'attention : +0,4 sur l\'interactivité.', shared: false },
    { id: 'gp-2', formationId: 'f-agile', title: 'Fil rouge par équipe', text: 'Un cas fil rouge traité par équipe sur la journée renforce l\'utilité terrain.', shared: true },
    { id: 'gp-3', formationId: 'f-data', title: 'Données réelles anonymisées', text: 'Travailler sur un extrait de données réseau réelles rend l\'atelier concret.', shared: false }
  ],

  /* ---------- Vouchers de certification ---------- */
  vouchers: [
    { id: 'v-sana', participantId: 'sana', certification: 'Certification Cloud Practitioner', sessionId: 's-cloud101-0520', eligibility: 'Éligible — quiz 85 %, présence 100 %', eligible: true, status: 'en_attente', requestedAt: '2026-11-10' },
    { id: 'v-amine', participantId: 'amine', certification: 'Kubernetes CKA', sessionId: 's-kube-1203', eligibility: 'Éligible — badge Kubernetes Practitioner', eligible: true, status: 'en_attente', requestedAt: '2026-11-08' },
    { id: 'v-hatem', participantId: 'hatem', certification: 'Edge Computing Specialist', sessionId: 's-edge1-0317', eligibility: 'Éligible — projet fil rouge validé', eligible: true, status: 'validé', requestedAt: '2026-03-20' },
    { id: 'v-julien', participantId: 'julien', certification: 'Edge Computing Specialist', sessionId: 's-edge1-0317', eligibility: 'Non éligible — absence le jour J', eligible: false, status: 'en_attente', requestedAt: '2026-03-21' }
  ],

  /* ---------- Paiements / honoraires formateurs ---------- */
  payments: [
    { id: 'pay-edge1', trainerId: 'karim', sessionId: 's-edge1-0317', label: 'Edge Computing — niveau 1', amount: 1200, status: 'payé', date: '2026-04-10' },
    { id: 'pay-k-2511', trainerId: 'karim', sessionId: 's-cloud5g-2511', label: 'Cloud & 5G (nov. 2025)', amount: 1200, status: 'payé', date: '2025-12-15' },
    { id: 'pay-claire-0612', trainerId: 'claire', sessionId: 's-agile-0612', label: 'Facilitation agile', amount: 1100, status: 'payé', date: '2026-07-08' },
    { id: 'pay-ines-0923', trainerId: 'ines', sessionId: 's-data-0923', label: 'Data & IA', amount: 1150, status: 'en_cours', date: '2026-10-30' },
    { id: 'pay-olivier-0520', trainerId: 'olivier', sessionId: 's-cloud101-0520', label: 'Cloud — les fondamentaux', amount: 950, status: 'payé', date: '2026-06-12' },
    { id: 'pay-claire-1119', trainerId: 'claire', sessionId: 's-agile-1119', label: 'Facilitation agile (nov.)', amount: 1100, status: 'en_attente', date: null }
  ],
  currency: 'TND',

  /* ---------- Badge formateur : alertes de seuil (2 formations / an) ---------- */
  badgeAlerts: {
    karim: [
      { date: '2026-01-01', kind: 'done', title: 'Badge renouvelé pour 2026', text: 'Seuil 2025 atteint : 5 formations animées.' },
      { date: '2026-03-17', kind: 'done', title: '1ʳᵉ formation animée en 2026', text: 'Edge Computing — niveau 1 · 10 participants.' },
      { date: '2026-09-01', kind: 'warn', title: 'Alerte de seuil — 1er septembre', text: '1 formation sur 2 animée. Pensez à déclarer vos disponibilités.' },
      { date: '2026-11-01', kind: 'alert', title: 'Badge « En sursis » — 1er novembre', text: 'Sans 2ᵉ formation programmée avant le 31 décembre, le badge sera désactivé au 1er janvier.' },
      { date: '2027-01-01', kind: 'future', title: 'Bilan annuel', text: 'Renouvellement ou désactivation du badge formateur.' }
    ]
  },

  /* ---------- Chat ---------- */
  conversations: [
    {
      id: 'c-sana', sessionId: 's-cloud5g-1124', type: 'direct', participantId: 'sana', trainerId: 'karim', title: 'Sana B.',
      messages: [
        { from: 'sana', text: 'Bonjour Karim, faut-il préparer quelque chose avant la session du 24 ?', at: '2026-11-10T09:12' },
        { from: 'karim', text: 'Bonjour Sana ! Relisez simplement la fiche mémo Cloud Fundamentals, je partagerai le support la veille.', at: '2026-11-10T10:03' }
      ]
    },
    {
      id: 'c-group', sessionId: 's-cloud5g-1124', type: 'group', trainerId: 'karim', title: 'Groupe — Cloud & 5G (24 nov.)',
      messages: [
        { from: 'karim', text: 'Bienvenue à toutes et à tous ! Le lien Teams sera envoyé la veille pour les participants à distance.', at: '2026-11-09T16:20' },
        { from: 'amine', text: 'Merci ! Est-ce qu\'on aura accès aux labs après la session ?', at: '2026-11-09T16:41' },
        { from: 'karim', text: 'Oui, pendant 30 jours via l\'espace Academy.', at: '2026-11-09T17:02' }
      ]
    },
    {
      id: 'c-meriem', sessionId: 's-cloud5g-1124', type: 'direct', participantId: 'meriem', trainerId: 'karim', title: 'Meriem B.',
      messages: [{ from: 'meriem', text: 'Je serai à distance, la session sera-t-elle enregistrée ?', at: '2026-11-11T08:30' }]
    }
  ],

  /* ---------- Notifications (par utilisateur) ---------- */
  notifications: {
    sana: [
      { id: 'n-s1', icon: 'graduation-cap', text: 'Nouvelle session « Cloud & 5G » ouverte le 24 nov. — correspond à vos badges', at: '2026-11-11T09:00', route: '#/catalogue/f-cloud5g', read: false },
      { id: 'n-s2', icon: 'ticket', text: 'Votre demande de voucher « Cloud Practitioner » est en attente de validation', at: '2026-11-10T14:00', route: '#/p/badges', read: true }
    ],
    karim: [
      { id: 'n-k1', icon: 'alert-triangle', text: 'Badge en sursis : 1 formation animée sur 2 en 2026', at: '2026-11-01T08:00', route: '#/transverse/badge', read: false },
      { id: 'n-k2', icon: 'calendar', text: '3 sessions ouvertes sans animateur correspondent à vos compétences', at: '2026-11-11T08:00', route: '#/before/sessions-ouvertes', read: false },
      { id: 'n-k3', icon: 'message-circle', text: 'Meriem B. vous a envoyé un message', at: '2026-11-11T08:30', route: '#/transverse/chat', read: false }
    ],
    leila: [
      { id: 'n-l1', icon: 'clipboard-check', text: '2 nouvelles formations à valider', at: '2026-11-09T11:00', route: '#/o/validation', read: false },
      { id: 'n-l2', icon: 'alert-triangle', text: '4 formateurs à risque de badge au 1er novembre', at: '2026-11-01T08:00', route: '#/o/risques', read: false },
      { id: 'n-l3', icon: 'users', text: 'Session « Cybersécurité » du 27 nov. sans animateur', at: '2026-11-10T08:00', route: '#/o/sessions', read: true }
    ]
  },

  /* ---------- LET'S CONNECT! (mobile) ---------- */
  posts: [
    {
      id: 'post-annonce', authorId: 'leila', type: 'annonce', pinned: true, at: '2026-11-05T09:00',
      text: 'Trainer\'s Day — 3ᵉ édition : merci aux 42 formateurs présents ! Les supports et les 4 « Breaking News » sont disponibles dans l\'espace ressources.',
      resource: { title: 'Trainer\'s Day 2026 — supports', kind: 'pdf' }, reactions: 31, reactedBy: [], comments: [{ authorId: 'claire', text: 'Merci pour l\'organisation, journée très inspirante !', at: '2026-11-05T10:12' }], savedBy: []
    },
    {
      id: 'post-claire', authorId: 'claire', type: 'bonne_pratique', at: '2026-11-10T17:30', fromRate: true,
      text: 'Bonne pratique : un cas fil rouge traité par équipe tout au long de la journée. Les participants le citent comme le moment le plus utile.',
      reactions: 18, reactedBy: [], comments: [{ authorId: 'nadia', text: 'Je teste ça sur ma prochaine session Kubernetes 👍', at: '2026-11-10T18:02' }], savedBy: []
    },
    {
      id: 'post-nadia', authorId: 'nadia', type: 'ressource', at: '2026-11-09T12:10',
      text: 'Je partage mon lab Kubernetes « clé en main » (manifests + guide formateur). N\'hésitez pas à l\'adapter !',
      resource: { title: 'Lab Kubernetes — kit formateur', kind: 'zip' }, reactions: 24, reactedBy: [], comments: [], savedBy: []
    },
    {
      id: 'post-ines', authorId: 'ines', type: 'post', at: '2026-11-08T08:45',
      text: 'Question à la communauté : comment gérez-vous les participants à distance en format hybride ? Je cherche des astuces pour les inclure dans les ateliers.',
      reactions: 9, reactedBy: [], comments: [{ authorId: 'karim', text: 'Un « binôme distant » par table en présentiel, ça marche très bien.', at: '2026-11-08T09:30' }], savedBy: []
    }
  ],
  entraide: [
    { id: 'ent-cyber', authorId: 'leila', kind: 'remplacement', title: 'Animateur recherché — Cybersécurité des réseaux mobiles', date: '2026-11-27', location: 'Tunis — salle Hannibal', sessionId: 's-cyber-1127', text: 'Session ouverte sans animateur, 5 inscrits. Profil cybersécurité mobile.', responders: [], at: '2026-11-10T08:00' },
    { id: 'ent-fibre', authorId: 'youssef', kind: 'co-animation', title: 'Co-animateur pour l\'atelier mesures FTTH', date: '2026-12-02', location: 'Sfax — Agence régionale', sessionId: 's-fibre-1202', text: 'Besoin d\'un binôme pour l\'atelier pratique de l\'après-midi.', responders: ['olivier'], at: '2026-11-07T15:00' },
    { id: 'ent-q1', authorId: 'mehdi', kind: 'question', title: 'Un outil simple pour des quiz en direct ?', date: null, location: null, text: 'Vous utilisez quoi pour les quiz en séance, hors Smart Assist ?', responders: ['claire', 'nadia'], at: '2026-11-06T11:20' }
  ],

  /* ---------- Cockpit : agrégats mensuels (O1) ---------- */
  monthly: [
    { month: 'Juin', sessions: 7, fill: 81, satisfaction: 4.4 },
    { month: 'Juil.', sessions: 3, fill: 74, satisfaction: 4.3 },
    { month: 'Sept.', sessions: 8, fill: 79, satisfaction: 4.5 },
    { month: 'Oct.', sessions: 9, fill: 84, satisfaction: 4.5 },
    { month: 'Nov.', sessions: 6, fill: 78, satisfaction: 4.6 }
  ],

  reminders: [],
  log: []
};
