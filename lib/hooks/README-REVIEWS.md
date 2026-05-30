# 🎣 Hooks React Query - Module Avis Clients

Documentation des hooks personnalisés pour interagir avec les API du module de collecte d'avis clients.

---

## 📁 Fichiers

```
lib/hooks/
├── useReviewLinks.ts       # Gestion des liens de collecte
├── useReviews.ts           # Gestion des avis
├── useSubmitReview.ts      # Soumission d'avis (public)
└── useExportReviews.ts     # Export CSV/JSON
```

---

## 🔗 `useReviewLinks.ts`

### `useReviewLinks(options?)`

Récupère tous les liens de collecte de l'utilisateur connecté.

```tsx
import { useReviewLinks } from '@/lib/hooks/useReviewLinks'

function MyComponent() {
  const { data: links, isLoading, error } = useReviewLinks({
    active_only: true // Optionnel
  })
  
  if (isLoading) return <div>Chargement...</div>
  
  return (
    <ul>
      {links?.map(link => (
        <li key={link.id}>
          {link.title} - {link.stats?.total_reviews} avis
        </li>
      ))}
    </ul>
  )
}
```

**Options**:
- `active_only` (boolean): Si true, ne retourne que les liens actifs

**Retour**: `ReviewLink[]`

---

### `useReviewLink(id)`

Récupère un lien spécifique avec ses statistiques détaillées.

```tsx
const { data: link, isLoading } = useReviewLink(linkId)

if (link) {
  console.log(link.stats.avg_rating) // 4.5
  console.log(link.public_url) // https://ofika.com/avis/...
}
```

---

### `useCreateReviewLink()`

Crée un nouveau lien de collecte.

```tsx
import { useCreateReviewLink } from '@/lib/hooks/useReviewLinks'

function CreateLinkButton() {
  const { mutate: createLink, isPending } = useCreateReviewLink()
  
  const handleCreate = () => {
    createLink({
      title: 'Avis sur notre pizza',
      fields_config: {
        email_required: true,
        media_enabled: true,
      }
    })
  }
  
  return (
    <button onClick={handleCreate} disabled={isPending}>
      {isPending ? 'Création...' : 'Créer un lien'}
    </button>
  )
}
```

**Fonctionnalités**:
- ✅ Invalidation automatique du cache
- ✅ Toast de succès/erreur
- ✅ Ajout optimiste au cache

---

### `useUpdateReviewLink(id)`

Modifie un lien existant.

```tsx
const { mutate: updateLink } = useUpdateReviewLink(linkId)

// Désactiver un lien
updateLink({ is_active: false })

// Changer le titre
updateLink({ title: 'Nouveau titre' })

// Modifier la config
updateLink({
  fields_config: {
    comment_required: true
  }
})
```

---

### `useDeleteReviewLink()`

Supprime un lien (et tous les avis associés).

```tsx
const { mutate: deleteLink } = useDeleteReviewLink()

const handleDelete = () => {
  if (confirm('Supprimer ce lien et tous les avis ?')) {
    deleteLink(linkId)
  }
}
```

**⚠️ Attention**: Suppression en cascade des avis !

---

### `useCopyReviewLink()`

Copie l'URL publique dans le presse-papier.

```tsx
const { mutate: copyLink } = useCopyReviewLink()

<button onClick={() => copyLink(link.public_url)}>
  📋 Copier le lien
</button>
```

---

## 📝 `useReviews.ts`

### `useReviews(linkId, filters?)`

Récupère tous les avis d'un lien avec filtres et pagination.

```tsx
import { useReviews } from '@/lib/hooks/useReviews'

function ReviewsList({ linkId }) {
  const { data, isLoading } = useReviews(linkId, {
    rating: 5,              // Filtre: avis 5 étoiles
    status: 'approved',     // Filtre: approuvés uniquement
    search: 'excellent',    // Recherche texte
    limit: 20,              // Pagination
    offset: 0,
  })
  
  return (
    <div>
      <p>Total: {data?.pagination.total}</p>
      {data?.data.map(review => (
        <div key={review.id}>
          {'⭐'.repeat(review.rating)} - {review.comment}
        </div>
      ))}
    </div>
  )
}
```

