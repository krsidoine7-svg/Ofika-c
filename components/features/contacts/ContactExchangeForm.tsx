'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Send, CheckCircle2, User, Mail, Phone, Building } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface ContactExchangeFormProps {
    profileId?: string
    profileName: string
    isOpen: boolean
    onClose: () => void
    onSuccess?: () => void
    accentColor?: string
}

export function ContactExchangeForm({
    profileId,
    profileName,
    isOpen,
    onClose,
    onSuccess,
    accentColor
}: ContactExchangeFormProps) {
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
        job_title: '',
        message: ''
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const triggerVCardDownload = () => {
        if (!profileId) return
        const apiUrl = `${window.location.origin}/api/contacts/${encodeURIComponent(profileId)}`
        const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent)

        if (isIOS) {
            window.location.href = apiUrl
        } else {
            const link = document.createElement('a')
            link.href = apiUrl
            link.download = `${profileName.replace(/\s+/g, '_')}.vcf`
            document.body.appendChild(link)
            link.click()
            setTimeout(() => {
                if (document.body.contains(link)) document.body.removeChild(link)
            }, 300)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.name.trim()) {
            toast.error('Veuillez indiquer votre nom complet.')
            return
        }

        if (!formData.email.trim() && !formData.phone.trim()) {
            toast.error('Veuillez indiquer au moins un moyen de contact (Email ou Téléphone).')
            return
        }

        setLoading(true)
        const supabase = createClient()

        try {
            if (profileId) {
                const { error } = await supabase.from('captured_contacts').insert({
                    profile_id: profileId,
                    name: formData.name.trim(),
                    email: formData.email.trim() || null,
                    phone: formData.phone.trim() || null,
                    company: formData.company.trim() || null,
                    job_title: formData.job_title.trim() || null,
                    message: formData.message.trim() || null
                })

                if (error) {
                    console.warn('Erreur insertion contact:', error)
                }
            }

            setSuccess(true)
            toast.success('Vos coordonnées ont été transmises !')

            // Lancer le téléchargement réciproque de la fiche contact
            setTimeout(() => {
                triggerVCardDownload()
            }, 600)

            // Réinitialiser après confirmation
            setTimeout(() => {
                onSuccess?.()
            }, 1000)

        } catch (error) {
            console.error('Erreur envoi contact:', error)
            toast.error("Erreur lors de l'envoi. Veuillez réessayer.")
        } finally {
            setLoading(false)
        }
    }

    const handleClose = () => {
        setSuccess(false)
        setFormData({ name: '', email: '', phone: '', company: '', job_title: '', message: '' })
        onClose()
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto w-[95%] rounded-2xl mx-auto p-6 border-zinc-200 dark:border-zinc-800 shadow-2xl">

                {success ? (
                    <div className="flex flex-col items-center justify-center py-6 space-y-4 text-center">
                        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/40 rounded-full flex items-center justify-center animate-in zoom-in">
                            <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Coordonnées partagées !</h3>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-[280px]">
                            Vos coordonnées ont bien été transmises à <span className="font-semibold text-zinc-900 dark:text-zinc-200">{profileName}</span>.
                        </p>
                        
                        <div className="w-full pt-2 flex flex-col gap-2">
                            <Button
                                type="button"
                                onClick={triggerVCardDownload}
                                className="w-full py-5 rounded-xl font-medium bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 shadow-sm"
                            >
                                📇 Enregistrer la fiche de {profileName}
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={handleClose}
                                className="w-full text-zinc-500 hover:text-zinc-700"
                            >
                                Terminer
                            </Button>
                        </div>
                    </div>
                ) : (
                    <>
                        <DialogHeader className="text-left space-y-1">
                            <DialogTitle className="text-xl font-bold text-zinc-900 dark:text-white">Échanger mes coordonnées</DialogTitle>
                            <DialogDescription className="text-xs text-zinc-500 dark:text-zinc-400">
                                Transmettez vos coordonnées à <span className="font-medium text-zinc-800 dark:text-zinc-200">{profileName}</span> et recevez sa fiche contact en retour.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-3.5 mt-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="name" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                                    <User className="w-3.5 h-3.5 text-zinc-400" /> Nom complet *
                                </Label>
                                <Input
                                    id="name"
                                    name="name"
                                    type="text"
                                    autoComplete="name"
                                    placeholder="Ex : Jean Dupont"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 rounded-xl"
                                    autoFocus
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label htmlFor="phone" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                                        <Phone className="w-3.5 h-3.5 text-zinc-400" /> Téléphone
                                    </Label>
                                    <Input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        inputMode="tel"
                                        autoComplete="tel"
                                        placeholder="+33 6 12 34 56 78"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 rounded-xl"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="email" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                                        <Mail className="w-3.5 h-3.5 text-zinc-400" /> Email
                                    </Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        inputMode="email"
                                        autoComplete="email"
                                        placeholder="jean@exemple.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 rounded-xl"
                                    />
                                </div>
                            </div>
                            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 italic">
                                * Indiquez au moins votre numéro ou votre email.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label htmlFor="company" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                                        <Building className="w-3.5 h-3.5 text-zinc-400" /> Entreprise
                                    </Label>
                                    <Input
                                        id="company"
                                        name="company"
                                        autoComplete="organization"
                                        placeholder="Entreprise (optionnel)"
                                        value={formData.company}
                                        onChange={handleChange}
                                        className="bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 rounded-xl"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="job_title" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                                        <Building className="w-3.5 h-3.5 text-zinc-400" /> Fonction / Poste
                                    </Label>
                                    <Input
                                        id="job_title"
                                        name="job_title"
                                        autoComplete="organization-title"
                                        placeholder="Poste (optionnel)"
                                        value={formData.job_title}
                                        onChange={handleChange}
                                        className="bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 rounded-xl"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="message" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                                    Message (optionnel)
                                </Label>
                                <Textarea
                                    id="message"
                                    name="message"
                                    placeholder="Ravi de notre échange..."
                                    className="resize-none bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 rounded-xl text-sm"
                                    rows={2}
                                    value={formData.message}
                                    onChange={handleChange}
                                />
                            </div>

                            <DialogFooter className="pt-2">
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    style={accentColor ? { backgroundColor: accentColor } : undefined}
                                    className="w-full py-5 rounded-xl font-semibold bg-zinc-900 hover:bg-zinc-800 text-white shadow-md transition-all active:scale-[0.99]"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Transmission...
                                        </>
                                    ) : (
                                        <>
                                            Partager mes coordonnées
                                            <Send className="w-4 h-4 ml-2" />
                                        </>
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}
