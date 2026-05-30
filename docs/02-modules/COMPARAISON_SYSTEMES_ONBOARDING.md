# 📊 Comparaison des Systèmes d'Onboarding

**Date :** 10 Novembre 2025  
**Objectif :** Documenter ce qui existait AVANT vs ce qui a été créé MAINTENANT

---

## 🎯 Accès Rapide

### Page de Test Interactive
```
http://localhost:3000/test-comparison
```

Cette page vous permet de tester et comparer tous les systèmes côte à côte.

---

## ✅ SYSTÈMES EXISTANTS (Avant Phase 4)

### 1. Création Profil V1
**Route :** `/dashboard/profiles/create`  
**Statut :** ✅ Existait déjà, **non modifié**

**Caractéristiques :**
- 3 étapes : Form → Template Selection → Success
- Utilise le composant `ProfileForm`
- Pas de sauvegarde automatique
- Authentification requise (dans le dashboard)
- Stepper simple

**Fichiers impliqués :**
```
app/dashboard/profiles/create/page.tsx
components/features/profiles/ProfileForm.tsx
components/features/profiles/TemplateSelectionStep.tsx
```

**Code principal :**
```typescript
// app/dashboard/profiles/create/page.tsx
const [currentStep, setCurrentStep] = useState<CreationStep>('form')

// Pas de hook spécifique, juste du state local
```

---

### 2. Création Profil V2
**Route :** `/dashboard/profiles/create-v2`  
**Statut :** ✅ Existait déjà, **non modifié**

**Caractéristiques :**
- 4 étapes : Base → Template Select → Template Fields → Success
- Utilise `BaseProfileForm` et `DynamicTemplateForm`
- Templates dynamiques avec champs personnalisés
- Pas de sauvegarde automatique
- Authentification requise
- Stepper visuel amélioré

**Fichiers impliqués :**
```
app/dashboard/profiles/create-v2/page.tsx
components/features/profiles/BaseProfileForm.tsx
components/features/profiles/DynamicTemplateForm.tsx
components/features/profiles/TemplateSelectionStep.tsx
```

**Code principal :**
```typescript
// app/dashboard/profiles/create-v2/page.tsx
const [currentStep, setCurrentStep] = useState<CreationStep>('base')
const [baseFields, setBaseFields] = useState<BaseProfileData | null>(null)
const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)

// Pas de hook spécifique, juste du state local
```

---

### 3. Wizard Carte NFC
**Route :** `/onboarding/nfc-card`  
**Statut :** ✅ Existait déjà, **non modifié**

**Caractéristiques :**
- 5 étapes : Intro → Form → Design → Profile Selection → Success
- Hook dédié : `useNFCCardOnboarding`
- Gestion complète du flow NFC
- Création de carte + association profil
- Pas de sauvegarde dans `pending_creations`

**Fichiers impliqués :**
```
app/onboarding/nfc-card/page.tsx
lib/hooks/useNFCCardOnboarding.ts
components/features/nfc-onboarding/NFCCardFormStep.tsx
components/features/nfc-onboarding/NFCCardDesignStepV2.tsx
components/features/nfc-onboarding/ProfileSelectionStep.tsx
```

**Code principal :**
```typescript
// app/onboarding/nfc-card/page.tsx
const {
  currentStep,
  formData,
  selectedDesign,
  selectedColor,
  goToNextStep,
  goToPrevStep,
  updateFormData
} = useNFCCardOnboarding()  // Hook existant
```

---

## 🆕 SYSTÈMES CRÉÉS (Phase 2-4)

### 1. Hook `useOnboarding` (Phase 2)
**Fichier :** `lib/hooks/useOnboarding.ts`  
**Statut :** ❌ **NOUVEAU**, créé en Phase 2

**Caractéristiques :**
- Hook générique pour tout type d'onboarding
- Sauvegarde auto dans `pending_creations` (Supabase)
- Restauration après authentification
- Gestion de session avec `session_id`
- Backup localStorage

**Signature :**
```typescript
export function useOnboarding(
  flowType: 'public_page' | 'nfc_card',
  totalSteps: number = 4
) {
  return {
    sessionId,
    currentStep,
    payload,
    loading,
    saving,
    error,
    saveProgress,
    nextStep,
    previousStep,
    finalize
  }
}
```

---

