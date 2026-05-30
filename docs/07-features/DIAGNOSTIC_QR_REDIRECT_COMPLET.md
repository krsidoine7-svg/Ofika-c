# 🔍 DIAGNOSTIC COMPLET : Problème de Redirection QR Code

## 🎯 RÉSUMÉ DU PROBLÈME

**QR Code** : `http://localhost:3000/qr/0dSShblf`  
**Destination actuelle** : `https://ofika.vercel.app/1jghTtdTNaworId`  
**Destination attendue** : Votre profil utilisateur (ex: `http://localhost:3000/krsidoine`)

---

## 🔎 CAUSE RACINE IDENTIFIÉE

### ❌ Problème Principal

Le QR code redirige vers la **mauvaise URL** car la valeur `nfc_link` dans la base de données Supabase est **incorrecte**.

### 📊 Flux de Redirection (Actuel)

```
1. Scan QR → http://localhost:3000/qr/0dSShblf
   ↓
2. Recherche dans table qr_redirects
   ↓
3. Récupère nfc_link = "https://ofika.vercel.app/1jghTtdTNaworId"
   ↓
4. ❌ Redirige vers cette mauvaise URL
```

### 🐛 Analyse du Code Source

#### Fichier: `lib/services/qr-code.ts` (ligne 35)
```typescript
const redirectResult = await createQRRedirect({
  nfc_link: nfcLink,  // ⬅️ PROBLÈME ICI
  redirect_type: 'nfc_card',
  ...
})
```

#### Fichier: `lib/services/nfc-cards.ts` (ligne 93)
```typescript
nfc_link: cardData.nfc_link,  // ⬅️ SOURCE DU PROBLÈME
```

**🔴 ROOT CAUSE** :
Quand une carte NFC est créée, le champ `nfc_link` contient une URL incorrecte ou obsolète qui est ensuite utilisée comme `nfc_link` dans le QR code.

---

## 📋 VÉRIFICATION DE VOTRE BASE DE DONNÉES

### Étape 1 : Vérifier le QR Code

Exécutez dans Supabase SQL Editor :

```sql
SELECT 
    short_code,
    nfc_link,
    is_active,
    title,
    created_at
FROM qr_redirects
WHERE short_code = '0dSShblf';
```

**Résultat attendu** :
```
short_code: 0dSShblf
nfc_link: https://ofika.vercel.app/1jghTtdTNaworId ❌ MAUVAISE URL
is_active: true
```

### Étape 2 : Vérifier votre Profil

```sql
SELECT 
    id,
    username,
    custom_url,
    name
FROM profiles
WHERE user_id = auth.uid();
```

**Résultat attendu** :
```
id: [votre-profile-id]
username: krsidoine
custom_url: krsidoine
name: Koffi Sidoine
```

### Étape 3 : Vérifier la Carte NFC

```sql
SELECT 
    id,
    nfc_link,
    username,
    custom_url,
    qr_code_url
FROM nfc_profiles
WHERE user_id = auth.uid();
```

**Problème probable** :
```
nfc_link: https://ofika.vercel.app/1jghTtdTNaworId ❌ MAUVAISE
```

---

## ✅ SOLUTIONS

### Solution 1 : Correction Manuelle (Rapide)

Dans Supabase SQL Editor :

```sql
-- 1. Trouver votre bon profil
SELECT 
    CONCAT('http://localhost:3000/', COALESCE(custom_url, username)) as bonne_url
FROM profiles
WHERE user_id = auth.uid();

-- 2. Mettre à jour le QR code avec la bonne URL
UPDATE qr_redirects
SET nfc_link = 'http://localhost:3000/krsidoine'  -- ⬅️ REMPLACEZ PAR VOTRE URL
WHERE short_code = '0dSShblf';

-- 3. Vérifier la modification
SELECT short_code, nfc_link 
FROM qr_redirects 
WHERE short_code = '0dSShblf';
```

### Solution 2 : Correction Automatique (Recommandé)

Créez un script SQL pour corriger tous vos QR codes :

