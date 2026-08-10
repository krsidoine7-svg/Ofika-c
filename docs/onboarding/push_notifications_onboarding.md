# 📲 Guide d'Onboarding : PWA & Push Notifications

Ce guide documente l'architecture, le cycle de vie, la stratégie de cache hors-ligne et les procédures de dépannage du système PWA et des notifications Push d'Ofika.

---

## 🗺️ Flux Visuels d'Architecture

### 1. Circuit des Notifications Push
![Flux Push](../../schemas-mermaid/processus/push-flow.svg)

### 2. Collecte des Données Analytics
![Flux Analytics](../../schemas-mermaid/processus/analytics-flow.svg)

---

## 🏗️ Architecture Technique (Web Push & VAPID)

Contrairement aux applications natives classiques, le Web Push d'Ofika repose sur le protocole standardisé **VAPID (Voluntary Application Server Identification)**.

### Les Acteurs Clés :
1. **Navigateur Client** : Enregistre le Service Worker (`sw.js`) et gère la demande de permission utilisateur.
2. **Serveur Backend (Ofika)** : Utilise la clé privée VAPID pour signer cryptographiquement les payloads de notification avant envoi.
3. **Serveur Push (Apple/Google)** : Agit comme le relais ("le facteur") qui délivre la notification au périphérique final, même si l'application ou le navigateur est fermé.

### Variables d'Environnement Requises (`.env.local`) :
* `NEXT_PUBLIC_VAPID_PUBLIC_KEY` : Transmise au navigateur pour souscrire au service de push.
* `VAPID_PRIVATE_KEY` : Clé secrète côté serveur pour authentifier l'application.

---

## 💾 Stratégie de Caching PWA & Mode Hors-ligne

La PWA d'Ofika est configurée pour fonctionner hors-ligne grâce aux règles de cache définies dans le Service Worker `public/sw.js` :

* **Cache First (Stale-While-Revalidate)** :
  - **Cible** : Images, feuilles de styles, scripts et assets statiques sous `/_next/static/`.
  - **Comportement** : Servir immédiatement depuis le cache pour un chargement instantané, tout en effectuant une mise à jour silencieuse en tâche de fond.
* **Network First** :
  - **Cible** : Documents HTML et pages dynamiques.
  - **Comportement** : Tenter d'obtenir la version la plus récente du réseau. En cas de coupure réseau (mode hors-ligne), le Service Worker sert la version en cache ou redirige vers la page d'accueil.

---

## 🔧 Résolution des Problèmes & Cas Limites

### 1. Changement de Clés VAPID (`InvalidStateError`)
Si les clés VAPID changent sur le serveur, le navigateur renvoie une erreur de type `InvalidStateError`. Le hook `usePushNotifications.ts` gère cela automatiquement :
- Détection de l'incompatibilité de clé.
- Désabonnement automatique et silencieux de l'ancienne clé obsolète.
- Réabonnement transparent de l'utilisateur avec la nouvelle clé publique.

### 2. Permissions Bloquées par l'Utilisateur
Si un utilisateur refuse accidentellement les notifications, l'interface affiche un guidage visuel lui expliquant comment réactiver l'autorisation depuis les paramètres de son navigateur (cadenas à côté de l'URL).

### 3. Limitation Spécifique à iOS (Apple Safari)
⚠️ **Important** : Sur iOS (jusqu'à iOS 16.4+), Apple n'autorise pas l'affichage de la demande de permission de notification directement depuis le navigateur Safari standard.
- **Règle** : L'utilisateur doit d'abord installer l'application sur son écran d'accueil via l'option **Partager > Ajouter à l'écran d'accueil**.
- Ce n'est qu'une fois lancée en mode autonome ("standalone") depuis l'écran d'accueil que la PWA demandera l'autorisation.

---

## 🧪 Procédure de Test

Pour valider le bon fonctionnement de la chaîne de push :
1. Rendez-vous sur votre profil Ofika en local.
2. Activez les notifications (autorisez la permission).
3. Accédez au **Dashboard Admin** ou utilisez le bouton **"S'envoyer un Test"** pour déclencher un push ciblé instantané vers votre propre navigateur.
4. Pour inspecter les cycles de vie du Service Worker, ouvrez la console Chrome (F12) -> onglet **Application** -> **Service Workers**.
