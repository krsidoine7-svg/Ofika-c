# 📊 Statistiques QR Code - Système Réel et Connecté

## ✅ Les statistiques sont 100% RÉELLES

Les statistiques ne sont **PAS mockées** ! Elles proviennent directement de la base de données Supabase et sont enregistrées à chaque scan du QR code.

## 🔄 Comment ça fonctionne

### 1. Quand quelqu'un scanne le QR code

```
┌─────────────────────────────────────────────────────────┐
│  1. Utilisateur scanne le QR code                       │
│     QR Code → https://votre-domaine.com/qr/abc12345     │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  2. Page de redirection (/qr/[shortCode]/page.tsx)     │
│     - Récupère la destination depuis la BDD            │
│     - Enregistre le scan dans qr_scans                 │
│     - Incrémente le compteur scan_count                │
│     - Met à jour last_scanned_at                       │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  3. Données enregistrées dans Supabase                  │
│     Table: qr_scans                                     │
│     - Date/heure du scan                                │
│     - Type d'appareil (mobile/tablet/desktop)          │
│     - Système d'exploitation (iOS/Android/Windows)     │
│     - Navigateur (Chrome/Safari/Firefox)               │
│     - Adresse IP                                        │
│     - Pays et ville (si disponible)                    │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  4. Redirection vers la destination finale              │
│     → https://destination-finale.com                    │
└─────────────────────────────────────────────────────────┘
```

## 📊 Données collectées (RÉELLES)

### Table `qr_scans` (Supabase)

Chaque scan crée une nouvelle ligne :

```sql
INSERT INTO qr_scans (
  qr_redirect_id,     -- ID de la redirection
  scanned_at,         -- Date/heure exacte
  user_agent,         -- "Mozilla/5.0 (iPhone; CPU iPhone OS..."
  device_type,        -- "mobile" | "tablet" | "desktop"
  os,                 -- "iOS" | "Android" | "Windows" | etc.
  browser,            -- "Chrome" | "Safari" | "Firefox" | etc.
  ip_address,         -- "192.168.1.1"
  country,            -- "France" (si géolocalisation activée)
  city,               -- "Paris" (si géolocalisation activée)
  referrer            -- Page d'origine
)
```

### Table `qr_redirects` (Supabase)

Mise à jour à chaque scan :

```sql
UPDATE qr_redirects SET
  scan_count = scan_count + 1,
  last_scanned_at = NOW()
WHERE short_code = 'abc12345'
```

## 📈 Calcul des statistiques

### Code réel dans `lib/services/qr-redirect.ts`

```typescript
// 1. Récupérer TOUS les scans depuis la BDD
const { data: scans } = await supabase
  .from('qr_scans')
  .select('*')
  .eq('qr_redirect_id', id)
  .order('scanned_at', { ascending: false })

// 2. Calculer les scans aujourd'hui (RÉEL)
const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
const scansToday = scans?.filter(s => new Date(s.scanned_at) >= today).length || 0

// 3. Calculer les scans cette semaine (RÉEL)
const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
const scansThisWeek = scans?.filter(s => new Date(s.scanned_at) >= weekAgo).length || 0

// 4. Calculer les scans ce mois (RÉEL)
const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
const scansThisMonth = scans?.filter(s => new Date(s.scanned_at) >= monthAgo).length || 0

// 5. Top appareils (RÉEL)
const deviceCounts: Record<string, number> = {}
scans?.forEach(scan => {
  if (scan.device_type) {
    deviceCounts[scan.device_type] = (deviceCounts[scan.device_type] || 0) + 1
  }
})

// 6. Top pays (RÉEL)
const countryCounts: Record<string, number> = {}
scans?.forEach(scan => {
  if (scan.country) {
    countryCounts[scan.country] = (countryCounts[scan.country] || 0) + 1
  }
})

// 7. Scans par jour sur 30 jours (RÉEL)
const scansByDay: Record<string, number> = {}
for (let i = 0; i < 30; i++) {
  const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
  const dateStr = date.toISOString().split('T')[0]
  scansByDay[dateStr] = 0
}
scans?.forEach(scan => {
  const dateStr = scan.scanned_at.split('T')[0]
  if (scansByDay[dateStr] !== undefined) {
    scansByDay[dateStr]++
  }
})
```

## 🎯 Exemple concret

### Scénario : Vous créez un QR code

1. **Création** :
```typescript
// Vous créez un QR code
URL: https://mon-site.com/profil
→ Génère: https://votre-domaine.com/qr/xyz789
→ Enregistré dans qr_redirects avec scan_count = 0
```

2. **Premier scan** (iPhone, Safari, France) :
```sql
-- Insertion dans qr_scans
INSERT INTO qr_scans VALUES (
  scanned_at: '2024-10-31 12:30:00',
  device_type: 'mobile',
  os: 'iOS',
  browser: 'Safari',
  country: 'France'
)

-- Mise à jour de qr_redirects
UPDATE qr_redirects SET
  scan_count = 1,
  last_scanned_at = '2024-10-31 12:30:00'
```