### 2. Service Onboarding (Phase 2)
**Fichier :** `lib/services/onboarding.service.ts`  
**Statut :** ❌ **NOUVEAU**, créé en Phase 2

**Fonctions :**
- `createPendingCreation()`
- `getPendingCreation()`
- `updatePendingCreation()`
- `finalizePendingCreation()`

---

### 3. Types Onboarding (Phase 2)
**Fichier :** `lib/types/onboarding.ts`  
**Statut :** ❌ **NOUVEAU**, créé en Phase 2

**Types créés :**
- `PendingCreation`
- `PublicPagePayload`
- `NFCCardPayload`
- `OnboardingProgress`
- `WizardStep`

---

### 4. Migration SQL (Phase 2)
**Fichier :** `supabase/migrations/20250110_create_onboarding_tables_fixed.sql`  
**Statut :** ❌ **NOUVEAU**, créé en Phase 2

**Tables créées :**
- `pending_creations` (sauvegarde temporaire avant auth)
- `nfc_cards` (cartes NFC)
- `orders` (commandes de cartes)
- `onboarding_sessions` (sessions utilisateur)

---

### 5. Wizard Page Publique (Phase 4)
**Route :** `/onboarding/public-page`  
**Statut :** ❌ **NOUVEAU**, créé en Phase 4

**Caractéristiques :**
- 4 étapes : Basic Info → Social Links → Customization → Preview
- Utilise le **nouveau** hook `useOnboarding`
- Sauvegarde automatique dans Supabase
- Restauration après authentification
- Animations Framer Motion
- Authentification optionnelle (redirect si non connecté)

**Fichiers créés :**
```
app/onboarding/public-page/page.tsx
components/features/onboarding/public-page/Step1BasicInfo.tsx
components/features/onboarding/public-page/Step2SocialLinks.tsx
components/features/onboarding/public-page/Step3Customization.tsx
components/features/onboarding/public-page/Step4Preview.tsx
```

**Code principal :**
```typescript
// app/onboarding/public-page/page.tsx
const {
  sessionId,
  currentStep,
  payload,
  loading,
  saving,
  saveProgress,
  nextStep,
  previousStep,
  finalize
} = useOnboarding('public_page', 4)  // NOUVEAU HOOK
```

---

## 📊 Tableau Comparatif

| Critère | V1 (Existant) | V2 (Existant) | Wizard Page (Nouveau) | NFC (Existant) |
|---------|---------------|---------------|----------------------|----------------|
| **Étapes** | 3 | 4 | 4 | 5 |
| **Hook** | State local | State local | `useOnboarding` 🆕 | `useNFCCardOnboarding` |
| **Sauvegarde auto** | ❌ | ❌ | ✅ Supabase 🆕 | ❌ |
| **Restauration** | ❌ | ❌ | ✅ Après auth 🆕 | ❌ |
| **Auth requise** | ✅ (dashboard) | ✅ (dashboard) | ⚠️ Optionnelle | ✅ |
| **Animations** | Minimales | Minimales | ✅ Framer Motion 🆕 | Oui |
| **Templates** | Fixes | Dynamiques | Thèmes | Designs |
| **Table dédiée** | `profiles` | `profiles` | `pending_creations` 🆕 | `nfc_cards` |

---

## 🧪 Comment Tester ?

### Option 1 : Page de Comparaison (Recommandé)
```bash
npm run dev
```
Puis ouvrir : **http://localhost:3000/test-comparison**

Cette page contient :
- Liens directs vers tous les systèmes
- Tableau comparatif visuel
- Scénarios de test guidés
- Outils de débogage

### Option 2 : Test Manuel

#### Tester V1 (Existant)
1. Se connecter au dashboard
2. Aller sur `/dashboard/profiles/create`
3. Remplir le formulaire
4. Choisir un template
5. Confirmer la création

#### Tester V2 (Existant)
1. Se connecter au dashboard
2. Aller sur `/dashboard/profiles/create-v2`
3. Remplir les infos de base
4. Sélectionner un template
5. Remplir les champs du template
6. Confirmer

#### Tester Wizard Page Publique (Nouveau)
1. **SANS se connecter**, aller sur `/onboarding/public-page`
2. Remplir l'étape 1 (nom, photo, etc.)
3. Fermer l'onglet
4. Rouvrir → **données restaurées** ✨
5. Compléter les 4 étapes
6. Cliquer "Créer mon compte"
7. S'inscrire → redirect automatique ✨
8. Finaliser la création

