# 🔧 Fix : Wizard Page Publique

**Date :** 10 Novembre 2025  
**Problème :** Incompatibilité entre le wizard et le hook `useOnboarding`

---

## ❌ Problème identifié

Le wizard utilisait une signature incorrecte du hook `useOnboarding` :

```typescript
// ❌ Mauvais (n'existe pas)
const {
  wizardData,
  isLoading,
  goToNextStep,
  goToPrevStep,
  updateWizardData
} = useOnboarding({
  creationType: 'public_page',
  initialStep: 1,
  totalSteps: 4
})
```

---

## ✅ Solution appliquée

Utiliser la vraie signature du hook :

```typescript
// ✅ Correct
const {
  sessionId,
  currentStep,
  payload,        // Au lieu de wizardData
  loading,        // Au lieu de isLoading
  saving,
  error,
  saveProgress,
  nextStep,       // Au lieu de goToNextStep
  previousStep,   // Au lieu de goToPrevStep
  finalize
} = useOnboarding('public_page', 4)
```

---

## 🔄 Changements effectués

### 1. Déclaration du hook
```typescript
// Avant
useOnboarding({
  creationType: 'public_page',
  initialStep: 1,
  totalSteps: 4
})

// Après
useOnboarding('public_page', 4)
```

### 2. Navigation entre étapes
```typescript
// Avant
const handleNext = async () => {
  await updateWizardData(localData)  // ❌ N'existe pas
  goToNextStep()                     // ❌ N'existe pas
}

// Après
const handleNext = async () => {
  await nextStep(localData)  // ✅ Sauvegarde ET navigue
  setLocalData({})          // Réinitialise les données locales
}
```

### 3. Finalisation
```typescript
// Avant
await finalize({
  ...wizardData,  // ❌ N'existe pas
  ...localData
})

// Après
// Sauvegarder d'abord
await saveProgress(localData)
// Puis finaliser avec userId
await finalize(user.id)
```

### 4. Rendu des étapes
```typescript
// Avant
const allData = { ...wizardData, ...localData }  // ❌

// Après
const allData = { ...payload, ...localData }  // ✅
```

### 5. États de chargement
```typescript
// Avant
isLoading={isLoading}  // ❌ N'existe pas

// Après
isLoading={loading || saving}  // ✅
```

---

## 📋 Hook useOnboarding - Documentation

### Signature
```typescript
function useOnboarding(
  flowType: 'public_page' | 'nfc_card',
  totalSteps: number
)
```

### Retour
```typescript
{
  // État
  sessionId: string           // UUID de la session
  currentStep: number         // Étape actuelle (1-based)
  completedSteps: number[]    // Étapes complétées
  payload: object             // Données sauvegardées
  loading: boolean            // Chargement global
  saving: boolean             // Sauvegarde en cours
  error: string | null        // Erreur
  progress: OnboardingProgress
  steps: WizardStep[]
  
  // Actions
  saveProgress: (data, step?) => Promise<void>
  nextStep: (data?) => Promise<void>
  previousStep: () => void
  goToStep: (step) => void
  finalize: (userId) => Promise<result>
  setPayload: (payload) => void
  setError: (error) => void
}
```

### Utilisation recommandée
```typescript
// 1. Initialiser
const { nextStep, previousStep, payload, finalize } = useOnboarding('public_page', 4)

// 2. Naviguer avec sauvegarde
await nextStep({ fullName: 'Jean', username: 'jean' })

// 3. Naviguer sans sauvegarde
previousStep()

// 4. Finaliser
const result = await finalize(user.id)
```

---

## 🔄 Flux de données

```
État local (localData)
    ↓
handleNext()
    ↓
nextStep(localData)
    ↓
saveProgress()  → Supabase (pending_creations)
    ↓
setCurrentStep(step + 1)
    ↓
Étape suivante affichée
```

---

## ✅ Vérifications

- [x] Hook importé correctement
- [x] Signature correcte (`'public_page'`, 4)
- [x] `payload` au lieu de `wizardData`
- [x] `loading` au lieu de `isLoading`
- [x] `nextStep()` au lieu de `goToNextStep()`
- [x] `previousStep()` au lieu de `goToPrevStep()`
- [x] `finalize(userId)` au lieu de `finalize(data)`
- [x] Sauvegarde avant finalisation

---

## 🧪 Test du fix

```bash
# 1. Redémarrer le serveur
npm run dev

# 2. Ouvrir le wizard
http://localhost:3000/onboarding/public-page

# 3. Remplir l'étape 1 et cliquer "Continuer"
# ✅ Devrait passer à l'étape 2 sans erreur

# 4. Vérifier dans Supabase
SELECT * FROM pending_creations WHERE type = 'public_page';
# ✅ Doit contenir les données de l'étape 1
```

---

## 🐛 Erreurs potentielles résiduelles

### TypeScript ne trouve pas les imports
```
Cannot find module '@/components/features/onboarding/public-page/Step2SocialLinks'
```

**Solution :** Redémarrer TypeScript Server dans VSCode
- Cmd/Ctrl + Shift + P
- "TypeScript: Restart TS Server"

Ou redémarrer complètement le dev server.

---

## 📝 Fichiers modifiés

- ✅ `app/onboarding/public-page/page.tsx` (corrigé)
- ℹ️ Les composants Step1-4 sont corrects
- ℹ️ Le hook `useOnboarding` est correct

---

**Statut :** ✅ Résolu  
**Testé :** En attente de redémarrage du serveur
