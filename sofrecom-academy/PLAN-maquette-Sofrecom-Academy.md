# Plan de réalisation — Maquette « Sofrecom Academy » (Portail multi-rôles + LET'S CONNECT!)

> Livrable visé : une **maquette cliquable haute fidélité** (HTML/CSS/JS statique, données simulées), **pas une application fonctionnelle**, démontrée à travers **3 utilisateurs fictifs aux rôles distincts** (Participant · Formateur · Observateur).
> Sources : [PRD-portail-de-formation-Sofrecom-Academy.md](./PRD-portail-de-formation-Sofrecom-Academy.md) + les 4 slides « Breaking News » du Trainer's Day (LET'S CONNECT! / LET'S GET SMART! / LET'S SHARE! / LET'S RATE!).
> Méthode : règles **UI/UX Pro Max** (accessibilité, animation, layout, typo, performance) appliquées sur l'identité **Sofrecom** (palette, composants, logo bar, gradient bar).
> Outillage imposé aux implémenteurs : les **skills Sofrecom** (`sofrecom-presentation`, `sofrecom-pptx`) et le skill **`ui-ux-pro-max`** — voir §4.1.

---

## 1. Objectif & périmètre de la maquette

| | Inclus | Exclu |
|---|---|---|
| **But** | Montrer l'expérience **des 3 rôles** autour d'une même session de formation : le Formateur de bout en bout (Before → During → After → Transverse), le Participant (inscription → quiz → évaluation) et l'Observateur (validation, pilotage, badges), plus le module communautaire mobile | Backend, authentification réelle, base de données, WebSockets, cron |
| **Interactivité** | Sélecteur d'utilisateur (3 comptes de démo), navigation entre écrans, onglets, modales, toasts, états (vide / chargé / alerte), filtres côté client sur données mockées | Persistance, formulaires réellement soumis, génération IA réelle, vraie gestion de droits |
| **Supports** | Desktop 1440 / 1024 (portail web) + mobile 375 (LET'S CONNECT!) | Tablette dédiée (dégradation acceptable via responsive) |
| **Langue** | Français | — |
| **Techno** | HTML + CSS (custom properties) + JS vanilla, **zéro framework, zéro build** | React/Angular, bundler |

**Usage attendu** : démo en atelier / comité (projection), tests d'usabilité rapides avec des formateurs, base pour le cadrage de développement.

### 1.1 Les 3 utilisateurs de démo

Trois comptes fictifs, **liés à la même session** « Cloud & 5G — 24 nov. 2026 », pour montrer que chaque action d'un rôle a un effet visible chez les autres.

| Compte | Rôle (PRD §2) | Profil fictif | Couleur d'identité | Ce qu'il doit démontrer |
|---|---|---|---|---|
| **Sana B.** | **Participant** | Ingénieure réseau, 2 formations suivies, badge « Cloud Fundamentals » acquis | `--cyan` | Recherche d'offre, demande d'inscription, suivi de session, quiz, émargement, évaluation à chaud/froid, fil LET'S CONNECT! côté apprenant |
| **Karim M.** | **Formateur** | Formateur certifié depuis 2023, **1 seule formation animée en 2026** → badge « En sursis » | `--blue` | Les 20 fonctions du PRD §5 (Before / During / After / Transverse) + Smart Assist + Entraide |
| **Leïla T.** | **Observateur / Équipe formation** | Responsable Sofrecom Academy | `--purple` | Validation des nouvelles formations, pilotage global, formateurs à risque de badge, facturation / paiements, reporting qualité |

**Mécanique de bascule** : un **sélecteur d'utilisateur** dans la topbar (avatar + nom + pill rôle) et sur l'écran de connexion (3 cartes « Se connecter en tant que… »). Le changement d'utilisateur :
- recharge la sidebar avec le menu du rôle,
- applique la couleur d'identité sur l'avatar, la pill rôle et le liseré de la topbar (le reste du design system ne change pas),
- conserve l'état partagé de `DATA` (ex. : l'inscription de Sana apparaît dans la liste temps réel de Karim ; la formation proposée par Karim apparaît dans la file de validation de Leïla).

---

## 2. Ce que disent les sources

### 2.1 PRD — rôles et fonctions
Périmètres §2 du PRD :
- **Participant** : recherche d'offres, demande d'inscription, suivi de session, quiz, émargement, évaluation à chaud / à froid.
- **Observateur / Équipe formation** : validation des nouvelles formations, pilotage global, suivi facturation / paiement, gouvernance des badges, reporting qualité, vue consolidée des formateurs à risque de badge (§3.4).
- **Formateur** : matrice §5 du PRD (20 fonctions), regroupée par phase :

- **Before (8)** : Voir mes formations · Je donne mes dispos · Voir les sessions ouvertes · Inscriptions en temps réel · Entrer cours / Quiz · Proposer une nouvelle formation (prérequis) · Vérifier limite / alerter · Calendrier
- **During (5)** : Alerte logistique · Feuille de présence · Lancer un quiz · Afficher le cours · Lancer feedback
- **After (3)** : Voir feedback & KPI · Valider l'achat des vouchers · Donner un feedback (optionnel)
- **Transverse (4)** : Chat participants · Vérifier badge · Alerte seuil annuel (< 2 formations/an) · Vérifier paiement

