# 📘 Wiki & Règles Permanentes Antigravity — QR Codes & Cartes NFC Ofika

## 1. 🎨 Directive Démographique & Visuelle Obligatoire
Toutes les images générées ou intégrées pour le projet Ofika comportant des personnages humains doivent **EXCLUSIVEMENT** représenter des professionnels / exécutifs africains noirs ou afro-descendants (teints noirs ou métissés), dans des décors professionnels modernes (Abidjan, bureaux high-tech). Ne jamais utiliser de personnes de teint blanc/caucasien.

---

## 2. 🌐 Normalisation Obligatoire de `target_url`
Toute URL de destination associée à un QR code ou une carte NFC dans la table `public.qr_redirects` doit être stockée sous sa forme d'**URL COMPLÈTE et ABSOLUE** (`https://ofika.ci/votre-destination`).
- **Helper obligatoire** : Utiliser `normalizeToFullUrl(url)` dans [`lib/utils/qr-validation.ts`](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/Ofika-c-main/lib/utils/qr-validation.ts).
- **Interdiction de tronquer** : Ne jamais réintroduire de logique "SMART STORAGE" qui tronque les liens vers des slugs bruts lors des régénérations ou modifications dans les API admin ([`app/api/admin/nfc/[id]/regenerate/route.ts`](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/Ofika-c-main/app/api/admin/nfc/[id]/regenerate/route.ts)).

---

## 3. 🔒 Supabase RLS & Résolution Publique des QR Codes
- La résolution publique des QR codes sur [`/qr/[shortCode]`](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/Ofika-c-main/app/qr/[shortCode]/page.tsx) doit utiliser `createAdminClient()` (`SUPABASE_SERVICE_ROLE_KEY`) afin de permettre à tout visiteur ou utilisateur connecté de scanner n'importe quel QR code sans blocage RLS.
- La politique RLS distante sur `public.qr_redirects` autorise la lecture si `is_active = true AND deleted_at IS NULL`.

---

## 4. 🗄️ Schéma de la table `public.qr_redirects`
Ne jamais passer de champs inexistants (comme `nfc_link`, `redirect_type` ou `scan_count`) lors des insertions ou modifications dans `public.qr_redirects`.
- **Colonnes autorisées** : `id`, `user_id`, `short_code`, `target_url`, `title`, `type`, `is_active`, `created_at`, `updated_at`, `deleted_at`.
