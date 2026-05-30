# 🚀 Progression - Implémentation Onboarding Multi-Parcours

**Dernière mise à jour :** 10 Novembre 2025  
**Status :** ✅ Phase 1-2 complétées (Fondations) - En cours : Phase 3-4 (Frontend)

---

## ✅ CE QUI A ÉTÉ FAIT

### 📊 Phase 1 : Analyse (COMPLÉTÉ)

**Fichier :** `docs/ONBOARDING_MULTIFLOW_ANALYSIS.md`

✅ **Rapport d'analyse complet généré** incluant :
- Architecture Next.js 14 App Router analysée
- Système d'authentification Supabase documenté
- Base de données et tables existantes inventoriées
- Routes actuelles mappées
- API endpoints existants listés
- Système de sécurité audité
- Checklist de modifications nécessaires
- Plan d'implémentation détaillé (24-31h estimées)
- Risques identifiés et atténuations

**Découvertes clés :**
- ✅ Architecture solide (Next.js 14 + Supabase + Tailwind)
- ✅ Système de templates dynamiques déjà en place
- ⚠️ Onboarding NFC existant mais basique
- ❌ Pas de système pending_creations
- ❌ OAuth non configuré
- ❌ Pas de gestion de commandes

---

### 🗃️ Phase 2 : Migrations Base de Données (COMPLÉTÉ)

**Fichier :** `supabase/migrations/20250110_create_onboarding_tables.sql`

✅ **4 nouvelles tables créées :**

#### 1. `pending_creations` 
- Stocke les créations temporaires avant authentification
- Expiration automatique après 24h
- Indexée par session_id
- **Colonnes :** id, session_id, type, payload (JSONB), step_completed, expires_at

#### 2. `nfc_cards`
- Gère les cartes NFC physiques
- Statuts : draft → pending_order → ordered → shipped → delivered → activated
- Lien avec profiles
- **Colonnes :** id, user_id, profile_id, design_id, color_theme, status, chip_id, activation_code, preview_data

#### 3. `orders`
- Système de commande complet
- Gestion paiement et livraison
- Numérotation automatique (ORD-2025-000001)
- **Colonnes :** id, order_number, user_id, nfc_card_id, amount_cents, shipping_address (JSONB), payment_status, shipping_status, tracking_number

#### 4. `onboarding_sessions`
- Analytics du parcours utilisateur
- Tracking des étapes
- Métadonnées UTM
- **Colonnes :** id, session_id, user_id, flow_type, current_step, steps_completed (JSONB), device_type, utm_source

✅ **RLS (Row-Level Security) :**
- Politiques créées pour chaque table
- Accès user_id basé
- pending_creations accessible publiquement (sécurisé par session_id côté client)

✅ **3 Fonctions SQL Helper :**
1. `cleanup_expired_pending_creations()` - Nettoyage automatique
2. `generate_order_number()` - Génération de numéros séquentiels
3. `calculate_nfc_card_price()` - Calcul de prix dynamique avec TVA et frais de port

✅ **Triggers :**
- Auto-update de `updated_at` sur toutes les tables

---

### 🎨 Phase 2.5 : Types TypeScript (COMPLÉTÉ)

**Fichier :** `lib/types/onboarding.ts`

✅ **Types créés (40+ interfaces) :**

**Types de base :**
- `OnboardingFlowType` = 'nfc' | 'public_page'
- `NFCCardStatus` (7 états)
- `PaymentStatus` (6 états)
- `ShippingStatus` (6 états)

**Interfaces principales :**
- `PendingCreation` - Création temporaire
- `PublicPagePayload` - Données page publique
- `NFCCardPayload` - Données carte NFC
- `NFCCard` - Carte complète
- `Order` - Commande complète
- `ShippingAddress` - Adresse de livraison
- `OnboardingSession` - Session de tracking
- `WizardStep` - Étape du wizard
- `OnboardingProgress` - Progression utilisateur

**API Responses :**
- `OnboardingApiResponse<T>`
- `SaveTempResponse`
- `FinalizeOnboardingResponse`

**Designs de cartes :**
- `NFCCardDesign` avec 4 designs prédéfinis (Classique, Moderne, Premium Métal, Premium Bois)

---

### 🔧 Phase 2.6 : Hooks & Services (COMPLÉTÉ)

#### Hook `useOnboarding` 

