'use client'

import { useState, useEffect } from 'react'
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
  Link2,
  X,
  Download,
  Zap,
  ChevronDown,
  Loader2,
  FileText,
  Globe,
  Phone,
  Mail
} from 'lucide-react'
import { toast } from 'sonner'
import {
  getUserQRRedirects,
  updateQRRedirect,
  deleteQRRedirect,
  createQRRedirect,
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
import { cn } from '@/lib/utils'

export default function QRCodesPage() {
  const [qrCodes, setQRCodes] = useState<QRRedirect[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'dynamic' | 'static'>('dynamic')
  
  // Modales de création
  const [isDynamicModalOpen, setIsDynamicModalOpen] = useState(false)
  const [isStaticModalOpen, setIsStaticModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  useEffect(() => {
    loadQRCodes()
  }, [])

  const loadQRCodes = async () => {
    setLoading(true)
    const result = await getUserQRRedirects()
    if (result.success && result.data) {
      setQRCodes(result.data)
    } else {
      toast.error(result.error || 'Erreur lors du chargement des QR codes')
    }
    setLoading(false)
  }

  // --- Création QR Code Dynamique (Orange) ---
  const handleCreateDynamicQR = async (e: React.FormEvent) => {
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
        toast.success("⚡ QR Code Dynamique créé avec succès !")
        setIsDynamicModalOpen(false)
        setDynamicForm({ title: '', target_url: '', description: '' })
        loadQRCodes()
      } else {
        toast.error(res.error || "Impossible de créer le QR code dynamique")
      }
    } catch (err: any) {
      toast.error(err.message || "Erreur de création")
    } finally {
      setIsSubmitting(false)
    }
  }

  // --- Création QR Code Statique (Violet) ---
  const handleCreateStaticQR = async (e: React.FormEvent) => {
    e.preventDefault()
    const rawVal = staticForm.target_url.trim()
    if (!rawVal) {
      toast.error("Veuillez remplir l'information du QR code statique")
      return
    }

    let finalUrl = rawVal

    if (staticForm.contentType === 'text') {
      // Texte brut : encoder sous forme text:
      finalUrl = rawVal.startsWith('text:') ? rawVal : `text:${rawVal}`
    } else if (staticForm.contentType === 'phone') {
      // Téléphone : valider et formater tel:
      const cleanPhone = rawVal.replace(/[^\d+]/g, '')
      if (cleanPhone.length < 4) {
        toast.error("Veuillez entrer un numéro de téléphone valide")
        return
      }
      finalUrl = cleanPhone.startsWith('tel:') ? cleanPhone : `tel:${cleanPhone}`
    } else if (staticForm.contentType === 'email') {
      // Email : valider et formater mailto:
      const emailOnly = rawVal.replace(/^mailto:/, '')
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailOnly)) {
        toast.error("Veuillez entrer une adresse email valide")
        return
      }
      finalUrl = rawVal.startsWith('mailto:') ? rawVal : `mailto:${rawVal}`
    } else {
      // Lien Web (URL) : Valider strict
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
        toast.success("🟣 QR Code Statique créé avec succès !")
        setIsStaticModalOpen(false)
        setStaticForm({ contentType: 'url', title: '', target_url: '', description: '' })
        setActiveTab('static')
        loadQRCodes()
      } else {
        toast.error(res.error || "Impossible de créer le QR code statique")
      }
    } catch (err: any) {
      toast.error(err.message || "Erreur de création")
    } finally {
      setIsSubmitting(false)
    }
  }

  // --- Édition et Mise à jour ---
  const handleEdit = (qr: QRRedirect) => {
    setEditingId(qr.id)
    const currentLink = qr.nfc_link || (qr as any).target_url || ''
    setEditForm({
      nfc_link: currentLink,
      target_url: currentLink,
      title: qr.title || '',
      description: qr.description || ''
    })
  }

  const handleSave = async (id: string, qr: QRRedirect) => {
    const isNfc = qr.redirect_type === 'nfc_card' || (qr as any).type === 'nfc_card'
    const updateData = isNfc
      ? { nfc_link: editForm.nfc_link, target_url: editForm.nfc_link, title: editForm.title }
      : { nfc_link: editForm.target_url, target_url: editForm.target_url, title: editForm.title, description: editForm.description }

    const result = await updateQRRedirect(id, updateData as any)
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

  const getProfilePublicUrl = (profile: any) => {
    const base = typeof window !== 'undefined' ? window.location.origin : 'https://ofika.ci'
    return `${base}/p/${profile.custom_url || profile.username || profile.id}`
  }

  // Filtrage des QR Codes pour Onglet 1 (Dynamiques) & Onglet 2 (Statiques)
  const dynamicQRCodes = qrCodes.filter(qr => (qr.type || qr.redirect_type) !== 'static')
  const staticQRCodes = qrCodes.filter(qr => (qr.type || qr.redirect_type) === 'static')

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="w-10 h-10 text-orange-500 animate-spin mb-4" />
          <p className="text-slate-500 font-bold text-sm">Chargement de vos QR codes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50/50 py-8">
      <div className="container mx-auto px-4 max-w-5xl">

        {/* --- HEADER AVEC BOUTONS DISTINCTS (Orange & Violet) --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <QrCode className="w-7 h-7 text-orange-500" />
              Gestionnaire de QR Codes
            </h1>
            <p className="text-xs md:text-sm text-slate-500 font-medium mt-1">
              Gérez et modifiez vos QR codes dynamiques (orange) et statiques (violet).
            </p>
          </div>

          {/* 2 BOUTONS DISTINCTS (Orange & Violet) */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              onClick={() => setIsDynamicModalOpen(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs h-11 px-4 rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-2"
            >
              <Zap className="w-4 h-4 fill-white" />
              Créer QR Code Dynamique
            </Button>
            <Button
              onClick={() => setIsStaticModalOpen(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs h-11 px-4 rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-2"
            >
              <QrCode className="w-4 h-4" />
              Créer QR Code Statique
            </Button>
          </div>
        </div>

        {/* --- SYSTEME D'ONGLETS (DYNAMIC VS STATIC) --- */}
        <div className="flex items-center gap-2 border-b border-slate-200 mb-6 pb-2 overflow-x-auto custom-scrollbar">
          <button
            onClick={() => setActiveTab('dynamic')}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all shrink-0",
              activeTab === 'dynamic'
                ? "bg-orange-500 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            )}
          >
            <Zap className="w-4 h-4" />
            QR Codes Dynamiques
            <Badge className={cn(
              "ml-1 font-mono text-[10px] px-1.5 py-0 border-none",
              activeTab === 'dynamic' ? "bg-white/20 text-white" : "bg-orange-100 text-orange-800"
            )}>
              {dynamicQRCodes.length}
            </Badge>
          </button>

          <button
            onClick={() => setActiveTab('static')}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all shrink-0",
              activeTab === 'static'
                ? "bg-purple-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            )}
          >
            <QrCode className="w-4 h-4" />
            QR Codes Statiques
            <Badge className={cn(
              "ml-1 font-mono text-[10px] px-1.5 py-0 border-none",
              activeTab === 'static' ? "bg-white/20 text-white" : "bg-purple-100 text-purple-800"
            )}>
              {staticQRCodes.length}
            </Badge>
          </button>
        </div>

        {/* --- STATS RÉSUMÉES DU TAB ACTIF --- */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-white rounded-2xl border border-slate-200/70 p-4 text-center shadow-sm">
            <div className="text-2xl font-black text-slate-900">
              {activeTab === 'dynamic' ? dynamicQRCodes.length : staticQRCodes.length}
            </div>
            <div className="text-[11px] font-bold uppercase text-slate-400 mt-0.5 tracking-wider">
              {activeTab === 'dynamic' ? 'Dynamiques Total' : 'Statiques Total'}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200/70 p-4 text-center shadow-sm">
            <div className="text-2xl font-black text-emerald-600">
              {(activeTab === 'dynamic' ? dynamicQRCodes : staticQRCodes).filter(qr => qr.is_active).length}
            </div>
            <div className="text-[11px] font-bold uppercase text-slate-400 mt-0.5 tracking-wider">Actifs</div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200/70 p-4 text-center shadow-sm">
            <div className="text-2xl font-black text-orange-500">
              {(activeTab === 'dynamic' ? dynamicQRCodes : staticQRCodes).reduce((sum, qr) => sum + (qr.scan_count || 0), 0)}
            </div>
            <div className="text-[11px] font-bold uppercase text-slate-400 mt-0.5 tracking-wider">Total Scans</div>
          </div>
        </div>

        {/* --- CONTENU DU TAB 1 : DYNAMIQUES (ORANGE) --- */}
        {activeTab === 'dynamic' && (
          <div className="space-y-4">
            {dynamicQRCodes.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center shadow-sm">
                <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-orange-100">
                  <Zap className="w-8 h-8 text-orange-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Aucun QR code dynamique</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
                  Les QR codes dynamiques permettent de modifier l'URL de destination à tout moment sans réimprimer le QR code.
                </p>
                <Button
                  onClick={() => setIsDynamicModalOpen(true)}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs h-10 px-4 rounded-xl"
                >
                  <Plus className="w-4 h-4 mr-1.5" /> Créer un QR Code Dynamique
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
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
                    onDelete={handleDelete}
                    onCopy={copyToClipboard}
                    onDownload={downloadQRCode}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* --- CONTENU DU TAB 2 : STATIQUES (VIOLET) --- */}
        {activeTab === 'static' && (
          <div className="space-y-4">
            {staticQRCodes.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center shadow-sm">
                <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-purple-100">
                  <QrCode className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Aucun QR code statique</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
                  Les QR codes statiques encodent directement l'information (lien web, téléphone, Wi-Fi, vCard) de façon fixe.
                </p>
                <Button
                  onClick={() => setIsStaticModalOpen(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs h-10 px-4 rounded-xl"
                >
                  <Plus className="w-4 h-4 mr-1.5" /> Créer un QR Code Statique
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
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
                    onDelete={handleDelete}
                    onCopy={copyToClipboard}
                    onDownload={downloadQRCode}
                  />
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* --- MODALE 1 : CRÉER UN QR CODE DYNAMIQUE (ORANGE) --- */}
      <Dialog open={isDynamicModalOpen} onOpenChange={setIsDynamicModalOpen}>
        <DialogContent className="sm:max-w-[480px] rounded-3xl border-none shadow-2xl bg-white p-6">
          <DialogHeader>
            <div className="w-10 h-10 rounded-2xl bg-orange-100 flex items-center justify-center mb-2">
              <Zap className="w-5 h-5 text-orange-600" />
            </div>
            <DialogTitle className="text-xl font-black text-slate-900">
              Créer un QR Code Dynamique
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 font-medium">
              Ce QR code crée un lien permanent <code className="font-mono text-orange-600 font-bold">/qr/[code]</code> que vous pourrez modifier à tout moment.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateDynamicQR} className="space-y-4 my-2">
            <div className="space-y-1.5">
              <Label className="text-[11px] font-black uppercase text-slate-500 tracking-wider">
                Titre du QR Code
              </Label>
              <Input
                placeholder="Ex: Ma Page de Profil, Brochure 2026..."
                value={dynamicForm.title}
                onChange={(e) => setDynamicForm({ ...dynamicForm, title: e.target.value })}
                className="h-11 border-slate-200 rounded-xl font-bold text-xs bg-slate-50/50 focus:bg-white"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[11px] font-black uppercase text-slate-500 tracking-wider">
                URL de Destination
              </Label>
              <Input
                placeholder="Ex: https://ofika.ci/p/jean-dupont"
                value={dynamicForm.target_url}
                onChange={(e) => setDynamicForm({ ...dynamicForm, target_url: e.target.value })}
                className="h-11 border-slate-200 rounded-xl font-mono text-xs bg-slate-50/50 focus:bg-white"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[11px] font-black uppercase text-slate-500 tracking-wider">
                Description (Optionnel)
              </Label>
              <Textarea
                placeholder="Petite note explicative..."
                value={dynamicForm.description}
                onChange={(e) => setDynamicForm({ ...dynamicForm, description: e.target.value })}
                className="border-slate-200 rounded-xl text-xs bg-slate-50/50 focus:bg-white"
                rows={2}
              />
            </div>

            <DialogFooter className="pt-2 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDynamicModalOpen(false)}
                className="rounded-xl border-slate-200 text-xs font-bold"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl px-5"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Zap className="w-4 h-4 mr-1.5" />}
                Créer le QR Code Dynamique
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* --- MODALE 2 : CRÉER UN QR CODE STATIQUE (VIOLET) --- */}
      <Dialog open={isStaticModalOpen} onOpenChange={setIsStaticModalOpen}>
        <DialogContent className="sm:max-w-[480px] rounded-3xl border-none shadow-2xl bg-white p-6">
          <DialogHeader>
            <div className="w-10 h-10 rounded-2xl bg-purple-100 flex items-center justify-center mb-2">
              <QrCode className="w-5 h-5 text-purple-600" />
            </div>
            <DialogTitle className="text-xl font-black text-slate-900">
              Créer un QR Code Statique
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 font-medium">
              Ce QR code encode directement l'information de manière fixe (site web, téléphone, etc.).
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateStaticQR} className="space-y-4 my-2">
            {/* SÉLECTEUR DE TYPE DE CONTENU STATIQUE */}
            <div className="space-y-1.5">
              <Label className="text-[11px] font-black uppercase text-slate-500 tracking-wider">
                Type de Contenu Statique
              </Label>
              <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100/80 rounded-2xl border border-slate-200/60">
                <button
                  type="button"
                  onClick={() => setStaticForm({ ...staticForm, contentType: 'url' })}
                  className={`py-2 px-1 rounded-xl text-[11px] font-bold flex flex-col items-center gap-1 transition-all ${
                    staticForm.contentType === 'url'
                      ? "bg-white text-purple-700 shadow-sm"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Lien Web</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStaticForm({ ...staticForm, contentType: 'text' })}
                  className={`py-2 px-1 rounded-xl text-[11px] font-bold flex flex-col items-center gap-1 transition-all ${
                    staticForm.contentType === 'text'
                      ? "bg-white text-purple-700 shadow-sm"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Texte brut</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStaticForm({ ...staticForm, contentType: 'phone' })}
                  className={`py-2 px-1 rounded-xl text-[11px] font-bold flex flex-col items-center gap-1 transition-all ${
                    staticForm.contentType === 'phone'
                      ? "bg-white text-purple-700 shadow-sm"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Téléphone</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStaticForm({ ...staticForm, contentType: 'email' })}
                  className={`py-2 px-1 rounded-xl text-[11px] font-bold flex flex-col items-center gap-1 transition-all ${
                    staticForm.contentType === 'email'
                      ? "bg-white text-purple-700 shadow-sm"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email</span>
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[11px] font-black uppercase text-slate-500 tracking-wider">
                Titre du QR Code Statique
              </Label>
              <Input
                placeholder="Ex: Mon Site Web, Note Personnelle, Contact..."
                value={staticForm.title}
                onChange={(e) => setStaticForm({ ...staticForm, title: e.target.value })}
                className="h-11 border-slate-200 rounded-xl font-bold text-xs bg-slate-50/50 focus:bg-white"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[11px] font-black uppercase text-slate-500 tracking-wider">
                {staticForm.contentType === 'url' && "URL de Destination"}
                {staticForm.contentType === 'text' && "Texte Brut à Encoder"}
                {staticForm.contentType === 'phone' && "Numéro de Téléphone"}
                {staticForm.contentType === 'email' && "Adresse Email"}
              </Label>

              {staticForm.contentType === 'text' ? (
                <Textarea
                  placeholder="Saisissez votre texte brut ou message ici..."
                  value={staticForm.target_url}
                  onChange={(e) => setStaticForm({ ...staticForm, target_url: e.target.value })}
                  className="h-24 border-slate-200 rounded-xl font-sans text-xs bg-slate-50/50 focus:bg-white"
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
                  className="h-11 border-slate-200 rounded-xl font-mono text-xs bg-slate-50/50 focus:bg-white"
                  required
                />
              )}
            </div>

            <DialogFooter className="pt-2 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsStaticModalOpen(false)}
                className="rounded-xl border-slate-200 text-xs font-bold"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl px-5"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <QrCode className="w-4 h-4 mr-1.5" />}
                Créer le QR Code Statique
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  )
}

// ─── COMPOSANT ITEM CARTE QR DYNAMIQUE ET STATIQUE ─────────────────────────────────
function QRCardItem({
  qr, theme, editingId, editForm, setEditForm, profiles, getProfilePublicUrl,
  getRedirectURL, onEdit, onSave, onCancelEdit, onToggleActive, onDelete, onCopy, onDownload
}: any) {
  const isEditing = editingId === qr.id
  const targetUrl = qr.nfc_link || qr.target_url || ''
  const shortUrl = qr.short_code ? getRedirectURL(qr.short_code) : targetUrl

  const isNfcCard = qr.redirect_type === 'nfc_card' || (qr as any).type === 'nfc_card'
  const isStatic = theme === 'static' || qr.redirect_type === 'static'

  return (
    <div className={cn(
      "bg-white rounded-2xl border shadow-sm overflow-hidden transition-all duration-200",
      !qr.is_active ? "opacity-60 border-slate-200" : (
        isStatic
          ? "border-slate-200 hover:border-purple-300 hover:shadow-md"
          : "border-slate-200 hover:border-orange-300 hover:shadow-md"
      )
    )}>
      {/* Barre colorée supérieure (Orange pour Dynamique, Violet pour Statique) */}
      <div className={cn(
        "h-1.5 w-full",
        isStatic
          ? "bg-gradient-to-r from-purple-500 to-indigo-600"
          : (isNfcCard ? "bg-gradient-to-r from-blue-500 to-orange-500" : "bg-gradient-to-r from-orange-400 to-amber-500")
      )} />

      <div className="p-5">
        {isEditing ? (
          // ── Mode Édition ──
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-slate-900 text-sm">
                {isNfcCard ? 'Modifier le profil de destination NFC' : 'Modifier le QR code'}
              </h3>
              <button onClick={onCancelEdit} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {isNfcCard ? (
              // Sélecteur de profil pour carte NFC
              <div>
                <Label className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2 block">
                  Profil de destination
                </Label>
                {profiles.length === 0 ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-800 font-medium">
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
                          type="button"
                          onClick={() => setEditForm({ ...editForm, nfc_link: profileUrl })}
                          className={cn(
                            "w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
                            isSelected
                              ? "border-orange-500 bg-orange-50/50"
                              : "border-slate-200 hover:border-orange-200 hover:bg-slate-50"
                          )}
                        >
                          {profile.image_url ? (
                            <img src={profile.image_url} alt={profile.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0 text-orange-700 font-bold text-xs">
                              {profile.name?.substring(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-900 text-xs truncate">{profile.name}</p>
                            <p className="text-[11px] text-slate-500 truncate">{profile.job_title || profile.company || 'Profil'}</p>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-orange-600 shrink-0" />}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <Label className="text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5 block">
                  URL de Destination
                </Label>
                <Input
                  value={editForm.target_url}
                  onChange={(e) => setEditForm({ ...editForm, target_url: e.target.value })}
                  placeholder="https://exemple.com"
                  className="h-10 rounded-xl border-slate-200 font-mono text-xs"
                />
              </div>
            )}

            <div>
              <Label className="text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5 block">Titre</Label>
              <Input
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                placeholder="Titre explicatif..."
                className="h-10 rounded-xl border-slate-200 text-xs font-bold"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <Button
                onClick={() => onSave(qr.id, qr)}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-9 text-xs font-bold"
              >
                <Check className="w-4 h-4 mr-1.5" />
                Enregistrer
              </Button>
              <Button onClick={onCancelEdit} variant="outline" className="rounded-xl h-9 text-xs font-bold border-slate-200">
                Annuler
              </Button>
            </div>
          </div>
        ) : (
          // ── Mode Affichage ──
          <div className="flex flex-col sm:flex-row items-start gap-4">

            {/* Aperçu QR Code */}
            <div className="shrink-0 mx-auto sm:mx-0">
              <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center">
                <QRCodeSVG
                  id={`qr-${qr.id}`}
                  value={isStatic ? targetUrl : shortUrl}
                  size={100}
                  level="H"
                  includeMargin={false}
                />
              </div>
            </div>

            {/* Informations & Badges */}
            <div className="flex-1 min-w-0 w-full space-y-2">
              
              {/* Titre & TAGS CLAIRS (Carte NFC vs Custom vs Statique) */}
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-black text-slate-900 tracking-tight">
                  {qr.title || (isNfcCard ? 'Carte NFC' : (isStatic ? 'QR Code Statique' : 'QR Code Custom'))}
                </h3>

                {/* TAG 1 : Carte NFC (Blue / Orange) */}
                {isNfcCard && (
                  <Badge className="bg-blue-100 text-blue-800 border-none font-bold text-[10px] py-0.5 px-2 flex items-center gap-1">
                    <CreditCard className="w-3 h-3 text-blue-600" />
                    Carte NFC
                  </Badge>
                )}

                {/* TAG 2 : Custom Dynamique (Orange) */}
                {!isNfcCard && !isStatic && (
                  <Badge className="bg-orange-100 text-orange-800 border-none font-bold text-[10px] py-0.5 px-2 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-orange-600" />
                    Custom
                  </Badge>
                )}

                {/* TAG 3 : Statique (Violet) */}
                {isStatic && (
                  <Badge className="bg-purple-100 text-purple-800 border-none font-bold text-[10px] py-0.5 px-2 flex items-center gap-1">
                    <QrCode className="w-3 h-3 text-purple-600" />
                    Statique
                  </Badge>
                )}

                {/* Badge Actif / Inactif */}
                <Badge className={cn(
                  "border-none text-[10px] py-0.5 px-2 font-bold",
                  qr.is_active ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"
                )}>
                  {qr.is_active ? 'Actif' : 'Inactif'}
                </Badge>
              </div>

              {/* URL Short / Destination */}
              <div className="space-y-1">
                {!isStatic && qr.short_code && (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase text-slate-400">Lien Short :</span>
                    <code className="text-xs font-mono font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-200 select-all">
                      {shortUrl}
                    </code>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase text-slate-400">Destination :</span>
                  <code className="text-xs bg-slate-100 px-2 py-1 rounded flex-1 truncate text-slate-700 font-mono border border-slate-200">
                    {targetUrl || 'Non définie'}
                  </code>
                  <a
                    href={targetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-400 hover:text-slate-700 transition-colors shrink-0"
                    title="Ouvrir le lien de destination"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Scans & Informations */}
              <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium pt-1">
                <div className="flex items-center gap-1">
                  <BarChart3 className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-bold text-slate-700">{qr.scan_count || 0} scans</span>
                </div>
                {qr.created_at && (
                  <span className="text-slate-400">Créé le {new Date(qr.created_at).toLocaleDateString('fr-FR')}</span>
                )}
              </div>

              {/* Note explicative pour les cartes NFC */}
              {isNfcCard && (
                <p className="text-[10px] text-slate-400 font-medium bg-blue-50/50 p-2 rounded-lg border border-blue-100/60">
                  ℹ️ Le lien short permanent à graver sur la carte est géré par l'administrateur. Vous pouvez librement modifier le profil de destination ci-dessous.
                </p>
              )}

              {/* Barre d'Actions Ergonomique */}
              <div className="flex flex-wrap gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(qr)}
                  className="h-8 rounded-xl text-xs font-bold border-slate-200 hover:border-slate-400"
                >
                  <Edit2 className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                  Modifier
                </Button>

                {!isNfcCard && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onToggleActive(qr)}
                    className="h-8 rounded-xl text-xs font-bold border-slate-200"
                  >
                    {qr.is_active
                      ? <><EyeOff className="w-3.5 h-3.5 mr-1.5 text-slate-500" />Désactiver</>
                      : <><Eye className="w-3.5 h-3.5 mr-1.5 text-slate-500" />Activer</>
                    }
                  </Button>
                )}

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onCopy(isStatic ? targetUrl : shortUrl, 'Lien')}
                  className="h-8 rounded-xl text-xs font-bold border-slate-200"
                >
                  <Copy className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                  Copier lien
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="outline" className="h-8 rounded-xl text-xs font-bold border-slate-200">
                      <Download className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                      Télécharger
                      <ChevronDown className="w-3 h-3 ml-1 text-slate-400" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="rounded-xl">
                    <DropdownMenuItem onClick={() => onDownload(qr.short_code, qr.title || '', qr.id, 'png')} className="text-xs font-bold">
                      Format PNG (Image)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDownload(qr.short_code, qr.title || '', qr.id, 'svg')} className="text-xs font-bold">
                      Format SVG (Vectoriel)
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {!isStatic && (
                  <Link href={`/dashboard/qr-codes/${qr.id}/stats`}>
                    <Button size="sm" variant="outline" className="h-8 rounded-xl text-xs font-bold border-slate-200">
                      <BarChart3 className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                      Stats
                    </Button>
                  </Link>
                )}

                {/* Suppression disponible pour les QR codes Custom et Statiques */}
                {!isNfcCard && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDelete(qr.id)}
                    className="h-8 rounded-xl text-xs font-bold border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
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
