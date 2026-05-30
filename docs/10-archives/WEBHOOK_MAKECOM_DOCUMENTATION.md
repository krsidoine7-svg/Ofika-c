# 📤 Webhook Make.com - Données envoyées

## 🎯 Événement : `NFC_CARD_CREATED`

Déclenché lors de la création d'une nouvelle carte NFC.

---

## 📊 Structure des données (Version 2.0)

### 📇 Informations de base de la carte NFC

| Champ | Type | Description | Exemple |
|-------|------|-------------|---------|
| `carte_id` | UUID | ID unique de la carte | `abc-123-xyz` |
| `nom_profil` | String | Nom du profil NFC | `Koffi Renaud` |
| `lien_nfc` | String | URL de destination | `https://ofika.com/krsidoine` |
| `lien_page_publique` | String | Même que lien_nfc | `https://ofika.com/krsidoine` |
| `qr_code_url` | String | URL de l'image du QR code | `https://api.qr...` |
| `choix_design` | String | Design choisi | `design1` ou `design2` |
| `theme_couleur` | String | Couleur de la carte | `black` ou `white` |
| `statut` | String | Statut de la carte | `active`, `inactive`, `pending` |
| `date_creation` | DateTime | Date de création | `2025-12-08T00:00:00Z` |

---

### 👤 Informations personnelles (depuis nfc_profiles)

| Champ | Type | Description | Exemple |
|-------|------|-------------|---------|
| `nom_complet` | String | Nom complet | `Koffi Renaud Sidoine` |
| `entreprise` | String | Nom de l'entreprise | `Ofika` |
| `poste` | String | Poste/Titre | `Chef de Projet` |
| `telephone` | String | Numéro de téléphone | `+33 6 12 34 56 78` |
| `email` | String | Adresse email | `koffi@ofika.com` |

---

### 🖼️ Images (URLs Supabase Storage permanentes)

| Champ | Type | Description | Exemple |
|-------|------|-------------|---------|
| `logo_url` | String | URL du logo (Supabase Storage) | `https://xxx.supabase.co/storage/...` |
| `photo_profil_url` | String | URL de la photo de profil | `https://xxx.supabase.co/storage/...` |

**Important** : Ces URLs sont **permanentes** et pointent vers Supabase Storage (plus de blob: temporaire !)

---

### 🔗 Configuration

| Champ | Type | Description | Exemple |
|-------|------|-------------|---------|
| `url_personnalisee` | String | URL personnalisée (custom_url) | `/krsidoine` |

---

### 📊 Informations techniques

| Champ | Type | Description | Exemple |
|-------|------|-------------|---------|
| `profile_id` | UUID \| null | ID du profil associé (optionnel) | `def-456-uvw` ou `null` |
| `user_id` | UUID | ID de l'utilisateur propriétaire | `ghi-789-rst` |
| `user_email` | String | Email de l'utilisateur | `user@example.com` |
| `url_redirection` | String | URL de redirection du QR | `https://ofika.com/krsidoine` |
| `url_dashboard` | String | URL du dashboard | `https://ofika.com/dashboard/profiles` |

---

### 🏷️ Métadonnées

| Champ | Type | Description | Exemple |
|-------|------|-------------|---------|
| `type_carte` | String | Type de carte | `NFC_QR` |
| `version` | String | Version de la structure de données | `2.0` |
| `source` | String | Source de création | `onboarding_nfc` |

---

### 👥 Profil associé (optionnel)

Si un profil est associé à la carte, ce champ contient les informations supplémentaires :

```json
{
  "profil_associe": {
    "id": "def-456-uvw",
    "nom": "Koffi Renaud Sidoine",
    "bio": "Chef de projet passionné par la tech",
    "localisation": "Paris, France",
    "reseaux_sociaux": {
      "instagram": "https://instagram.com/koffi",
      "tiktok": "https://tiktok.com/@koffi",
      "linkedin": "https://linkedin.com/in/koffi",
      "autres": "https://koffi.com"
    }
  }
}
```