**Filtres disponibles**:
- `rating`: 1-5
- `status`: 'pending' | 'approved' | 'rejected'
- `search`: Recherche dans nom, email, commentaire
- `limit`: Nombre de résultats (max 100)
- `offset`: Pagination

---

### `useModerateReview(linkId)`

Modère un avis (approuver, rejeter, etc.).

```tsx
const { mutate: moderate } = useModerateReview(linkId)

// Approuver
moderate({
  reviewId: '123',
  input: {
    moderation_status: 'approved',
    is_verified: true,
    moderation_note: 'Avis vérifié authentique'
  }
})

// Rejeter
moderate({
  reviewId: '456',
  input: {
    moderation_status: 'rejected',
    is_public: false,
    moderation_note: 'Contenu inapproprié'
  }
})
```

---

### `useDeleteReview(linkId)`

Supprime un avis.

```tsx
const { mutate: deleteReview } = useDeleteReview(linkId)

<button onClick={() => deleteReview(reviewId)}>
  Supprimer
</button>
```

---

### `useReviewStats(linkId, filters?)`

Calcule les statistiques à partir des avis chargés.

```tsx
const stats = useReviewStats(linkId, { status: 'approved' })

console.log(stats.total)              // 42
console.log(stats.avgRating)          // 4.5
console.log(stats.positiveRate)       // 85.7
console.log(stats.ratingDistribution) // { 5: 20, 4: 15, ... }
console.log(stats.byStatus)           // { pending: 5, approved: 35, ... }
```

**Note**: Utilise les données du cache, pas de requête supplémentaire.

---

## 🌍 `useSubmitReview.ts`

### `useSubmitReview()`

