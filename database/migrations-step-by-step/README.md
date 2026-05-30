# Migrations Base de Données - Étapes par Étapes

Ce dossier contient les migrations SQL organisées par étapes pour faciliter la configuration de votre base de données Supabase.

## 🚀 Comment utiliser ces migrations

### Option 1: Migration complète (recommandée pour un nouveau projet)
Si vous créez une nouvelle base de données, utilisez le fichier `00-COMPLETE_DATABASE_SETUP.sql` dans le dossier parent.

### Option 2: Migration étape par étape (recommandée pour la maintenance)
Si vous devez reprendre votre base de données ou corriger des problèmes spécifiques, suivez ces étapes dans l'ordre :

## 📋 Ordre d'exécution des migrations

### 1. Création des tables
```sql
-- Exécutez: 01-create-tables.sql
```
Crée toutes les tables principales de l'application.

### 2. Optimisation des performances
```sql
-- Exécutez: 02-create-indexes.sql
```
Ajoute les index nécessaires pour optimiser les performances.

### 3. Activation de la sécurité
```sql
-- Exécutez: 03-enable-rls.sql
```
Active Row Level Security sur toutes les tables.

### 4. Configuration des politiques de sécurité
```sql
-- Exécutez: 04-create-rls-policies.sql
```
Définit les règles de sécurité pour chaque table.

### 5. Configuration du stockage
```sql
-- Exécutez: 05-setup-storage.sql
```
Configure les buckets Supabase pour les images.

### 6. Création des fonctions utilitaires
```sql
-- Exécutez: 06-create-functions.sql
```
Crée les fonctions nécessaires au fonctionnement de l'application.

### 7. Configuration des triggers
```sql
-- Exécutez: 07-create-triggers.sql
```
Configure les triggers pour automatiser certaines tâches.

### 8. Vérification finale
```sql
-- Exécutez: 08-final-verification.sql
```
Vérifie que tout a été configuré correctement.

## 🔧 Instructions d'utilisation

1. **Ouvrez l'éditeur SQL de Supabase** dans votre dashboard
2. **Copiez le contenu** du fichier de migration que vous voulez exécuter
3. **Collez-le dans l'éditeur** SQL
4. **Exécutez le script** en cliquant sur "Run"
5. **Vérifiez les résultats** dans la console
6. **Passez à l'étape suivante** si tout s'est bien passé

## ⚠️ Important

- **Exécutez les migrations dans l'ordre** (01, 02, 03, etc.)
- **Ne sautez pas d'étapes** car certaines dépendent des précédentes
- **Vérifiez les erreurs** avant de passer à l'étape suivante
- **Sauvegardez votre base de données** avant de commencer les migrations

## 🆘 En cas de problème

Si une migration échoue :

1. **Vérifiez les erreurs** dans la console Supabase
2. **Consultez les logs** pour comprendre le problème
3. **Corrigez le problème** avant de continuer
4. **Reprenez à l'étape** où vous vous êtes arrêté

## 📞 Support

Si vous rencontrez des problèmes, consultez :
- La documentation Supabase
- Les logs d'erreur dans votre dashboard
- Le fichier `00-COMPLETE_DATABASE_SETUP.sql` pour une vue d'ensemble

## ✅ Vérification finale

Après avoir exécuté toutes les migrations, vous devriez voir :
- ✅ Toutes les tables créées
- ✅ RLS activé sur toutes les tables
- ✅ Politiques de sécurité configurées
- ✅ Buckets de stockage créés
- ✅ Fonctions et triggers en place
- ✅ Index optimisés

Votre base de données est maintenant prête pour l'application Ofika !
