# 🗄️ Dossier Database - Ofika

Ce dossier contient tous les scripts SQL organisés de manière structurée pour la base de données Ofika.

## 📁 Structure du Dossier

```
database/
├── 00-COMPLETE_DATABASE_SETUP.sql    # ⭐ SCRIPT PRINCIPAL - À UTILISER EN PREMIER
├── 01-setup/                         # Scripts de configuration initiale
├── 02-tables/                        # Scripts de création des tables
├── 03-rls-policies/                  # Scripts des politiques RLS
├── 04-storage/                       # Scripts de configuration du storage
├── 05-functions/                     # Fonctions utilitaires
├── 06-triggers/                      # Triggers et contraintes
├── 07-indexes/                       # Scripts d'optimisation des index
├── 08-fixes/                         # Scripts de correction
├── 09-tests/                         # Scripts de test et diagnostic
├── 10-utilities/                     # Scripts utilitaires divers
└── README.md                         # Ce fichier
```

## 🚀 Démarrage Rapide

### Pour créer votre base de données complète :

1. **Copiez et collez** le contenu de `00-COMPLETE_DATABASE_SETUP.sql` dans l'éditeur SQL de Supabase
2. **Exécutez le script** - il contient tout ce dont vous avez besoin
3. **Vérifiez les résultats** à la fin du script

### Pour des modifications spécifiques :

Utilisez les scripts dans les dossiers appropriés selon vos besoins.

## 📋 Description des Dossiers

### 01-setup/
Scripts de configuration initiale et de base.

### 02-tables/
- `database-migration.sql` - Migration des tables avec les nouveaux champs

### 03-rls-policies/
- `setup-rls-policies.sql` - Configuration des politiques RLS
- `setup-rls-policies-fixed.sql` - Version corrigée des politiques RLS
- `fix-rls-policies-definitive.sql` - Correction définitive des politiques RLS

### 04-storage/
- `SETUP_STORAGE_COMPLETE.sql` - Configuration complète du storage
- `SETUP_STORAGE_SIMPLE.sql` - Configuration simple du storage

### 05-functions/
- `supabase-functions.sql` - Fonctions utilitaires Supabase
- `supabase-rls-functions.sql` - Fonctions RLS
- `supabase-storage-setup.sql` - Configuration du storage

### 06-triggers/
- `add-default-user-images.sql` - Trigger pour les images par défaut

### 07-indexes/
- `optimize-database-performance.sql` - Optimisation des performances

### 08-fixes/
Scripts de correction et de maintenance :
- `fix-*.sql` - Corrections diverses
- `cleanup-*.sql` - Nettoyage
- `sync-*.sql` - Synchronisation

### 09-tests/
Scripts de test et diagnostic :
- `test-*.sql` - Tests de fonctionnalité
- `check-*.sql` - Vérifications
- `analyze-*.sql` - Analyses
- `diagnose-*.sql` - Diagnostics
- `verify-*.sql` - Vérifications

### 10-utilities/
Scripts utilitaires divers et scripts de maintenance.

## ⚠️ Important

- **Toujours commencer** par `00-COMPLETE_DATABASE_SETUP.sql`
- **Sauvegarder** votre base de données avant d'exécuter des scripts de modification
- **Tester** d'abord sur un environnement de développement
- **Vérifier** les résultats après chaque exécution

## 🔧 Utilisation

1. **Création initiale** : Utilisez `00-COMPLETE_DATABASE_SETUP.sql`
2. **Modifications** : Utilisez les scripts spécifiques dans les dossiers appropriés
3. **Maintenance** : Utilisez les scripts dans `08-fixes/` et `09-tests/`

## 📞 Support

En cas de problème, vérifiez :
1. Les logs d'erreur dans Supabase
2. Les scripts de diagnostic dans `09-tests/`
3. Les scripts de correction dans `08-fixes/`
