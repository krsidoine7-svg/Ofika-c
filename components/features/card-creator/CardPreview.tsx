import { QrCode, Award } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { CardData } from './CardCreator'

interface CardPreviewProps {
  data: CardData
  type: 'nfc_qr' | 'qr_only'
  color: string
}

const colorOptions = [
  { id: 'ofika', gradient: 'from-ofika-orange to-ofika-pink' },
  { id: 'blue', gradient: 'from-blue-500 to-purple-500' },
  { id: 'green', gradient: 'from-green-500 to-teal-500' },
  { id: 'red', gradient: 'from-red-500 to-pink-500' },
  { id: 'purple', gradient: 'from-purple-500 to-indigo-500' },
  { id: 'gray', gradient: 'from-gray-600 to-gray-800' }
]

export function CardPreview({ data, type, color }: CardPreviewProps) {
  const selectedColor = colorOptions.find(c => c.id === color)?.gradient || 'from-ofika-orange to-ofika-pink'

  return (
    <div className="relative">
      {/* Carte physique */}
      <div className={`w-80 h-48 ${selectedColor} rounded-2xl shadow-2xl p-6 text-white transform hover:scale-105 transition-all duration-300`}>
        <div className="flex justify-between items-start mb-4">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-xl font-bold">O</span>
          </div>
          <QrCode className="w-8 h-8 opacity-80" />
        </div>
        <div className="mt-8">
          <h5 className="font-bold text-2xl mb-2">{data.name}</h5>
          <p className="text-sm opacity-90">{data.title}</p>
          <p className="text-xs opacity-75 mt-1">{data.company}</p>
        </div>
      </div>
      
      {/* Badge de type de carte */}
      <div className="absolute -top-2 -right-2">
        <Badge className={`${
          type === 'nfc_qr' ? 'bg-green-500' : 'bg-blue-500'
        } text-white`}>
          {type === 'nfc_qr' ? 'NFC+QR' : 'QR'}
        </Badge>
      </div>
      
      {/* Éléments décoratifs */}
      <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center">
        <Award className="w-8 h-8 text-ofika-orange" />
      </div>
      
      {/* Animation de scan pour NFC+QR */}
      {type === 'nfc_qr' && (
        <div className="absolute inset-0 rounded-2xl border-2 border-white/30 animate-pulse"></div>
      )}
    </div>
  )
}







