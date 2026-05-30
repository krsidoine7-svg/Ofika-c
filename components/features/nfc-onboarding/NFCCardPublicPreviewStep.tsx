'use client'

import { NFCCardStepProps } from '@/lib/types/nfc-card-onboarding'
import { Button } from '@/components/core/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/core/ui/card'
import { ExternalLink, ArrowLeft, CheckCircle } from 'lucide-react'

export function NFCCardPublicPreviewStep({
  formData,
  onNext,
  onPrev,
  isLoading
}: NFCCardStepProps) {
  // Génération d'un lien temporaire pour la prévisualisation
  const tempPublicUrl = `https://ofika.com/preview/${formData.customUrl || 'temp-preview'}`

  const handleOpenPublicPage = () => {
    window.open(tempPublicUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Aperçu de votre page publique
        </h2>
        <p className="text-gray-600">
          Vérifiez l'apparence de votre profil avant de finaliser
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Aperçu de la page publique */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Votre page publique
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden">
                    {formData.logoUrl ? (
                      <img
                        src={formData.logoUrl}
                        alt="Logo"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white text-2xl font-bold">O</span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {formData.fullName || 'Votre Nom'}
                  </h3>
                  <p className="text-gray-600">
                    {formData.jobTitle || 'Votre Poste'} chez {formData.company || 'Votre Entreprise'}
                  </p>
                </div>

                {formData.bio && (
                  <div className="text-center">
                    <p className="text-gray-700 italic">
                      "{formData.bio}"
                    </p>
                  </div>
                )}

                {/* Informations de contact */}
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                    <span>📧</span>
                    <span>{formData.email || 'votre@email.com'}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                    <span>📱</span>
                    <span>{formData.phone || 'Votre téléphone'}</span>
                  </div>
                  {formData.location && (
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                      <span>📍</span>
                      <span>{formData.location}</span>
                    </div>
                  )}
                </div>

                {/* Réseaux sociaux */}
                {(formData.instagram || formData.linkedin || formData.tiktok || formData.otherLinks) && (
                  <div className="pt-4 border-t">
                    <p className="text-sm font-medium text-gray-700 mb-3">Réseaux sociaux</p>
                    <div className="flex justify-center gap-4">
                      {formData.instagram && (
                        <a
                          href={formData.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-pink-500 hover:text-pink-600"
                        >
                          Instagram
                        </a>
                      )}
                      {formData.linkedin && (
                        <a
                          href={formData.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-600"
                        >
                          LinkedIn
                        </a>
                      )}
                      {formData.tiktok && (
                        <a
                          href={formData.tiktok}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-black hover:text-gray-700"
                        >
                          TikTok
                        </a>
                      )}
                      {formData.otherLinks && (
                        <a
                          href={formData.otherLinks}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-500 hover:text-gray-600"
                        >
                          Site web
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Informations sur la page publique */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>À propos de votre page publique</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-600 text-xs">1</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">URL personnalisée</p>
                    <p className="text-sm text-gray-600">
                      Votre profil sera accessible via : <br />
                      <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                        ofika.com/{formData.customUrl || 'votre-nom'}
                      </code>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-600 text-xs">2</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">QR Code NFC</p>
                    <p className="text-sm text-gray-600">
                      Votre carte NFC redirigera automatiquement vers cette page
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-600 text-xs">3</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Partage facile</p>
                    <p className="text-sm text-gray-600">
                      Vos contacts pourront facilement vous contacter et vous suivre
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs">!</span>
                </div>
                <div>
                  <p className="font-medium text-orange-900">Conseil</p>
                  <p className="text-sm text-orange-700">
                    Vérifiez que toutes vos informations sont correctes. 
                    Vous pourrez les modifier après la création de votre carte.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

    </div>
  )
}
