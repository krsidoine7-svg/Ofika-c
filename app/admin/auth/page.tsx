'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/core/ui/card"
import { Button } from "@/components/core/ui/button"
import { Input } from "@/components/core/ui/input"
import { Label } from "@/components/core/ui/label"
import { ShieldCheck, Mail, Lock, Loader2, ArrowRight } from "lucide-react"
import { toast } from "sonner"

export default function AdminAuthPage() {
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [adminExists, setAdminExists] = useState<boolean | null>(null)
    const [mode, setMode] = useState<'login' | 'register'>('login')

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [name, setName] = useState('')

    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        async function checkStatus() {
            try {
                const res = await fetch('/api/admin/setup-status')
                const data = await res.json()
                if (data.success) {
                    setAdminExists(data.adminExists)
                    setMode(data.adminExists ? 'login' : 'register')
                }
            } catch (error) {
                console.error('Erreur check status:', error)
            } finally {
                setLoading(false)
            }
        }
        checkStatus()
    }, [])

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            })

            if (error) throw error

            // Vérifier si l'utilisateur est dans la table admin_users
            const { data: adminData } = await supabase
                .from('admin_users')
                .select('id')
                .eq('id', data.user.id)
                .single()

            if (!adminData) {
                toast.error('Accès refusé : vous n\'êtes pas dans la table administrateur.')
                await supabase.auth.signOut()
                setSubmitting(false)
                return
            }

            toast.success('Connexion réussie !')
            router.push('/dashboard/admin')
        } catch (error: any) {
            toast.error(error.message || 'Erreur lors de la connexion')
            setSubmitting(false)
        }
    }

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        if (password !== confirmPassword) {
            toast.error('Les mots de passe ne correspondent pas.')
            return
        }

        setSubmitting(true)

        try {
            // 1. Inscription Supabase
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { name }
                }
            })

            if (error) throw error
            if (!data.user) throw new Error('Utilisateur non créé.')

            // 2. Promotion en Admin via l'API sécurisée qui vérifie le count
            const promoteRes = await fetch('/api/admin/promote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: data.user.id })
            })

            const promoteData = await promoteRes.json()

            if (!promoteData.success) {
                throw new Error(promoteData.error || 'Erreur lors de la promotion admin.')
            }

            toast.success('Compte Administrateur créé avec succès !')
            router.push('/dashboard/admin')
        } catch (error: any) {
            toast.error(error.message || 'Erreur lors de la création du compte')
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-100/40 via-gray-50 to-gray-50">
            <div className="mb-8 text-center animate-in fade-in zoom-in duration-700">
                <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-orange-200">
                    <ShieldCheck className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-3xl font-black tracking-tight text-gray-900 uppercase">
                    OFIKA <span className="text-orange-500">ADMIN</span>
                </h1>
                <p className="text-gray-500 font-medium mt-1">Plateforme de Gestion Centralisée</p>
            </div>

            <Card className="w-full max-w-md border-none shadow-2xl rounded-3xl overflow-hidden animate-in slide-in-from-bottom-8 duration-700">
                <div className="h-2 w-full bg-orange-500"></div>
                <CardHeader className="text-center pb-2 pt-8">
                    <CardTitle className="text-2xl font-black uppercase text-gray-800 tracking-tight">
                        {(mode === 'register' && !adminExists) ? 'Configuration Initiale' : 'Accès Restreint'}
                    </CardTitle>
                    <CardDescription className="text-gray-400 font-medium italic">
                        {(mode === 'register' && !adminExists)
                            ? 'Créez le tout premier compte administrateur du système.'
                            : 'Connectez-vous pour accéder au panneau de contrôle.'}
                    </CardDescription>
                </CardHeader>

                <CardContent className="pt-6">
                    <form onSubmit={(mode === 'register' && !adminExists) ? handleRegister : handleLogin} className="space-y-4">
                        {(mode === 'register' && !adminExists) && (
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-xs uppercase font-bold text-gray-400 tracking-widest ml-1">Nom Complet</Label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <Input id="name" placeholder="John Doe" className="pl-10 h-12 rounded-xl focus:ring-orange-500 border-gray-100 bg-gray-50/30" value={name} onChange={(e) => setName(e.target.value)} required />
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-xs uppercase font-bold text-gray-400 tracking-widest ml-1">Email Professionnel</Label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    <Mail className="w-4 h-4" />
                                </div>
                                <Input id="email" type="email" placeholder="admin@ofika.com" className="pl-10 h-12 rounded-xl focus:ring-orange-500 border-gray-100 bg-gray-50/30" value={email} onChange={(e) => setEmail(e.target.value)} required />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-xs uppercase font-bold text-gray-400 tracking-widest ml-1">Mot de Passe</Label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    <Lock className="w-4 h-4" />
                                </div>
                                <Input id="password" type="password" placeholder="••••••••" className="pl-10 h-12 rounded-xl focus:ring-orange-500 border-gray-100 bg-gray-50/30" value={password} onChange={(e) => setPassword(e.target.value)} required />
                            </div>
                        </div>

                        {mode === 'register' && (
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword" className="text-xs uppercase font-bold text-gray-400 tracking-widest ml-1">Confirmer</Label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                        <Lock className="w-4 h-4" />
                                    </div>
                                    <Input id="confirmPassword" type="password" placeholder="••••••••" className="pl-10 h-12 rounded-xl focus:ring-orange-500 border-gray-100 bg-gray-50/30" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                                </div>
                            </div>
                        )}

                        <Button type="submit" disabled={submitting} className="w-full h-12 bg-gray-900 hover:bg-orange-600 text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-gray-200 mt-4 group">
                            {submitting ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    {mode === 'register' ? 'Créer le Dashboard' : 'Se Connecter'}
                                    <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 flex justify-center">
                        <button
                            type="button"
                            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                            className="text-xs font-bold text-orange-500 hover:text-orange-600 uppercase tracking-widest underline underline-offset-4"
                        >
                            {mode === 'login' ? "S'inscrire (Premier admin uniquement)" : "Déjà un compte ? Se connecter"}
                        </button>
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col items-center pb-8 pt-2">
                    <p className="text-[10px] text-gray-300 font-bold uppercase tracking-tighter text-center max-w-[280px]">
                        {mode === 'register'
                            ? "Une fois le compte créé, le mode inscription sera définitivement verrouillé."
                            : "Système de sécurité actif. Toutes les tentatives échouées sont journalisées."}
                    </p>
                </CardFooter>
            </Card>

            <div className="mt-8 flex items-center space-x-6 text-xs text-gray-400 font-bold uppercase tracking-widest">
                <div className="flex items-center"><div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></div>DB OK</div>
                <div className="flex items-center"><div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></div>SSL ACTIVE</div>
            </div>
        </div>
    )
}
