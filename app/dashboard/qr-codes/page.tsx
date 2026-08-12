'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  QrCode,
  Edit2,
  Trash2,
  Copy,
  ExternalLink,
  BarChart3,
  Plus,
  Check,
  Eye,
  EyeOff,
  CreditCard,
  Link2,
  X,
  Wifi,
  ChevronDown,
  Download
} from 'lucide-react'
import { toast } from 'sonner'
import {
  getUserQRRedirects,
  updateQRRedirect,
  deleteQRRedirect,
  getRedirectURL
} from '@/lib/services/qr-redirect-client'
import type { QRRedirect } from '@/lib/types/qr-redirect'
import Link from 'next/link'
import { QRCodeSVG } from 'qrcode.react'
import { downloadSVGAsFile } from '@/lib/utils/download-qr'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useProfiles } from '@/lib/hooks/useProfiles'

export default function QRCodesPage() {
  const [qrCodes, setQRCodes] = useState<QRRedirect[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({
    nfc_link: '',
    target_url: '',
    title: '',
    description: ''
  })
  const { profiles } = useProfiles()

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
      nfc_link: qr.nfc_link || '',
      target_url: qr.nfc_link || '',
      title: qr.title || '',
      description: qr.description || ''
    })
  }

  const handleSave = async (id: string, qr: QRRedirect) => {
    const isNfc = qr.redirect_type === 'nfc_card'
    const updateData = isNfc
      ? { nfc_link: editForm.nfc_link, title: editForm.title }
      : { nfc_link: editForm.target_url, title: editForm.title, description: editForm.description }

    const result = await updateQRRedirect(id, updateData)
    if (result.success) {
      toast.success('QR code mis à jour !')
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
    toast.success(`${label} copié !`)
  }

  const downloadQRCode = async (shortCode: string, title: string, id: string, format: 'png' | 'svg') => {
    try {
      const svgId = `qr-${id}`
      await downloadSVGAsFile(svgId, `qr-${title || shortCode}`, format)
      toast.success(`QR code téléchargé en ${format.toUpperCase()}`)
    } catch (error) {
      toast.error('Erreur lors du téléchargement')
    }
  }

  const isNfcCard = (qr: QRRedirect) => qr.redirect_type === 'nfc_card'

  const nfcQRCodes = qrCodes.filter(isNfcCard)
  const libreQRCodes = qrCodes.filter(qr => !isNfcCard(qr))

  // Public profile URL builder
  const getProfilePublicUrl = (profile: any) => {
    const base = typeof window !== 'undefined' ? window.location.origin : 'https://ofika.app'
    return `${base}/p/${profile.custom_url || profile.username || profile.id}`
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-500 font-medium">Chargement des QR codes...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">QR Codes Dynamiques</h1>
            <p className="text-sm text-gray-500 mt-1">
              Changez la destination de vos QR codes sans les réimprimer
            </p>
          </div>
          <Link href="/dashboard/qr-codes/new?type=dynamic">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white shadow-sm">
              <Plus className="w-4 h-4 mr-2" />
              Nouveau QR Code
            </Button>
          </Link>
        </div>

        {/* Stats rapides */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-orange-500">{qrCodes.length}</div>
            <div className="text-xs text-gray-500 mt-0.5 font-medium">Total</div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-green-500">{qrCodes.filter(qr => qr.is_active).length}</div>
            <div className="text-xs text-gray-500 mt-0.5 font-medium">Actifs</div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-blue-500">{qrCodes.reduce((sum, qr) => sum + (qr.scan_count || 0), 0)}</div>
            <div className="text-xs text-gray-500 mt-0.5 font-medium">Scans</div>
          </div>
        </div>

        {qrCodes.length === 0 ? (
          // État vide
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 text-center">
            <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <QrCode className="w-10 h-10 text-orange-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun QR code</h3>
            <p className="text-gray-500 mb-6 text-sm">
              Vos QR codes liés à vos cartes NFC apparaîtront ici automatiquement.<br />
              Vous pouvez aussi en créer des libres.
            </p>
            <Link href="/dashboard/qr-codes/new?type=dynamic">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Créer un QR code libre
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-8">

            {/* Section QR Codes Carte NFC */}
            {nfcQRCodes.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                  </div>
                  <h2 className="text-base font-bold text-gray-800">Liés à vos Cartes NFC</h2>
                  <span className="text-xs text-gray-400 font-medium ml-1">({nfcQRCodes.length})</span>
                </div>
                <p className="text-xs text-gray-500 mb-4 -mt-2 ml-9">
                  Ces QR codes sont générés automatiquement. Vous pouvez changer vers quel profil ils pointent.
                </p>
                <div className="space-y-3">
                  {nfcQRCodes.map((qr) => (
                    <QRCardItem
                      key={qr.id}
                      qr={qr}
                      isNfc={true}
                      editingId={editingId}
                      editForm={editForm}
                      setEditForm={setEditForm}
                      profiles={profiles}
                      getProfilePublicUrl={getProfilePublicUrl}
                      getRedirectURL={getRedirectURL}
                      onEdit={handleEdit}
                      onSave={handleSave}
                      onCancelEdit={() => setEditingId(null)}
                      onToggleActive={handleToggleActive}
                      onDelete={handleDelete}
                      onCopy={copyToClipboard}
                      onDownload={downloadQRCode}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Section QR Codes Libres */}
            {libreQRCodes.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Link2 className="w-4 h-4 text-orange-600" />
                  </div>
                  <h2 className="text-base font-bold text-gray-800">QR Codes Libres</h2>
                  <span className="text-xs text-gray-400 font-medium ml-1">({libreQRCodes.length})</span>
                </div>
                <p className="text-xs text-gray-500 mb-4 -mt-2 ml-9">
                  Créés manuellement. Vous pouvez modifier l'URL de destination et les supprimer.
                </p>
                <div className="space-y-3">
                  {libreQRCodes.map((qr) => (
                    <QRCardItem
                      key={qr.id}
                      qr={qr}
                      isNfc={false}
                      editingId={editingId}
                      editForm={editForm}
                      setEditForm={setEditForm}
                      profiles={profiles}
                      getProfilePublicUrl={getProfilePublicUrl}
                      getRedirectURL={getRedirectURL}
                      onEdit={handleEdit}
                      onSave={handleSave}
                      onCancelEdit={() => setEditingId(null)}
                      onToggleActive={handleToggleActive}
                      onDelete={handleDelete}
                      onCopy={copyToClipboard}
                      onDownload={downloadQRCode}
                    />
                  ))}
                </div>
              </section>
            )}

          </div>
        )}

      </div>
    </div>
  )
}

// ─── Composant carte QR ───────────────────────────────────────────────────────
function QRCardItem({
  qr, isNfc, editingId, editForm, setEditForm, profiles, getProfilePublicUrl,
  getRedirectURL, onEdit, onSave, onCancelEdit, onToggleActive, onDelete, onCopy, onDownload
}: any) {
  const isEditing = editingId === qr.id
  const targetUrl = qr.nfc_link || ''
  const shortUrl = qr.short_code ? getRedirectURL(qr.short_code) : targetUrl

  return (
    <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all duration-200 ${
      !qr.is_active ? 'opacity-60 border-gray-100' : 'border-gray-200 hover:border-orange-200 hover:shadow-md'
    }`}>
      {/* Barre colorée en haut selon le type */}
      <div className={`h-1 w-full ${isNfc ? 'bg-gradient-to-r from-blue-400 to-blue-600' : 'bg-gradient-to-r from-orange-400 to-orange-600'}`} />

      <div className="p-5">
        {isEditing ? (
          // ── Mode Édition ──────────────────────────────────────
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-gray-900">{isNfc ? 'Modifier le profil de destination' : 'Modifier le QR code'}</h3>
              <button onClick={onCancelEdit} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {isNfc ? (
              // Sélecteur de profils pour les cartes NFC
              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Profil de destination
                </Label>
                {profiles.length === 0 ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
                    Vous n'avez aucun profil public. <a href="/dashboard/profiles" className="font-bold underline">Créer un profil</a>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {profiles.map((profile: any) => {
                      const profileUrl = getProfilePublicUrl(profile)
                      const isSelected = editForm.nfc_link === profileUrl
                      return (
                        <button
                          key={profile.id}
                          onClick={() => setEditForm({ ...editForm, nfc_link: profileUrl })}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                          }`}
                        >
                          {profile.image_url ? (
                            <img src={profile.image_url} alt={profile.name} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 text-orange-600 font-bold text-sm">
                              {profile.name?.substring(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 text-sm truncate">{profile.name}</p>
                            <p className="text-xs text-gray-500 truncate">{profile.job_title || profile.company || 'Profil'}</p>
                          </div>
                          {isSelected && <Check className="w-5 h-5 text-blue-500 flex-shrink-0" />}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            ) : (
              // Saisie URL libre pour les QR codes libres
              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                  URL de destination
                </Label>
                <Input
                  value={editForm.target_url}
                  onChange={(e) => setEditForm({ ...editForm, target_url: e.target.value })}
                  placeholder="https://exemple.com"
                  className="h-11 rounded-xl border-gray-300 focus:border-orange-400 focus:ring-orange-200"
                />
              </div>
            )}

            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-2 block">Titre (optionnel)</Label>
              <Input
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                placeholder="Mon QR Code"
                className="h-11 rounded-xl border-gray-300 focus:border-orange-400 focus:ring-orange-200"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <Button
                onClick={() => onSave(qr.id, qr)}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white rounded-xl h-10"
              >
                <Check className="w-4 h-4 mr-2" />
                Enregistrer
              </Button>
              <Button onClick={onCancelEdit} variant="outline" className="rounded-xl h-10 px-4">
                Annuler
              </Button>
            </div>
          </div>
        ) : (
          // ── Mode Affichage ────────────────────────────────────
          <div className="flex flex-col sm:flex-row items-start gap-4">

            {/* QR Code */}
            <div className="flex-shrink-0 mx-auto sm:mx-0">
              <div className="bg-white p-2 rounded-xl border-2 border-gray-200 shadow-sm">
                <QRCodeSVG
                  id={`qr-${qr.id}`}
                  value={qr.redirect_type === 'static' ? targetUrl : shortUrl}
                  size={100}
                  level="H"
                  includeMargin={false}
                />
              </div>
            </div>

            {/* Infos */}
            <div className="flex-1 min-w-0 w-full">
              {/* Titre & Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h3 className="text-base font-bold text-gray-900">
                  {qr.title || (isNfc ? 'Carte NFC' : 'QR Code libre')}
                </h3>
                {isNfc && (
                  <Badge className="bg-blue-100 text-blue-700 border-0 text-[10px] py-0.5 px-2">
                    <CreditCard className="w-3 h-3 mr-1" />
                    Carte NFC
                  </Badge>
                )}
                {!isNfc && (
                  <Badge className="bg-orange-100 text-orange-700 border-0 text-[10px] py-0.5 px-2">
                    <Link2 className="w-3 h-3 mr-1" />
                    Libre
                  </Badge>
                )}
                <Badge className={`border-0 text-[10px] py-0.5 px-2 ${qr.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {qr.is_active ? 'Actif' : 'Inactif'}
                </Badge>
              </div>

              {/* URL destination */}
              <div className="flex items-center gap-2 mb-3">
                <code className="text-xs bg-gray-100 px-2 py-1.5 rounded-lg flex-1 truncate text-gray-600 border border-gray-200">
                  {targetUrl}
                </code>
                <button
                  onClick={() => window.open(targetUrl, '_blank')}
                  className="text-gray-400 hover:text-orange-500 transition-colors flex-shrink-0"
                  title="Ouvrir le lien"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>

              {/* Scans */}
              <div className="flex items-center gap-1 text-xs text-gray-400 mb-4">
                <BarChart3 className="w-3.5 h-3.5" />
                <span>{qr.scan_count || 0} scans</span>
                {qr.last_scanned_at && (
                  <span className="ml-2">· Dernier : {new Date(qr.last_scanned_at).toLocaleDateString('fr-FR')}</span>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(qr)}
                  className="h-8 rounded-lg text-xs border-gray-200 hover:border-blue-400 hover:text-blue-600"
                >
                  <Edit2 className="w-3.5 h-3.5 mr-1.5" />
                  Modifier
                </Button>

                {!isNfc && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onToggleActive(qr)}
                    className="h-8 rounded-lg text-xs border-gray-200"
                  >
                    {qr.is_active
                      ? <><EyeOff className="w-3.5 h-3.5 mr-1.5" />Désactiver</>
                      : <><Eye className="w-3.5 h-3.5 mr-1.5" />Activer</>
                    }
                  </Button>
                )}

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onCopy(shortUrl, 'Lien')}
                  className="h-8 rounded-lg text-xs border-gray-200"
                >
                  <Copy className="w-3.5 h-3.5 mr-1.5" />
                  Copier lien
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="outline" className="h-8 rounded-lg text-xs border-gray-200">
                      <Download className="w-3.5 h-3.5 mr-1.5" />
                      Télécharger
                      <ChevronDown className="w-3 h-3 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => onDownload(qr.short_code, qr.title || '', qr.id, 'png')}>
                      Format PNG (Image)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDownload(qr.short_code, qr.title || '', qr.id, 'svg')}>
                      Format SVG (Vectoriel)
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Link href={`/dashboard/qr-codes/${qr.id}/stats`}>
                  <Button size="sm" variant="outline" className="h-8 rounded-lg text-xs border-gray-200">
                    <BarChart3 className="w-3.5 h-3.5 mr-1.5" />
                    Stats
                  </Button>
                </Link>

                {/* Supprimer uniquement pour les QR libres */}
                {!isNfc && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDelete(qr.id)}
                    className="h-8 rounded-lg text-xs border-red-200 text-red-500 hover:bg-red-50 hover:border-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                    Supprimer
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
