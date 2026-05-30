'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent } from '@/components/core/ui/card'
import { Button } from '@/components/core/ui/button'
import { Badge } from '@/components/core/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/core/ui/avatar'
import { 
  Phone, 
  Mail, 
  MapPin, 
  Instagram, 
  Linkedin, 
  Globe,
  Download,
  Share2,
  QrCode
} from 'lucide-react'
import { toast } from 'sonner'
import { trackProfileView, trackQRScan } from '@/lib/services/profile-analytics'

interface NFCPublicProfile {
  id: string
  profile_name: string
  nfc_link: string
  design_choice: string
  color_theme: string
  qr_code_url?: string
  // Informations de contact
  full_name?: string
  company?: string
  job_title?: string
  bio?: string
  phone?: string
  email?: string
  location?: string
  // Réseaux sociaux (ancien format - deprecated - utilisé uniquement pour l'affichage UI)
  instagram?: string
  tiktok?: string
  linkedin?: string
  other_links?: string
  whatsapp?: string
  facebook?: string
  twitter?: string
  youtube?: string
  website?: string
  // Réseaux sociaux (nouveau format JSONB - utilisé pour le vCard)
  social_links?: Array<{
    platform: 'whatsapp' | 'facebook' | 'instagram' | 'twitter' | 'youtube' | 'tiktok' | 'linkedin' | 'snapchat' | 'telegram' | 'website'
    url: string
    label?: string
  }>
  // Images
  logo_url?: string
  profile_photo_url?: string
  // Liens personnalisés
  custom_links?: Array<{name: string, url: string}>
  created_at: string
}