Soumet un avis (formulaire public, pas d'auth requise).

```tsx
import { useSubmitReview, useGenerateFingerprint } from '@/lib/hooks/useSubmitReview'

function PublicReviewForm({ linkId }) {
  const { mutate: submitReview, isPending } = useSubmitReview()
  const { generateFingerprint } = useGenerateFingerprint()
  
  const handleSubmit = (formData) => {
    submitReview({
      link_id: linkId,
      rating: formData.rating,
      client_name: formData.name,
      client_email: formData.email,
      comment: formData.comment,
      has_purchase: formData.hasPurchase,
      fingerprint: generateFingerprint(), // Anti-fraude
    })
  }
  
  return (
    <form onSubmit={handleSubmit}>
      {/* ... champs */}
      <button type="submit" disabled={isPending}>
        {isPending ? 'Envoi...' : 'Envoyer mon avis'}
      </button>
    </form>
  )
}
```

**Gestion d'erreurs automatique**:
- ✅ Rate limit (429)
- ✅ Doublons (409)
- ✅ Validation (400)
- ✅ Toasts personnalisés

---

### `useGenerateFingerprint()`

Génère un hash unique du navigateur pour détecter les doublons.

```tsx
const { generateFingerprint } = useGenerateFingerprint()

const fingerprint = generateFingerprint()
// → "a1b2c3d4e5"
```

**Utilise**:
- User agent
- Langue
- Plateforme
- Résolution écran
- Timezone

---

## 📥 `useExportReviews.ts`

### `useExportReviews()`

Exporte les avis en CSV ou JSON.

```tsx
import { useExportReviews } from '@/lib/hooks/useExportReviews'

function ExportButton({ linkId }) {
  const { mutate: exportReviews, isPending } = useExportReviews()
  
  return (
    <>
      {/* Export CSV */}
      <button 
        onClick={() => exportReviews({ 
          linkId, 
          format: 'csv',
          filters: { status: 'approved' }
        })}
        disabled={isPending}
      >
        📥 Télécharger CSV
      </button>
      
      {/* Export JSON */}
      <button 
        onClick={() => exportReviews({ 
          linkId, 
          format: 'json' 
        })}
        disabled={isPending}
      >
        📊 Export JSON
      </button>
    </>
  )
}
```

**Format CSV**:
- Téléchargement automatique
- Nom de fichier généré
- Encodage UTF-8

**Format JSON**:
- Retourne les données + statistiques
- Peut être copié dans le presse-papier

---

### `useCopyExportToClipboard()`

Copie les données JSON exportées dans le presse-papier.

```tsx
const { mutate: exportReviews } = useExportReviews()
const { mutate: copyToClipboard } = useCopyExportToClipboard()

// Export puis copie
const handleExport = async () => {
  exportReviews(
    { linkId, format: 'json' },
    {
      onSuccess: (data) => {
        copyToClipboard(data)
      }
    }
  )
}
```

---

## 🔑 Query Keys

Chaque hook utilise des query keys standardisées pour React Query.

```tsx
// Review Links
reviewLinksKeys.all                    // ['review-links']
reviewLinksKeys.lists()                // ['review-links', 'list']
reviewLinksKeys.list({ active_only })  // ['review-links', 'list', { active_only }]
reviewLinksKeys.detail(id)             // ['review-links', 'detail', id]

// Reviews
reviewsKeys.all                        // ['reviews']
reviewsKeys.lists()                    // ['reviews', 'list']
reviewsKeys.list(linkId, filters)      // ['reviews', 'list', linkId, filters]
reviewsKeys.detail(id)                 // ['reviews', 'detail', id]
```

**Avantages**:
- Invalidation ciblée
- Cache cohérent
- Optimisation automatique

---

## ⚡ Optimisations

### Invalidation automatique du cache

Toutes les mutations invalident automatiquement les bonnes queries :

```tsx
// Après création d'un lien → invalide la liste
useCreateReviewLink() // → invalidates reviewLinksKeys.lists()

// Après modération → invalide les avis du lien
useModerateReview()   // → invalidates reviewsKeys.lists()
```

### Mise à jour optimiste

```tsx
// Le cache est mis à jour avant même la réponse serveur
const link = useCreateReviewLink()
// → Cache mis à jour instantanément
```

### Toasts intelligents

Chaque hook affiche automatiquement:
- ✅ Toast de succès avec message contextualisé
- ❌ Toast d'erreur avec détails
- ⏳ État de chargement dans les boutons

---

## 🧪 Exemple Complet

```tsx
'use client'

import { useState } from 'react'
import { useReviewLinks, useCreateReviewLink, useDeleteReviewLink } from '@/lib/hooks/useReviewLinks'
import { useReviews, useModerateReview } from '@/lib/hooks/useReviews'

export function ReviewsManager() {
  const [selectedLink, setSelectedLink] = useState<string | null>(null)
  
  // Liens
  const { data: links, isLoading: linksLoading } = useReviewLinks()
  const { mutate: createLink } = useCreateReviewLink()
  const { mutate: deleteLink } = useDeleteReviewLink()
  
  // Avis
  const { data: reviews } = useReviews(selectedLink, { status: 'pending' })
  const { mutate: moderate } = useModerateReview(selectedLink || '')
  
  if (linksLoading) return <div>Chargement...</div>
  
  return (
    <div>
      {/* Liste des liens */}
      <ul>
        {links?.map(link => (
          <li key={link.id} onClick={() => setSelectedLink(link.id)}>
            {link.title} ({link.stats?.total_reviews} avis)
            <button onClick={() => deleteLink(link.id)}>Supprimer</button>
          </li>
        ))}
      </ul>
      
      {/* Créer un lien */}
      <button onClick={() => createLink({ title: 'Nouveau lien' })}>
        + Créer
      </button>
      
      {/* Avis en attente */}
      {selectedLink && (
        <div>
          <h3>Avis en attente</h3>
          {reviews?.data.map(review => (
            <div key={review.id}>
              {'⭐'.repeat(review.rating)} - {review.comment}
              <button onClick={() => moderate({
                reviewId: review.id,
                input: { moderation_status: 'approved' }
              })}>
                Approuver
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

---

## 📦 Dépendances

- `@tanstack/react-query` ✅ (déjà installé dans Ofika)
- `sonner` ✅ (déjà installé)
- `@/lib/hooks/useAuth` ✅ (existant)

---

**Créé le**: 2025-12-08  
**Version**: 1.0  
**Module**: Avis Clients Ofika
