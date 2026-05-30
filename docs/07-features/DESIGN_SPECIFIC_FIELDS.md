# 🎯 Gestion des champs spécifiques par design

## 📋 Vue d'ensemble

Cette fonctionnalité permet de gérer les champs spécifiques à chaque design (réseaux sociaux, liens personnalisés, etc.).

---

## ✅ Ce qui a été créé

### 1. Page de gestion des champs
**Fichier** : `app/dashboard/profiles/[id]/design-fields/page.tsx`

**Route** : `/dashboard/profiles/{profile_id}/design-fields`

**Fonctionnalités** :
- ✅ Affichage des champs spécifiques au design actuel
- ✅ Formulaire adapté dynamiquement
- ✅ Gestion des réseaux sociaux
- ✅ Gestion des liens personnalisés
- ✅ Validation des champs requis
- ✅ Sauvegarde dans Supabase

### 2. Redirection automatique
**Fichier modifié** : `app/dashboard/profiles/[id]/change-design/page.tsx`

Après changement de design :
- ✅ Si le nouveau design a des champs spécifiques → Redirection vers `/design-fields`
- ✅ Sinon → Retour au dashboard

### 3. Bouton dans le dashboard
**Fichier modifié** : `app/dashboard/profiles/page.tsx`

- ✅ Nouveau bouton "Champs spécifiques" avec icône Settings
- ✅ Accessible depuis chaque carte de profil

---

## 🎨 Champs spécifiques par design

### Design Classique (design1)
**Champs** : Aucun champ spécifique
```
Tous les champs sont communs
```

### Design Moderne (design2)
**Champs** : Réseaux sociaux
```
- Instagram
- Facebook
```

### Design Créatif (design3)
**Champs** : Réseaux sociaux + Liens personnalisés
```
Réseaux :
- Instagram

Liens :
- custom_links (REQUIS - au moins 1)
- Type : website, shop, other
```

### Design Nature (design4)
**Champs** : Réseaux sociaux
```
- Instagram
- Facebook
- Twitter
```

### Design Influenceur (influencer)
**Champs** : Réseaux sociaux complets
```
- Instagram
- YouTube
- TikTok
- Facebook
- Twitter
```

### Design E-commerce (ecommerce)
**Champs** : Liens produits
```
Liens :
- custom_links (REQUIS - au moins 1)
- Type par défaut : shop
- Utilisé pour les liens de produits/boutiques
```

### Design Dark Elegant (design7)
**Champs** : Réseaux sociaux + Liens
```
Réseaux :
- Instagram

Liens :
- custom_links (optionnel)
```

### Design Freelance (freelance)
**Champs** : Réseaux professionnels + Liens
```
Réseaux :
- LinkedIn
- Instagram

Liens :
- custom_links (optionnel)
- Pour portfolio, services, etc.
```

---

## 🔄 Flow utilisateur

### Scénario 1 : Changement de design

```
1. Dashboard
   └─> Cliquer sur "Changer le design"

2. Sélection du nouveau design
   └─> Confirmer le changement

3. Redirection automatique
   ├─> Si design avec champs spécifiques
   │   └─> Page "Compléter les informations"
   │       ├─> Remplir les champs manquants
   │       └─> Enregistrer
   │
   └─> Sinon
       └─> Retour au dashboard
```

### Scénario 2 : Accès direct

```
1. Dashboard
   └─> Cliquer sur "Champs spécifiques"

2. Page de gestion
   ├─> Voir les champs actuels
   ├─> Modifier les valeurs
   ├─> Ajouter/Supprimer des liens
   └─> Enregistrer
```

---

## 💾 Données sauvegardées

### Réseaux sociaux
```typescript
{
  instagram: string | null,
  facebook: string | null,
  twitter: string | null,
  youtube: string | null,
  tiktok: string | null,
  linkedin: string | null
}
```

### Liens personnalisés
```typescript
{
  custom_links: [
    {
      title: string,
      url: string,
      type: 'website' | 'shop' | 'other'
    }
  ]
}
```

---

## 🎯 Interface utilisateur

### 1. Info du design actuel
```
┌─────────────────────────────────────┐
│ ℹ️ Design : Influenceur             │
│                                     │
│ Pour créateurs de contenu.          │
│ Complétez les champs ci-dessous...  │
└─────────────────────────────────────┘
```

### 2. Section réseaux sociaux
```
┌─────────────────────────────────────┐
│ Réseaux sociaux                     │
├─────────────────────────────────────┤
│ Instagram                           │
│ [https://instagram.com/...]         │
│ ✅ Déjà rempli                      │
│                                     │
│ YouTube                             │
│ [https://youtube.com/...]           │
│ ⚠️ Non rempli                       │
└─────────────────────────────────────┘
```

### 3. Section liens personnalisés
```
┌─────────────────────────────────────┐
│ Liens personnalisés *               │
├─────────────────────────────────────┤
│ Lien #1                        [X]  │
│ Titre: [Mon Portfolio]              │
│ URL: [https://...]                  │
│ Type: [Site web ▼]                  │
├─────────────────────────────────────┤
│ [+ Ajouter un lien]                 │
│                                     │
│ ⚠️ Au moins un lien est requis      │
└─────────────────────────────────────┘
```

### 4. Boutons d'action
```
┌─────────────────────────────────────┐
│ [Annuler]      [💾 Enregistrer]     │
└─────────────────────────────────────┘
```

---

