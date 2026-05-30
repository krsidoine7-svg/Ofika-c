# Configuration Supabase Storage pour Ofika

Ce guide vous explique comment configurer Supabase Storage pour permettre l'upload d'images de profil.

## 1. Configuration des buckets

### Via l'interface Supabase

1. Connectez-vous à votre projet Supabase
2. Allez dans **Storage** dans le menu de gauche
3. Cliquez sur **New bucket**
4. Créez les buckets suivants :

#### Bucket 1: profile-images
- **Nom**: `profile-images`
- **Public**: ✅ Oui (pour permettre l'accès public aux images)
- **File size limit**: 5MB
- **Allowed MIME types**: `image/jpeg, image/png, image/gif, image/webp`

#### Bucket 2: card-designs
- **Nom**: `card-designs`
- **Public**: ✅ Oui
- **File size limit**: 10MB
- **Allowed MIME types**: `image/jpeg, image/png, image/gif, image/webp`

#### Bucket 3: temp-uploads
- **Nom**: `temp-uploads`
- **Public**: ❌ Non (privé)
- **File size limit**: 5MB
- **Allowed MIME types**: `image/jpeg, image/png, image/gif, image/webp`

### Via SQL (Alternative)

1. Allez dans **SQL Editor** dans Supabase
2. Exécutez le script `supabase-storage-setup.sql` fourni dans le projet

## 2. Configuration des politiques de sécurité

Les politiques sont automatiquement créées par le script SQL, mais vous pouvez les vérifier dans **Storage** > **Policies**.

### Politiques pour profile-images

- **Public read access**: Lecture publique des images
- **Authenticated upload**: Upload pour utilisateurs connectés
- **Owner update**: Mise à jour par le propriétaire
- **Owner delete**: Suppression par le propriétaire

## 3. Variables d'environnement

Assurez-vous que vos variables d'environnement sont correctement configurées :

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 4. Test de l'upload

1. Démarrez votre application Next.js
2. Allez dans la création/édition de profil
3. Testez l'upload d'une image
4. Vérifiez que l'image apparaît dans le bucket `profile-images`

## 5. Gestion des erreurs courantes

### Erreur: "Bucket not found"
- Vérifiez que le bucket `profile-images` existe
- Vérifiez que le nom du bucket correspond à `STORAGE_BUCKETS.PROFILE_IMAGES`

### Erreur: "Policy violation"
- Vérifiez que l'utilisateur est authentifié
- Vérifiez que les politiques de sécurité sont correctement configurées

### Erreur: "File too large"
- Vérifiez la taille du fichier (max 5MB)
- Vérifiez la configuration du bucket

## 6. Optimisation des performances

### CDN et cache
- Les images sont automatiquement mises en cache par Supabase
- Le cache est configuré à 3600 secondes (1 heure)

### Compression
- Les images sont automatiquement optimisées par Supabase
- Considérez l'ajout d'une compression côté client pour de meilleures performances

## 7. Sécurité

### Validation des fichiers
- Types MIME autorisés : JPG, PNG, GIF, WebP
- Taille maximale : 5MB
- Validation côté client et serveur

### Accès
- Images de profil : Accès public en lecture
- Uploads temporaires : Accès privé uniquement
- Authentification requise pour tous les uploads

## 8. Monitoring

### Logs
- Surveillez les logs Supabase pour détecter les erreurs d'upload
- Utilisez les métriques de stockage pour surveiller l'utilisation

### Nettoyage
- Les fichiers temporaires peuvent être nettoyés automatiquement
- Considérez l'implémentation d'un job de nettoyage périodique

## 9. Déploiement

### Production
- Configurez un CDN pour de meilleures performances
- Surveillez l'utilisation du stockage
- Implémentez des quotas d'utilisation si nécessaire

### Backup
- Configurez des sauvegardes régulières des buckets
- Considérez la réplication des données importantes
