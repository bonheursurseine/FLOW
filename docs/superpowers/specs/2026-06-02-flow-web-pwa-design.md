# FLOW Web PWA Design

## Contexte

`FLOW` devient une application web mobile-first sous forme de `PWA` installable sur iPhone. L'objectif est de conserver l'esprit du produit initial : une saisie rapide, douce, locale et utile pour suivre l'energie, le stress, la fatigue, les migraines et les facteurs associes tout au long de la journee.

Cette version web existe pour permettre une utilisation immediate sans dependance a Xcode ni a un Mac. Elle ne cherche pas a reproduire parfaitement une app iOS native, mais a offrir une experience tres proche d'une app quotidienne installee sur l'ecran d'accueil.

La contrainte produit principale reste intacte :

- ne jamais transformer la saisie en gros formulaire unique ;
- privilegier la rapidite d'usage plusieurs fois par jour ;
- garder toutes les donnees localement ;
- ne rien envoyer a un serveur.

## Objectif Produit

Le MVP web doit permettre de :

- enregistrer un check-in rapide energie/stress ;
- enregistrer des entrees spontanees modulaires par categorie ;
- consulter, filtrer, modifier et supprimer les entrees ;
- afficher des analyses utiles dans le temps ;
- generer des insights prudents et lisibles ;
- proposer des rappels web quand l'environnement iPhone les autorise ;
- fonctionner localement, y compris en usage installe de type PWA.

Le MVP web n'inclut pas :

- backend ;
- compte utilisateur ;
- synchronisation cloud ;
- export CSV actif ;
- suivi des check-ins manques ;
- promesse de notifications aussi fiables qu'une app iOS native.

## Positionnement Securite

La V1 web doit etre tres respectueuse de la vie privee, mais sans introduire de friction a l'ouverture de l'app.

Contraintes retenues :

- aucune donnee n'est envoyee vers un serveur ;
- aucun compte n'est necessaire ;
- aucun script d'analytics ou tracker externe ;
- aucune dependance a un backend ;
- stockage local uniquement sur l'app web installee / le navigateur ;
- effacement local complet possible depuis les reglages ;
- transparence explicite dans l'interface sur la nature locale des donnees.

Choix volontaire :

- pas de PIN ;
- pas d'ecran de deverrouillage ;
- pas de friction artificielle a l'ouverture.

Le compromis assume est le suivant :

- experience tres fluide ;
- confidentialite forte au sens "rien ne sort de l'app" ;
- mais sans surcouche de verrouillage qui rendrait l'usage trop rugueux.

## Architecture Technique

Je recommande la pile suivante :

- `React`
- `TypeScript`
- `Vite`
- `IndexedDB` pour le stockage local
- `PWA` via manifeste + service worker
- `Recharts` ou equivalent leger pour les graphiques
- styles maison avec tokens CSS pour garder une identite visuelle forte et non generique

L'application sera structuree en modules lisibles, par exemple :

- `src/app/`
- `src/components/`
- `src/features/tracking/`
- `src/features/history/`
- `src/features/analytics/`
- `src/features/settings/`
- `src/services/`
- `src/storage/`
- `src/utils/`
- `src/types/`

## Donnees Et Stockage Local

La version web conserve la logique produit du modele `TrackingEntry`, mais en TypeScript.

### TrackingEntry

Champs prevus :

- `id`
- `timestamp`
- `entryType`
- `sourceType`
- `notificationId`
- `scheduledTime`
- `completedFromNotification`
- `energyScore`
- `sleepDuration`
- `sleepQuality`
- `stressLevel`
- `mentalLoad`
- `migraineLevel`
- `migrainePainScore`
- `migraineMedicationTaken`
- `migraineMedicationNote`
- `caffeineLevel`
- `physicalActivityLevel`
- `mealType`
- `napDuration`
- `screenTimeLevel`
- `medicationNote`
- `meditationDuration`
- `eventNote`
- `freeNote`
- `comment`

