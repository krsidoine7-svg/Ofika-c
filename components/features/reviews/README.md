# 🎨 Co mposants UI - Module Avis Clients

Documentation des composants React pour l'interface utilisateur du module de collecte d'avis clients.

---

## 📁 Structure

```
components/features/reviews/
├── RatingStars.tsx           # Composant étoiles de notation
├── StatsCards.tsx            # Cartes de statistiques
├── CreateLinkDialog.tsx      # Modal création de lien
├── ReviewCard.tsx            # Carte affichage d'un avis
├── ReviewsTable.tsx          # Table avec filtres
├── PublicReviewForm.tsx      # Formulaire public
├── ExportButton.tsx          # Bouton export
└── index.ts                  # Export centralisé
```

---

## ⭐ `RatingStars.tsx`

Composant d'affichage et sélection d'étoiles de notation.

### `RatingStars`

```tsx
import { RatingStars } from '@/components/features/reviews'

// Affichage readonly
<RatingStars value={4.5} readonly size="md" />

// Sélection interactive
<RatingStars 
  value={rating} 
  onChange={setRating} 
  size="lg"
  showLabel
/>
```

**Props**:
- `value` (number): Note de 0 à 5
- `onChange?` ((value: number) => void): Callback de changement
- `readonly?` (boolean): Mode lecture seule
- `size?` ('sm' | 'md' | 'lg'): Taille des étoiles
- `showLabel?` (boolean): Afficher le label contextuel
- `className?` (string): Classes CSS additionnelles

**Labels contextuels**:
- 1 ⭐: "Décevant 😞"
- 2 ⭐: "Moyen 😐"
- 3 ⭐: "Bien 🙂"
- 4 ⭐: "Très bien 😊"
- 5 ⭐: "Excellent ! 🤩"

### `RatingStarsCompact`

Variante compacte pour affichage readonly avec note et compteur.

```tsx
<RatingStarsCompact value={4.5} count={42} />
// → ⭐⭐⭐⭐⭐ 4.5 (42)
```

---

## 📊 `StatsCards.tsx`

Cartes de statistiques pour le dashboard.

```tsx
import { StatsCards } from '@/components/features/reviews'
import { useReviewLinks } from '@/lib/hooks/useReviewLinks'

function Dashboard() {
  const { data: links } = useReviewLinks()
  
  return <StatsCards links={links} />
}
```

**Affiche**:
- Total des avis (tous liens)
- Note moyenne globale
- Taux d'avis positifs (4-5 ⭐)
- Nombre de liens actifs

**Features**:
- Calcul automatique des statistiques
- Variantes de couleur (primary, success, warning)
- Icônes emoji
- Responsive (grid 4 colonnes)

---

## ➕ `CreateLinkDialog.tsx`

Modal de création d'un nouveau lien de collecte.

```tsx
import { CreateLinkDialog } from '@/components/features/reviews'

// Avec bouton par défaut
<CreateLinkDialog />

// Avec trigger personnalisé
<CreateLinkDialog trigger={
  <Button variant="outline">
    Créer un lien personnalisé
  </Button>
} />

// Contrôlé
<CreateLinkDialog 
  open={isOpen}
  onOpenChange={setIsOpen}
/>
```

**Props**:
- `trigger?` (ReactNode): Bouton déclencheur personnalisé
- `open?` (boolean): État ouvert/fermé (mode contrôlé)
- `onOpenChange?` ((open: boolean) => void): Callback changement d'état

**Configuration disponible**:
- Titre du lien
- Nom obligatoire (oui/non)
- Email obligatoire (oui/non)
- Commentaire obligatoire (oui/non)
- Photos/vidéos autorisées (oui/non)
- Vérification d'achat (oui/non)

**Features**:
- Validation en temps réel
- Recommandations UX inline
- Toast de confirmation
- Reset automatique du formulaire

---

## 📝 `ReviewCard.tsx`

Carte d'affichage d'un avis avec toutes les métadonnées.

```tsx
import { ReviewCard } from '@/components/features/reviews'

<ReviewCard 
  review={review}
  onApprove={handleApprove}
  onReject={handleReject}
  onDelete={handleDelete}
  showActions={true}
/>
```

**Props**:
- `review` (Review): Objet avis
- `onApprove?` ((id: string) => void): Approuver l'avis
- `onReject?` ((id: string) => void): Rejeter l'avis
- `onDelete?` ((id: string) => void): Supprimer l'avis
- `showActions?` (boolean): Afficher le menu d'actions
- `className?` (string): Classes CSS

**Affiche**:
- ⭐ Note avec étoiles
- 🏷️ Badges de statut (pending, approved, rejected)
- ✓ Badge "Vérifié"
- 👤 Nom et email du client
- 💬 Commentaire
- 🖼️ Média (image/vidéo) si présent
- ⏰ Date relative (il y a 2 heures)
- 🛒 Badge "Achat vérifié"
- 🔒 Badge "Privé" si non public
- 📝 Note de modération (si présente)

**Menu d'actions contextuel**:
- Approuver (si pending/rejected)
- Rejeter (si pending/approved)
- Mettre en attente (si approved/rejected)
- Supprimer

