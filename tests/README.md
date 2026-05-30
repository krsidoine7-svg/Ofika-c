# 🧪 DOSSIER DE TESTS ET VÉRIFICATIONS

Ce dossier contient tous les scripts de test, de validation et de vérification pour le projet Ofika.

## 📁 Structure des dossiers

### `scripts/` - Scripts de test automatisés
- **`test-payment-integration.js`** - Test d'intégration du module paiements
- **`test-database-connection.js`** - Test de connexion à la base de données
- **`test-api-endpoints.js`** - Test des endpoints API
- **`test-webhooks.js`** - Test des webhooks Lygos

### `helpers/` - Fonctions utilitaires pour les tests
- **`test-utils.js`** - Utilitaires généraux de test
- **`mock-data.js`** - Données de test simulées
- **`database-helpers.js`** - Helpers pour les tests de base de données
- **`api-helpers.js`** - Helpers pour les tests d'API

### `fixtures/` - Données de test et exemples
- **`sample-profiles.json`** - Profils d'exemple pour les tests
- **`sample-orders.json`** - Commandes d'exemple
- **`sample-payments.json`** - Paiements d'exemple
- **`test-images/`** - Images de test pour l'upload

### `validation/` - Scripts de validation et vérification
- **`debug-database.sql`** - Script de débogage de la base de données
- **`validate-schema.sql`** - Validation du schéma de base de données
- **`check-constraints.sql`** - Vérification des contraintes
- **`performance-test.sql`** - Tests de performance

### `integration/` - Tests d'intégration complets
- **`full-user-flow.js`** - Test du flux utilisateur complet
- **`payment-flow.js`** - Test du flux de paiement complet
- **`nfc-card-creation.js`** - Test de création de cartes NFC
- **`profile-management.js`** - Test de gestion des profils

## 🚀 Comment utiliser

### 1. Tests de base de données
```bash
# Exécuter les scripts SQL de validation
psql -f tests/validation/debug-database.sql

# Ou dans Supabase SQL Editor
# Copier-coller le contenu des fichiers .sql
```

### 2. Tests d'intégration
```bash
# Installer les dépendances de test
npm install --save-dev

# Exécuter les tests
node tests/scripts/test-payment-integration.js
node tests/integration/full-user-flow.js
```

### 3. Tests d'API
```bash
# Tester les endpoints
node tests/scripts/test-api-endpoints.js

# Tester les webhooks
node tests/scripts/test-webhooks.js
```

## 📋 Checklist de tests

### Avant chaque déploiement :
- [ ] Tests de base de données passent
- [ ] Tests d'API passent
- [ ] Tests d'intégration passent
- [ ] Tests de performance acceptables
- [ ] Validation du schéma OK

### Tests quotidiens :
- [ ] Connexion base de données
- [ ] Fonctionnalités principales
- [ ] Webhooks Lygos
- [ ] Upload d'images

### Tests hebdomadaires :
- [ ] Flux utilisateur complet
- [ ] Performance générale
- [ ] Sécurité et contraintes
- [ ] Nettoyage des données

## 🔧 Configuration

### Variables d'environnement requises :
```env
# Base de données
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key

# API Lygos
LYGOS_API_KEY=your_lygos_key
LYGOS_BASE_URL=https://api.lygos.com

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Dépendances de test :
```json
{
  "devDependencies": {
    "@supabase/supabase-js": "^2.0.0",
    "jest": "^29.0.0",
    "supertest": "^6.0.0"
  }
}
```

## 📊 Rapports de test

Les tests génèrent des rapports dans :
- `tests/reports/` - Rapports HTML/JSON
- `tests/logs/` - Logs détaillés
- `tests/screenshots/` - Captures d'écran (tests UI)

## 🚨 Dépannage

### Problèmes courants :
1. **Connexion base de données** - Vérifier les variables d'environnement
2. **Tests API échouent** - Vérifier que l'application est démarrée
3. **Webhooks non reçus** - Vérifier l'URL et les headers
4. **Données de test manquantes** - Exécuter les scripts de setup

### Logs utiles :
```bash
# Logs de test
tail -f tests/logs/test.log

# Logs d'application
tail -f logs/app.log

# Logs Supabase
# Vérifier dans le dashboard Supabase
```
