'use client'

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
}

export function IdentityStep({ initialData, onNext }: IdentityStepProps) {
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

  const onSubmit = (data: IdentityData) => {
    // Generate full name for backward compatibility
    const fullName = [data.first_name, data.last_name].filter(Boolean).join(' ')
    
    onNext({
      ...data,
      name: fullName
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Commençons par les bases</h2>
        <p className="text-gray-500">Parlez-nous un peu de vous. Ces informations apparaîtront sur votre carte.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

          <Button type="submit" className="w-full h-12 text-lg">
            Suivant <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </form>
      </Form>
    </div>
  )
}
