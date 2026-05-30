'use client'

import { useState } from 'react'
import { Button } from '@/components/core/ui/button'
import { Input } from '@/components/core/ui/input'
import { Label } from '@/components/core/ui/label'
import { useAuth } from '@/lib/hooks/useAuth'
import { toast } from 'sonner'
import { Loader2, Mail, User, Lock, Eye, EyeOff } from 'lucide-react'

interface SignupStepProps {
    formData: any
    onSuccess: () => void
    onPrev: () => void
    isLoading?: boolean
}

export function SignupStep({
    formData,
    onSuccess,
    onPrev,
    isLoading: externalLoading
}: SignupStepProps) {
    const { signUp } = useAuth()
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [internalLoading, setInternalLoading] = useState(false)

    const loading = externalLoading || internalLoading

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault()

        if (password.length < 6) {
            toast.error('Le mot de passe doit contenir au moins 6 caractères')
            return
        }

        setInternalLoading(true)
        try {
            // Pour une page publique, on utilise les clés attendues par le schéma profiles
            const { success, error } = await signUp(formData.email || formData.email_contact, password, {
                full_name: formData.name,
                company: formData.company,
                job_title: formData.job_title
            })

            if (success) {
                toast.success('Compte créé avec succès !')
                onSuccess()
            } else {
                toast.error(error?.message || 'Erreur lors de la création du compte')
            }
        } catch (err) {
            toast.error('Une erreur est survenue')
        } finally {
            setInternalLoading(false)
        }
    }

    return (
        <div className="space-y-6 max-w-md mx-auto py-4">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-gray-900">Créez votre compte</h2>
                <p className="text-gray-600">
                    Enregistrez votre progression et publiez votre page
                </p>
            </div>

            <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Nom complet</Label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            id="name"
                            value={formData.name}
                            disabled
                            className="pl-10 bg-gray-50 text-gray-500"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            id="email"
                            value={formData.email || formData.email_contact}
                            disabled
                            className="pl-10 bg-gray-50 text-gray-500"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="password">Mot de passe</Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="pl-10 pr-10"
                            autoComplete="new-password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                    <p className="text-[11px] text-gray-500">
                        6 caractères minimum
                    </p>
                </div>

                <div className="pt-4 flex flex-col gap-3">
                    <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 font-bold"
                        disabled={loading}
                    >
                        {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : null}
                        Créer mon compte et voir les designs
                    </Button>

                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onPrev}
                        disabled={loading}
                        className="w-full text-gray-500 italic text-sm"
                    >
                        Modifier mes informations
                    </Button>
                </div>
            </form>
        </div>
    )
}
