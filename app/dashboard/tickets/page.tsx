'use client'

import { useState, useEffect } from 'react'
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
  MapPin
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
import { useUser } from '@/lib/hooks/useUser'
import { useAuth } from '@/lib/hooks/useAuth'
import { toast } from 'sonner'

export default function UserTicketsPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all')
  
  // Modal Création
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [category, setCategory] = useState<'review' | 'suggestion' | 'bug' | 'support'>('review')
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [rating, setRating] = useState<number>(5)
  
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

  const { user } = useAuth()
  const { profiles } = useProfiles()
  const activeProfile = profiles[0]

  // Pré-remplissage des données depuis le profil actif
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
  const loadTickets = async () => {
    setIsLoading(true)
    const res = await getUserSupportTickets()
    if (res.success && res.data) {
      setTickets(res.data)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    loadTickets()
  }, [])

  // Ouvrir le chat d'un ticket
  const openTicketChat = async (ticket: SupportTicket) => {
    setActiveTicket(ticket)
    setIsLoadingMessages(true)
    const res = await getTicketMessages(ticket.id)
    if (res.success && res.data) {
      setMessages(res.data)
    }
    setIsLoadingMessages(false)
  }

  // Soumettre un nouveau ticket / avis
  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subject.trim() || !description.trim()) {
      toast.error('Veuillez remplir tous les champs obligatoires.')
      return
    }

    setIsSubmitting(true)
    const res = await createSupportTicket({
      category,
      subject,
      description,
      rating: category === 'review' ? rating : undefined,
      author_name: authorName,
      author_role: authorRole,
      author_location: authorLocation,
      author_avatar_url: activeProfile?.image_url || user?.user_metadata?.avatar_url
    })

    if (res.success) {
      toast.success(
        category === 'review'
          ? '🎉 Votre avis a été publié et ajouté à la page d’accueil !'
          : '✅ Votre demande a bien été envoyée au support Ofika !'
      )
      setIsCreateOpen(false)
      setSubject('')
      setDescription('')
      loadTickets()
    } else {
      toast.error(res.error || 'Erreur lors de l’envoi de la demande.')
    }
    setIsSubmitting(false)
  }

  // Envoyer un message dans la conversation
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !activeTicket) return

    setIsSendingMessage(true)
    const res = await replyToTicket(activeTicket.id, newMessage, false)
    if (res.success && res.data) {
      setMessages(prev => [...prev, res.data!])
      setNewMessage('')
    } else {
      toast.error(res.error || 'Échec de l’envoi du message')
    }
    setIsSendingMessage(false)
  }

  // Filtrer les tickets
  const filteredTickets = tickets.filter(t => {
    if (selectedCategoryFilter === 'all') return true
    return t.category === selectedCategoryFilter
  })

  // Formater les icônes de catégorie
  const renderCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'review':
        return (
          <Badge className="bg-amber-100 text-amber-900 border-amber-200 flex items-center gap-1.5 font-bold">
            <Star className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
            <span>Avis & Témoignage</span>
          </Badge>
        )
      case 'suggestion':
        return (
          <Badge className="bg-blue-100 text-blue-900 border-blue-200 flex items-center gap-1.5 font-bold">
            <Lightbulb className="w-3.5 h-3.5 text-blue-600" />
            <span>Suggestion</span>
          </Badge>
        )
      case 'bug':
        return (
          <Badge className="bg-red-100 text-red-900 border-red-200 flex items-center gap-1.5 font-bold">
            <Bug className="w-3.5 h-3.5 text-red-600" />
            <span>Signalement Bug</span>
          </Badge>
        )
      case 'support':
      default:
        return (
          <Badge className="bg-emerald-100 text-emerald-900 border-emerald-200 flex items-center gap-1.5 font-bold">
            <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Question / Support</span>
          </Badge>
        )
    }
  }

  // Statut Badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'resolved':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Résolu</Badge>
      case 'in_progress':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Répondu par le support</Badge>
      case 'closed':
        return <Badge className="bg-gray-100 text-gray-700 border-gray-200">Fermé</Badge>
      case 'open':
      default:
        return <Badge className="bg-blue-50 text-blue-700 border-blue-200">En attente</Badge>
    }
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* En-tête de la Page */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-emerald-900 via-teal-900 to-gray-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
            <LifeBuoy className="w-3.5 h-3.5" />
            <span>Assistance & Communauté Ofika</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Support, Suggestions & Avis</h1>
          <p className="text-emerald-100/80 text-sm max-w-xl">
            Partagez votre expérience sur Ofika, suggérez de nouvelles fonctionnalités ou échangez en direct avec notre équipe.
          </p>
        </div>

        <Button
          onClick={() => setIsCreateOpen(true)}
          className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black px-6 h-12 rounded-2xl shadow-lg transition-all flex items-center gap-2 shrink-0"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Laisser un Avis / Message</span>
        </Button>
      </div>

      {/* Barre de Filtres par Catégorie */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 pb-4">
        <Button
          variant={selectedCategoryFilter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedCategoryFilter('all')}
          className="rounded-xl font-bold text-xs"
        >
          Tous les messages ({tickets.length})
        </Button>
        <Button
          variant={selectedCategoryFilter === 'review' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedCategoryFilter('review')}
          className="rounded-xl font-bold text-xs flex items-center gap-1.5"
        >
          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
          Avis & Témoignages
        </Button>
        <Button
          variant={selectedCategoryFilter === 'suggestion' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedCategoryFilter('suggestion')}
          className="rounded-xl font-bold text-xs flex items-center gap-1.5"
        >
          <Lightbulb className="w-3.5 h-3.5 text-blue-500" />
          Suggestions
        </Button>
        <Button
          variant={selectedCategoryFilter === 'bug' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedCategoryFilter('bug')}
          className="rounded-xl font-bold text-xs flex items-center gap-1.5"
        >
          <Bug className="w-3.5 h-3.5 text-red-500" />
          Bugs & Problèmes
        </Button>
        <Button
          variant={selectedCategoryFilter === 'support' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedCategoryFilter('support')}
          className="rounded-xl font-bold text-xs flex items-center gap-1.5"
        >
          <HelpCircle className="w-3.5 h-3.5 text-emerald-500" />
          Questions Support
        </Button>
      </div>

      {/* Liste des Tickets */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <p className="text-sm font-medium">Chargement de vos échanges...</p>
        </div>
      ) : filteredTickets.length === 0 ? (
        <Card className="rounded-3xl border-dashed border-2 border-gray-200 text-center py-16 px-6">
          <CardContent className="space-y-4">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <LifeBuoy className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Aucun message pour le moment</h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              Vous n'avez pas encore envoyé d'avis ou de demande de support. Partagez votre expérience avec nous dès aujourd'hui !
            </p>
            <Button
              onClick={() => setIsCreateOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl"
            >
              Envoyer mon premier avis / message
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTickets.map(ticket => (
            <Card
              key={ticket.id}
              className="rounded-3xl border border-gray-200 hover:border-emerald-300 transition-all shadow-sm hover:shadow-md flex flex-col justify-between"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-gray-400 font-bold">{ticket.ticket_number}</span>
                    {renderCategoryBadge(ticket.category)}
                  </div>
                  {renderStatusBadge(ticket.status)}
                </div>

                <CardTitle className="text-base font-bold text-gray-900 leading-snug line-clamp-1">
                  {ticket.subject}
                </CardTitle>
                <CardDescription className="text-xs text-gray-500 line-clamp-2 mt-1">
                  {ticket.description}
                </CardDescription>

                {ticket.rating && (
                  <div className="flex items-center gap-1 mt-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < ticket.rating!
                            ? 'text-amber-500 fill-amber-400'
                            : 'text-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </CardHeader>

              <CardContent className="pt-0 border-t border-gray-100 mt-2 flex items-center justify-between">
                <span className="text-[11px] text-gray-400 flex items-center gap-1 font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(ticket.created_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openTicketChat(ticket)}
                  className="text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 font-bold text-xs flex items-center gap-1.5 rounded-xl"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Discussion</span>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal 1: Formulaire de Création Ticket / Avis */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-lg rounded-3xl p-6 sm:p-8">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-gray-900 flex items-center gap-2">
              <LifeBuoy className="w-6 h-6 text-emerald-600" />
              <span>Nouveau message ou Avis Ofika</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Choisissez le type de message que vous souhaitez transmettre à l'équipe.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateTicket} className="space-y-5 my-2">
            {/* Choix des 4 Catégories avec Icônes Lucide officielles */}
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-2">Catégorie du message</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCategory('review')}
                  className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                    category === 'review'
                      ? 'border-amber-500 bg-amber-50/80 text-amber-900 font-bold ring-2 ring-amber-400/20'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <Star className="w-5 h-5 text-amber-500 fill-amber-400 shrink-0" />
                  <div>
                    <p className="text-xs font-bold">Avis & Témoignage</p>
                    <p className="text-[10px] text-gray-500 font-normal">Donner une note</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setCategory('suggestion')}
                  className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                    category === 'suggestion'
                      ? 'border-blue-500 bg-blue-50/80 text-blue-900 font-bold ring-2 ring-blue-400/20'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <Lightbulb className="w-5 h-5 text-blue-500 shrink-0" />
                  <div>
                    <p className="text-xs font-bold">Suggestion</p>
                    <p className="text-[10px] text-gray-500 font-normal">Idée de fonction</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setCategory('bug')}
                  className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                    category === 'bug'
                      ? 'border-red-500 bg-red-50/80 text-red-900 font-bold ring-2 ring-red-400/20'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <Bug className="w-5 h-5 text-red-500 shrink-0" />
                  <div>
                    <p className="text-xs font-bold">Signalement Bug</p>
                    <p className="text-[10px] text-gray-500 font-normal">Problème technique</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setCategory('support')}
                  className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                    category === 'support'
                      ? 'border-emerald-500 bg-emerald-50/80 text-emerald-900 font-bold ring-2 ring-emerald-400/20'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <HelpCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-xs font-bold">Question Support</p>
                    <p className="text-[10px] text-gray-500 font-normal">Aide sur Ofika</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Sélecteur d'Étoiles si catégorie == review */}
            {category === 'review' && (
              <div className="bg-amber-50/60 border border-amber-200 p-4 rounded-2xl space-y-2">
                <label className="text-xs font-bold text-amber-900 block">Votre Note globale (1 à 5 étoiles)</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 hover:scale-125 transition-transform"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= rating
                            ? 'text-amber-500 fill-amber-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-amber-900 ml-2">{rating} / 5 étoiles</span>
                </div>
              </div>
            )}

            {/* Sujet */}
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Titre / Sujet</label>
              <Input
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="Ex: Mon retour d'expérience sur la carte NFC"
                className="rounded-xl text-sm"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Message détaillé</label>
              <Textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Ex pliquez en détails votre expérience ou votre suggestion..."
                className="rounded-xl text-sm min-h-[100px]"
                required
              />
            </div>

            {/* Informations Auteur Pré-remplies */}
            <div className="border-t border-gray-100 pt-3 space-y-3">
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Informations affichées sur votre avis (Pré-remplies)</p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] text-gray-500 font-bold block mb-0.5">Nom complet</label>
                  <Input
                    value={authorName}
                    onChange={e => setAuthorName(e.target.value)}
                    className="h-8 text-xs rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 font-bold block mb-0.5">Poste / Titre</label>
                  <Input
                    value={authorRole}
                    onChange={e => setAuthorRole(e.target.value)}
                    placeholder="Ex: Designer"
                    className="h-8 text-xs rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 font-bold block mb-0.5">Ville</label>
                  <Input
                    value={authorLocation}
                    onChange={e => setAuthorLocation(e.target.value)}
                    className="h-8 text-xs rounded-lg"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                className="rounded-xl text-xs"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-2"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Envoyer</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal 2: Discussion Chat du Ticket */}
      <Dialog open={!!activeTicket} onOpenChange={open => !open && setActiveTicket(null)}>
        <DialogContent className="sm:max-w-xl rounded-3xl p-6 flex flex-col h-[600px] max-h-[85vh]">
          {activeTicket && (
            <>
              <DialogHeader className="border-b border-gray-100 pb-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-mono text-gray-400 font-bold">{activeTicket.ticket_number}</span>
                  {renderStatusBadge(activeTicket.status)}
                </div>
                <DialogTitle className="text-lg font-bold text-gray-900 mt-1">
                  {activeTicket.subject}
                </DialogTitle>
              </DialogHeader>

              {/* Conteneur des Messages du Chat */}
              <div className="flex-1 overflow-y-auto p-2 space-y-3 custom-scrollbar">
                {isLoadingMessages ? (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                  </div>
                ) : messages.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-10">Aucun message pour le moment.</p>
                ) : (
                  messages.map(msg => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${msg.is_admin_reply ? 'items-start' : 'items-end'}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[10px] font-bold text-gray-500">
                          {msg.is_admin_reply ? '🛡️ Équipe Ofika' : 'Vous'}
                        </span>
                        <span className="text-[9px] text-gray-400">
                          {new Date(msg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div
                        className={`p-3.5 rounded-2xl text-xs max-w-[85%] leading-relaxed ${
                          msg.is_admin_reply
                            ? 'bg-emerald-900 text-white rounded-tl-none font-medium'
                            : 'bg-emerald-100 text-emerald-950 rounded-tr-none font-medium'
                        }`}
                      >
                        {msg.message}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Formulaire de réponse dans le Chat */}
              <form onSubmit={handleSendMessage} className="border-t border-gray-100 pt-3 flex items-center gap-2">
                <Input
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  placeholder="Écrivez votre réponse..."
                  className="rounded-xl text-xs h-10"
                />
                <Button
                  type="submit"
                  disabled={isSendingMessage || !newMessage.trim()}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl h-10 px-4 shrink-0"
                >
                  {isSendingMessage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
