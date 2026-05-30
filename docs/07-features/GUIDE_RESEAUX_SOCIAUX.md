# Guide: Nouvelle Fonctionnalité Réseaux Sociaux

## 🎉 Nouveauté: Liste Déroulante pour les Réseaux Sociaux

Le formulaire de création de profil a été amélioré avec une nouvelle section pour ajouter vos réseaux sociaux de manière plus intuitive.

## ✨ Fonctionnalités

### Avant
- Champs individuels pour chaque réseau social
- Difficile de voir tous les réseaux sociaux ajoutés

### Maintenant
- **Liste déroulante** avec tous les réseaux sociaux disponibles
- **Affichage numéroté** (1, 2, 3...) pour voir facilement tous vos réseaux
- **Icônes colorées** pour chaque plateforme
- **Ajout/Suppression facile** de réseaux sociaux

## 📱 Réseaux Sociaux Disponibles

1. **WhatsApp** 💬 (vert)
2. **Facebook** 📘 (bleu)
3. **Instagram** 📸 (rose)
4. **Twitter / X** 🐦 (bleu ciel)
5. **YouTube** 📺 (rouge)
6. **TikTok** 🎵 (noir)
7. **LinkedIn** 💼 (bleu foncé)
8. **Snapchat** 👻 (jaune)
9. **Telegram** ✈️ (bleu)
10. **Site Web** 🌐 (gris)

## 🚀 Comment Utiliser

### Étape 1: Accéder au Formulaire
- Allez dans "Créer un profil" ou "Modifier le profil"

### Étape 2: Ajouter un Réseau Social
1. Trouvez la section **"Réseaux Sociaux"**
2. Cliquez sur le bouton **"+ Ajouter un réseau social"**
3. Une nouvelle carte apparaît avec le numéro **1**

### Étape 3: Choisir la Plateforme
1. Cliquez sur la **liste déroulante**
2. Sélectionnez votre réseau social (ex: WhatsApp, Instagram, etc.)
3. Vous verrez l'icône colorée de la plateforme

### Étape 4: Entrer le Lien
1. Dans le champ URL, entrez le lien de votre profil
2. Exemple pour WhatsApp: `https://wa.me/237123456789`
3. Exemple pour Instagram: `https://instagram.com/votre-nom`

### Étape 5: Ajouter Plus de Réseaux
1. Cliquez à nouveau sur **"+ Ajouter un réseau social"**
2. Répétez les étapes 3 et 4
3. Chaque réseau sera numéroté: 1, 2, 3, etc.

### Étape 6: Supprimer un Réseau
- Cliquez sur l'icône **🗑️ (poubelle)** à droite du réseau à supprimer

## 💡 Conseils

### URLs Recommandées par Plateforme

**WhatsApp**
- Format: `https://wa.me/237XXXXXXXXX`
- Remplacez `237XXXXXXXXX` par votre numéro avec l'indicatif pays

**Facebook**
- Format: `https://facebook.com/votre-nom`

**Instagram**
- Format: `https://instagram.com/votre-nom`

**Twitter / X**
- Format: `https://twitter.com/votre-nom`

**YouTube**
- Format: `https://youtube.com/@votre-chaine`

**TikTok**
- Format: `https://tiktok.com/@votre-nom`

**LinkedIn**
- Format: `https://linkedin.com/in/votre-nom`

**Telegram**
- Format: `https://t.me/votre-nom`

## 🔧 Installation (Pour les Développeurs)

### 1. Exécuter la Migration SQL
Avant d'utiliser cette fonctionnalité, vous devez ajouter la colonne `social_links` à votre base de données:

1. Ouvrez Supabase SQL Editor
2. Exécutez le fichier: `database/12-social-links/add-social-links-column.sql`

### 2. Vérifier l'Installation
La migration affichera un message de confirmation dans la console SQL.

## ❓ Questions Fréquentes

**Q: Puis-je ajouter plusieurs fois le même réseau social?**
R: Oui, mais ce n'est pas recommandé. Utilisez plutôt un seul lien par plateforme.

**Q: Combien de réseaux sociaux puis-je ajouter?**
R: Il n'y a pas de limite, mais nous recommandons 3-5 réseaux pour une meilleure expérience utilisateur.

**Q: Les anciens profils sont-ils affectés?**
R: Non, les anciens profils continuent de fonctionner normalement. Cette fonctionnalité est pour les nouveaux profils ou les mises à jour.

**Q: Puis-je changer l'ordre des réseaux sociaux?**
R: Pour l'instant, l'ordre est basé sur l'ordre d'ajout. Vous pouvez supprimer et rajouter pour réorganiser.

## 📞 Support
Si vous rencontrez des problèmes, contactez le support technique.

---

**Version**: 1.0  
**Date**: Octobre 2024  
**Auteur**: Équipe Ofika
