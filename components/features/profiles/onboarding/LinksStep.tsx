'use client'

import { useState } from 'react'
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
}

export function LinksStep({ initialData, onNext, onPrev, onSkip }: LinksStepProps) {
  const form = useForm<LinksData>({
    resolver: zodResolver(linksSchema),
    defaultValues: {
      social_links: initialData?.social_links || [],
      custom_links: initialData?.custom_links || [],
    },
  })

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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Où vous retrouver en ligne ?</h2>
        <p className="text-gray-500">Ajoutez vos réseaux sociaux et vos liens professionnels.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          
          {/* Réseaux Sociaux */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold flex items-center"><MessageCircle className="w-5 h-5 mr-2"/> Réseaux Sociaux</h3>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => appendSocial({ platform: 'instagram', url: '' })}
              >
                <Plus className="w-4 h-4 mr-2" /> Ajouter
              </Button>
            </div>
            
            {socialFields.length === 0 && (
              <div className="text-sm text-gray-500 italic p-4 border border-dashed rounded-lg text-center">
                Aucun réseau social ajouté.
              </div>
            )}

            {socialFields.map((field, index) => (
              <div key={field.id} className="flex gap-2 items-start bg-gray-50 p-3 rounded-lg">
                <FormField
                  control={form.control}
                  name={`social_links.${index}.platform`}
                  render={({ field }) => (
                    <FormItem className="w-1/3">
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Plateforme" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SOCIAL_PLATFORMS.map(p => (
                            <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>
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
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input placeholder="https://..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => removeSocial(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Liens Personnalisés */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold flex items-center"><Globe className="w-5 h-5 mr-2"/> Autres Liens</h3>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => appendCustom({ title: '', url: '' })}
              >
                <Plus className="w-4 h-4 mr-2" /> Ajouter
              </Button>
            </div>
            
            {customFields.length === 0 && (
              <div className="text-sm text-gray-500 italic p-4 border border-dashed rounded-lg text-center">
                Aucun lien supplémentaire.
              </div>
            )}

            {customFields.map((field, index) => (
              <div key={field.id} className="flex gap-2 items-start bg-gray-50 p-3 rounded-lg">
                <FormField
                  control={form.control}
                  name={`custom_links.${index}.title`}
                  render={({ field }) => (
                    <FormItem className="w-1/3">
                      <FormControl>
                        <Input placeholder="Mon Site Web" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name={`custom_links.${index}.url`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <div className="relative">
                          <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input placeholder="https://..." className="pl-9" {...field} />
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
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => removeCustom(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="flex gap-4 pt-4 border-t">
            <Button type="button" variant="outline" className="w-1/4 h-12" onClick={onPrev}>
              <ArrowLeft className="mr-2 h-5 w-5" />
            </Button>
            <Button type="button" variant="secondary" className="w-1/4 h-12" onClick={onSkip}>
              Plus tard
            </Button>
            <Button type="submit" className="w-1/2 h-12 text-lg">
              Suivant <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
