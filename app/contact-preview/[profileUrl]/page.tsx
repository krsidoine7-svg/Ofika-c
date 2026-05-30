'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ProfileWithLinks } from '@/lib/types/database'
import { Button } from '@/components/core/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/core/ui/card'
import { Badge } from '@/components/core/ui/badge'
import { ArrowLeft, UserPlus, Download, Smartphone, Check, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface DeviceInfo {
  isIOS: boolean
  isAndroid: boolean
  isMobile: boolean
  isDesktop: boolean
  isSafari: boolean
  isChrome: boolean
  supportsWebShare: boolean
  supportsClipboard: boolean
  supportsQRCode: boolean
}

export default function ContactPreviewPage() {
  const params = useParams()
  const router = useRouter()
  const [profile, setProfile] = useState<ProfileWithLinks | null>(null)
  const [loading, setLoading] = useState(true)
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isIOS: false,
    isAndroid: false,
    isMobile: false,
    isDesktop: false,
    isSafari: false,
    isChrome: false,
    supportsWebShare: false,
    supportsClipboard: false,
    supportsQRCode: false
  })
  const [isAddingToContacts, setIsAddingToContacts] = useState(false)
  const [contactAdded, setContactAdded] = useState(false)

  useEffect(() => {
    const profileUrl = params.profileUrl as string
    if (profileUrl) {
      fetchProfile(profileUrl)
    }

    // Détecter l'appareil
    const userAgent = navigator.userAgent
    const isIOS = /iPhone|iPad|iPod/i.test(userAgent)
    const isAndroid = /Android/i.test(userAgent)
    const isMobile = isIOS || isAndroid || /Mobile/i.test(userAgent)
    const isDesktop = !isMobile
    const isSafari = /Safari/i.test(userAgent) && !/Chrome/i.test(userAgent)
    const isChrome = /Chrome/i.test(userAgent)
    const supportsWebShare = 'share' in navigator && 'canShare' in navigator
    const supportsClipboard = 'clipboard' in navigator && 'writeText' in navigator.clipboard
    const supportsQRCode = 'BarcodeDetector' in window || 'QRCodeDetector' in window

    setDeviceInfo({
      isIOS,
      isAndroid,
      isMobile,
      isDesktop,
      isSafari,
      isChrome,
      supportsWebShare,
      supportsClipboard,
      supportsQRCode
    })
  }, [params.profileUrl])

  const fetchProfile = async (profileUrl: string) => {
    try {
      setLoading(true)
      const supabase = createClient()

      // Essayer de récupérer par custom_url d'abord
      let { data: profileData, error } = await supabase
        .from('profiles')
        .select(`
          *,
          social_links,
          custom_links
        `)
        .eq('custom_url', profileUrl)
        .eq('is_public', true)
        .eq('is_active', true)
        .single()

      // Si pas trouvé, essayer par username
      if (!profileData) {
        const { data: profileByUsername, error: usernameError } = await supabase
          .from('profiles')
          .select(`
            *,
            social_links,
            custom_links
          `)
          .eq('username', profileUrl)
          .eq('is_public', true)
          .eq('is_active', true)
          .single()

        profileData = profileByUsername
        error = usernameError
      }

      if (error || !profileData) {
        console.error('Erreur lors de la récupération du profil:', error)
        toast.error('Profil non trouvé')
        return
      }

      setProfile(profileData as ProfileWithLinks)
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors du chargement du profil')
    } finally {
      setLoading(false)
    }
  }

  // Génération vCard complète
  const generateVCard = () => {
    if (!profile) return ''

    const vcard = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${profile.name}`,
      `N:${profile.name};;;`,
      profile.bio ? `NOTE:${profile.bio}` : '',
      profile.email ? `EMAIL:${profile.email}` : '',
      profile.phone ? `TEL:${profile.phone}` : '',
      profile.image_url ? `PHOTO:${profile.image_url}` : '',
      // Réseaux sociaux depuis social_links
      ...(profile.social_links || []).map(link => `URL:${link.url}`),
      // URL du profil public
      `URL:${typeof window !== 'undefined' ? window.location.href : ''}`,
      'END:VCARD'
    ].filter(line => line).join('\n')

    return vcard
  }

  // Ajout aux contacts mobiles
  const handleAddToContacts = async () => {
    if (!profile) return

    try {
      setIsAddingToContacts(true)
      const vcard = generateVCard()
      console.log('Ajout aux contacts - vCard généré:', vcard.substring(0, 100) + '...')

      // Essayer Web Share API d'abord (iOS 12.2+, Android avec support)
      const isSecureContext = window.isSecureContext || window.location.protocol === 'https:'

      if (isSecureContext && navigator.share && navigator.canShare) {
        const blob = new Blob([vcard], { type: 'text/vcard' })
        const file = new File([blob], `${profile.name.replace(/[^a-z0-9]/gi, '_')}.vcf`, {
          type: 'text/vcard'
        })

        if (navigator.canShare({ files: [file] })) {
          console.log('Utilisation de Web Share API')

          try {
            await navigator.share({
              title: `Contact: ${profile.name}`,
              text: `Ajoutez ${profile.name} à vos contacts`,
              files: [file]
            })

            toast.success('Contact partagé avec succès !')
            setContactAdded(true)
            setIsAddingToContacts(false)
            return
          } catch (shareError) {
            if (shareError instanceof Error && shareError.name === 'AbortError') {
              console.log('Partage annulé par l\'utilisateur')
              setIsAddingToContacts(false)
              return
            }
            console.error('Erreur Web Share:', shareError)
          }
        }
      }

      // Fallback : Téléchargement direct
      console.log('Fallback sur téléchargement direct')
      const blob = new Blob([vcard], { type: 'text/x-vcard' })
      const url = URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = url
      link.download = `${profile.name.replace(/[^a-z0-9]/gi, '_')}.vcf`
      link.style.display = 'none'
      document.body.appendChild(link)

      console.log('Déclenchement du téléchargement...')
      link.click()

      setTimeout(() => {
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }, 100)

      setContactAdded(true)

      // Instructions spécifiques selon l'appareil
      if (deviceInfo.isIOS) {
        toast.info('📱 Ouvrez le fichier .vcf téléchargé pour l\'importer dans vos contacts iOS', {
          duration: 8000
        })
      } else if (deviceInfo.isAndroid) {
        toast.info('🤖 Ouvrez le fichier .vcf téléchargé et sélectionnez "Importer dans Contacts"', {
          duration: 8000
        })
      } else {
        toast.success('Fichier de contact téléchargé ! Ouvrez-le pour l\'importer.')
      }

    } catch (error) {
      console.error('Erreur lors de l\'ajout aux contacts:', error)
      toast.error('Erreur lors de l\'ajout du contact')
    } finally {
      setIsAddingToContacts(false)
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

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardContent className="text-center p-6">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Profil non trouvé</h2>
            <p className="text-gray-600 mb-4">
              Le profil demandé n'existe pas ou n'est pas accessible.
            </p>
            <Button onClick={() => router.back()}>
              Retour
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header avec bouton retour */}
      <div className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Informations du profil */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              {profile.image_url ? (
                <img
                  src={profile.image_url}
                  alt={profile.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-500 to-gray-700 flex items-center justify-center text-white font-bold">
                  {profile.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h1 className="text-xl font-bold">{profile.name}</h1>
                {profile.bio && (
                  <p className="text-sm text-gray-600 mt-1">{profile.bio}</p>
                )}
              </div>
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Informations de contact */}
            {profile.email && (
              <div className="flex items-center space-x-2 text-sm">
                <span className="font-medium">Email:</span>
                <span className="text-gray-600">{profile.email}</span>
              </div>
            )}

            {profile.phone && (
              <div className="flex items-center space-x-2 text-sm">
                <span className="font-medium">Téléphone:</span>
                <span className="text-gray-600">{profile.phone}</span>
              </div>
            )}

            {/* Réseaux sociaux */}
            {profile.social_links && profile.social_links.length > 0 && (
              <div>
                <p className="font-medium text-sm mb-2">Réseaux sociaux:</p>
                <div className="flex flex-wrap gap-2">
                  {profile.social_links.map((link, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {link.platform}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bouton principal d'ajout aux contacts */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <Smartphone className="h-12 w-12 text-blue-600 mx-auto" />

              <div>
                <h2 className="text-xl font-semibold mb-2">
                  {contactAdded ? 'Contact ajouté !' : 'Ajouter aux contacts'}
                </h2>
                <p className="text-gray-600">
                  {contactAdded
                    ? 'Le contact a été ajouté à votre appareil.'
                    : 'Cliquez ci-dessous pour ajouter ce contact à votre répertoire téléphonique.'
                  }
                </p>
              </div>

              {!contactAdded && (
                <Button
                  onClick={handleAddToContacts}
                  disabled={isAddingToContacts}
                  size="lg"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isAddingToContacts ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                      Génération...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-5 w-5 mr-2" />
                      Ajouter aux contacts
                    </>
                  )}
                </Button>
              )}

              {contactAdded && (
                <div className="flex items-center justify-center space-x-2 text-green-600">
                  <Check className="h-5 w-5" />
                  <span className="font-medium">Contact ajouté avec succès !</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Instructions spécifiques selon l'appareil */}
        {contactAdded && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Instructions d'importation</CardTitle>
            </CardHeader>
            <CardContent>
              {deviceInfo.isIOS ? (
                <div className="space-y-3">
                  <p className="font-medium">Pour iPhone/iPad :</p>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                    <li>Ouvrez l'app "Fichiers"</li>
                    <li>Naviguez vers "Téléchargements"</li>
                    <li>Appuyez sur le fichier .vcf</li>
                    <li>Sélectionnez "Partager"</li>
                    <li>Choisissez "Ajouter aux contacts"</li>
                  </ol>
                </div>
              ) : deviceInfo.isAndroid ? (
                <div className="space-y-3">
                  <p className="font-medium">Pour Android :</p>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                    <li>Ouvrez votre gestionnaire de fichiers</li>
                    <li>Naviguez vers "Téléchargements"</li>
                    <li>Appuyez longuement sur le fichier .vcf</li>
                    <li>Sélectionnez "Ouvrir avec"</li>
                    <li>Choisissez "Contacts" ou "Importer dans Contacts"</li>
                  </ol>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="font-medium">Sur ordinateur :</p>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                    <li>Ouvrez le fichier .vcf téléchargé</li>
                    <li>Votre application de contacts par défaut s'ouvrira</li>
                    <li>Suivez les instructions pour importer le contact</li>
                  </ol>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Informations de compatibilité */}
        <Card className="mt-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-2 justify-center">
              <Badge variant="secondary">
                {deviceInfo.isMobile ? 'Mobile' : 'Desktop'}
              </Badge>
              {deviceInfo.isIOS && <Badge variant="secondary">iOS</Badge>}
              {deviceInfo.isAndroid && <Badge variant="secondary">Android</Badge>}
              {deviceInfo.supportsWebShare && (
                <Badge variant="secondary">Web Share</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