#### Tester Wizard NFC (Existant)
1. Se connecter
2. Aller sur `/onboarding/nfc-card`
3. Suivre les 5 étapes
4. Associer à un profil existant ou créer un nouveau

---

## 🔍 Vérification dans Supabase

### Pour le Wizard Page Publique (Nouveau)
```sql
-- Voir les créations en attente
SELECT * FROM pending_creations 
WHERE type = 'public_page'
ORDER BY created_at DESC;

-- Voir les sessions
SELECT * FROM onboarding_sessions
ORDER BY created_at DESC;
```

### Pour V1 et V2 (Existants)
```sql
-- Voir les profils créés
SELECT * FROM profiles
ORDER BY created_at DESC;
```

### Pour Wizard NFC (Existant)
```sql
-- Voir les cartes NFC
SELECT * FROM nfc_cards
ORDER BY created_at DESC;
```

---

## 🎯 Points Clés à Retenir

### Ce qui n'a PAS changé :
✅ Wizard Carte NFC → Fonctionne exactement comme avant  
✅ Création V1 → Aucune modification  
✅ Création V2 → Aucune modification  

### Ce qui est NOUVEAU :
❌ Hook `useOnboarding` → Créé pour multi-path onboarding  
❌ Table `pending_creations` → Sauvegarde avant authentification  
❌ Wizard Page Publique → Nouveau flow avec sauvegarde auto  
❌ Service onboarding → Gestion centralisée  

### Pourquoi deux hooks différents ?
- **`useNFCCardOnboarding`** (existant) = Spécifique aux cartes NFC
  - Utilise `useReducer`
  - State local uniquement
  - Pas de sauvegarde Supabase

- **`useOnboarding`** (nouveau) = Générique multi-usage
  - Sauvegarde Supabase
  - Restauration après auth
  - Support multi-path

---

## 📝 Scénarios de Test Recommandés

### 🔵 Scénario 1 : Comparer V1 vs V2
1. Ouvrir V1 et V2 dans deux onglets
2. Créer un profil dans chacun en parallèle
3. Noter les différences :
   - V1 : 3 étapes, templates fixes
   - V2 : 4 étapes, templates dynamiques

### 🟠 Scénario 2 : Tester la Sauvegarde Auto (Nouveau)
1. Ouvrir `/onboarding/public-page` (sans auth)
2. Remplir nom + username
3. **Fermer l'onglet** brutalement
4. Rouvrir `/onboarding/public-page`
5. ✨ **Données restaurées automatiquement !**

### 🟢 Scénario 3 : Tester l'Auth Flow (Nouveau)
1. Se déconnecter
2. Ouvrir `/onboarding/public-page`
3. Compléter les 4 étapes
4. Cliquer "Créer mon compte"
5. S'inscrire/se connecter
6. ✨ **Redirect auto + finalisation !**

### 🟣 Scénario 4 : Vérifier que NFC fonctionne toujours
1. Ouvrir `/onboarding/nfc-card`
2. Compléter le wizard
3. ✅ Doit fonctionner comme avant (pas de régression)

---

## 🐛 Débogage

### Vider le localStorage
```javascript
// Dans la console du navigateur (F12)
localStorage.clear()
location.reload()
```

### Voir le session_id
```javascript
// Dans la console
console.log(localStorage.getItem('ofika_session_id'))
```

### Voir les données sauvegardées
```javascript
// Dans la console
console.log(localStorage.getItem('ofika_onboarding_public_page'))
```

---

## 📚 Documentation Associée

- `docs/PHASE_4_WIZARDS_ONBOARDING.md` - Guide complet du wizard
- `docs/FIX_WIZARD_PUBLIC_PAGE.md` - Fix technique appliqué
- `lib/hooks/useOnboarding.ts` - Code source du hook
- `app/test-comparison/page.tsx` - Page de comparaison interactive

---

**Résumé Final :**

- **3 systèmes existaient déjà** (V1, V2, NFC) → **Non modifiés**
- **1 nouveau système créé** (Wizard Page Publique) → **Phase 4**
- **Infrastructure nouvelle** (hook + tables + service) → **Phase 2**
- **Page de test créée** → `/test-comparison` pour comparer facilement

---

**Créé le :** 10 Novembre 2025  
**Dernière mise à jour :** 10 Novembre 2025