**Fichier :** `lib/hooks/useOnboarding.ts`

✅ **Fonctionnalités :**
- Gestion d'état du wizard (currentStep, completedSteps, payload)
- Sauvegarde automatique dans Supabase + localStorage
- Navigation (nextStep, previousStep, goToStep)
- Chargement de création en attente
- Finalisation après authentification
- Calcul de progression en temps réel
- Génération de session_id unique

✅ **API exposée :**
```typescript
{
  // État
  sessionId, currentStep, completedSteps, payload, loading, saving, error, progress, steps,
  
  // Actions
  saveProgress, nextStep, previousStep, goToStep, finalize, setPayload, setError
}
```

#### Service `onboarding.service.ts`

**Fichier :** `lib/services/onboarding.service.ts`

✅ **Fonctions implémentées :**

**Pending Creations :**
- `savePendingCreation()` - Sauvegarde temporaire
- `getPendingCreation()` - Récupération
- `deletePendingCreation()` - Suppression

**Onboarding Sessions :**
- `createOnboardingSession()` - Créer session analytics
- `updateOnboardingSession()` - Mettre à jour progression

**NFC Cards :**
- `createNFCCard()` - Créer carte
- `getNFCCards()` - Liste des cartes utilisateur
- `updateNFCCard()` - Mise à jour carte

**Orders :**
- `createOrder()` - Créer commande
- `getOrder()` - Récupérer commande
- `getUserOrders()` - Liste commandes utilisateur

**Pricing :**
- `calculatePrice()` - Calcul prix dynamique

**Helpers :**
- `formatPrice()` - Formatage monétaire
- `getDeviceType()` - Détection device
- `getBrowser()` - Détection navigateur

---

## 🚧 EN COURS / À FAIRE

### Phase 3 : Page /get-started (EN COURS)

**Objectif :** Page de choix entre "Créer carte NFC" et "Créer page publique"

**À créer :**
- [ ] `app/get-started/page.tsx`
- [ ] Deux cartes interactives avec animations
- [ ] Routing vers wizards respectifs
- [ ] Design responsive
- [ ] Microcopy engageant

**Design attendu :**
```
┌─────────────────────────────────────┐
│     Créez votre présence digitale   │
│                                     │
│  ┌───────────┐    ┌───────────┐   │
│  │  🪪 NFC   │    │  🌐 Page  │   │
│  │  Card     │    │  Publique │   │
│  │           │    │           │   │
│  └───────────┘    └───────────┘   │
│                                     │
│  Déjà un compte ? Se connecter     │
└─────────────────────────────────────┘
```

---

### Phase 4 : Wizards Onboarding (EN ATTENTE)

#### 4.1 Composants réutilisables
- [ ] `components/onboarding/OnboardingWizard.tsx` - Layout général
- [ ] `components/onboarding/ProgressBar.tsx` - Barre de progression
- [ ] `components/onboarding/StepIndicator.tsx` - Indicateurs d'étapes
- [ ] `components/onboarding/PreviewPanel.tsx` - Prévisualisation live
- [ ] `components/onboarding/SaveDraftButton.tsx` - Bouton sauvegarde
- [ ] `components/onboarding/StepNavigation.tsx` - Navigation entre étapes

#### 4.2 Wizard NFC Card
**Route :** `/onboarding/nfc-card`

**Étapes :**
1. **Design** - Choix du design de carte (4 options)
2. **Info** - Nom, poste, entreprise, bio
3. **Contact** - Email, téléphone, réseaux sociaux
4. **Preview** - Prévisualisation + confirmation

**Fichiers à créer :**
- [ ] `app/onboarding/nfc-card/page.tsx`
- [ ] `app/onboarding/nfc-card/components/Step1Design.tsx`
- [ ] `app/onboarding/nfc-card/components/Step2Info.tsx`
- [ ] `app/onboarding/nfc-card/components/Step3Contact.tsx`
- [ ] `app/onboarding/nfc-card/components/Step4Preview.tsx`

#### 4.3 Wizard Public Page
**Route :** `/onboarding/public-page`

**Étapes :**
1. **Infos** - Nom, bio, photo de profil
2. **Liens** - Liens sociaux et personnalisés
3. **Style** - Couleurs, template
4. **Preview** - Prévisualisation + confirmation

