# 📚 Index des Scripts SQL - Ofika Database

## 🎯 Script Principal (À utiliser en premier)

| Fichier | Description | Usage |
|---------|-------------|-------|
| `00-COMPLETE_DATABASE_SETUP.sql` | **SCRIPT COMPLET** - Contient tout ce dont vous avez besoin | ⭐ **UTILISEZ CELUI-CI** |

## 📁 Scripts par Catégorie

### 01-setup/ - Configuration Initiale
*Dossier vide - scripts de configuration de base*

### 02-tables/ - Création des Tables
| Fichier | Description | Usage |
|---------|-------------|-------|
| `database-migration.sql` | Migration des tables avec nouveaux champs | Ajout de colonnes réseaux sociaux |

### 03-rls-policies/ - Politiques RLS
| Fichier | Description | Usage |
|---------|-------------|-------|
| `setup-rls-policies.sql` | Configuration de base des politiques RLS | Configuration initiale |
| `setup-rls-policies-fixed.sql` | Version corrigée des politiques RLS | Correction des erreurs de type |
| `setup-rls-policies-alternative.sql` | Version alternative des politiques RLS | Si les autres ne fonctionnent pas |
| `fix-rls-policies.sql` | Correction des politiques RLS | Correction des erreurs |
| `fix-rls-policies-definitive.sql` | Correction définitive des politiques RLS | **Version recommandée** |

### 04-storage/ - Configuration Storage
| Fichier | Description | Usage |
|---------|-------------|-------|
| `SETUP_STORAGE_COMPLETE.sql` | Configuration complète du storage | **Version recommandée** |
| `SETUP_STORAGE_SIMPLE.sql` | Configuration simple du storage | Version simplifiée |

### 05-functions/ - Fonctions Utilitaires
| Fichier | Description | Usage |
|---------|-------------|-------|
| `supabase-functions.sql` | Fonctions utilitaires générales | Fonctions de base |
| `supabase-rls-functions.sql` | Fonctions pour RLS | Diagnostic et test RLS |
| `supabase-storage-setup.sql` | Configuration du storage | Configuration storage |

### 06-triggers/ - Triggers et Contraintes
| Fichier | Description | Usage |
|---------|-------------|-------|
| `add-default-user-images.sql` | Trigger pour images par défaut | Images automatiques |

### 07-indexes/ - Optimisation des Index
| Fichier | Description | Usage |
|---------|-------------|-------|
| `optimize-database-performance.sql` | Optimisation des performances | Amélioration des performances |

### 08-fixes/ - Corrections et Maintenance
| Fichier | Description | Usage |
|---------|-------------|-------|
| `fix-column-lengths.sql` | Correction des longueurs de colonnes | Erreurs de longueur |
| `fix-foreign-key-indexes.sql` | Correction des index de clés étrangères | Performance des FK |
| `fix-function-search-path.sql` | Correction du chemin de recherche | Erreurs de fonction |
| `fix-image-upload-issues.sql` | Correction des problèmes d'upload | Problèmes d'images |
| `fix-payment-methods-rls.sql` | Correction RLS des méthodes de paiement | RLS paiements |
| `fix-rls-quick.sql` | Correction rapide RLS | Correction rapide |
| `fix-security-warnings.sql` | Correction des avertissements de sécurité | Sécurité |
| `fix-storage-policies-only.sql` | Correction des politiques de storage | Storage uniquement |
| `fix-storage-rls-complete.sql` | Correction complète RLS storage | Storage RLS complet |
| `fix-storage-rls.sql` | Correction RLS storage | Storage RLS |
| `sync-users-image.sql` | Synchronisation des images utilisateurs | Sync images |
| `cleanup-unused-indexes.sql` | Nettoyage des index inutilisés | Maintenance |

### 09-tests/ - Tests et Diagnostics
| Fichier | Description | Usage |
|---------|-------------|-------|
| `test-rls-functionality.sql` | Test des fonctionnalités RLS | Test RLS |
| `test-image-upload-final.sql` | Test final d'upload d'images | Test images |
| `check-table-structure.sql` | Vérification de la structure des tables | Vérification structure |
| `check-column-types.sql` | Vérification des types de colonnes | Vérification types |
| `check-unique-constraints.sql` | Vérification des contraintes uniques | Vérification contraintes |
| `check-users-image-field.sql` | Vérification du champ image utilisateurs | Vérification images |
| `verify-rls-setup.sql` | Vérification de la configuration RLS | Vérification RLS |
| `analyze-unused-indexes.sql` | Analyse des index inutilisés | Analyse index |
| `diagnose-storage-issues.sql` | Diagnostic des problèmes de storage | Diagnostic storage |
| `diagnose-uuid-types.sql` | Diagnostic des types UUID | Diagnostic UUID |

### 10-utilities/ - Utilitaires Divers
| Fichier | Description | Usage |
|---------|-------------|-------|
| `clean-rls-policies.sql` | Nettoyage des politiques RLS | Nettoyage RLS |
| `security-audit.sql` | Audit de sécurité | Audit sécurité |
| `setup-storage-bucket.sql` | Configuration des buckets de storage | Configuration buckets |

## 🚀 Guide d'Utilisation

### 1. Création Initiale
```sql
-- Utilisez ce fichier pour créer votre base de données complète
00-COMPLETE_DATABASE_SETUP.sql
```

### 2. En cas de Problème
1. **Erreurs RLS** : Utilisez `03-rls-policies/fix-rls-policies-definitive.sql`
2. **Problèmes Storage** : Utilisez `04-storage/SETUP_STORAGE_COMPLETE.sql`
3. **Problèmes d'Images** : Utilisez `08-fixes/fix-image-upload-issues.sql`

### 3. Maintenance
1. **Performance** : Utilisez `07-indexes/optimize-database-performance.sql`
2. **Nettoyage** : Utilisez les scripts dans `08-fixes/`
3. **Tests** : Utilisez les scripts dans `09-tests/`

## ⚠️ Notes Importantes

- **Toujours commencer** par le script principal `00-COMPLETE_DATABASE_SETUP.sql`
- **Sauvegarder** avant d'exécuter des scripts de modification
- **Tester** d'abord sur un environnement de développement
- **Vérifier** les résultats après chaque exécution

## 📞 Support

En cas de problème :
1. Consultez les scripts de diagnostic dans `09-tests/`
2. Utilisez les scripts de correction dans `08-fixes/`
3. Vérifiez les logs d'erreur dans Supabase
