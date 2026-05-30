# 🎯 Système de QR Code Dynamique

## Vue d'ensemble

Le système de QR Code dynamique permet de créer des QR codes dont la destination peut être modifiée **sans avoir à réimprimer le QR code**. C'est particulièrement utile pour les cartes NFC et les supports imprimés.

## 🔄 Comment ça fonctionne ?

### Architecture

```
┌─────────────┐
│  QR Code    │  →  Pointe vers: https://votre-domaine.com/qr/abc12345
└─────────────┘
       ↓
┌─────────────┐
│ Redirection │  →  Redirige vers: https://votre-domaine.com/nfc/xyz789
│  (Modifiable)│     (Cette URL peut être changée à tout moment)
└─────────────┘
       ↓
┌─────────────┐
│ Destination │  →  Page finale (profil, site web, etc.)
└─────────────┘
```

### Avantages

✅ **Modifiable** : Changez la destination sans réimprimer
✅ **Tracking** : Statistiques détaillées des scans
✅ **Contrôle** : Activez/désactivez les QR codes
✅ **Analytics** : Appareil, localisation, date/heure
✅ **Gratuit** : Pas de service tiers payant

## 📊 Base de données

### Table `qr_redirects`

Stocke les redirections QR code :

```sql
- id (UUID)
- user_id (UUID)
- short_code (TEXT) - Code unique de 8 caractères
- nfc_link (TEXT) - URL de destination (modifiable)
- redirect_type (TEXT) - 'nfc_card' | 'profile' | 'custom'
- title (TEXT)
- description (TEXT)
- scan_count (INTEGER)
- last_scanned_at (TIMESTAMP)
- is_active (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Table `qr_scans`

Enregistre chaque scan pour analytics :

```sql
- id (UUID)
- qr_redirect_id (UUID)
- scanned_at (TIMESTAMP)
- user_agent (TEXT)
- device_type (TEXT) - 'mobile' | 'tablet' | 'desktop'
- os (TEXT) - 'iOS', 'Android', etc.
- browser (TEXT)
- ip_address (TEXT)
- country (TEXT)
- city (TEXT)
- referrer (TEXT)
```

## 🚀 Utilisation

### 1. Créer un QR Code dynamique

```typescript
import { createQRRedirect, getQRCodeURL } from '@/lib/services/qr-redirect'

// Créer la redirection
const result = await createQRRedirect({
  nfc_link: 'https://exemple.com/mon-profil',
  redirect_type: 'nfc_card',
  title: 'Ma Carte NFC',
  description: 'Carte de visite digitale'
})

if (result.success) {
  const shortCode = result.data.short_code
  const qrCodeUrl = getQRCodeURL(shortCode, 300) // Taille 300x300
  
  console.log('QR Code:', qrCodeUrl)
  console.log('URL courte:', `https://votre-domaine.com/qr/${shortCode}`)
}
```

### 2. Modifier la destination

```typescript
import { updateQRRedirect } from '@/lib/services/qr-redirect'

await updateQRRedirect('qr-id', {
  nfc_link: 'https://nouvelle-destination.com',
  title: 'Nouveau titre'
})
```

### 3. Récupérer les statistiques

```typescript
import { getQRRedirectStats } from '@/lib/services/qr-redirect'

const stats = await getQRRedirectStats('qr-id')

console.log('Total scans:', stats.data.total_scans)
console.log('Scans aujourd\'hui:', stats.data.scans_today)
console.log('Top appareils:', stats.data.top_devices)
console.log('Top pays:', stats.data.top_countries)
```

### 4. Activer/Désactiver

```typescript
await updateQRRedirect('qr-id', {
  is_active: false // Désactive le QR code
})
```

## 🎨 Interface utilisateur

### Page de gestion

Accédez à `/dashboard/qr-codes` pour :

- ✅ Voir tous vos QR codes
- ✅ Modifier les destinations
- ✅ Voir les statistiques
- ✅ Télécharger les QR codes
- ✅ Activer/désactiver
- ✅ Supprimer

### Créer un nouveau QR code

1. Allez sur `/dashboard/qr-codes`
2. Cliquez sur "Nouveau QR Code"
3. Entrez l'URL de destination
4. Ajoutez un titre et description (optionnel)
5. Cliquez sur "Créer"
6. Téléchargez votre QR code

## 📈 Analytics

### Métriques disponibles

- **Scans totaux** : Nombre total de scans
- **Scans aujourd'hui** : Scans des dernières 24h
- **Scans cette semaine** : Scans des 7 derniers jours
- **Scans ce mois** : Scans des 30 derniers jours
- **Dernier scan** : Date/heure du dernier scan
- **Top appareils** : Répartition mobile/tablet/desktop
- **Top pays** : Pays d'origine des scans
- **Graphique** : Évolution des scans sur 30 jours

### Données collectées

Pour chaque scan :
- Date et heure
- Type d'appareil (mobile, tablet, desktop)
- Système d'exploitation (iOS, Android, Windows, etc.)
- Navigateur (Chrome, Safari, Firefox, etc.)
- Adresse IP
- Pays et ville (si disponible)
- Page référente

## 🔒 Sécurité

### Row Level Security (RLS)

- Les utilisateurs ne peuvent voir que leurs propres QR codes
- Les redirections actives sont publiques (pour la redirection)
- Les scans sont liés aux QR codes de l'utilisateur

### Permissions

```sql
-- Lecture : Ses propres redirections
-- Création : Ses propres redirections
-- Modification : Ses propres redirections
-- Suppression : Ses propres redirections
```

## 🔧 Configuration

### Variables d'environnement

```env
NEXT_PUBLIC_APP_URL=https://votre-domaine.com
```

Cette URL est utilisée pour générer les liens de redirection.

## 📱 Intégration avec les cartes NFC

### Lors de la création d'une carte NFC

```typescript
import { generateQRCode } from '@/lib/services/qr-code'

