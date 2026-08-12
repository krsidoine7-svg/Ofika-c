'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
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
  Eye
} from "lucide-react"

// Données d'exemple enrichies pour la prévisualisation Admin
const PREVIEW_PROFILE = {
  id: 'preview-admin-id',
  user_id: 'admin',
  profile_type: 'professional',
  name: 'Marie-Laure Koffi',
  bio: 'Directrice Design & Stratégie Digitale ✨ Conférencière Tech • Consultante B2B',
  image_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop',
  cover_image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop',
  custom_url: 'marielaure-koffi',
  username: 'marielaure-koffi',
  email: 'marielaure@ofika.ci',
  phone: '+225 07 08 09 10 11',
  location: 'Abidjan, Côte d\'Ivoire',
  whatsapp: '+225 07 08 09 10 11',
  facebook: 'https://facebook.com',
  instagram: 'https://instagram.com',
  twitter: 'https://twitter.com',
  youtube: 'https://youtube.com',
  tiktok: 'https://tiktok.com',
  website: 'https://ofika.ci',
  design_choice: 'design1',
  color_theme: 'default',
  is_active: true,
  display_reviews: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  social_links: [
    { type: 'linkedin', url: 'https://linkedin.com' },
    { type: 'instagram', url: 'https://instagram.com' },
    { type: 'whatsapp', url: 'https://wa.me/2250708091011' }
  ],
  links: [
    { id: '1', title: '🚀 Réserver une Consultation VIP', url: 'https://calendly.com', click_count: 142, position: 0, is_active: true, created_at: '', updated_at: '' },
    { id: '2', title: '📄 Télécharger mon Portfolio 2026', url: 'https://portfolio.ofika.ci', click_count: 89, position: 1, is_active: true, created_at: '', updated_at: '' },
    { id: '3', title: '🌐 Visiter le site officiel Ofika', url: 'https://ofika.ci', click_count: 310, position: 2, is_active: true, created_at: '', updated_at: '' }
  ]
}

// Les 8 templates officiels identiques à /onboarding/public-page
const templates = [
  {
    id: 'design1',
    name: 'Classique (Design 1)',
    description: 'Layout vertical épuré et professionnel',
    icon: Palette,
    color: 'blue',
    priority: 'Populaire',
    priorityIcon: Zap,
    priorityColor: 'bg-blue-100 text-blue-800',
    stats: { users: '65%', satisfaction: '4.8/5', conversion: '+12%' },
    targetAudience: 'Professionnels & Entreprises'
  },
  {
    id: 'design2',
    name: 'Design (Design 2)',
    description: 'Grille de cartes avec effets interactifs',
    icon: Star,
    color: 'purple',
    priority: 'Grille',
    priorityIcon: Zap,
    priorityColor: 'bg-purple-100 text-purple-800',
    stats: { users: '25%', satisfaction: '4.6/5', conversion: '+8%' },
    targetAudience: 'Créatifs & Designers'
  },
  {
    id: 'design3',
    name: 'Créatif (Design 3)',
    description: 'Effets visuels et animations avancées',
    icon: Sparkles,
    color: 'pink',
    priority: 'Artistique',
    priorityIcon: Zap,
    priorityColor: 'bg-pink-100 text-pink-800',
    stats: { users: '10%', satisfaction: '4.9/5', conversion: '+15%' },
    targetAudience: 'Artistes & Créatifs'
  },
  {
    id: 'design4',
    name: 'Nature (Design 4)',
    description: 'Style minimaliste avec couleurs naturelles',
    icon: Award,
    color: 'emerald',
    priority: 'Nouveau',
    priorityIcon: Zap,
    priorityColor: 'bg-emerald-100 text-emerald-800',
    stats: { users: '5%', satisfaction: '4.7/5', conversion: '+10%' },
    targetAudience: 'Minimalistes & Écologiques'
  },
  {
    id: 'influencer',
    name: 'Influenceur (Design 5)',
    description: 'Optimisé pour créateurs de contenu et influenceurs',
    icon: Users,
    color: 'rose',
    priority: 'Tendance',
    priorityIcon: TrendingUp,
    priorityColor: 'bg-gradient-to-r from-pink-500 to-rose-500 text-white',
    stats: { users: '15%', satisfaction: '4.8/5', conversion: '+18%' },
    targetAudience: 'Influenceurs & Créateurs'
  },
  {
    id: 'ecommerce',
    name: 'E-Commerce (Design 6)',
    description: 'Parfait pour vendeurs en ligne et boutiques',
    icon: Crown,
    color: 'amber',
    priority: 'Business',
    priorityIcon: Award,
    priorityColor: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white',
    stats: { users: '12%', satisfaction: '4.7/5', conversion: '+22%' },
    targetAudience: 'Vendeurs & E-commerçants'
  },
  {
    id: 'design7',
    name: 'Dark Elegant (Design 7)',
    description: 'Design sombre élégant avec fond dégradé',
    icon: Star,
    color: 'slate',
    priority: 'Premium',
    priorityIcon: Crown,
    priorityColor: 'bg-gradient-to-r from-slate-700 to-gray-900 text-white',
    stats: { users: '8%', satisfaction: '4.9/5', conversion: '+20%' },
    targetAudience: 'Créatifs & Photographes'
  },
  {
    id: 'freelance',
    name: 'Freelance (Design 8)',
    description: 'Optimisé pour freelances et solopreneurs africains',
    icon: Users,
    color: 'blue',
    priority: 'Professionnel',
    priorityIcon: TrendingUp,
    priorityColor: 'bg-gradient-to-r from-blue-500 to-orange-400 text-white',
    stats: { users: '18%', satisfaction: '4.8/5', conversion: '+16%' },
    targetAudience: 'Freelances & Solopreneurs'
  }
]