### 2.2 Slides « Breaking News » (Trainer's Day, 3ème édition)
| # | Pilier | Fonctionnalité | Mission (question à laquelle la maquette doit répondre) |
|---|---|---|---|
| 1/4 | **LET'S CONNECT!** | App mobile façon réseau social : publier, réagir, commenter, partager actus & ressources | Comment donner envie aux formateurs de se connecter et faire vivre la communauté au quotidien ? |
| 2/4 | **LET'S GET SMART!** | Agent IA : concevoir des activités, générer des quiz, préparer des animations, exploiter les retours | Quel assistant IA fait gagner du temps et renforce l'impact pédagogique ? |
| 3/4 | **LET'S SHARE!** | Espace d'échange : questions, partage de supports, bonnes pratiques, feedbacks entre formateurs | Comment transformer les échanges ponctuels en dynamique d'entraide ? |
| 4/4 | **LET'S RATE!** | Système de notation et de feedback : mesurer la satisfaction, identifier les axes de progression, valoriser les bonnes pratiques pédagogiques | Comment évaluer la qualité des formations pour favoriser l'amélioration continue **sans mettre les formateurs en compétition** ? |

> Le PRD ne mentionne pas l'agent IA : la maquette l'intègre comme **« Smart Assist »** transverse (panneau latéral) pour couvrir la slide 2/4.

> **Principes LET'S RATE! (slide 4/4) à respecter dans tous les écrans d'évaluation (W10, P5, P6, O7)** :
> - **Aucun classement** entre formateurs : pas de leaderboard, pas de rang, pas de « top formateur ». Le formateur ne se compare qu'à **lui-même** (évolution session après session) et à une **moyenne Academy anonymisée** affichée comme repère, jamais comme cible.
> - **Axes de progression plutôt que notes brutes** : chaque critère (clarté, rythme, interactivité, supports, utilité terrain) est restitué en « point fort / axe de progression », avec suggestions actionnables (Smart Assist peut en proposer).
> - **Valorisation des bonnes pratiques** : une pratique bien notée peut être partagée en un clic dans LET'S SHARE! (post « Bonne pratique » pré-rempli), ce qui boucle les 4 piliers.
> - **Anonymat et bienveillance** : verbatims participants anonymisés ; côté Observateur, vue par formation et tendances, le détail par formateur n'est accessible qu'en accompagnement (« Proposer un coaching »), pas en sanction.
> - **Ton** : vocabulaire d'amélioration continue (« progresser », « ajuster »), jamais de rouge sur une note ; échelle de couleur neutre → teal.

---

## 3. Design system de la maquette

