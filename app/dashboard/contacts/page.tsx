'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Download, Loader2, Mail, Phone, Building, User, Search, Trash2, ArrowLeft } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import Link from 'next/link'

interface Contact {
    id: string
    name: string
    email: string
    phone: string
    company: string
    job_title: string
    message: string
    created_at: string
    profile_id: string
    profiles?: {
        name: string
    }
}

export default function ContactsPage() {
    const [contacts, setContacts] = useState<Contact[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    const supabase = createClient()

    const fetchContacts = async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('captured_contacts')
                .select(`
          *,
          profiles (
            name
          )
        `)
                .order('created_at', { ascending: false })

            if (error) throw error
            setContacts(data || [])
        } catch (err) {
            console.error('Error fetching contacts:', err)
            toast.error('Impossible de charger les contacts')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchContacts()
    }, [])

    const handleDelete = async (id: string) => {
        if (!confirm('Voulez-vous vraiment supprimer ce contact ?')) return

        try {
            const { error } = await supabase
                .from('captured_contacts')
                .delete()
                .eq('id', id)

            if (error) throw error

            toast.success('Contact supprimé')
            setContacts(contacts.filter(c => c.id !== id))
        } catch (err) {
            toast.error('Erreur lors de la suppression')
        }
    }

    const exportCSV = () => {
        const headers = ['Nom', 'Email', 'Téléphone', 'Entreprise', 'Poste', 'Message', 'Profil Source', 'Date']
        const csvContent = [
            headers.join(','),
            ...contacts.map(c => [
                `"${c.name}"`,
                `"${c.email || ''}"`,
                `"${c.phone || ''}"`,
                `"${c.company || ''}"`,
                `"${c.job_title || ''}"`,
                `"${c.message || ''}"`,
                `"${c.profiles?.name || 'Inconnu'}"`,
                `"${format(new Date(c.created_at), 'dd/MM/yyyy HH:mm')}"`
            ].join(','))
        ].join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `mes_leads_ofika_${format(new Date(), 'yyyy-MM-dd')}.csv`
        link.click()
    }

    const filteredContacts = contacts.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-6 p-4 sm:p-6 md:p-8 pt-6">
            {/* Bouton retour */}
            <div className="flex items-center gap-2 mb-2">
                <Link href="/dashboard">
                    <Button variant="ghost" size="sm" className="pl-0 text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Retour au Dashboard</span>
                        <span className="sm:hidden">Retour</span>
                    </Button>
                </Link>
            </div>

            {/* Header responsive */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Mes Leads</h2>
                    <p className="text-sm sm:text-base text-muted-foreground mt-1">
                        Contacts récupérés via vos cartes NFC et profils.
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <Button onClick={exportCSV} disabled={contacts.length === 0} variant="outline" className="w-full sm:w-auto">
                        <Download className="mr-2 h-4 w-4" />
                        Exporter CSV
                    </Button>
                    <Button onClick={fetchContacts} variant="default" className="w-full sm:w-auto">
                        Actualiser
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <CardTitle className="text-lg sm:text-xl">
                            Liste des contacts ({filteredContacts.length})
                        </CardTitle>
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Rechercher..."
                                className="pl-8"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                        </div>
                    ) : filteredContacts.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>Aucun contact capturé pour le moment.</p>
                            <p className="text-sm mt-2">Partagez votre carte NFC pour commencer à collecter des leads !</p>
                        </div>
                    ) : (
                        <>
                            {/* VERSION DESKTOP - TABLE */}
                            <div className="hidden lg:block rounded-md border overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left text-gray-500">
                                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                                            <tr>
                                                <th className="px-6 py-3 font-medium">Nom</th>
                                                <th className="px-6 py-3 font-medium">Coordonnées</th>
                                                <th className="px-6 py-3 font-medium">Entreprise</th>
                                                <th className="px-6 py-3 font-medium">Message</th>
                                                <th className="px-6 py-3 font-medium">Source</th>
                                                <th className="px-6 py-3 font-medium">Date</th>
                                                <th className="px-6 py-3 font-medium text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredContacts.map((contact) => (
                                                <tr key={contact.id} className="bg-white border-b hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-base font-medium text-gray-900">{contact.name}</span>
                                                            {contact.job_title && (
                                                                <span className="text-xs text-gray-500">{contact.job_title}</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="space-y-1 text-sm">
                                                            {contact.email && (
                                                                <div className="flex items-center gap-2">
                                                                    <Mail className="w-3 h-3 text-gray-400" />
                                                                    <a href={`mailto:${contact.email}`} className="hover:underline text-blue-600">
                                                                        {contact.email}
                                                                    </a>
                                                                </div>
                                                            )}
                                                            {contact.phone && (
                                                                <div className="flex items-center gap-2">
                                                                    <Phone className="w-3 h-3 text-gray-400" />
                                                                    <a href={`tel:${contact.phone}`} className="hover:underline text-gray-700">
                                                                        {contact.phone}
                                                                    </a>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {contact.company ? (
                                                            <div className="flex items-center gap-2">
                                                                <Building className="w-3 h-3 text-gray-400" />
                                                                {contact.company}
                                                            </div>
                                                        ) : '-'}
                                                    </td>
                                                    <td className="px-6 py-4 max-w-[200px] truncate" title={contact.message || ''}>
                                                        {contact.message || '-'}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <Badge variant="secondary" className="font-normal">
                                                            {contact.profiles?.name || 'Inconnu'}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {format(new Date(contact.created_at), 'dd MMM yyyy', { locale: fr })}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                                            onClick={() => handleDelete(contact.id)}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* VERSION MOBILE - CARDS */}
                            <div className="lg:hidden space-y-4">
                                {filteredContacts.map((contact) => (
                                    <Card key={contact.id} className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                        <CardContent className="p-4 space-y-3">
                                            {/* Header Card */}
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-base font-semibold text-gray-900 truncate">
                                                        {contact.name}
                                                    </h3>
                                                    {contact.job_title && (
                                                        <p className="text-sm text-gray-600 truncate">{contact.job_title}</p>
                                                    )}
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-9 w-9 min-h-[44px] min-w-[44px] -mr-2 text-red-500 hover:text-red-600 hover:bg-red-50 flex-shrink-0"
                                                    onClick={() => handleDelete(contact.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>

                                            {/* Coordonnées */}
                                            <div className="space-y-2">
                                                {contact.email && (
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                                        <a href={`mailto:${contact.email}`} className="hover:underline text-blue-600 truncate">
                                                            {contact.email}
                                                        </a>
                                                    </div>
                                                )}
                                                {contact.phone && (
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                                        <a href={`tel:${contact.phone}`} className="hover:underline text-gray-700">
                                                            {contact.phone}
                                                        </a>
                                                    </div>
                                                )}
                                                {contact.company && (
                                                    <div className="flex items-center gap-2 text-sm text-gray-700">
                                                        <Building className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                                        <span className="truncate">{contact.company}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Message */}
                                            {contact.message && (
                                                <div className="pt-2 border-t border-gray-100">
                                                    <p className="text-sm text-gray-600 line-clamp-2">
                                                        {contact.message}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Footer */}
                                            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                                <Badge variant="secondary" className="font-normal text-xs">
                                                    {contact.profiles?.name || 'Inconnu'}
                                                </Badge>
                                                <span className="text-xs text-gray-500">
                                                    {format(new Date(contact.created_at), 'dd MMM yyyy', { locale: fr })}
                                                </span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
