"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/core/ui/card"
import { Button } from "@/components/core/ui/button"
import { Badge } from "@/components/core/ui/badge"
import { Plus, Edit, Eye, Trash2, ExternalLink } from "lucide-react"
import { useAuth } from "@/lib/hooks/useAuth"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ProfileWithLinks } from '@/lib/types/database'
import { ProfileForm } from "./ProfileForm"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/core/ui/dialog"
import { LinkManager } from "@/components/features/links/LinkManager"
import { useProfiles, useDeleteProfile } from '@/lib/hooks/useProfiles'

export function ProfileManager() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingProfile, setEditingProfile] = useState<ProfileWithLinks | null>(null)
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null)
  const { user } = useAuth()
  const router = useRouter()
  
  const { profiles, loading: isLoading, error, refetch } = useProfiles()
  const { deleteProfile } = useDeleteProfile()

  const handleDeleteProfile = async (profileId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce profil ?')) {
      await deleteProfile(profileId)
      refetch() // Recharger les profils après suppression
    }
  }

  const handleViewProfile = (profile: ProfileWithLinks) => {
    if (profile.custom_url) {
      router.push(`/${profile.custom_url}`)
    } else {
      toast.error('Ce profil n\'a pas d\'URL personnalisée')
    }
  }

  const handleEditProfile = (profile: ProfileWithLinks) => {
    setEditingProfile(profile)
    setIsEditModalOpen(true)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Chargement des profils...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600 mb-4">Erreur lors du chargement des profils</p>
        <Button onClick={() => window.location.reload()}>
          Réessayer
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Mes Profils</h2>
          <p className="text-gray-600">Gérez vos profils professionnels et personnels</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau Profil
        </Button>
      </div>

      {/* Liste des profils */}
      {profiles && profiles.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {profiles.map((profile) => (
            <Card key={profile.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{profile.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {profile.bio || 'Aucune description'}
                    </CardDescription>
                  </div>
                  <Badge variant={profile.is_public ? "default" : "secondary"}>
                    {profile.is_public ? "Public" : "Privé"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="font-medium">Type:</span>
                    <span className="ml-2 capitalize">{profile.profile_type}</span>
                  </div>
                  {profile.custom_url && (
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium">URL:</span>
                      <span className="ml-2 text-blue-600">/{profile.custom_url}</span>
                    </div>
                  )}
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="font-medium">Liens:</span>
                    <span className="ml-2">{profile.links?.length || 0}/2</span>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewProfile(profile)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Voir
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditProfile(profile)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Modifier
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteProfile(profile.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <div className="text-gray-400 mb-4">
              <Plus className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun profil créé
            </h3>
            <p className="text-gray-600 mb-4">
              Créez votre premier profil pour commencer à partager vos informations
            </p>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Créer un profil
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Modales */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer un nouveau profil</DialogTitle>
          </DialogHeader>
          <ProfileForm
            onSuccess={() => {
              setIsCreateModalOpen(false)
              refetch() // Recharger les profils après création
            }}
            onCancel={() => setIsCreateModalOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Modal d'édition */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Modifier le profil</DialogTitle>
          </DialogHeader>
          {editingProfile && (
            <ProfileForm
              profile_id={editingProfile.id}
              isEditing={true}
              onSuccess={() => {
                setIsEditModalOpen(false)
                setEditingProfile(null)
                refetch() // Recharger les profils après modification
              }}
              onCancel={() => {
                setIsEditModalOpen(false)
                setEditingProfile(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedProfile} onOpenChange={() => setSelectedProfile(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Gérer le profil</DialogTitle>
          </DialogHeader>
          {selectedProfile && (
            <LinkManager
              profile_id={selectedProfile}
              profileName="Profil"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