### CheckInSchedule

Champs prevus :

- `id`
- `time`
- `isEnabled`
- `label`

### LocalSettings

Un objet local de reglages contiendra :

- types de cartes visibles sur l'accueil ;
- statut d'installation PWA detecte ;
- statut des notifications web ;
- timestamps utiles pour UX locale ;
- preferences mineures d'affichage si besoin.

### Stockage

Le stockage local repose sur `IndexedDB`.

Raisons :

- mieux adapte qu'un simple `localStorage` ;
- plus robuste pour un historique grandissant ;
- meilleure structure pour les entrees et reglages ;
- bon support pour une PWA mobile.

Le service de stockage doit :

- encapsuler toutes les lectures/ecritures ;
- permettre les migrations futures de schema ;
- supporter l'effacement local complet ;
- garder une API simple pour les features.

## Navigation Et Experience Mobile

La navigation principale repose sur une barre basse a 4 onglets :

- `Noter`
- `Historique`
- `Analyse`
- `Reglages`

L'application est pensee `iPhone-first`.

Principes UX :

- zones tactiles confortables ;
- formulaires courts ;
- bottom sheets ou vues plein ecran mobiles pour les entrees ;
- lisibilite tres forte ;
- retour rapide a l'accueil apres enregistrement.

## Ecrans

### Noter

Ecran principal de l'app.

Contient :

1. un bloc `Check-in rapide` :
   - energie de 1 a 10 ;
   - stress de 1 a 10 ;
   - bouton d'enregistrement.
2. une grille de cartes d'entrees spontanees :
   - Forme
   - Sommeil
   - Stress
   - Charge mentale
   - Migraine
   - Cafeine
   - Activite physique
   - Repas
   - Sieste
   - Temps d'ecran
   - Medicament
   - Meditation
   - Evenement particulier
   - Note libre

Chaque carte ouvre un formulaire dedie tres court.

### Formulaire d'entree

Le formulaire est dynamique selon `entryType`.

Regles :

- uniquement les champs utiles apparaissent ;
- pas de formulaire geant ;
- enregistrement rapide ;
- date et heure pre-remplies a l'instant courant ;
- edition possible depuis l'historique.

### Historique

Affiche :

- date
- heure
- type d'entree
- resume
- badge source : `Spontane` ou `Check-in`

Fonctions :

- filtre par type d'entree ;
- filtre par source ;
- modification ;
- suppression ;
- etat vide clair.

### Detail

Affiche tous les champs utiles de l'entree.

Fonctions :

- consulter ;
- modifier ;
- supprimer.

### Analyse

Structure claire en sections :

- `Check-ins programmes`
- `Forme`
- `Sommeil, stress et charge mentale`
- `Migraine`
- `Meditation`
- `Insights`

Chaque section doit rester concise, lisible et progressive, sans ressembler a un dashboard massif.

### Reglages

Permet de :

- gerer les horaires de check-in ;
- activer/desactiver les rappels web si disponibles ;
- afficher le statut reel de compatibilite notifications ;
- choisir les cartes visibles sur l'accueil ;
- lire le message de confidentialite locale ;
- effacer toutes les donnees locales ;
- voir des sections "bientot disponible" pour export CSV et sync future ;
- comprendre comment installer la PWA sur iPhone.

## Rappels Web Sur iPhone

Le comportement des notifications web sur iPhone doit etre traite avec honnetete.

Regles produit :

- si les notifications web sont supportees et autorisees, l'app peut programmer des rappels ;
- si l'environnement ne les supporte pas, l'app doit afficher un etat explicite ;
- les horaires restent configurables meme si les notifications ne fonctionnent pas encore ;
- aucun faux sentiment de fiabilite ne doit etre donne.

Le MVP doit donc inclure :

- une detection de disponibilite des notifications ;
- une demande de permission quand possible ;
- une logique de fallback UI si indisponible ;
- un wording clair sur les limites web/iPhone.

## Analyses Du MVP

