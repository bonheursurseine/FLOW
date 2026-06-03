# FLOW MVP Design

## Contexte

`FLOW` est une application iPhone locale de suivi personnel, centrée sur l'energie, le stress, la fatigue, les migraines et les facteurs associes tout au long de la journee. Toutes les donnees restent stockees localement sur l'iPhone. La V1 cible `iOS 17+`, utilise `SwiftUI`, `SwiftData`, `Swift Charts` et `UserNotifications`, et reste en francais uniquement.

Le produit doit rester tres rapide a utiliser. La regle la plus importante du MVP est de ne jamais transformer la saisie en gros formulaire unique. L'application doit permettre d'ouvrir, noter, enregistrer et refermer en quelques secondes dans la plupart des cas.

## Objectif Produit

Le MVP doit permettre de :

- saisir rapidement des check-ins ultra-simples sur l'energie et le stress ;
- enregistrer des entrees spontanees modulaires par categorie ;
- consulter, filtrer, modifier et supprimer l'historique ;
- configurer des notifications locales quotidiennes pour des check-ins planifies ;
- visualiser quelques tendances utiles et prudentes ;
- generer des insights textuels simples sans pretention medicale.

Le MVP n'inclut pas :

- backend distant ;
- compte utilisateur ;
- synchronisation iCloud active ;
- export CSV actif ;
- statistiques sur les check-ins non remplis ;
- nombre total de check-ins completes comme indicateur de valeur.

## Architecture Generale

L'application repose sur une architecture simple et lisible, organisee par responsabilites :

- `Models/` pour les modeles `SwiftData`, enums, objets de configuration ;
- `Views/` pour les ecrans SwiftUI ;
- `ViewModels/` pour la logique de presentation et la validation locale ;
- `Services/` pour les notifications, calculs analytiques et insights ;
- `Utilities/` pour les helpers de formatage, mapping d'icones, agregations de date.

Le coeur de stockage est un modele unique `TrackingEntry`, suffisamment flexible pour representer les check-ins planifies et toutes les entrees spontanees sans multiplier les tables. Les horaires quotidiens de rappel sont geres dans un modele separe `CheckInSchedule`.

Cette approche est retenue car elle simplifie :

- l'historique unifie ;
- les filtres ;
- l'edition des entrees ;
- la preparation des graphiques ;
- l'ajout progressif d'analyses en V2.

## Modeles De Donnees

### TrackingEntry

Le modele `TrackingEntry` contient :

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

Contraintes metier :

- pour `entryType = checkIn`, seuls `energyScore` et `stressLevel` sont requis, `sourceType` vaut `scheduledCheckIn`, et tous les autres champs metier restent vides ;
- pour une entree spontanee, `sourceType` vaut `spontaneous`, et seuls les champs utiles a la categorie choisie sont renseignes ;
- les champs inutiles doivent etre nettoyes a l'enregistrement et a l'edition pour conserver une base coherente ;
- `timestamp` represente la date et l'heure reelles de l'evenement enregitre.

### CheckInSchedule

Le modele `CheckInSchedule` gere les horaires quotidiens configurables :

- `id`
- `time`
- `isEnabled`
- `label` optionnel si utile pour l'interface

Il sert uniquement a planifier les notifications locales et a afficher les horaires en reglages. Si les notifications sont coupees au niveau global, les horaires restent stockes mais ne sont pas programmes.

### Enums

Les enums du MVP incluent :

- `EntryType`
- `SourceType`
- `MigraineLevel`
- `CaffeineLevel`
- `PhysicalActivityLevel`
- `MealType`
- `ScreenTimeLevel`

`EntryType` contient :

- `form`
- `sleep`
- `stress`
- `mentalLoad`
- `migraine`
- `caffeine`
- `physicalActivity`
- `meal`
- `nap`
- `screenTime`
- `medication`
- `meditation`
- `notableEvent`
- `freeNote`
- `checkIn`

`SourceType` contient :

- `spontaneous`
- `scheduledCheckIn`

## Ecrans Et Navigation

La navigation principale repose sur un `TabView` a quatre onglets :

- `Noter`
- `Historique`
- `Analyse`
- `Reglages`

### HomeView

`HomeView` est l'ecran central. Il contient deux zones :

1. un bloc `Check-in rapide` avec :
   - energie de 1 a 10 ;
   - stress de 1 a 10 ;
   - bouton d'enregistrement immediat.
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

Chaque carte ouvre un formulaire dedie. Le bloc check-in rapide ne demande aucun champ supplementaire.

### EntryFormView

`EntryFormView` est un conteneur dynamique pilote par `entryType`. Il ne montre que les champs necessaires a la categorie choisie. L'interface utilise des controles rapides :

- curseurs ou pickers pour les scores 1 a 10 ;
- selecteurs segmentes ou menus pour les niveaux ;
- steppers ou saisie numerique simple pour les durees ;
- champs texte courts pour les commentaires et notes.

