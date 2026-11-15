'use client'

import { useState, useEffect, useRef } from 'react'
import {
  LifeBuoy,
  PlusCircle,
  Star,
  Lightbulb,
  Bug,
  HelpCircle,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  Send,
  Loader2,
  UserCheck,
  Building,
  MapPin,
  Search,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  Inbox,
  ShieldCheck,
  ArrowRight,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import {
  createSupportTicket,
  getUserSupportTickets,
  getTicketMessages,
  replyToTicket,
  SupportTicket,
  TicketMessage
} from '@/lib/services/support-tickets'
import { useProfiles } from '@/lib/hooks/useProfiles'
import { useAuth } from '@/lib/hooks/useAuth'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function UserTicketsPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Modal Création
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [category, setCategory] = useState<'review' | 'suggestion' | 'bug' | 'support'>('review')
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [rating, setRating] = useState<number>(5)
  const [hoverRating, setHoverRating] = useState<number | null>(null)

  // Informations Auteur (Pré-remplies)
  const [authorName, setAuthorName] = useState('')
  const [authorRole, setAuthorRole] = useState('')
  const [authorLocation, setAuthorLocation] = useState("Abidjan, Côte d'Ivoire")

  // Modal Chat / Discussion
  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null)
  const [messages, setMessages] = useState<TicketMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isSendingMessage, setIsSendingMessage] = useState(false)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const chatBottomRef = useRef<HTMLDivElement>(null)

  const { user } = useAuth()
  const { profiles } = useProfiles()
  const activeProfile = profiles[0]

  // Pré-remplissage des données depuis le profil actif ou le compte
  useEffect(() => {
    if (activeProfile) {
      if (activeProfile.name) setAuthorName(activeProfile.name)
      const role = (activeProfile as any).job_title || activeProfile.company
      if (role) setAuthorRole(role)
      if (activeProfile.location) setAuthorLocation(activeProfile.location)
    } else if (user) {
      setAuthorName(user.user_metadata?.name || user.email?.split('@')[0] || '')
    }
  }, [activeProfile, user])

  // Charger les tickets
  const loadTickets = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) setIsRefreshing(true)
    else setIsLoading(true)

    try {
      const res = await getUserSupportTickets()
      if (res.success && res.data) {
        setTickets(res.data)
      } else if (res.error) {
        console.error('Error loading tickets:', res.error)
      }
    } catch (err) {
      console.error('Failed to load tickets', err)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    loadTickets()
  }, [])

  // Faire défiler automatiquement vers le bas du chat lors de l'arrivée d'un message
  useEffect(() => {
    if (messages.length > 0 && chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  // Copier le numéro de ticket
  const handleCopyTicketNumber = (e: React.MouseEvent, num: string) => {
    e.stopPropagation()
    navigator.clipboard.writeText(num)
    setCopiedId(num)
    toast.success(`Numéro ${num} copié dans le presse-papier`)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Ouvrir le chat d'un ticket
  const openTicketChat = async (ticket: SupportTicket) => {
    setActiveTicket(ticket)
    setIsLoadingMessages(true)
    try {
      const res = await getTicketMessages(ticket.id)
      if (res.success && res.data) {
        setMessages(res.data)
      }
    } catch (err) {
      console.error('Failed to load messages', err)
      toast.error('Impossible de charger les messages de cette discussion.')
    } finally {
      setIsLoadingMessages(false)
    }
  }

  // Soumettre un nouveau ticket / avis
  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subject.trim() || !description.trim()) {
      toast.error('Veuillez renseigner un titre et une description.')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await createSupportTicket({
        category,
        subject: subject.trim(),
        description: description.trim(),
        rating: category === 'review' ? rating : undefined,
        author_name: authorName.trim() || undefined,
        author_role: authorRole.trim() || undefined,
        author_location: authorLocation.trim() || undefined,
        author_avatar_url: activeProfile?.image_url || user?.user_metadata?.avatar_url
      })

      if (res.success) {
        toast.success(
          category === 'review'
            ? '🎉 Merci ! Votre avis a été enregistré avec succès.'
            : '✅ Votre message a été transmis à l’équipe support Ofika !'
        )
        setIsCreateOpen(false)
        setSubject('')
        setDescription('')
        loadTickets(true)
      } else {
        toast.error(res.error || 'Erreur lors de l’envoi de votre demande.')
      }
    } catch (err: any) {
      toast.error(err?.message || 'Une erreur inattendue est survenue.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Envoyer un message dans la conversation
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !activeTicket) return

    const messageToSend = newMessage.trim()
    setIsSendingMessage(true)
    try {
      const res = await replyToTicket(activeTicket.id, messageToSend, false)
      if (res.success && res.data) {
        setMessages(prev => [...prev, res.data!])
        setNewMessage('')
        // Actualiser la liste de fond pour mettre à jour les statuts
        loadTickets(false)
      } else {
        toast.error(res.error || 'Échec de l’envoi du message.')
      }
    } catch (err: any) {
      toast.error(err?.message || 'Erreur lors de l’envoi du message.')
    } finally {
      setIsSendingMessage(false)
    }
  }

  // Filtrer les tickets selon la catégorie et la recherche
  const filteredTickets = tickets.filter(t => {
    const matchesCategory = selectedCategoryFilter === 'all' || t.category === selectedCategoryFilter
    const q = searchQuery.toLowerCase().trim()
    const matchesQuery = !q || 
      t.ticket_number.toLowerCase().includes(q) ||
      t.subject.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q)
    return matchesCategory && matchesQuery
  })

  // Compteurs pour les KPIs
  const totalCount = tickets.length
  const openCount = tickets.filter(t => t.status === 'open').length
  const inProgressCount = tickets.filter(t => t.status === 'in_progress').length
  const resolvedCount = tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length

  // Rendu de badge de catégorie luxueux
  const renderCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'review':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200/80 shadow-xs">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
            <span>Avis Client</span>
          </span>
        )
      case 'suggestion':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-800 border border-sky-200/80 shadow-xs">
            <Lightbulb className="w-3.5 h-3.5 text-sky-600" />
            <span>Suggestion</span>
          </span>
        )
      case 'bug':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200/80 shadow-xs">
            <Bug className="w-3.5 h-3.5 text-rose-600" />
            <span>Bug & Panne</span>
          </span>
        )
      case 'support':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-xs">
            <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Support</span>
          </span>
        )
    }
  }

  // Rendu de badge de statut
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'resolved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Résolu</span>
          </span>
        )
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>Réponse reçue</span>
          </span>
        )
      case 'closed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-neutral-100 text-neutral-600 border border-neutral-200">
            <span>Fermé</span>
          </span>
        )
      case 'open':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
            <span className="w-2 h-2 rounded-full bg-sky-500" />
            <span>En attente</span>
          </span>
        )
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 px-2 sm:px-4 overflow-x-hidden font-sans">
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

      {/* ==================================================================== */}
      {/* 1. EN-TÊTE ÉPURÉ APPLE / LINEAR                                     */}
      {/* ==================================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-neutral-100 border border-neutral-200/80 text-neutral-700 text-[11px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <LifeBuoy className="w-3 h-3 text-neutral-700" />
            <span>Assistance & Communauté Dédiée</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
            Support, Suggestions & Avis
          </h1>
          <p className="text-neutral-500 text-xs sm:text-sm max-w-xl leading-relaxed">
            Consultez l'historique de vos échanges, échangez en direct avec l'équipe Ofika ou soumettez un avis pour la communauté.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => loadTickets(true)}
            disabled={isRefreshing}
            className="h-9 px-3 rounded-xl border-neutral-200 text-neutral-700 hover:bg-neutral-50 font-medium text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", isRefreshing && "animate-spin text-orange-500")} />
            <span>Actualiser</span>
          </Button>

          <Button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="h-9 px-4 rounded-xl bg-neutral-950 hover:bg-neutral-900 text-white font-semibold text-xs shadow-md shadow-neutral-950/20 ring-1 ring-neutral-800 transition-all duration-200 flex items-center gap-2 cursor-pointer hover:scale-[1.01]"
          >
            <PlusCircle className="w-3.5 h-3.5 text-orange-400" />
            <span>Nouveau message / Avis</span>
          </Button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 2. STATS BENTO (KPIs) - FORMAT COMPACT & PROPORTIONNÉ                */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        <div className="bg-white rounded-xl border border-neutral-200/80 p-3 sm:p-3.5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Total Échanges</p>
            <p className="text-xl sm:text-2xl font-bold text-neutral-900 mt-0.5">{totalCount}</p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-700">
            <Inbox className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200/80 p-3 sm:p-3.5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-sky-600 uppercase tracking-wider">En attente</p>
            <p className="text-xl sm:text-2xl font-bold text-neutral-900 mt-0.5">{openCount}</p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center text-sky-600">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200/80 p-3 sm:p-3.5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Réponse reçue</p>
            <p className="text-xl sm:text-2xl font-bold text-neutral-900 mt-0.5">{inProgressCount}</p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
            <MessageSquare className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200/80 p-3 sm:p-3.5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Résolus</p>
            <p className="text-xl sm:text-2xl font-bold text-neutral-900 mt-0.5">{resolvedCount}</p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 3. BARRE DE FILTRES SEGMENTÉE SANS SCROLLBAR NATIVE                  */}
      {/* ==================================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        {/* Onglets segmentés avec surbrillance active et no-scrollbar */}
        <div className="w-full sm:w-auto overflow-x-auto no-scrollbar scrollbar-none py-0.5">
          <div className="inline-flex p-1 bg-neutral-100 rounded-xl border border-neutral-200/80 gap-1 shadow-inner">
            <button
              type="button"
              onClick={() => setSelectedCategoryFilter('all')}
              className={cn(
                "h-8 px-2.5 sm:px-3 text-[11px] font-semibold rounded-lg transition-all duration-200 flex items-center gap-1.5 cursor-pointer whitespace-nowrap",
                selectedCategoryFilter === 'all'
                  ? "bg-neutral-950 text-white shadow-sm ring-1 ring-neutral-800 scale-[1.01]"
                  : "text-neutral-600 hover:text-neutral-950 hover:bg-white/60"
              )}
            >
              <span>Tous</span>
              <span className={cn(
                "px-1.5 py-0.2 rounded-full text-[9px] font-bold",
                selectedCategoryFilter === 'all' ? "bg-white/20 text-white" : "bg-neutral-200 text-neutral-600"
              )}>
                {tickets.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedCategoryFilter('review')}
              className={cn(
                "h-8 px-2.5 sm:px-3 text-[11px] font-semibold rounded-lg transition-all duration-200 flex items-center gap-1.5 cursor-pointer whitespace-nowrap",
                selectedCategoryFilter === 'review'
                  ? "bg-neutral-950 text-white shadow-sm ring-1 ring-neutral-800 scale-[1.01]"
                  : "text-neutral-600 hover:text-neutral-950 hover:bg-white/60"
              )}
            >
              <Star className={cn("w-3 h-3", selectedCategoryFilter === 'review' ? "text-amber-400 fill-amber-400" : "text-amber-500")} />
              <span>Avis</span>
              <span className={cn(
                "px-1.5 py-0.2 rounded-full text-[9px] font-bold",
                selectedCategoryFilter === 'review' ? "bg-white/20 text-white" : "bg-neutral-200 text-neutral-600"
              )}>
                {tickets.filter(t => t.category === 'review').length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedCategoryFilter('suggestion')}
              className={cn(
                "h-8 px-2.5 sm:px-3 text-[11px] font-semibold rounded-lg transition-all duration-200 flex items-center gap-1.5 cursor-pointer whitespace-nowrap",
                selectedCategoryFilter === 'suggestion'
                  ? "bg-neutral-950 text-white shadow-sm ring-1 ring-neutral-800 scale-[1.01]"
                  : "text-neutral-600 hover:text-neutral-950 hover:bg-white/60"
              )}
            >
              <Lightbulb className={cn("w-3 h-3", selectedCategoryFilter === 'suggestion' ? "text-sky-300" : "text-sky-600")} />
              <span>Suggestions</span>
              <span className={cn(
                "px-1.5 py-0.2 rounded-full text-[9px] font-bold",
                selectedCategoryFilter === 'suggestion' ? "bg-white/20 text-white" : "bg-neutral-200 text-neutral-600"
              )}>
                {tickets.filter(t => t.category === 'suggestion').length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedCategoryFilter('bug')}
              className={cn(
                "h-8 px-2.5 sm:px-3 text-[11px] font-semibold rounded-lg transition-all duration-200 flex items-center gap-1.5 cursor-pointer whitespace-nowrap",
                selectedCategoryFilter === 'bug'
                  ? "bg-neutral-950 text-white shadow-sm ring-1 ring-neutral-800 scale-[1.01]"
                  : "text-neutral-600 hover:text-neutral-950 hover:bg-white/60"
              )}
            >
              <Bug className={cn("w-3 h-3", selectedCategoryFilter === 'bug' ? "text-rose-400" : "text-rose-600")} />
              <span>Bugs</span>
              <span className={cn(
                "px-1.5 py-0.2 rounded-full text-[9px] font-bold",
                selectedCategoryFilter === 'bug' ? "bg-white/20 text-white" : "bg-neutral-200 text-neutral-600"
              )}>
                {tickets.filter(t => t.category === 'bug').length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedCategoryFilter('support')}
              className={cn(
                "h-8 px-2.5 sm:px-3 text-[11px] font-semibold rounded-lg transition-all duration-200 flex items-center gap-1.5 cursor-pointer whitespace-nowrap",
                selectedCategoryFilter === 'support'
                  ? "bg-neutral-950 text-white shadow-sm ring-1 ring-neutral-800 scale-[1.01]"
                  : "text-neutral-600 hover:text-neutral-950 hover:bg-white/60"
              )}
            >
              <HelpCircle className={cn("w-3 h-3", selectedCategoryFilter === 'support' ? "text-emerald-400" : "text-emerald-600")} />
              <span>Questions</span>
              <span className={cn(
                "px-1.5 py-0.2 rounded-full text-[9px] font-bold",
                selectedCategoryFilter === 'support' ? "bg-white/20 text-white" : "bg-neutral-200 text-neutral-600"
              )}>
                {tickets.filter(t => t.category === 'support').length}
              </span>
            </button>
          </div>
        </div>

        {/* Champ de recherche compact */}
        <div className="relative w-full sm:w-56 shrink-0">
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <Input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Rechercher..."
            className="pl-8 pr-7 h-8 rounded-lg bg-white border-neutral-200 text-xs text-neutral-900 placeholder:text-neutral-400 shadow-xs focus-visible:ring-neutral-900"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-0.5 cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 4. LISTE DES TICKETS / AVIS                                          */}
      {/* ==================================================================== */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-neutral-400 gap-3">
          <Loader2 className="w-7 h-7 animate-spin text-neutral-900" />
          <p className="text-xs font-semibold text-neutral-500">Chargement de vos échanges sécurisés...</p>
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="bg-white rounded-3xl border-2 border-dashed border-neutral-200 text-center py-16 px-6 shadow-xs max-w-xl mx-auto space-y-4">
          <div className="w-14 h-14 bg-neutral-100 text-neutral-700 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <LifeBuoy className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-neutral-900">
              {searchQuery ? "Aucun échange ne correspond à votre recherche" : "Aucun message pour le moment"}
            </h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto leading-relaxed">
              {searchQuery
                ? "Essayez d'ajuster vos termes de recherche ou réinitialisez le filtre de catégorie."
                : "Vous n'avez pas encore envoyé d'avis ou de demande. Notre équipe est à votre écoute pour vous accompagner !"}
            </p>
          </div>
          {searchQuery ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => { setSearchQuery(''); setSelectedCategoryFilter('all'); }}
              className="rounded-xl text-xs"
            >
              Réinitialiser les filtres
            </Button>
          ) : (
            <Button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="bg-neutral-950 hover:bg-neutral-900 text-white text-xs font-semibold rounded-xl h-10 px-5 shadow-sm"
            >
              Laisser mon premier avis / message
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTickets.map(ticket => (
            <div
              key={ticket.id}
              className="bg-white rounded-2xl border border-neutral-200/80 hover:border-neutral-300 p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
            >
              {/* En-tête de la carte */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={(e) => handleCopyTicketNumber(e, ticket.ticket_number)}
                      className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-neutral-500 bg-neutral-100 hover:bg-neutral-200 px-2 py-0.5 rounded-lg transition-colors cursor-pointer"
                      title="Cliquer pour copier"
                    >
                      {copiedId === ticket.ticket_number ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3 text-neutral-400 group-hover:text-neutral-700" />
                      )}
                      <span>{ticket.ticket_number}</span>
                    </button>
                    {renderCategoryBadge(ticket.category)}
                  </div>

                  <div>
                    {renderStatusBadge(ticket.status)}
                  </div>
                </div>

                {/* Titre & Description */}
                <h3 className="text-base font-bold text-neutral-900 leading-snug line-clamp-1 group-hover:text-neutral-950">
                  {ticket.subject}
                </h3>
                <p className="text-xs text-neutral-500 line-clamp-2 mt-1.5 leading-relaxed">
                  {ticket.description}
                </p>

                {/* Étoiles si c'est un avis */}
                {ticket.rating && (
                  <div className="flex items-center gap-1 mt-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "w-4 h-4",
                          i < ticket.rating!
                            ? "text-amber-400 fill-amber-400"
                            : "text-neutral-200"
                        )}
                      />
                    ))}
                    <span className="text-xs font-bold text-neutral-700 ml-1.5">
                      {ticket.rating}/5
                    </span>
                  </div>
                )}

                {/* Info Auteur si affichée */}
                {ticket.author_name && (
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-neutral-100 text-[11px] text-neutral-500">
                    <span className="font-semibold text-neutral-700">{ticket.author_name}</span>
                    {ticket.author_role && <span>• {ticket.author_role}</span>}
                    {ticket.author_location && <span>• {ticket.author_location}</span>}
                  </div>
                )}
              </div>

              {/* Pied de carte */}
              <div className="flex items-center justify-between pt-4 mt-3 border-t border-neutral-100">
                <span className="text-[11px] text-neutral-400 flex items-center gap-1.5 font-medium">
                  <Clock className="w-3.5 h-3.5 text-neutral-400" />
                  {new Date(ticket.created_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => openTicketChat(ticket)}
                  className="text-neutral-900 hover:text-neutral-950 hover:bg-neutral-100 font-semibold text-xs flex items-center gap-1.5 rounded-xl h-8 px-3 cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-orange-500" />
                  <span>Discussion</span>
                  <ArrowRight className="w-3 h-3 text-neutral-400" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ==================================================================== */}
      {/* 5. MODAL DE CRÉATION DE TICKET / AVIS                                */}
      {/* ==================================================================== */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-xl rounded-3xl p-6 sm:p-8 bg-white border border-neutral-200 shadow-2xl">
          <DialogHeader className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-neutral-100 text-neutral-900">
                <LifeBuoy className="w-5 h-5 text-neutral-900" />
              </span>
              <DialogTitle className="text-xl font-extrabold text-neutral-900 tracking-tight">
                Nouveau message ou avis
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-neutral-500">
              Sélectionnez la catégorie appropriée pour orienter votre message directement vers le bon canal.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateTicket} className="space-y-5 my-2">
            {/* Sélecteur de catégorie stylisé */}
            <div>
              <label className="text-xs font-bold text-neutral-700 block mb-2">
                Type de message
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setCategory('review')}
                  className={cn(
                    "p-3 rounded-2xl border text-left flex items-start gap-3 transition-all duration-200 cursor-pointer",
                    category === 'review'
                      ? "border-amber-400 bg-amber-50/70 text-amber-950 ring-2 ring-amber-400/20 shadow-xs"
                      : "border-neutral-200/90 hover:border-neutral-300 bg-white text-neutral-700"
                  )}
                >
                  <div className="p-1.5 rounded-xl bg-amber-100/80 text-amber-700 shrink-0 mt-0.5">
                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-xs font-bold">Avis Client</p>
                    <p className="text-[10px] text-neutral-500 leading-tight mt-0.5">Partager mon retour avec une note</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setCategory('suggestion')}
                  className={cn(
                    "p-3 rounded-2xl border text-left flex items-start gap-3 transition-all duration-200 cursor-pointer",
                    category === 'suggestion'
                      ? "border-sky-400 bg-sky-50/70 text-sky-950 ring-2 ring-sky-400/20 shadow-xs"
                      : "border-neutral-200/90 hover:border-neutral-300 bg-white text-neutral-700"
                  )}
                >
                  <div className="p-1.5 rounded-xl bg-sky-100/80 text-sky-700 shrink-0 mt-0.5">
                    <Lightbulb className="w-4 h-4 text-sky-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold">Suggestion</p>
                    <p className="text-[10px] text-neutral-500 leading-tight mt-0.5">Proposer une nouvelle idée</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setCategory('bug')}
                  className={cn(
                    "p-3 rounded-2xl border text-left flex items-start gap-3 transition-all duration-200 cursor-pointer",
                    category === 'bug'
                      ? "border-rose-400 bg-rose-50/70 text-rose-950 ring-2 ring-rose-400/20 shadow-xs"
                      : "border-neutral-200/90 hover:border-neutral-300 bg-white text-neutral-700"
                  )}
                >
                  <div className="p-1.5 rounded-xl bg-rose-100/80 text-rose-700 shrink-0 mt-0.5">
                    <Bug className="w-4 h-4 text-rose-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold">Signaler un Bug</p>
                    <p className="text-[10px] text-neutral-500 leading-tight mt-0.5">Dysfonctionnement technique</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setCategory('support')}
                  className={cn(
                    "p-3 rounded-2xl border text-left flex items-start gap-3 transition-all duration-200 cursor-pointer",
                    category === 'support'
                      ? "border-emerald-400 bg-emerald-50/70 text-emerald-950 ring-2 ring-emerald-400/20 shadow-xs"
                      : "border-neutral-200/90 hover:border-neutral-300 bg-white text-neutral-700"
                  )}
                >
                  <div className="p-1.5 rounded-xl bg-emerald-100/80 text-emerald-700 shrink-0 mt-0.5">
                    <HelpCircle className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold">Question Support</p>
                    <p className="text-[10px] text-neutral-500 leading-tight mt-0.5">Aide sur votre compte ou carte</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Note étoiles interactive si Avis */}
            {category === 'review' && (
              <div className="bg-amber-50/60 border border-amber-200/80 p-4 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-amber-950">
                    Votre note globale
                  </label>
                  <span className="text-xs font-bold text-amber-800">
                    {rating === 5 ? "⭐⭐⭐⭐⭐ Excellent !" : `${rating} / 5 étoiles`}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map(star => {
                    const isFilled = (hoverRating !== null ? hoverRating : rating) >= star
                    return (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(null)}
                        onClick={() => setRating(star)}
                        className="p-1 hover:scale-125 transition-transform duration-150 cursor-pointer"
                      >
                        <Star
                          className={cn(
                            "w-7 h-7 transition-colors",
                            isFilled ? "text-amber-400 fill-amber-400" : "text-neutral-300"
                          )}
                        />
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Titre / Objet */}
            <div>
              <label className="text-xs font-bold text-neutral-700 block mb-1.5">
                Titre de votre demande <span className="text-rose-500">*</span>
              </label>
              <Input
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder={
                  category === 'review'
                    ? "Ex: Excellente qualité de la carte et du QR Code !"
                    : category === 'suggestion'
                    ? "Ex: Ajouter l'export vCard direct vers Outlook"
                    : category === 'bug'
                    ? "Ex: Problème d'affichage du logo sur mobile"
                    : "Ex: Comment commander une seconde carte NFC ?"
                }
                className="h-10 text-xs rounded-xl border-neutral-200/90 focus-visible:ring-neutral-900"
                required
              />
            </div>

            {/* Message détaillé */}
            <div>
              <label className="text-xs font-bold text-neutral-700 block mb-1.5">
                Message détaillé <span className="text-rose-500">*</span>
              </label>
              <Textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Décrivez avec précision votre retour d'expérience ou votre besoin afin que nous puissions vous répondre au mieux..."
                className="text-xs rounded-xl border-neutral-200/90 min-h-[110px] leading-relaxed focus-visible:ring-neutral-900"
                required
              />
            </div>

            {/* Informations Auteur Pré-remplies */}
            <div className="bg-neutral-50/80 border border-neutral-200/80 p-3.5 rounded-2xl space-y-2.5">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-neutral-500" />
                <span className="text-[11px] font-bold text-neutral-600 uppercase tracking-wider">
                  Signature publique (Pré-remplie)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] text-neutral-500 font-semibold block mb-0.5">Votre Nom</label>
                  <Input
                    value={authorName}
                    onChange={e => setAuthorName(e.target.value)}
                    placeholder="Nom complet"
                    className="h-8 text-xs rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-neutral-500 font-semibold block mb-0.5">Poste / Titre</label>
                  <Input
                    value={authorRole}
                    onChange={e => setAuthorRole(e.target.value)}
                    placeholder="Ex: Fondateur"
                    className="h-8 text-xs rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-neutral-500 font-semibold block mb-0.5">Ville</label>
                  <Input
                    value={authorLocation}
                    onChange={e => setAuthorLocation(e.target.value)}
                    placeholder="Ex: Abidjan"
                    className="h-8 text-xs rounded-lg bg-white"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="pt-2 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                className="rounded-xl text-xs h-10 px-4"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-neutral-950 hover:bg-neutral-900 text-white font-semibold rounded-xl text-xs h-10 px-5 flex items-center gap-2 shadow-md shadow-neutral-950/20"
              >
                {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Envoyer le message</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ==================================================================== */}
      {/* 6. MODAL DISCUSSION CHAT EN DIRECT                                   */}
      {/* ==================================================================== */}
      <Dialog open={!!activeTicket} onOpenChange={open => !open && setActiveTicket(null)}>
        <DialogContent className="sm:max-w-xl rounded-3xl p-6 flex flex-col h-[640px] max-h-[85vh] bg-white border border-neutral-200 shadow-2xl">
          {activeTicket && (
            <>
              {/* En-tête du Chat */}
              <DialogHeader className="border-b border-neutral-100 pb-3.5 shrink-0">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-md">
                      {activeTicket.ticket_number}
                    </span>
                    {renderCategoryBadge(activeTicket.category)}
                  </div>
                  <div>
                    {renderStatusBadge(activeTicket.status)}
                  </div>
                </div>

                <DialogTitle className="text-base font-bold text-neutral-900 leading-snug">
                  {activeTicket.subject}
                </DialogTitle>
                <DialogDescription className="text-[11px] text-neutral-400 flex items-center gap-1.5 pt-0.5">
                  <Clock className="w-3 h-3" />
                  <span>
                    Initié le {new Date(activeTicket.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </DialogDescription>
              </DialogHeader>

              {/* Fil de discussion */}
              <div className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-3.5 my-2 custom-scrollbar">
                {isLoadingMessages ? (
                  <div className="flex flex-col items-center justify-center h-full text-neutral-400 gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-neutral-900" />
                    <span className="text-xs">Chargement de la conversation...</span>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-12 text-neutral-400 space-y-2">
                    <MessageSquare className="w-8 h-8 mx-auto text-neutral-300" />
                    <p className="text-xs font-medium">Aucun échange supplémentaire pour le moment.</p>
                  </div>
                ) : (
                  messages.map(msg => (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex flex-col max-w-[85%]",
                        msg.is_admin_reply ? "items-start self-start" : "items-end self-end ml-auto"
                      )}
                    >
                      <div className="flex items-center gap-1.5 mb-1 px-1">
                        <span className={cn(
                          "text-[10px] font-bold",
                          msg.is_admin_reply ? "text-neutral-900" : "text-neutral-500"
                        )}>
                          {msg.is_admin_reply ? "🛡️ Équipe Ofika" : "Vous"}
                        </span>
                        <span className="text-[9px] text-neutral-400">
                          {new Date(msg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div
                        className={cn(
                          "p-3.5 rounded-2xl text-xs leading-relaxed shadow-xs",
                          msg.is_admin_reply
                            ? "bg-neutral-950 text-white rounded-tl-xs font-normal"
                            : "bg-neutral-100 text-neutral-900 rounded-tr-xs font-medium border border-neutral-200/80"
                        )}
                      >
                        {msg.message}
                      </div>
                    </div>
                  ))
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Formulaire d'envoi de réponse */}
              <form onSubmit={handleSendMessage} className="border-t border-neutral-100 pt-3 shrink-0 flex items-center gap-2">
                <Input
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  placeholder="Écrivez votre réponse..."
                  className="rounded-xl text-xs h-10 border-neutral-200 focus-visible:ring-neutral-900"
                  disabled={isSendingMessage}
                />
                <Button
                  type="submit"
                  disabled={isSendingMessage || !newMessage.trim()}
                  className="bg-neutral-950 hover:bg-neutral-900 text-white rounded-xl h-10 px-4 shrink-0 flex items-center justify-center cursor-pointer shadow-xs"
                >
                  {isSendingMessage ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 text-orange-400" />
                  )}
                </Button>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
