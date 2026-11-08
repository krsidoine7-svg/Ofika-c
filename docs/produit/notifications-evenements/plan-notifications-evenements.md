# Plan — Notifications & Événements Ofika

*Rédigé le 8 novembre 2026 · Source : `text-brute.md` (ta vision dictée) + recherches ci-dessous*

---

## 1. Ta vision, résumée

Ofika est un outil de **networking**. Les gens échangent leurs contacts surtout **pendant les événements** (conférences, salons, afterworks). Donc :

1. **Tout le monde peut recevoir des notifications** : tes clients (qui ont créé leur carte) **et** les visiteurs (qui ont scanné une carte), à condition d'avoir accepté.
2. **Des notifications automatiques** : « Vous avez reçu le numéro de X tel jour », « Ça fait X jours que vous n'avez pas recontacté X », et, subtilement, « X propose tel service ».
3. **Des notifications que tu rédiges toi-même** : citations sur le networking, messages de motivation (« L'Afrique est une terre d'opportunités »), rappels de ce que fait la carte Ofika.
4. **Un espace « Événements » dans le dashboard admin**, comme un blog : photo, description, date, lieu, programme, lien du site. Le système envoie automatiquement des rappels **un mois avant, une semaine avant, le jour J** (selon la configuration), même navigateur fermé, avec **le logo de l'organisateur**. Le clic ouvre une **page article sur Ofika** → trafic sur Ofika → nouvelles cartes créées.
5. **Adapté à la Côte d'Ivoire** : réseau parfois lent, habitudes locales.

---

## 2. Mon avis

### ✅ Ce qui est très fort
- **La logique est juste** : une personne qui scanne une carte Ofika à une conférence est, par définition, intéressée par le networking. Lui annoncer les prochains événements, c'est **pertinent**, pas du spam.
- **C'est un moteur de croissance** : chaque événement publié = une page sur Ofika qui attire du trafic (Google + partages WhatsApp) et donne envie de créer sa propre carte.
- **Tu as un avantage local** : les billetteries ivoiriennes (Tikerama, Ticket.ci, Abidjan.net Ticket…) vendent des billets, mais **aucune ne fait le lien entre l'événement et l'échange de contacts**. C'est ta place.
- **La base technique existe déjà** : Ofika a un service worker capable d'afficher des notifications, une table d'abonnements et des clés VAPID. On construit dessus, sans abonnement payant.

