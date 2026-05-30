import { Palette, Upload, QrCode, CheckCircle } from "lucide-react"
import { Button } from "@/components/core/ui/button"

interface CustomizationStepProps {
  selectedColor: string
  onColorChange: (color: string) => void
}

const colorOptions = [
  { id: 'ofika', name: 'Ofika', gradient: 'from-ofika-orange to-ofika-pink', preview: 'bg-gradient-to-r from-ofika-orange to-ofika-pink' },
  { id: 'blue', name: 'Bleu', gradient: 'from-blue-500 to-purple-500', preview: 'bg-gradient-to-r from-blue-500 to-purple-500' },
  { id: 'green', name: 'Vert', gradient: 'from-green-500 to-teal-500', preview: 'bg-gradient-to-r from-green-500 to-teal-500' },
  { id: 'red', name: 'Rouge', gradient: 'from-red-500 to-pink-500', preview: 'bg-gradient-to-r from-red-500 to-pink-500' },
  { id: 'purple', name: 'Violet', gradient: 'from-purple-500 to-indigo-500', preview: 'bg-gradient-to-r from-purple-500 to-indigo-500' },
  { id: 'gray', name: 'Gris', gradient: 'from-gray-600 to-gray-800', preview: 'bg-gradient-to-r from-gray-600 to-gray-800' }
]

export function CustomizationStep({ selectedColor, onColorChange }: CustomizationStepProps) {
  return (
    <div className="bg-gray-50 rounded-2xl p-8">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-ofika-orange rounded-full flex items-center justify-center">
          <Palette className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Personnalisation</h3>
          <p className="text-gray-600">Couleurs et design final</p>
        </div>
      </div>
      
      <div className="space-y-6">
        {/* Sélection des couleurs */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-4">Couleurs</label>
          <div className="grid grid-cols-3 gap-4">
            {colorOptions.map((color) => (
              <div
                key={color.id}
                className={`relative cursor-pointer transition-all duration-300 hover:scale-105 ${
                  selectedColor === color.id ? 'ring-2 ring-ofika-orange ring-offset-2' : ''
                }`}
                onClick={() => onColorChange(color.id)}
              >
                <div className={`h-16 ${color.preview} rounded-xl shadow-lg`}></div>
                <div className="mt-2 text-center">
                  <span className="text-sm font-medium text-gray-700">{color.name}</span>
                  {selectedColor === color.id && (
                    <div className="flex justify-center mt-1">
                      <CheckCircle className="w-4 h-4 text-ofika-orange" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Options avancées */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-4">Options avancées</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Logo personnalisé</span>
              <Button variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">QR code personnalisé</span>
              <Button variant="outline" size="sm">
                <QrCode className="w-4 h-4 mr-2" />
                Personnaliser
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}



