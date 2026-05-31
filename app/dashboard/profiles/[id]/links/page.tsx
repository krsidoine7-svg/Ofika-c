"use client"

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ProfileWithLinks, Link } from '@/lib/types/database'
import { Button } from "@/components/core/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/core/ui/card"
import { Input } from "@/components/core/ui/input"
import { Label } from "@/components/core/ui/label"
import { ArrowLeft, Plus, Edit, Trash2, ExternalLink } from "lucide-react"
import { toast } from "sonner"
import { ProtectedRoute } from "@/components/core/auth/ProtectedRoute"

export default function LinksPage() {
  const params = useParams()
  const profileId = params.id as string
  const [profile, setProfile] = useState<ProfileWithLinks | null>(null)
  const [links, setLinks] = useState<Link[]>([])
  const [loading, setLoading] = useState(true)
  const [editingLink, setEditingLink] = useState<Link | null>(null)
  const [newLink, setNewLink] = useState({ title: '', url: '' })
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadProfileAndLinks()
  }, [profileId])

  const loadProfileAndLinks = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select(`
          *,
          links (*)
        `)
        .eq('id', profileId)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single()

      if (profileError) throw profileError

      setProfile(profileData)
      setLinks(profileData.links || [])
    } catch (error) {
      console.error('Error loading profile:', error)
      toast.error('Erreur lors du chargement du profil')
      router.push('/dashboard/profiles')
    } finally {
      setLoading(false)
    }
  }

  const handleAddLink = async () => {
    if (!newLink.title || !newLink.url) {
      toast.error('Veuillez remplir tous les champs')
      return
    }

    if (links.length >= 2) {
      toast.error('Vous ne pouvez pas avoir plus de 2 liens par profil')
      return
    }

    try {
      const { error } = await supabase
        .from('links')
        .insert({
          profile_id: profileId,
          title: newLink.title,
          url: newLink.url,
          position: links.length + 1
        })

      if (error) throw error

      toast.success('Lien ajouté avec succès')
      setNewLink({ title: '', url: '' })
      loadProfileAndLinks()
    } catch (error) {
      console.error('Error adding link:', error)
      toast.error('Erreur lors de l\'ajout du lien')
    }
  }

  const handleUpdateLink = async (linkId: string, updates: Partial<Link>) => {
    try {
      const { error } = await supabase
        .from('links')
        .update(updates)
        .eq('id', linkId)

      if (error) throw error

      toast.success('Lien mis à jour avec succès')
      setEditingLink(null)
      loadProfileAndLinks()
    } catch (error) {
      console.error('Error updating link:', error)
      toast.error('Erreur lors de la mise à jour du lien')
    }
  }

  const handleDeleteLink = async (linkId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce lien ?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('links')
        .delete()
        .eq('id', linkId)

      if (error) throw error

      toast.success('Lien supprimé avec succès')
      loadProfileAndLinks()
    } catch (error) {
      console.error('Error deleting link:', error)
      toast.error('Erreur lors de la suppression du lien')
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-gray-600">Chargement des liens...</p>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (!profile) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Profil non trouvé</h1>
              <p className="text-gray-600 mb-6">Le profil demandé n'existe pas ou a été supprimé.</p>
              <Button onClick={() => router.push('/dashboard/profiles')}>
                Retour aux profils
              </Button>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <Button
                variant="ghost"
                onClick={() => router.push('/dashboard/profiles')}
                className="mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour aux profils
              </Button>
              <h1 className="text-3xl font-bold text-gray-900">Gérer les liens</h1>
              <p className="text-gray-600 mt-2">
                Gérez les liens de votre profil : {profile.name}
              </p>
            </div>

            {/* Ajouter un nouveau lien */}
            {links.length < 2 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Ajouter un nouveau lien</CardTitle>
                  <CardDescription>
                    Vous pouvez ajouter jusqu'à 2 liens à votre profil
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Titre du lien</Label>
                      <Input
                        id="title"
                        placeholder="Ex: Mon site web"
                        value={newLink.title}
                        onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="url">URL</Label>
                      <Input
                        id="url"
                        placeholder="https://exemple.com"
                        value={newLink.url}
                        onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                      />
                    </div>
                  </div>
                  <Button
                    onClick={handleAddLink}
                    className="mt-4"
                    disabled={!newLink.title || !newLink.url}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter le lien
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Liste des liens existants */}
            <div className="space-y-4">
              {links.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ExternalLink className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Aucun lien ajouté
                    </h3>
                    <p className="text-gray-600">
                      Ajoutez des liens pour enrichir votre profil
                    </p>
                  </CardContent>
                </Card>
              ) : (
                links.map((link) => (
                  <Card key={link.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{link.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{link.url}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            Position: {link.position} • Clics: {link.click_count}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(link.url, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Ouvrir
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingLink(link)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Modifier
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteLink(link.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
