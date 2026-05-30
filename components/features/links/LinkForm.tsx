"use client"

import { useState, useCallback, useId } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from "@/components/core/ui/button"
import { Input } from "@/components/core/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/core/ui/form"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

// Validation URL simplifiée et plus robuste
const linkSchema = z.object({
  title: z.string()
    .min(2, 'Le titre doit contenir au moins 2 caractères')
    .max(30, 'Le titre ne peut pas dépasser 30 caractères')
    .trim(),
  url: z.string()
    .url('URL invalide')
    .refine((url) => {
      try {
        const urlObj = new URL(url)
        return ['http:', 'https:'].includes(urlObj.protocol) && 
               urlObj.hostname.length > 0 &&
               !urlObj.hostname.includes('localhost') // Sécurité supplémentaire
      } catch {
        return false
      }
    }, 'L\'URL doit être valide et sécurisée'),
  position: z.enum(['1', '2']).transform(val => parseInt(val) as 1 | 2)
})

type LinkFormData = z.infer<typeof linkSchema>

interface LinkFormProps {
  profile_id: string
  onSuccess?: () => void
  onCancel?: () => void
  editingLink?: {
    id: string
    title: string
    url: string
    position: number
  }
}

export function LinkForm({ profile_id, onSuccess, onCancel, editingLink }: LinkFormProps) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  
  // IDs uniques pour l'accessibilité
  const formId = useId()
  const titleHelpId = `${formId}-title-help`
  const urlHelpId = `${formId}-url-help`
  const positionHelpId = `${formId}-position-help`
  const submitHelpId = `${formId}-submit-help`

  const form = useForm<LinkFormData>({
    resolver: zodResolver(linkSchema),
    defaultValues: {
      title: editingLink?.title || '',
      url: editingLink?.url || '',
      // Amélioration du type casting pour gérer tous les cas
      position: editingLink?.position === 2 ? 2 : editingLink?.position === 1 ? 1 : 1
    }
  })

  const onSubmit = useCallback(async (data: LinkFormData) => {
    try {
      setLoading(true)
      
      // Sanitisation des données
      const sanitizedData = {
        title: data.title.trim(),
        url: data.url.trim(),
        position: data.position
      }
      
      if (editingLink) {
        // Mise à jour
        const { error } = await supabase
          .from('links')
          .update({
            ...sanitizedData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingLink.id)

        if (error) throw error
        toast.success('Lien mis à jour avec succès')
      } else {
        // Création
        const { error } = await supabase
          .from('links')
          .insert({
            ...sanitizedData,
            profile_id: profile_id
          })

        if (error) throw error
        toast.success('Lien créé avec succès')
      }

      // Reset du formulaire après succès
      form.reset()
      onSuccess?.()
    } catch (error) {
      console.error('Error saving link:', error)
      
      // Messages d'erreur plus spécifiques basés sur le type d'erreur
      let errorMessage = 'Erreur lors de la sauvegarde du lien'
      
      if (error instanceof Error) {
        const errorMsg = error.message.toLowerCase()
        
        if (errorMsg.includes('url') || errorMsg.includes('invalid')) {
          errorMessage = 'URL invalide ou non sécurisée'
        } else if (errorMsg.includes('duplicate') || errorMsg.includes('unique')) {
          errorMessage = 'Un lien existe déjà à cette position'
        } else if (errorMsg.includes('permission') || errorMsg.includes('unauthorized')) {
          errorMessage = 'Vous n\'avez pas les permissions nécessaires'
        } else if (errorMsg.includes('network') || errorMsg.includes('timeout')) {
          errorMessage = 'Erreur de connexion. Veuillez réessayer.'
        } else if (errorMsg.includes('constraint') || errorMsg.includes('violation')) {
          errorMessage = 'Données invalides. Vérifiez vos informations.'
        }
      }
      
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [editingLink, profile_id, onSuccess, form, supabase])

  // Gestion du focus après soumission
  const handleCancel = useCallback(() => {
    form.reset()
    onCancel?.()
  }, [form, onCancel])

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
        noValidate
        aria-label="Formulaire de création ou modification de lien"
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Titre du lien *</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Ex: Mon site web" 
                  {...field} 
                  autoComplete="off"
                  aria-describedby={titleHelpId}
                  maxLength={30}
                />
              </FormControl>
              <FormMessage />
              <p id={titleHelpId} className="text-xs text-muted-foreground">
                {field.value?.length || 0}/30 caractères
              </p>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL *</FormLabel>
              <FormControl>
                <Input 
                  placeholder="https://exemple.com" 
                  type="url"
                  {...field}
                  autoComplete="url"
                  aria-describedby={urlHelpId}
                />
              </FormControl>
              <FormMessage />
              <p id={urlHelpId} className="text-xs text-muted-foreground">
                Doit commencer par http:// ou https://
              </p>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="position"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Position *</FormLabel>
              <FormControl>
                <select 
                  {...field}
                  value={field.value}
                  onChange={field.onChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-describedby={positionHelpId}
                >
                  <option value="1">Position 1</option>
                  <option value="2">Position 2</option>
                </select>
              </FormControl>
              <FormMessage />
              <p id={positionHelpId} className="text-xs text-muted-foreground">
                L'ordre d'affichage de vos liens
              </p>
            </FormItem>
          )}
        />

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            className="flex-1"
            disabled={loading}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="flex-1"
            aria-describedby={submitHelpId}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {editingLink ? 'Mettre à jour' : 'Créer le lien'}
          </Button>
        </div>
        <p id={submitHelpId} className="text-xs text-muted-foreground text-center">
          {loading ? 'Sauvegarde en cours...' : 'Cliquez pour sauvegarder votre lien'}
        </p>
      </form>
    </Form>
  )
}