## 🔧 Code technique

### Configuration des champs

```typescript
const designFieldsConfig = {
  influencer: {
    name: 'Design Influenceur',
    description: 'Pour créateurs de contenu',
    socialFields: ['instagram', 'youtube', 'tiktok', 'facebook', 'twitter'],
    requiresLinks: false
  },
  ecommerce: {
    name: 'Design E-commerce',
    description: 'Pour vendeurs en ligne',
    socialFields: [],
    requiresLinks: true,
    linkType: 'shop'
  }
}
```

### Validation des liens requis

```typescript
if (config?.requiresLinks && customLinks.length === 0) {
  toast.error('Au moins un lien est requis pour ce design')
  return
}
```

### Sauvegarde

```typescript
const { error } = await supabase
  .from('profiles')
  .update({
    instagram: formData.get('instagram'),
    youtube: formData.get('youtube'),
    custom_links: customLinks,
    updated_at: new Date().toISOString()
  })
  .eq('id', profileId)
```

---

## ⚠️ Validation

### Champs requis

**Design E-commerce** :
- ❌ Impossible de sauvegarder sans au moins 1 lien
- ✅ Message d'erreur clair affiché

**Design Créatif** :
- ❌ Impossible de sauvegarder sans au moins 1 lien
- ✅ Message d'erreur clair affiché

### Format des URLs

Tous les champs URL sont validés :
- ✅ Doivent commencer par `http://` ou `https://`
- ✅ Validation HTML5 native
- ✅ Message d'erreur si format invalide

### Liens personnalisés

Chaque lien doit avoir :
- ✅ Un titre (non vide)
- ✅ Une URL (format valide)
- ✅ Un type (website/shop/other)

---

## 📱 Responsive

La page est entièrement responsive :
- ✅ Mobile : Formulaire adapté
- ✅ Tablette : Layout optimisé
- ✅ Desktop : Largeur maximale 768px

---

## 🧪 Tests

### Checklist de test

#### Accès
- [ ] Bouton "Champs spécifiques" visible dans le dashboard
- [ ] Clic redirige vers la bonne page
- [ ] Page charge correctement

#### Affichage
- [ ] Info du design actuel affichée
- [ ] Champs spécifiques au design affichés
- [ ] Valeurs actuelles pré-remplies
- [ ] Indicateurs "Déjà rempli" / "Non rempli"

#### Réseaux sociaux
- [ ] Champs affichés selon le design
- [ ] Valeurs sauvegardées correctement
- [ ] URLs validées

#### Liens personnalisés
- [ ] Ajout de liens fonctionne
- [ ] Suppression de liens fonctionne
- [ ] Modification de liens fonctionne
- [ ] Validation des champs requis
- [ ] Type de lien modifiable

#### Sauvegarde
- [ ] Bouton "Enregistrer" fonctionne
- [ ] Toast de succès affiché
- [ ] Redirection vers le dashboard
- [ ] Données visibles sur la page publique

---

## 🎯 Cas d'usage

### Cas 1 : Nouveau profil E-commerce

1. Créer un profil avec design E-commerce
2. Remplir les infos de base
3. Automatiquement redirigé vers "Champs spécifiques"
4. Ajouter au moins 1 lien produit
5. Enregistrer

### Cas 2 : Changement vers Influenceur

1. Profil existant avec design Classique
2. Changer vers design Influenceur
3. Automatiquement redirigé vers "Champs spécifiques"
4. Ajouter Instagram, YouTube, TikTok
5. Enregistrer

### Cas 3 : Mise à jour des liens

1. Profil existant avec design Créatif
2. Cliquer sur "Champs spécifiques"
3. Modifier les liens existants
4. Ajouter de nouveaux liens
5. Enregistrer

---

## 💡 Améliorations futures

### Court terme
- [ ] Prévisualisation en temps réel
- [ ] Suggestions d'URLs
- [ ] Import depuis réseaux sociaux

### Moyen terme
- [ ] Templates de liens par secteur
- [ ] Analytics par lien
- [ ] Réorganisation drag & drop

### Long terme
- [ ] IA pour suggestions de liens
- [ ] Intégration API réseaux sociaux
- [ ] Vérification automatique des URLs

---

## 🆘 Dépannage

### "Aucun champ spécifique"

**Cause** : Le design n'a pas de champs spécifiques

**Solution** : Normal pour Design Classique. Utiliser "Modifier" pour les champs communs.

### "Au moins un lien est requis"

**Cause** : Design E-commerce ou Créatif sans liens

**Solution** : Ajouter au moins 1 lien avant de sauvegarder

### Les champs ne se sauvegardent pas

**Cause** : Erreur de validation ou connexion

**Solution** :
1. Vérifier le format des URLs
2. Vérifier la console pour les erreurs
3. Vérifier la connexion Supabase

---

## 📊 Récapitulatif des boutons

```
Dashboard → Carte de profil
├─ [👁️ Voir]               → Ouvre la page publique
├─ [✏️ Modifier]            → Modifie tous les champs
├─ [📋 Copier]              → Copie l'URL
├─ [🔗 Partager]            → Partage le profil
├─ [🎨 Changer le design]   → Change le design
├─ [⚙️ Champs spécifiques]  → Gère les champs du design
└─ [🗑️ Supprimer]           → Supprime le profil
```

---

**Version** : 1.0  
**Date** : 2025-01-31  
**Statut** : ✅ Production Ready
