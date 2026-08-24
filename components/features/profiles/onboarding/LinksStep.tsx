'use client'

import { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, ArrowRight, Plus, Trash2, Link as LinkIcon, Facebook, Instagram, Twitter, Youtube, Linkedin, Globe, MessageCircle } from "lucide-react"

const SOCIAL_PLATFORMS = [
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, placeholder: 'https://wa.me/...' },
  { id: 'facebook', label: 'Facebook', icon: Facebook, placeholder: 'https://facebook.com/...' },
  { id: 'instagram', label: 'Instagram', icon: Instagram, placeholder: 'https://instagram.com/...' },
  { id: 'twitter', label: 'Twitter', icon: Twitter, placeholder: 'https://twitter.com/...' },
  { id: 'youtube', label: 'YouTube', icon: Youtube, placeholder: 'https://youtube.com/...' },
  { id: 'linkedin', label: 'LinkedIn', icon: Linkedin, placeholder: 'https://linkedin.com/in/...' },
  { id: 'tiktok', label: 'TikTok', icon: MessageCircle, placeholder: 'https://tiktok.com/@...' },
]

const linksSchema = z.object({
  social_links: z.array(z.object({
    platform: z.string(),
    url: z.string().url('URL invalide')
  })).optional(),
  custom_links: z.array(z.object({
    title: z.string().min(1, 'Titre requis'),
    url: z.string().url('URL invalide')
  })).optional(),
})

type LinksData = z.infer<typeof linksSchema>

interface LinksStepProps {
  initialData: any
  onNext: (data: Partial<any>) => void
  onPrev: () => void
  onSkip: () => void
  onChange?: (data: Partial<any>) => void
}

export function LinksStep({ initialData, onNext, onPrev, onSkip, onChange }: LinksStepProps) {
  const form = useForm<LinksData>({
    resolver: zodResolver(linksSchema),
    defaultValues: {
      social_links: initialData?.social_links || [],
      custom_links: initialData?.custom_links || [],
    },
  })

  // Transmettre les modifications en temps réel au parent pour la prévisualisation en direct
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name && onChange) {
        onChange(value)
      }
    })
    return () => subscription.unsubscribe()
  }, [form, onChange])

  const { fields: socialFields, append: appendSocial, remove: removeSocial } = useFieldArray({
    control: form.control,
    name: "social_links"
  })

  const { fields: customFields, append: appendCustom, remove: removeCustom } = useFieldArray({
    control: form.control,
    name: "custom_links"
  })

  const onSubmit = (data: LinksData) => {
    onNext(data)
  }

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden">
      {/* En-tête fixe */}
      <div className="flex-shrink-0 mb-2">
        <h2 className="text-base sm:text-lg font-bold text-gray-900">Où vous retrouver en ligne ?</h2>
        <p className="text-xs text-gray-500">Ajoutez vos réseaux sociaux et vos liens professionnels.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 min-h-0 flex flex-col overflow-hidden">
          
          {/* Zone défilante (Scrollable) */}
          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-1.5 space-y-4 py-1">
            {/* Réseaux Sociaux */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-gray-800 flex items-center"><MessageCircle className="w-4 h-4 mr-1.5 text-orange-500"/> Réseaux Sociaux</h3>
                  <p className="text-[10px] text-gray-400">Maximum 4 réseaux sociaux</p>
                </div>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  className="h-7 px-2.5 text-xs font-semibold"
                  disabled={socialFields.length >= 4}
                  onClick={() => {
                    if (socialFields.length < 4) {
                      appendSocial({ platform: 'instagram', url: '' })
                    }
                  }}
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Ajouter ({socialFields.length}/4)
                </Button>
              </div>
              
              {socialFields.length === 0 && (
                <div className="text-xs text-gray-400 italic py-2 px-3 border border-dashed border-gray-200 rounded-md text-center bg-gray-50/50">
                  Aucun réseau social ajouté.
                </div>
              )}

              <div className="space-y-1.5">
                {socialFields.map((field, index) => (
                  <div key={field.id} className="flex gap-1.5 items-center bg-gray-50/90 p-1.5 rounded-lg border border-gray-200/70">
                    <FormField
                      control={form.control}
                      name={`social_links.${index}.platform`}
                      render={({ field }) => (
                        <FormItem className="space-y-0 w-28 sm:w-32 flex-shrink-0">
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-8 text-xs bg-white">
                                <SelectValue placeholder="Plateforme" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {SOCIAL_PLATFORMS.map(p => (
                                <SelectItem key={p.id} value={p.id} className="text-xs">{p.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name={`social_links.${index}.url`}
                      render={({ field }) => (
                        <FormItem className="space-y-0 flex-1 min-w-0">
                          <FormControl>
                            <Input placeholder="https://..." className="h-8 text-xs bg-white" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 flex-shrink-0"
                      onClick={() => removeSocial(index)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Liens Personnalisés */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-gray-800 flex items-center"><Globe className="w-4 h-4 mr-1.5 text-orange-500"/> Autres Liens</h3>
                  <p className="text-[10px] text-gray-400">Maximum 4 autres liens</p>
                </div>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  className="h-7 px-2.5 text-xs font-semibold"
                  disabled={customFields.length >= 4}
                  onClick={() => {
                    if (customFields.length < 4) {
                      appendCustom({ title: '', url: '' })
                    }
                  }}
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Ajouter ({customFields.length}/4)
                </Button>
              </div>
              
              {customFields.length === 0 && (
                <div className="text-xs text-gray-400 italic py-2 px-3 border border-dashed border-gray-200 rounded-md text-center bg-gray-50/50">
                  Aucun lien supplémentaire.
                </div>
              )}

              <div className="space-y-1.5">
                {customFields.map((field, index) => (
                  <div key={field.id} className="flex gap-1.5 items-center bg-gray-50/90 p-1.5 rounded-lg border border-gray-200/70">
                    <FormField
                      control={form.control}
                      name={`custom_links.${index}.title`}
                      render={({ field }) => (
                        <FormItem className="space-y-0 w-28 sm:w-32 flex-shrink-0">
                          <FormControl>
                            <Input placeholder="Mon Site Web" className="h-8 text-xs bg-white" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name={`custom_links.${index}.url`}
                      render={({ field }) => (
                        <FormItem className="space-y-0 flex-1 min-w-0">
                          <FormControl>
                            <div className="relative">
                              <LinkIcon className="absolute left-2.5 top-2 h-3.5 w-3.5 text-gray-400" />
                              <Input placeholder="https://..." className="h-8 text-xs pl-8 bg-white" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 flex-shrink-0"
                      onClick={() => removeCustom(index)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Barre de boutons d'action TOUJOURS visible (Sticky bottom) */}
          <div className="flex gap-3 pt-3 mt-2 border-t bg-white flex-shrink-0 sticky bottom-0 z-10">
            <Button type="button" variant="outline" className="w-1/4 h-10 text-sm" onClick={onPrev}>
              <ArrowLeft className="mr-1.5 h-4 w-4" />
            </Button>
            <Button type="button" variant="secondary" className="w-1/4 h-10 text-sm" onClick={onSkip}>
              Plus tard
            </Button>
            <Button type="submit" className="w-1/2 h-10 text-sm font-bold bg-orange-500 hover:bg-orange-600 text-white">
              Suivant <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

