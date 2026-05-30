# 📊 Système d'Analytics - Ofika

## Vue d'ensemble

Le système d'analytics d'Ofika permet de tracker et analyser les performances de vos profils et cartes NFC/QR. Il comprend le tracking des vues, clics, scans QR et actions de contacts.

## 🏗️ Architecture

### Composants Principaux

1. **Services de Tracking**
   - `lib/services/profile-analytics.ts` - Tracking des vues, clics et scans
   - `lib/services/contact-analytics.ts` - Tracking des actions de contacts

2. **Hooks React**
   - `lib/hooks/useProfileAnalytics.ts` - Hook pour les analytics de profils
   - `lib/hooks/useContactAnalytics.ts` - Hook pour les analytics de contacts

3. **Composants UI**
   - `components/ContactAnalytics.tsx` - Composant d'affichage des analytics de contacts
   - `components/features/analytics/AnalyticsSummary.tsx` - Résumé des analytics
   - `components/features/analytics/AnalyticsCharts.tsx` - Graphiques avancés
   - `components/features/analytics/AnalyticsNotifications.tsx` - Notifications temps réel
   - `components/features/analytics/AnalyticsTest.tsx` - Outil de test

4. **Pages**
   - `app/dashboard/analytics/page.tsx` - Page analytics complète
   - `app/dashboard/page.tsx` - Dashboard principal avec analytics intégrés

## 📈 Types d'Événements Trackés

### Analytics de Profils
- **`profile_viewed`** - Vue d'un profil public
- **`link_clicked`** - Clic sur un lien dans un profil
- **`qr_scanned`** - Scan d'un QR code

### Analytics de Contacts
- **`vcard_generated`** - Génération d'une vCard
- **`vcard_downloaded`** - Téléchargement d'une vCard
- **`vcard_shared`** - Partage d'une vCard

## 🗄️ Base de Données

### Tables Utilisées

1. **`analytics_events`** - Événements généraux
   ```sql
   - id (UUID)
   - profile_id (UUID)
   - event_type (VARCHAR)
   - event_data (JSONB)
   - user_agent (TEXT)
   - device_type (VARCHAR)
   - created_at (TIMESTAMP)
   ```

2. **`contact_analytics`** - Analytics spécifiques aux contacts
   ```sql
   - id (UUID)
   - profile_id (UUID)
   - action_type (VARCHAR)
   - user_agent (TEXT)
   - device_type (VARCHAR)
   - created_at (TIMESTAMP)
   ```

## 🚀 Utilisation

### 1. Tracking Automatique

Le tracking est automatiquement activé sur :
- Pages de profils publics (`app/nfc-profile/[profileId]/page.tsx`)
- Composants de partage de contacts (`components/AddToContactsButton.tsx`)
- Liens dans les profils publics (`components/features/profiles/PublicProfile.tsx`)

### 2. Utilisation des Hooks

```typescript
import { useProfileAnalytics } from '@/lib/hooks/useProfileAnalytics'
import { useContactAnalytics } from '@/lib/hooks/useContactAnalytics'

function MyComponent({ profileId }: { profileId: string }) {
  const { analytics, trackView, trackClick } = useProfileAnalytics(profileId)
  const { stats, trackAction } = useContactAnalytics(profileId)

  // Tracking manuel
  const handleView = () => trackView()
  const handleClick = () => trackClick('link-id', 'https://example.com')
  const handleContact = () => trackAction('vcard_generated')
}
```

### 3. Affichage des Analytics

```typescript
import { AnalyticsSummary } from '@/components/features/analytics/AnalyticsSummary'

function Dashboard() {
  return (
    <AnalyticsSummary 
      profileId="profile-id"
      profileName="Mon Profil"
    />
  )
}
```

## 📊 Métriques Disponibles

### Analytics de Profils
- **Vues totales** - Nombre total de vues du profil
- **Clics sur liens** - Nombre de clics sur les liens
- **Scans QR** - Nombre de scans de QR codes
- **Répartition par appareil** - Mobile, Desktop, Tablet
- **Évolution temporelle** - 7 jours, 30 jours

### Analytics de Contacts
- **Actions totales** - Génération + Téléchargement + Partage
- **Téléchargements** - Nombre de vCards téléchargées
- **Partages** - Nombre de vCards partagées
- **Répartition par appareil** - Mobile, Desktop, Tablet

## 🎨 Interface Utilisateur

### Dashboard Principal
- Résumé des analytics pour chaque profil
- Notifications en temps réel
- Liens vers la page analytics complète

### Page Analytics Complète
- Graphiques interactifs (Recharts)
- Filtres par profil et période
- Export des données (CSV/JSON)
- Comparaison des profils
- Outil de test intégré

### Composants de Test
- Test des fonctionnalités de tracking
- Simulation d'événements
- Validation des données

## 🔧 Configuration

### Variables d'Environnement
Aucune configuration supplémentaire requise. Le système utilise la configuration Supabase existante.

### Permissions
- **Lecture** : Utilisateurs authentifiés peuvent voir leurs propres analytics
- **Écriture** : Insertion publique autorisée pour le tracking
- **RLS** : Politiques de sécurité activées

## 🧪 Tests

### Test Automatique
Utilisez le composant `AnalyticsTest` pour valider le fonctionnement :

```typescript
<AnalyticsTest profileId="your-profile-id" />
```

### Test Manuel
1. Visitez un profil public
2. Cliquez sur des liens
3. Scannez un QR code
4. Téléchargez/partagez un contact
5. Vérifiez les données dans `/dashboard/analytics`

## 📈 Performance

### Optimisations
- Index sur les colonnes fréquemment utilisées
- Pagination des résultats
- Mise en cache des statistiques
- Nettoyage automatique des anciennes données

### Limites
- Conservation des données : 1 an
- Taux de requêtes : Limité par Supabase
- Taille des événements : JSONB limité

## 🚨 Dépannage

### Problèmes Courants

1. **Analytics ne s'affichent pas**
   - Vérifiez que le profil existe
   - Vérifiez les permissions RLS
   - Consultez la console pour les erreurs

2. **Tracking ne fonctionne pas**
   - Vérifiez la connexion Supabase
   - Vérifiez les politiques RLS
   - Testez avec le composant AnalyticsTest

3. **Données incorrectes**
   - Vérifiez les types d'événements
   - Vérifiez les filtres de date
   - Consultez les logs de la base de données

### Logs et Debug
- Console du navigateur pour les erreurs client
- Logs Supabase pour les erreurs serveur
- Composant AnalyticsTest pour les tests

## 🔮 Évolutions Futures

### Fonctionnalités Prévues
- Analytics en temps réel avec Supabase Realtime
- Notifications push pour les événements importants
- Segmentation des utilisateurs
- A/B testing des profils
- Intégration avec Google Analytics
- Rapports automatisés par email

### Améliorations Techniques
- Cache Redis pour les performances
- Compression des données
- Machine Learning pour les insights
- API REST pour les analytics
- Webhooks pour les intégrations

## 📚 Ressources

- [Documentation Supabase](https://supabase.com/docs)
- [Recharts Documentation](https://recharts.org/)
- [Date-fns Documentation](https://date-fns.org/)
- [Next.js Analytics](https://nextjs.org/docs/advanced-features/measuring-performance)
