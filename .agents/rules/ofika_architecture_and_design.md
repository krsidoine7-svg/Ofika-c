# 🌐 Ofika — Règle de Session & Architecture Technique (Wiki Permanent)

## 1. 🎨 Directives Esthétiques & Démographiques
- Toutes les images générées ou utilisées représentant des personnes physiques doivent **EXCLUSIVEMENT** figurer des professionnels, dirigeants ou cadres africains noirs ou afro-descendants (teints clairs à foncés).
- **Interdiction stricte** : Ne jamais utiliser ou générer d'images de personnes de teint blanc/caucasien.

---

## 2. 🔗 Normalisation des URLs de Destination (`target_url`)
- **Format obligatoire** : Toute URL enregistrée dans la colonne `target_url` de la table `public.qr_redirects` doit être **complète et absolue** (ex: `https://ofika.ci/votre-slug` ou `https://ofika.ci/trtr`).
- Utiliser la fonction `normalizeToFullUrl()` de `lib/utils/qr-validation.ts`.
- Ne jamais réintroduire la logique de suppression du domaine ("SMART STORAGE") dans les API de régénération ou de mise à jour admin ([`app/api/admin/nfc/[id]/regenerate/route.ts`](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/Ofika-c-main/app/api/admin/nfc/[id]/regenerate/route.ts)).

---

## 3. 🔒 Supabase & Politiques RLS (QR Codes)
- La route `/qr/[shortCode]` utilise `createAdminClient()` (`SUPABASE_SERVICE_ROLE_KEY`) pour la résolution et les métadonnées SEO afin d'éviter les blocages RLS lorsqu'un utilisateur connecté scanne le QR code d'un autre utilisateur.
- La politique RLS autorise la lecture si `is_active = true AND deleted_at IS NULL`.

---

## 4. 🗄️ Schéma `public.qr_redirects`
Ne jamais passer de champs inexistants dans l'INSERT/UPDATE sur `qr_redirects` (ex: `nfc_link`, `redirect_type`, `scan_count`).
- **Colonnes valides** : `id`, `user_id`, `short_code`, `target_url`, `title`, `type`, `is_active`, `created_at`, `updated_at`, `deleted_at`.
