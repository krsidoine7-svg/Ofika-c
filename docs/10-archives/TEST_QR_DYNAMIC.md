# 🧪 Test : QR Code Dynamique

## 📝 Objectif
Vérifier que la modification du `nfc_link` met à jour automatiquement la redirection QR.

---

## ✅ Étapes de test

### 1️⃣ Créer une carte NFC avec un lien initial

1. Aller sur `http://localhost:3000/onboarding/nfc-card`
2. Remplir le formulaire avec :
   - Nom : "Test QR"
   - Entreprise : "Ofika"
   - NFC Link : `https://google.com`
3. Terminer le processus
4. Noter l'ID de la carte créée

---

### 2️⃣ Vérifier la base de données

Exécuter dans Supabase SQL Editor :

```sql
-- Récupérer la carte NFC
SELECT 
  id,
  profile_name,
  nfc_link,
  qr_redirect_id,
  qr_code_url
FROM nfc_profiles
WHERE profile_name = 'Test QR'
ORDER BY created_at DESC
LIMIT 1;

-- Noter le qr_redirect_id, par exemple: 'abc-123-xyz'

-- Vérifier la redirection QR
SELECT 
  id,
  short_code,
  nfc_link,
  scan_count
FROM qr_redirects
WHERE id = 'abc-123-xyz'; -- Remplacer par le qr_redirect_id réel
```

**Résultat attendu** :
- `nfc_profiles.nfc_link` = `https://google.com`
- `qr_redirects.nfc_link` = `https://google.com`

---

### 3️⃣ Modifier le lien NFC via l'interface

1. Aller sur `http://localhost:3000/dashboard/profiles`
2. Cliquer sur "Aperçu" de la carte "Test QR"
3. Dans la section "Page Link to Bio", cliquer sur "Modifier"
4. Sélectionner une autre page (ou entrer `https://youtube.com`)
5. Cliquer sur "Enregistrer"

---

### 4️⃣ Vérifier la mise à jour

Ré-exécuter la requête SQL :

```sql
SELECT 
  nfc_link
FROM nfc_profiles
WHERE id = 'votre-id';

SELECT 
  nfc_link
FROM qr_redirects
WHERE id = 'votre-qr-redirect-id';
```

**Résultat attendu** :
- `nfc_profiles.nfc_link` = `https://youtube.com`
- `qr_redirects.nfc_link` = `https://youtube.com` ✅ **MIS À JOUR !**

---

### 5️⃣ Tester la redirection

1. Récupérer le `short_code` de la redirection QR
2. Aller sur : `http://localhost:3000/qr/[short_code]`
3. Vous devriez être **redirigé vers YouTube** ! 🎯

---

## 📊 Résultats attendus

| Étape | nfc_link | nfc_link | ✓ |
|-------|----------|------------|---|
| Création | google.com | google.com | ✅ |
| Après modification | youtube.com | youtube.com | ✅ |
| Redirection QR | - | Vers youtube.com | ✅ |

---

## ❌ Problèmes possibles

### Erreur : "Property 'qr_redirect_id' does not exist"
**Solution** : Vérifier que le SELECT inclut bien `qr_redirect_id`

### Erreur : "nfc_link" pas mis à jour
**Solution** : Vérifier que la correction a bien été appliquée dans `/api/nfc-cards/[id]/route.ts`

### QR code redirige vers l'ancienne URL
**Solution** : Le cache du navigateur. Tester en navigation privée.

---

## 🎉 Si tout fonctionne

Votre QR code est **vraiment dynamique** ! Vous pouvez :
- ✅ Imprimer votre carte une seule fois
- ✅ Changer la destination autant de fois que vous voulez
- ✅ Le QR code physique redirigera toujours vers la bonne page

**C'est la magie du QR code dynamique !** 🪄