// Génère automatiquement un QR code dynamique
const qrResult = await generateQRCode(nfcLink)

if (qrResult.success) {
  // Sauvegarder dans la carte NFC
  await supabase
    .from('nfc_profiles')
    .update({
      qr_code_url: qrResult.data.qr_code_url,
      qr_redirect_id: qrResult.data.redirect_id
    })
    .eq('id', cardId)
}
```

### Modifier la destination d'une carte NFC

```typescript
// Récupérer l'ID de redirection de la carte
const { data: card } = await supabase
  .from('nfc_profiles')
  .select('qr_redirect_id')
  .eq('id', cardId)
  .single()

// Modifier la destination
await updateQRRedirect(card.qr_redirect_id, {
  nfc_link: 'https://nouveau-profil.com'
})

// Le QR code imprimé fonctionne toujours !
```

## 🎯 Cas d'usage

### 1. Cartes de visite NFC

Imprimez un QR code sur votre carte. Si vous changez de profil ou de site web, modifiez simplement la destination sans réimprimer.

### 2. Affiches et flyers

Utilisez un QR code dynamique sur vos supports imprimés. Changez la destination selon vos campagnes.

### 3. Menus restaurant

Un seul QR code imprimé, changez le menu quotidiennement.

### 4. Événements

Réutilisez le même QR code pour différents événements en changeant la destination.

## 📊 Exemple de statistiques

```typescript
{
  total_scans: 1250,
  scans_today: 45,
  scans_this_week: 320,
  scans_this_month: 890,
  last_scan: "2024-10-31T10:30:00Z",
  top_devices: [
    { device: "mobile", count: 850 },
    { device: "desktop", count: 300 },
    { device: "tablet", count: 100 }
  ],
  top_countries: [
    { country: "France", count: 600 },
    { country: "Belgique", count: 200 },
    { country: "Suisse", count: 150 }
  ],
  scans_by_day: [
    { date: "2024-10-01", count: 25 },
    { date: "2024-10-02", count: 32 },
    // ... 30 jours
  ]
}
```

## 🚀 Migration depuis QR codes statiques

Si vous avez des QR codes statiques existants :

1. Créez une redirection pour chaque QR code
2. Notez le nouveau `short_code`
3. Générez les nouveaux QR codes
4. Remplacez progressivement les anciens

## 💡 Conseils

1. **Testez toujours** : Scannez le QR code avant de l'imprimer
2. **Titre descriptif** : Facilitez la gestion avec des titres clairs
3. **Surveillez les stats** : Vérifiez régulièrement les scans
4. **Sauvegardez** : Téléchargez vos QR codes en haute résolution
5. **URL courtes** : Les URL de destination courtes scannent mieux

## 🔄 Workflow complet

```
1. Créer un QR code dynamique
   ↓
2. Télécharger l'image du QR code
   ↓
3. Imprimer sur carte/affiche/flyer
   ↓
4. Distribuer
   ↓
5. Suivre les scans en temps réel
   ↓
6. Modifier la destination si besoin
   ↓
7. Le QR code continue de fonctionner !
```

## 📞 Support

Pour toute question ou problème :
- Consultez les logs dans la console
- Vérifiez que la migration SQL a été exécutée
- Assurez-vous que `NEXT_PUBLIC_APP_URL` est configuré

---

**Créé le** : 31 octobre 2024
**Version** : 1.0.0
**Statut** : ✅ Production Ready
