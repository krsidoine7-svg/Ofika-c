'use client'

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
}

export function MediaStep({ initialData, onNext, onPrev, onSkip }: MediaStepProps) {
  const form = useForm<MediaData>({
    resolver: zodResolver(mediaSchema),
    defaultValues: {
      image_url: initialData?.image_url || '',
      cover_image_url: initialData?.cover_image_url || '',
    },
  })

  const onSubmit = (data: MediaData) => {
    onNext(data)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Mettez-y un visage</h2>
        <p className="text-gray-500">Ajoutez une photo de profil et une couverture pour personnaliser votre page.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="image_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Photo de profil</FormLabel>
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
                <FormItem>
                  <FormLabel>Photo de couverture</FormLabel>
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

          <div className="flex gap-4 pt-4 border-t">
            <Button type="button" variant="outline" className="w-1/4 h-12" onClick={onPrev}>
              <ArrowLeft className="mr-2 h-5 w-5" />
            </Button>
            <Button type="button" variant="secondary" className="w-1/4 h-12" onClick={onSkip}>
              Plus tard
            </Button>
            <Button type="submit" className="w-1/2 h-12 text-lg">
              Terminer <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