export default function AdminThemesOnboardingStylePage() {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('design1')

  const selectedTemplateInfo = templates.find(t => t.id === selectedTemplate) || templates[0]

  const renderPreview = (designId: string) => {
    const profile = { ...PREVIEW_PROFILE, design_choice: designId }

    switch (designId) {
      case 'design1': return <LinkInBioDesign1 profile={profile as any} showAddToContacts={true} isPreview={true} />
      case 'design2': return <LinkInBioDesign2 profile={profile as any} showAddToContacts={true} isPreview={true} />
      case 'design3': return <LinkInBioDesign3 profile={profile as any} showAddToContacts={true} isPreview={true} />
      case 'design4': return <LinkInBioDesign4 profile={profile as any} showAddToContacts={true} isPreview={true} />
      case 'influencer': return <LinkInBioInfluencer profile={profile as any} showAddToContacts={true} isPreview={true} />
      case 'ecommerce': return <LinkInBioEcommerce profile={profile as any} showAddToContacts={true} isPreview={true} />
      case 'design7': return <LinkInBioDesign7 profile={profile as any} showAddToContacts={true} isPreview={true} />
      case 'freelance': return <LinkInBioFreelance profile={profile as any} showAddToContacts={true} isPreview={true} />
      default: return <LinkInBioDesign1 profile={profile as any} showAddToContacts={true} isPreview={true} />
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-orange-100 text-orange-700 border-none font-bold text-xs uppercase px-2.5 py-0.5">
              Gestionnaire de Thèmes
            </Badge>
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Identique Onboarding</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <Palette className="w-7 h-7 sm:w-8 sm:h-8 text-orange-500 shrink-0" />
            Galerie & Aperçu des 8 Designs
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 font-medium leading-relaxed">
            Interface identique à <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono text-orange-600">/onboarding/public-page</code> pour tester et valider l'apparence des 8 thèmes.
          </p>
        </div>
      </div>

      {/* Interface Onboarding Style */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* COLONNE SÉLECTION VERTICALE - GAUCHE (7 COLONNES) */}
          <div className="col-span-12 lg:col-span-7 flex flex-col">
            <div>
              <h2 className="font-semibold text-base sm:text-lg mb-1">Choisissez un design</h2>
              <p className="text-xs text-gray-500 mb-4">Sélectionnez le design qui correspond le mieux et voyez l'aperçu en temps réel.</p>
            </div>

            {/* --- Select déroulant MOBILE --- */}
            <div className="lg:hidden mb-4">
              <Select value={selectedTemplate} onValueChange={(val) => setSelectedTemplate(val)}>
                <SelectTrigger className="w-full h-12 rounded-xl text-sm font-bold border-gray-200">
                  <SelectValue placeholder="Sélectionnez un design..." />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => {
                    const IconComponent = template.icon
                    return (
                      <SelectItem value={template.id} key={template.id}>
                        <span className="flex items-center gap-2 font-semibold">
                          <IconComponent className="h-4 w-4 text-orange-500" />
                          {template.name}
                        </span>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* --- Liste verticale DESKTOP --- */}
            <div className="hidden lg:flex flex-col gap-2.5">
              {templates.map(template => {
                const IconComponent = template.icon
                const isSelected = selectedTemplate === template.id
                return (
                  <Card
                    key={template.id}
                    className={`w-full border transition-all duration-200 px-3 shadow-none ${isSelected
                      ? 'ring-2 ring-gray-900 shadow-gray-100 border-gray-400 bg-gray-50/50'
                      : 'hover:shadow-gray-100 hover:shadow border-gray-200 cursor-pointer bg-white'
                      }`}
                    onClick={() => setSelectedTemplate(template.id)}
                  >
                    <CardHeader className="flex-row gap-3 items-center py-2 px-2">
                      <IconComponent className="h-4.5 w-4.5 text-orange-500" />
                      <div className="flex-1 font-bold text-gray-900 text-sm">{template.name}</div>
                      {isSelected && (
                        <Badge className="bg-black text-white ml-auto text-[10px]">
                          <CheckCircle className="w-2.5 h-2.5 mr-1" />
                          Sélectionné
                        </Badge>
                      )}
                    </CardHeader>
                    <CardContent className="py-1 px-2 pb-2">
                      <div className="flex flex-wrap items-center text-xs gap-3">
                        <span className="text-gray-600 truncate">{template.description}</span>
                        <Badge className={`capitalize text-[9px] ${template.priorityColor}`}>{template.priority}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Résumé/template et stats */}
            <div className="pt-4">
              <Card className="border border-gray-100 bg-gradient-to-br from-white to-gray-50/30 shadow-none">
                <CardHeader className="pb-1.5 pt-3 px-3">
                  <CardTitle className="flex items-center gap-1.5 text-sm">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    Pourquoi choisir le design {selectedTemplateInfo.name} ?
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-3 pb-3">
                  <div>
                    <div className="space-y-1 text-[11px] text-gray-600">
                      {selectedTemplateInfo.id === 'design1' && (<><p>• <strong>Idéal pour les professionnels</strong> et les entreprises</p><p>• <strong>Design épuré</strong> qui met en valeur vos informations</p><p>• <strong>Facile à lire</strong> sur tous les appareils</p></>)}
                      {selectedTemplateInfo.id === 'design2' && (<><p>• <strong>Design épuré</strong> et visuellement attractif</p><p>• <strong>Effets interactifs</strong> qui captent l'attention</p><p>• <strong>Grille organisée</strong> pour une navigation claire</p></>)}
                      {selectedTemplateInfo.id === 'design3' && (<><p>• <strong>Design unique</strong> qui vous démarque</p><p>• <strong>Effets visuels avancés</strong> et animations</p><p>• <strong>Glassmorphism moderne</strong> très tendance</p></>)}
                      {selectedTemplateInfo.id === 'design4' && (<><p>• <strong>Style minimaliste</strong> et élégant</p><p>• <strong>Couleurs naturelles</strong> apaisantes</p><p>• <strong>Layout moderne</strong> et épuré</p></>)}
                      {selectedTemplateInfo.id === 'influencer' && (<><p>• <strong>Réseaux sociaux en avant</strong> pour maximiser votre audience</p><p>• <strong>Grille visuelle</strong> pour contenus photo/vidéo</p><p>• <strong>Boutons d'action</strong> très visibles</p></>)}
                      {selectedTemplateInfo.id === 'ecommerce' && (<><p>• <strong>Mise en avant produits</strong> avec catalogue visuel</p><p>• <strong>Boutons d'achat</strong> optimisés pour la conversion</p></>)}
                      {selectedTemplateInfo.id === 'design7' && (<><p>• <strong>Design sombre élégant</strong> avec dégradé sophistiqué</p><p>• <strong>Photo circulaire</strong> mise en valeur au centre</p></>)}
                      {selectedTemplateInfo.id === 'freelance' && (<><p>• <strong>Palette chaleureuse</strong> et boutons CTA puissants</p><p>• <strong>Social proof intégré</strong> avec stats de confiance</p></>)}
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <div className="flex items-center justify-between text-[10px]"><span className="text-gray-500">Utilisateurs</span><Badge variant="outline" className="text-[9px] px-1 py-0">{selectedTemplateInfo.stats.users}</Badge></div>
                      <div className="flex items-center justify-between text-[10px]"><span className="text-gray-500">Satisfaction</span><Badge variant="outline" className="text-[9px] px-1 py-0">{selectedTemplateInfo.stats.satisfaction}</Badge></div>
                      <div className="flex items-center justify-between text-[10px]"><span className="text-gray-500">Conversion</span><Badge className="bg-green-100 text-green-800 text-[9px] px-1 py-0">{selectedTemplateInfo.stats.conversion}</Badge></div>
                      <div className="flex items-center justify-between text-[10px]"><span className="text-gray-500">Priorité</span><Badge className={`${selectedTemplateInfo.priorityColor} text-[9px] px-1 py-0`}><selectedTemplateInfo.priorityIcon className="w-2.5 h-2.5 mr-0.5" />{selectedTemplateInfo.priority}</Badge></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* COLONNE APERÇU APPAREIL MOBILE - DROITE (5 COLONNES) */}
          <div className="col-span-12 lg:col-span-5 flex flex-col items-center justify-center">
            <div className="flex flex-col items-center justify-center w-full">
              <h3 className="font-semibold text-center text-xs uppercase tracking-wider text-gray-400 mb-3 flex items-center justify-center gap-2">
                <Eye className="w-3.5 h-3.5" />
                Aperçu en temps réel sur smartphone
              </h3>

              <div className="w-[340px] sm:w-[360px] h-[700px] rounded-[2.5rem] overflow-y-auto overflow-x-hidden custom-scrollbar bg-white shadow-2xl border-[6px] border-neutral-900 relative">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedTemplate}
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.98 }}
                    transition={{ duration: 0.3 }}
                    className="min-h-full"
                  >
                    {renderPreview(selectedTemplate)}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Légende */}
              <div className="mt-3 flex flex-col items-center gap-1">
                <Badge className="bg-gray-900 text-white border-none px-3 py-1 text-xs font-bold">
                  Design : {selectedTemplateInfo.name}
                </Badge>
                <p className="text-[10px] text-gray-400 italic text-center max-w-[240px]">
                  Rendu identique à l'expérience d'onboarding <code className="text-orange-500 font-mono">/onboarding/public-page</code>.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
