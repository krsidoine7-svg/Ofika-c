'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { ProfileTemplateRenderer } from '@/components/features/profiles/ProfileTemplateRenderer'
import { TEMPLATES } from '@/lib/templates/registry'
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
  bio: 'Conférencière tech et consultante B2B. J’aide les marques à soigner leur image digitale.',
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
  design_choice: 'editorial',
  color_theme: 'default',
  is_active: true,
  display_reviews: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  job_title: 'Directrice Design & Stratégie',
  company: 'Studio Koffi',
  social_links: [
    { platform: 'linkedin', url: 'https://linkedin.com' },
    { platform: 'instagram', url: 'https://instagram.com' },
    { platform: 'whatsapp', url: 'https://wa.me/2250708091011' }
  ],
  custom_links: [
    { title: 'Réserver une consultation', url: 'https://calendly.com', type: 'appointment', description: 'Créneaux de 30 minutes' },
    { title: 'Télécharger mon portfolio', url: 'https://portfolio.ofika.ci', type: 'portfolio' },
    { title: 'Visiter le site officiel', url: 'https://ofika.ci', type: 'website' }
  ]
}

// Les 8 templates officiels (même liste que /onboarding/public-page)
const templates = TEMPLATES.map((t) => ({
  id: t.id as string,
  name: t.label,
  description: t.description,
  targetAudience: t.audience,
  icon: Sparkles,
  priority: 'Officiel',
  priorityColor: 'bg-orange-100 text-orange-800',
}))

export default function AdminThemesOnboardingStylePage() {
  const [selectedTemplate, setSelectedTemplate] = useState<string>(TEMPLATES[0].id)

  const selectedTemplateInfo = templates.find(t => t.id === selectedTemplate) || templates[0]

  const renderPreview = (designId: string) => {
    const profile = { ...PREVIEW_PROFILE, design_choice: designId }

    return <ProfileTemplateRenderer profile={profile} designId={designId} isPreview />
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
                      <p>• {selectedTemplateInfo.description}</p>
                      <p>• <strong>Pour :</strong> {selectedTemplateInfo.targetAudience}</p>
                      <p>• <strong>Couleurs</strong> personnalisables par l'utilisateur (fond + accent)</p>
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
