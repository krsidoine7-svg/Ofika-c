# 📱 Comment fonctionnent les QR codes Ofika

## 🎯 Explication du lien : `http://localhost:3000/qr/0dSShblf`

### Qu'est-ce qui se passe quand vous scannez ce QR ?

```
📱 SCAN QR CODE
    ↓
🌐 http://localhost:3000/qr/0dSShblf
    ↓
🔍 Recherche dans la base de données
    ↓
📊 Enregistre le scan (statistiques)
    ↓
🚀 Redirige vers votre profil ou URL cible
```

---

## 🔍 Vérifier votre QR code

### Dans Supabase SQL Editor

1. Ouvrez `supabase/CHECK_QR_CODE.sql`
2. Remplacez `'0dSShblf'` par votre short code
3. Exécutez le script

**Résultat :**
```
📱 INFORMATIONS DU QR CODE
========================================
Short code: 0dSShblf
Titre: Mon Profil Pro
URL cible: https://ofika.com/krsidoine
Statut: ✅ ACTIF
Nombre de scans: 15
========================================
```

---

## 📊 Structure de la base de données

### Table `qr_redirects`

| Colonne | Description | Exemple |
|---------|-------------|---------|
| `id` | Identifiant unique | uuid |
| `short_code` | Code court pour l'URL | `0dSShblf` |
| `nfc_link` | Destination finale | `https://ofika.com/krsidoine` |
| `title` | Titre du QR code | "Mon Profil Pro" |
| `description` | Description | "QR code carte NFC" |
| `is_active` | Actif ou désactivé | `true` / `false` |
| `scan_count` | Nombre de scans | `15` |
| `user_id` | Propriétaire | uuid |
| `created_at` | Date de création | timestamp |

### Table `qr_scans` (Statistiques)

| Colonne | Description |
|---------|-------------|
| `short_code` | Code du QR scanné |
| `scanned_at` | Date/heure du scan |
| `user_agent` | Appareil utilisé (iPhone, Android...) |
| `ip_address` | Adresse IP du scan |
| `referrer` | Provenance |

---

## 🎨 Flux de redirection

### 1. Scan du QR code
L'utilisateur scanne le QR qui contient : `http://localhost:3000/qr/0dSShblf`

### 2. Page de redirection
Le serveur :
- ✅ Vérifie que le QR existe
- ✅ Vérifie qu'il est actif
- ✅ Enregistre le scan (date, appareil, IP)
- ✅ Affiche une page de transition
- 🚀 Redirige automatiquement vers l'URL cible

### 3. Arrivée à destination
L'utilisateur arrive sur votre profil : `https://ofika.com/krsidoine`

---

## 🛠️ Comment gérer vos QR codes

### Créer un nouveau QR code

1. Allez dans **Dashboard** → **QR Codes**
2. Cliquez sur **"Nouveau QR Code"**
3. Remplissez :
   - **URL cible** : Où voulez-vous rediriger (ex: votre profil)
   - **Titre** : Nom du QR code (pour vous)
   - **Description** : Note personnelle
4. Le système génère automatiquement :
   - Un **short code** unique (ex: `0dSShblf`)
   - Un **QR code téléchargeable**

### Voir les statistiques

Dans **Dashboard** → **QR Codes** → Cliquez sur un QR :
- 📊 Nombre total de scans
- 📅 Date de chaque scan
- 📱 Type d'appareil utilisé
- 🌍 Localisation (IP)

### Désactiver un QR code

Si vous perdez votre carte NFC ou voulez arrêter les redirections :
1. Allez dans **Dashboard** → **QR Codes**
2. Trouvez le QR code
3. Toggle **"Actif"** → OFF

Le QR affichera maintenant : "QR Code désactivé"

---

## 🔐 Sécurité

### Rate Limiting
- Maximum 10 scans par IP par minute
- Protection contre les abus

### Validation
- Vérification que le QR existe
- Vérification qu'il est actif
- Vérification de l'URL cible (pas de phishing)

### Tracking
- Tous les scans sont enregistrés
- Vous pouvez voir qui a scanné quand

---

## 🌐 Environnements

### Développement (localhost)
```
http://localhost:3000/qr/0dSShblf
```

### Production
```
https://ofika.com/qr/0dSShblf
```

Le short code reste le même, seul le domaine change !

---

## 🎯 Cas d'usage

### Carte NFC professionnelle
```
QR Code → Profil professionnel
https://ofika.com/krsidoine
```

### Événement temporaire
```
QR Code → Formulaire d'inscription
https://forms.google.com/xxxxx
```

### Promotion limitée
```
QR Code (actif 1 semaine) → Landing page promo
Puis désactiver après l'événement
```

---

## 🐛 Troubleshooting

### "QR Code introuvable"
**Problème** : Le short code n'existe pas dans la base  
**Solution** : Vérifiez le short code avec `CHECK_QR_CODE.sql`

### "QR Code désactivé"
**Problème** : `is_active = false`  
**Solution** : Réactivez-le dans le dashboard

### Pas de redirection
**Problème** : JavaScript bloqué ou URL invalide  
**Solution** : Cliquez sur le bouton "Ouvrir" manuellement

### Statistiques ne s'affichent pas
**Problème** : Fonction RPC manquante  
**Solution** : Exécutez les scripts de setup des QR codes

---

## 📖 Fichiers liés

- `app/qr/[shortCode]/page.tsx` - Page de redirection
- `lib/services/qr-redirect.ts` - Logique de tracking
- `lib/utils/qr-validation.ts` - Validation et sécurité
- `supabase/CHECK_QR_CODE.sql` - Vérifier un QR

---

## 💡 Astuces

### Personnaliser le QR code
Utilisez un service comme QR Code Monkey pour :
- Ajouter votre logo au centre
- Changer les couleurs
- Personnaliser le design

L'important : gardez l'URL `http://localhost:3000/qr/0dSShblf` !

### Imprimer sur carte NFC
1. Générez le QR code
2. Téléchargez en haute résolution (300 DPI minimum)
3. Format PNG ou SVG
4. Imprimez sur votre carte NFC

### Analytics avancées
Connectez les données `qr_scans` à Google Analytics ou Mixpanel pour :
- Voir les tendances
- Comparer les performances
- Optimiser vos campagnes

---

**Exécutez `CHECK_QR_CODE.sql` pour voir où pointe votre QR code `0dSShblf` ! 🚀**
