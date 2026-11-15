'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Camera, 
  Plus, 
  Trash2, 
  ArrowRight, 
  ArrowLeft,
  Check, 
  Phone, 
  Mail, 
  MapPin, 
  Briefcase, 
  User, 
  Globe, 
  MessageCircle, 
  Instagram, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Youtube, 
  Palette,
  Eye,
  X,
  AlertCircle,
  Sparkles,
  Image as ImageIcon
} from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { ProfileColorCustomizer } from '@/components/features/profiles/ProfileColorCustomizer'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { IPhone15Frame } from '@/components/ui/iphone-15-frame'
import { cn } from '@/lib/utils'

interface MobileWysiwygEditorProps {
  formData: any
  selectedDesign: string
  onDesignChange: (designId: string) => void
  renderPreview: (designId: string) => React.ReactNode
  onChange: (data: any) => void
  onNext: () => void
  availableTemplates: Array<{ id: string; label: string; icon: any }>
}

const SOCIAL_PLATFORMS = [
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, prefix: 'https://wa.me/' },
  { id: 'linkedin', label: 'LinkedIn', icon: Linkedin, prefix: 'https://linkedin.com/in/' },
  { id: 'instagram', label: 'Instagram', icon: Instagram, prefix: 'https://instagram.com/' },
  { id: 'facebook', label: 'Facebook', icon: Facebook, prefix: 'https://facebook.com/' },
  { id: 'twitter', label: 'X / Twitter', icon: Twitter, prefix: 'https://x.com/' },
  { id: 'youtube', label: 'YouTube', icon: Youtube, prefix: 'https://youtube.com/@' },
]

type StepId = 'identity' | 'contact' | 'links' | 'design'

const STEPS: Array<{ id: StepId; label: string; shortLabel: string; icon: any }> = [
  { id: 'identity', label: '1. Profil & Identité', shortLabel: 'Profil', icon: User },
  { id: 'contact', label: '2. Coordonnées', shortLabel: 'Contacts', icon: Phone },
  { id: 'links', label: '3. Réseaux & Liens', shortLabel: 'Liens', icon: Globe },
  { id: 'design', label: '4. Thème & Style', shortLabel: 'Style', icon: Palette },
]

