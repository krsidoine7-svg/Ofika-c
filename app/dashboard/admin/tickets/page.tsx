'use client'

import { useState, useEffect } from 'react'
import {
  LifeBuoy,
  Star,
  Lightbulb,
  Bug,
  HelpCircle,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Send,
  Loader2,
  Eye,
  EyeOff,
  Globe,
  Sparkles,
  UserCheck,
  ShieldCheck,
  Download,
  FileSpreadsheet,
  FileJson
} from 'lucide-react'
import { exportTicketsToCSV, exportTicketsToJSON } from '@/lib/utils/export-tickets'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  getAllSupportTicketsForAdmin,
  getTicketMessages,
  replyToTicket,
  toggleTicketFeatured,
  updateTicketStatus,
  SupportTicket,
  TicketMessage
} from '@/lib/services/support-tickets'
import { AdminGuard } from '@/components/core/auth/AdminGuard'
import { toast } from 'sonner'

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  // Modal Chat / Discussion Admin
  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null)
  const [messages, setMessages] = useState<TicketMessage[]>([])
  const [adminReplyText, setAdminReplyText] = useState('')
  const [isReplying, setIsReplying] = useState(false)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)

  // Charger la liste des tickets pour l'admin
  const loadAdminTickets = async () => {
    setIsLoading(true)
    const res = await getAllSupportTicketsForAdmin({
      category: categoryFilter,
      status: statusFilter
    })
    if (res.success && res.data) {
      setTickets(res.data)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    loadAdminTickets()
  }, [categoryFilter, statusFilter])

  // Basculer la publication sur la Landing Page (is_featured)
  const handleToggleFeatured = async (ticket: SupportTicket, currentVal: boolean) => {
    const newVal = !currentVal
    const res = await toggleTicketFeatured(ticket.id, newVal)
    if (res.success) {
      setTickets(prev =>
        prev.map(t => (t.id === ticket.id ? { ...t, is_featured: newVal } : t))
      )
      toast.success(
        newVal
          ? '🌟 Avis publié sur la Landing Page !'
          : 'Masqué de la Landing Page'
      )
    } else {
      toast.error('Erreur lors de la modification')
    }
  }

  // Mettre à jour le statut
  const handleStatusChange = async (ticketId: string, newStatus: any) => {
    const res = await updateTicketStatus(ticketId, newStatus)
    if (res.success) {
      setTickets(prev =>
        prev.map(t => (t.id === ticketId ? { ...t, status: newStatus } : t))
      )
      toast.success('Statut mis à jour')
    } else {
      toast.error('Échec de la mise à jour')
    }
  }

  // Ouvrir le chat d'administration
  const openAdminChat = async (ticket: SupportTicket) => {
    setActiveTicket(ticket)
    setIsLoadingMessages(true)
    const res = await getTicketMessages(ticket.id)
    if (res.success && res.data) {
      setMessages(res.data)
    }
    setIsLoadingMessages(false)
  }

  // Envoyer la réponse de l'admin
  const handleSendAdminReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!adminReplyText.trim() || !activeTicket) return

    setIsReplying(true)
    const res = await replyToTicket(activeTicket.id, adminReplyText, true)
    if (res.success && res.data) {
      setMessages(prev => [...prev, res.data!])
      setAdminReplyText('')
      toast.success('Réponse envoyée et notification transmise à l’utilisateur !')
      loadAdminTickets()
    } else {
      toast.error(res.error || 'Erreur lors de l’envoi de la réponse')
    }
    setIsReplying(false)
  }

  // Recherche textuelle
  const filteredTickets = tickets.filter(t => {
    if (!searchTerm.trim()) return true
    const term = searchTerm.toLowerCase()
    return (
      t.ticket_number.toLowerCase().includes(term) ||
      t.subject.toLowerCase().includes(term) ||
      t.description.toLowerCase().includes(term) ||
      (t.author_name && t.author_name.toLowerCase().includes(term))
    )
  })

  // Statistiques Admin
  const totalCount = tickets.length
  const featuredCount = tickets.filter(t => t.is_featured).length
  const reviewsCount = tickets.filter(t => t.category === 'review').length
  const openCount = tickets.filter(t => t.status === 'open').length

  // Icône de catégorie
  const renderCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'review':
        return (
          <Badge className="bg-amber-100 text-amber-900 border-amber-200 flex items-center gap-1 font-bold">
            <Star className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
            <span>Avis</span>
          </Badge>
        )
      case 'suggestion':
        return (
          <Badge className="bg-blue-100 text-blue-900 border-blue-200 flex items-center gap-1 font-bold">
            <Lightbulb className="w-3.5 h-3.5 text-blue-600" />
            <span>Suggestion</span>
          </Badge>
        )
      case 'bug':
        return (
          <Badge className="bg-red-100 text-red-900 border-red-200 flex items-center gap-1 font-bold">
            <Bug className="w-3.5 h-3.5 text-red-600" />
            <span>Bug</span>
          </Badge>
        )
      case 'support':
      default:
        return (
          <Badge className="bg-emerald-100 text-emerald-900 border-emerald-200 flex items-center gap-1 font-bold">
            <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Support</span>
          </Badge>
        )
    }
  }

  return (
    <AdminGuard>
      <div className="space-y-8 p-4 sm:p-8 max-w-7xl mx-auto">
        {/* En-tête de la Page Admin */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Modération & Support Admin</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">Tickets, Suggestions & Avis Clients</h1>
            <p className="text-gray-400 text-sm max-w-xl">
              Gérez les demandes de support, répondez aux utilisateurs et publiez les avis certifiés sur la landing page.
            </p>
          </div>

          {/* Cartes Métriques Rapides */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-gray-800/80 border border-gray-700/60 p-3.5 rounded-2xl text-center">
              <p className="text-[10px] text-gray-400 uppercase font-bold">Total Messages</p>
              <p className="text-xl font-black text-white">{totalCount}</p>
            </div>
            <div className="bg-emerald-950/80 border border-emerald-700/60 p-3.5 rounded-2xl text-center">
              <p className="text-[10px] text-emerald-400 uppercase font-bold">Sur Landing Page</p>
              <p className="text-xl font-black text-emerald-300">{featuredCount}</p>
            </div>
            <div className="bg-amber-950/80 border border-amber-700/60 p-3.5 rounded-2xl text-center">
              <p className="text-[10px] text-amber-400 uppercase font-bold">Avis Client ⭐</p>
              <p className="text-xl font-black text-amber-300">{reviewsCount}</p>
            </div>
            <div className="bg-blue-950/80 border border-blue-700/60 p-3.5 rounded-2xl text-center">
              <p className="text-[10px] text-blue-400 uppercase font-bold">En Attente</p>
              <p className="text-xl font-black text-blue-300">{openCount}</p>
            </div>
          </div>
        </div>

        {/* Barre de Recherche & Filtres */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <Input
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Rechercher par #ticket, sujet, nom..."
              className="pl-9 rounded-xl text-xs"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Filtre Catégorie */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-44 rounded-xl text-xs">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes catégories</SelectItem>
                <SelectItem value="review">⭐ Avis Client</SelectItem>
                <SelectItem value="suggestion">💡 Suggestion</SelectItem>
                <SelectItem value="bug">🐛 Bug</SelectItem>
                <SelectItem value="support">❓ Support</SelectItem>
              </SelectContent>
            </Select>

            {/* Filtre Statut */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40 rounded-xl text-xs">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous statuts</SelectItem>
                <SelectItem value="open">En attente</SelectItem>
                <SelectItem value="in_progress">En cours</SelectItem>
                <SelectItem value="resolved">Résolu</SelectItem>
                <SelectItem value="closed">Fermé</SelectItem>
              </SelectContent>
            </Select>

            {/* Boutons Export Excel & JSON */}
            <div className="flex items-center gap-1.5 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  exportTicketsToCSV(filteredTickets)
                  toast.success(`📥 Export Excel CSV (${filteredTickets.length} éléments) téléchargé !`)
                }}
                disabled={filteredTickets.length === 0}
                className="rounded-xl text-xs font-semibold gap-1.5 border-emerald-200 text-emerald-800 hover:bg-emerald-50"
                title="Exporter pour Microsoft Excel / Tableur"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span className="hidden sm:inline">Export Excel</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  exportTicketsToJSON(filteredTickets)
                  toast.success(`📥 Export JSON (${filteredTickets.length} éléments) téléchargé !`)
                }}
                disabled={filteredTickets.length === 0}
                className="rounded-xl text-xs font-semibold gap-1.5 border-blue-200 text-blue-800 hover:bg-blue-50"
                title="Exporter au format JSON structuré"
              >
                <FileJson className="w-4 h-4 text-blue-600" />
                <span className="hidden sm:inline">Export JSON</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Tableau / Liste des Tickets */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-gray-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            <p className="text-sm font-medium">Chargement des données d'administration...</p>
          </div>
        ) : filteredTickets.length === 0 ? (
          <Card className="rounded-3xl text-center py-12">
            <p className="text-gray-500 text-sm font-medium">Aucune demande correspondant à vos critères.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredTickets.map(ticket => (
              <Card
                key={ticket.id}
                className="rounded-3xl border border-gray-200 hover:border-emerald-300 transition-all shadow-sm"
              >
                <CardContent className="p-5 sm:p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Auteur & Informations */}
                    <div className="flex items-start gap-4 flex-1">
                      <Avatar className="w-12 h-12 border-2 border-emerald-100 shrink-0">
                        <AvatarImage src={ticket.author_avatar_url || ''} />
                        <AvatarFallback className="bg-emerald-100 text-emerald-800 font-bold text-sm">
                          {(ticket.author_name || 'U').substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-mono text-gray-400 font-bold">{ticket.ticket_number}</span>
                          {renderCategoryBadge(ticket.category)}
                          <span className="text-xs font-bold text-gray-900">{ticket.author_name || 'Utilisateur'}</span>
                          {ticket.author_role && (
                            <span className="text-xs text-gray-500">• {ticket.author_role}</span>
                          )}
                          {ticket.author_location && (
                            <span className="text-xs text-gray-400">({ticket.author_location})</span>
                          )}
                        </div>

                        <h3 className="text-base font-bold text-gray-900 leading-snug">{ticket.subject}</h3>
                        <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{ticket.description}</p>

                        {ticket.rating && (
                          <div className="flex items-center gap-1 mt-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${
                                  i < ticket.rating!
                                    ? 'text-amber-500 fill-amber-400'
                                    : 'text-gray-200'
                                }`}
                              />
                            ))}
                            <span className="text-[11px] font-bold text-amber-800 ml-1.5">{ticket.rating}/5</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions Modération & Statut */}
                    <div className="flex flex-wrap items-center gap-3 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-gray-100">
                      {/* Interrupteur Affichage Landing Page (UNIQUEMENT pour la catégorie avis/review) */}
                      {ticket.category === 'review' && (
                        <div className="flex items-center gap-2 bg-emerald-50/70 border border-emerald-200/80 px-3 py-1.5 rounded-2xl">
                          <Globe className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-xs font-bold text-emerald-900">Landing Page</span>
                          <Switch
                            checked={ticket.is_featured}
                            onCheckedChange={() => handleToggleFeatured(ticket, ticket.is_featured)}
                          />
                        </div>
                      )}

                      {/* Sélecteur de Statut (pour les catégories NON-review : suggestion, bug, support) */}
                      {ticket.category !== 'review' ? (
                        <Select
                          value={ticket.status}
                          onValueChange={newVal => handleStatusChange(ticket.id, newVal)}
                        >
                          <SelectTrigger className="w-32 h-9 rounded-xl text-xs font-semibold">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="open">En attente</SelectItem>
                            <SelectItem value="in_progress">En cours</SelectItem>
                            <SelectItem value="resolved">Résolu</SelectItem>
                            <SelectItem value="closed">Fermé</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-xs px-3 py-1 font-semibold">
                          ⭐ Avis Client
                        </Badge>
                      )}

                      {/* Bouton Répondre */}
                      <Button
                        onClick={() => openAdminChat(ticket)}
                        className="bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs h-9 px-4 rounded-xl flex items-center gap-1.5"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Répondre</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Modal de Discussion Admin */}
        <Dialog open={!!activeTicket} onOpenChange={open => !open && setActiveTicket(null)}>
          <DialogContent className="sm:max-w-xl rounded-3xl p-6 flex flex-col h-[600px] max-h-[85vh]">
            {activeTicket && (
              <>
                <DialogHeader className="border-b border-gray-100 pb-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-mono text-gray-400 font-bold">{activeTicket.ticket_number}</span>
                    {renderCategoryBadge(activeTicket.category)}
                  </div>
                  <DialogTitle className="text-lg font-bold text-gray-900 mt-1">
                    {activeTicket.subject}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-gray-500">
                    Client : <span className="font-bold text-gray-800">{activeTicket.author_name}</span> ({activeTicket.author_role || 'Membre'})
                  </DialogDescription>
                </DialogHeader>

                {/* Messages de la conversation */}
                <div className="flex-1 overflow-y-auto p-2 space-y-3 custom-scrollbar">
                  {isLoadingMessages ? (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                    </div>
                  ) : (
                    messages.map(msg => (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${msg.is_admin_reply ? 'items-end' : 'items-start'}`}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-[10px] font-bold text-gray-500">
                            {msg.is_admin_reply ? '🛡️ Vous (Admin)' : activeTicket.author_name || 'Client'}
                          </span>
                          <span className="text-[9px] text-gray-400">
                            {new Date(msg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div
                          className={`p-3.5 rounded-2xl text-xs max-w-[85%] leading-relaxed ${
                            msg.is_admin_reply
                              ? 'bg-emerald-900 text-white rounded-tr-none font-medium'
                              : 'bg-gray-100 text-gray-900 rounded-tl-none font-medium'
                          }`}
                        >
                          {msg.message}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Formulaire de Réponse Admin */}
                <form onSubmit={handleSendAdminReply} className="border-t border-gray-100 pt-3 flex items-center gap-2">
                  <Input
                    value={adminReplyText}
                    onChange={e => setAdminReplyText(e.target.value)}
                    placeholder="Écrivez votre réponse d'administration..."
                    className="rounded-xl text-xs h-10"
                  />
                  <Button
                    type="submit"
                    disabled={isReplying || !adminReplyText.trim()}
                    className="bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl h-10 px-4 shrink-0 font-bold text-xs flex items-center gap-1.5"
                  >
                    {isReplying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    <span>Envoyer</span>
                  </Button>
                </form>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminGuard>
  )
}
