'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Pencil, 
  Camera, 
  Plus, 
  Trash2, 
  ArrowRight, 
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
  X,
  AlertCircle
} from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

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
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
  { id: 'instagram', label: 'Instagram', icon: Instagram },
  { id: 'facebook', label: 'Facebook', icon: Facebook },
  { id: 'linkedin', label: 'LinkedIn', icon: Linkedin },
  { id: 'twitter', label: 'Twitter/X', icon: Twitter },
  { id: 'youtube', label: 'YouTube', icon: Youtube },
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
  const [mounted, setMounted] = useState(false)

  // Profile local state
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

  // Active inline editor popup over element ('name' | 'job' | 'bio' | 'contact' | 'social' | 'custom' | null)
  const [activeInlineEditor, setActiveInlineEditor] = useState<'name' | 'job' | 'bio' | 'contact' | 'social' | 'custom' | null>(null)
  const [uploadingField, setUploadingField] = useState<'profile' | 'cover' | null>(null)

  const profileInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // --- VALIDATION DES CHAMPS ET REGLES ---

  // Nettoyeur de numéro de téléphone (Empêche la saisie de lettres)
  const sanitizePhone = (val: string) => {
    return val.replace(/[^\d+()\s-]/g, '')
  }

  // Validateur Email
  const isValidEmail = (email: string) => {
    if (!email || !email.trim()) return false
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  }

  // Validateur Téléphone
  const isValidPhone = (phone: string) => {
    if (!phone || !phone.trim()) return false
    const clean = phone.trim()
    return clean.length >= 8 && /^[\d+()\s-]+$/.test(clean)
  }

  // Vérification de la présence du Nom / Prénom
  const hasName = Boolean(
    (data.first_name && data.first_name.trim().length >= 2) || 
    (data.last_name && data.last_name.trim().length >= 2) || 
    (data.name && data.name.trim().length >= 2 && data.name !== 'Votre Nom')
  )

  // Vérification de la présence d'au moins 1 contact valide (Téléphone OU Email)
  const hasValidContact = Boolean(
    (data.phone && isValidPhone(data.phone)) || 
    (data.email && isValidEmail(data.email))
  )

  // Le formulaire global est-il valide pour continuer ?
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

  // Upload d'image direct
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'cover') => {
    const file = event.target.files?.[0]
    if (!file) return

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      toast.error('Format d\'image non supporté')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Fichier trop lourd (max 5MB)')
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

    // Upload vers Supabase Storage
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
    } catch (e) {
      console.log('Preview locale active')
    } finally {
      setUploadingField(null)
    }
  }

  // Réseaux sociaux (max 4)
  const addSocialLink = () => {
    if (data.social_links.length >= 4) {
      toast.error('Maximum 4 réseaux sociaux autorisés')
      return
    }
    updateProfileData({ social_links: [...data.social_links, { platform: 'instagram', url: '' }] })
  }

  const updateSocialLink = (index: number, field: 'platform' | 'url', value: string) => {
    const updated = [...data.social_links]
    updated[index] = { ...updated[index], [field]: value }
    updateProfileData({ social_links: updated })
  }

  const removeSocialLink = (index: number) => {
    updateProfileData({ social_links: data.social_links.filter((_: any, i: number) => i !== index) })
  }

  // Autres liens (max 4)
  const addCustomLink = () => {
    if (data.custom_links.length >= 4) {
      toast.error('Maximum 4 autres liens autorisés')
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

  return (
    <div className="w-full flex flex-col items-center pb-28" suppressHydrationWarning>
      
      {/* 1. SELECTION DU STYLE DE CARTE (Pilules défilantes) */}
      <div className="w-full mb-3 flex flex-col items-center px-1" suppressHydrationWarning>
        <div className="flex items-center justify-between w-full mb-1.5 px-1">
          <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-orange-500" />
            Style du template :
          </span>
          <span className="text-[10px] text-gray-400">Glissez pour choisir</span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full custom-scrollbar py-1 px-1">
          {availableTemplates.map((t) => {
            const Icon = t.icon
            const isSelected = selectedDesign === t.id
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onDesignChange(t.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                  isSelected
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md scale-105'
                    : 'bg-white text-gray-700 hover:text-gray-900 border border-gray-200'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-orange-500'}`} />
                <span>{t.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* 2. LE TEMPLATE REEL RENDU DANS LE VIEWPORT MOBILE AVEC CRAYONS DE MODIFICATION OVERLAY */}
      <div className="w-full max-w-md mx-auto relative rounded-2xl border border-gray-200/90 shadow-sm overflow-hidden bg-white">
        
        {/* BOUTONS CRAYONS INTERACTIFS DIRECTEMENT SUR LE TEMPLATE */}
        <div className="absolute top-3 left-3 z-30 flex items-center gap-1.5 bg-black/60 backdrop-blur-md text-white p-1 rounded-full text-xs shadow-lg">
          {/* Crayon Photo de Profil */}
          <button 
            type="button"
            className="p-1.5 hover:bg-orange-500 rounded-full transition-colors flex items-center gap-1"
            title="Modifier Photo de Profil"
            onClick={() => profileInputRef.current?.click()}
          >
            <Camera className="w-4 h-4 text-white" />
            <span className="text-[10px] font-bold pr-1">Photo</span>
          </button>

          <span className="w-px h-3 bg-white/30" />

          {/* Crayon Photo de Couverture */}
          <button 
            type="button"
            className="p-1.5 hover:bg-orange-500 rounded-full transition-colors flex items-center gap-1"
            title="Modifier Photo de Couverture"
            onClick={() => coverInputRef.current?.click()}
          >
            <Pencil className="w-4 h-4 text-white" />
            <span className="text-[10px] font-bold pr-1">Couverture</span>
          </button>
        </div>

        {/* BOUTONS D'ÉDITION DIRECTE DU TEXTE SUR LE TEMPLATE */}
        <div className="absolute top-3 right-3 z-30 flex items-center gap-1 bg-black/60 backdrop-blur-md text-white p-1 rounded-full text-xs shadow-lg">
          <button 
            type="button"
            className={`p-1.5 rounded-full transition-colors flex items-center gap-1 ${
              activeInlineEditor === 'name' ? 'bg-orange-500' : 'hover:bg-white/20'
            }`}
            onClick={() => setActiveInlineEditor(activeInlineEditor === 'name' ? null : 'name')}
          >
            <Pencil className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold">Nom & Bio</span>
          </button>

          <button 
            type="button"
            className={`p-1.5 rounded-full transition-colors flex items-center gap-1 ${
              activeInlineEditor === 'contact' ? 'bg-orange-500' : 'hover:bg-white/20'
            }`}
            onClick={() => setActiveInlineEditor(activeInlineEditor === 'contact' ? null : 'contact')}
          >
            <Phone className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold">Contacts</span>
          </button>

          <button 
            type="button"
            className={`p-1.5 rounded-full transition-colors flex items-center gap-1 ${
              activeInlineEditor === 'social' ? 'bg-orange-500' : 'hover:bg-white/20'
            }`}
            onClick={() => setActiveInlineEditor(activeInlineEditor === 'social' ? null : 'social')}
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold">Liens</span>
          </button>
        </div>

        {/* MODALE D'ÉDITION DIRECTE DE CHAMP SUR LE TEMPLATE */}
        {activeInlineEditor && (
          <div className="absolute inset-x-2 top-14 z-40 bg-white/95 backdrop-blur-md rounded-xl border border-orange-300 shadow-2xl p-3 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-gray-100">
              <span className="text-xs font-bold text-gray-900 flex items-center gap-1">
                <Pencil className="w-3.5 h-3.5 text-orange-500" />
                {activeInlineEditor === 'name' && 'Modifier Nom, Poste & Bio (Requis)'}
                {activeInlineEditor === 'contact' && 'Modifier les Coordonnées (Requis)'}
                {activeInlineEditor === 'social' && 'Modifier les Liens'}
              </span>
              <Button size="icon" variant="ghost" className="h-6 w-6 text-gray-400 hover:text-gray-600" onClick={() => setActiveInlineEditor(null)}>
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>

            {/* FORMULAIRE OVERLAY REACTIF EN TEMPS REEL */}
            {activeInlineEditor === 'name' && (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-1.5">
                  <div>
                    <label className="text-[10px] font-semibold text-gray-500">Prénom</label>
                    <Input value={data.first_name} placeholder="Prénom" className="h-8 text-xs" onChange={(e) => updateProfileData({ first_name: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-gray-500">Nom *</label>
                    <Input value={data.last_name} placeholder="Nom *" className="h-8 text-xs font-bold border-orange-200" onChange={(e) => updateProfileData({ last_name: e.target.value })} />
                  </div>
                </div>
                {!hasName && (
                  <p className="text-[10px] text-red-500 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Veuillez indiquer votre nom ou prénom (requis)
                  </p>
                )}
                <div className="grid grid-cols-2 gap-1.5">
                  <Input value={data.job_title} placeholder="Poste" className="h-8 text-xs" onChange={(e) => updateProfileData({ job_title: e.target.value })} />
                  <Input value={data.company} placeholder="Entreprise" className="h-8 text-xs" onChange={(e) => updateProfileData({ company: e.target.value })} />
                </div>
                <Textarea value={data.bio} placeholder="Biographie..." className="text-xs h-14 resize-none" onChange={(e) => updateProfileData({ bio: e.target.value })} />
              </div>
            )}

            {activeInlineEditor === 'contact' && (
              <div className="space-y-2">
                <div>
                  <label className="text-[10px] font-semibold text-gray-500">Téléphone (Chiffres uniquement)</label>
                  <Input 
                    value={data.phone} 
                    placeholder="ex: +2250102030405" 
                    className="h-8 text-xs" 
                    onChange={(e) => updateProfileData({ phone: sanitizePhone(e.target.value) })} 
                  />
                  {data.phone && !isValidPhone(data.phone) && (
                    <p className="text-[10px] text-red-500 mt-0.5">Format de téléphone invalide (min 8 chiffres)</p>
                  )}
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-gray-500">Email</label>
                  <Input 
                    value={data.email} 
                    placeholder="contact@exemple.com" 
                    className="h-8 text-xs" 
                    onChange={(e) => updateProfileData({ email: e.target.value })} 
                  />
                  {data.email && !isValidEmail(data.email) && (
                    <p className="text-[10px] text-red-500 mt-0.5">Format d'email invalide (ex: nom@domaine.com)</p>
                  )}
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-gray-500">Localisation</label>
                  <Input value={data.location} placeholder="Localisation" className="h-8 text-xs" onChange={(e) => updateProfileData({ location: e.target.value })} />
                </div>

                {!hasValidContact && (
                  <p className="text-[10px] text-red-500 font-semibold flex items-center gap-1 pt-1">
                    <AlertCircle className="w-3 h-3" /> Au moins un téléphone ou un email valide est requis.
                  </p>
                )}
              </div>
            )}

            {activeInlineEditor === 'social' && (
              <div className="space-y-2 max-h-56 overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-bold text-gray-700">Réseaux ({data.social_links.length}/4)</span>
                  <Button type="button" variant="outline" size="sm" className="h-6 px-2 text-[10px] font-bold text-orange-600" disabled={data.social_links.length >= 4} onClick={addSocialLink}>
                    <Plus className="w-3 h-3 mr-1" /> Ajouter
                  </Button>
                </div>
                {data.social_links.map((link: any, index: number) => (
                  <div key={index} className="flex gap-1 items-center bg-gray-50 p-1 rounded-lg border">
                    <Select value={link.platform} onValueChange={(val) => updateSocialLink(index, 'platform', val)}>
                      <SelectTrigger className="h-7 text-[11px] w-24 bg-white"><SelectValue placeholder="Réseau" /></SelectTrigger>
                      <SelectContent>{SOCIAL_PLATFORMS.map(p => (<SelectItem key={p.id} value={p.id} className="text-xs">{p.label}</SelectItem>))}</SelectContent>
                    </Select>
                    <Input value={link.url} placeholder="https://..." className="h-7 text-[11px] flex-1 bg-white" onChange={(e) => updateSocialLink(index, 'url', e.target.value)} />
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500 hover:bg-red-50" onClick={() => removeSocialLink(index)}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                ))}

                <div className="flex justify-between items-center pt-1.5 border-t">
                  <span className="text-[11px] font-bold text-gray-700">Autres Liens ({data.custom_links.length}/4)</span>
                  <Button type="button" variant="outline" size="sm" className="h-6 px-2 text-[10px] font-bold text-orange-600" disabled={data.custom_links.length >= 4} onClick={addCustomLink}>
                    <Plus className="w-3 h-3 mr-1" /> Ajouter
                  </Button>
                </div>
                {data.custom_links.map((link: any, index: number) => (
                  <div key={index} className="flex gap-1 items-center bg-gray-50 p-1 rounded-lg border">
                    <Input value={link.title} placeholder="Titre" className="h-7 text-[11px] w-24 bg-white" onChange={(e) => updateCustomLink(index, 'title', e.target.value)} />
                    <Input value={link.url} placeholder="https://..." className="h-7 text-[11px] flex-1 bg-white" onChange={(e) => updateCustomLink(index, 'url', e.target.value)} />
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500 hover:bg-red-50" onClick={() => removeCustomLink(index)}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                ))}
              </div>
            )}

            <Button className="w-full mt-2 bg-orange-500 hover:bg-orange-600 font-bold h-7 text-xs" onClick={() => setActiveInlineEditor(null)}>
              Valider
            </Button>
          </div>
        )}

        {/* INPUTS FICHIERS IMAGE MASQUÉS */}
        <input ref={profileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'profile')} />
        <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'cover')} />

        {/* RENDU VRAI DU TEMPLATE SÉLECTIONNÉ */}
        <div className="w-full h-full relative">
          {renderPreview(selectedDesign)}
        </div>
      </div>

      {/* 3. BOUTON SUIVANT STICKY EN BAS D'ÉCRAN (DESACTIVES SI FORMULAIRE INVALIDE) */}
      <div className="fixed bottom-0 left-0 right-0 p-3 bg-white/95 backdrop-blur-md border-t border-gray-200 z-50 flex flex-col items-center justify-center gap-1">
        
        {/* Message d'explication si désactivé */}
        {!isFormValid && (
          <p className="text-[10px] font-semibold text-orange-600 flex items-center gap-1 text-center">
            <AlertCircle className="w-3 h-3 text-orange-500 flex-shrink-0" />
            {!hasName 
              ? "Veuillez indiquer votre nom dans 'Nom & Bio'" 
              : "Renseignez un numéro de téléphone ou un email valide dans 'Contacts'"
            }
          </p>
        )}

        <Button 
          disabled={!isFormValid}
          onClick={() => {
            if (isFormValid) {
              onNext()
            }
          }}
          className={`w-full max-w-md h-12 font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-all ${
            isFormValid
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-500/25 cursor-pointer'
              : 'bg-gray-200 text-gray-400 border border-gray-300 cursor-not-allowed shadow-none'
          }`}
        >
          <span>Suivant (Créer mon compte)</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

    </div>
  )
}
