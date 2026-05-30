'use client'

import { useState } from 'react'
import { Button } from '@/components/core/ui/button'
import { Input } from '@/components/core/ui/input'
import { Label } from '@/components/core/ui/label'
import { Card } from '@/components/core/ui/card'
import { ArrowLeft, ArrowRight, Plus, X, Instagram, Facebook, Twitter, Linkedin, Youtube, Globe } from 'lucide-react'
import { toast } from 'sonner'

interface Step2SocialLinksProps {
  data: any
  onChange: (data: any) => void
  onNext: () => void
  onPrev: () => void
}

const SOCIAL_PLATFORMS = [
  { id: 'instagram', name: 'Instagram', icon: Instagram, placeholder: 'votre.nom', prefix: 'instagram.com/', color: 'from-purple-500 to-pink-500' },
  { id: 'facebook', name: 'Facebook', icon: Facebook, placeholder: 'votreprofil', prefix: 'facebook.com/', color: 'from-blue-600 to-blue-400' },
  { id: 'twitter', name: 'Twitter/X', icon: Twitter, placeholder: 'votre_nom', prefix: 'twitter.com/', color: 'from-black to-gray-600' },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, placeholder: 'votre-nom', prefix: 'linkedin.com/in/', color: 'from-blue-700 to-blue-500' },
  { id: 'youtube', name: 'YouTube', icon: Youtube, placeholder: '@votre_chaine', prefix: 'youtube.com/', color: 'from-red-600 to-red-400' },
  { id: 'website', name: 'Site web', icon: Globe, placeholder: 'www.monsite.com', prefix: '', color: 'from-gray-600 to-gray-400' }
]

export function Step2SocialLinks({ data, onChange, onNext, onPrev }: Step2SocialLinksProps) {
  const [socialLinks, setSocialLinks] = useState(data.socialLinks || [])
  const [customLinks, setCustomLinks] = useState(data.customLinks || [])

  // Handler pour ajouter/modifier un lien social
  const handleSocialLinkChange = (platformId: string, value: string) => {
    const updated = [...socialLinks]
    const existingIndex = updated.findIndex(link => link.platform === platformId)

    if (value.trim() === '') {
      // Supprimer si vide
      if (existingIndex > -1) {
        updated.splice(existingIndex, 1)
      }
    } else {
      // Ajouter ou mettre à jour
      const platform = SOCIAL_PLATFORMS.find(p => p.id === platformId)
      const fullUrl = value.startsWith('http') ? value : `https://${platform?.prefix}${value}`

      if (existingIndex > -1) {
        updated[existingIndex] = { platform: platformId, url: fullUrl }
      } else {
        updated.push({ platform: platformId, url: fullUrl })
      }
    }

    setSocialLinks(updated)
    onChange({ socialLinks: updated, customLinks })
  }

  // Handler pour ajouter un lien personnalisé
  const handleAddCustomLink = () => {
    const updated = [...customLinks, { title: '', url: '' }]
    setCustomLinks(updated)
    onChange({ socialLinks, customLinks: updated })
  }

  // Handler pour modifier un lien personnalisé
  const handleCustomLinkChange = (index: number, field: 'title' | 'url', value: string) => {
    const updated = [...customLinks]
    updated[index][field] = value
    setCustomLinks(updated)
    onChange({ socialLinks, customLinks: updated })
  }

  // Handler pour supprimer un lien personnalisé
  const handleRemoveCustomLink = (index: number) => {
    const updated = customLinks.filter((_: any, i: number) => i !== index)
    setCustomLinks(updated)
    onChange({ socialLinks, customLinks: updated })
  }

  const handleSubmit = () => {
    // Valider les liens personnalisés
    const invalidCustomLinks = customLinks.filter((link: any) => 
      (link.title.trim() && !link.url.trim()) || (!link.title.trim() && link.url.trim())
    )

    if (invalidCustomLinks.length > 0) {
      toast.error('Veuillez remplir le titre ET l\'URL pour chaque lien personnalisé')
      return
    }

    // Filtrer les liens vides
    const validCustomLinks = customLinks.filter((link: any) => link.title.trim() && link.url.trim())
    onChange({ socialLinks, customLinks: validCustomLinks })

    onNext()
  }

  return (
    <div className="space-y-6">
      {/* Info */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          💡 <strong>Astuce :</strong> Vous pouvez passer cette étape et ajouter vos liens plus tard.
        </p>
      </div>

      {/* Réseaux sociaux populaires */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Réseaux sociaux</h3>
        
        {SOCIAL_PLATFORMS.map((platform) => {
          const PlatformIcon = platform.icon
          const existingLink = socialLinks.find((link: any) => link.platform === platform.id)
          const value = existingLink?.url.replace(`https://${platform.prefix}`, '') || ''

          return (
            <Card key={platform.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg bg-gradient-to-br ${platform.color}`}>
                  <PlatformIcon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1 space-y-2">
                  <Label htmlFor={platform.id} className="text-base font-medium">
                    {platform.name}
                  </Label>
                  <div className="flex items-center gap-2">
                    {platform.prefix && (
                      <span className="text-sm text-gray-500 whitespace-nowrap">
                        {platform.prefix}
                      </span>
                    )}
                    <Input
                      id={platform.id}
                      type="text"
                      placeholder={platform.placeholder}
                      value={value}
                      onChange={(e) => handleSocialLinkChange(platform.id, e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Liens personnalisés */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Liens personnalisés</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddCustomLink}
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un lien
          </Button>
        </div>

        {customLinks.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-8">
            Aucun lien personnalisé. Ajoutez-en un pour afficher d'autres liens sur votre page.
          </p>
        )}

        {customLinks.map((link: any, index: number) => (
          <Card key={index} className="p-4">
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <Label className="text-sm font-medium">Lien #{index + 1}</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveCustomLink(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <Input
                type="text"
                placeholder="Titre (ex: Mon portfolio)"
                value={link.title}
                onChange={(e) => handleCustomLinkChange(index, 'title', e.target.value)}
              />
              <Input
                type="url"
                placeholder="URL (ex: https://monsite.com)"
                value={link.url}
                onChange={(e) => handleCustomLinkChange(index, 'url', e.target.value)}
              />
            </div>
          </Card>
        ))}
      </div>

      {/* Statistiques */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Réseaux sociaux ajoutés :</span>
          <span className="font-semibold text-gray-900">{socialLinks.length}</span>
        </div>
        <div className="flex items-center justify-between text-sm mt-2">
          <span className="text-gray-600">Liens personnalisés :</span>
          <span className="font-semibold text-gray-900">{customLinks.filter((l: any) => l.title && l.url).length}</span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button
          onClick={onPrev}
          variant="outline"
          size="lg"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Retour
        </Button>

        <Button
          onClick={handleSubmit}
          size="lg"
          className="min-w-[200px]"
        >
          Continuer
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
