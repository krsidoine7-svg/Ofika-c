# 🧪 Scripts de Test LyGOS

Ce dossier contient plusieurs scripts pour vérifier et tester la connexion avec l'API LyGOS.

---

## 📜 Liste des Scripts

### 1. `summary-lygos.ts` - Résumé Visuel
```bash
npx tsx scripts/summary-lygos.ts
```

**Affiche un résumé visuel clair** de la configuration LyGOS.

**Utiliser pour:**
- Avoir un aperçu rapide de l'état de la configuration
- Répondre à la question "Est-ce bien configuré ?"

---

### 2. `check-lygos-config.ts` - Vérification Rapide
```bash
npx tsx scripts/check-lygos-config.ts
```

**Vérifie uniquement** la présence des variables d'environnement.

**Utiliser pour:**
- Vérifier rapidement que les variables sont définies
- Première étape de diagnostic

**Durée:** < 1 seconde

---

### 3. `verify-lygos.ts` - Vérification Complète
```bash
npx tsx scripts/verify-lygos.ts
```

**Vérifie la configuration ET teste** la connexion à l'API LyGOS.

**Utiliser pour:**
- Vérifier que tout fonctionne de bout en bout
- Après avoir configuré les variables d'environnement
- Avant de déployer en production

**Durée:** ~5 secondes

---

### 4. `diagnose-lygos.ts` - Diagnostic Détaillé
```bash
npx tsx scripts/diagnose-lygos.ts
```

**Affiche tous les détails** de la requête et de la réponse.

**Utiliser pour:**
- Déboguer un problème de connexion
- Voir exactement ce qui est envoyé/reçu
- Comprendre une erreur

**Durée:** ~5 secondes

---

### 5. `test-lygos-urls.ts` - Test des Variations d'URL
```bash
npx tsx scripts/test-lygos-urls.ts
```

**Teste automatiquement** plusieurs variations d'URL de l'API LyGOS.

**Utiliser pour:**
- Trouver le bon endpoint si l'URL a changé
- Résoudre les erreurs 404
- Identifier l'URL qui fonctionne

**Durée:** ~10-15 secondes

---

### 6. `test-lygos-connection.ts` - Test Complet
```bash
npm run test:lygos
```

**Test de bout en bout** incluant l'endpoint local.

**Utiliser pour:**
- Test complet de l'intégration
- Vérifier l'endpoint local de l'application
- Test avant déploiement

**Durée:** ~10 secondes

---

## 🎯 Workflow Recommandé

### Première Configuration
```bash
# 1. Vérifier les variables
npx tsx scripts/check-lygos-config.ts

# 2. Tester la connexion
npx tsx scripts/verify-lygos.ts

# 3. Si erreur, diagnostic détaillé
npx tsx scripts/diagnose-lygos.ts
```

### Débogage d'une Erreur
```bash
# 1. Diagnostic détaillé
npx tsx scripts/diagnose-lygos.ts

# 2. Si erreur 404, tester les URLs
npx tsx scripts/test-lygos-urls.ts

# 3. Une fois corrigé, vérifier
npx tsx scripts/verify-lygos.ts
```

### Vérification Rapide
```bash
# Résumé visuel
npx tsx scripts/summary-lygos.ts
```

---

## 📋 Prérequis

Tous les scripts nécessitent :
- ✅ Node.js installé
- ✅ `tsx` installé (via `npm install`)
- ✅ Variables d'environnement configurées dans `.env.local`

---

## 🔐 Variables Requises

```env
LYGOS_API_KEY=votre_clé_api
LYGOS_WEBHOOK_SECRET=votre_secret_webhook
```

Variables optionnelles :
```env
LYGOS_BASE_URL=https://api.lygosapp.com
LYGOS_SHOP_NAME=Ofika
LYGOS_SUCCESS_URL=https://votre-domaine.com/payment/success
LYGOS_FAILURE_URL=https://votre-domaine.com/payment/cancelled
```

---

## 📚 Documentation Associée

- `../LYGOS_VERIFICATION_SUMMARY.md` - Résumé de vérification
- `../LYGOS_STATUS.md` - Statut complet de la configuration
- `../LYGOS_DIAGNOSTIC_REPORT.md` - Rapport de diagnostic
- `../docs/LYGOS_TESTING_GUIDE.md` - Guide de test complet

---

## 🆘 En Cas de Problème

1. **Vérifiez les variables d'environnement**
   ```bash
   npx tsx scripts/check-lygos-config.ts
   ```

2. **Diagnostic détaillé**
   ```bash
   npx tsx scripts/diagnose-lygos.ts
   ```

3. **Consultez la documentation**
   - `../docs/LYGOS_TESTING_GUIDE.md`
   - https://docs.lygosapp.com

4. **Contactez le support LyGOS**
   - Avec les détails de l'erreur du diagnostic

---

**Dernière mise à jour:** 2025-12-04
