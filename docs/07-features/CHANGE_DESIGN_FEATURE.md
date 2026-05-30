# 🎨 Fonctionnalité : Changer le design d'un profil existant

## 📋 Vue d'ensemble

Cette fonctionnalité permet aux utilisateurs de changer le design de leur profil existant sans perdre leurs données.

---

## ✅ Ce qui a été ajouté

### 1. Nouvelle page
**Fichier** : `app/dashboard/profiles/[id]/change-design/page.tsx`

**Route** : `/dashboard/profiles/{profile_id}/change-design`

**Fonctionnalités** :
- ✅ Affichage du design actuel
- ✅ Sélection d'un nouveau design parmi les 8 disponibles
- ✅ Aperçu en temps réel avec les données existantes
- ✅ Confirmation avant changement
- ✅ Sauvegarde dans Supabase
- ✅ Sécurité : Vérification de propriété du profil

### 2. Bouton dans la liste des profils
**Fichier** : `app/dashboard/profiles/page.tsx`

**Modifications** :
- ✅ Import de l'icône `Palette`
- ✅ Ajout du callback `onChangeDesign`
- ✅ Nouveau bouton "Changer le design" dans chaque carte de profil
- ✅ Handler `handleChangeDesign` pour la navigation

---

## 🎯 Flow utilisateur

```
1. Dashboard des profils
   └─> Cliquer sur "Changer le design"

2. Page de changement de design
   ├─> Voir le design actuel
   ├─> Voir les 8 designs disponibles
   ├─> Sélectionner un nouveau design
   └─> Aperçu en temps réel avec les données existantes

3. Confirmation
   ├─> Comparaison ancien vs nouveau design
   ├─> Liste des informations conservées
   ├─> Liste des changements visuels
   └─> Boutons : Annuler / Confirmer

4. Sauvegarde
   ├─> Mise à jour dans Supabase
   ├─> Toast de succès
   └─> Redirection vers le dashboard
```

---

## 🔒 Sécurité

### Vérification de propriété

```typescript
// Vérifier que l'utilisateur est propriétaire du profil
const { data: profileData, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', profileId)
  .eq('user_id', user.id)  // ← Sécurité
  .single()
```

Si l'utilisateur n'est pas propriétaire :
- ❌ Erreur "Profil non trouvé"
- ↩️ Redirection vers `/dashboard/profiles`

---

## 💾 Données conservées

Lors du changement de design, **TOUTES** les données sont conservées :

### ✅ Informations personnelles
- Nom
- Bio
- Photo de profil
- Photo de couverture
- Email
- Téléphone
- Site web

### ✅ Identifiants
- Username
- URL personnalisée

### ✅ Réseaux sociaux
- Instagram
- Facebook
- Twitter
- YouTube
- TikTok
- LinkedIn
- WhatsApp

### ✅ Liens personnalisés
- Tous les liens custom_links
- Titres, URLs et types

### ✅ Configuration
- is_public
- is_active
- color_theme

### 🔄 Ce qui change
- **Uniquement** : `design_choice`
- **Uniquement** : `updated_at`

---

## 🎨 Interface utilisateur

### 1. Badge du design actuel
```
┌─────────────────────────────────────┐
│ Design actuel          [Classique]  │
│                                     │
│ Vous pouvez changer le design...   │
└─────────────────────────────────────┘
```

### 2. Avertissement
```
┌─────────────────────────────────────┐
│ ⚠️ Important à savoir               │
│                                     │
│ Certains designs ont des champs     │
│ spécifiques...                      │
└─────────────────────────────────────┘
```

### 3. Sélection des designs
- Réutilise le composant `TemplateSelectionStep`
- Affiche les 8 designs avec aperçu
- Aperçu en temps réel avec les données du profil

### 4. Confirmation
```
┌─────────────────────────────────────┐
│ ✅ Confirmer le changement          │
├─────────────────────────────────────┤
│ Design actuel    │ Nouveau design   │
│  [Classique]     │  [Influenceur]   │
├─────────────────────────────────────┤
│ ✅ Ces informations seront          │
│    conservées : ...                 │
│                                     │
│ 🎨 Ce qui va changer : ...          │
├─────────────────────────────────────┤
│ [Annuler]  [Confirmer le changement]│
└─────────────────────────────────────┘
```

---

## 🔧 Code technique

### Handler de changement

```typescript
const handleConfirmChange = async () => {
  try {
    // Mettre à jour uniquement le design
    const { error } = await supabase
      .from('profiles')
      .update({
        design_choice: selectedDesign,
        updated_at: new Date().toISOString()
      })
      .eq('id', profileId)

    if (error) throw error

    toast.success('Design modifié avec succès !')
    router.push('/dashboard/profiles')
    
  } catch (error) {
    toast.error('Erreur lors de la modification')
  }
}
```

