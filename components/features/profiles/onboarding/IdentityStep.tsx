'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { ArrowRight, Briefcase, User } from "lucide-react"

const identitySchema = z.object({
  last_name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').max(100, 'Le nom ne peut pas dépasser 100 caractères'),
  first_name: z.string().max(100, 'Le prénom ne peut pas dépasser 100 caractères').optional(),
  job_title: z.string().max(100, 'Le poste ne peut pas dépasser 100 caractères').optional(),
  company: z.string().max(100, 'L\'entreprise ne peut pas dépasser 100 caractères').optional(),
  bio: z.string().max(2048, 'La bio ne peut pas dépasser 2048 caractères').optional(),
})

type IdentityData = z.infer<typeof identitySchema>

interface IdentityStepProps {
  initialData: any
  onNext: (data: Partial<any>) => void
  onChange?: (data: Partial<any>) => void
}

export function IdentityStep({ initialData, onNext, onChange }: IdentityStepProps) {
  const form = useForm<IdentityData>({
    resolver: zodResolver(identitySchema),
    defaultValues: {
      last_name: initialData?.last_name || '',
      first_name: initialData?.first_name || '',
      job_title: initialData?.job_title || '',
      company: initialData?.company || '',
      bio: initialData?.bio || '',
    },
  })

  // Transmettre les modifications en temps réel au parent pour la prévisualisation en direct
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name && onChange) {
        const fullName = [value.first_name, value.last_name].filter(Boolean).join(' ')
        onChange({
          ...value,
          name: fullName
        })
      }
    })
    return () => subscription.unsubscribe()
  }, [form, onChange])

  const onSubmit = (data: IdentityData) => {
    // Generate full name for backward compatibility
    const fullName = [data.first_name, data.last_name].filter(Boolean).join(' ')
    
    onNext({
      ...data,
      name: fullName
    })
  }

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden">
      <div className="flex-shrink-0 mb-2">
        <h2 className="text-base sm:text-lg font-bold text-gray-900">Commençons par les bases</h2>
        <p className="text-xs text-gray-500">Parlez-nous un peu de vous. Ces informations apparaîtront sur votre carte.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-2 space-y-4 py-1">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prénom (optionnel)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input placeholder="Jean" className="pl-9" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input placeholder="Dupont" className="pl-9" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="job_title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Poste (optionnel)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input placeholder="Directeur Marketing" className="pl-9" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Entreprise (optionnel)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input placeholder="Ma Super Boîte" className="pl-9" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio (optionnelle)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Une courte phrase pour vous décrire..." 
                      className="resize-none" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="pt-3 mt-2 border-t bg-white flex-shrink-0 sticky bottom-0 z-10">
            <Button type="submit" className="w-full h-11 text-base font-bold bg-orange-500 hover:bg-orange-600 text-white">
              Suivant <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}