Chaque variante contient `Enregistrer` et `Annuler`. L'heure courante est pre-remplie. En creation spontanee, l'utilisateur n'a pas besoin de modifier la date/heure. En edition, la date/heure peut etre corrigee si necessaire.

### ScheduledCheckInView

`ScheduledCheckInView` est reserve aux check-ins planifies. Il ne contient que :

- energie ;
- stress ;
- bouton `Enregistrer`.

Il est ouvre directement depuis une notification locale ou depuis un chemin interne de l'application si besoin. Aucun autre champ ne doit apparaitre.

### HistoryView

`HistoryView` affiche toutes les entrees par ordre chronologique inverse. Chaque ligne montre :

- date ;
- heure ;
- type d'entree ;
- resume ;
- badge source : `Spontane` ou `Check-in`.

Le MVP inclut :

- filtre par type d'entree ;
- filtre par source ;
- suppression ;
- ouverture du detail.

### EntryDetailView

`EntryDetailView` affiche tous les champs pertinents pour une entree. Depuis cet ecran, l'utilisateur peut :

- consulter le detail ;
- modifier l'entree ;
- supprimer l'entree.

L'edition re-utilise le meme moteur de formulaire que la creation, avec pre-remplissage des champs existants.

### AnalyticsView

`AnalyticsView` distingue clairement :

- les tendances issues des check-ins planifies ;
- les analyses issues des entrees spontanees ;
- les cartes d'insights textuels.

La vue doit aussi gerer proprement les etats vides quand il n'y a pas assez de donnees.

### SettingsView

`SettingsView` permet de :

- activer ou desactiver les notifications ;
- ajouter un horaire de check-in ;
- modifier un horaire ;
- supprimer un horaire ;
- activer ou desactiver chaque horaire individuellement ;
- choisir les types d'entrees visibles sur l'ecran principal ;
- afficher un message clair sur la confidentialite locale ;
- afficher des sections "bientot disponible" pour l'export CSV et la synchronisation iCloud.

## Flux Utilisateur

### Entrees spontanees

1. L'utilisateur ouvre `Noter`.
2. Il touche une carte.
3. Le formulaire correspondant apparait en feuille ou ecran pousse.
4. Il remplit seulement les champs de cette categorie.
5. Il enregistre.
6. L'entree apparait dans l'historique et alimente les analyses.

### Check-in rapide

1. L'utilisateur ouvre `Noter`.
2. Il renseigne energie et stress dans le bloc rapide.
3. Il enregistre en quelques secondes.
4. L'entree creee est de type `checkIn`.

### Check-in programme

1. Une notification locale se declenche a un horaire actif.
2. L'utilisateur ouvre l'application via la notification.
3. `ScheduledCheckInView` s'affiche directement.
4. Il renseigne energie et stress.
5. L'entree est enregistree avec les metadonnees de notification.

## Notifications Locales

Le service `NotificationManager` gere :

- la demande d'autorisation ;
- la creation et la mise a jour des notifications quotidiennes ;
- la suppression des notifications obsoletes ;
- l'ouverture contextuelle vers le formulaire de check-in.

Horaires par defaut du MVP :

- `08:00`
- `12:00`
- `16:00`
- `20:00`

Exigences :

- chaque horaire peut etre active, desactive, modifie ou supprime ;
- le contenu des notifications utilise des formulations breves comme :
  - `Comment est ton energie maintenant ?`
  - `Prends 10 secondes pour ton check-in.`
  - `Energie et stress : ou en es-tu ?`
- si l'utilisateur refuse les notifications, l'app reste utilisable et `SettingsView` affiche un etat explicite avec action de reconfiguration.

## Analyses Du MVP

Le MVP ne cherche pas a couvrir toutes les analyses du cahier des charges initial. Il garde un noyau directement utile, fiable avec peu de donnees, et extensible.

### Bloc Check-ins Programmes

Analyses retenues :

- evolution de l'energie dans le temps ;
- evolution du stress dans le temps ;
- moyenne energie par heure ;
- moyenne stress par heure.

Analyses explicitement exclues du MVP :

- statistiques sur les check-ins non remplis ;
- comptage mis en avant du nombre total de check-ins completes.

### Bloc Forme

Analyses retenues :

- moyenne quotidienne ;
- tendance sur 7 jours ;
- tendance sur 30 jours ;
- moyenne par heure de la journee si les donnees suffisent.

### Bloc Sommeil, Stress Et Charge Mentale

Analyses retenues :

- comparaison forme vs duree de sommeil ;
- comparaison forme vs qualite du sommeil ;
- comparaison forme vs stress ;
- comparaison forme vs charge mentale.

### Bloc Migraine

Analyses retenues :

