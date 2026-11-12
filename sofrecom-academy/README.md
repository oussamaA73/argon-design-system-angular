# Sofrecom Academy — Maquette cliquable

Maquette haute fidélité (HTML / CSS / JS vanilla, **zéro framework, zéro build**) du portail multi-rôles Sofrecom Academy et de l'app communautaire **LET'S CONNECT!**, réalisée d'après [`PLAN-maquette-Sofrecom-Academy.md`](./PLAN-maquette-Sofrecom-Academy.md).

> Ce n'est **pas** une application : données simulées (`// MOCK`), aucune authentification, aucune API.

## Ouvrir la maquette

Double-cliquer sur **`index.html`** (fonctionne en `file://`, sans serveur). Une connexion internet n'est utile que pour la police Inter. Sans elle, la police système prend le relais.

| Page | Contenu |
|---|---|
| `index.html` | Hub de démo : les 4 piliers « Breaking News », 3 profils, script de démo en 5 actes |
| `portail.html` | Portail web (C0 connexion → Participant · Formateur · Observateur) |
| `mobile.html` | App LET'S CONNECT! dans un cadre d'appareil 375×812 |

Raccourcis : `portail.html?as=karim` · `?as=sana` · `?as=leila` ouvrent directement un compte.

## Les 3 comptes de démo

| Compte | Rôle | Accueil |
|---|---|---|
| **Hbib M.** | Participant | `#/p/accueil` |
| **Mohamed K.** | Formateur (badge « En sursis ») | `#/f/dashboard` |
| **Sihem Z.** | Observateur / Équipe formation | `#/o/cockpit` |

Pour changer de compte, utiliser l'avatar de la topbar (portail) ou Profil → « Changer de compte » (mobile). L'état est **partagé** : les actions d'un rôle sont visibles chez les autres, y compris entre le portail et le mobile (`localStorage`). La commande « Réinitialiser la démo » restaure les données de départ.

Outils de démo (topbar) :
- **Scénario** (normal / alerte / vide) pour montrer les états de chaque écran.
- **Pause démo** pour geler la simulation temps réel pendant la projection.

## Architecture

```
sofrecom-academy/
├── index.html · portail.html · mobile.html
├── css/
│   ├── sofrecom.css            # Bloc « Design system Sofrecom » (tokens, composants de marque) — non modifié
│   ├── maquette.css            # Extensions maquette partagées (shell, table, gauge, modal, chat, rating…)
│   └── views-*.css · mobile.css# Extensions spécifiques par zone
└── js/
    ├── data.js                 # Jeu de données simulé (fil rouge : « Cloud & 5G — 24 nov. 2026 »)
    ├── store.js                # État partagé + mutations à effets croisés + bus d'événements
    ├── ui.js                   # Icônes SVG (Lucide-like), composants, toast / modal / drawer, chat, trend
    ├── app.js                  # Shell portail : C0, sidebar MENU[role], topbar, router hash filtré par rôle
    ├── views-common.js         # Catalogue + fiche formation (C3), CTA selon le rôle
    ├── views-formateur-before.js  # W1–W8
    ├── views-formateur-after.js   # W9–W15 (dont Smart Assist)
    ├── views-participant.js       # P1–P8
    ├── views-observateur.js       # O1–O7
    └── mobile.js                  # M1–M8
```

### Écarts assumés par rapport au plan
- **Skills Sofrecom indisponibles** dans l'environnement de réalisation (`sofrecom-presentation`, `ui-ux-pro-max`, `sofrecom-pptx`) : le bloc design system a été **reconstitué** à partir des tokens et des noms de composants du plan (§3.2, §3.5) dans `css/sofrecom.css`. À remplacer par la version officielle du skill si besoin (les noms de classes sont identiques). Le logo est un **placeholder** vectoriel (question ouverte §11 q.3).
- **Plusieurs fichiers au lieu d'un fichier unique** : le portail est découpé par zone pour permettre une réalisation en parallèle. Tout reste statique et s'ouvre en `file://`. Les données mock sont dans `js/data.js` (et non dans un `<script type="application/json">`), pour être partagées par le portail et le mobile.
- Encres de texte dérivées (`--teal-ink`, `--orange-ink`…) ajoutées pour garantir un contraste ≥ 4.5:1 sur fonds teintés.
- Dérogations commentées `/* dérogation : … */` dans le CSS (couleur d'identité des 3 comptes, accent « After » en `--green-ok`).

## Questions ouvertes (plan §11)
Hypothèses retenues en attendant arbitrage : 5 critères LET'S RATE! sur 5 étoiles, nom « Smart Assist », jauge min 6 / max 12, personas Hbib / Mohamed / Sihem, catalogue fictif, validation des vouchers par le formateur seul, Entraide en lecture seule pour le Participant, montants en TND.