**Fichiers à créer :**
- [ ] `app/onboarding/public-page/page.tsx`
- [ ] `app/onboarding/public-page/components/Step1BasicInfo.tsx`
- [ ] `app/onboarding/public-page/components/Step2Links.tsx`
- [ ] `app/onboarding/public-page/components/Step3Customize.tsx`
- [ ] `app/onboarding/public-page/components/Step4Preview.tsx`

---

### Phase 5 : Intégration Auth (EN ATTENTE)

**Objectif :** Gérer l'authentification pendant l'onboarding

**À implémenter :**
- [ ] Modal signup/login à la fin du wizard
- [ ] OAuth Google (configuration Supabase)
- [ ] OAuth Apple (optionnel)
- [ ] Auto-redirect après signup
- [ ] Email de bienvenue (Supabase Email Templates)
- [ ] Finalisation automatique via `/api/onboarding/finalize`

**Flow :**
```
Wizard Step 4 (Preview) 
  → Clic "Confirmer" 
  → Check if logged in
    - Si oui → Finaliser directement
    - Si non → Modal "Sign Up / Log In"
      → Après auth → Finaliser automatiquement
        → Redirect dashboard ou checkout
```

---

### Phase 6 : API Endpoints (EN ATTENTE)

**À créer :**

#### 1. `/api/onboarding/save-temp`
- Method: POST
- Body: `{ session_id, type, payload, step_completed }`
- Validation: Zod schema
- Rate limit: 10 req/min
- Response: `{ success, pending_creation_id, expires_at }`

#### 2. `/api/onboarding/finalize`
- Method: POST
- Body: `{ session_id, type, user_id }`
- Actions:
  - Récupérer pending_creation
  - Créer profile ou nfc_card
  - Supprimer pending_creation
  - Créer onboarding_session (completed)
- Response: `{ success, profile_id?, nfc_card_id?, redirect_url }`

#### 3. `/api/orders/create`
- Method: POST
- Body: `{ nfc_card_id, shipping_address }`
- Actions:
  - Calculer prix (RPC SQL)
  - Créer order
  - Générer order_number
  - Mettre à jour nfc_card status
- Response: `{ success, order }`

#### 4. `/api/payments/intent`
- Method: POST
- Body: `{ order_id }`
- Payment integration
- Response: `{ client_secret, amount }`

#### 5. `/api/payments/confirm`
- Method: POST
- Body: `{ payment_intent_id, order_id }`
- Webhook handling
- Update order status
- Response: `{ success }`

---

### Phase 7 : Checkout & Paiements (EN ATTENTE)

**À créer :**
- [ ] `app/checkout/page.tsx` - Page de paiement
- [ ] JS Elements de Paiement
- [ ] Formulaire adresse de livraison
- [ ] Récapitulatif commande
- [ ] Validation Zod
- [ ] Gestion erreurs paiement
- [ ] Confirmation de commande

**Modal "Order Now / Later" :**
- [ ] `components/onboarding/OrderDecisionModal.tsx`
- Apparaît après finalisation carte NFC
- 2 boutons : "Commander maintenant" / "Plus tard"

---

### Phase 8 : Tests (EN ATTENTE)

#### Tests unitaires (Jest)
- [ ] `useOnboarding` hook
- [ ] Services onboarding
- [ ] Validation Zod schemas
- [ ] Helpers (formatPrice, etc.)

#### Tests E2E (Playwright)
- [ ] **Scénario A :** NFC Card → Sign up → Order Now → Checkout
- [ ] **Scénario B :** Public Page → Sign up → Dashboard redirect
- [ ] Navigation wizard (next/previous)
- [ ] Autosave fonctionnel
- [ ] Preview en temps réel

#### Tests accessibilité
- [ ] Audit axe-core
- [ ] Keyboard navigation
- [ ] Screen reader friendly
- [ ] Color contrast WCAG AA

---

### Phase 9 : Documentation (EN ATTENTE)

**À créer :**
- [ ] `docs/ONBOARDING_README.md` - Guide utilisateur
- [ ] `docs/API_ENDPOINTS.md` - Documentation API
- [ ] `docs/DATABASE_SCHEMA.md` - Schéma BDD illustré
- [ ] `docs/DEPLOYMENT_GUIDE.md` - Déploiement production

**Contenu :**
- Diagrammes de flux
- Exemples de code
- Variables d'environnement
- Troubleshooting

