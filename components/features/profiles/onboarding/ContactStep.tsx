'use client'

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
}

export function ContactStep({ initialData, onNext, onPrev }: ContactStepProps) {
  const form = useForm<ContactData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      location: initialData?.location || '',
    },
  })

  const onSubmit = (data: ContactData) => {
    onNext(data)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Comment vous joindre ?</h2>
        <p className="text-gray-500">Ajoutez vos coordonnées principales pour que l'on puisse vous contacter.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          
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

          <div className="flex gap-4">
            <Button type="button" variant="outline" className="w-1/3 h-12" onClick={onPrev}>
              <ArrowLeft className="mr-2 h-5 w-5" /> Retour
            </Button>
            <Button type="submit" className="w-2/3 h-12 text-lg">
              Suivant <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