### Bouton dans la carte de profil

```typescript
<Button
  variant="outline"
  size="sm"
  onClick={() => onChangeDesign(profile.id)}
  className="w-full"
>
  <Palette className="h-4 w-4 mr-1" />
  Changer le design
</Button>
```

---

## 📱 Responsive

La page est entièrement responsive :
- ✅ Mobile : Design adapté
- ✅ Tablette : Grille optimisée
- ✅ Desktop : Aperçu côte à côte

---

## ⚠️ Cas particuliers

### Design avec champs spécifiques manquants

**Exemple** : Passer de "Classique" à "E-commerce"

Le design E-commerce nécessite des `custom_links` (liens produits).

**Solution** :
1. ✅ Le changement est autorisé
2. ℹ️ Message d'information affiché
3. 📝 L'utilisateur peut ajouter les liens après via "Modifier le profil"

### Design avec réseaux sociaux manquants

**Exemple** : Passer de "Classique" à "Influenceur"

Le design Influenceur affiche Instagram, YouTube, TikTok, etc.

**Solution** :
1. ✅ Le changement est autorisé
2. 🔍 Les réseaux non remplis ne s'affichent pas
3. 📝 L'utilisateur peut les ajouter après via "Modifier le profil"

---

## 🧪 Tests

### Checklist de test

#### Accès à la page
- [ ] Bouton "Changer le design" visible dans la carte de profil
- [ ] Clic redirige vers `/dashboard/profiles/{id}/change-design`
- [ ] Page charge correctement

#### Sécurité
- [ ] Impossible d'accéder au profil d'un autre utilisateur
- [ ] Redirection si profil non trouvé
- [ ] Redirection si non authentifié

#### Sélection
- [ ] Les 8 designs s'affichent
- [ ] L'aperçu fonctionne avec les données réelles
- [ ] Le design actuel est indiqué
- [ ] Sélection d'un design affiche la confirmation

#### Confirmation
- [ ] Comparaison ancien/nouveau design
- [ ] Liste des informations conservées
- [ ] Bouton "Annuler" revient à la sélection
- [ ] Bouton "Confirmer" sauvegarde le changement

#### Sauvegarde
- [ ] Le design est mis à jour dans Supabase
- [ ] Toast de succès affiché
- [ ] Redirection vers le dashboard
- [ ] Le nouveau design s'affiche sur la page publique

---

## 🚀 Utilisation

### Pour l'utilisateur

1. **Accéder au dashboard**
   ```
   /dashboard/profiles
   ```

2. **Cliquer sur "Changer le design"**
   - Sur la carte du profil à modifier

3. **Choisir un nouveau design**
   - Voir l'aperçu en temps réel
   - Comparer avec le design actuel

4. **Confirmer le changement**
   - Vérifier les informations
   - Cliquer sur "Confirmer"

5. **Vérifier le résultat**
   - Cliquer sur "Voir" pour voir la page publique
   - Le nouveau design est appliqué

### Pour le développeur

**Ajouter un nouveau design** :

1. Créer le composant de design
2. L'ajouter dans `TemplateSelectionStep`
3. Aucune modification nécessaire dans `change-design/page.tsx`
4. Le nouveau design sera automatiquement disponible

---

## 💡 Améliorations futures

### Court terme
- [ ] Historique des changements de design
- [ ] Prévisualisation avant/après côte à côte
- [ ] Suggestions de design selon le contenu

### Moyen terme
- [ ] Personnalisation des couleurs par design
- [ ] Templates personnalisés
- [ ] Import/Export de configurations

### Long terme
- [ ] A/B testing automatique des designs
- [ ] Analytics par design
- [ ] Recommandations IA

---

## 🆘 Dépannage

### Erreur "Profil non trouvé"

**Cause** : L'utilisateur n'est pas propriétaire du profil

**Solution** : Vérifier que vous êtes connecté avec le bon compte

### Le design ne change pas

**Cause** : Erreur lors de la sauvegarde

**Solution** :
1. Vérifier la console pour les erreurs
2. Vérifier la connexion Supabase
3. Vérifier les permissions RLS

### L'aperçu ne s'affiche pas

**Cause** : Données du profil manquantes

**Solution** :
1. Vérifier que le profil a bien été chargé
2. Vérifier la console pour les erreurs
3. Rafraîchir la page

---

## 📊 Métriques

Métriques à suivre :
- Nombre de changements de design par utilisateur
- Designs les plus populaires
- Taux de satisfaction après changement
- Temps moyen pour changer de design

---

**Version** : 1.0  
**Date** : 2025-01-31  
**Statut** : ✅ Production Ready
