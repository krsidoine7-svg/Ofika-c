'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { SocialLink, SOCIAL_LINK_OPTIONS, MAX_SOCIAL_LINKS, getSocialLinkOption } from '@/lib/types/social-links'
import { Plus, Trash2, MessageSquare, Facebook, Instagram, Twitter, Youtube, Video, Linkedin, Github, Globe, ShoppingBag } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface SocialLinksManagerProps {
  value: SocialLink[]
  onChange: (links: SocialLink[]) => void
  error?: string
}

const ICONS = {
  whatsapp: MessageSquare,
  facebook: Facebook,
  instagram: Instagram,
  twitter: Twitter,
  youtube: Youtube,
  tiktok: Video,
  linkedin: Linkedin,
  github: Github,
  website: Globe,
  shop: ShoppingBag,
  other: Globe
}

export function SocialLinksManager({ value, onChange, error }: SocialLinksManagerProps) {
  const [links, setLinks] = useState<SocialLink[]>(value || [])

  const handleAddLink = () => {
    if (links.length >= MAX_SOCIAL_LINKS) {
      return
    }

    const newLink: SocialLink = {
      type: 'instagram',
      url: ''
    }
    const updatedLinks = [...links, newLink]
    setLinks(updatedLinks)
    onChange(updatedLinks)
  }

  const handleRemoveLink = (index: number) => {
    const updatedLinks = links.filter((_, i) => i !== index)
    setLinks(updatedLinks)
    onChange(updatedLinks)
  }

  const handleUpdateLink = (index: number, field: keyof SocialLink, value: string) => {
    const updatedLinks = [...links]
    if (field === 'type') {
      updatedLinks[index] = { ...updatedLinks[index], type: value as any }
    } else {
      updatedLinks[index] = { ...updatedLinks[index], [field]: value }
    }
    setLinks(updatedLinks)
    onChange(updatedLinks)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">
          Réseaux sociaux
        </label>
        <span className="text-xs text-gray-500">
          {links.length}/{MAX_SOCIAL_LINKS} liens
        </span>
      </div>

      {/* Liste des liens */}
      <div className="space-y-3">
        {links.map((link, index) => {
          const option = getSocialLinkOption(link.type)
          const Icon = ICONS[link.type] || Globe

          return (
            <div key={index} className="flex gap-2 items-start p-4 bg-gray-50 rounded-lg border border-gray-200">
              {/* Dropdown type */}
              <div className="flex-shrink-0 w-[180px]">
                <Select
                  value={link.type}
                  onValueChange={(value) => handleUpdateLink(index, 'type', value)}
                >
                  <SelectTrigger className="bg-white">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {SOCIAL_LINK_OPTIONS.map((opt) => {
                      const OptionIcon = ICONS[opt.value] || Globe
                      return (
                        <SelectItem key={opt.value} value={opt.value}>
                          <div className="flex items-center gap-2">
                            <OptionIcon className="w-4 h-4" />
                            {opt.label}
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Input URL */}
              <div className="flex-1">
                <Input
                  type="text"
                  value={link.url}
                  onChange={(e) => handleUpdateLink(index, 'url', e.target.value)}
                  placeholder={option?.placeholder || 'URL'}
                  className="bg-white"
                />
                {option?.example && (
                  <p className="text-xs text-gray-500 mt-1">
                    Ex: {option.example}
                  </p>
                )}
              </div>

              {/* Bouton supprimer */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveLink(index)}
                className="flex-shrink-0 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )
        })}
      </div>

      {/* Bouton ajouter */}
      {links.length < MAX_SOCIAL_LINKS && (
        <Button
          type="button"
          variant="outline"
          onClick={handleAddLink}
          className="w-full"
        >
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un réseau social
        </Button>
      )}

      {/* Message si limite atteinte */}
      {links.length >= MAX_SOCIAL_LINKS && (
        <Alert>
          <AlertDescription className="text-sm">
            Limite de {MAX_SOCIAL_LINKS} liens atteinte. Supprimez un lien pour en ajouter un nouveau.
          </AlertDescription>
        </Alert>
      )}

      {/* Erreur */}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