### ⚠️ Ce qu'il faut ajuster (mes recommandations)
| Ton idée | Le risque | Ma recommandation |
|---|---|---|
| « Plusieurs fois par jour » pour les événements | C'est la 1ʳᵉ cause de désabonnement : les gens bloquent toutes les notifications d'Ofika, y compris les utiles | **Maximum 1 notification par jour et par personne** (les événements passent en priorité), **pas entre 21 h et 8 h**, et **au maximum 3 messages éditoriaux par semaine** |
| Envoyer « à tout le monde » | Un visiteur qui a juste enregistré un contact n'a pas forcément accepté la publicité ; la loi ivoirienne exige le consentement | **Deux cases distinctes** à l'abonnement : « Rappels de mes contacts » et « Événements & conseils networking ». Désabonnement en 1 clic dans chaque notification |
| Notifications « même navigateur fermé » | Vrai sur Android et ordinateur. **Sur iPhone, seulement si le site est installé sur l'écran d'accueil** (limite d'Apple) | Guider les utilisateurs d'iPhone vers « Ajouter à l'écran d'accueil » (ce qui ouvre aussi le mode application), et garder la **cloche dans le dashboard** comme canal de secours |
| « X propose tel service » envoyé aux visiteurs | Peut être perçu comme de la pub déguisée | Uniquement si **le propriétaire l'active**, **une seule fois**, glissé dans le 2ᵉ rappel (J+7) : « Pour rappel, Awa Koné propose : aménagement d'intérieur » |
| Logo de l'organisateur dans la notification | Les icônes de notification doivent être petites et carrées | Champ « logo » obligatoire (carré, ≥ 192 px) + grande image (bannière) pour Android |

### 💡 Améliorations que je propose
1. **Bouton « Ajouter à mon agenda »** sur chaque page événement (fichier `.ics`, compatible Google Agenda et iPhone) → le téléphone rappellera l'événement même sans notification Ofika.
2. **Bouton « Partager sur WhatsApp »** sur chaque page événement : c'est le canal n°1 en Côte d'Ivoire, et chaque partage ramène du trafic.
3. **Page « Agenda networking » publique** (`/evenements`) : la liste des prochains événements, référencée sur Google → trafic gratuit et durable.
4. **Le jour J, un message utile** plutôt que publicitaire : « C'est aujourd'hui ! Pensez à votre carte Ofika pour échanger vos contacts en 1 geste. »
5. **Après l'événement (J+1)** : « Vous avez rencontré des gens hier ? Retrouvez vos nouveaux contacts sur Ofika. » → relance vers les profils.
6. **Statistiques simples dans l'admin** : envoyés / cliqués / désabonnés par campagne, pour savoir ce qui marche.

---

## 3. Recherches : ce que font les autres

| Outil | Ce que c'est | Ce qu'on peut en retenir pour Ofika |
|---|---|---|
| **Luma** (lu.ma) | Plateforme d'événements très populaire chez les startups | Rappels par e-mail, SMS et push ; alertes push en cas de changement d'heure ou de lieu ; « blasts » programmés par l'organisateur ; chaque événement fait partie d'un **calendrier auquel on s'abonne** ; synchronisation iCal → **inspiration directe pour la page événement et les rappels** |
| **Swapcard** / **Brella** | Applications de networking pour grands salons | Mise en relation des participants ; notifications envoyées par l'organisateur ; rappel push 5 min avant une session suivie ; **notifications système impossibles à désactiver** (mauvaise pratique à éviter) |
| **Popl**, **Blinq**, **HiHello** | Cartes de visite digitales (concurrents directs) | Capture de leads et **e-mails de suivi automatiques** (surtout Popl) ; **aucun ne propose de rappel push au visiteur** ni d'agenda d'événements → **différenciation possible pour Ofika** |
| **OneSignal** | Service de notifications push clé en main | Gratuit jusqu'à 10 000 abonnés par envoi, segmentation et programmation (selon les plans) ; avantage : tableau de bord prêt à l'emploi ; inconvénient : dépendance à un service externe, plans payants pour les fonctions avancées |
| **Novu** | Infrastructure de notifications open source | Regroupement de plusieurs événements en un seul message (« digest »), préférences d'abonnés, programmation → **bonnes idées à copier** (préférences, regroupement) sans forcément l'installer |
| **Tikerama**, **Ticket.ci**, **Abidjan.net Ticket**, **Teekeo** | Billetteries ivoiriennes | Elles vendent des billets (Mobile Money) mais ne font **pas de networking** → partenaires potentiels : Ofika peut relayer leurs événements et renvoyer vers leur lien d'inscription |
| **Eventbrite** | Billetterie internationale | Présente en Côte d'Ivoire mais peu utilisée pour les événements locaux |

### Faire nous-mêmes ou utiliser OneSignal ?
| Option | Avantages | Inconvénients |
|---|---|---|
| **A. Système Ofika maison** (déjà commencé) | Gratuit sans limite, données chez toi (conformité), intégré au dashboard admin, pages événements sur Ofika | Plus de développement (planificateur, statistiques) |
| **B. OneSignal** | Tableau de bord et statistiques prêts, segmentation | Données chez un tiers, limite de 10 000 par envoi en gratuit, fonctions avancées payantes, intégration à refaire |

**Recommandation : A (maison)**. La base existe déjà, le volume de départ est faible, et l'espace Événements doit de toute façon être construit dans Ofika. On pourra brancher OneSignal plus tard si le volume explose.

---

## 4. Contexte Côte d'Ivoire

| Constat | Conséquence pour Ofika |
|---|---|
| **≈ 75 % Android, ≈ 25 % iPhone** (StatCounter, 2026) | Le push « navigateur fermé » touche directement 3 utilisateurs sur 4 ; pour l'iPhone, guide d'installation sur l'écran d'accueil |
| **4G couvrant ≈ 94 % de la population**, mais **≈ 40 %** seulement de la population en ligne et des données mobiles coûteuses | Pages événements **très légères** (< 300 Ko : images compressées, pas de vidéo automatique) ; la notification elle-même pèse quelques Ko et attend que le téléphone retrouve du réseau |
| **WhatsApp omniprésent** | Bouton de partage WhatsApp sur chaque événement ; lien court et lisible (`ofika.ci/evenements/nom-evenement`) |
| **Loi n° 2013-450** sur les données personnelles, contrôlée par l'**ARTCI** : consentement et information sur la finalité ; la prospection électronique sans accord préalable est interdite (à confirmer dans le texte officiel) | Consentement explicite et séparé pour les messages éditoriaux/événements, désabonnement facile, mention dans la politique de confidentialité ; vérifier si une **déclaration auprès de l'ARTCI** est nécessaire |
| Habitudes horaires | Envois conseillés : **8 h – 9 h** (trajet) ou **12 h – 13 h** (pause) ; jamais la nuit |

---

## 5. Le catalogue des notifications

### A. Pour tes clients (propriétaires de profil) — automatiques
| Déclencheur | Message (exemple) | Ouvre |
|---|---|---|
| Quelqu'un lui envoie ses coordonnées (« Échanger ») | 🤝 Nouveau contact : Jean K. vous a laissé ses coordonnées | `/dashboard/contacts` |
| Quelqu'un enregistre son contact | 📇 Votre contact vient d'être enregistré par quelqu'un | `/dashboard` |
| Chaque lundi (s'il y a lieu) | Vous avez 3 contacts à recontacter cette semaine | `/dashboard/contacts` |

### B. Pour les visiteurs (ceux qui ont scanné une carte) — automatiques, sur accord
| Moment | Message (exemple) |
|---|---|
| **J+3** | Vous avez rencontré Awa Koné lundi. Son contact est dans votre téléphone : et si vous lui écriviez ? |
| **J+7** (dernier) | Pour rappel, Awa Koné propose : aménagement d'intérieur. *(uniquement si Awa l'a activé)* |

### C. Messages éditoriaux — rédigés par toi
Citations networking, motivation (« L'Afrique est une terre d'opportunités »), conseils pratiques, nouveautés Ofika. Audience au choix : clients, visiteurs, ou tous ceux qui ont accepté « Événements & conseils ».

### D. Événements — rédigés par toi, envoyés automatiquement
| Rappel | Message (exemple) |
|---|---|
| J-30 *(optionnel)* | 📅 Dans un mois : Abidjan Tech Summit, le 12 décembre à Cocody |
| J-7 | Plus qu'une semaine avant Abidjan Tech Summit. Inscrivez-vous |
| J-1 | C'est demain ! Préparez votre carte Ofika pour échanger vos contacts |
| Jour J (8 h) | C'est aujourd'hui 🎉 Le programme et le lieu sont ici |
| J+1 *(optionnel)* | Vous y étiez ? Retrouvez vos nouveaux contacts sur Ofika |

Chaque notification affiche **le logo de l'organisateur**, et le clic ouvre **la page de l'événement sur Ofika** (photo, description, date, lieu, programme, carte, bouton d'inscription, « Ajouter à mon agenda », « Partager sur WhatsApp »).

---

## 6. Règles pour ne pas lasser (anti-spam)

1. **1 notification maximum par jour et par personne, sans exception** (validé) ; s'il y en a plusieurs, la plus importante passe (contact > événement > éditorial).
2. **Rien entre 21 h et 8 h** (heure d'Abidjan) : les envois sont décalés au matin.
3. **3 messages éditoriaux maximum par semaine**.
4. **Préférences** : chacun choisit ses catégories (rappels de contacts / événements / conseils) et peut tout couper en 1 clic.
5. **Abonnements expirés supprimés automatiquement** (déjà prévu dans le code).

---

## 7. Les modules (découpage)

| ID | Module | Priorité | État |
|---|---|---|---|
| **M-NOT-01** | Infrastructure push (envoi, nettoyage, cloche dashboard) | Indispensable | 🟡 commencé (`lib/notifications/server.ts`) |
| **M-NOT-02** | Notifications client : nouveau contact, contact enregistré, bouton « Activer les notifications » | Indispensable | 🟡 route « Échanger » écrite, reste à brancher |
| **M-NOT-03** | Rappels visiteur J+3 et J+7 (abonnement après « Ajouter aux contacts ») | Indispensable | ⏳ migration prête (`20261108_push_visitor_reminders.sql`), à exécuter |
| **M-NOT-04** | Rappel de suivi hebdomadaire client (corrigé) | Important | ⏳ |
| **M-NOT-05** | Centre de préférences + désabonnement 1 clic + consentements séparés | Indispensable | ⏳ |
| **M-EVT-01** | Admin « Événements » (admin / super-admin uniquement) : créer / modifier / publier tout type d'événement, gratuit ou payant (photo, logo, type, description, programme, date, lieu, lien / billetterie) | Indispensable | ⏳ |
| **M-EVT-02** | Pages publiques `/evenements` et `/evenements/[slug]` (légères, partage WhatsApp, `.ics`, SEO) | Indispensable | ⏳ |
| **M-EVT-03** | Planificateur de rappels (J-30 / J-7 / J-1 / Jour J / J+1, configurable par événement) | Indispensable | ⏳ |
| **M-NOT-06** | Messages éditoriaux : rédaction, aperçu, programmation, audience | Important | ⏳ |
| **M-NOT-07** | Statistiques : envoyés, cliqués, désabonnés | Important | ⏳ |
| **M-NOT-08** | « Services » du propriétaire glissés dans le rappel J+7 (avec son accord) | Bonus | ⏳ |
| **M-NOT-09** | Relais SMS pour les gros événements (payant, via un opérateur local) | Bonus | ⏳ |

---

## 8. Comment ça marche techniquement (résumé)

**Nouvelles tables (Supabase)**
- `events` : titre, slug, organisateur, logo, image de couverture, description, programme, lieu, ville, date de début et de fin, lien externe, statut (brouillon / publié), rappels choisis (J-30, J-7…).
- `notification_campaigns` : type (événement / éditorial / automatique), titre, texte, lien, icône, audience, date prévue, date d'envoi, compteurs (envoyés, clics).
- `push_subscriptions` (existante) : ajout des **préférences** (catégories acceptées), de la date du dernier envoi (pour la règle « 1 par jour ») et des colonnes de rappel visiteur (`remind_at`, `reminded_at`, migration déjà écrite).

**Envoi automatique**
- Une tâche planifiée passe **toutes les heures**, regarde ce qui est dû (rappels d'événements, campagnes programmées, rappels visiteurs) et envoie, en respectant les règles anti-spam.
- ✅ **Décidé (offre Vercel Hobby)** : Supabase `pg_cron` déclenche **toutes les heures** un appel (`pg_net`) vers une route Ofika protégée par un secret (`/api/cron/notifications`). Cette route calcule ce qui est dû et envoie les notifications. La tâche Vercel quotidienne existante (`vercel.json`) reste en secours.
- Mise en place côté Supabase (à exécuter par toi dans le SQL Editor, script fourni au moment voulu) : activer les extensions `pg_cron` et `pg_net`, puis programmer l'appel horaire.

**Admin**
`Dashboard admin → Événements → Nouveau` : formulaire + **aperçu de la notification** telle qu'elle apparaîtra sur un téléphone + cases à cocher des rappels → « Publier ».

---

## 9. Feuille de route proposée

| Étape | Contenu | Résultat |
|---|---|---|
| **MVP 1** — base | M-NOT-01 à M-NOT-05 | Tes clients sont prévenus de chaque nouveau contact ; les visiteurs reçoivent leurs 2 rappels ; chacun gère ses préférences |
| **MVP 2** — événements | M-EVT-01 à M-EVT-03 | Tu publies un événement, Ofika le pousse automatiquement à J-30/J-7/J-1/Jour J |
| **MVP 3** — éditorial & mesure | M-NOT-06, M-NOT-07 | Citations et conseils programmés ; tu vois ce qui est lu |
| **MVP 4** — bonus | M-NOT-08, M-NOT-09 | Services des clients, relais SMS |

---

## 10. Décisions validées (8 novembre 2026)

| # | Question | Décision |
|---|---|---|
| 1 | Qui publie les événements ? | **Uniquement toi**, depuis ton compte **admin / super-admin**. Pas de soumission par les organisateurs. |
| 2 | Quels événements ? | **Tous** : conférences, hackathons, salons, afterworks, formations… **gratuits ou payants** (pour les payants, le bouton renvoie vers leur billetterie : Tikerama, Ticket.ci, etc.). |
| 3 | Fréquence | **1 seule notification par jour et par personne, sans exception**, même le jour J. Rien entre 21 h et 8 h. |
| 4 | Offre Vercel | **Hobby (gratuite)** → les tâches planifiées Vercel ne tournent qu'une fois par jour : la planification horaire passe par **Supabase `pg_cron` + `pg_net`** (gratuit), qui appelle chaque heure une route sécurisée d'Ofika. |
| 5 | Zone | **Abidjan uniquement** au lancement (pas de ciblage par ville pour l'instant ; le champ « ville » est prévu pour plus tard). |

**Conséquences sur le plan**
- **M-EVT-01** : l'espace « Événements » est réservé aux rôles admin / super-admin (protection `requireStaff` côté serveur, comme les autres routes d'administration).
- **Fiche événement** : champ « Type » (conférence, hackathon, salon, afterwork, formation, autre) + « Gratuit / Payant » + prix ou mention « Voir la billetterie ».
- **Planificateur (M-EVT-03)** : si plusieurs rappels tombent le même jour pour une même personne, un seul est envoyé (priorité : contact > événement le plus proche > éditorial).
- **Rappels d'événement** : on garde J-30, J-7, J-1 et Jour J comme options cochables, mais jamais plus d'une notification par jour et par personne.
- **Ciblage** : tous les abonnés ayant accepté « Événements & conseils », sans filtre de ville.

## Sources

- OneSignal — tarifs : [onesignal.com/blog/understanding-onesignals-pricing](https://onesignal.com/blog/understanding-onesignals-pricing)
- Novu — documentation : [docs.novu.co/platform/what-is-novu](https://docs.novu.co/platform/what-is-novu)
- Luma — types de notifications : [help.luma.com/p/notification-types](https://help.luma.com/p/notification-types) · rappels : [help.luma.com/p/update-to-reminders-on-luma](https://help.luma.com/p/update-to-reminders-on-luma)
- Swapcard — notifications par défaut : [help.swapcard.com](https://help.swapcard.com/en/articles/8159053-default-push-notifications-on-swapcard-what-to-expect) · comparatif Swapcard / Brella : [swapcard.com/compare/swapcard-vs-brella](https://wf.swapcard.com/compare/swapcard-vs-brella)
- Popl vs Blinq : [popl.co/pages/popl-vs-blinq](https://popl.co/pages/popl-vs-blinq) · HiHello vs Popl (G2) : [g2.com](https://www.g2.com/compare/hihello-vs-popl-digital-business-card-platform)
- Web push sur iPhone : [magicbell.com — PWA iOS limitations](https://www.magicbell.com/blog/pwa-ios-limitations-safari-support-complete-guide) · [pushpad.xyz — iOS requirements](https://pushpad.xyz/blog/ios-special-requirements-for-web-push-notifications)
- Loi ivoirienne sur les données : [DLA Piper — Côte d'Ivoire](https://www.dlapiperdataprotection.com/?c=CI&t=law) · [CNUCED (2016)](https://unctad.org/meetings/en/Contribution/dtl_eweek2016_ICoulibaly_fr.pdf) · [texte de la loi 2013-450 (archive ARTCI)](https://web.archive.org/web/20230616123317/https://www.autoritedeprotection.ci/docs/loi_2013_450_journal.pdf)
- Usages numériques : [DataReportal — Digital 2026 Côte d'Ivoire](https://datareportal.com/reports/digital-2026-cote-divoire) · [Ecofin — adoption des smartphones](https://www.ecofinagency.com/news-digital/1806-56575-cote-divoire-targets-rural-smartphone-adoption-to-narrow-digital-divide) · [StatCounter — OS mobiles Côte d'Ivoire](https://gs.statcounter.com/os-market-share/mobile/cote-d'ivoire/default.htm)
- Billetteries ivoiriennes : [DigitalMag — top 3 billetteries](https://digitalmag.ci/top3-des-plateformes-qui-revolutionnent-la-billetterie-evenementielle-en-cote-divoire/) · [Erooamba — comparatif 2026](https://erooamba.com/posts/plateformes-billetterie-concerts-cote-ivoire-2026)
