'use client'

import { Button } from '@/components/core/ui/button'
import { Card } from '@/components/core/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/core/ui/avatar'
import { Badge } from '@/components/core/ui/badge'
import { Separator } from '@/components/core/ui/separator'
import { ArrowLeft, CheckCircle, ExternalLink, Instagram, Facebook, Twitter, Linkedin, Youtube, Globe, Loader2 } from 'lucide-react'

interface Step4PreviewProps {
  data: any
  onFinalize: () => void
  onPrev: () => void
  isLoading: boolean
  isAuthenticated: boolean
}

const PLATFORM_ICONS: Record<string, any> = {
  instagram: Instagram,
  facebook: Facebook,
  twitter: Twitter,
  linkedin: Linkedin,
  youtube: Youtube,
  website: Globe
}

export function Step4Preview({ data, onFinalize, onPrev, isLoading, isAuthenticated }: Step4PreviewProps) {
  const fullUrl = `${process.env.NEXT_PUBLIC_APP_URL || ''}/${data.username}`

  return (
    <div className="space-y-6">
      {/* Message d'aperçu */}
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
          <div>
            <p className="font-semibold text-green-900">Votre page est prête !</p>
            <p className="text-sm text-green-700 mt-1">
              Vérifiez les informations ci-dessous avant de publier.
            </p>
          </div>
        </div>
      </div>

      {/* Aperçu de la page */}
      <Card className="overflow-hidden">
        {/* Header avec gradient */}
        <div className={`h-32 bg-gradient-to-br ${getGradientClass(data.colorTheme)}`} />

        {/* Contenu */}
        <div className="p-6 space-y-6">
          {/* Avatar et infos */}
          <div className="flex flex-col items-center -mt-20">
            <Avatar className="h-32 w-32 border-4 border-white shadow-xl">
              <AvatarImage src={data.profilePhotoPreview || ''} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-4xl">
                {data.fullName?.[0]?.toUpperCase() || '?'}
              </AvatarFallback>
            </Avatar>

            <h2 className="text-2xl font-bold text-gray-900 mt-4">{data.fullName}</h2>
            <p className="text-sm text-gray-500">@{data.username}</p>

            {data.bio && (
              <p className="text-center text-gray-600 mt-3 max-w-md">{data.bio}</p>
            )}
          </div>

          <Separator />

          {/* URL publique */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">URL de votre page</Label>
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
              <Globe className="h-4 w-4 text-gray-400" />
              <code className="text-sm flex-1 text-blue-600">{fullUrl}</code>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => window.open(fullUrl, '_blank')}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Liens sociaux */}
          {data.socialLinks && data.socialLinks.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">Réseaux sociaux</Label>
                <div className="flex flex-wrap gap-2">
                  {data.socialLinks.map((link: any, index: number) => {
                    const Icon = PLATFORM_ICONS[link.platform] || Globe
                    return (
                      <Badge key={index} variant="secondary" className="px-3 py-2">
                        <Icon className="h-4 w-4 mr-2" />
                        {link.platform}
                      </Badge>
                    )
                  })}
                </div>
              </div>
            </>
          )}

          {/* Liens personnalisés */}
          {data.customLinks && data.customLinks.filter((l: any) => l.title && l.url).length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">Liens personnalisés</Label>
                <div className="space-y-2">
                  {data.customLinks
                    .filter((l: any) => l.title && l.url)
                    .map((link: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium">{link.title}</span>
                        <ExternalLink className="h-4 w-4 text-gray-400" />
                      </div>
                    ))}
                </div>
              </div>
            </>
          )}

          {/* Style */}
          <Separator />
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Personnalisation</Label>
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded bg-gradient-to-br ${getGradientClass(data.colorTheme)}`} />
                <span className="text-gray-600">Thème : {getColorName(data.colorTheme)}</span>
              </div>
              <div className="text-gray-600">
                Style : {getTemplateName(data.template)}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Message pour les non-connectés */}
      {!isAuthenticated && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            ⚠️ Vous devez créer un compte pour publier votre page. Vous serez redirigé vers la page d'inscription.
          </p>
        </div>
      )}

      {/* Résumé */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Réseaux sociaux :</span>
            <span className="font-semibold">{data.socialLinks?.length || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Liens personnalisés :</span>
            <span className="font-semibold">
              {data.customLinks?.filter((l: any) => l.title && l.url).length || 0}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Style de page :</span>
            <span className="font-semibold">{getTemplateName(data.template)}</span>
          </div>
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button
          onClick={onPrev}
          variant="outline"
          size="lg"
          disabled={isLoading}
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Retour
        </Button>

        <Button
          onClick={onFinalize}
          size="lg"
          className="min-w-[200px]"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Publication...
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-5 w-5" />
              {isAuthenticated ? 'Publier ma page' : 'Créer mon compte'}
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

// Helpers
function Label({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <label className={`block text-sm font-medium ${className}`}>{children}</label>
}

function getGradientClass(theme: string) {
  const gradients: Record<string, string> = {
    blue: 'from-blue-600 to-blue-400',
    purple: 'from-purple-600 to-purple-400',
    pink: 'from-pink-600 to-pink-400',
    green: 'from-green-600 to-green-400',
    orange: 'from-orange-600 to-orange-400',
    dark: 'from-gray-900 to-gray-700'
  }
  return gradients[theme] || gradients.blue
}

function getColorName(theme: string) {
  const names: Record<string, string> = {
    blue: 'Bleu Océan',
    purple: 'Violet Mystique',
    pink: 'Rose Passion',
    green: 'Vert Nature',
    orange: 'Orange Énergie',
    dark: 'Noir Élégant'
  }
  return names[theme] || 'Bleu Océan'
}

function getTemplateName(template: string) {
  const names: Record<string, string> = {
    minimal: 'Minimaliste',
    card: 'Carte',
    gradient: 'Gradient',
    glass: 'Glassmorphism'
  }
  return names[template] || 'Minimaliste'
}