Si aucun profil n'est associé : `"profil_associe": null`

---

## 📝 Champs SUPPRIMÉS (depuis version 2.0)

Les champs suivants ne sont **PLUS envoyés** car ils ne sont plus dans `nfc_profiles` :

- ❌ `biographie` (stocké dans `profiles` si profil associé)
- ❌ `localisation` (stocké dans `profiles`)
- ❌ `instagram` (stocké dans `profiles`)
- ❌ `tiktok` (stocké dans `profiles`)
- ❌ `linkedin` (stocké dans `profiles`)
- ❌ `autres_liens` (stocké dans `profiles`)
- ❌ `nom_utilisateur` (colonne supprimée)
- ❌ `url_administration` (remplacé par `url_dashboard`)

**Alternative** : Ces informations sont maintenant disponibles dans l'objet `profil_associe` s'il existe.

---

## 🆕 Nouveautés Version 2.0

### ✅ Ajouté

1. **URLs permanentes Supabase Storage** :
   - `logo_url` pointe vers Supabase Storage (au lieu de blob: temporaire)
   - `photo_profil_url` idem

2. **Structure profil_associe** :
   - Toutes les infos du profil regroupées dans un seul objet
   - Plus facile à parser dans Make.com

3. **Données depuis nfc_profiles** :
   - Les données viennent directement de la carte NFC créée
   - Plus fiable que le fallback sur profileDetails

### 🔄 Modifié

1. **Version** : `1.0` → `2.0`
2. **url_administration** → **url_dashboard**
3. Source des données : `profileDetails` → `data` (carte NFC elle-même)

---

## 📋 Exemple complet de payload

```json
{
  "event": "NFC_CARD_CREATED",
  "data": {
    "carte_id": "abc-123-xyz",
    "nom_profil": "Koffi Renaud",
    "lien_nfc": "https://ofika.vercel.app/krsidoine",
    "lien_page_publique": "https://ofika.vercel.app/krsidoine",
    "qr_code_url": "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=...",
    "choix_design": "design1",
    "theme_couleur": "black",
    "statut": "active",
    "date_creation": "2025-12-08T00:50:00Z",
    
    "nom_complet": "Koffi Renaud Sidoine",
    "entreprise": "Ofika",
    "poste": "Chef de Projet",
    "telephone": "+33 6 12 34 56 78",
    "email": "koffi@ofika.com",
    
    "logo_url": "https://graqvtzmefiwsafaubcw.supabase.co/storage/v1/object/public/nfc-assets/logos/user123/1733702400000.png",
    "photo_profil_url": "",
    
    "url_personnalisee": "/krsidoine",
    
    "profile_id": null,
    "user_id": "ghi-789-rst",
    "user_email": "user@example.com",
    "url_redirection": "https://ofika.vercel.app/krsidoine",
    "url_dashboard": "https://ofika.vercel.app/dashboard/profiles",
    
    "type_carte": "NFC_QR",
    "version": "2.0",
    "source": "onboarding_nfc",
    
    "profil_associe": null
  },
  "user_id": "ghi-789-rst",
  "user_email": "user@example.com"
}
```

---

## 🔧 Configuration Make.com

### Scénario suggéré

1. **Webhook** : Recevoir les données
2. **Router** :
   - Branche 1 : Si `profil_associe` existe → Traiter avec réseaux sociaux
   - Branche 2 : Sinon → Traiter carte simple
3. **Actions** :
   - Envoyer email de confirmation
   - Ajouter à CRM
   - Créer tâche de suivi
   - Etc.

### Filtres utiles

```javascript
// Vérifier si logo présent
{{data.logo_url}} != ""

// Vérifier si profil associé
{{data.profil_associe}} != null

// Vérifier version
{{data.version}} == "2.0"
```

---

## 📞 Support

Si des champs manquent ou si vous avez besoin de données supplémentaires, contactez l'équipe technique.
