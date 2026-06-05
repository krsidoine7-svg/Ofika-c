"use client"

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, ExternalLink, GripVertical, AlertTriangle, Eye } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LinkForm } from "./LinkForm"

interface Link {
  id: string
  title: string
  url: string
  position: number
  click_count: number
  is_active: boolean
  created_at: string
  updated_at: string
}

interface LinkManagerProps {
  profile_id: string
  profileName: string
}

export function LinkManager({ profile_id, profileName }: LinkManagerProps) {
  const [links, setLinks] = useState<Link[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingLink, setEditingLink] = useState<Link | null>(null)
  const [deletingLinkId, setDeletingLinkId] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const supabase = createClient()

  // Fonction mémorisée pour charger les liens
  const loadLinks = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const { data, error } = await supabase
        .from('links')
        .select('*')
        .eq('profile_id', profile_id)  // ✅ Corrigé: profile_id → profile_id
        .eq('is_active', true)       // ✅ Corrigé: is_active → is_active
        .order('position', { ascending: true })

      if (error) throw error
      setLinks(data || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement'
      setError(errorMessage)
      console.error('Error loading links:', err)
      toast.error(`Erreur: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }, [profile_id, supabase])

  // Fonction mémorisée pour supprimer un lien
  const deleteLink = useCallback(async (linkId: string) => {
    try {
      const { error } = await supabase
        .from('links')
        .update({ is_active: false })  // ✅ Corrigé: is_active → is_active
        .eq('id', linkId)

      if (error) throw error
      
      // Mise à jour optimiste de l'état local
      setLinks(prev => prev.filter(link => link.id !== linkId))
      toast.success('Lien supprimé avec succès')
    } catch (err) {
      console.error('Error deleting link:', err)
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression'
      toast.error(`Erreur: ${errorMessage}`)
    } finally {
      setDeletingLinkId(null)
    }
  }, [supabase])

  // Fonction sécurisée pour ouvrir les liens
  const openLink = useCallback((url: string) => {
    try {
      const urlObj = new URL(url)
      
      // Validation de sécurité renforcée
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        toast.error('URL non sécurisée')
        return
      }
      
      // Vérification des domaines suspects
      const suspiciousDomains = ['localhost', '127.0.0.1', '0.0.0.0']
      if (suspiciousDomains.some(domain => urlObj.hostname.includes(domain))) {
        toast.error('URL non autorisée')
        return
      }
      
      // Ouverture sécurisée
      const newWindow = window.open(url, '_blank', 'noopener,noreferrer')
      if (!newWindow) {
        toast.error('Impossible d\'ouvrir le lien. Vérifiez vos paramètres de popup.')
      }
    } catch (error) {
      console.error('Error opening link:', error)
      toast.error('URL invalide')
    }
  }, [])

  // Fonction pour prévisualiser les liens
  const previewLink = useCallback((url: string) => {
    setPreviewUrl(url)
  }, [])

  // Fonction pour confirmer la suppression
  const confirmDelete = useCallback((linkId: string) => {
    setDeletingLinkId(linkId)
  }, [])

  // Fonction pour recharger les liens après modification
  const handleLinkSuccess = useCallback(() => {
    loadLinks()
  }, [loadLinks])

  useEffect(() => {
    loadLinks()
  }, [loadLinks])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Chargement des liens...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          <p className="mb-2">Erreur: {error}</p>
          <Button onClick={loadLinks} size="sm" variant="outline">
            Réessayer
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Liens de "{profileName}"</h3>
          <p className="text-sm text-gray-600">
            {links.length}/2 liens utilisés
          </p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          disabled={links.length >= 2}
          size="sm"
          className="flex items-center gap-2"
          aria-label="Ajouter un nouveau lien"
        >
          <Plus className="h-4 w-4" />
          Ajouter un lien
        </Button>
      </div>

      {/* Limite de liens */}
      {links.length >= 2 && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <strong>Limite atteinte :</strong> Un profil ne peut avoir que 2 liens maximum.
          </AlertDescription>
        </Alert>
      )}

      {/* Liste des liens */}
      {links.length === 0 ? (
        <Card className="text-center py-8">
          <CardContent>
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Plus className="h-6 w-6 text-gray-400" />
            </div>
            <h4 className="text-sm font-semibold text-gray-900 mb-2">
              Aucun lien ajouté
            </h4>
            <p className="text-gray-600 text-sm mb-4">
              Ajoutez des liens pour enrichir votre profil
            </p>
            <Button 
              onClick={() => setIsCreateModalOpen(true)} 
              size="sm"
              aria-label="Ajouter le premier lien"
            >
              Ajouter le premier lien
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {links.map((link) => (
            <Card key={link.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <GripVertical className="h-4 w-4 text-gray-400" />
                      <Badge variant="outline" className="text-xs">
                        Position {link.position}
                      </Badge>
                    </div>
                    <h4 className="font-medium text-sm truncate">{link.title}</h4>
                    <p className="text-xs text-gray-500 truncate">{link.url}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {link.click_count} clic(s)
                    </p>
                  </div>
                  <div className="flex items-center gap-1 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingLink(link)}
                      className="h-8 w-8 p-0"
                      aria-label={`Modifier le lien ${link.title}`}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => previewLink(link.url)}
                      className="h-8 w-8 p-0"
                      aria-label={`Prévisualiser le lien ${link.title}`}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openLink(link.url)}
                      className="h-8 w-8 p-0"
                      aria-label={`Ouvrir le lien ${link.title}`}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => confirmDelete(link.id)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      aria-label={`Supprimer le lien ${link.title}`}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modales */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Ajouter un lien</DialogTitle>
            <DialogDescription>
              Ajoutez un lien à votre profil. Vous pouvez avoir jusqu'à 2 liens.
            </DialogDescription>
          </DialogHeader>
          <LinkForm
            profile_id={profile_id}
            onSuccess={() => {
              setIsCreateModalOpen(false)
              handleLinkSuccess()
            }}
            onCancel={() => setIsCreateModalOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingLink} onOpenChange={() => setEditingLink(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier le lien</DialogTitle>
            <DialogDescription>
              Modifiez les informations de votre lien.
            </DialogDescription>
          </DialogHeader>
          {editingLink && (
            <LinkForm
              profile_id={profile_id}
              editingLink={editingLink}
              onSuccess={() => {
                setEditingLink(null)
                handleLinkSuccess()
              }}
              onCancel={() => setEditingLink(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de confirmation de suppression */}
      <Dialog open={!!deletingLinkId} onOpenChange={() => setDeletingLinkId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer ce lien ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeletingLinkId(null)}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={() => deletingLinkId && deleteLink(deletingLinkId)}
            >
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de prévisualisation */}
      <Dialog open={!!previewUrl} onOpenChange={() => setPreviewUrl(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Prévisualisation du lien</DialogTitle>
            <DialogDescription>
              Aperçu du lien : {previewUrl}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <Button
              onClick={() => previewUrl && openLink(previewUrl)}
              className="w-full"
            >
              Ouvrir le lien
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
