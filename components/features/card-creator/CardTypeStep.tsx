import { CreditCard, QrCode } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { NFC_CARD_BASE_PRICE } from "@/lib/config/pricing"

interface CardTypeStepProps {
  selectedType: 'nfc_qr' | 'qr_only'
  onTypeChange: (type: 'nfc_qr' | 'qr_only') => void
}

export function CardTypeStep({ selectedType, onTypeChange }: CardTypeStepProps) {
  return (
    <div className="bg-gray-50 rounded-2xl p-8">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-ofika-orange rounded-full flex items-center justify-center">
          <CreditCard className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Type de carte</h3>
          <p className="text-gray-600">Choisissez NFC+QR ou QR seulement</p>
        </div>
      </div>
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* NFC + QR */}
          <div 
            className={`border-2 rounded-xl p-6 cursor-pointer transition-all duration-300 hover:shadow-lg ${
              selectedType === 'nfc_qr' 
                ? 'border-ofika-orange bg-ofika-orange/5' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onTypeChange('nfc_qr')}
          >
            <div className="flex items-start space-x-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                selectedType === 'nfc_qr' ? 'bg-ofika-orange' : 'bg-gray-200'
              }`}>
                <QrCode className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 mb-2">NFC + QR</h4>
                <p className="text-sm text-gray-600 mb-3">Partage instantané par contact ou scan</p>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="text-xs">Complet</Badge>
                  <Badge variant="outline" className="text-xs">Recommandé</Badge>
                </div>
              </div>
            </div>
          </div>

          {/* QR seulement */}
          <div 
            className={`border-2 rounded-xl p-6 cursor-pointer transition-all duration-300 hover:shadow-lg ${
              selectedType === 'qr_only' 
                ? 'border-ofika-orange bg-ofika-orange/5' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onTypeChange('qr_only')}
          >
            <div className="flex items-start space-x-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                selectedType === 'qr_only' ? 'bg-ofika-orange' : 'bg-gray-200'
              }`}>
                <QrCode className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 mb-2">QR seulement</h4>
                <p className="text-sm text-gray-600 mb-3">Partage par scan uniquement</p>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="text-xs">Économique</Badge>
                  <Badge variant="outline" className="text-xs">Simple</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Comparaison des fonctionnalités */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-4">Comparaison des fonctionnalités</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Partage par contact NFC</span>
              <div className="flex space-x-4">
                <span className={`text-sm font-medium ${selectedType === 'nfc_qr' ? 'text-green-600' : 'text-gray-400'}`}>
                  {selectedType === 'nfc_qr' ? '✓' : '✗'}
                </span>
                <span className="text-sm font-medium text-gray-400">✗</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Partage par scan QR</span>
              <div className="flex space-x-4">
                <span className="text-sm font-medium text-green-600">✓</span>
                <span className="text-sm font-medium text-green-600">✓</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Prix</span>
              <div className="flex space-x-4">
                <span className="text-sm font-medium text-gray-600">{NFC_CARD_BASE_PRICE.toLocaleString('fr-FR')} FCFA</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}