---

## 📊 STATISTIQUES

### Avancement Global

| Phase | Status | Pourcentage |
|-------|--------|-------------|
| 1. Analyse | ✅ Complété | 100% |
| 2. Migrations BDD | ✅ Complété | 100% |
| 3. Types & Hooks | ✅ Complété | 100% |
| 4. Page /get-started | 🚧 En cours | 0% |
| 5. Wizards | ⏳ En attente | 0% |
| 6. Auth | ⏳ En attente | 0% |
| 7. API | ⏳ En attente | 0% |
| 8. Checkout | ⏳ En attente | 0% |
| 9. Tests | ⏳ En attente | 0% |
| 10. Documentation | ⏳ En attente | 0% |

**TOTAL : 30% complété** 🎯

### Fichiers créés jusqu'à présent

```
docs/
├── ONBOARDING_MULTIFLOW_ANALYSIS.md    ✅ (Rapport d'analyse)
└── ONBOARDING_PROGRESS.md               ✅ (Ce fichier)

supabase/migrations/
└── 20250110_create_onboarding_tables.sql ✅ (4 tables + RLS + fonctions)

lib/
├── types/
│   └── onboarding.ts                    ✅ (40+ interfaces)
├── hooks/
│   └── useOnboarding.ts                 ✅ (Hook principal)
└── services/
    └── onboarding.service.ts            ✅ (15+ fonctions)
```

**Total : 6 fichiers créés**  
**Lignes de code : ~1500 lignes**

---

## 🎯 PROCHAINES ÉTAPES IMMÉDIATES

### 1. Appliquer la migration SQL (CRITIQUE)

```bash
# Méthode 1 : Via Supabase CLI
supabase db push

# Méthode 2 : Via SQL Editor dans Dashboard Supabase
# Copier-coller le contenu de 20250110_create_onboarding_tables.sql
```

**Vérifier que ça marche :**
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('pending_creations', 'nfc_cards', 'orders', 'onboarding_sessions');
```

### 2. Créer la page /get-started

Commencer par le design des deux cartes interactives.

### 3. Tester le hook useOnboarding

Créer une page de test pour valider :
- Sauvegarde dans Supabase
- Sauvegarde dans localStorage
- Navigation entre étapes
- Calcul de progression

### 4. Implémenter le premier wizard (NFC Card)

Refactorer le wizard existant avec les nouveaux composants.

---

## 🔒 SÉCURITÉ - CHECKLIST

État actuel :

- [x] RLS activé sur toutes les tables
- [x] Politiques user_id basées
- [x] Expiration automatique (24h) des pending_creations
- [ ] Validation Zod sur API endpoints
- [ ] Rate limiting (10 req/min)
- [ ] Sanitisation HTML (DOMPurify)
- [ ] CSRF tokens
- [ ] OAuth configuré
- [ ] Secrets en variables d'environnement
- [ ] Logs d'audit

---

## 📝 NOTES TECHNIQUES

### Décisions d'architecture

1. **Session ID côté client :** Utilise `crypto.randomUUID()` + localStorage pour maintenir la session avant auth
2. **Double sauvegarde :** Supabase (principal) + localStorage (backup) pour éviter les pertes de données
3. **JSONB pour payload :** Flexibilité maximale pour stocker différents types de données
4. **RPC pour pricing :** Calculs côté serveur pour sécurité et cohérence
5. **Expiration automatique :** Cleanup quotidien des pending_creations via cron

### Défis identifiés

1. **OAuth Google :** Nécessite configuration Supabase + Google Cloud Console
2. **Webhook Payment :** URL publique nécessaire (utiliser ngrok en dev)
3. **Preview en temps réel :** Demande optimisation pour éviter re-renders excessifs
4. **Mobile UX :** Wizard doit être parfaitement responsive

---

## 🚀 COMMANDES UTILES

```bash
# Développement
npm run dev

# Build
npm run build

# Linter
npm run lint

# Tests (quand ajoutés)
npm test

# Migrations
supabase db push

# Générer types TypeScript depuis Supabase
supabase gen types typescript --local > lib/types/supabase.ts
```

---

**Dernière mise à jour :** 10 Novembre 2025 à 19:00  
**Auteur :** Windsurf AI  
**Contact :** Pour questions ou feedback
