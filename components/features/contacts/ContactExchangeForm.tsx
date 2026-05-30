'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/core/ui/dialog'
import { Button } from '@/components/core/ui/button'
import { Input } from '@/components/core/ui/input'
import { Label } from '@/components/core/ui/label'
import { Textarea } from '@/components/core/ui/textarea'
import { Loader2, Send, CheckCircle2, User, Mail, Phone, Building } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface ContactExchangeFormProps {
    profileId: string
    profileName: string
    isOpen: boolean
    onClose: () => void
    onSuccess?: () => void
}

export function ContactExchangeForm({
    profileId,
    profileName,
    isOpen,
    onClose,
    onSuccess
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.name || !formData.email || !formData.phone) {
            toast.error('Veuillez remplir les champs obligatoires (Nom, Email, Téléphone)')
            return
        }

        setLoading(true)
        const supabase = createClient()

        try {
            const { error } = await supabase.from('captured_contacts').insert({
                profile_id: profileId,
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                company: formData.company,
                job_title: formData.job_title,
                message: formData.message
            })

            if (error) throw error

            setSuccess(true)
            toast.success('Vos coordonnées ont été transmises !')

            // Lancer automatiquement le téléchargement de la fiche contact du profil
            // C'est un échange : "Je te donne mes infos, je reçois les tiennes"
            setTimeout(() => {
                const apiUrl = `${window.location.origin}/api/contacts/${profileId}`

                // SPÉCIFIQUE iOS : Navigation directe pour ouvrir Contacts
                if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                    window.location.href = apiUrl
                } else {
                    // Android/Desktop : Téléchargement invisible
                    const link = document.createElement('a')
                    link.href = apiUrl
                    link.download = `${profileName.replace(/\s+/g, '_')}.vcf`
                    document.body.appendChild(link)
                    link.click()
                    setTimeout(() => document.body.removeChild(link), 100)
                }
            }, 1000)

            // Reset form after delay
            setTimeout(() => {
                onSuccess?.()
                setSuccess(false)
                setFormData({ name: '', email: '', phone: '', company: '', job_title: '', message: '' })
                onClose()
            }, 3500)

        } catch (error) {
            console.error('Erreur envoi contact:', error)
            toast.error("Erreur lors de l'envoi. Veuillez réessayer.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto w-[95%] rounded-xl mx-auto">

                {success ? (
                    <div className="flex flex-col items-center justify-center py-10 space-y-4 text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 animate-in zoom-in">
                            <CheckCircle2 className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Merci !</h3>
                        <p className="text-gray-500 max-w-[260px]">
                            Vos coordonnées ont bien été partagées avec {profileName}.
                        </p>
                        <p className="text-sm text-blue-600 font-medium animate-pulse">
                            Téléchargement de la fiche contact...
                        </p>
                    </div>
                ) : (
                    <>
                        <DialogHeader>
                            <DialogTitle>Partager mes coordonnées</DialogTitle>
                            <DialogDescription>
                                Laissez vos infos à {profileName} pour rester en contact.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="flex items-center gap-2">
                                    <User className="w-3.5 h-3.5 text-gray-500" /> Nom complet *
                                </Label>
                                <Input
                                    id="name"
                                    name="name"
                                    type="text"
                                    autoComplete="name"
                                    placeholder="Jean Dupont"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="bg-gray-50/50"
                                    autoFocus
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="flex items-center gap-2">
                                        <Mail className="w-3.5 h-3.5 text-gray-500" /> Email *
                                    </Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        inputMode="email"
                                        autoComplete="email"
                                        placeholder="jean@exemple.com"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="bg-gray-50/50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone" className="flex items-center gap-2">
                                        <Phone className="w-3.5 h-3.5 text-gray-500" /> Téléphone *
                                    </Label>
                                    <Input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        inputMode="tel"
                                        autoComplete="tel"
                                        placeholder="06 12 34 56 78"
                                        required
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="bg-gray-50/50"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="company" className="flex items-center gap-2">
                                        <Building className="w-3.5 h-3.5 text-gray-500" /> Entreprise
                                    </Label>
                                    <Input
                                        id="company"
                                        name="company"
                                        autoComplete="organization"
                                        placeholder="Ma Société"
                                        value={formData.company}
                                        onChange={handleChange}
                                        className="bg-gray-50/50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="job_title" className="flex items-center gap-2">
                                        <Building className="w-3.5 h-3.5 text-gray-500" /> Poste
                                    </Label>
                                    <Input
                                        id="job_title"
                                        name="job_title"
                                        autoComplete="organization-title"
                                        placeholder="Directeur..."
                                        value={formData.job_title}
                                        onChange={handleChange}
                                        className="bg-gray-50/50"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="message">Message (optionnel)</Label>
                                <Textarea
                                    id="message"
                                    name="message"
                                    placeholder="Ravi de vous avoir rencontré..."
                                    className="resize-none bg-gray-50/50"
                                    rows={2}
                                    value={formData.message}
                                    onChange={handleChange}
                                />
                            </div>

                            <DialogFooter className="pt-4">
                                <Button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-medium py-6"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Envoi en cours...
                                        </>
                                    ) : (
                                        <>
                                            Envoyer mes coordonnées
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
