'use client'

// =====================================================
// COMPOSANT DE GESTION DES CAMPAGNES QR
// Modal création, liste, édition, suppression
// =====================================================

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Edit2, Trash2, Folder, QrCode, BarChart3 } from 'lucide-react'
import { toast } from 'sonner'
import {
  getUserCampaigns,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  CAMPAIGN_COLORS,
  type QRCampaign
} from '@/lib/services/qr-campaigns'

interface CampaignManagerProps {
  selectedCampaignId?: string
  onSelectCampaign?: (campaignId: string | undefined) => void
  compact?: boolean
}

export default function CampaignManager({
  selectedCampaignId,
  onSelectCampaign,
  compact = false
}: CampaignManagerProps) {
  const [campaigns, setCampaigns] = useState<QRCampaign[]>([])
  const [loading, setLoading] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<QRCampaign | null>(null)

  // Form states
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState('#f97316')

  // Charger les campagnes
  const loadCampaigns = async () => {
    setLoading(true)
    const result = await getUserCampaigns()
    if (result.success && result.data) {
      setCampaigns(result.data)
    } else {
      toast.error(result.error || 'Erreur lors du chargement')
    }
    setLoading(false)
  }

  useEffect(() => {
    loadCampaigns()
  }, [])

  // Reset form
  const resetForm = () => {
    setName('')
    setDescription('')
    setColor('#f97316')
    setEditingCampaign(null)
  }

  // Créer campagne
  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error('Le nom est requis')
      return
    }

    setLoading(true)
    const result = await createCampaign({ name, description, color })
    setLoading(false)

    if (result.success) {
      toast.success('Campagne créée !')
      setIsCreateOpen(false)
      resetForm()
      loadCampaigns()
    } else {
      toast.error(result.error || 'Erreur lors de la création')
    }
  }

  // Modifier campagne
  const handleUpdate = async () => {
    if (!editingCampaign) return

    if (!name.trim()) {
      toast.error('Le nom est requis')
      return
    }

    setLoading(true)
    const result = await updateCampaign(editingCampaign.id, { name, description, color })
    setLoading(false)

    if (result.success) {
      toast.success('Campagne modifiée !')
      setIsCreateOpen(false)
      resetForm()
      loadCampaigns()
    } else {
      toast.error(result.error || 'Erreur lors de la modification')
    }
  }

  // Supprimer campagne
  const handleDelete = async (campaignId: string) => {
    if (!confirm('Supprimer cette campagne ? Les QR codes ne seront pas supprimés.')) {
      return
    }

    setLoading(true)
    const result = await deleteCampaign(campaignId)
    setLoading(false)

    if (result.success) {
      toast.success('Campagne supprimée')
      loadCampaigns()
      if (selectedCampaignId === campaignId) {
        onSelectCampaign?.(undefined)
      }
    } else {
      toast.error(result.error || 'Erreur lors de la suppression')
    }
  }

  // Ouvrir édition
  const openEdit = (campaign: QRCampaign) => {
    setEditingCampaign(campaign)
    setName(campaign.name)
    setDescription(campaign.description || '')
    setColor(campaign.color)
    setIsCreateOpen(true)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Folder className="w-5 h-5 text-orange-600" />
          <h3 className="font-semibold text-gray-900">Campagnes</h3>
        </div>

        {/* Bouton créer */}
        <Dialog open={isCreateOpen} onOpenChange={(open) => {
          setIsCreateOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Nouvelle
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCampaign ? 'Modifier la campagne' : 'Nouvelle campagne'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Nom */}
              <div className="space-y-2">
                <Label htmlFor="campaign-name">Nom de la campagne *</Label>
                <Input
                  id="campaign-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Promo Été 2025"
                  maxLength={100}
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="campaign-desc">Description</Label>
                <Textarea
                  id="campaign-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optionnel: décrivez cette campagne..."
                  rows={3}
                />
              </div>

              {/* Couleur */}
              <div className="space-y-2">
                <Label>Couleur</Label>
                <div className="grid grid-cols-8 gap-2">
                  {CAMPAIGN_COLORS.map(c => (
                    <button
                      key={c.value}
                      onClick={() => setColor(c.value)}
                      className={`w-8 h-8 rounded-full transition-all ${
                        color === c.value 
                          ? 'ring-2 ring-offset-2 ring-gray-900 scale-110' 
                          : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: c.value }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreateOpen(false)
                    resetForm()
                  }}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button
                  onClick={editingCampaign ? handleUpdate : handleCreate}
                  disabled={loading || !name.trim()}
                  className="flex-1"
                >
                  {loading ? 'Enregistrement...' : editingCampaign ? 'Modifier' : 'Créer'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Option "Aucune campagne" */}
      {onSelectCampaign && (
        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${
            selectedCampaignId === undefined 
              ? 'border-2 border-orange-500 bg-orange-50' 
              : 'border hover:border-gray-400'
          }`}
          onClick={() => onSelectCampaign(undefined)}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                  <QrCode className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Sans campagne</p>
                  <p className="text-xs text-gray-500">QR codes non classés</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liste des campagnes */}
      <div className="space-y-2">
        {campaigns.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-500">
            <Folder className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">Aucune campagne pour le moment</p>
            <p className="text-xs mt-1">Créez-en une pour organiser vos QR codes</p>
          </div>
        )}

        {campaigns.map(campaign => (
          <Card
            key={campaign.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedCampaignId === campaign.id 
                ? 'border-2 bg-orange-50' 
                : 'border hover:border-gray-400'
            }`}
            style={{
              borderColor: selectedCampaignId === campaign.id ? campaign.color : undefined
            }}
            onClick={() => onSelectCampaign?.(campaign.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                {/* Info */}
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: campaign.color }}
                  >
                    <Folder className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {campaign.name}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                      <span className="flex items-center gap-1">
                        <QrCode className="w-3 h-3" />
                        {campaign.total_qr_codes} QR
                      </span>
                      <span className="flex items-center gap-1">
                        <BarChart3 className="w-3 h-3" />
                        {campaign.total_scans} scans
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      openEdit(campaign)
                    }}
                    className="h-8 w-8 p-0"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(campaign.id)
                    }}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Description */}
              {campaign.description && (
                <p className="text-xs text-gray-600 mt-2 pl-13">
                  {campaign.description}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
