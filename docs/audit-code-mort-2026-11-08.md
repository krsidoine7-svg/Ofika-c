# Audit du code mort et des doublons — 8 novembre 2026

**Méthode :** graphe des imports depuis tous les points d'entrée Next.js (pages, layouts, routes API, middleware, instrumentation, scripts, tests) → tout fichier non atteignable = code mort. Contre-vérification par recherche du nom de chaque fichier dans tout le code. Doublons : fichiers identiques, exports homonymes, blocs de 10 lignes copiés-collés.

**Résultat :** 87 fichiers supprimés (≈ 16 000 lignes), 0 erreur TypeScript, 0 erreur ESLint après nettoyage. Tout reste récupérable dans l'historique git (dernier commit avant nettoyage : `e46e1ae`).

## 1. Code mort supprimé (84 fichiers)

| Zone | Fichiers |
|---|---|
| Composants jamais affichés | ContactAnalytics, ScriptProtection, MainLayout, ResponsiveContainer, QuickActions, AnalyticsNotifications, ExportAnalytics, StatsResetIndicator, tout `card-creator/` (CardCreator, CardPreview, CardContactShare, CardStepIndicator, CardTypeStep, CustomizationStep), PaymentProcessStatus, UserRealtimeNotifications, RGPDConsentModal, EmojiPicker, ProfileCompletionWidget, ProfileImagesPromptModal, LinkForm, LinkManager, DesignSelector (NFC), NFCCardPublicPreviewStep, PushNotificationManager, ProfileDesignSelector, ProfileManager, SocialLinksManager, SocialOnboarding, `components/qr/CustomizationPanel` |
| Composants UI inutilisés | accessible-modal, accessible-notification, accordion, breadcrumb, collapsible, footer-section, icons, multi-orbit-semi-circle, radio-group, splash-cursor, table, text-reveal, text-truncate, tubelight-navbar, `ui/index.ts`, `card-ordering/index.ts` *(les composants shadcn se réinstallent en 1 commande si besoin : `npx shadcn add <nom>`)* |
| Hooks inutilisés | useContactAnalytics, useContactEmojis, useImageUpload, useLinks, useNFCCardForm, useOnboarding, usePerformance, usePushNotifications, useResponsive, useTemplates |
| Services / utilitaires inutilisés | card-order-status, contact-analytics, email-notifications, onboarding.service, profiles-drizzle (déjà exclu de TypeScript), social-scraper, qr-generator, design-system, permissions, rate-limit, focus-manager, encryption, validation-schemas, api-response, safe-fetch, script-loader-protection, contact-schemas, types onboarding & products |
| Scripts de diagnostic oubliés dans `lib/supabase/` | check-rls, check-schema, debug-delete, diagnose-length-error, edge-client, middleware, setup-storage, storage |
| Page orpheline | `app/dashboard/qr-codes/new-v2` (aucun lien n'y menait ; copie de `/dashboard/qr-codes/new`) |
| Divers | `app/dashboard/analytics/simple.tsx` (pas une page Next.js) |

## 2. Doublons supprimés ou fusionnés

| Doublon | Action |
|---|---|
| **3 systèmes de limitation de requêtes** (`lib/middleware/rate-limit.ts`, `lib/security/rate-limiting.ts`, `lib/utils/rate-limit.ts`) | Un seul conservé : `lib/security/rate-limiting.ts` (config `onboarding` ajoutée, 20 req/min comme avant). `/api/onboarding/save-temp` branché dessus. Les 2 autres supprimés. |
| **`lib/services/qr-redirect.ts`** doublait 7 fonctions de `qr-redirect-client.ts` (création, modification, suppression, stats…) | Réduit à la seule fonction réellement utilisée côté serveur : `trackQRScan` (556 → 100 lignes). |
| **2 pages de création de QR code** (`new` et `new-v2`) | `new-v2` supprimée (orpheline). |

## 3. Doublons repérés, laissés en place (refactorisation à planifier)

Ces copies sont **actives** : les fusionner demande de modifier des écrans en production et de les retester. À traiter un par un, plus tard.

| Blocs copiés-collés | Importance | Piste |
|---|---|---|
| `LoginForm` ↔ `SignupForm` (≈ 60 blocs communs) | Haute | Extraire un composant commun de formulaire d'authentification |
| `NFCCardSignupStep` ↔ `SignupStep` | Moyenne | Un seul composant d'inscription paramétrable |
| `auth/forgot-password` ↔ `auth/magic-link` ; `auth/reset-password` ↔ `ChangePasswordForm` | Moyenne | Composants de formulaire partagés |
| `dashboard/admin/profile` ↔ `dashboard/settings` | Moyenne | Un seul formulaire de compte |
| `lib/types/database.ts` ↔ `lib/types/public-profile.ts` (types de profil recopiés) | Moyenne | Faire dériver `PublicProfile` du type de base |
| `PhoneInput` défini 2 fois (`ui/phone-input.tsx` et `ui/validated-input.tsx`) | Faible | Garder un seul composant après vérification des différences |
| `validateEmail` défini 2 fois (`qr-validation.ts`, `order-form.ts`) | Faible | Un seul validateur partagé |
| `trackQRScan` : même nom dans `profile-analytics.ts` et `qr-redirect.ts` (rôles différents) | Faible | Renommer l'un des deux pour éviter les confusions |
| `privacy` ↔ `terms`, `wallet/apple` ↔ `wallet/google`, pages admin (en-têtes de tableaux) | Faible | Normal pour des pages de même structure |

## 4. Recommandations

- Avant de publier : lancer `npm run build` pour une vérification complète (TypeScript + ESLint sont déjà propres).
- Garder le script de graphe d'imports pour un nouvel audit tous les 2-3 mois.
