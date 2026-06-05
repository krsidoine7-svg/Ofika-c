'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LinkInBioDesign1 } from '@/components/features/profiles/LinkInBioDesign1'
import { LinkInBioDesign2 } from '@/components/features/profiles/LinkInBioDesign2'
import { LinkInBioDesign3 } from '@/components/features/profiles/LinkInBioDesign3'
import { LinkInBioDesign4 } from '@/components/features/profiles/LinkInBioDesign4'
import { LinkInBioDesign7 } from '@/components/features/profiles/LinkInBioDesign7'
import { LinkInBioInfluencer } from '@/components/features/profiles/LinkInBioInfluencer'
import { LinkInBioEcommerce } from '@/components/features/profiles/LinkInBioEcommerce'
import { LinkInBioFreelance } from '@/components/features/profiles/LinkInBioFreelance'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Palette,
  Sparkles,
  CheckCircle,
  Star,
  Crown,
  Zap,
  Users,
  TrendingUp,
  Award,
  Eye,
  FileText,
  LayoutGrid,
  Briefcase
} from "lucide-react"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'

interface TemplateSelectionStepProps {
  onNext: (selectedTemplate: string) => void
  onPrev: () => void
  formData: any
  isLoading?: boolean
}

// Fonction pour créer le profil d'aperçu à partir des données du formulaire
const createPreviewProfile = (formData: any, designChoice: string) => {
  return {
    id: 'preview',
    user_id: 'preview-user',
    profile_type: formData.profile_type || 'public' as const,
    name: formData.name || 'Votre Nom',
    bio: formData.bio || '',
    image_url: formData.image_url || null,
    custom_url: formData.custom_url || formData.username || 'votre-url',
    username: formData.username || formData.custom_url || 'votre-url',
    email: formData.email || null,
    phone: formData.phone || null,
    location: formData.location || null,
    whatsapp: formData.whatsapp || null,
    facebook: formData.facebook || null,
    instagram: formData.instagram || null,
    twitter: formData.twitter || null,
    youtube: formData.youtube || null,
    tiktok: formData.tiktok || null,
    website: formData.website || null,
    design_choice: designChoice,
    color_theme: 'default',
    is_active: true,
    custom_links: formData.custom_links || [],
    is_public: formData.is_public !== false,
    display_reviews: formData.display_reviews || false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    links: (formData.custom_links || []).map((link: any, index: number) => ({
      id: `preview-${index}`,
      profile_id: 'preview',
      title: link.title,
      url: link.url,
      position: index,
      click_count: 0,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }))
  }
}