---

## 📋 `ReviewsTable.tsx`

Table complète de gestion des avis avec filtres et pagination.

```tsx
import { ReviewsTable } from '@/components/features/reviews'

<ReviewsTable linkId="uuid-du-lien" />
```

**Props**:
- `linkId` (string): ID du lien de collecte
- `className?` (string): Classes CSS

**Filtres disponibles**:
- 🔍 **Recherche texte**: Dans nom, email, commentaire
- ⭐ **Par note**: 1 à 5 étoiles
- 🏷️ **Par statut**: Pending, Approved, Rejected

**Features**:
- Pagination automatique
- Export CSV/JSON intégré
- Compteur de résultats
- Badge filtres actifs
- Actions de modération par avis
- État vide avec CTA
- Gestion d'erreurs

**États affichés**:
- Loading avec spinner
- Erreur avec message
- Vide avec réinitialisation filtres
- Liste avec pagination

---

## 🌍 `PublicReviewForm.tsx`

Formulaire public de soumission d'avis (sans authentification).

```tsx
import { PublicReviewForm } from '@/components/features/reviews'

<PublicReviewForm 
  link={link}
  onSuccess={() => console.log('Avis soumis !')}
/>
```

**Props**:
- `link` (ReviewLink): Lien de collecte
- `onSuccess?` (() => void): Callback après soumission réussie

**Champs affichés dynamiquement** (selon config du lien):
- ⭐ **Note** (toujours obligatoire)
- 👤 Nom (facultatif/obligatoire)
- 📧 Email (facultatif/obligatoire)
- 💬 Commentaire (facultatif/obligatoire)
- ✓ Checkbox "J'ai acheté" (si activé)
- 📷 Upload photo/vidéo (si activé - placeholder)

**Features**:
- Validation selon configuration du lien
- Labels contextuels pour le rating
- Page de succès automatique
- Anti-fraude avec fingerprint
- Reset automatique après soumission
- Gestion d'erreurs (rate limit, doublons)
- Mention légale

**États**:
- Formulaire actif
- Soumission en cours
- Succès avec message

---

## 📥 `ExportButton.tsx`

Bouton dropdown pour exporter les avis.

```tsx
import { ExportButton } from '@/components/features/reviews'

<ExportButton 
  linkId="uuid"
  filters={{ status: 'approved', rating: 5 }}
  variant="outline"
  size="default"
/>
```

**Props**:
- `linkId` (string): ID du lien
- `filters?` (object): Filtres à appliquer
  - `rating?` (number): Filtrer par note
  - `status?` (string): Filtrer par statut
- `variant?` ('default' | 'outline' | 'ghost'): Style du bouton
- `size?` ('default' | 'sm' | 'lg' | 'icon'): Taille

**Options d'export**:
- 📥 **CSV**: Téléchargement automatique
- 📊 **JSON**: Données + statistiques

---

## 🎯 Usage Complet

### Page Dashboard

```tsx
'use client'

import { useState } from 'react'
import {
  StatsCards,
  CreateLinkDialog,
  ReviewsTable,
} from '@/components/features/reviews'
import { useReviewLinks } from '@/lib/hooks/useReviewLinks'

export default function AvisClientsPage() {
  const [selectedLink, setSelectedLink] = useState<string | null>(null)
  const { data: links, isLoading } = useReviewLinks()
  
  if (isLoading) return <div>Chargement...</div>
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Avis Clients</h1>
        <CreateLinkDialog />
      </div>
      
      <StatsCards links={links} />
      
      {selectedLink && (
        <ReviewsTable linkId={selectedLink} />
      )}
    </div>
  )
}
```

### Page Publique

```tsx
import { PublicReviewForm } from '@/components/features/reviews'
import { createClient } from '@/lib/supabase/server'

export default async function PublicReviewPage({ params }: { params: { slug: string } }) {
  const supabase = await createClient()
  
  const { data: link } = await supabase
    .from('review_links')
    .select('*')
    .eq('slug', params.slug)
    .single()
  
  if (!link) return <div>Lien non trouvé</div>
  
  return (
    <div className="max-w-2xl mx-auto py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">{link.title}</h1>
        <p className="text-gray-600">
          Votre avis compte énormément pour nous
        </p>
      </div>
      
      <PublicReviewForm link={link} />
    </div>
  )
}
```

---

## 🎨 Personnalisation

Tous les composants utilisent:
- **shadcn/ui** pour les primitives
- **Tailwind CSS** pour le styling
- **Lucide React** pour les icônes
- **Geist** et **Inter** pour les fonts

### Modifier les couleurs

Les variantes de couleur sont définies dans chaque composant et peuvent être personnalisées via les props `variant` ou en surchargeant les classes Tailwind.

---

## 📦 Dépendances

- `@/components/core/ui/*` - shadcn/ui components ✅
- `@/lib/hooks/useReview*` - React Query hooks ✅
- `lucide-react` - Icons ✅
- `date-fns` - Date formatting ✅
- `sonner` - Toast notifications ✅

---

**Créé le**: 2025-12-08  
**Version**: 1.0  
**Module**: Avis Clients Ofika