Le noyau analytique conserve l'esprit de la spec d'origine.

### Check-ins Programmes

Analyses retenues :

- evolution de l'energie ;
- evolution du stress ;
- moyenne energie par heure ;
- moyenne stress par heure.

Exclusions :

- pas de stats sur check-ins manques ;
- pas de mise en avant du nombre total de check-ins completes.

### Forme

Analyses retenues :

- moyenne quotidienne ;
- tendance 7 jours ;
- tendance 30 jours ;
- moyenne par heure si les donnees suffisent.

### Sommeil, Stress Et Charge Mentale

Analyses retenues :

- comparaison forme vs duree de sommeil ;
- comparaison forme vs qualite de sommeil ;
- comparaison forme vs stress ;
- comparaison forme vs charge mentale.

### Migraine

Analyses retenues :

- frequence ;
- repartition par heure ;
- intensite moyenne ;
- comparaison migraine vs stress ;
- comparaison migraine vs cafeine.

### Meditation

Analyses retenues :

- nombre de seances par semaine ;
- duree totale par semaine ;
- duree moyenne.

## Insights Automatiques

Le moteur d'insights doit rester simple et prudent.

Regles :

- utiliser `semble` ou `pourrait etre associe a` ;
- ne jamais formuler de conclusion medicale ;
- signaler le manque de donnees si besoin ;
- s'appuyer surtout sur les check-ins pour les tendances temporelles plus regulieres.

Exemples cibles :

- `Tu sembles plus fatiguee entre 14h et 17h.`
- `Les jours avec moins de 6h de sommeil semblent associes a une baisse d'energie.`
- `Les migraines semblent plus frequentes quand le stress est eleve.`

## Design

Direction visuelle :

- mobile-first ;
- douce ;
- moderne ;
- tres lisible ;
- pas de look web generique ;
- esprit proche d'une app journaliere intime et calme.

Principes :

- fond non plat ;
- palette calme, non medicale ;
- hierarchie typographique forte ;
- cartes et panneaux legers ;
- animations sobres et utiles ;
- excellent confort tactile.

## Capacites Hors Ligne

La PWA doit fonctionner hors ligne pour le coeur d'usage :

- ouvrir l'app ;
- enregistrer des entrees ;
- consulter l'historique deja local ;
- afficher les analyses basees sur les donnees locales ;
- utiliser les reglages locaux essentiels.

Le service worker doit prioriser :

- shell de l'app ;
- assets critiques ;
- experience stable apres installation.

## Validation Et Robustesse

Le MVP web doit gerer :

- historique vide ;
- absence de donnees analytiques ;
- indisponibilite des notifications ;
- permissions refusees ;
- suppression totale des donnees ;
- formulaires incomplets ;
- valeurs invalides.

Les champs non pertinents doivent etre vides a la sauvegarde, comme dans la logique produit initiale.

## Strategie De Tests

Le MVP web doit inclure :

- tests de logique sur le modele d'entree ;
- tests du stockage local ;
- tests des calculs analytiques ;
- tests des insights ;
- tests de validation des formulaires ;
- verifications manuelles sur iPhone ou emulateur mobile navigateur.

Verification manuelle ciblee :

- installation PWA ;
- fluidite mobile ;
- saisie rapide ;
- persistance locale ;
- etats vides ;
- statut notifications disponible / indisponible ;
- effacement local complet.

## Livrable

Le livrable vise :

- une application web installable de type PWA ;
- un projet front complet ouvrable et lancable localement ;
- une experience iPhone-first ;
- aucune dependance a un backend ;
- une base reutilisable plus tard pour une future re-implementation native SwiftUI.

## Roadmap V2

La V2 pourra ajouter :

- export CSV ;
- sync facultative ;
- rappels web mieux outilles selon support iOS ;
- croisements analytiques supplementaires ;
- widgets ou equivalent si un retour au natif se confirme ;
- parcours d'onboarding plus riche ;
- personnalisation avancee des cartes visibles.
