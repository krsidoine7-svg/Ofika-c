'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { ArrowLeft, ArrowRight, Mail, MapPin, Phone } from "lucide-react"

const contactSchema = z.object({
  email: z.string().email('Email invalide'),
  phone: z.string().min(8, 'Le numéro de téléphone est trop court').max(20, 'Le numéro est trop long'),
  location: z.string().max(100, 'La localisation ne peut pas dépasser 100 caractères').optional(),
})

type ContactData = z.infer<typeof contactSchema>

interface ContactStepProps {
  initialData: any
  onNext: (data: Partial<any>) => void
  onPrev: () => void
  onChange?: (data: Partial<any>) => void
}

export function ContactStep({ initialData, onNext, onPrev, onChange }: ContactStepProps) {
  const form = useForm<ContactData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      location: initialData?.location || '',
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

  const onSubmit = (data: ContactData) => {
    onNext(data)
  }

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden">
      <div className="flex-shrink-0 mb-2">
        <h2 className="text-base sm:text-lg font-bold text-gray-900">Comment vous joindre ?</h2>
        <p className="text-xs text-gray-500">Ajoutez vos coordonnées principales pour que l'on puisse vous contacter.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-2 space-y-4 py-1">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email professionnel <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input placeholder="contact@entreprise.com" className="pl-9" type="email" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Numéro de téléphone <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input placeholder="+225 01 02 03 04 05" className="pl-9" type="tel" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Localisation (optionnel)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input placeholder="Abidjan, Côte d'Ivoire" className="pl-9" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex gap-3 pt-3 mt-2 border-t bg-white flex-shrink-0 sticky bottom-0 z-10">
            <Button type="button" variant="outline" className="w-1/3 h-11" onClick={onPrev}>
              <ArrowLeft className="mr-2 h-5 w-5" /> Retour
            </Button>
            <Button type="submit" className="w-2/3 h-11 text-base font-bold bg-orange-500 hover:bg-orange-600 text-white">
              Suivant <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}


