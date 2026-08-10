"use client"

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useUser } from '@/lib/hooks/useUser'
import { Loader2, Lock, Eye, EyeOff, Shield } from 'lucide-react'

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Mot de passe actuel requis'),
  newPassword: z.string().min(6, 'Le nouveau mot de passe doit contenir au moins 6 caractères'),
  confirmPassword: z.string().min(1, 'Confirmation requise'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
})

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>

export function ChangePasswordForm() {
  const { changePassword } = useUser()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  })

  const onSubmit = async (data: ChangePasswordFormData) => {
    setIsSubmitting(true)
    const success = await changePassword({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    })
    
    if (success) {
      reset()
    }
    
    setIsSubmitting(false)
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 md:p-8">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Mot de passe actuel */}
        <div className="space-y-2">
          <Label htmlFor="currentPassword">Mot de passe actuel *</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="currentPassword"
              type={showCurrentPassword ? "text" : "password"}
              {...register('currentPassword')}
              placeholder="Votre mot de passe actuel"
              className="pl-10 pr-10"
              disabled={isSubmitting}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              disabled={isSubmitting}
            >
              {showCurrentPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
          {errors.currentPassword && (
            <p className="text-sm text-red-500">{errors.currentPassword?.message as string}</p>
          )}
        </div>

        {/* Nouveau mot de passe */}
        <div className="space-y-2">
          <Label htmlFor="newPassword">Nouveau mot de passe *</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="newPassword"
              type={showNewPassword ? "text" : "password"}
              {...register('newPassword')}
              placeholder="Votre nouveau mot de passe"
              className="pl-10 pr-10"
              disabled={isSubmitting}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
              onClick={() => setShowNewPassword(!showNewPassword)}
              disabled={isSubmitting}
            >
              {showNewPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
          {errors.newPassword && (
            <p className="text-sm text-red-500">{errors.newPassword?.message as string}</p>
          )}
          <p className="text-xs text-gray-500">Minimum 6 caractères</p>
        </div>

        {/* Confirmer le nouveau mot de passe */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe *</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              {...register('confirmPassword')}
              placeholder="Confirmez votre nouveau mot de passe"
              className="pl-10 pr-10"
              disabled={isSubmitting}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={isSubmitting}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-red-500">{errors.confirmPassword?.message as string}</p>
          )}
        </div>

        {/* Bouton de soumission */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-12 bg-gray-900 hover:bg-black text-white rounded-xl shadow-md transition-all font-medium"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Changement en cours...
            </>
          ) : (
            'Mettre à jour le mot de passe'
          )}
        </Button>
      </form>
    </div>
  )
}