export function MobileWysiwygEditor({ 
  formData, 
  selectedDesign, 
  onDesignChange, 
  renderPreview, 
  onChange, 
  onNext,
  availableTemplates
}: MobileWysiwygEditorProps) {
  const [currentStep, setCurrentStep] = useState<StepId>('identity')
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [uploadingField, setUploadingField] = useState<'profile' | 'cover' | null>(null)

  // État local des coordonnées du profil
  const [data, setData] = useState({
    name: formData?.name || '',
    first_name: formData?.first_name || '',
    last_name: formData?.last_name || '',
    job_title: formData?.job_title || formData?.jobTitle || '',
    company: formData?.company || '',
    bio: formData?.bio || '',
    phone: formData?.phone || '',
    email: formData?.email || '',
    location: formData?.location || '',
    image_url: formData?.image_url || null,
    cover_image_url: formData?.cover_image_url || null,
    social_links: formData?.social_links || [],
    custom_links: formData?.custom_links || [],
  })

  const profileInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

  // Nettoyage et validation des champs
  const sanitizePhone = (val: string) => val.replace(/[^\d+()\s-]/g, '')
  const isValidEmail = (email: string) => !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  const isValidPhone = (phone: string) => {
    if (!phone || !phone.trim()) return false
    const clean = phone.trim()
    return clean.length >= 8 && /^[\d+()\s-]+$/.test(clean)
  }

  const hasName = Boolean(
    (data.first_name && data.first_name.trim().length >= 2) || 
    (data.last_name && data.last_name.trim().length >= 2) || 
    (data.name && data.name.trim().length >= 2 && data.name !== 'Votre Nom')
  )

  const hasValidContact = Boolean(
    (data.phone && isValidPhone(data.phone)) || 
    (data.email && isValidEmail(data.email) && data.email.trim().length > 3)
  )

  const isFormValid = hasName && hasValidContact

  const updateProfileData = (updates: Partial<typeof data>) => {
    const updated = { ...data, ...updates }
    
    if ('first_name' in updates || 'last_name' in updates) {
      const full = [updated.first_name, updated.last_name].filter(Boolean).join(' ')
      if (full) updated.name = full
    }

    setData(updated)
    onChange(updated)
  }

  // Téléversement d'image optimisé
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'cover') => {
    const file = event.target.files?.[0]
    if (!file) return

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      toast.error("Format d'image non supporté (utilisez JPG ou PNG)")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Fichier trop lourd (maximum 5 Mo)')
      return
    }

    // Prévisualisation locale immédiate
    const reader = new FileReader()
    reader.onload = (e) => {
      const previewUrl = e.target?.result as string
      if (type === 'profile') {
        updateProfileData({ image_url: previewUrl })
      } else {
        updateProfileData({ cover_image_url: previewUrl })
      }
    }
    reader.readAsDataURL(file)

    // Upload Supabase Storage
    try {
      setUploadingField(type)
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const userId = user?.id || 'onboarding'
      const fileName = `${userId}/${Date.now()}-${type}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(fileName, file, { cacheControl: '3600', upsert: false })

      if (!uploadError) {
        const { data: urlData } = supabase.storage.from('profile-images').getPublicUrl(fileName)
        if (urlData?.publicUrl) {
          if (type === 'profile') {
            updateProfileData({ image_url: urlData.publicUrl })
          } else {
            updateProfileData({ cover_image_url: urlData.publicUrl })
          }
        }
      }
      toast.success(type === 'profile' ? "Photo de profil ajoutée" : "Photo de couverture ajoutée")
    } catch {
      // Prévisualisation locale conservée
    } finally {
      setUploadingField(null)
    }
  }

  // Gestion des liens réseaux
  const addSocialLink = () => {
    if (data.social_links.length >= 4) {
      toast.error('Maximum 4 réseaux sociaux')
      return
    }
    updateProfileData({ social_links: [...data.social_links, { platform: 'linkedin', url: '' }] })
  }

  const updateSocialLink = (index: number, field: 'platform' | 'url', value: string) => {
    const updated = [...data.social_links]
    updated[index] = { ...updated[index], [field]: value }
    updateProfileData({ social_links: updated })
  }

  const removeSocialLink = (index: number) => {
    updateProfileData({ social_links: data.social_links.filter((_: any, i: number) => i !== index) })
  }

  // Gestion des autres liens
  const addCustomLink = () => {
    if (data.custom_links.length >= 4) {
      toast.error('Maximum 4 autres liens')
      return
    }
    updateProfileData({ custom_links: [...data.custom_links, { title: '', url: '' }] })
  }

  const updateCustomLink = (index: number, field: 'title' | 'url', value: string) => {
    const updated = [...data.custom_links]
    updated[index] = { ...updated[index], [field]: value }
    updateProfileData({ custom_links: updated })
  }

  const removeCustomLink = (index: number) => {
    updateProfileData({ custom_links: data.custom_links.filter((_: any, i: number) => i !== index) })
  }

  // Navigation entre étapes
  const currentStepIndex = STEPS.findIndex(s => s.id === currentStep)
  const isFirstStep = currentStepIndex === 0
  const isLastStep = currentStepIndex === STEPS.length - 1

  const handleNextStep = () => {
    if (currentStep === 'identity' && !hasName) {
      toast.error("Veuillez indiquer au moins votre nom ou prénom")
      return
    }
    if (currentStep === 'contact' && !hasValidContact) {
      toast.error("Veuillez renseigner un numéro de téléphone ou un email valide")
      return
    }

    if (isLastStep) {
      if (isFormValid) {
        onNext()
      } else {
        toast.error("Vérifiez votre nom et vos coordonnées avant de finaliser")
      }
    } else {
      setCurrentStep(STEPS[currentStepIndex + 1].id)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handlePrevStep = () => {
    if (!isFirstStep) {
      setCurrentStep(STEPS[currentStepIndex - 1].id)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <div className="w-full flex flex-col items-center pb-36 text-neutral-900" suppressHydrationWarning>
      
      {/* 1. BARRE DE NAVIGATION SUPÉRIEURE ÉPURÉE (Style Apple / Linear) */}
      <div className="w-full sticky top-0 z-30 bg-white/95 backdrop-blur-md pt-1 pb-3 border-b border-neutral-200/80 mb-6">
        <div className="flex items-center justify-between gap-1 max-w-md mx-auto px-2">
          {STEPS.map((step, idx) => {
            const isActive = currentStep === step.id
            const isDone = (
              (step.id === 'identity' && hasName) ||
              (step.id === 'contact' && hasValidContact) ||
              (step.id === 'links' && (data.social_links.length > 0 || data.custom_links.length > 0))
            )

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => setCurrentStep(step.id)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 py-2 px-1.5 rounded-lg text-xs font-medium transition-all",
                  isActive
                    ? "bg-neutral-950 text-white shadow-xs font-semibold"
                    : isDone
                    ? "text-neutral-900 hover:bg-neutral-100"
                    : "text-neutral-400 hover:text-neutral-700 hover:bg-neutral-50"
                )}
              >
                <span className={cn(
                  "w-4 h-4 rounded-full flex items-center justify-center text-[10px] shrink-0",
                  isActive 
                    ? "bg-white/20 text-white" 
                    : isDone
                    ? "bg-emerald-100 text-emerald-800 font-bold"
                    : "bg-neutral-100 text-neutral-500"
                )}>
                  {isDone && !isActive ? <Check className="w-2.5 h-2.5" /> : idx + 1}
                </span>
                <span className="truncate">{step.shortLabel}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* 2. CONTENU DU FORMULAIRE & APERÇU LIVE INTÉGRÉ */}
      <div className="w-full max-w-md mx-auto px-3 space-y-5">
        
        {/* MINI CARTE LIVE EN HAUT : L'utilisateur voit sa carte se construire sous ses yeux */}
        <div 
          onClick={() => setIsPreviewOpen(true)}
          className="w-full relative rounded-2xl border border-neutral-200/90 overflow-hidden bg-white shadow-xs cursor-pointer group hover:border-neutral-400 transition-all"
        >
          {/* Bandeau d'état au-dessus de la carte */}
          <div className="flex items-center justify-between px-3 py-2 bg-neutral-50/90 border-b border-neutral-100">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-neutral-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Rendu en direct de votre profil
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-500 group-hover:text-neutral-950 transition-colors">
              <Eye className="w-3.5 h-3.5" />
              <span>Agrandir</span>
            </span>
          </div>

          {/* Rendu miniature interactif */}
          <div className="w-full h-44 sm:h-48 overflow-hidden pointer-events-none flex items-start justify-center pt-2 bg-neutral-50/40">
            <div className="w-[340px] scale-[0.62] sm:scale-[0.68] origin-top">
              {renderPreview(selectedDesign)}
            </div>
          </div>
        </div>
        
        {/* === ÉTAPE 1 : IDENTITÉ & PHOTO === */}
        {currentStep === 'identity' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <h2 className="text-lg font-semibold text-neutral-950 tracking-tight">
                Votre Identité
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Ces informations apparaîtront en tête de votre carte de visite connectée.
              </p>
            </div>

            {/* Téléversement Photo de Profil */}
            <div className="p-4 rounded-xl border border-neutral-200/80 bg-neutral-50/50 flex items-center gap-4">
              <div 
                onClick={() => profileInputRef.current?.click()}
                className="relative w-16 h-16 rounded-full bg-white border-2 border-dashed border-neutral-300 hover:border-neutral-900 cursor-pointer overflow-hidden flex items-center justify-center shrink-0 group transition-colors shadow-xs"
              >
                {data.image_url ? (
                  <img src={data.image_url} alt="Photo" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-6 h-6 text-neutral-400 group-hover:text-neutral-800 transition-colors" />
                )}
                {uploadingField === 'profile' && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-neutral-900">Photo de profil</p>
                <p className="text-[11px] text-neutral-500 mt-0.5">Format JPG, PNG (visage centré)</p>
                <div className="flex items-center gap-2 mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => profileInputRef.current?.click()}
                    className="h-7 text-xs px-2.5 bg-white border-neutral-200 hover:bg-neutral-100 text-neutral-800 font-medium"
                  >
                    {data.image_url ? 'Changer' : 'Ajouter une photo'}
                  </Button>
                  {data.image_url && (
                    <button
                      type="button"
                      onClick={() => updateProfileData({ image_url: null })}
                      className="text-[11px] text-neutral-400 hover:text-rose-600 transition-colors"
                    >
                      Supprimer
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Prénom & Nom */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700">Prénom</label>
                <Input 
                  value={data.first_name} 
                  placeholder="ex: Marie" 
                  className="h-11 text-xs bg-white border-neutral-200 rounded-lg placeholder:text-neutral-400 focus-visible:ring-1 focus-visible:ring-neutral-950" 
                  onChange={(e) => updateProfileData({ first_name: e.target.value })} 
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700">Nom *</label>
                <Input 
                  value={data.last_name} 
                  placeholder="ex: Konan" 
                  className={cn(
                    "h-11 text-xs bg-white rounded-lg placeholder:text-neutral-400 focus-visible:ring-1 focus-visible:ring-neutral-950",
                    !hasName ? "border-amber-300" : "border-neutral-200"
                  )} 
                  onChange={(e) => updateProfileData({ last_name: e.target.value })} 
                />
              </div>
            </div>

            {/* Titre & Entreprise */}
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700">Fonction / Titre professionnel</label>
                <Input 
                  value={data.job_title} 
                  placeholder="ex: Directrice Commerciale, Consultant, etc." 
                  className="h-11 text-xs bg-white border-neutral-200 rounded-lg placeholder:text-neutral-400 focus-visible:ring-1 focus-visible:ring-neutral-950" 
                  onChange={(e) => updateProfileData({ job_title: e.target.value })} 
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700">Entreprise ou Activité</label>
                <Input 
                  value={data.company} 
                  placeholder="ex: Cabinet Consulting, Ofika, etc." 
                  className="h-11 text-xs bg-white border-neutral-200 rounded-lg placeholder:text-neutral-400 focus-visible:ring-1 focus-visible:ring-neutral-950" 
                  onChange={(e) => updateProfileData({ company: e.target.value })} 
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700">Bio courte (facultatif)</label>
                <Textarea 
                  value={data.bio} 
                  placeholder="Décrivez votre activité ou votre proposition de valeur en 1 ou 2 phrases..." 
                  className="text-xs h-20 resize-none bg-white border-neutral-200 rounded-lg placeholder:text-neutral-400 focus-visible:ring-1 focus-visible:ring-neutral-950" 
                  onChange={(e) => updateProfileData({ bio: e.target.value })} 
                />
              </div>
            </div>
          </div>
        )}

        {/* === ÉTAPE 2 : COORDONNÉES DIRECTES === */}
        {currentStep === 'contact' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <h2 className="text-lg font-semibold text-neutral-950 tracking-tight">
                Vos Coordonnées
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Permettez à vos interlocuteurs de vous contacter et d&apos;enregistrer votre fiche contact en 1 geste.
              </p>
            </div>

            <div className="space-y-4">
              {/* Téléphone / WhatsApp */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700 flex items-center justify-between">
                  <span>Numéro de téléphone / WhatsApp *</span>
                  <span className="text-[10px] text-neutral-400">Recommandé</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <Input 
                    value={data.phone} 
                    placeholder="ex: +225 05 03 68 15 88" 
                    className="pl-9 h-11 text-xs bg-white border-neutral-200 rounded-lg placeholder:text-neutral-400 focus-visible:ring-1 focus-visible:ring-neutral-950 font-mono" 
                    onChange={(e) => updateProfileData({ phone: sanitizePhone(e.target.value) })} 
                  />
                </div>
                {data.phone && !isValidPhone(data.phone) && (
                  <p className="text-[11px] text-amber-600 mt-1">Numéro incomplet (minimum 8 chiffres)</p>
                )}
              </div>

              {/* Email professionnel */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700 flex items-center justify-between">
                  <span>Email professionnel *</span>
                  <span className="text-[10px] text-neutral-400">Pour recevoir des messages</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <Input 
                    type="email"
                    value={data.email} 
                    placeholder="ex: contact@ofika.ci" 
                    className="pl-9 h-11 text-xs bg-white border-neutral-200 rounded-lg placeholder:text-neutral-400 focus-visible:ring-1 focus-visible:ring-neutral-950" 
                    onChange={(e) => updateProfileData({ email: e.target.value })} 
                  />
                </div>
                {data.email && !isValidEmail(data.email) && (
                  <p className="text-[11px] text-amber-600 mt-1">Format d&apos;email invalide (ex: nom@domaine.com)</p>
                )}
              </div>

              {/* Localisation */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700">Ville & Pays</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <Input 
                    value={data.location} 
                    placeholder="ex: Abidjan, Côte d'Ivoire" 
                    className="pl-9 h-11 text-xs bg-white border-neutral-200 rounded-lg placeholder:text-neutral-400 focus-visible:ring-1 focus-visible:ring-neutral-950" 
                    onChange={(e) => updateProfileData({ location: e.target.value })} 
                  />
                </div>
              </div>
            </div>

            {!hasValidContact && (
              <div className="p-3 rounded-lg border border-amber-200 bg-amber-50/60 text-xs text-amber-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Renseignez au moins un numéro de téléphone ou un email pour continuer.</span>
              </div>
            )}
          </div>
        )}

        {/* === ÉTAPE 3 : RÉSEAUX & LIENS === */}
        {currentStep === 'links' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-lg font-semibold text-neutral-950 tracking-tight">
                Réseaux & Liens Clés
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Connectez vos profils professionnels, réseaux et liens vers vos services.
              </p>
            </div>

            {/* Réseaux Sociaux */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-800">
                  Réseaux Sociaux ({data.social_links.length}/4)
                </span>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  disabled={data.social_links.length >= 4} 
                  onClick={addSocialLink}
                  className="h-7 px-2.5 text-xs bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50 font-medium"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Ajouter
                </Button>
              </div>

              {data.social_links.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-neutral-200 text-center text-xs text-neutral-400">
                  Aucun réseau ajouté. Cliquez sur &quot;Ajouter&quot; pour relier LinkedIn, WhatsApp, etc.
                </div>
              ) : (
                <div className="space-y-2">
                  {data.social_links.map((link: any, index: number) => (
                    <div key={index} className="flex gap-2 items-center bg-neutral-50/70 p-2 rounded-xl border border-neutral-200/80">
                      <Select value={link.platform} onValueChange={(val) => updateSocialLink(index, 'platform', val)}>
                        <SelectTrigger className="h-9 text-xs w-28 bg-white border-neutral-200 rounded-lg">
                          <SelectValue placeholder="Réseau" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-neutral-200">
                          {SOCIAL_PLATFORMS.map(p => (
                            <SelectItem key={p.id} value={p.id} className="text-xs">
                              {p.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <Input 
                        value={link.url} 
                        placeholder="Lien ou identifiant..." 
                        className="h-9 text-xs flex-1 bg-white border-neutral-200 rounded-lg placeholder:text-neutral-400" 
                        onChange={(e) => updateSocialLink(index, 'url', e.target.value)} 
                      />
                      
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-9 w-9 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg shrink-0" 
                        onClick={() => removeSocialLink(index)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Autres Liens Personnalisés */}
            <div className="space-y-3 pt-2 border-t border-neutral-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-800">
                  Autres Liens / Boutons ({data.custom_links.length}/4)
                </span>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  disabled={data.custom_links.length >= 4} 
                  onClick={addCustomLink}
                  className="h-7 px-2.5 text-xs bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50 font-medium"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Ajouter
                </Button>
              </div>

              {data.custom_links.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-neutral-200 text-center text-xs text-neutral-400">
                  Ajoutez un lien vers votre portfolio, catalogue, prise de rendez-vous ou site web.
                </div>
              ) : (
                <div className="space-y-2">
                  {data.custom_links.map((link: any, index: number) => (
                    <div key={index} className="flex gap-2 items-center bg-neutral-50/70 p-2 rounded-xl border border-neutral-200/80">
                      <Input 
                        value={link.title} 
                        placeholder="Titre (ex: Mon site)" 
                        className="h-9 text-xs w-32 bg-white border-neutral-200 rounded-lg placeholder:text-neutral-400" 
                        onChange={(e) => updateCustomLink(index, 'title', e.target.value)} 
                      />
                      <Input 
                        value={link.url} 
                        placeholder="https://mon-site.com" 
                        className="h-9 text-xs flex-1 bg-white border-neutral-200 rounded-lg placeholder:text-neutral-400" 
                        onChange={(e) => updateCustomLink(index, 'url', e.target.value)} 
                      />
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-9 w-9 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg shrink-0" 
                        onClick={() => removeCustomLink(index)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* === ÉTAPE 4 : DESIGN & STYLE === */}
        {currentStep === 'design' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <h2 className="text-lg font-semibold text-neutral-950 tracking-tight">
                Style & Univers Visuel
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Sélectionnez le template qui mettra le mieux en valeur vos compétences.
              </p>
            </div>

            {/* Grille des Templates Épurée */}
            <div className="grid grid-cols-2 gap-2.5">
              {availableTemplates.map((t) => {
                const Icon = t.icon
                const isSelected = selectedDesign === t.id

                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => onDesignChange(t.id)}
                    className={cn(
                      "p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between gap-3 group",
                      isSelected
                        ? "bg-neutral-950 text-white border-neutral-950 shadow-sm"
                        : "bg-white text-neutral-800 border-neutral-200/80 hover:border-neutral-300 hover:bg-neutral-50/50"
                    )}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                        isSelected 
                          ? "bg-white/10 text-white" 
                          : "bg-neutral-100 text-neutral-700 group-hover:text-neutral-950"
                      )}>
                        <Icon className="w-4 h-4" />
                      </div>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-semibold">{t.label}</p>
                      <p className={cn("text-[10px] mt-0.5", isSelected ? "text-neutral-300" : "text-neutral-400")}>
                        {isSelected ? 'Actif' : 'Cliquer pour choisir'}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Personnalisation Couleurs de la page */}
            <div className="pt-2 border-t border-neutral-100">
              <ProfileColorCustomizer
                currentSettings={formData?.theme_settings || {}}
                designId={selectedDesign}
                onChange={(theme_settings) => onChange({ theme_settings })}
              />
            </div>

            {/* Bouton d'aperçu direct dans l'étape style */}
            <div className="p-4 rounded-xl border border-neutral-200/80 bg-neutral-50/60 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-neutral-900">Vérifier le rendu en direct</p>
                <p className="text-[11px] text-neutral-500">Visualisez votre carte dans le simulateur iPhone 15.</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsPreviewOpen(true)}
                className="h-8 text-xs bg-white border-neutral-200 hover:bg-neutral-100 text-neutral-800 font-medium shrink-0 flex items-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5 text-neutral-500" />
                <span>Ouvrir l&apos;aperçu</span>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 3. INPUTS FICHIERS IMAGE MASQUÉS */}
      <input ref={profileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'profile')} />
      <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'cover')} />

      {/* 4. BARRE D'ACTION FLOTTANTE CENTRÉE (Anti-collision, protégée des coins et safe-area) */}
      <div className="fixed bottom-5 sm:bottom-6 inset-x-0 z-40 flex justify-center px-4 pointer-events-none pb-[env(safe-area-inset-bottom)]">
        <div className="w-full max-w-sm sm:max-w-md bg-white/95 backdrop-blur-xl border border-neutral-200/90 shadow-[0_12px_40px_rgba(0,0,0,0.16)] rounded-2xl p-2 sm:p-2.5 flex items-center gap-2 pointer-events-auto">
          
          {/* Bouton Retour */}
          {!isFirstStep && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePrevStep}
              className="h-10 px-3 text-xs bg-white border-neutral-200 hover:bg-neutral-100 text-neutral-800 font-medium rounded-xl shrink-0 flex items-center gap-1 cursor-pointer transition-colors"
              aria-label="Retour à l'étape précédente"
            >
              <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
              <span>Retour</span>
            </Button>
          )}

          {/* Bouton Voir l'Aperçu (Feuille coulissante) */}
          <Sheet open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
            <SheetTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-10 px-3 text-xs bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-800 font-medium rounded-xl flex items-center gap-1.5 shrink-0 cursor-pointer transition-colors"
                aria-label="Voir l'aperçu du profil"
              >
                <Eye className="w-3.5 h-3.5 text-neutral-600 shrink-0" />
                <span>Aperçu</span>
              </Button>
            </SheetTrigger>

            <SheetContent side="bottom" className="h-[92vh] rounded-t-3xl p-4 overflow-y-auto bg-neutral-900 border-neutral-800 flex flex-col items-center">
              <SheetHeader className="p-2 border-b border-neutral-800 w-full flex-row items-center justify-between text-white mb-2">
                <SheetTitle className="text-white text-sm font-semibold flex items-center gap-2">
                  <Eye className="w-4 h-4 text-neutral-400" />
                  Rendu en direct de votre carte
                </SheetTitle>
              </SheetHeader>
              
              <div className="w-full flex justify-center py-2">
                <IPhone15Frame showColorPicker={false} scaleClass="scale-[0.80] origin-top">
                  {renderPreview(selectedDesign)}
                </IPhone15Frame>
              </div>
            </SheetContent>
          </Sheet>

          {/* Bouton Suivant / Valider */}
          <Button
            type="button"
            onClick={handleNextStep}
            className="flex-1 h-10 px-3.5 text-xs font-semibold bg-neutral-950 hover:bg-neutral-800 text-white rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all active:scale-[0.99] cursor-pointer truncate"
          >
            <span className="truncate">{isLastStep ? 'Créer mon compte' : 'Étape suivante'}</span>
            <ArrowRight className="w-3.5 h-3.5 shrink-0" />
          </Button>
        </div>
      </div>

    </div>
  )
}
