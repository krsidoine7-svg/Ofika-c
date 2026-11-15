'use client'

import { useState, useEffect, useCallback, useMemo, memo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
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
  X,
  Download,
  Zap,
  ChevronDown,
  Loader2,
  FileText,
  Globe,
  Phone,
  Mail,
  Sparkles,
  TrendingUp,
  MoreVertical,
  AlertTriangle,
  User
} from 'lucide-react'
import { toast } from 'sonner'
import {
  getUserQRRedirects,
  updateQRRedirect,
  deleteQRRedirect,
  createQRRedirect,
  getRedirectURL,
  getCachedUserQRCodes
} from '@/lib/services/qr-redirect-client'
import type { QRRedirect } from '@/lib/types/qr-redirect'
import Link from 'next/link'
import { QRCodeSVG } from 'qrcode.react'
import { downloadSVGAsFile } from '@/lib/utils/download-qr'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useProfiles } from '@/lib/hooks/useProfiles'
import { cn } from '@/lib/utils'

export default function QRCodesPage() {
  // Initialisation synchrone depuis le cache mémoire pour affichage instantané (0ms)
  const [qrCodes, setQRCodes] = useState<QRRedirect[]>(() => getCachedUserQRCodes() || [])
  const [loading, setLoading] = useState(() => !getCachedUserQRCodes())
  const [activeTab, setActiveTab] = useState<'dynamic' | 'static'>('dynamic')
  
  // Modale de création unifiée
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [createType, setCreateType] = useState<'dynamic' | 'static'>('dynamic')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Dialogue de suppression accessible (remplace window.confirm)
  const [qrToDelete, setQrToDelete] = useState<QRRedirect | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // État de copie rapide avec feedback
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Formulaire de création dynamique
  const [dynamicForm, setDynamicForm] = useState({
    title: '',
    target_url: '',
    description: ''
  })

  // Formulaire de création statique
  const [staticForm, setStaticForm] = useState({
    contentType: 'url' as 'url' | 'text' | 'phone' | 'email',
    title: '',
    target_url: '',
    description: ''
  })

  // Édition en ligne
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({
    nfc_link: '',
    target_url: '',
    title: '',
    description: ''
  })
  
  const { profiles } = useProfiles()

  const loadQRCodes = useCallback(async (force = false) => {
    if (qrCodes.length === 0) {
      setLoading(true)
    }
    const result = await getUserQRRedirects(force)
    if (result.success && result.data) {
      setQRCodes(result.data)
    } else {
      toast.error(result.error || 'Erreur lors du chargement des QR codes')
    }
    setLoading(false)
  }, [qrCodes.length])

  useEffect(() => {
    loadQRCodes()
  }, [loadQRCodes])

  // --- Création QR Code Dynamique ---
  const handleCreateDynamicQR = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!dynamicForm.target_url) {
      toast.error("Veuillez saisir une URL de destination")
      return
    }

    try {
      setIsSubmitting(true)
      let formattedUrl = dynamicForm.target_url.trim()
      if (!/^https?:\/\//i.test(formattedUrl)) {
        formattedUrl = `https://${formattedUrl}`
      }

      const res = await createQRRedirect({
        nfc_link: formattedUrl,
        redirect_type: 'custom',
        title: dynamicForm.title || 'QR Code Dynamique',
        description: dynamicForm.description
      })

      if (res.success) {
        toast.success("QR Code Dynamique créé avec succès !")
        setIsCreateModalOpen(false)
        setDynamicForm({ title: '', target_url: '', description: '' })
        setActiveTab('dynamic')
        loadQRCodes(true)
      } else {
        toast.error(res.error || "Impossible de créer le QR code dynamique")
      }
    } catch (err: any) {
      toast.error(err.message || "Erreur de création")
    } finally {
      setIsSubmitting(false)
    }
  }, [dynamicForm, loadQRCodes])

  // --- Création QR Code Statique ---
  const handleCreateStaticQR = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    const rawVal = staticForm.target_url.trim()
    if (!rawVal) {
      toast.error("Veuillez remplir l'information du QR code statique")
      return
    }

    let finalUrl = rawVal

    if (staticForm.contentType === 'text') {
      finalUrl = rawVal.startsWith('text:') ? rawVal : `text:${rawVal}`
    } else if (staticForm.contentType === 'phone') {
      const cleanPhone = rawVal.replace(/[^\d+]/g, '')
      if (cleanPhone.length < 4) {
        toast.error("Veuillez entrer un numéro de téléphone valide")
        return
      }
      finalUrl = cleanPhone.startsWith('tel:') ? cleanPhone : `tel:${cleanPhone}`
    } else if (staticForm.contentType === 'email') {
      const emailOnly = rawVal.replace(/^mailto:/, '')
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailOnly)) {
        toast.error("Veuillez entrer une adresse email valide")
        return
      }
      finalUrl = rawVal.startsWith('mailto:') ? rawVal : `mailto:${rawVal}`
    } else {
      if (rawVal.startsWith('text:') || rawVal.startsWith('tel:') || rawVal.startsWith('mailto:')) {
        finalUrl = rawVal
      } else {
        const hasSpaces = /\s/.test(rawVal)
        const hasDomainDot = rawVal.includes('.')
        const hasProtocol = /^https?:\/\//i.test(rawVal)

        if (hasSpaces || (!hasDomainDot && !hasProtocol && !rawVal.startsWith('/'))) {
          toast.error("Pour encoder du texte libre, choisissez l'onglet 'Texte brut'. Le type 'Lien Web' nécessite une URL valide.")
          return
        }

        if (!hasProtocol) {
          finalUrl = `https://${rawVal}`
        }
      }
    }

    try {
      setIsSubmitting(true)
      const res = await createQRRedirect({
        nfc_link: finalUrl,
        redirect_type: 'static',
        title: staticForm.title || (staticForm.contentType === 'text' ? 'QR Code Texte' : 'QR Code Statique'),
        description: staticForm.description
      })

      if (res.success) {
        toast.success("QR Code Statique créé avec succès !")
        setIsCreateModalOpen(false)
        setStaticForm({ contentType: 'url', title: '', target_url: '', description: '' })
        setActiveTab('static')
        loadQRCodes(true)
      } else {
        toast.error(res.error || "Impossible de créer le QR code statique")
      }
    } catch (err: any) {
      toast.error(err.message || "Erreur de création")
    } finally {
      setIsSubmitting(false)
    }
  }, [staticForm, loadQRCodes])

  // --- Édition et Mise à jour ---
  const handleEdit = useCallback((qr: QRRedirect) => {
    setEditingId(qr.id)
    const currentLink = qr.nfc_link || (qr as any).target_url || ''
    setEditForm({
      nfc_link: currentLink,
      target_url: currentLink,
      title: qr.title || '',
      description: qr.description || ''
    })
  }, [])

  const handleSave = useCallback(async (id: string, qr: QRRedirect) => {
    const isNfc = qr.redirect_type === 'nfc_card' || (qr as any).type === 'nfc_card'
    const updateData = isNfc
      ? { nfc_link: editForm.nfc_link, target_url: editForm.nfc_link, title: editForm.title }
      : { nfc_link: editForm.target_url, target_url: editForm.target_url, title: editForm.title, description: editForm.description }

    const result = await updateQRRedirect(id, updateData as any)
    if (result.success) {
      toast.success('QR code mis à jour !')
      setEditingId(null)
      loadQRCodes(true)
    } else {
      toast.error(result.error || 'Erreur lors de la mise à jour')
    }
  }, [editForm, loadQRCodes])

  const handleToggleActive = useCallback(async (qr: QRRedirect) => {
    const result = await updateQRRedirect(qr.id, { is_active: !qr.is_active })
    if (result.success) {
      toast.success(qr.is_active ? 'QR code mis hors-ligne' : 'QR code activé avec succès')
      loadQRCodes(true)
    } else {
      toast.error(result.error || 'Erreur')
    }
  }, [loadQRCodes])

  // --- Suppression Accessible via Dialogue ---
  const handleConfirmDelete = useCallback(async () => {
    if (!qrToDelete) return
    try {
      setIsDeleting(true)
      const result = await deleteQRRedirect(qrToDelete.id)
      if (result.success) {
        toast.success('QR code supprimé avec succès')
        setQrToDelete(null)
        loadQRCodes(true)
      } else {
        toast.error(result.error || 'Erreur lors de la suppression')
      }
    } catch (err: any) {
      toast.error(err.message || 'Erreur de suppression')
    } finally {
      setIsDeleting(false)
    }
  }, [qrToDelete, loadQRCodes])

  const copyToClipboard = useCallback((text: string, id: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    toast.success(`${label} copié dans le presse-papiers !`)
    setTimeout(() => {
      setCopiedId(prev => prev === id ? null : prev)
    }, 2000)
  }, [])

  const downloadQRCode = useCallback(async (shortCode: string, title: string, id: string, format: 'png' | 'svg') => {
    try {
      const svgId = `qr-${id}`
      await downloadSVGAsFile(svgId, `qr-${title || shortCode}`, format)
      toast.success(`QR code téléchargé en haute résolution (${format.toUpperCase()})`)
    } catch {
      toast.error('Erreur lors du téléchargement')
    }
  }, [])

  const getProfilePublicUrl = useCallback((profile: any) => {
    const base = typeof window !== 'undefined' ? window.location.origin : 'https://ofika.ci'
    return `${base}/p/${profile.custom_url || profile.username || profile.id}`
  }, [])

  // Filtrage mémoïsé des QR Codes pour Onglet 1 (Dynamiques) & Onglet 2 (Statiques)
  const dynamicQRCodes = useMemo(
    () => qrCodes.filter(qr => (qr.type || qr.redirect_type) !== 'static'),
    [qrCodes]
  )
  const staticQRCodes = useMemo(
    () => qrCodes.filter(qr => (qr.type || qr.redirect_type) === 'static'),
    [qrCodes]
  )

  // Loader léger si la liste est vide et en cours de chargement initial
  if (loading && qrCodes.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6">
        <Loader2 className="w-8 h-8 text-neutral-800 animate-spin mb-3" />
        <p className="text-neutral-500 font-medium text-xs">Chargement de vos QR codes...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50/40 py-6 sm:py-8">
      <div className="container mx-auto px-4 max-w-5xl">

        {/* --- HEADER ÉPURÉ HAUT DE GAMME --- */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-neutral-100 border border-neutral-200/80 text-neutral-800 text-[11px] font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-neutral-600" />
              <span>OFIKA CONNECT</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-950 tracking-tight flex items-center gap-2.5">
              <QrCode className="w-7 h-7 text-neutral-900" />
              Vos QR Codes
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 font-normal mt-1 max-w-xl">
              Gérez vos QR codes dynamiques modifiables à vie et statiques avec statistiques de scans en direct.
            </p>
          </div>

          {/* BOUTON D'ACTION PRINCIPAL NOIR MAT STATUTAIRE */}
          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                setCreateType('dynamic')
                setIsCreateModalOpen(true)
              }}
              className="bg-neutral-950 hover:bg-neutral-800 text-white font-semibold text-xs h-10 px-4 rounded-xl shadow-xs transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Nouveau QR Code</span>
            </Button>
          </div>
        </div>

        {/* --- 3 BENTO CARDS KPI STATUTAIRES --- */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-7">
          <div className="bg-white rounded-2xl border border-neutral-200/90 p-4 shadow-xs flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold uppercase text-neutral-500 tracking-wider">
                {activeTab === 'dynamic' ? 'QR Dynamiques' : 'QR Statiques'}
              </div>
              <div className="text-2xl font-bold text-neutral-950 mt-0.5 font-mono">
                {activeTab === 'dynamic' ? dynamicQRCodes.length : staticQRCodes.length}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-700">
              <QrCode className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-neutral-200/90 p-4 shadow-xs flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold uppercase text-neutral-500 tracking-wider">
                Actifs en ligne
              </div>
              <div className="text-2xl font-bold text-emerald-600 mt-0.5 font-mono">
                {(activeTab === 'dynamic' ? dynamicQRCodes : staticQRCodes).filter(qr => qr.is_active).length}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Check className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-neutral-200/90 p-4 shadow-xs flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold uppercase text-neutral-500 tracking-wider">
                Total des Scans
              </div>
              <div className="text-2xl font-bold text-neutral-950 mt-0.5 font-mono">
                {(activeTab === 'dynamic' ? dynamicQRCodes : staticQRCodes).reduce((sum, qr) => sum + (qr.scan_count || 0), 0)}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-neutral-100 text-neutral-700 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* --- NAVIGATION PAR ONGLETS SEGMENTÉS AVEC SURBRILLANCE ACTIVE NETTE --- */}
        <div className="w-full overflow-x-auto pb-1 no-scrollbar mb-6">
          <div className="inline-flex items-center p-1.5 bg-neutral-100 rounded-2xl border border-neutral-200/90 gap-1.5 shadow-xs">
            <button
              type="button"
              onClick={() => setActiveTab('dynamic')}
              className={cn(
                "h-10 px-4 text-xs font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap",
                activeTab === 'dynamic'
                  ? "bg-neutral-950 text-white shadow-md shadow-neutral-950/25 ring-1 ring-neutral-800 scale-[1.02]"
                  : "text-neutral-600 hover:text-neutral-950 hover:bg-neutral-200/60"
              )}
            >
              <Zap className={cn("w-3.5 h-3.5 transition-colors", activeTab === 'dynamic' ? "text-orange-400" : "text-neutral-400")} />
              <span>QR Codes Dynamiques</span>
              <span className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-mono font-bold transition-all",
                activeTab === 'dynamic'
                  ? "bg-orange-500/25 text-orange-300 border border-orange-500/40"
                  : "bg-neutral-200 text-neutral-600"
              )}>
                {dynamicQRCodes.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('static')}
              className={cn(
                "h-10 px-4 text-xs font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap",
                activeTab === 'static'
                  ? "bg-neutral-950 text-white shadow-md shadow-neutral-950/25 ring-1 ring-neutral-800 scale-[1.02]"
                  : "text-neutral-600 hover:text-neutral-950 hover:bg-neutral-200/60"
              )}
            >
              <QrCode className={cn("w-3.5 h-3.5 transition-colors", activeTab === 'static' ? "text-orange-400" : "text-neutral-400")} />
              <span>QR Codes Statiques</span>
              <span className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-mono font-bold transition-all",
                activeTab === 'static'
                  ? "bg-orange-500/25 text-orange-300 border border-orange-500/40"
                  : "bg-neutral-200 text-neutral-600"
              )}>
                {staticQRCodes.length}
              </span>
            </button>
          </div>
        </div>

        {/* --- CONTENU DU TAB 1 : DYNAMIQUES --- */}
        {activeTab === 'dynamic' && (
          <div className="space-y-4">
            {dynamicQRCodes.length === 0 ? (
              <div className="bg-white rounded-2xl border border-neutral-200/90 p-12 text-center shadow-xs">
                <div className="w-14 h-14 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-neutral-200">
                  <Zap className="w-7 h-7 text-neutral-700" />
                </div>
                <h3 className="text-base font-bold text-neutral-950 mb-1">Aucun QR code dynamique</h3>
                <p className="text-xs text-neutral-500 max-w-md mx-auto mb-6">
                  Les QR codes dynamiques permettent de modifier l'adresse de destination à tout moment sans réimprimer vos cartes ou flyers.
                </p>
                <Button
                  onClick={() => {
                    setCreateType('dynamic')
                    setIsCreateModalOpen(true)
                  }}
                  className="bg-neutral-950 hover:bg-neutral-800 text-white font-semibold text-xs h-9 px-4 rounded-xl shadow-xs"
                >
                  <Plus className="w-4 h-4 mr-1.5" /> Créer un QR Code Dynamique
                </Button>
              </div>
            ) : (
              <div className="space-y-3.5">
                {dynamicQRCodes.map((qr) => (
                  <QRCardItem
                    key={qr.id}
                    qr={qr}
                    theme="dynamic"
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
                    onRequestDelete={(targetQr: QRRedirect) => setQrToDelete(targetQr)}
                    onCopy={copyToClipboard}
                    copiedId={copiedId}
                    onDownload={downloadQRCode}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* --- CONTENU DU TAB 2 : STATIQUES --- */}
        {activeTab === 'static' && (
          <div className="space-y-4">
            {staticQRCodes.length === 0 ? (
              <div className="bg-white rounded-2xl border border-neutral-200/90 p-12 text-center shadow-xs">
                <div className="w-14 h-14 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-neutral-200">
                  <QrCode className="w-7 h-7 text-neutral-700" />
                </div>
                <h3 className="text-base font-bold text-neutral-950 mb-1">Aucun QR code statique</h3>
                <p className="text-xs text-neutral-500 max-w-md mx-auto mb-6">
                  Les QR codes statiques encodent directement l'information (lien web, téléphone, email ou texte brut) de façon permanente et autonome.
                </p>
                <Button
                  onClick={() => {
                    setCreateType('static')
                    setIsCreateModalOpen(true)
                  }}
                  className="bg-neutral-950 hover:bg-neutral-800 text-white font-semibold text-xs h-9 px-4 rounded-xl shadow-xs"
                >
                  <Plus className="w-4 h-4 mr-1.5" /> Créer un QR Code Statique
                </Button>
              </div>
            ) : (
              <div className="space-y-3.5">
                {staticQRCodes.map((qr) => (
                  <QRCardItem
                    key={qr.id}
                    qr={qr}
                    theme="static"
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
                    onRequestDelete={(targetQr: QRRedirect) => setQrToDelete(targetQr)}
                    onCopy={copyToClipboard}
                    copiedId={copiedId}
                    onDownload={downloadQRCode}
                  />
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* --- MODALE UNIFIÉE DE CRÉATION DE QR CODE --- */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-2xl border border-neutral-200/90 shadow-xl bg-white p-6">
          <DialogHeader>
            <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center mb-2 text-neutral-900">
              {createType === 'dynamic' ? <Zap className="w-5 h-5" /> : <QrCode className="w-5 h-5" />}
            </div>
            <DialogTitle className="text-xl font-bold text-neutral-950 tracking-tight">
              Créer un QR Code
            </DialogTitle>
            <DialogDescription className="text-xs text-neutral-500">
              Choisissez le mode qui convient à votre besoin pour générer votre QR code.
            </DialogDescription>
          </DialogHeader>

          {/* SÉLECTEUR DE TYPE (DYNAMIQUE VS STATIQUE) */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-100 rounded-xl my-2">
            <button
              type="button"
              onClick={() => setCreateType('dynamic')}
              className={cn(
                "py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all",
                createType === 'dynamic'
                  ? "bg-white text-neutral-950 shadow-xs"
                  : "text-neutral-500 hover:text-neutral-900"
              )}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Dynamique (Modifiable)</span>
            </button>
            <button
              type="button"
              onClick={() => setCreateType('static')}
              className={cn(
                "py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all",
                createType === 'static'
                  ? "bg-white text-neutral-950 shadow-xs"
                  : "text-neutral-500 hover:text-neutral-900"
              )}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Statique (Fixe)</span>
            </button>
          </div>

          {createType === 'dynamic' ? (
            /* FORMULAIRE DYNAMIQUE */
            <form onSubmit={handleCreateDynamicQR} className="space-y-3.5 my-2">
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/70 text-xs text-neutral-600 space-y-1">
                <span className="font-semibold text-neutral-900 block">⚡ Redirection intelligente :</span>
                Ce QR code crée un lien permanent <code className="font-mono text-neutral-900 font-bold">/qr/[code]</code> que vous pourrez rediriger vers n'importe quelle adresse sans réimprimer vos supports.
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px] font-semibold uppercase text-neutral-500 tracking-wider">
                  Titre du QR Code
                </Label>
                <Input
                  placeholder="Ex: Ma Page de Profil, Catalogue 2026..."
                  value={dynamicForm.title}
                  onChange={(e) => setDynamicForm({ ...dynamicForm, title: e.target.value })}
                  className="h-10 border-neutral-200 rounded-xl text-xs bg-white"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px] font-semibold uppercase text-neutral-500 tracking-wider">
                  URL de Destination
                </Label>
                <Input
                  placeholder="Ex: https://ofika.ci/mon-profil ou exemple.com"
                  value={dynamicForm.target_url}
                  onChange={(e) => setDynamicForm({ ...dynamicForm, target_url: e.target.value })}
                  className="h-10 border-neutral-200 rounded-xl font-mono text-xs bg-white"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px] font-semibold uppercase text-neutral-500 tracking-wider">
                  Description (Optionnel)
                </Label>
                <Textarea
                  placeholder="Note ou contexte d'utilisation..."
                  value={dynamicForm.description}
                  onChange={(e) => setDynamicForm({ ...dynamicForm, description: e.target.value })}
                  className="border-neutral-200 rounded-xl text-xs bg-white"
                  rows={2}
                />
              </div>

              <DialogFooter className="pt-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="rounded-xl border-neutral-200 text-xs font-medium"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-neutral-950 hover:bg-neutral-800 text-white font-semibold text-xs rounded-xl px-4"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Zap className="w-4 h-4 mr-1.5" />}
                  Créer le QR Code Dynamique
                </Button>
              </DialogFooter>
            </form>
          ) : (
            /* FORMULAIRE STATIQUE */
            <form onSubmit={handleCreateStaticQR} className="space-y-3.5 my-2">
              <div className="space-y-1.5">
                <Label className="text-[11px] font-semibold uppercase text-neutral-500 tracking-wider">
                  Type de Donnée Encodée
                </Label>
                <div className="grid grid-cols-4 gap-1 p-1 bg-neutral-100 rounded-xl border border-neutral-200/60">
                  <button
                    type="button"
                    onClick={() => setStaticForm({ ...staticForm, contentType: 'url' })}
                    className={cn(
                      "py-2 px-1 rounded-lg text-[11px] font-semibold flex flex-col items-center gap-1 transition-all",
                      staticForm.contentType === 'url'
                        ? "bg-white text-neutral-950 shadow-xs"
                        : "text-neutral-500 hover:text-neutral-900"
                    )}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Lien Web</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStaticForm({ ...staticForm, contentType: 'text' })}
                    className={cn(
                      "py-2 px-1 rounded-lg text-[11px] font-semibold flex flex-col items-center gap-1 transition-all",
                      staticForm.contentType === 'text'
                        ? "bg-white text-neutral-950 shadow-xs"
                        : "text-neutral-500 hover:text-neutral-900"
                    )}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Texte</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStaticForm({ ...staticForm, contentType: 'phone' })}
                    className={cn(
                      "py-2 px-1 rounded-lg text-[11px] font-semibold flex flex-col items-center gap-1 transition-all",
                      staticForm.contentType === 'phone'
                        ? "bg-white text-neutral-950 shadow-xs"
                        : "text-neutral-500 hover:text-neutral-900"
                    )}
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Appel</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStaticForm({ ...staticForm, contentType: 'email' })}
                    className={cn(
                      "py-2 px-1 rounded-lg text-[11px] font-semibold flex flex-col items-center gap-1 transition-all",
                      staticForm.contentType === 'email'
                        ? "bg-white text-neutral-950 shadow-xs"
                        : "text-neutral-500 hover:text-neutral-900"
                    )}
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email</span>
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px] font-semibold uppercase text-neutral-500 tracking-wider">
                  Titre du QR Code
                </Label>
                <Input
                  placeholder="Ex: Mon Site, Note Directe, Numéro d'urgence..."
                  value={staticForm.title}
                  onChange={(e) => setStaticForm({ ...staticForm, title: e.target.value })}
                  className="h-10 border-neutral-200 rounded-xl text-xs bg-white"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px] font-semibold uppercase text-neutral-500 tracking-wider">
                  {staticForm.contentType === 'url' && "Adresse Web"}
                  {staticForm.contentType === 'text' && "Texte Brut à Encoder"}
                  {staticForm.contentType === 'phone' && "Numéro de Téléphone"}
                  {staticForm.contentType === 'email' && "Adresse Email"}
                </Label>

                {staticForm.contentType === 'text' ? (
                  <Textarea
                    placeholder="Saisissez le texte à encoder directement..."
                    value={staticForm.target_url}
                    onChange={(e) => setStaticForm({ ...staticForm, target_url: e.target.value })}
                    className="h-20 border-neutral-200 rounded-xl text-xs bg-white"
                    required
                  />
                ) : (
                  <Input
                    placeholder={
                      staticForm.contentType === 'url' ? "Ex: https://mon-site.com ou exemple.ci" :
                      staticForm.contentType === 'phone' ? "Ex: +225 07 00 00 00 00" :
                      "Ex: contact@entreprise.ci"
                    }
                    value={staticForm.target_url}
                    onChange={(e) => setStaticForm({ ...staticForm, target_url: e.target.value })}
                    className="h-10 border-neutral-200 rounded-xl font-mono text-xs bg-white"
                    required
                  />
                )}
              </div>

              <DialogFooter className="pt-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="rounded-xl border-neutral-200 text-xs font-medium"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-neutral-950 hover:bg-neutral-800 text-white font-semibold text-xs rounded-xl px-4"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <QrCode className="w-4 h-4 mr-1.5" />}
                  Créer le QR Code Statique
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* --- MODALE DE CONFIRMATION DE SUPPRESSION ACCESSIBLE --- */}
      <Dialog open={!!qrToDelete} onOpenChange={(open) => !open && setQrToDelete(null)}>
        <DialogContent className="sm:max-w-[420px] rounded-2xl border border-neutral-200/90 shadow-xl bg-white p-6">
          <DialogHeader>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-2">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <DialogTitle className="text-lg font-bold text-neutral-950 tracking-tight">
              Supprimer ce QR Code ?
            </DialogTitle>
            <DialogDescription className="text-xs text-neutral-500 mt-1">
              Êtes-vous sûr de vouloir supprimer définitivement « <strong className="text-neutral-900">{qrToDelete?.title || 'ce QR code'}</strong> » ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>

          {qrToDelete?.short_code && (
            <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/80 text-xs text-neutral-600 font-mono">
              Lien : {getRedirectURL(qrToDelete.short_code)}
            </div>
          )}

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={isDeleting}
              onClick={() => setQrToDelete(null)}
              className="rounded-xl border-neutral-200 text-xs font-medium"
            >
              Annuler
            </Button>
            <Button
              type="button"
              disabled={isDeleting}
              onClick={handleConfirmDelete}
              className="bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl px-4"
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Trash2 className="w-4 h-4 mr-1.5" />}
              Supprimer définitivement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}

// Helper robuste pour vérifier si une URL cible correspond à un profil Ofika donné
function isProfileMatching(profile: any, link: string | undefined): boolean {
  if (!profile || !link) return false
  const cleanLink = link.trim().toLowerCase().replace(/\/+$/, '')
  const slug = (profile.custom_url || profile.username || profile.id || '').trim().toLowerCase()
  if (!slug) return false

  if (cleanLink === slug) return true
  if (cleanLink.endsWith(`/${slug}`)) return true
  if (cleanLink.endsWith(`/p/${slug}`)) return true

  try {
    const url = cleanLink.startsWith('http')
      ? new URL(cleanLink)
      : new URL(`https://dummy.com/${cleanLink.replace(/^\/+/, '')}`)
    const parts = url.pathname.split('/').filter(Boolean)
    if (parts.includes(slug)) return true
    if (parts[parts.length - 1] === slug) return true
  } catch {}

  return cleanLink.includes(slug)
}

// ─── COMPOSANT ITEM CARTE QR HAUTE PRÉCISION (ÉVITE LES RECALCULS SVG INUTILES) ───────────────
const QRCardItem = memo(function QRCardItem({
  qr, theme, editingId, editForm, setEditForm, profiles, getProfilePublicUrl,
  getRedirectURL, onEdit, onSave, onCancelEdit, onToggleActive, onRequestDelete, onCopy, copiedId, onDownload
}: any) {
  const isEditing = editingId === qr.id
  const targetUrl = qr.nfc_link || qr.target_url || ''
  const shortUrl = qr.short_code ? getRedirectURL(qr.short_code) : targetUrl

  const isNfcCard = qr.redirect_type === 'nfc_card' || (qr as any).type === 'nfc_card'
  const isStatic = theme === 'static' || qr.redirect_type === 'static'
  const isCopied = copiedId === qr.id

  // Détection du profil actuellement actif dans la base de données
  const currentlyActiveProfile = useMemo(() => {
    return profiles.find((p: any) => isProfileMatching(p, targetUrl))
  }, [profiles, targetUrl])

  // Détection du mode d'édition (par défaut 'profile' si carte NFC ou si relié à un profil)
  const [editModeType, setEditModeType] = useState<'profile' | 'custom'>(() => {
    if (isNfcCard) return 'profile'
    return currentlyActiveProfile ? 'profile' : 'custom'
  })

  // Synchroniser le mode si le QR code change
  useEffect(() => {
    if (isNfcCard) {
      setEditModeType('profile')
    } else if (currentlyActiveProfile) {
      setEditModeType('profile')
    }
  }, [isNfcCard, currentlyActiveProfile])

  const currentSelectedLink = editForm.nfc_link || editForm.target_url || ''

  return (
    <div className={cn(
      "bg-white rounded-2xl border transition-all duration-200 overflow-hidden shadow-xs",
      !qr.is_active ? "opacity-60 border-neutral-200" : "border-neutral-200/90 hover:border-neutral-300"
    )}>
      <div className="p-4 sm:p-5">
        {isEditing ? (
          // ── Mode Édition Haute Visibilité ──
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <div>
                <h3 className="font-bold text-neutral-950 text-sm">
                  {isNfcCard ? 'Modifier le profil relié à la carte NFC' : 'Modifier la redirection du QR code'}
                </h3>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  Choisissez la destination vers laquelle les visiteurs seront automatiquement redirigés.
                </p>
              </div>
              <button onClick={onCancelEdit} className="text-neutral-400 hover:text-neutral-600 transition-colors p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* BANNIÈRE DE DESTINATION ACTUELLE EN DIRECT (HAUTE VISIBILITÉ) */}
            <div className="p-3.5 rounded-xl bg-neutral-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0 ring-4 ring-emerald-400/20" />
                <div className="min-w-0">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                    <span>Lien actif en ce moment</span>
                    <span className="text-emerald-400 font-bold">• EN DIRECT</span>
                  </div>
                  <div className="text-xs font-bold text-white truncate mt-0.5">
                    {currentlyActiveProfile ? (
                      <span className="flex items-center gap-2">
                        <span className="text-emerald-300">Profil de {currentlyActiveProfile.name}</span>
                        <span className="text-[11px] font-mono font-normal text-neutral-400">({targetUrl})</span>
                      </span>
                    ) : (
                      <span className="font-mono text-neutral-200 truncate">{targetUrl || 'Aucune destination'}</span>
                    )}
                  </div>
                </div>
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 w-fit">
                Destination active
              </Badge>
            </div>

            {/* SÉLECTEUR DE TYPE DE REDIRECTION (PROFIL OFIKA VS URL EXTERNE) */}
            {!isNfcCard && (
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-neutral-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setEditModeType('profile')}
                  className={cn(
                    "py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer",
                    editModeType === 'profile'
                      ? "bg-white text-neutral-950 shadow-xs ring-1 ring-black/5"
                      : "text-neutral-600 hover:text-neutral-950"
                  )}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Mes Profils Ofika</span>
                  {profiles.length > 0 && (
                    <span className={cn(
                      "text-[10px] font-mono px-1.5 py-0.2 rounded-full",
                      editModeType === 'profile' ? "bg-neutral-900 text-white" : "bg-neutral-200 text-neutral-700"
                    )}>
                      {profiles.length}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setEditModeType('custom')}
                  className={cn(
                    "py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer",
                    editModeType === 'custom'
                      ? "bg-white text-neutral-950 shadow-xs ring-1 ring-black/5"
                      : "text-neutral-600 hover:text-neutral-950"
                  )}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>URL Externe Personnalisée</span>
                </button>
              </div>
            )}

            {/* CORPS DE L'ÉDITION SELON LE MODE */}
            {editModeType === 'profile' ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 block">
                    Sélectionnez le profil à activer :
                  </Label>
                  <span className="text-[11px] text-neutral-500 font-medium">
                    Cliquez sur un profil pour l'activer
                  </span>
                </div>

                {profiles.length === 0 ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-800 font-medium">
                    Vous n'avez encore aucun profil public. <a href="/dashboard/profiles" className="font-bold underline">Créer un profil</a>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {profiles.map((profile: any) => {
                      const base = typeof window !== 'undefined' ? window.location.origin : 'https://ofika.ci'
                      const slug = profile.custom_url || profile.username || profile.id
                      const profilePublicUrl = `${base}/${slug}`
                      
                      const isThisActiveInDb = isProfileMatching(profile, targetUrl)
                      const isThisSelected = isProfileMatching(profile, currentSelectedLink)

                      return (
                        <div
                          key={profile.id}
                          onClick={() => {
                            setEditForm({
                              ...editForm,
                              nfc_link: profilePublicUrl,
                              target_url: profilePublicUrl
                            })
                          }}
                          className={cn(
                            "w-full flex items-center justify-between gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none",
                            isThisSelected
                              ? "border-neutral-950 bg-neutral-50/90 shadow-sm ring-2 ring-neutral-950/20"
                              : "border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50/60"
                          )}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {/* Pastille de sélection visuelle (Radio personnalisé) */}
                            <div className={cn(
                              "w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all",
                              isThisSelected
                                ? "bg-neutral-950 text-white"
                                : "border-2 border-neutral-300 bg-white"
                            )}>
                              {isThisSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>

                            {/* Avatar ou Initiales */}
                            {profile.image_url ? (
                              <img src={profile.image_url} alt={profile.name} className="w-9 h-9 rounded-full object-cover shrink-0 border border-neutral-200" />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-neutral-200 flex items-center justify-center shrink-0 text-neutral-800 font-bold text-xs">
                                {profile.name?.substring(0, 2).toUpperCase()}
                              </div>
                            )}

                            {/* Infos du profil */}
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-bold text-neutral-950 text-xs truncate">{profile.name}</p>
                              </div>
                              <p className="text-[11px] text-neutral-500 truncate font-medium">
                                {profile.job_title || profile.company || 'Profil en ligne'} • <span className="font-mono text-[10px] text-neutral-400">/{slug}</span>
                              </p>
                            </div>
                          </div>

                          {/* BADGES VISUELS CLAIRS SUR L'ÉTAT D'ACTIVATION */}
                          <div className="shrink-0 flex items-center gap-1.5">
                            {isThisActiveInDb && isThisSelected && (
                              <Badge className="bg-emerald-600 text-white font-bold text-[10px] py-1 px-2.5 rounded-full flex items-center gap-1 shadow-xs">
                                <Check className="w-3 h-3 stroke-[3]" />
                                Actif en direct
                              </Badge>
                            )}

                            {!isThisActiveInDb && isThisSelected && (
                              <Badge className="bg-neutral-950 text-white font-bold text-[10px] py-1 px-2.5 rounded-full flex items-center gap-1 shadow-xs">
                                <Sparkles className="w-3 h-3 text-orange-400" />
                                Sélectionné
                              </Badge>
                            )}

                            {isThisActiveInDb && !isThisSelected && (
                              <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold text-[10px] py-0.5 px-2">
                                Actuel (cliquez pour conserver)
                              </Badge>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5 block">
                  URL de Destination Externe
                </Label>
                <Input
                  value={editForm.target_url}
                  onChange={(e) => setEditForm({ ...editForm, target_url: e.target.value, nfc_link: e.target.value })}
                  placeholder="https://mon-entreprise.com ou lien externe"
                  className="h-10 rounded-xl border-neutral-200 font-mono text-xs bg-white"
                />
                <p className="text-[11px] text-neutral-500">
                  Exemple : votre site vitrine, votre boutique en ligne, ou votre numéro WhatsApp.
                </p>
              </div>
            )}

            {/* CHAMP DU TITRE */}
            <div className="space-y-1.5 pt-1">
              <Label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 block">
                Titre du QR Code
              </Label>
              <Input
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                placeholder="Titre explicatif..."
                className="h-10 rounded-xl border-neutral-200 text-xs font-semibold bg-white"
              />
            </div>

            {/* BOUTONS D'ENREGISTREMENT ET ANNULATION */}
            <div className="flex items-center gap-2 pt-2 border-t border-neutral-100">
              <Button
                onClick={() => onSave(qr.id, qr)}
                className="bg-neutral-950 hover:bg-neutral-800 text-white rounded-xl h-9 text-xs font-semibold px-5 shadow-xs"
              >
                <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                Enregistrer la nouvelle redirection
              </Button>
              <Button onClick={onCancelEdit} variant="outline" className="rounded-xl h-9 text-xs font-medium border-neutral-200">
                Annuler
              </Button>
            </div>
          </div>
        ) : (
          // ── Mode Affichage ──
          <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-5">

            {/* Aperçu QR Code dans conteneur haute qualité */}
            <div className="shrink-0 mx-auto sm:mx-0">
              <div className="bg-white p-2.5 rounded-xl border border-neutral-200 shadow-xs flex items-center justify-center">
                <QRCodeSVG
                  id={`qr-${qr.id}`}
                  value={isStatic ? targetUrl : shortUrl}
                  size={96}
                  level="H"
                  includeMargin={false}
                />
              </div>
            </div>

            {/* Informations & Badges */}
            <div className="flex-1 min-w-0 w-full space-y-2">
              
              {/* Titre & Badges */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2 min-w-0">
                  <h3 className="text-sm sm:text-base font-semibold text-neutral-950 tracking-tight truncate">
                    {qr.title || (isNfcCard ? 'Carte NFC' : (isStatic ? 'QR Code Statique' : 'QR Code Dynamique'))}
                  </h3>

                  {/* Badge Type */}
                  {isNfcCard && (
                    <Badge variant="outline" className="bg-blue-50/80 text-blue-700 border-blue-200 text-[10px] font-semibold py-0.5 px-2 rounded-full flex items-center gap-1">
                      <CreditCard className="w-3 h-3" />
                      Carte NFC
                    </Badge>
                  )}

                  {!isNfcCard && !isStatic && (
                    <Badge variant="outline" className="bg-neutral-100 text-neutral-800 border-neutral-200 text-[10px] font-semibold py-0.5 px-2 rounded-full flex items-center gap-1">
                      <Zap className="w-3 h-3 text-orange-500" />
                      Dynamique
                    </Badge>
                  )}

                  {isStatic && (
                    <Badge variant="outline" className="bg-neutral-100 text-neutral-800 border-neutral-200 text-[10px] font-semibold py-0.5 px-2 rounded-full flex items-center gap-1">
                      <QrCode className="w-3 h-3 text-neutral-600" />
                      Statique
                    </Badge>
                  )}

                  {/* Pastille Actif / Inactif */}
                  <span className={cn(
                    "inline-flex items-center gap-1.5 text-[10px] py-0.5 px-2 rounded-full font-semibold border",
                    qr.is_active
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200/80"
                      : "bg-neutral-100 text-neutral-500 border-neutral-200"
                  )}>
                    <span className={cn("w-1.5 h-1.5 rounded-full", qr.is_active ? "bg-emerald-500" : "bg-neutral-400")} />
                    {qr.is_active ? 'Actif' : 'Inactif'}
                  </span>
                </div>

                {/* Scans Count */}
                <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded-lg shrink-0">
                  <BarChart3 className="w-3.5 h-3.5 text-neutral-500" />
                  <span className="font-mono">{qr.scan_count || 0} scans</span>
                </div>
              </div>

              {/* URL Short / Destination */}
              <div className="space-y-1 bg-neutral-50 p-2.5 rounded-xl border border-neutral-100">
                {!isStatic && qr.short_code && (
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[10px] font-semibold uppercase text-neutral-400 shrink-0">Lien Court :</span>
                      <code className="text-xs font-mono font-medium text-neutral-900 truncate select-all">
                        {shortUrl}
                      </code>
                    </div>
                    <button
                      onClick={() => onCopy(shortUrl, qr.id, 'Lien court')}
                      className="text-neutral-400 hover:text-neutral-950 transition-colors p-1 shrink-0"
                      title="Copier le lien court"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[10px] font-semibold uppercase text-neutral-400 shrink-0">Cible :</span>
                    <code className="text-xs text-neutral-600 font-mono truncate">
                      {targetUrl || 'Non définie'}
                    </code>
                  </div>
                  <a
                    href={targetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-neutral-400 hover:text-neutral-950 transition-colors p-1 shrink-0"
                    title="Tester le lien"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Note informative pour les cartes NFC */}
              {isNfcCard && (
                <p className="text-[10px] text-blue-700 bg-blue-50/70 p-2 rounded-lg border border-blue-100/70 leading-normal">
                  Ce QR code est relié à votre carte physique NFC. Vous pouvez modifier le profil de destination en cliquant sur « Modifier ».
                </p>
              )}

              {/* Barre d'Actions Ergonomique et Compacte */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-100">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEdit(qr)}
                    className="h-8 rounded-xl text-xs font-semibold border-neutral-200 text-neutral-700 hover:text-neutral-950 hover:bg-neutral-50"
                  >
                    <Edit2 className="w-3.5 h-3.5 mr-1.5 text-neutral-500" />
                    Modifier
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onCopy(isStatic ? targetUrl : shortUrl, qr.id, 'Lien')}
                    className="h-8 rounded-xl text-xs font-semibold border-neutral-200 text-neutral-700 hover:text-neutral-950 hover:bg-neutral-50"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 mr-1.5 text-neutral-500" />}
                    {isCopied ? 'Copié' : 'Copier'}
                  </Button>

                  {/* Dropdown Téléchargement Haute Résolution */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="outline" className="h-8 rounded-xl text-xs font-semibold border-neutral-200 text-neutral-700 hover:text-neutral-950 hover:bg-neutral-50">
                        <Download className="w-3.5 h-3.5 mr-1.5 text-neutral-500" />
                        Télécharger
                        <ChevronDown className="w-3 h-3 ml-1 text-neutral-400" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="rounded-xl shadow-lg border-neutral-200">
                      <DropdownMenuItem onClick={() => onDownload(qr.short_code, qr.title || '', qr.id, 'png')} className="text-xs font-semibold cursor-pointer">
                        Format PNG (Impression HD)
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDownload(qr.short_code, qr.title || '', qr.id, 'svg')} className="text-xs font-semibold cursor-pointer">
                        Format SVG (Vectoriel infini)
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Actions Secondaires via Menu Contextuel */}
                <div className="flex items-center gap-1">
                  {!isStatic && (
                    <Link href={`/dashboard/qr-codes/${qr.id}/stats`}>
                      <Button size="sm" variant="ghost" className="h-8 rounded-xl text-xs font-semibold text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100">
                        <BarChart3 className="w-3.5 h-3.5 mr-1.5 text-neutral-500" />
                        Stats
                      </Button>
                    </Link>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-xl text-neutral-500 hover:text-neutral-950 hover:bg-neutral-100">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl shadow-lg border-neutral-200 min-w-[160px]">
                      <DropdownMenuItem asChild className="text-xs font-medium cursor-pointer">
                        <a href={targetUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2">
                          <ExternalLink className="w-3.5 h-3.5 text-neutral-500" />
                          <span>Ouvrir la cible</span>
                        </a>
                      </DropdownMenuItem>

                      {!isNfcCard && (
                        <DropdownMenuItem
                          onClick={() => onToggleActive(qr)}
                          className="text-xs font-medium cursor-pointer flex items-center gap-2"
                        >
                          {qr.is_active ? (
                            <>
                              <EyeOff className="w-3.5 h-3.5 text-neutral-500" />
                              <span>Mettre hors-ligne</span>
                            </>
                          ) : (
                            <>
                              <Eye className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-700">Activer le QR code</span>
                            </>
                          )}
                        </DropdownMenuItem>
                      )}

                      {!isNfcCard && (
                        <>
                          <DropdownMenuSeparator className="bg-neutral-100" />
                          <DropdownMenuItem
                            onClick={() => onRequestDelete(qr)}
                            className="text-xs font-medium text-rose-600 hover:bg-rose-50 hover:text-rose-700 cursor-pointer flex items-center gap-2"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Supprimer</span>
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  )
})