### 3.1 Profil produit (UI/UX Pro Max)
- **Type produit** : EdTech / LMS — portail d'administration pédagogique + app communautaire mobile
- **Pattern** : Dashboard « command center » (web) + Feed social (mobile)
- **Style** : *Clean Corporate SaaS* — fond clair, cartes élevées, accents dégradés Sofrecom. Pas de dark mode par défaut (projection en salle).
- **Ton** : professionnel, chaleureux, orienté action (verbes à l'infinitif sur les CTA : « Déclarer mes dispos », « Lancer le quiz »)

### 3.2 Palette (tokens Sofrecom, `:root`)
| Token | Valeur | Usage dans la maquette |
|---|---|---|
| `--blue` | `#0078BA` | Primaire : CTA, liens, nav active, phase **Before** |
| `--blue-d` | `#21527C` | Titres, texte fort |
| `--cyan` | `#00A3E4` | Dégradés, hover |
| `--teal` | `#21BCB9` | Phase **During**, succès doux, LET'S GET SMART! |
| `--orange` | `#FF9628` | Alertes de seuil, badge « En sursis », notifications |
| `--green` | `#C1D72F` | Accent corporate, TOC, phase **After** |
| `--green-ok` | `#00A94F` | Présent / validé / payé |
| `--red` | `#EF3E41` | Alerte logistique, badge « Désactivé », sous-effectif ; **carte LET'S RATE! dans le hub uniquement** (rappel de la slide), jamais sur une note |
| `--purple` | `#AA74C1` | LET'S CONNECT! / LET'S SHARE! (communauté) |

Codage couleur des **4 piliers** (hub et eyebrows) : CONNECT = `--blue-d` fond bleu · GET SMART = `--teal` · SHARE = `--purple` · RATE = `--red` (hub) / `--orange` étoiles & `--teal` progression (dans l'app).
| `--bg-0/1/2` | `#FFF / #F8FAFC / #F1F5F9` | Fonds |
| `--ink / --ink-soft / --ink-dim` | `#1E293B / #475569 / #64748B` | Texte (contraste ≥ 4.5:1 vérifié) |

Codage couleur des **phases** (repris dans la nav, les eyebrows et les cartes) : Before = bleu · During = teal · After = vert · Transverse = violet. Un seul accent fort par écran.

### 3.3 Typographie
- **Inter** (Google Fonts) pour tout l'UI ; `JetBrains Mono` uniquement pour les identifiants (n° session, code voucher).
- Échelle : 12 / 13.5 / 14.5 / 16 / 18 / 24 / 32 / 42 px ; `line-height` 1.5–1.6 corps, 1.1 titres ; `letter-spacing -.02em` sur les titres.
- Chiffres clés : `.stat .num` 42px dégradé bleu→teal.

### 3.4 Règles UI/UX Pro Max appliquées
| Domaine | Règle | Traduction concrète |
|---|---|---|
| **Accessibilité (critique)** | Contraste ≥ 4.5:1, focus ring visible, navigation clavier, `prefers-reduced-motion`, pas d'emoji-icône | Icônes **SVG inline** (set Lucide-like), `:focus-visible` 2px `--blue`, `aria-label` sur icônes seules, `role="tablist"` sur les onglets de phase, désactivation des reveals si reduced-motion |
| **Animation (moyen)** | 150–300 ms micro-interactions, `transform/opacity` seulement, stagger 30–50 ms, sortie plus courte que l'entrée | Cartes hover `translateY(-4px)` 250 ms ; apparition liste 40 ms/élément ; toasts in 250 ms / out 150 ms ; compteur temps réel qui « pulse » 1 fois |
| **Layout (haut)** | Mobile-first 375 / 768 / 1024 / 1440, rythme 8 dp, `max-width` cohérent | Portail : sidebar 240 px + contenu `max-w 1180` ; grilles `grid-2/3/4` → 1 col < 900 px ; mobile : frame 375×812 centré avec « device shell » |
| **Typo & couleur (moyen)** | Tokens sémantiques, dégradé sur titres héros | `--phase-accent` par écran ; `.gradient-text` seulement sur le titre de la home |
| **Performance (haut)** | Fichier unique, CSS vars, JS minimal | 1 fichier `portail.html` + 1 fichier `mobile.html` (+ `index.html` hub) ; données mock dans `<script type="application/json">` |

### 3.5 Composants Sofrecom réutilisés
`.sf-logo` (logo haut-gauche) · `.sf-bar` (barre dégradée bas) · `.eyebrow` + `.num` · `.card` / `.value-card` (`--accent`) · `.stat` · `.pill.{blue,teal,green,orange,purple,red}` · `.toc-row` · `.live` (panneau CTA dégradé) · `.step` + `.badge` (flux) · `.shot` / `.mock-wrap` (cadres) · `<details class="src">`.

Composants **à créer** pour la maquette : sidebar de navigation, `topbar` (recherche + cloche + avatar), tableau de données (`.table`), jauge min/max (`.gauge`), calendrier mensuel (`.cal`), chat (`.chat`), timeline de badge (`.timeline`), bottom-tab mobile (`.tabbar`), carte de post (`.post`), panneau IA (`.assist`), notation étoiles accessible (`.rating`, radios masquées + `aria-label`), carte « point fort / axe de progression » (`.insight`), courbe de progression personnelle (`.trend`, SVG inline).

---

## 4. Architecture des fichiers

```
sofrecom-academy/
├── index.html                 # Hub de démo : choix Portail web / App mobile / Pitch (4 piliers)
├── portail.html               # Portail formateur (single-file, toutes les vues en <section data-view>)
├── mobile.html                # LET'S CONNECT! dans un device frame 375×812 (single-file)
├── assets/
│   ├── logo-sofrecom.svg      # fourni par Sofrecom
│   └── avatars/               # 6–8 avatars SVG génériques (initiales)
└── PLAN-maquette-Sofrecom-Academy.md
```

Principes :
- **Router hash** minimal (`#/before/formations`, `#/during/presence`…) → affiche la `<section data-view>` correspondante, met à jour la sidebar et l'eyebrow de phase.
- **Mock data** : un objet `DATA` (users[3], formations, sessions, inscrits, quiz, posts, badges, paiements, demandes de validation) sérialisé en JSON dans la page ; les écrans sont rendus par de petites fonctions `render*()`.
- **Contexte utilisateur** : `state.currentUser` (`participant` | `formateur` | `observateur`) persisté dans `sessionStorage` ; chaque `<section data-view>` porte `data-roles="formateur,observateur"` et le router masque les vues non autorisées (simulation de droits, pas de sécurité réelle). Le menu de la sidebar est décrit par un tableau `MENU[role]`.

### 4.1 Skills & outillage imposés aux implémenteurs

Les implémenteurs (humains ou agents) **doivent** s'appuyer sur les skills disponibles dans l'environnement Sofrecom plutôt que repartir de zéro :

| Skill | Rôle dans la maquette | Quand l'invoquer |
|---|---|---|
| **`sofrecom-presentation`** | **Source de vérité du design system** : tokens `:root` (palette §3.2), `.sf-logo`, `.sf-bar`, `.eyebrow`, `.card`, `.value-card`, `.stat`, `.pill.*`, `.toc-row`, `.live`, `.step`, `.shot`, `<details class="src">`, animations `.reveal`, règles de structure. Sert aussi à produire `index.html` (hub / pitch des 4 piliers en slides scroll-snap) et toute page de restitution. | **L0** (copier le `:root`, le stage-bg, le branding et les composants depuis `references/css-design-system.md` et `references/html-structure.md`) ; **index.html** ; toute nouvelle page |
| **`ui-ux-pro-max`** | Règles d'accessibilité, d'animation, de layout responsive, de typo et de performance (§3.4) ; revue UX des écrans | **Chaque lot** avant livraison (checklist §8) ; conception des composants « à créer » (§3.5) |
| **`sofrecom-pptx`** | Deck PowerPoint de restitution (captures de la maquette, parcours 5 actes, décisions) sur le template corporate | **L7** si un support comité est demandé (cf. §11 q.9) |

Règles d'usage :
1. **Ne jamais redéfinir** une couleur, une ombre ou un composant déjà fourni par `sofrecom-presentation` ; étendre via de nouvelles classes (`.table`, `.gauge`, `.rating`…) qui réutilisent les tokens.
2. Les composants spécifiques créés dans `portail.html` sont regroupés dans un bloc `<style>` **« Extensions maquette »** séparé du bloc « Design system Sofrecom », pour pouvoir être reversés au skill ensuite.
3. Toute dérogation au design system (ex. : couleur d'identité des 3 utilisateurs) est documentée en commentaire CSS `/* dérogation : … */`.
4. Avant chaque jalon, dérouler la section « UI/UX Pro Max » de la checklist §8 et corriger avant de passer au lot suivant.
- **Simulation temps réel** : `setInterval` qui ajoute un inscrit / un message toutes les ~8 s sur les écrans concernés (désactivable via un toggle « Pause démo » pour la projection).
- **États** : chaque écran prévoit au moins l'état *normal* et un état *alerte* ou *vide* bascule via un sélecteur « Scénario » discret dans la topbar.

---

## 5. Inventaire des écrans

### 5.0 Écrans communs aux 3 rôles

| # | Écran | Composants clés | Priorité |
|---|---|---|---|
| C0 | **Connexion / choix du profil** | Cover gradient Sofrecom, 3 cartes `.value-card` (Sana · Karim · Leïla) avec avatar, rôle, phrase d'accroche et CTA « Se connecter en tant que… » ; bouton SSO Orange décoratif | **P0** |
| C1 | **Shell** (sidebar + topbar) | Sidebar pilotée par `MENU[role]`, topbar avec recherche, cloche, **sélecteur d'utilisateur** (popover 3 comptes), liseré couleur d'identité | **P0** |
| C2 | **Notifications** | Popover cloche, contenu dépendant du rôle (Participant : confirmation d'inscription, quiz lancé · Formateur : nouvel inscrit, seuil, badge · Observateur : formation à valider, formateur à risque) | P2 |
| C3 | **Fiche formation (catalogue)** | Vue lecture commune : syllabus, prérequis, prochaines sessions, formateur ; CTA variable par rôle (Participant « Demander mon inscription », Formateur « Me positionner », Observateur « Modifier / Archiver ») | P1 |

### 5.1 Portail web — Formateur · Karim M. (`portail.html`)

| # | Écran | Phase | Fonctions PRD couvertes | Composants clés | Priorité |
|---|---|---|---|---|---|
| W1 | **Tableau de bord** | Hub | Voir mes formations · Alerte seuil annuel · raccourcis | 4 `.stat` (formations animées / an, inscrits, note moyenne, badge), bannière orange « 1/2 formations animées — risque badge », timeline des 3 prochaines sessions, `.live` « Déclarer mes dispos » | **P0** |
| W2 | **Mes formations** | Before | Voir mes formations | Filtres (statut, période), `.table` + cartes, pill statut | P0 |
| W3 | **Détail formation / session** | Before→After | Inscriptions temps réel · Vérifier limite / alerter | En-tête session, `.gauge` min 6 / max 12, liste nominative live (compteur pulse), onglets Before/During/After | **P0** |
| W4 | **Mes disponibilités** | Before | Je donne mes dispos | `.cal` mensuel, créneaux cliquables (matin/après-midi), légende dispo / affecté / indisponible | P0 |
| W5 | **Sessions ouvertes** | Before | Voir les sessions ouvertes | Grille `.card`, pill « Sans animateur », CTA « Me positionner » → modale de confirmation | P1 |
| W6 | **Proposer une formation** | Before | Proposer une nouvelle formation avec prérequis | Stepper 3 étapes (Infos · Prérequis · Validation), champ prérequis en chips, résumé | P1 |
| W7 | **Contenu & Quiz (auteur)** | Before | Entrer cours / Quiz | Zone drop supports, liste fichiers, éditeur de questions (QCM), bouton « Générer avec Smart Assist » | P1 |
| W8 | **Calendrier global** | Before | Calendrier | Vue mois/semaine, codes couleur sessions / dispos | P2 |
| W9 | **Mode séance (During)** | During | Alerte logistique · Feuille de présence · Afficher le cours · Lancer quiz · Lancer feedback | Barre d'actions sticky (5 boutons), grille d'émargement (avatars + toggle présent), modale « Alerte logistique » (salle / visio / matériel / réseau), aperçu support plein écran, écran « Quiz en cours » avec compte à rebours | **P0** |
| W10 | **Feedback & KPI — « Ma progression »** | After | Voir feedback et KPI · Donner un feedback · *(LET'S RATE!)* | 4 `.stat`, `.rating` par critère, cartes `.insight` « point fort / axe de progression », `.trend` évolution personnelle sur les 6 dernières sessions + repère « moyenne Academy » anonymisé, verbatims anonymisés, bouton « Partager cette bonne pratique » (→ post M2 pré-rempli), formulaire feedback formateur. **Aucun classement.** | P0 |
| W11 | **Vouchers de certification** | After | Valider l'achat des vouchers | Table demandes (apprenant, certif, éligibilité), actions Valider / Refuser, toast confirmation | P1 |
| W12 | **Chat participants** | Transverse | Interagir via chat | Liste de conversations par session, `.chat` avec bulles, réponses rapides | P1 |
| W13 | **Mon badge formateur** | Transverse | Vérifier badge · Alerte seuil annuel | Carte badge (Actif / En sursis / Désactivé), jauge 2 formations/an, `.timeline` des alertes (1er sept / 1er nov), badges compétences attribués | **P0** |
| W14 | **Paiements** | Transverse | Vérifier paiement | Table honoraires (session, montant, statut), pills Payé / En cours / En attente, total année | P1 |
| W15 | **Smart Assist (panneau IA)** | Transverse | *(LET'S GET SMART!)* | Drawer droit, 4 actions suggérées (Générer un quiz · Préparer une animation · Synthétiser les feedbacks · Concevoir une activité), réponse simulée en streaming | P1 |

### 5.2 Portail web — Participant · Sana B.

| # | Écran | Fonctions PRD (§2 Participant) | Composants clés | Priorité |
|---|---|---|---|---|
| P1 | **Accueil participant** | Suivi de session | 3 `.stat` (formations suivies, badges, prochaine session), carte « Ma prochaine session » avec compte à rebours, `.live` « Découvrir le catalogue », recommandations | **P0** |
| P2 | **Catalogue des formations** | Recherche d'offres | Barre de recherche, filtres (thème, niveau, format, date), grille `.card`, pill « Places restantes 3/12 », prérequis affichés en chips | **P0** |
| P3 | **Demande d'inscription** | Demande d'inscription | Modale 2 étapes (vérification des prérequis auto-cochés via badges acquis → motivation facultative), toast « Demande envoyée », statut « En attente » puis « Confirmée » | **P0** |
| P4 | **Ma session (en direct)** | Suivi de session · Émargement · Quiz | Écran « séance en cours » : bouton **« Signer ma présence »** (signature tactile simulée), zone « Quiz en cours » qui s'active quand le formateur lance le quiz (QCM 5 questions, barre de progression, score final), support consultable | **P0** |
| P5 | **Évaluation à chaud** | Évaluation à chaud · *(LET'S RATE!)* | 5 critères en `.rating` (clarté, rythme, interactivité, supports, utilité), verbatim, mention « Vos réponses sont anonymes », envoi → toast ; déclenchée par « Lancer feedback » côté formateur | P1 |
| P6 | **Évaluation à froid (J+30)** | Évaluation à froid · *(LET'S RATE!)* | Bannière de rappel sur l'accueil, questionnaire court « Mise en pratique » (3 questions), affichage du badge de compétence une fois complété | P2 |
| P7 | **Mes badges & certifications** | — | Badges de compétences obtenus, demande de voucher de certification (statut « En attente de validation formateur ») | P1 |
| P8 | **Chat avec le formateur** | — (pendant du W12) | Même composant `.chat`, vue côté participant | P1 |

### 5.3 Portail web — Observateur / Équipe formation · Leïla T.

| # | Écran | Fonctions PRD (§2 Observateur, §3.4) | Composants clés | Priorité |
|---|---|---|---|---|
| O1 | **Cockpit de pilotage** | Pilotage global, reporting qualité | 4 `.stat` (sessions du mois, taux de remplissage, satisfaction moyenne, formateurs actifs), graphiques CSS (barres remplissage par formation, courbe satisfaction), alertes du jour | **P0** |
| O2 | **Formations à valider** | Validation des nouvelles formations | File de propositions (dont celle soumise par Karim en W6), détail syllabus / prérequis / public, actions **Valider / Demander des modifications / Refuser** avec commentaire | **P0** |
| O3 | **Formateurs à risque de badge** | Vue consolidée (§3.4), gouvernance des badges | Table triée par nb de sessions animées + programmées, pills Actif / En sursis / Désactivé, bouton « Relancer » (toast « Relance envoyée »), filtre par date d'alerte (1er sept / 1er nov) | **P0** |
| O4 | **Sessions & remplissage** | Pilotage global | Table de toutes les sessions avec jauge min/max, sans animateur en rouge, sous-effectif en orange ; action « Proposer à la communauté » (pousse un appel Entraide M4) | P1 |
| O5 | **Facturation & paiements** | Suivi facturation / paiement | Table honoraires formateurs (dont Karim), statuts, action « Marquer payé » (reflété dans W14 de Karim) | P1 |
| O6 | **Gouvernance des badges** | Gouvernance des badges | Catalogue des badges de compétences, règles d'attribution, historique d'attribution (dont badge de Sana) | P2 |
| O7 | **Qualité & amélioration continue** | Reporting qualité transverse · *(LET'S RATE!)* | Agrégation des évaluations à chaud / à froid **par formation** et tendances Academy, verbatims anonymisés, « Bonnes pratiques repérées » (à mettre en avant dans LET'S SHARE!), action « Proposer un coaching » sur un axe de progression ; **pas de classement de formateurs**, export (bouton décoratif) | P1 |

### 5.4 App mobile — LET'S CONNECT! (`mobile.html`, frame 375×812)

Le même sélecteur d'utilisateur existe sur mobile (profil → « Changer de compte ») ; le fil est commun, le contenu des onglets varie par rôle.

| # | Écran | Pilier | Rôles | Composants clés | Priorité |
|---|---|---|---|---|---|
| M1 | **Onboarding** (1 écran) | CONNECT | Tous | Illustration, 3 promesses, CTA « Rejoindre la communauté » | P2 |
| M2 | **Fil d'actualité** | CONNECT | Tous | `.post` (auteur avec pill rôle, texte, image/ressource, réactions, commentaires), filtres « Tous / Bonnes pratiques / Ressources / Entraide / Annonces Academy », FAB « + » ; les posts « Bonne pratique » issus de W10 portent un pill `--teal` « Issu de LET'S RATE! » | **P0** |
| M3 | **Détail post + commentaires** | SHARE | Tous | Fil de commentaires, réactions, « Enregistrer la ressource » | P1 |
| M4 | **Entraide** | SHARE | Formateur (publier / répondre), Observateur (publier un appel), Participant (lecture) | Appels à co-animation / remplacement (carte date, lieu, CTA « Je suis dispo »), questions ouvertes | **P0** |
| M5 | **Mes sessions (mobile)** | PRD mobilité | Formateur : émargement & alerte logistique · Participant : signer ma présence, quiz | Prochaine session, accès rapides selon rôle | P1 |
| M6 | **Notifications push** | CONNECT | Tous (contenu par rôle) | Inscriptions dernière minute, alerte badge, réponses, formation à valider | P1 |
| M7 | **Profil & badge** | Transverse | Tous | Badge, compteur 2/an (formateur), badges acquis (participant), stats de contribution, **« Changer de compte »** | P1 |
| M8 | **Annonce Academy** | CONNECT | Observateur (publier) | Post épinglé « Annonce officielle » avec visuel Sofrecom, poussé depuis O1 | P2 |

Tab bar : Fil · Entraide · ＋ · Sessions · Profil.

### 5.5 Matrice rôle × écran (synthèse)

| Zone | Participant (Sana) | Formateur (Karim) | Observateur (Leïla) |
|---|---|---|---|
| Accueil | P1 | W1 | O1 |
| Catalogue / formations | P2, C3 | W2, W5, C3 | O4, C3 |
| Inscription | P3 (demande) | W3 (suivi temps réel) | O4 (remplissage) |
| Ingénierie pédagogique | — | W6, W7, W15 | O2 (validation) |
| Séance | P4 | W9 | — |
| Évaluation | P5, P6 | W10 | O7 |
| Badges / certifs | P7 | W13, W11 | O3, O6 |
| Paiement | — | W14 | O5 |
| Chat | P8 | W12 | — |
| Communauté mobile | M2, M3, M5, M6, M7 | M2–M7 | M2, M4, M6, M7, M8 |

---

## 6. Parcours de démonstration (script ~12 min, 3 utilisateurs)

Fil rouge : la session **« Cloud & 5G — 24 nov. 2026 »**. On alterne les comptes via le sélecteur d'utilisateur pour montrer les effets croisés.

**Acte 0 — Hub** (1 min)
1. `index.html` → rappel des **4 piliers** (slides Breaking News recréées en cartes Sofrecom via `sofrecom-presentation`) → « Ouvrir le portail ».
2. **C0 Connexion** : présentation des 3 profils (Sana · Karim · Leïla).

**Acte 1 — Karim, Formateur : Before** (3 min)
3. **W1 Dashboard** : bannière orange « 1/2 formations animées en 2026 — badge en sursis au 1er novembre » → « Déclarer mes dispos ».
4. **W4 Disponibilités** : 3 créneaux cochés → toast.
5. **W5 Sessions ouvertes** : se positionner sur « Cloud & 5G — 24 nov » → jauge badge 2/2, bannière disparaît.
6. **W6 Proposer une formation** : soumet « Edge Computing — niveau 2 » avec prérequis → statut « En attente de validation ».
7. **W15 Smart Assist** : « Génère-moi un quiz de 5 questions sur la 5G SA » → questions injectées dans **W7**.

**Acte 2 — Sana, Participante : inscription** (2 min)
8. Bascule → **P2 Catalogue** : recherche « 5G », fiche **C3**, prérequis auto-validés par son badge « Cloud Fundamentals ».
9. **P3 Demande d'inscription** → toast ; retour **P1** : statut « En attente ».
10. Bascule → Karim **W3 Détail session** : Sana apparaît en direct dans la liste (compteur 9→10, pulse), confirmation en un clic.

**Acte 3 — Jour J : Karim anime, Sana participe** (3 min)
11. Karim **W9 Mode séance** : émargement, **Alerte logistique** « lien visio KO ».
12. Bascule → Sana **P4** : « Signer ma présence » (signature simulée) → côté Karim la case passe au vert.
13. Karim : **Lancer le quiz** → bascule Sana **P4** : répond aux 5 questions, score 4/5.
14. Karim : **Lancer feedback** → Sana **P5** évaluation à chaud 5★.

**Acte 4 — After : Karim puis Leïla** (2 min)
15. Karim **W10 Ma progression** : 4,6/5, 89 % présence, 78 % réussite ; axe de progression « rythme » vs point fort « interactivité » ; **« Partager cette bonne pratique »** → post pré-rempli ; **W11** valide le voucher demandé par Sana (**P7**).
16. Bascule → Leïla **O2 Formations à valider** : valide « Edge Computing — niveau 2 » → chez Karim, W2 passe en « Validée ».
17. Leïla **O3 Formateurs à risque** : Karim n'y figure plus ; relance d'un autre formateur → toast.
18. Leïla **O5 Paiements** : marque la session de Karim « Payée » → visible dans **W14**.

**Acte 5 — Mobile LET'S CONNECT!** (1 min)
19. `mobile.html` en Karim : post « Retour sur mon atelier 5G » + ressource ; Entraide « Besoin d'un co-animateur le 3 déc ».
20. Changer de compte → Leïla : épingle une **Annonce Academy** (M8) ; → Sana : réagit au post et enregistre la ressource.

---

## 7. Lots de réalisation

| Lot | Contenu | Livrable | Effort indicatif |
|---|---|---|---|
| **L0 — Fondations** | Tokens CSS Sofrecom, reset, typo, grille, composants de base (card, stat, pill, button, table, modal, toast, drawer), router hash avec filtrage `data-roles`, mock `DATA` (3 users + session fil rouge), shell **C1** (sidebar `MENU[role]` + topbar + sélecteur d'utilisateur + sf-logo + sf-bar), **C0** connexion | `portail.html` squelette + `index.html` | 1,5 j |
| **L1 — Formateur Before** | W1 Dashboard · W2 Mes formations · W3 Détail session (jauge + live) · W4 Disponibilités · W5 Sessions ouvertes | Portail Karim navigable P0 Before | 1,5 j |
| **L2 — Formateur During & After** | W9 Mode séance (5 actions) · W10 Feedback & KPI · W13 Badge | Parcours Formateur P0 complet | 1,5 j |
| **L3 — Participant** | P1 Accueil · P2 Catalogue · C3 Fiche · P3 Inscription · P4 Ma session (présence + quiz) · P5 Évaluation à chaud · P7 Badges | Parcours Sana P0/P1, effets croisés avec W3 / W9 / W11 | 1,5 j |
| **L4 — Observateur** | O1 Cockpit · O2 Validation · O3 Formateurs à risque · O4 Sessions · O5 Paiements · O7 Qualité | Parcours Leïla P0/P1, effets croisés avec W2 / W14 | 1,5 j |
| **L5 — Compléments Formateur P1** | W6 · W7 · W11 · W12 / P8 · W14 · W15 Smart Assist | Portail P1 | 1,5 j |
| **L6 — Mobile LET'S CONNECT!** | Device frame, tabbar, changement de compte, M2 Fil · M4 Entraide · M5 · M6 · M7 (+ M8) | `mobile.html` 3 rôles | 1,5 j |
| **L7 — Finitions** | P2 (C2, W8, P6, O6, M1, M3), états vides/erreur, reduced-motion, revue contraste, test clavier, test 1440/1024/375, répétition du script §6 | Maquette livrable + checklist §8 | 1 j |
| **Total** | | | **≈ 11,5 j** |

Ordre recommandé : L0 → L1 → L2 (jalon « démo Formateur ») → L3 → L4 (jalon « démo 3 rôles ») → L5 → L6 (jalon « 4 piliers couverts ») → L7.

---

## 8. Checklist de validation (Definition of Done maquette)

**Design & marque**
- [ ] Toutes les couleurs passent par les tokens `:root` Sofrecom ; aucune couleur en dur
- [ ] Logo `.sf-logo` et barre `.sf-bar` présents sur chaque page ; eyebrow numérotée par écran
- [ ] Un seul accent de phase par écran ; dégradé réservé aux titres héros / `.live`

**UI/UX Pro Max**
- [ ] Contraste texte ≥ 4.5:1 (vérifié sur orange `#FF9628` → utilisé sur fond clair en texte `--blue-d`, jamais texte orange sur blanc < 16 px)
- [ ] Focus visible sur tous les éléments interactifs ; parcours complet au clavier (Tab, Entrée, Échap ferme modale/drawer)
- [ ] `prefers-reduced-motion` coupe reveals, pulse et shimmer
- [ ] Animations 150–300 ms, `transform/opacity` uniquement ; stagger 30–50 ms
- [ ] Icônes SVG, `aria-label` sur icônes seules, `aria-live="polite"` sur compteur temps réel et toasts
- [ ] Responsive 375 / 768 / 1024 / 1440 sans débordement horizontal
- [ ] Rythme 8 dp, `max-width 1180`, `line-height` 1.5–1.6 corps

**Fonctionnel (maquette)**
- [ ] Les 20 fonctions du PRD §5 sont visibles dans au moins un écran (traçabilité tableau §5.1)
- [ ] Les périmètres Participant et Observateur du PRD §2 sont couverts (tableaux §5.2 et §5.3)
- [ ] Les 3 utilisateurs de démo sont sélectionnables depuis C0 et depuis la topbar ; la sidebar et la couleur d'identité changent, aucune vue non autorisée n'est accessible via l'URL
- [ ] Au moins 4 **effets croisés** fonctionnent : inscription Sana → liste Karim ; présence Sana → émargement Karim ; proposition Karim → validation Leïla → statut Karim ; paiement Leïla → W14 Karim
- [ ] Les 4 piliers Breaking News ont un écran dédié (M2/M3 CONNECT, W15 SMART, M4 SHARE, W10/P5/O7 RATE)
- [ ] **LET'S RATE! sans compétition** : aucun classement ni rang de formateur nulle part (W10, O1, O7) ; comparaison uniquement à soi-même + repère Academy anonymisé ; verbatims anonymisés ; aucune note affichée en rouge
- [ ] Le design system provient du skill `sofrecom-presentation` (bloc « Design system Sofrecom » non modifié, extensions dans un bloc séparé) ; les dérogations sont commentées
- [ ] Scénario de démo §6 (5 actes) déroulable sans rechargement
- [ ] Toggle « Pause démo » gèle la simulation temps réel
- [ ] Zéro erreur console ; ouverture en `file://` sans serveur

---

## 9. Hors périmètre (explicitement)

Authentification réelle · API / WebSockets · stockage · génération IA réelle · envoi d'e-mails / push · paiement · signature d'émargement probante · multi-langue · dark mode · tests automatisés.

---

## 10. Risques & parades

| Risque | Parade |
|---|---|
| Surcharge d'écrans → maquette illisible | Priorisation P0/P1/P2, jalons intermédiaires, un écran = une tâche principale |
| 3 rôles = 3× le périmètre | Composants partagés (C3 fiche, `.chat`, `.table`, `.gauge`) rendus avec un paramètre `role` ; Participant et Observateur limités aux écrans nécessaires au script §6 |
| Démo multi-comptes confuse pour l'audience | Couleur d'identité + avatar + pill rôle toujours visibles ; bascule annoncée par un toast « Vous êtes maintenant Leïla T. — Observateur » ; script en 5 actes |
| État partagé incohérent après bascules | `DATA` unique en mémoire, bouton « Réinitialiser la démo » dans le sélecteur d'utilisateur |
| Dérive vers du « vrai » code | Données mock uniquement, pas de formulaire réellement soumis, commentaires `// MOCK` |
| Confusion web / mobile en démo | Hub d'entrée + device frame visible pour le mobile |
| Contraste orange / lime insuffisant | Orange et lime en fonds / bordures / pastilles, texte toujours en `--blue-d` ou `--ink` |
| Le module d'évaluation est perçu comme un outil de contrôle / classement | Appliquer les principes LET'S RATE! (§2.2) : pas de leaderboard, comparaison à soi-même, verbatims anonymisés, formulation « axes de progression », validation du wording avec l'équipe formation |
| Implémenteurs qui recréent un design system parallèle | §4.1 : `sofrecom-presentation` obligatoire en L0, revue du bloc CSS à chaque jalon |

---

## 11. Questions ouvertes (à trancher avant L0)

1. Critères d'évaluation officiels **LET'S RATE!** (5 proposés : clarté, rythme, interactivité, supports, utilité terrain) et échelle (5 étoiles ? 1–10 ?) ; l'Observateur doit-il voir une vue par formateur, même en mode « accompagnement » ?
2. Nom définitif du portail web (« Sofrecom Academy Portal » ? « Trainer Hub » ?) et de l'assistant IA (« Smart Assist » proposé).
3. Logo Sofrecom officiel (SVG) à fournir pour `.sf-logo`.
4. Seuils par défaut à afficher sur la jauge d'inscrits (proposé : min 6 / max 12).
5. Noms / profils des 3 utilisateurs de démo (Sana B. · Karim M. · Leïla T. proposés) — valider ou remplacer par des personas déjà utilisés chez Sofrecom Academy.
6. Données de démo : noms fictifs génériques ou catalogue réel Sofrecom Academy (intitulés de formation) ?
7. L'Observateur valide-t-il aussi les vouchers (double validation formateur + équipe formation) ou le formateur seul (PRD §3.3) ?
8. Le Participant a-t-il accès au module Entraide (lecture seule proposée) ou LET'S SHARE! est-il réservé aux formateurs ?
9. Un deck PowerPoint de restitution (via `sofrecom-pptx`) est-il attendu en plus de la maquette HTML ?
