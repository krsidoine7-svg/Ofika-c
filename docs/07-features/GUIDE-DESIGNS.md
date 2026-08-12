# 🎨 Guide : Comment Choisir Entre les Différents Designs

## 📋 Vue d'ensemble

Votre projet offre **9 designs de templates** pour les pages Link-in-Bio publiques :

1. **Social Creator** (`social_creator`) - Layout style Behance/Instagram pro avec cartes d'apps défilables, actions *Ajouter aux contacts* (vCard) & *WhatsApp*, et onglets *Galerie, Liens, Prix*.
2. **Design Classique** (`design1`) - Layout vertical épuré et professionnel
3. **Design Dark Elegant** (`design7`) - Mode sombre luxueux
4. **Design Influenceur** (`influencer`) - Spécialisé créateurs de contenu & réseaux
5. **Design E-commerce** (`ecommerce`) - Présentation de produits & boutique
6. **Design Freelance** (`freelance`) - Portfolio & services professionnels
7. **Design Créatif** (`design3`) - Effets visuels & glassmorphism
8. **Design Nature** (`design4`) - Couleurs éco & minimalistes
9. **Design Éléments** (`design2`) - Grille de cartes interactives

---

## 🔧 Méthodes pour Choisir le Design

### **1. Via l'Onboarding NFC (Recommandé)**

**Étape 4** de l'onboarding NFC permet de choisir le design :

```
Onboarding NFC → Étape 1: Intro
                → Étape 2: Formulaire
                → Étape 3: Design carte physique
                → Étape 4: 🎨 Design page publique ← ICI
                → Étape 5: Sélection profil
                → Étape 6: Succès
```

**Comment faire :**
1. Allez sur `http://localhost:3000/onboarding/nfc-card`
2. Complétez les étapes 1-3
3. À l'étape 4, choisissez entre :
   - **Design Classique** : Layout vertical, style professionnel
   - **Design Créatif** : Effets visuels, animations, glassmorphism
4. Cliquez sur "Voir l'aperçu" pour tester
5. Sélectionnez votre préférence et continuez

### **2. Via la Base de Données (Direct)**

Le design est stocké dans la colonne `design_choice` de la table `nfc_profiles` :

```sql
-- Voir le design actuel
SELECT id, profile_name, design_choice 
FROM nfc_profiles 
WHERE user_id = 'votre-user-id';

-- Changer le design
UPDATE nfc_profiles 
SET design_choice = 'creative'  -- ou 'classic'
WHERE id = 'votre-carte-id';
```

### **3. Via l'API (Programmatique)**

```typescript
// Changer le design via API
const response = await fetch('/api/nfc-cards/[id]', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    design_choice: 'creative' // ou 'classic'
  })
});
```

---

## 🎯 Logique d'Affichage

### **Dans le Code** (`app/[username]/page.tsx`)

```typescript
// Le système choisit automatiquement le design
const designChoice = profile.design_choice || 'classic'

if (designChoice === 'creative') {
  return <LinkInBioCreative profile={profileWithLinks} showAddToContacts={profile.is_nfc_associated} />
}

// Design classique par défaut
return <LinkInBioClassic profile={profileWithLinks} showAddToContacts={profile.is_nfc_associated} />
```

### **Valeurs Possibles**

- `'classic'` → Design Classique (par défaut)
- `'creative'` → Design Créatif
- `null` ou `undefined` → Design Classique (fallback)

---

## 🔍 Comment Vérifier le Design Actuel

### **1. Via l'Interface Utilisateur**

Visitez votre page publique : `http://localhost:3000/[votre-username]`

- **Design Classique** : Fond bleu clair, layout vertical, boutons simples
- **Design Créatif** : Fond dégradé sombre, effets glassmorphism, animations

### **2. Via la Base de Données**

```sql
-- Vérifier le design d'un profil spécifique
SELECT 
  profile_name,
  design_choice,
  CASE 
    WHEN design_choice = 'classic' THEN 'Design Classique'
    WHEN design_choice = 'creative' THEN 'Design Créatif'
    ELSE 'Design Classique (défaut)'
  END as design_label
FROM nfc_profiles 
WHERE username = 'votre-username' 
   OR custom_url = 'votre-username';
```

### **3. Via les Logs du Navigateur**