// Configuration des templates avec priorités
const templates = [
  {
    id: 'design1',
    name: 'Design Classique',
    description: 'Layout vertical épuré et professionnel',
    icon: Palette,
    color: 'blue',
    priority: 'Populaire',
    priorityIcon: Zap,
    priorityColor: 'bg-blue-100 text-blue-800',
    features: ['Layout vertical', 'Design épuré', 'Style professionnel', 'Facile à lire'],
    stats: { users: '65%', satisfaction: '4.8/5', conversion: '+12%' },
    targetAudience: 'Professionnels & Entreprises'
  },
  {
    id: 'design2',
    name: 'Design',
    description: 'Grille de cartes avec effets interactifs',
    icon: Star,
    color: 'purple',
    priority: 'Grille',
    priorityIcon: Zap,
    priorityColor: 'bg-purple-100 text-purple-800',
    features: ['Grille de cartes', 'Effets hover', 'Icônes colorées', 'Design interactif'],
    stats: { users: '25%', satisfaction: '4.6/5', conversion: '+8%' },
    targetAudience: 'Créatifs & Designers'
  },
  {
    id: 'design3',
    name: 'Design Créatif',
    description: 'Effets visuels et animations avancées',
    icon: Sparkles,
    color: 'pink',
    priority: 'Artistique',
    priorityIcon: Zap,
    priorityColor: 'bg-pink-100 text-pink-800',
    features: ['Fond dégradé animé', 'Glassmorphism', 'Animations avancées', 'Design unique'],
    stats: { users: '10%', satisfaction: '4.9/5', conversion: '+15%' },
    targetAudience: 'Artistes & Créatifs'
  },
  {
    id: 'design4',
    name: 'Design Nature',
    description: 'Style minimaliste avec couleurs naturelles',
    icon: Award,
    color: 'emerald',
    priority: 'Nouveau',
    priorityIcon: Zap,
    priorityColor: 'bg-emerald-100 text-emerald-800',
    features: ['Couleurs naturelles', 'Style minimaliste', 'Header coloré', 'Design moderne'],
    stats: { users: '5%', satisfaction: '4.7/5', conversion: '+10%' },
    targetAudience: 'Minimalistes & Écologiques'
  },
  {
    id: 'influencer',
    name: 'Design Influenceur',
    description: 'Optimisé pour créateurs de contenu et influenceurs',
    icon: Users,
    color: 'rose',
    priority: 'Tendance',
    priorityIcon: TrendingUp,
    priorityColor: 'bg-gradient-to-r from-pink-500 to-rose-500 text-white',
    features: ['Mise en avant réseaux sociaux', 'Grille photo/vidéo', 'Boutons d\'action visibles', 'Design accrocheur'],
    stats: { users: '15%', satisfaction: '4.8/5', conversion: '+18%' },
    targetAudience: 'Influenceurs & Créateurs'
  },
  {
    id: 'ecommerce',
    name: 'Design E-commerce',
    description: 'Parfait pour vendeurs en ligne et boutiques',
    icon: Crown,
    color: 'amber',
    priority: 'Business',
    priorityIcon: Award,
    priorityColor: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white',
    features: ['Mise en avant produits', 'Boutons d\'achat', 'Catalogue visuel', 'Call-to-action optimisés'],
    stats: { users: '12%', satisfaction: '4.7/5', conversion: '+22%' },
    targetAudience: 'Vendeurs & E-commerçants'
  },
  {
    id: 'design7',
    name: 'Design Dark Elegant',
    description: 'Design sombre élégant avec fond dégradé',
    icon: Star,
    color: 'slate',
    priority: 'Premium',
    priorityIcon: Crown,
    priorityColor: 'bg-gradient-to-r from-slate-700 to-gray-900 text-white',
    features: ['Fond sombre élégant', 'Photo circulaire centrée', 'Boutons blancs minimalistes', 'Design haut de gamme'],
    stats: { users: '8%', satisfaction: '4.9/5', conversion: '+20%' },
    targetAudience: 'Créatifs & Photographes'
  },
  {
    id: 'freelance',
    name: 'Design Freelance',
    description: 'Optimisé pour freelances et solopreneurs africains',
    icon: Users,
    color: 'blue',
    priority: 'Professionnel',
    priorityIcon: TrendingUp,
    priorityColor: 'bg-gradient-to-r from-blue-500 to-orange-400 text-white',
    features: ['Palette chaleureuse', 'CTA orange puissant', 'Social proof intégré', 'Design confiance'],
    stats: { users: '18%', satisfaction: '4.8/5', conversion: '+16%' },
    targetAudience: 'Freelances & Solopreneurs'
  }
]