- frequence des migraines ;
- repartition par heure ;
- intensite moyenne ;
- comparaison migraine vs stress ;
- comparaison migraine vs cafeine.

### Bloc Meditation

Analyses retenues :

- nombre de seances par semaine ;
- duree totale par semaine ;
- duree moyenne.

Le reste des croisements demandes initialement est prepare pour la V2 mais pas obligatoire dans le MVP.

## Insights Automatiques

`InsightEngine` produit des cartes textuelles courtes, lisibles et prudentes. Les messages doivent :

- utiliser `semble` ou `pourrait etre associe a` ;
- ne jamais poser de conclusion medicale ;
- privilegier les tendances des check-ins pour les evolutions regulieres ;
- afficher un message d'insuffisance de donnees si l'echantillon est trop faible.

Exemples cibles :

- `Tu sembles plus fatiguee entre 14h et 17h.`
- `Les jours avec moins de 6h de sommeil semblent associes a une baisse d'energie.`
- `Les migraines semblent plus frequentes quand le stress est eleve.`
- `Les jours avec meditation semblent associes a un stress moyen plus faible.`

Le moteur d'insights repose sur des regles simples et transparentes, pas sur du machine learning ni sur une inference medicale.

## Design Et Experience

Le style vise :

- minimaliste ;
- moderne ;
- doux ;
- tres lisible ;
- inspire des applications Apple Sante et Journal.

L'experience doit donner envie de revenir plusieurs fois par jour. Les principes UX du MVP sont :

- priorite a la rapidite de saisie ;
- faible charge cognitive ;
- bonne lisibilite des scores et niveaux ;
- separation nette entre saisie, historique et analyse ;
- absence de jargon medical ;
- etats vides clairs et rassurants.

## Validation Et Robustesse

Le MVP inclut des validations locales simples :

- un check-in ne peut pas etre enregistre sans energie et stress ;
- une entree de migraine exige au minimum un niveau ou un score de douleur coherent ;
- les durees doivent rester positives ;
- les champs optionnels restent facultatifs ;
- les champs non pertinents au type d'entree sont vides a la sauvegarde.

Les etats d'erreur ou d'absence de donnees doivent etre traites explicitement :

- autorisation de notifications refusee ;
- aucun horaire configure ;
- aucune donnee suffisante pour un graphique ;
- historique vide ;
- filtre sans resultat.

## Strategie De Tests

Le MVP doit etre teste au minimum sur :

- creation de `TrackingEntry` par type ;
- edition et nettoyage des champs selon le type ;
- validation des formulaires ;
- creation, mise a jour et suppression des horaires de check-in ;
- transformation des horaires en notifications locales ;
- calculs principaux de `AnalyticsService` ;
- generation conditionnelle des cartes de `InsightEngine`.

Une verification manuelle est aussi prevue sur :

- fluidite de la saisie sur iPhone ;
- ouverture depuis une notification ;
- comportement des etats vides ;
- lisibilite des graphiques avec peu puis plus de donnees.

## Structure De Projet Cible

Le projet Xcode `FLOW` doit contenir au minimum :

- `FLOWApp.swift`
- `Models/TrackingEntry.swift`
- `Models/CheckInSchedule.swift`
- `Models/EntryType.swift`
- `Models/SourceType.swift`
- `Models/MigraineLevel.swift`
- `Models/CaffeineLevel.swift`
- `Models/PhysicalActivityLevel.swift`
- `Models/MealType.swift`
- `Models/ScreenTimeLevel.swift`
- `Views/HomeView.swift`
- `Views/EntryFormView.swift`
- `Views/ScheduledCheckInView.swift`
- `Views/HistoryView.swift`
- `Views/EntryDetailView.swift`
- `Views/AnalyticsView.swift`
- `Views/SettingsView.swift`
- `ViewModels/` pour la logique de saisie, historique, analyses et reglages
- `Services/NotificationManager.swift`
- `Services/AnalyticsService.swift`
- `Services/InsightEngine.swift`
- `Utilities/` pour helpers UI et date.

## Lancement Et Installation

Le livrable vise un projet Xcode ouvrable, pas seulement une collection de fichiers Swift. Le projet devra permettre :

- une ouverture directe dans Xcode ;
- l'execution sur simulateur iPhone ;
- l'installation locale sur iPhone reel via signature personnelle de developpement.

La documentation du projet devra expliquer :

- comment ouvrir et lancer le projet ;
- comment autoriser les notifications ;
- comment installer l'application sur un appareil physique ;
- quelles capacites restent reservees a une V2.

## Roadmap V2

La V2 pourra ajouter de maniere progressive :

- export CSV ;
- synchronisation iCloud ;
- davantage de croisements analytiques ;
- statistiques de regularite si elles deviennent utiles ;
- widgets iOS ;
- raffinement des insights ;
- personnalisation avancee des cartes d'accueil.