3. **Deuxième scan** (Android, Chrome, Belgique) :
```sql
-- Nouvelle insertion dans qr_scans
INSERT INTO qr_scans VALUES (
  scanned_at: '2024-10-31 14:15:00',
  device_type: 'mobile',
  os: 'Android',
  browser: 'Chrome',
  country: 'Belgique'
)

-- Mise à jour de qr_redirects
UPDATE qr_redirects SET
  scan_count = 2,
  last_scanned_at = '2024-10-31 14:15:00'
```

4. **Statistiques affichées** :
```
Total scans: 2
Scans aujourd'hui: 2
Top appareils: mobile (100%)
Top pays: France (50%), Belgique (50%)
```

## 🔍 Vérification dans Supabase

### Pour voir les données réelles :

1. **Ouvrez Supabase Dashboard**
2. **Table Editor → qr_redirects**
   - Vous verrez : `scan_count`, `last_scanned_at`
3. **Table Editor → qr_scans**
   - Vous verrez : Toutes les lignes de scans avec détails

### Requête SQL pour vérifier :

```sql
-- Voir tous les scans d'un QR code
SELECT 
  scanned_at,
  device_type,
  os,
  browser,
  country
FROM qr_scans
WHERE qr_redirect_id = 'votre-qr-id'
ORDER BY scanned_at DESC;

-- Compter les scans par appareil
SELECT 
  device_type,
  COUNT(*) as count
FROM qr_scans
WHERE qr_redirect_id = 'votre-qr-id'
GROUP BY device_type;
```

## 📱 Test en temps réel

### Pour tester que c'est bien réel :

1. **Créez un QR code** sur `/dashboard/qr-codes/new`
2. **Notez le scan_count** (devrait être 0)
3. **Scannez le QR code** avec votre téléphone
4. **Rafraîchissez la page** `/dashboard/qr-codes`
5. **Le scan_count a augmenté** ! 🎉
6. **Cliquez sur "Statistiques"**
7. **Vous voyez** :
   - Total scans: 1
   - Scans aujourd'hui: 1
   - Top appareils: mobile (ou desktop si scanné depuis PC)
   - Graphique avec 1 scan aujourd'hui

## 🎨 Interface des statistiques

### Page `/dashboard/qr-codes/[id]/stats`

**Données affichées (TOUTES RÉELLES)** :

```typescript
{
  total_scans: 1250,           // Depuis qr_redirects.scan_count
  scans_today: 45,             // Calculé depuis qr_scans
  scans_this_week: 320,        // Calculé depuis qr_scans
  scans_this_month: 890,       // Calculé depuis qr_scans
  last_scan: "2024-10-31...",  // Depuis qr_redirects.last_scanned_at
  
  top_devices: [               // Calculé depuis qr_scans
    { device: "mobile", count: 850 },
    { device: "desktop", count: 300 }
  ],
  
  top_countries: [             // Calculé depuis qr_scans
    { country: "France", count: 600 },
    { country: "Belgique", count: 200 }
  ],
  
  scans_by_day: [              // Calculé depuis qr_scans
    { date: "2024-10-01", count: 25 },
    { date: "2024-10-02", count: 32 }
  ]
}
```

## ⚡ Performance

### Optimisations :

1. **Index sur les colonnes** :
```sql
CREATE INDEX idx_qr_scans_redirect_id ON qr_scans(qr_redirect_id);
CREATE INDEX idx_qr_scans_scanned_at ON qr_scans(scanned_at DESC);
```

2. **Requête unique** pour récupérer tous les scans
3. **Calculs côté client** pour éviter les requêtes multiples
4. **Cache possible** avec React Query (à implémenter si besoin)

## 🔒 Sécurité

### Row Level Security (RLS) :

```sql
-- Seul le propriétaire peut voir ses statistiques
CREATE POLICY "Users can view own scans"
  ON qr_scans FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM qr_redirects
      WHERE qr_redirects.id = qr_scans.qr_redirect_id
      AND qr_redirects.user_id = auth.uid()
    )
  );
```

## 🎯 Résumé

| Aspect | Statut |
|--------|--------|
| **Données** | ✅ 100% Réelles depuis Supabase |
| **Tracking** | ✅ Automatique à chaque scan |
| **Calculs** | ✅ En temps réel depuis la BDD |
| **Graphiques** | ✅ Basés sur données réelles |
| **Appareils** | ✅ Détectés automatiquement |
| **Pays** | ✅ Géolocalisation IP (si activée) |
| **Temps réel** | ✅ Mise à jour instantanée |

## 🚀 Prochaines améliorations possibles

1. **Géolocalisation IP** : Intégrer un service comme ipapi.co
2. **WebSocket** : Mise à jour en temps réel sans refresh
3. **Export CSV** : Télécharger les statistiques
4. **Alertes** : Notification quand seuil de scans atteint
5. **Comparaison** : Comparer plusieurs QR codes
6. **Heatmap** : Carte mondiale des scans

---

**Conclusion** : Les statistiques sont **100% réelles et connectées à Supabase**. Chaque scan est enregistré et les données sont calculées en temps réel depuis la base de données. Aucune donnée n'est mockée ! 🎉