export function TemplateSelectionStep({
  onNext,
  onPrev,
  formData,
  isLoading = false
}: TemplateSelectionStepProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('design1')
  const previewProfile = createPreviewProfile(formData, selectedTemplate)

  const handleNext = () => { onNext(selectedTemplate) }
  const handleTemplateSelect = (templateId: string) => { setSelectedTemplate(templateId) }
  const getTemplateInfo = (templateId: string) => {
    return templates.find(t => t.id === templateId) || templates[0]
  }
  const selectedTemplateInfo = getTemplateInfo(selectedTemplate)

  const renderPreview = (designId: string) => {
    const profile = createPreviewProfile(formData, designId)

    switch (designId) {
      case 'design1': return <LinkInBioDesign1 profile={profile} showAddToContacts={true} isPreview={true} />
      case 'design2': return <LinkInBioDesign2 profile={profile} showAddToContacts={true} isPreview={true} />
      case 'design3': return <LinkInBioDesign3 profile={profile} showAddToContacts={true} isPreview={true} />
      case 'design4': return <LinkInBioDesign4 profile={profile} showAddToContacts={true} isPreview={true} />
      case 'influencer': return <LinkInBioInfluencer profile={profile} showAddToContacts={true} isPreview={true} />
      case 'ecommerce': return <LinkInBioEcommerce profile={profile} showAddToContacts={true} isPreview={true} />
      case 'design7': return <LinkInBioDesign7 profile={profile} showAddToContacts={true} isPreview={true} />
      case 'freelance': return <LinkInBioFreelance profile={profile} showAddToContacts={true} isPreview={true} />
      default: return null
    }
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-2 pb-6 pt-1">
      {/* Retour + titre + stepper */}
      <Button onClick={onPrev} variant="ghost" className="mb-1 w-fit px-1 py-0 text-sm">← Retour</Button>
      <h1 className="text-xl font-bold mb-1 text-gray-900">Créer un nouveau profil</h1>
      <p className="text-gray-600 text-sm mb-3">Créez votre profil professionnel personnalisé</p>
      {/* Stepper (compléter si besoin) */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-2">
        {/* COLONNE SÉLECTION VERTICALE - GAUCHE */}
        <div className="h-full min-h-[520px] lg:min-h-[520px] flex flex-col justify-start">
          <h2 className="font-semibold text-base sm:text-lg mb-1">Choisissez un design</h2>
          <p className="text-sm text-gray-500 mb-3">Sélectionnez le design qui correspond le mieux à votre personnalité et voyez l'aperçu en temps réel.</p>
          {/* --- Select déroulant MOBILE --- */}
          <div className="lg:hidden mb-1"> {/* mb-1 au lieu de mb-2 pour compacter l'espace */}
            <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sélectionnez un design..." />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => {
                  const IconComponent = template.icon;
                  return (
                    <SelectItem value={template.id} key={template.id}>
                      <span className="flex items-center gap-2">
                        <IconComponent className={`h-4 w-4 text-${template.color}-600`} />
                        {template.name}
                      </span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          {/* --- Liste verticale DESKTOP --- */}
          <div className="hidden lg:flex flex-col gap-3 max-w-sm">
            {templates.map(template => {
              const IconComponent = template.icon
              const isSelected = selectedTemplate === template.id
              return (
                <Card
                  key={template.id}
                  className={`w-full border transition-all duration-200 px-2 shadow-none ${isSelected
                    ? 'ring-2 ring-gray-900 shadow-gray-100 border-gray-400'
                    : 'hover:shadow-gray-100 hover:shadow border-gray-200 cursor-pointer'
                    }`}
                  onClick={() => handleTemplateSelect(template.id)}
                >
                  <CardHeader className="flex-row gap-3 items-center py-1 px-2">
                    <IconComponent className={`h-5 w-5 text-${template.color}-600`} />
                    <div className="flex-1 font-semibold text-gray-800 text-base">{template.name}</div>
                    {isSelected && <Badge className="bg-black text-white ml-auto"><CheckCircle className="w-3 h-3 mr-1" />Sélectionné</Badge>}
                  </CardHeader>
                  <CardContent className="py-1 px-2">
                    <div className="flex flex-wrap items-center text-xs gap-3">
                      <span className="text-gray-600 truncate">{template.description}</span>
                      <Badge className={`capitalize ${template.priorityColor}`}>{template.priority}</Badge>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* COLONNE APERÇU + DESCRIPTION - DROITE */}
        <div className="h-full min-h-[520px] lg:min-h-[520px] flex flex-col items-center">
          <div className="sticky top-4">
            <h3 className="font-semibold text-center text-sm uppercase tracking-wider text-gray-400 mb-4 items-center flex justify-center gap-2">
              <Eye className="w-4 h-4" />
              Aperçu en temps réel
            </h3>

            {/* Smartphone Mockup Réaliste */}
            <div className="relative mx-auto border-gray-900 bg-gray-900 border-[12px] rounded-[3rem] h-[600px] w-[290px] shadow-2xl overflow-hidden ring-4 ring-gray-900/10 transition-all duration-500 hover:scale-[1.02]">
              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-2xl z-20"></div>

              <div className="rounded-[2rem] overflow-hidden w-full h-full bg-white relative z-10 custom-scrollbar overflow-y-auto">
                <div className="w-full h-full">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={selectedTemplate}
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.98 }}
                      transition={{ duration: 0.3 }}
                      className="h-full"
                    >
                      {renderPreview(selectedTemplate) ?? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 text-center italic p-8 gap-4">
                          <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center">
                            <Palette className="w-8 h-8 text-gray-200" />
                          </div>
                          <p>Aucun aperçu disponible pour ce template</p>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Légende */}
            <div className="mt-6 flex flex-col items-center gap-2">
              <Badge className="bg-gray-100 text-gray-900 border-none px-4 py-1 font-bold">
                Design : {selectedTemplateInfo.name}
              </Badge>
              <p className="text-[10px] text-gray-400 italic text-center max-w-[200px]">
                Voici exactement ce que verront vos clients sur leur mobile.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Résumé/template et stats - Déplacé en bas ou intégré autrement pour aérer */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-1 gap-6">
        <Card className="border-none bg-gradient-to-br from-white to-gray-50/30 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              Pourquoi choisir le design {selectedTemplateInfo.name} ?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2 text-sm">Pourquoi ce template ?</h4>
              <div className="space-y-2 text-xs text-gray-600">
                {/* Bullets dynamiques pour chaque template, déjà en place */}
                {selectedTemplateInfo.id === 'design1' && (<><p>• <strong>Idéal pour les professionnels</strong> et les entreprises</p><p>• <strong>Design épuré</strong> qui met en valeur vos informations</p><p>• <strong>Facile à lire</strong> sur tous les appareils</p><p>• <strong>Performance optimale</strong> et chargement rapide</p></>)}
                {selectedTemplateInfo.id === 'design2' && (<><p>• <strong>Design épuré</strong> et visuellement attractif</p><p>• <strong>Effets interactifs</strong> qui captent l'attention</p><p>• <strong>Grille organisée</strong> pour une navigation claire</p><p>• <strong>Parfait pour les créatifs</strong> et influenceurs</p></>)}
                {selectedTemplateInfo.id === 'design3' && (<><p>• <strong>Design unique</strong> qui vous démarque</p><p>• <strong>Effets visuels avancés</strong> et animations</p><p>• <strong>Glassmorphism moderne</strong> très tendance</p><p>• <strong>Impact visuel fort</strong> pour impressionner</p></>)}
                {selectedTemplateInfo.id === 'design4' && (<><p>• <strong>Style minimaliste</strong> et élégant</p><p>• <strong>Couleurs naturelles</strong> noir et blanc</p><p>• <strong>Layout moderne</strong> avec photo rectangulaire</p><p>• <strong>Parfait pour les créatifs</strong> et artistes</p></>)}
                {selectedTemplateInfo.id === 'influencer' && (<><p>• <strong>Réseaux sociaux en avant</strong> pour maximiser votre audience</p><p>• <strong>Grille visuelle</strong> pour vos contenus photo/vidéo</p><p>• <strong>Boutons d'action</strong> visibles et engageants</p><p>• <strong>Idéal pour influenceurs</strong> et créateurs de contenu</p></>)}
                {selectedTemplateInfo.id === 'ecommerce' && (<><p>• <strong>Mise en avant produits</strong> avec catalogue visuel</p><p>• <strong>Boutons d'achat</strong> optimisés pour la conversion</p><p>• <strong>Call-to-action</strong> stratégiquement placés</p><p>• <strong>Parfait pour vendeurs</strong> et boutiques en ligne</p></>)}
                {selectedTemplateInfo.id === 'design7' && (<><p>• <strong>Design sombre élégant</strong> avec dégradé sophistiqué</p><p>• <strong>Photo circulaire</strong> mise en valeur au centre</p><p>• <strong>Boutons blancs</strong> minimalistes et élégants</p><p>• <strong>Idéal pour photographes</strong> et créatifs haut de gamme</p></>)}
                {selectedTemplateInfo.id === 'freelance' && (<><p>• <strong>Palette chaleureuse</strong> bleu + gris + vert menthe</p><p>• <strong>CTA puissant</strong> pour maximiser les conversions</p><p>• <strong>Social proof intégré</strong> avec stats de confiance</p><p>• <strong>Parfait pour freelances</strong> et entrepreneurs africains</p></>)}
              </div>
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between text-xs"><span className="text-gray-600">Utilisateurs</span><Badge variant="outline">{selectedTemplateInfo.stats.users}</Badge></div>
                <div className="flex items-center justify-between text-xs"><span className="text-gray-600">Satisfaction</span><Badge variant="outline">{selectedTemplateInfo.stats.satisfaction}</Badge></div>
                <div className="flex items-center justify-between text-xs"><span className="text-gray-600">Conversion</span><Badge className="bg-green-100 text-green-800">{selectedTemplateInfo.stats.conversion}</Badge></div>
                <div className="flex items-center justify-between text-xs"><span className="text-gray-600">Priorité</span><Badge className={selectedTemplateInfo.priorityColor}><selectedTemplateInfo.priorityIcon className="w-3 h-3 mr-1" />{selectedTemplateInfo.priority}</Badge></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-3">
        <Button variant="outline" onClick={onPrev} disabled={isLoading}>Précédent</Button>
        <Button onClick={handleNext} disabled={isLoading} className="bg-black hover:bg-gray-800 text-white">{isLoading ? 'Création en cours...' : 'Créer ma page'}</Button>
      </div>
    </div>
  )
}
