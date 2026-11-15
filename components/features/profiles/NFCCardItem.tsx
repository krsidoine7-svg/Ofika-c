import { memo } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Eye, Smartphone, QrCode, Edit2 } from "lucide-react"
import { toast } from "sonner"
import { NFCCard } from '@/lib/types/nfc-cards'

interface NFCCardItemProps {
  card: NFCCard
  onPreview?: (card: NFCCard, editMode?: boolean) => void
}

export const NFCCardItem = memo(function NFCCardItem({
  card,
  onPreview
}: NFCCardItemProps) {
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Actif'
      case 'inactive': return 'Inactif'
      case 'pending': return 'En attente'
      case 'shipped': return 'Expédié'
      case 'delivered': return 'Livré'
      default: return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200'
      case 'shipped': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'delivered': return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleViewPublic = () => {
    if (card.nfc_link) {
      try {
        let username = card.nfc_link
        if (card.nfc_link.startsWith('http')) {
          const url = new URL(card.nfc_link)
          username = url.pathname.replace(/^\/+|\/+$/g, '') || url.pathname
        } else {
          username = card.nfc_link.split('/').filter(Boolean).pop() || card.nfc_link
        }

        // Nettoyer le username de tout slash restant
        username = username.replace(/^\/+|\/+$/g, '')

        const publicUrl = `/${username}`
        window.open(publicUrl, '_blank', 'noopener,noreferrer')
      } catch (e) {
        console.error("Erreur parsing URL", e)
        // Fallback: essayer d'ouvrir tel quel si ça échoue
        window.open(`/${card.nfc_link}`, '_blank', 'noopener,noreferrer')
      }
    } else {
      toast.error('Lien NFC non disponible')
    }
  }

  return (
    <Card className="group border border-neutral-200/90 shadow-xs hover:shadow-md transition-all duration-200 bg-white overflow-hidden rounded-2xl">
      <CardContent className="p-0">
        <div className="h-full">

          {/* Section Infos & Actions - Style épuré */}
          <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between bg-white relative">

            {/* Header */}
            <div>
              <div className="flex justify-between items-start gap-3 mb-2">
                <div className="space-y-1 min-w-0">
                  <h3 className="text-lg sm:text-xl font-semibold text-neutral-950 tracking-tight leading-tight truncate">
                    {card.profile_name}
                  </h3>
                  <div className="flex items-center text-xs text-neutral-500 font-medium">
                    <Smartphone className="w-3.5 h-3.5 mr-1 text-neutral-600 shrink-0" />
                    <span>Carte NFC connectée</span>
                  </div>
                </div>

                <Badge className={`${getStatusColor(card.status)} border px-2.5 py-0.5 shadow-none uppercase text-[10px] tracking-wider font-semibold shrink-0`}>
                  {getStatusLabel(card.status)}
                </Badge>
              </div>

              <div className="mt-3 space-y-3 overflow-hidden">
                <div className="flex items-center text-xs text-neutral-600 bg-neutral-50/80 p-2.5 rounded-xl border border-neutral-200/70 w-full overflow-hidden">
                  <QrCode className="w-4 h-4 mr-2.5 text-neutral-400 flex-shrink-0" />
                  <span className="truncate flex-1 font-mono text-[11px]" title={card.nfc_link || ''}>
                    {card.nfc_link ? card.nfc_link.replace(/([^:]\/)\/+/g, '$1') : 'Lien non généré'}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="mt-5 flex flex-wrap items-center justify-end gap-2 pt-4 border-t border-neutral-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPreview?.(card, false)}
                className="h-9 px-3 text-xs bg-white text-neutral-700 hover:text-neutral-950 hover:bg-neutral-50 border-neutral-200 rounded-xl"
              >
                <Eye className="w-3.5 h-3.5 mr-1.5" />
                Aperçu
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewPublic}
                className="h-9 px-3 text-xs bg-white text-neutral-700 hover:text-neutral-950 hover:bg-neutral-50 border-neutral-200 rounded-xl"
              >
                <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                Voir en ligne
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => onPreview?.(card, true)}
                className="h-9 px-3.5 text-xs bg-neutral-950 hover:bg-neutral-800 text-white font-medium rounded-xl shadow-xs"
              >
                <Edit2 className="w-3.5 h-3.5 mr-1.5" />
                Personnaliser
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})
