'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Download,
  Loader2,
  Mail,
  Phone,
  Building,
  User,
  Search,
  Trash2,
  ArrowLeft,
  MessageSquare,
  MessageCircle,
  UserPlus,
  RotateCw,
  Eye,
  Calendar,
  Briefcase,
  ExternalLink,
  Users,
  Copy,
  Check
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'

interface Contact {
  id: string
  name: string
  email?: string | null
  phone?: string | null
  company?: string | null
  job_title?: string | null
  message?: string | null
  created_at: string
  profile_id: string
  profiles?: {
    id?: string
    name?: string
    username?: string
  } | null
}

type FilterTab = 'all' | 'with_phone' | 'with_company' | 'with_message'

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState<FilterTab>('all')
  const [selectedLead, setSelectedLead] = useState<Contact | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Dialogue de confirmation de suppression
  const [leadToDelete, setLeadToDelete] = useState<Contact | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const supabase = useMemo(() => createClient(), [])

  const fetchContacts = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true)
    else setIsRefreshing(true)

    try {
      const { data, error } = await supabase
        .from('captured_contacts')
        .select(`
          id,
          name,
          email,
          phone,
          company,
          job_title,
          message,
          created_at,
          profile_id,
          profiles (
            id,
            name,
            username
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setContacts((data as any) || [])
    } catch (err: any) {
      console.error('Error fetching contacts:', err)
      toast.error('Impossible de charger vos leads')
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchContacts()
  }, [fetchContacts])

  // Suppression d'un lead via modale
  const confirmDelete = async () => {
    if (!leadToDelete) return
    setIsDeleting(true)

    try {
      const { error } = await supabase
        .from('captured_contacts')
        .delete()
        .eq('id', leadToDelete.id)

      if (error) throw error

      toast.success('Contact supprimé avec succès')
      setContacts(prev => prev.filter(c => c.id !== leadToDelete.id))
      setLeadToDelete(null)
      if (selectedLead?.id === leadToDelete.id) {
        setIsDetailsOpen(false)
      }
    } catch (err) {
      toast.error('Erreur lors de la suppression')
    } finally {
      setIsDeleting(false)
    }
  }

  // Copier dans le presse-papiers
  const copyToClipboard = (text: string, id: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    toast.success(`${label} copié !`)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Télécharger la fiche vCard du prospect (1-clic vers le carnet d'adresses du téléphone)
  const downloadLeadVCard = (lead: Contact) => {
    const cleanName = (lead.name || 'Contact').trim()
    const nameParts = cleanName.split(/\s+/)
    const firstName = nameParts[0] || cleanName
    const lastName = nameParts.slice(1).join(' ') || ''

    const vcard = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `N:${lastName};${firstName};;;`,
      `FN:${cleanName}`,
      lead.company ? `ORG:${lead.company}` : null,
      lead.job_title ? `TITLE:${lead.job_title}` : null,
      lead.phone ? `TEL;TYPE=CELL,VOICE,PREF:${lead.phone.replace(/\s+/g, '')}` : null,
      lead.email ? `EMAIL;TYPE=INTERNET,WORK:${lead.email.trim()}` : null,
      lead.message ? `NOTE:${lead.message.replace(/\n/g, ' ')}` : null,
      'END:VCARD'
    ].filter(Boolean).join('\r\n')

    const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${cleanName.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '_')}.vcf`
    document.body.appendChild(link)
    link.click()
    setTimeout(() => {
      if (document.body.contains(link)) document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }, 300)
    toast.success(`Fiche contact de ${cleanName} téléchargée !`)
  }

  // Export CSV complet
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
        `"${(c.message || '').replace(/"/g, '""')}"`,
        `"${c.profiles?.name || 'Inconnu'}"`,
        `"${format(new Date(c.created_at), 'dd/MM/yyyy HH:mm')}"`
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `leads_ofika_${format(new Date(), 'yyyy-MM-dd')}.csv`
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 300)
    toast.success('Fichier CSV exporté avec succès')
  }

  // Nettoyage numéro pour WhatsApp
  const formatWhatsAppUrl = (phone?: string | null) => {
    if (!phone) return null
    let clean = phone.replace(/[^0-9]/g, '')
    if (clean.length === 10 && !clean.startsWith('225')) {
      clean = '225' + clean
    }
    return `https://wa.me/${clean}`
  }

  // Filtrage
  const filteredContacts = useMemo(() => {
    return contacts.filter(c => {
      const query = searchTerm.toLowerCase().trim()
      const matchesSearch = !query ||
        c.name.toLowerCase().includes(query) ||
        (c.company && c.company.toLowerCase().includes(query)) ||
        (c.email && c.email.toLowerCase().includes(query)) ||
        (c.phone && c.phone.includes(query)) ||
        (c.job_title && c.job_title.toLowerCase().includes(query))

      if (!matchesSearch) return false

      if (activeTab === 'with_phone') return Boolean(c.phone)
      if (activeTab === 'with_company') return Boolean(c.company)
      if (activeTab === 'with_message') return Boolean(c.message)

      return true
    })
  }, [contacts, searchTerm, activeTab])

  // KPIs
  const stats = useMemo(() => {
    const total = contacts.length
    const withPhone = contacts.filter(c => Boolean(c.phone)).length
    const withCompany = contacts.filter(c => Boolean(c.company)).length
    const latestDate = contacts[0]?.created_at
      ? format(new Date(contacts[0].created_at), 'dd MMM yyyy', { locale: fr })
      : 'Aucun'

    return { total, withPhone, withCompany, latestDate }
  }, [contacts])

  return (
    <div className="space-y-6 p-4 sm:p-6 md:p-8 pt-6 font-sans max-w-7xl mx-auto">
      {/* Fil d'Ariane & Bouton retour */}
      <div className="flex items-center gap-2 mb-1">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Retour au tableau de bord</span>
        </Link>
      </div>

      {/* Header Statutaire Apple/Linear */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Mes Leads & Contacts Réceptionnés
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Personnes ayant échangé leurs coordonnées après avoir scanné votre carte NFC ou QR Code.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            onClick={() => fetchContacts(true)}
            variant="outline"
            size="sm"
            disabled={isRefreshing}
            className="h-10 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold"
          >
            <RotateCw className={cn("w-3.5 h-3.5 mr-1.5", isRefreshing && "animate-spin")} />
            Actualiser
          </Button>

          <Button
            onClick={exportCSV}
            disabled={contacts.length === 0}
            className="h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs px-4"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Exporter CSV ({contacts.length})
          </Button>
        </div>
      </div>

      {/* 3 Bento KPI Cards Haute Précision */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Leads</span>
            <div className="text-2xl font-black text-slate-900 mt-0.5">{stats.total}</div>
            <span className="text-[10px] text-slate-500 mt-0.5 block">Contacts captés</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-900 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Joignables WhatsApp</span>
            <div className="text-2xl font-black text-emerald-600 mt-0.5">{stats.withPhone}</div>
            <span className="text-[10px] text-slate-500 mt-0.5 block">Avec numéro direct</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Phone className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Dernier Contact</span>
            <div className="text-sm font-bold text-slate-800 mt-1 truncate max-w-[180px]">{stats.latestDate}</div>
            <span className="text-[10px] text-slate-500 mt-0.5 block">{stats.withCompany} professionnels identifiés</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
            <Calendar className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Barre d'outils : Onglets de filtrage + Champ de recherche */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
        {/* Onglets segmentés épurés */}
        <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl self-start overflow-x-auto max-w-full">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap",
              activeTab === 'all'
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            Tous ({contacts.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('with_phone')}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1",
              activeTab === 'with_phone'
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            <span>Téléphone</span>
            <span className={cn("text-[10px] px-1.5 py-0.2 rounded-full", activeTab === 'with_phone' ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600")}>
              {stats.withPhone}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('with_company')}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1",
              activeTab === 'with_company'
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            <span>Entreprise</span>
            <span className={cn("text-[10px] px-1.5 py-0.2 rounded-full", activeTab === 'with_company' ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600")}>
              {stats.withCompany}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('with_message')}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap",
              activeTab === 'with_message'
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            Avec Message
          </button>
        </div>

        {/* Recherche instantanée */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
          <Input
            placeholder="Rechercher nom, email, téléphone, entreprise..."
            className="pl-9 h-10 text-xs bg-white border-slate-200 rounded-xl focus:border-slate-900 focus:ring-slate-900"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Conteneur principal des leads */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-slate-900 mb-3" />
            <p className="text-xs font-semibold text-slate-500">Chargement de vos contacts en direct...</p>
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
              <User className="h-7 w-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Aucun lead trouvé</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm leading-relaxed">
              {searchTerm || activeTab !== 'all'
                ? "Aucun contact ne correspond à votre filtre de recherche actuel."
                : "Partagez votre carte NFC ou votre QR Code lors de vos rendez-vous pour commencer à collecter des contacts en 1 seconde !"}
            </p>
          </div>
        ) : (
          <>
            {/* VUE TABLE (Grand écran PC & Tablette) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-slate-50/80 border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3.5">Prospect</th>
                    <th className="px-5 py-3.5">Coordonnées directes</th>
                    <th className="px-5 py-3.5">Entreprise / Titre</th>
                    <th className="px-5 py-3.5">Profil Source</th>
                    <th className="px-5 py-3.5">Date</th>
                    <th className="px-5 py-3.5 text-right">Actions rapides</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredContacts.map((contact) => {
                    const waUrl = formatWhatsAppUrl(contact.phone)

                    return (
                      <tr key={contact.id} className="hover:bg-slate-50/60 transition-colors">
                        {/* Prospect */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                              {contact.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <span className="font-bold text-slate-900 text-sm block truncate">
                                {contact.name}
                              </span>
                              {contact.job_title && (
                                <span className="text-[11px] text-slate-500 block truncate">
                                  {contact.job_title}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Coordonnées */}
                        <td className="px-5 py-4">
                          <div className="space-y-1">
                            {contact.phone && (
                              <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span>{contact.phone}</span>
                              </div>
                            )}
                            {contact.email && (
                              <div className="flex items-center gap-1.5 text-slate-500 truncate max-w-[220px]">
                                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span className="truncate">{contact.email}</span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Entreprise */}
                        <td className="px-5 py-4">
                          {contact.company ? (
                            <div className="flex items-center gap-1.5 text-slate-700 font-medium truncate max-w-[180px]">
                              <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate">{contact.company}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>

                        {/* Source */}
                        <td className="px-5 py-4">
                          <Badge variant="secondary" className="bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-semibold">
                            {contact.profiles?.name || 'Profil Ofika'}
                          </Badge>
                        </td>

                        {/* Date */}
                        <td className="px-5 py-4 text-slate-500 whitespace-nowrap text-[11px]">
                          {format(new Date(contact.created_at), 'dd MMM yyyy HH:mm', { locale: fr })}
                        </td>

                        {/* Actions 1-clic directes */}
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {/* WhatsApp 1-clic */}
                            {waUrl && (
                              <a
                                href={waUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Ouvrir WhatsApp"
                                className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 flex items-center justify-center transition-colors shadow-2xs"
                              >
                                <MessageCircle className="w-4 h-4" />
                              </a>
                            )}

                            {/* Appel 1-clic */}
                            {contact.phone && (
                              <a
                                href={`tel:${contact.phone}`}
                                title="Appeler"
                                className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center justify-center transition-colors"
                              >
                                <Phone className="w-3.5 h-3.5" />
                              </a>
                            )}

                            {/* Email 1-clic */}
                            {contact.email && (
                              <a
                                href={`mailto:${contact.email}`}
                                title="Envoyer un email"
                                className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center justify-center transition-colors"
                              >
                                <Mail className="w-3.5 h-3.5" />
                              </a>
                            )}

                            {/* Télécharger vCard dans mes contacts */}
                            <button
                              type="button"
                              onClick={() => downloadLeadVCard(contact)}
                              title="Ajouter à mes contacts (vCard)"
                              className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center justify-center transition-colors"
                            >
                              <UserPlus className="w-3.5 h-3.5" />
                            </button>

                            {/* Voir détails / Message */}
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedLead(contact)
                                setIsDetailsOpen(true)
                              }}
                              title="Voir les détails complets"
                              className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center justify-center transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* Supprimer */}
                            <button
                              type="button"
                              onClick={() => setLeadToDelete(contact)}
                              title="Supprimer ce lead"
                              className="w-8 h-8 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors ml-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* VUE MOBILE-FIRST (Cartes Bento tactiles sous le pouce) */}
            <div className="md:hidden divide-y divide-slate-100 p-2 space-y-2">
              {filteredContacts.map((contact) => {
                const waUrl = formatWhatsAppUrl(contact.phone)

                return (
                  <div key={contact.id} className="p-3.5 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-3">
                    {/* Header prospect */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-bold text-sm flex items-center justify-center shrink-0">
                          {contact.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-slate-900 truncate">{contact.name}</h3>
                          {contact.job_title && (
                            <p className="text-xs text-slate-500 truncate">{contact.job_title}</p>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setLeadToDelete(contact)}
                        className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Coordonnées rapides */}
                    <div className="space-y-1.5 text-xs text-slate-600 pt-1 border-t border-slate-100">
                      {contact.phone && (
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-800">{contact.phone}</span>
                          <span className="text-[10px] text-slate-400">Téléphone</span>
                        </div>
                      )}
                      {contact.email && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600 truncate max-w-[200px]">{contact.email}</span>
                          <span className="text-[10px] text-slate-400">Email</span>
                        </div>
                      )}
                      {contact.company && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-700 font-medium truncate max-w-[200px]">{contact.company}</span>
                          <span className="text-[10px] text-slate-400">Entreprise</span>
                        </div>
                      )}
                    </div>

                    {/* Message résumé si présent */}
                    {contact.message && (
                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-xs text-slate-600 line-clamp-2 italic">
                        &quot;{contact.message}&quot;
                      </div>
                    )}

                    {/* Boutons d'action tactile 1-clic */}
                    <div className="grid grid-cols-4 gap-1.5 pt-1">
                      {waUrl ? (
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="h-10 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs flex items-center justify-center gap-1 border border-emerald-200"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>WhatsApp</span>
                        </a>
                      ) : (
                        <div className="h-10 rounded-xl bg-slate-50 text-slate-300 flex items-center justify-center">
                          <MessageCircle className="w-4 h-4" />
                        </div>
                      )}

                      {contact.phone ? (
                        <a
                          href={`tel:${contact.phone}`}
                          className="h-10 rounded-xl bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center gap-1 border border-slate-200"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Appel</span>
                        </a>
                      ) : (
                        <div className="h-10 rounded-xl bg-slate-50 text-slate-300 flex items-center justify-center">
                          <Phone className="w-3.5 h-3.5" />
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => downloadLeadVCard(contact)}
                        className="h-10 rounded-xl bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center gap-1 border border-slate-200"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Contact</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedLead(contact)
                          setIsDetailsOpen(true)
                        }}
                        className="h-10 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Détails</span>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* Modal Détails Complets du Lead */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-slate-100">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white text-base font-bold flex items-center justify-center shadow-xs">
                {selectedLead?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-slate-900">
                  {selectedLead?.name}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  {selectedLead?.job_title
                    ? `${selectedLead.job_title} ${selectedLead.company ? `chez ${selectedLead.company}` : ''}`
                    : selectedLead?.company || 'Prospect enregistré'}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {selectedLead && (
            <div className="space-y-4 my-2 text-xs">
              {/* Coordonnées */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Coordonnées directes
                </span>

                {selectedLead.phone && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-800 font-semibold">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span>{selectedLead.phone}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(selectedLead.phone!, 'phone', 'Numéro de téléphone')}
                      className="text-slate-400 hover:text-slate-800 p-1"
                    >
                      {copiedId === 'phone' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                )}

                {selectedLead.email && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-700">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span>{selectedLead.email}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(selectedLead.email!, 'email', 'Adresse email')}
                      className="text-slate-400 hover:text-slate-800 p-1"
                    >
                      {copiedId === 'email' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                )}

                {selectedLead.company && (
                  <div className="flex items-center gap-2 text-slate-700">
                    <Building className="w-4 h-4 text-slate-400" />
                    <span>{selectedLead.company}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-slate-500 pt-1 text-[11px] border-t border-slate-200">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Capté le {format(new Date(selectedLead.created_at), 'dd MMMM yyyy à HH:mm', { locale: fr })}</span>
                </div>
              </div>

              {/* Message complet */}
              {selectedLead.message && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Message transmis
                  </span>
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-slate-700 text-xs leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
                    {selectedLead.message}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2">
            {selectedLead && (
              <Button
                type="button"
                onClick={() => downloadLeadVCard(selectedLead)}
                variant="outline"
                className="w-full sm:w-auto text-xs font-bold rounded-xl border-slate-200"
              >
                <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                Ajouter à mes contacts (.vcf)
              </Button>
            )}

            {selectedLead?.phone && formatWhatsAppUrl(selectedLead.phone) && (
              <a
                href={formatWhatsAppUrl(selectedLead.phone)!}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
              >
                <MessageCircle className="w-4 h-4 mr-1.5" />
                Ouvrir WhatsApp
              </a>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modale de Confirmation de Suppression Accessible (Élimination de window.confirm) */}
      <Dialog open={!!leadToDelete} onOpenChange={(open) => !open && setLeadToDelete(null)}>
        <DialogContent className="max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-100">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">
              Supprimer ce contact ?
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 mt-1">
              Êtes-vous sûr de vouloir supprimer définitivement le contact de <strong className="text-slate-800">{leadToDelete?.name}</strong> ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex items-center justify-end gap-2 pt-3">
            <Button
              type="button"
              variant="outline"
              disabled={isDeleting}
              onClick={() => setLeadToDelete(null)}
              className="text-xs font-bold rounded-xl border-slate-200"
            >
              Annuler
            </Button>
            <Button
              type="button"
              disabled={isDeleting}
              onClick={confirmDelete}
              className="text-xs font-bold rounded-xl bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Trash2 className="w-3.5 h-3.5 mr-1" />}
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
