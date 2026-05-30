# 🧪 Guide de Test de la Connexion LyGOS

Ce guide vous aide à vérifier et tester la connexion entre votre application Ofika et l'API LyGOS.

---

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir :

1. ✅ Un compte LyGOS actif
2. ✅ Une clé API LyGOS (`LYGOS_API_KEY`)
3. ✅ Un secret webhook LyGOS (`LYGOS_WEBHOOK_SECRET`)
4. ✅ Les variables d'environnement configurées dans `.env.local`

---

## 🚀 Scripts de Test Disponibles

### 1. Vérification Rapide de la Configuration

```bash
npx tsx scripts/check-lygos-config.ts
```

**Ce script vérifie :**
- ✅ Présence des variables d'environnement requises
- ✅ Format des variables optionnelles
- ⚡ Exécution rapide (< 1 seconde)

**Utiliser quand :**
- Vous venez de configurer les variables d'environnement
- Vous voulez vérifier rapidement la configuration

---

### 2. Test Complet de Connexion

```bash
npm run test:lygos
```

**Ce script teste :**
- ✅ Configuration des variables d'environnement
- ✅ Connexion à l'API LyGOS (requête réelle)
- ✅ Endpoint local de l'application
- ⏱️ Exécution : ~5-10 secondes

**Utiliser quand :**
- Vous voulez vérifier que tout fonctionne de bout en bout
- Vous avez modifié la configuration
- Vous déployez en production

---

### 3. Diagnostic Détaillé

```bash
npx tsx scripts/diagnose-lygos.ts
```

**Ce script affiche :**
- 🔍 Configuration complète (avec masquage des secrets)
- 📤 Détails de la requête envoyée
- 📥 Réponse complète de l'API (headers + body)
- 💡 Suggestions de correction en cas d'erreur

**Utiliser quand :**
- Vous avez une erreur et voulez comprendre pourquoi
- Vous déboguez un problème de connexion
- Vous voulez voir exactement ce qui est envoyé/reçu

---

### 4. Test des Variations d'URL

```bash
npx tsx scripts/test-lygos-urls.ts
```

**Ce script teste :**
- 🔗 Plusieurs variations d'URL de l'API LyGOS
- ✅ Identifie automatiquement l'URL qui fonctionne
- 📊 Affiche les résultats pour chaque variation

**Utiliser quand :**
- L'URL de base de l'API a changé
- Vous obtenez des erreurs 404
- Vous voulez trouver le bon endpoint

---

## 📝 Configuration des Variables d'Environnement

Créez un fichier `.env.local` à la racine du projet avec :

```env
# =====================================================
# CONFIGURATION LYGOS (REQUISE)
# =====================================================

# Clé API LyGOS (obligatoire)
LYGOS_API_KEY=votre_clé_api_lygos

# Secret pour la vérification des webhooks (obligatoire)
LYGOS_WEBHOOK_SECRET=votre_secret_webhook

# =====================================================
# CONFIGURATION LYGOS (OPTIONNELLE)
# =====================================================

# URL de base de l'API LyGOS (par défaut: https://api.lygosapp.com)
LYGOS_BASE_URL=https://api.lygosapp.com

# Nom de votre boutique LyGOS (par défaut: Ofika)
LYGOS_SHOP_NAME=Ofika

# URLs de redirection après paiement
LYGOS_SUCCESS_URL=https://votre-domaine.com/payment/success
LYGOS_FAILURE_URL=https://votre-domaine.com/payment/cancelled

# =====================================================
# CONFIGURATION APPLICATION
# =====================================================

# URL de votre application
NEXT_PUBLIC_APP_URL=https://votre-domaine.com
```

---

## 🔍 Résultats des Tests

### ✅ Test Réussi

Si tout fonctionne, vous verrez :

```
✅ SUCCÈS: La connexion avec LyGOS fonctionne correctement!

Vous pouvez maintenant utiliser LyGOS pour les paiements.
```

### ❌ Test Échoué

Si le test échoue, vous verrez des messages d'erreur détaillés :

#### Erreur 401 - Unauthorized
```
❌ Erreur HTTP 401
💡 Suggestion: Vérifiez votre LYGOS_API_KEY
```
**Solution :** Vérifiez que votre clé API est correcte et active.

#### Erreur 404 - Not Found
```
❌ Erreur HTTP 404
💡 Suggestion: Vérifiez LYGOS_BASE_URL
```
**Solution :** L'endpoint API a peut-être changé. Utilisez le script `test-lygos-urls.ts` pour trouver la bonne URL.

#### Erreur 403 - Forbidden
```
❌ Erreur HTTP 403
💡 Suggestion: Vérifiez les permissions de votre clé API
```
**Solution :** Contactez le support LyGOS pour vérifier les permissions de votre compte.

#### Erreur 400 - Bad Request
```
❌ Erreur HTTP 400
💡 Suggestion: Vérifiez le format des données envoyées
```
**Solution :** Le format de la requête ne correspond pas à ce que l'API attend. Consultez la documentation LyGOS.

---

## 🐛 Débogage

### Problème : Variables d'environnement non chargées

**Symptôme :** Le script dit que les variables ne sont pas définies alors qu'elles sont dans `.env.local`

**Solutions :**
1. Vérifiez que le fichier s'appelle bien `.env.local` (pas `.env.local.txt`)
2. Redémarrez votre terminal
3. Vérifiez qu'il n'y a pas d'espaces autour du `=` dans le fichier

### Problème : Erreur de connexion réseau

**Symptôme :** `ENOTFOUND` ou `ECONNREFUSED`

**Solutions :**
1. Vérifiez votre connexion internet
2. Vérifiez que vous n'êtes pas derrière un proxy/firewall
3. Essayez avec un VPN si nécessaire

### Problème : Timeout

**Symptôme :** La requête prend trop de temps et timeout

**Solutions :**
1. Vérifiez votre connexion internet
2. Réessayez plus tard (le serveur LyGOS peut être surchargé)
3. Augmentez le timeout dans `lib/services/lygos-api.ts`

---

## 📚 Ressources

- **Documentation LyGOS :** https://docs.lygosapp.com
- **Code de l'intégration :** `lib/services/lygos-api.ts`
- **Route API locale :** `app/api/payments/lygos/create/route.ts`
- **Rapport de diagnostic :** `LYGOS_DIAGNOSTIC_REPORT.md`

---

## 🆘 Support

Si vous rencontrez des problèmes :

1. **Consultez le rapport de diagnostic :** `LYGOS_DIAGNOSTIC_REPORT.md`
2. **Exécutez le diagnostic détaillé :** `npx tsx scripts/diagnose-lygos.ts`
3. **Contactez le support LyGOS :** Avec les détails de l'erreur
4. **Vérifiez la documentation :** https://docs.lygosapp.com

---

## ✨ Prochaines Étapes

Une fois que les tests passent avec succès :

1. ✅ Testez la création d'une commande dans l'application
2. ✅ Testez le flux de paiement complet
3. ✅ Configurez les webhooks pour les notifications de paiement
4. ✅ Testez en environnement de production

---

**Dernière mise à jour :** 2025-12-04  
**Version :** 1.0.0