Ouvrez la console du navigateur sur votre page publique et tapez :

```javascript
// Voir les données du profil chargé
console.log(window.__PROFILE_DATA__);
```

---

## 🛠️ Changer le Design d'un Profil Existant

### **Méthode 1 : Via l'API**

```bash
# Changer vers le design créatif
curl -X PATCH "http://localhost:3000/api/nfc-cards/[carte-id]" \
  -H "Content-Type: application/json" \
  -d '{"design_choice": "creative"}'

# Changer vers le design classique
curl -X PATCH "http://localhost:3000/api/nfc-cards/[carte-id]" \
  -H "Content-Type: application/json" \
  -d '{"design_choice": "classic"}'
```

### **Méthode 2 : Via Supabase Dashboard**

1. Allez sur votre projet Supabase
2. Table Editor → `nfc_profiles`
3. Trouvez votre carte
4. Modifiez la colonne `design_choice`
5. Sauvegardez

### **Méthode 3 : Via SQL Direct**

```sql
-- Trouver votre carte
SELECT id, profile_name, design_choice 
FROM nfc_profiles 
WHERE profile_name LIKE '%votre-nom%';

-- Changer le design
UPDATE nfc_profiles 
SET design_choice = 'creative',
    updated_at = NOW()
WHERE id = 'votre-carte-id';
```

---

## 🎨 Comparaison des Designs

| Aspect | Design Classique | Design Créatif |
|--------|------------------|----------------|
| **Style** | Professionnel, épuré | Moderne, artistique |
| **Couleurs** | Bleu/indigo clair | Dégradé sombre (indigo/purple/pink) |
| **Layout** | Vertical, boutons pleine largeur | Cartes avec effets glassmorphism |
| **Animations** | Minimales | Hover, scale, pulse, bounce |
| **Utilisation** | Entreprises, professionnels | Créatifs, artistes, influenceurs |
| **Performance** | Plus rapide | Légèrement plus lourd |

---

## 🚀 Test des Designs

### **Page de Test**

Visitez `http://localhost:3000/test-linkinbio` pour :

- Voir les 2 designs côte à côte
- Tester avec/sans bouton "Ajouter aux contacts"
- Comparer les interactions
- Choisir votre préférence

### **Aperçu dans l'Onboarding**

L'onboarding NFC inclut un aperçu en temps réel :

1. Sélectionnez un design
2. Cliquez sur "Voir l'aperçu"
3. Testez les interactions
4. Fermez l'aperçu
5. Confirmez votre choix

---

## ⚡ Actions Rapides

### **Changer Tous les Profils vers Design Créatif**

```sql
UPDATE nfc_profiles 
SET design_choice = 'creative',
    updated_at = NOW()
WHERE design_choice = 'classic';
```

### **Remettre le Design Classique par Défaut**

```sql
UPDATE nfc_profiles 
SET design_choice = 'classic',
    updated_at = NOW()
WHERE design_choice = 'creative';
```

### **Voir la Répartition des Designs**

```sql
SELECT 
  design_choice,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
FROM nfc_profiles 
GROUP BY design_choice;
```

---

## 🎯 Recommandations

### **Choisissez le Design Classique si :**
- Vous êtes une entreprise/professionnel
- Vous voulez un look sobre et professionnel
- Vous préférez la simplicité
- Votre audience est corporate

### **Choisissez le Design Créatif si :**
- Vous êtes créatif/artiste/influenceur
- Vous voulez vous démarquer visuellement
- Vous aimez les effets modernes
- Votre audience est jeune et dynamique

---

## 🔧 Dépannage

### **Le design ne change pas ?**

1. Vérifiez que la colonne `design_choice` est bien mise à jour
2. Videz le cache du navigateur (Ctrl+F5)
3. Vérifiez que le profil est bien associé à une carte NFC
4. Regardez les logs de la console pour les erreurs

### **Design par défaut affiché ?**

Si vous voyez toujours le design classique :

1. Vérifiez la valeur dans `nfc_profiles.design_choice`
2. Assurez-vous que le profil vient de la table `nfc_profiles` (pas `profiles`)
3. Vérifiez que `is_nfc_associated = true`

---

**🎉 Maintenant vous savez tout sur la gestion des designs dans votre projet !**
