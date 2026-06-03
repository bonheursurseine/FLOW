# FLOW

Application locale de suivi de l'energie, du stress, de la fatigue et des facteurs associes.

Deux pistes coexistent actuellement dans ce depot :

- `flow-web/` : la PWA web iPhone-first, testable sans Mac
- `FLOW.xcodeproj` : la base native SwiftUI, gardee comme reference produit

## PWA web

La PWA `FLOW` se trouve dans `flow-web/`.

### Stack web

- React
- TypeScript
- Vite
- IndexedDB
- PWA
- Recharts

### Lancer en local

1. Ouvrir un terminal dans `flow-web/`.
2. Installer les dependances :

```powershell
npm install
```

3. Lancer le serveur de developpement :

```powershell
npm run dev -- --host 127.0.0.1 --strictPort
```

4. Ouvrir l'URL affichee par Vite dans le navigateur.

### Lancer les tests

```powershell
npm run test
```

### Construire la version de production

```powershell
npm run build
```

### Publier sur GitHub Pages

`FLOW` est maintenant preparee pour un hebergement sur `GitHub Pages`.

1. Creez un repo GitHub, par exemple `FLOW`, sous votre compte `bonheursurseine`.
2. Poussez ce dossier avec le workflow `.github/workflows/deploy-pages.yml`.
3. Dans GitHub, ouvrez `Settings > Pages`.
4. Choisissez `GitHub Actions` comme source de publication.
5. A chaque push sur `main`, GitHub construira `flow-web/` et publiera la PWA.

Le workflow detecte automatiquement le nom du repo pour calculer le bon `base path`. Vous n avez donc pas besoin de modifier le code si le repo s appelle `FLOW`, `flow`, ou autre.

### Installer la PWA sur iPhone

1. Ouvrir `FLOW` dans Safari sur l'iPhone.
2. Utiliser le bouton de partage.
3. Choisir `Sur l'ecran d'accueil`.
4. Lancer ensuite `FLOW` depuis l'icone installee.

### Rappels web

Les rappels web restent dependants du support navigateur et iOS :

- l'app detecte et affiche honnetement si les notifications web sont disponibles
- les horaires restent stockes localement meme si les rappels ne peuvent pas etre assures
- le comportement sera toujours moins fiable qu'une vraie app iOS native

## Stack

- SwiftUI
- SwiftData
- Swift Charts
- UserNotifications

## MVP actuel

- Check-ins rapides energie/stress
- Entrees spontanees modulaires par categorie
- Historique avec filtres, detail, modification et suppression
- Rappels web avec fallback honnete selon le support navigateur
- Analyses ciblees sur les check-ins, la forme, le sommeil, les migraines et la meditation
- Insights prudents, textuels et non medicaux

## Lancer l'app dans Xcode

1. Ouvrir `FLOW.xcodeproj` dans Xcode sur un Mac.
2. Selectionner le scheme `FLOW`.
3. Choisir un simulateur iPhone en `iOS 17+`.
4. Lancer avec `Cmd + R`.

## Installer sur un iPhone reel

1. Connecter l'iPhone au Mac.
2. Ouvrir `FLOW.xcodeproj`.
3. Dans `Signing & Capabilities`, choisir votre compte Apple.
4. Selectionner l'iPhone comme destination.
5. Lancer avec `Cmd + R`.
6. Autoriser les notifications lors du premier lancement.

## Confidentialite

Toutes les donnees restent stockees localement sur l'appareil :

- aucun backend
- aucun compte utilisateur
- aucune synchronisation distante
- aucun tracker externe

Sur la PWA, les donnees sont stockees localement dans le navigateur / l'app installee. Un effacement complet est disponible depuis `Reglages`.

## Verification locale

Verification web effectuee localement :

- `npm run test`
- `npm run build`

Le projet SwiftUI est toujours present, mais sa validation finale de compilation et son installation sur iPhone natif demandent toujours Xcode sur macOS.

## Roadmap V2

- Export CSV
- Synchronisation iCloud
- Croisements analytiques supplementaires
- Widgets iOS
- Personnalisation avancee de l'accueil
