'use client'

// =====================================================
// PAGE DE GESTION DES QR CODES DYNAMIQUES
// =====================================================

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/core/ui/card'
import { Button } from '@/components/core/ui/button'
import { Input } from '@/components/core/ui/input'
import { Label } from '@/components/core/ui/label'
import { Badge } from '@/components/core/ui/badge'
import {
  QrCode,
  Edit,
  Trash2,
  Copy,
  ExternalLink,
  BarChart3,
  Plus,
  Check,
  Eye,
  EyeOff
} from 'lucide-react'
import { toast } from 'sonner'
import {
  getUserQRRedirects,
  updateQRRedirect,
  deleteQRRedirect,
  getQRCodeURL,
  getRedirectURL
} from '@/lib/services/qr-redirect-client'
import type { QRRedirect } from '@/lib/types/qr-redirect'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/core/ui/dialog'
import { Textarea } from '@/components/core/ui/textarea'
import Link from 'next/link'

export default function QRCodesPage() {
  const [qrCodes, setQRCodes] = useState<QRRedirect[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({
    nfc_link: '',
    title: '',
    description: ''
  })

  useEffect(() => {
    loadQRCodes()
  }, [])

  const loadQRCodes = async () => {
    setLoading(true)
    const result = await getUserQRRedirects()
    if (result.success && result.data) {
      setQRCodes(result.data)
    } else {
      toast.error(result.error || 'Erreur lors du chargement')
    }
    setLoading(false)
  }

  const handleEdit = (qr: QRRedirect) => {
    setEditingId(qr.id)
    setEditForm({
      nfc_link: qr.nfc_link,
      title: qr.title || '',
      description: qr.description || ''
    })
  }

  const handleSave = async (id: string) => {
    const result = await updateQRRedirect(id, editForm)
    if (result.success) {
      toast.success('QR code mis à jour')
      setEditingId(null)
      loadQRCodes()
    } else {
      toast.error(result.error || 'Erreur lors de la mise à jour')
    }
  }

  const handleToggleActive = async (qr: QRRedirect) => {
    const result = await updateQRRedirect(qr.id, { is_active: !qr.is_active })
    if (result.success) {
      toast.success(qr.is_active ? 'QR code désactivé' : 'QR code activé')
      loadQRCodes()
    } else {
      toast.error(result.error || 'Erreur')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce QR code ?')) return

    const result = await deleteQRRedirect(id)
    if (result.success) {
      toast.success('QR code supprimé')
      loadQRCodes()
    } else {
      toast.error(result.error || 'Erreur lors de la suppression')
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copié`)
  }

  const downloadQRCode = async (shortCode: string, title: string) => {
    try {
      const qrUrl = getQRCodeURL(shortCode, 500)

      // Utiliser notre API proxy pour télécharger l'image
      const proxyUrl = `/api/qr-code/download?url=${encodeURIComponent(qrUrl)}`
      const response = await fetch(proxyUrl)

      if (!response.ok) {
        throw new Error('Erreur lors du téléchargement')
      }

      const blob = await response.blob()

      // Créer un URL local pour le blob
      const url = window.URL.createObjectURL(blob)

      // Créer un lien de téléchargement
      const link = document.createElement('a')
      link.href = url
      link.download = `qr-${title || shortCode}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Libérer la mémoire
      window.URL.revokeObjectURL(url)

      toast.success('QR code téléchargé')
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error)
      toast.error('Erreur lors du téléchargement')
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">QR Codes Dynamiques</h1>
            <p className="text-sm sm:text-base text-gray-600">
              Gérez vos QR codes et changez leur destination sans les réimprimer
            </p>
          </div>
          <Link href="/dashboard/qr-codes/new" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600">
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Nouveau QR Code</span>
              <span className="sm:hidden">Créer un QR Code</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-500">{qrCodes.length}</div>
              <div className="text-sm text-gray-600 mt-1">QR Codes</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-500">
                {qrCodes.filter(qr => qr.is_active).length}
              </div>
              <div className="text-sm text-gray-600 mt-1">Actifs</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-500">
                {qrCodes.reduce((sum, qr) => sum + qr.scan_count, 0)}
              </div>
              <div className="text-sm text-gray-600 mt-1">Scans Total</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-500">
                {qrCodes.filter(qr => qr.scan_count > 0).length}
              </div>
              <div className="text-sm text-gray-600 mt-1">Utilisés</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des QR codes */}
      {qrCodes.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Aucun QR code
              </h3>
              <p className="text-gray-600 mb-6">
                Créez votre premier QR code dynamique
              </p>
              <Link href="/dashboard/qr-codes/new">
                <Button className="bg-orange-500 hover:bg-orange-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Créer un QR Code
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {qrCodes.map((qr) => (
            <Card key={qr.id} className={!qr.is_active ? 'opacity-60' : ''}>
              <CardContent className="p-6">
                {editingId === qr.id ? (
                  // Mode édition
                  <div className="space-y-4">
                    <div>
                      <Label>URL de destination * {qr.redirect_type === 'nfc_card' && <span className="text-[10px] text-blue-600 font-normal ml-2">(Géré par votre carte NFC)</span>}</Label>
                      <Input
                        value={editForm.nfc_link}
                        onChange={(e) => setEditForm({ ...editForm, nfc_link: e.target.value })}
                        placeholder="https://exemple.com/profil"
                        disabled={qr.redirect_type === 'nfc_card'}
                      />
                    </div>
                    <div>
                      <Label>Titre</Label>
                      <Input
                        value={editForm.title}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        placeholder="Mon QR Code"
                      />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={editForm.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        placeholder="Description optionnelle"
                        rows={2}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => handleSave(qr.id)} className="bg-green-500 hover:bg-green-600">
                        <Check className="w-4 h-4 mr-2" />
                        Enregistrer
                      </Button>
                      <Button onClick={() => setEditingId(null)} variant="outline">
                        Annuler
                      </Button>
                    </div>
                  </div>
                ) : (
                  // Mode affichage
                  <div className="flex flex-col md:flex-row items-start gap-4 md:gap-6">
                    {/* QR Code Preview */}
                    <div className="flex-shrink-0 mx-auto md:mx-0">
                      <img
                        src={getQRCodeURL(qr.short_code, 150)}
                        alt="QR Code"
                        className="w-40 h-40 md:w-32 md:h-32 rounded-lg border-2 border-gray-200 shadow-md"
                      />
                    </div>

                    {/* Informations */}
                    <div className="flex-1 min-w-0 w-full">
                      <div className="mb-3">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {qr.title || 'Sans titre'}
                          </h3>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={qr.redirect_type === 'nfc_card' ? 'secondary' : (qr.is_active ? 'default' : 'secondary')}
                              className={qr.redirect_type === 'nfc_card' ? 'bg-blue-100 text-blue-700 border-blue-200' : ''}
                            >
                              {qr.redirect_type === 'nfc_card' ? 'Carte NFC (Protégé)' : (qr.is_active ? 'Actif' : 'Inactif')}
                            </Badge>
                            {qr.redirect_type !== 'nfc_card' && (
                              <Badge variant="outline">{qr.redirect_type}</Badge>
                            )}
                          </div>
                        </div>
                        {qr.description && (
                          <p className="text-sm text-gray-600 mb-2">{qr.description}</p>
                        )}
                      </div>

                      {/* URL de destination */}
                      <div className="mb-4">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <span className="text-sm font-medium text-gray-700 sm:w-24 flex-shrink-0">Destination:</span>
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <code className="text-xs sm:text-sm bg-gray-100 px-2 py-1 rounded flex-1 truncate">
                              {qr.nfc_link}
                            </code>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => window.open(qr.nfc_link, '_blank')}
                              className="flex-shrink-0"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-1">
                          <BarChart3 className="w-4 h-4" />
                          <span>{qr.scan_count} scans</span>
                        </div>
                        {qr.last_scanned_at && (
                          <div>
                            Dernier: {new Date(qr.last_scanned_at).toLocaleDateString('fr-FR')}
                          </div>
                        )}
                        <div>
                          Créé: {new Date(qr.created_at).toLocaleDateString('fr-FR')}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(qr)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Modifier
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleActive(qr)}
                          disabled={qr.redirect_type === 'nfc_card'}
                          title={qr.redirect_type === 'nfc_card' ? "Les QR codes liés aux cartes NFC ne peuvent pas être désactivés" : ""}
                        >
                          {qr.is_active ? (
                            <>
                              <EyeOff className="w-4 h-4 mr-2" />
                              Désactiver
                            </>
                          ) : (
                            <>
                              <Eye className="w-4 h-4 mr-2" />
                              Activer
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadQRCode(qr.short_code, qr.title || '')}
                        >
                          <QrCode className="w-4 h-4 mr-2" />
                          Télécharger
                        </Button>
                        <Link href={`/dashboard/qr-codes/${qr.id}/stats`}>
                          <Button size="sm" variant="outline">
                            <BarChart3 className="w-4 h-4 mr-2" />
                            Statistiques
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="outline"
                          className={qr.redirect_type === 'nfc_card' ? 'opacity-50 cursor-not-allowed' : 'text-red-600 hover:text-red-700'}
                          onClick={() => qr.redirect_type !== 'nfc_card' && handleDelete(qr.id)}
                          disabled={qr.redirect_type === 'nfc_card'}
                          title={qr.redirect_type === 'nfc_card' ? "Les QR codes liés aux cartes NFC ne peuvent pas être supprimés" : ""}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Supprimer
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
