# Mail360

Client Gmail personnel — React + Vite, déployable en site statique autonome
(GitHub → Netlify), sans backend.

## Ce qui est livré dans cette première passe

L'écran principal complet (les 5 zones décrites dans le brief) avec :

- Mode **démonstration** activé par défaut (données fictives dans
  `src/data/mockData.js`), pour que l'application soit utilisable et
  démontrable immédiatement, sans aucune configuration.
- Un adaptateur **Gmail réel** (`src/adapters/GmailAdapter.js`) qui parle
  directement à l'API REST Gmail, activable depuis les Paramètres.
- Recherche, filtres (Prioritaire / Tous / Non lus / Pièces jointes),
  regroupement par date, sélection, actions rapides au survol
  (archiver, lu/non lu, en attente, supprimer, étoile), mise à jour
  optimiste avec retour arrière et notification "Annuler".
- Panneau contextuel à trois onglets (Résumé, Tâches, Contact).
- Éditeur de réponse avec confirmation explicite avant envoi (aucun envoi
  automatique).
- Design fidèle à la maquette fournie (thème clair, accent indigo,
  rayons 12–18 px, grille 8 px, ombres très légères).
- Accessibilité de base : navigation clavier, focus visible, `aria-*`,
  respect de `prefers-reduced-motion`.
- Responsive : panneau intelligent repliable sous 1180 px, navigation en
  tiroir et vues liste/lecture successives sous 860 px.

## Deux limites importantes, à lire avant de déployer

**1. Le connecteur Gmail de Claude ne fonctionne pas ici.**
Il n'existe que dans les conversations Claude. Une fois ce site déployé sur
Netlify, la connexion à votre vraie boîte Gmail passe par votre propre
identifiant OAuth Google (voir ci-dessous) — c'est la seule méthode possible
pour un site 100 % statique. Sans cette configuration, l'application reste
en mode démonstration, clairement affiché comme tel dans l'interface (bandeau
"Mode démonstration").

**2. La création de tâches dans Nexora n'est pas câblée.**
Comme pour Gmail, le connecteur Nexora n'existe que dans les conversations
Claude. Le bouton "Créer la tâche dans Nexora" est présent dans l'UI mais
affiche une notification expliquant que l'intégration n'est pas disponible
sur ce déploiement, plutôt que de simuler une création qui n'a pas lieu.
Pour l'activer réellement, il faudrait exposer un point d'entrée HTTP
authentifié côté Nexora que ce front-end pourrait appeler — à construire
séparément si vous le souhaitez.

De la même façon, le résumé IA du panneau contextuel n'est généré que pour
les fils de démonstration (texte pré-écrit) : en mode Gmail réel, l'onglet
Résumé l'indique explicitement plutôt que d'inventer un résumé.

## Configurer la connexion Gmail réelle

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2. Créez un projet (ou réutilisez-en un), puis activez l'**API Gmail**
   (APIs & Services → Library → "Gmail API" → Enable).
3. Configurez l'écran de consentement OAuth (External, mode Test tant que
   l'app n'est pas vérifiée — ajoutez votre propre adresse Gmail comme
   utilisateur de test).
4. Créez un identifiant **OAuth 2.0 Client ID**, type "Application Web".
5. Dans "Authorized JavaScript origins", ajoutez :
   - `http://localhost:5173` (pour tester en local)
   - `https://<votre-site>.netlify.app` (votre domaine Netlify une fois déployé)
6. Copiez le Client ID (il ressemble à `xxxx.apps.googleusercontent.com`) —
   **aucun secret client n'est nécessaire** pour ce flux, uniquement le
   Client ID public.
7. Dans Mail360, ouvrez Paramètres (icône ⚙️ en bas de la barre d'icônes),
   collez le Client ID, cliquez sur "Connecter Gmail".

Le jeton d'accès obtenu n'est jamais stocké de façon persistante (pas de
`localStorage`) : il reste en mémoire le temps de la session.

## Développement local

```bash
npm install
npm run dev
```

## Déploiement — GitHub puis Netlify

```bash
git init
git add .
git commit -m "Initial commit — Mail360"
git branch -M main
git remote add origin https://github.com/qmmorel-creator/kdm-mail360.git
git push -u origin main
```

Puis sur [Netlify](https://app.netlify.com) :

1. "Add new site" → "Import an existing project" → GitHub → sélectionnez
   `kdm-mail360`.
2. Build command : `npm run build` — Publish directory : `dist`
   (déjà préconfiguré dans `netlify.toml`).
3. Déployez, notez l'URL `*.netlify.app`, puis ajoutez-la aux "Authorized
   JavaScript origins" de votre Client ID Google (étape 5 ci-dessus).

## Structure du projet

```
src/
  adapters/       # MockAdapter (démo) et GmailAdapter (API Gmail réelle) — même interface
  auth/           # Authentification Google Identity Services (OAuth client-side)
  components/     # IconRail, NavSidebar, MessageList, ReadingPane, ContextPanel, ...
  data/           # Données de démonstration
  styles/         # Tokens de design + feuille de style principale
  App.jsx         # Orchestration de l'état et des 5 zones
```

## Prochaines itérations possibles

- Pagination réelle de la liste des fils (au-delà des 25 premiers résultats).
- Virtualisation de la liste pour les très gros volumes.
- Édition de brouillons existants, transfert de pièces jointes.
- Raccourcis clavier (j/k, e, #, etc.).
- Un vrai point d'entrée pour la création de tâches Nexora.
