'use client'

// =====================================================
// PAGE ONBOARDING - GÉNÉRATION QR CODE NIVEAU 1
// Présentation simple pour nouveaux utilisateurs
// =====================================================

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/core/ui/card'
import { Button } from '@/components/core/ui/button'
import { Input } from '@/components/core/ui/input'
import { Label } from '@/components/core/ui/label'
import { 
  QrCode, 
  Link2, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles,
  Save,
  Edit,
  BarChart3,
  Plus
} from 'lucide-react'
import { toast } from 'sonner'
import { createQRRedirect, getQRCodeURL, getRedirectURL } from '@/lib/services/qr-redirect-client'

export default function QROnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [destinationUrl, setDestinationUrl] = useState('')
  const [qrData, setQRData] = useState<{
    shortCode: string
    qrCodeUrl: string
    redirectUrl: string
  } | null>(null)
  const [loading, setLoading] = useState(false)

  const handleGenerate = async () => {
    if (!destinationUrl) {
      toast.error('Veuillez saisir une URL de destination')
      return
    }

    setLoading(true)
    try {
      const result = await createQRRedirect({
        nfc_link: destinationUrl,
        redirect_type: 'custom',
        title: 'Mon premier QR Code',
        description: 'Créé via onboarding Niveau 1'
      })

      if (result.success && result.data) {
        const shortCode = result.data.short_code
        setQRData({
          shortCode,
          qrCodeUrl: getQRCodeURL(shortCode, 500),
          redirectUrl: getRedirectURL(shortCode)
        })
        setStep(2)
        toast.success('QR Code généré avec succès !')
      } else {
        toast.error(result.error || 'Erreur lors de la génération')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Erreur lors de la génération')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copié dans le presse-papier !')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full mb-4">
            <QrCode className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Génération de QR Code Dynamique
          </h1>
          <p className="text-lg text-gray-600">Niveau 1 - Première utilisation</p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                s <= step 
                  ? 'bg-gradient-to-br from-orange-500 to-pink-500 text-white' 
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {s}
              </div>
              {s < 4 && (
                <div className={`w-16 h-1 ${
                  s < step ? 'bg-gradient-to-r from-orange-500 to-pink-500' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Étape 1: Saisir l'URL */}
        {step === 1 && (
          <Card className="border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-br from-orange-50 to-pink-50">
              <CardTitle className="flex items-center gap-3 text-xl">
                <Link2 className="w-6 h-6 text-orange-600" />
                Étape 1 : Saisis ton lien de destination
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">
                  <strong>Exemple :</strong> https://mon-site.com/promo<br />
                  Ce lien sera celui vers lequel ton QR Code redirigera.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="url" className="text-base font-medium">
                  URL de destination *
                </Label>
                <Input
                  id="url"
                  type="url"
                  placeholder="https://exemple.com/ma-page"
                  value={destinationUrl}
                  onChange={(e) => setDestinationUrl(e.target.value)}
                  className="text-lg h-12"
                  disabled={loading}
                />
              </div>

              <Button
                onClick={handleGenerate}
                disabled={!destinationUrl || loading}
                className="w-full h-12 text-lg bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
              >
                {loading ? 'Génération...' : 'Générer mon QR Code'}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Étape 2: QR Code généré */}
        {step === 2 && qrData && (
          <Card className="border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-br from-green-50 to-emerald-50">
              <CardTitle className="flex items-center gap-3 text-xl">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                Étape 2 : Ton QR Code est créé !
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800">
                  ✅ <strong>Félicitations !</strong> Ton QR Code dynamique a été créé avec succès.
                </p>
              </div>

              {/* QR Code Display */}
              <div className="flex flex-col items-center">
                <img
                  src={qrData.qrCodeUrl}
                  alt="QR Code"
                  className="w-64 h-64 border-4 border-gray-200 rounded-lg shadow-lg"
                />
                <p className="text-sm text-gray-600 mt-4">Scanner moi pour tester ! 📱</p>
              </div>

              {/* Info boxes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Lien court dynamique:</p>
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-white px-2 py-1 rounded flex-1 truncate">
                      {qrData.redirectUrl}
                    </code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(qrData.redirectUrl)}
                    >
                      Copier
                    </Button>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Destination actuelle:</p>
                  <code className="text-xs bg-white px-2 py-1 rounded block truncate">
                    {destinationUrl}
                  </code>
                </div>
              </div>

              <Button
                onClick={() => setStep(3)}
                className="w-full h-12 text-lg bg-gradient-to-r from-orange-500 to-pink-500"
              >
                Comprendre le système
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Étape 3: Explication */}
        {step === 3 && (
          <Card className="border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-br from-purple-50 to-indigo-50">
              <CardTitle className="flex items-center gap-3 text-xl">
                <Sparkles className="w-6 h-6 text-purple-600" />
                Étape 3 : Comment ça fonctionne ?
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <Save className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Enregistrement automatique</h3>
                    <p className="text-gray-600">
                      Les informations sont sauvegardées dans ta base Supabase :
                    </p>
                    <ul className="text-sm text-gray-600 mt-2 space-y-1">
                      <li>• <strong>ID unique</strong> → Identifiant du QR Code</li>
                      <li>• <strong>URL originale</strong> → {destinationUrl}</li>
                      <li>• <strong>URL dynamique</strong> → {qrData?.redirectUrl}</li>
                      <li>• <strong>Date de création</strong> → Aujourd'hui</li>
                      <li>• <strong>Ton compte</strong> → user_id associé</li>
                    </ul>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Edit className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Mise à jour possible</h3>
                    <p className="text-gray-600">
                      Plus tard, tu pourras <strong>changer le lien de destination</strong> sans recréer le QR Code.
                      C'est ce qui rend ton QR Code <span className="text-orange-600 font-semibold">dynamique</span> ⚡
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Statistiques automatiques</h3>
                    <p className="text-gray-600">
                      Chaque fois que quelqu'un scanne ton QR Code, on enregistre :
                      le nombre de scans, l'appareil utilisé, le navigateur, etc.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>🎯 Objectif de ce niveau</strong><br />
                  Te permettre de comprendre le fonctionnement de base : génération, sauvegarde et redirection dynamique.
                </p>
              </div>

              <Button
                onClick={() => setStep(4)}
                className="w-full h-12 text-lg bg-gradient-to-r from-orange-500 to-pink-500"
              >
                Voir la suite
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Étape 4: Prochaines étapes */}
        {step === 4 && (
          <Card className="border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-br from-amber-50 to-orange-50">
              <CardTitle className="flex items-center gap-3 text-xl">
                <CheckCircle2 className="w-6 h-6 text-orange-600" />
                Étape 4 : Prochaines étapes
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Bravo ! Tu as validé le Niveau 1 🎉
                </h3>
                <p className="text-gray-600">
                  Tu comprends maintenant comment fonctionne la génération de QR Code dynamique.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Niveau 2 - Fonctionnalités avancées :</h4>
                <div className="grid gap-3">
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <BarChart3 className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Statistiques détaillées</p>
                      <p className="text-sm text-gray-600">Nombre de scans, pays, appareil, graphiques...</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <Sparkles className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Personnalisation</p>
                      <p className="text-sm text-gray-600">Couleurs, logo, formes personnalisées...</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <Save className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Organisation</p>
                      <p className="text-sm text-gray-600">Dossiers, campagnes, batch generation...</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  onClick={() => router.push('/dashboard/qr-codes')}
                  className="h-12"
                >
                  Voir mes QR Codes
                </Button>
                <Button
                  onClick={() => router.push('/dashboard/qr-codes/new')}
                  className="h-12 bg-gradient-to-r from-orange-500 to-pink-500"
                >
                  Créer un nouveau
                  <Plus className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