```sql
-- Corriger tous les QR codes qui pointent vers de mauvaises URLs
WITH correct_urls AS (
    SELECT 
        qr.id as qr_id,
        qr.short_code,
        qr.nfc_link as old_url,
        CONCAT(
            'http://localhost:3000/', 
            COALESCE(p.custom_url, p.username)
        ) as new_url,
        p.user_id
    FROM qr_redirects qr
    INNER JOIN nfc_profiles nfc ON nfc.qr_redirect_id = qr.id
    INNER JOIN profiles p ON p.user_id = nfc.user_id
    WHERE qr.nfc_link LIKE '%ofika.vercel.app%'
)
UPDATE qr_redirects
SET nfc_link = correct_urls.new_url,
    updated_at = NOW()
FROM correct_urls
WHERE qr_redirects.id = correct_urls.qr_id
RETURNING 
    qr_redirects.short_code,
    correct_urls.old_url as "Ancienne URL",
    qr_redirects.nfc_link as "Nouvelle URL";
```

---

## 🛠️ FIX DANS LE CODE (Prévention)

### Fix 1 : Validation de l'URL dans `nfc-cards.ts`

```typescript
// AVANT (ligne 93)
nfc_link: cardData.nfc_link || generateDefaultProfileLink(user.id, profileId),
```

Ajoutez cette fonction helper :

```typescript
/**
 * Génère l'URL correcte du profil pour une carte NFC
 */
async function generateDefaultProfileLink(userId: string, profileId?: string): Promise<string> {
  const supabase = createClient()
  
  if (profileId) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('username, custom_url')
      .eq('id', profileId)
      .single()
    
    if (profile) {
      const slug = profile.custom_url || profile.username
      return `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/${slug}`
    }
  }
  
  // Fallback : profil de l'utilisateur
  const { data: userProfile } = await supabase
    .from('profiles')
    .select('username, custom_url')
    .eq('user_id', userId)
    .single()
  
  if (userProfile) {
    const slug = userProfile.custom_url || userProfile.username
    return `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/${slug}`
  }
  
  // Ultime fallback
  return `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard`
}
```

### Fix 2 : Validation dans `qr-redirect.ts`

Ajoutez une validation pour détecter les URLs Vercel obsolètes :

```typescript
function validateTargetUrl(url: string): { valid: boolean; error?: string } {
  try {
    const urlObj = new URL(url)
    
    // ❌ BLOQUER les URLs Vercel obsolètes
    if (urlObj.hostname.includes('vercel.app') && urlObj.pathname.length > 20) {
      return {
        valid: false,
        error: '⚠️ URL Vercel détectée. Utilisez votre domaine final ou localhost.'
      }
    }
    
    // ✅ Valider que c'est une URL correcte
    if (!urlObj.protocol.startsWith('http')) {
      return { valid: false, error: 'L\'URL doit commencer par http:// ou https://' }
    }
    
    return { valid: true }
  } catch {
    return { valid: false, error: 'URL invalide' }
  }
}
```

---

## 🧪 PLAN DE TEST

### Test 1 : Vérifier la correction

```bash
# 1. Vérifier dans la base
SELECT short_code, nfc_link FROM qr_redirects WHERE short_code = '0dSShblf';

# Résultat attendu :
# short_code: 0dSShblf
# nfc_link: http://localhost:3000/krsidoine ✅
```

### Test 2 : Tester le QR code

```bash
# 1. Ouvrir le navigateur
http://localhost:3000/qr/0dSShblf

# 2. Vérifier la redirection
# Doit rediriger vers : http://localhost:3000/krsidoine ✅
```

### Test 3 : Tester avec curl

```bash
curl -I -L http://localhost:3000/qr/0dSShblf
```

**Résultat attendu** :
```
HTTP/1.1 200 OK
Location: http://localhost:3000/krsidoine
```

---

## 📊 CHECKLIST DE CORRECTION

- [ ] Exécuter le script de vérification SQL
- [ ] Identifier la bonne URL de profil
- [ ] Mettre à jour `nfc_link` dans `qr_redirects`
- [ ] Recharger la page du QR code
- [ ] Scanner le QR et vérifier la redirection
- [ ] Appliquer les fixes de code pour prévenir le problème
- [ ] Tester la création d'une nouvelle carte NFC

---

## 🎯 RÉSUMÉ EN FRANÇAIS SIMPLE

**Problème** : Le QR code contient une mauvaise URL de destination dans la base de données.

**Cause** : Quand la carte NFC a été créée, le champ `nfc_link` contenait `https://ofika.vercel.app/1jghTtdTNaworId` au lieu de votre profil local.

**Solution immédiate** : Modifier manuellement `nfc_link` dans la table `qr_redirects`.

**Solution long terme** : Ajouter validation et génération automatique de l'URL correcte.

---

**Exécutez le script de correction SQL maintenant ! 🚀**
