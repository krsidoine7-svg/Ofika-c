'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { ImageUploadFixed as ImageUpload } from "@/components/ui/image-upload-fixed"
import { ArrowLeft, ArrowRight } from "lucide-react"

const mediaSchema = z.object({
  image_url: z.union([z.string().url('URL invalide'), z.literal('')]).optional(),
  cover_image_url: z.union([z.string().url('URL invalide'), z.literal('')]).optional(),
})

type MediaData = z.infer<typeof mediaSchema>

interface MediaStepProps {
  initialData: any
  onNext: (data: Partial<any>) => void
  onPrev: () => void
  onSkip: () => void
  onChange?: (data: Partial<any>) => void
}

export function MediaStep({ initialData, onNext, onPrev, onSkip, onChange }: MediaStepProps) {
  const form = useForm<MediaData>({
    resolver: zodResolver(mediaSchema),
    defaultValues: {
      image_url: initialData?.image_url || '',
      cover_image_url: initialData?.cover_image_url || '',
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

  const onSubmit = (data: MediaData) => {
    onNext(data)
  }

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden">
      <div className="flex-shrink-0 mb-2">
        <h2 className="text-base sm:text-lg font-bold text-gray-900">Mettez-y un visage</h2>
        <p className="text-xs text-gray-500">Ajoutez une photo de profil et une couverture pour personnaliser votre page.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-2 py-1">
            <div className="grid grid-cols-2 gap-4 items-start">
              <FormField
                control={form.control}
                name="image_url"
                render={({ field }) => (
                  <FormItem className="flex flex-col items-start">
                    <FormLabel className="text-xs font-semibold mb-1">Photo de profil</FormLabel>
                    <FormControl>
                      <ImageUpload 
                        value={field.value || ''} 
                        onChange={field.onChange} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cover_image_url"
                render={({ field }) => (
                  <FormItem className="flex flex-col items-start">
                    <FormLabel className="text-xs font-semibold mb-1">Photo de couverture</FormLabel>
                    <FormControl>
                      <ImageUpload 
                        value={field.value || ''} 
                        onChange={field.onChange} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-3 mt-2 border-t bg-white flex-shrink-0 sticky bottom-0 z-10">
            <Button type="button" variant="outline" className="w-1/4 h-11" onClick={onPrev}>
              <ArrowLeft className="mr-2 h-5 w-5" />
            </Button>
            <Button type="button" variant="secondary" className="w-1/4 h-11" onClick={onSkip}>
              Plus tard
            </Button>
            <Button type="submit" className="w-1/2 h-11 text-base font-bold bg-orange-500 hover:bg-orange-600 text-white">
              Terminer <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