export default function NFCPublicPage() {
  const params = useParams()
  const nfcLink = params.nfcLink as string
  const [profile, setProfile] = useState<NFCPublicProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (nfcLink) {
      loadNFCCard()
    }
  }, [nfcLink])

  // Tracker la vue du profil NFC et le scan QR
  useEffect(() => {
    if (profile?.id) {
      // Enregistrer la vue du profil
      trackProfileView(profile.id, {
        referrer: typeof document !== 'undefined' ? document.referrer : undefined,
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined
      } as any).catch(err => console.error('Error tracking profile view:', err))

      // Si vient d'un QR code (détection via referrer ou paramètre)
      const urlParams = new URLSearchParams(window.location.search)
      const fromQR = urlParams.get('from') === 'qr' || document.referrer.includes('qr')
      
      if (fromQR) {
        trackQRScan(profile.id, {
          referrer: document.referrer,
          user_agent: navigator.userAgent
        } as any).catch(err => console.error('Error tracking QR scan:', err))
      }
    }
  }, [profile?.id])

  const loadNFCCard = async () => {
    try {
      setLoading(true)
      setError(null)

      // Récupérer les informations de la carte NFC
      const response = await fetch(`/api/nfc/public/${nfcLink}`)
      
      if (!response.ok) {
        throw new Error('Carte NFC non trouvée')
      }

      const data = await response.json()
      setProfile(data)
    } catch (err) {
      console.error('Error loading NFC card:', err)
      setError('Carte NFC non trouvée')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToContacts = () => {
    if (!profile) return

    // Créer un vCard pour ajouter aux contacts
    const vCard = createVCard(profile)
    
    // Télécharger le vCard
    const blob = new Blob([vCard], { type: 'text/vcard' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${profile.profile_name}.vcf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    toast.success('Contact ajouté à vos contacts !')
  }

  const createVCard = (profile: NFCPublicProfile): string => {
    let vcard = 'BEGIN:VCARD\n'
    vcard += 'VERSION:3.0\n'
    
    // ✅ Nom complet
    if (profile.full_name) {
      vcard += `FN:${profile.full_name}\n`
      const nameParts = profile.full_name.split(' ')
      const lastName = nameParts[nameParts.length - 1]
      const firstName = nameParts.slice(0, -1).join(' ')
      vcard += `N:${lastName};${firstName};;;\n`
    } else {
      vcard += `FN:${profile.profile_name}\n`
    }
    
    // ✅ Entreprise
    if (profile.company) {
      vcard += `ORG:${profile.company}\n`
    }
    
    // ✅ Poste
    if (profile.job_title) {
      vcard += `TITLE:${profile.job_title}\n`
    }
    
    // ✅ Téléphone
    if (profile.phone) {
      vcard += `TEL;TYPE=WORK,VOICE:${profile.phone}\n`
    }
    
    // ✅ Email
    if (profile.email) {
      vcard += `EMAIL;TYPE=INTERNET:${profile.email}\n`
    }
    
    // ✅ Localisation
    if (profile.location) {
      vcard += `ADR;TYPE=WORK:;;${profile.location};;;;\n`
    }
    
    // ✅ Bio/Note avec message de mise à jour
    let noteContent = ''
    if (profile.bio) {
      noteContent = profile.bio
    }
    // Ajouter le message de mise à jour
    const updateMessage = `\n\n🔄 Profil toujours à jour sur ${profile.nfc_link}\nRe-scannez le QR code pour mettre à jour ce contact.`
    noteContent += updateMessage
    vcard += `NOTE:${noteContent}\n`
    
    // ✅ Photo de profil
    if (profile.profile_photo_url) {
      vcard += `PHOTO;VALUE=URL;TYPE=JPEG:${profile.profile_photo_url}\n`
    }
    
    // ✅ Réseaux sociaux - NOUVEAU FORMAT social_links
    if (profile.social_links && profile.social_links.length > 0) {
      profile.social_links.forEach(link => {
        const platformLabel = link.platform.toUpperCase()
        vcard += `URL;TYPE=${platformLabel}:${link.url}\n`
        
        // Ajouter aussi comme X-SOCIALPROFILE pour meilleure compatibilité
        if (link.platform === 'whatsapp') {
          vcard += `X-SOCIALPROFILE;TYPE=whatsapp:${link.url}\n`
        } else if (link.platform === 'facebook') {
          vcard += `X-SOCIALPROFILE;TYPE=facebook:${link.url}\n`
        } else if (link.platform === 'instagram') {
          vcard += `X-SOCIALPROFILE;TYPE=instagram:${link.url}\n`
        } else if (link.platform === 'linkedin') {
          vcard += `X-SOCIALPROFILE;TYPE=linkedin:${link.url}\n`
        } else if (link.platform === 'twitter') {
          vcard += `X-SOCIALPROFILE;TYPE=twitter:${link.url}\n`
        } else if (link.platform === 'tiktok') {
          vcard += `X-SOCIALPROFILE;TYPE=tiktok:${link.url}\n`
        }
      })
    }
    
    // Liens personnalisés
    if (profile.custom_links && profile.custom_links.length > 0) {
      profile.custom_links.forEach(link => {
        vcard += `URL;TYPE=${link.name.toUpperCase().replace(/\s+/g, '_')}:${link.url}\n`
      })
    }
    
    // URL du profil NFC
    vcard += `URL;TYPE=PROFILE:${profile.nfc_link}\n`
    
    vcard += 'END:VCARD'
    
    return vcard
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Contact de ${profile?.profile_name}`,
          text: `Découvrez le profil de ${profile?.profile_name}`,
          url: window.location.href
        })
      } catch (err) {
        console.log('Erreur lors du partage:', err)
      }
    } else {
      // Fallback : copier le lien
      navigator.clipboard.writeText(window.location.href)
      toast.success('Lien copié dans le presse-papiers !')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du profil...</p>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="text-red-500 mb-4">
              <QrCode className="h-16 w-16 mx-auto" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Carte NFC non trouvée</h1>
            <p className="text-gray-600">Cette carte NFC n'existe pas ou a été supprimée.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto shadow-xl">
          <CardContent className="p-8">
            {/* Bandeau d'information mise à jour */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="text-blue-600 mt-0.5">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-blue-800 font-medium mb-1">
                    📱 Informations toujours à jour
                  </p>
                  <p className="text-xs text-blue-700">
                    Ce profil est mis à jour régulièrement. Pour avoir les dernières informations dans vos contacts, re-scannez le QR code et téléchargez à nouveau le contact.
                  </p>
                </div>
              </div>
            </div>

            {/* Header */}
            <div className="text-center mb-8">
              <Avatar className="h-24 w-24 mx-auto mb-4">
                <AvatarImage src={profile.profile_photo_url || profile.logo_url} />
                <AvatarFallback className="text-2xl">
                  {(profile.full_name || profile.profile_name).charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {profile.full_name || profile.profile_name}
              </h1>
              
              {profile.job_title && profile.company && (
                <p className="text-xl text-gray-600 mb-4">
                  {profile.job_title} chez {profile.company}
                </p>
              )}
              
              {profile.bio && (
                <p className="text-gray-700 mb-6 max-w-md mx-auto">
                  {profile.bio}
                </p>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-3 justify-center">
                <Button 
                  onClick={handleAddToContacts}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Ajouter aux contacts
                </Button>
                
                <Button 
                  onClick={handleShare}
                  variant="outline"
                  className="border-blue-600 text-blue-600 hover:bg-blue-50"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Partager
                </Button>
              </div>
            </div>

            {/* Informations de contact */}
            <div className="space-y-4 mb-8">
              {profile.phone && (
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Phone className="h-5 w-5 text-blue-600" />
                  <a 
                    href={`tel:${profile.phone}`}
                    className="text-gray-900 hover:text-blue-600 transition-colors"
                  >
                    {profile.phone}
                  </a>
                </div>
              )}

              {profile.email && (
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <a 
                    href={`mailto:${profile.email}`}
                    className="text-gray-900 hover:text-blue-600 transition-colors"
                  >
                    {profile.email}
                  </a>
                </div>
              )}

              {profile.location && (
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  <span className="text-gray-900">{profile.location}</span>
                </div>
              )}
            </div>

            {/* Réseaux sociaux */}
            {(profile.instagram || profile.linkedin || profile.tiktok || profile.whatsapp || profile.facebook || profile.twitter || profile.youtube || profile.website || profile.other_links) && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Réseaux sociaux</h3>
                <div className="flex flex-wrap gap-3">
                  {profile.instagram && (
                    <a 
                      href={profile.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 px-4 py-2 bg-pink-100 text-pink-700 rounded-lg hover:bg-pink-200 transition-colors"
                    >
                      <Instagram className="h-4 w-4" />
                      <span>Instagram</span>
                    </a>
                  )}

                  {profile.linkedin && (
                    <a 
                      href={profile.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      <Linkedin className="h-4 w-4" />
                      <span>LinkedIn</span>
                    </a>
                  )}

                  {profile.tiktok && (
                    <a 
                      href={profile.tiktok}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      <span className="font-bold">TikTok</span>
                    </a>
                  )}

                  {profile.whatsapp && (
                    <a 
                      href={`https://wa.me/${profile.whatsapp.replace(/[^\d]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                    >
                      <Phone className="h-4 w-4" />
                      <span>WhatsApp</span>
                    </a>
                  )}

                  {profile.facebook && (
                    <a 
                      href={profile.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      <span className="font-bold">Facebook</span>
                    </a>
                  )}

                  {profile.twitter && (
                    <a 
                      href={profile.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      <span className="font-bold">Twitter</span>
                    </a>
                  )}

                  {profile.youtube && (
                    <a 
                      href={profile.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <span className="font-bold">YouTube</span>
                    </a>
                  )}

                  {profile.website && (
                    <a 
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Globe className="h-4 w-4" />
                      <span>Site web</span>
                    </a>
                  )}

                  {profile.other_links && (
                    <a 
                      href={profile.other_links}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Globe className="h-4 w-4" />
                      <span>Autre lien</span>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Liens personnalisés */}
            {profile.custom_links && profile.custom_links.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Liens personnalisés</h3>
                <div className="flex flex-wrap gap-3">
                  {profile.custom_links.map((link, index) => (
                    <a 
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors"
                    >
                      <Globe className="h-4 w-4" />
                      <span>{link.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* QR Code */}
            {profile.qr_code_url && (
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Code QR</h3>
                <div className="inline-block p-4 bg-white rounded-lg shadow-md">
                  <img 
                    src={profile.qr_code_url} 
                    alt="QR Code" 
                    className="h-32 w-32"
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Scannez ce code pour sauvegarder le contact
                </p>
              </div>
            )}

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-500">
                Carte de visite numérique créée avec Ofika
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
