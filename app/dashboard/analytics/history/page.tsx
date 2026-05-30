'use client'

// =====================================================
// PAGE D'HISTORIQUE DÉTAILLÉ DES VISITES
// =====================================================

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/core/ui/card'
import { Button } from '@/components/core/ui/button'
import { Badge } from '@/components/core/ui/badge'
import { Input } from '@/components/core/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/core/ui/select'
import { 
  Eye, 
  MousePointer, 
  QrCode, 
  Smartphone, 
  Monitor, 
  Tablet,
  Search,
  Filter,
  Download,
  Calendar,
  Clock,
  MapPin,
  Globe,
  ArrowLeft
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useProfiles } from '@/lib/hooks/useProfiles'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import Link from 'next/link'

interface AnalyticsEvent {
  id: string
  profile_id: string
  event_type: 'profile_viewed' | 'link_clicked' | 'qr_scanned'
  event_data?: {
    link_id?: string
    link_url?: string
    referrer?: string
  }
  user_agent?: string
  device_type?: 'mobile' | 'desktop' | 'tablet'
  browser?: string
  os?: string
  country?: string
  city?: string
  ip_address?: string
  created_at: string
}

export default function AnalyticsHistoryPage() {
  const { profiles } = useProfiles()
  const [events, setEvents] = useState<AnalyticsEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProfile, setSelectedProfile] = useState<string>('all')
  const [selectedEventType, setSelectedEventType] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const itemsPerPage = 50

  useEffect(() => {
    loadEvents()
  }, [selectedProfile, selectedEventType])

  const loadEvents = async () => {
    setLoading(true)
    const supabase = createClient()

    try {
      let query = supabase
        .from('analytics_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500) // Limiter à 500 derniers événements

      // Filtrer par profil
      if (selectedProfile !== 'all') {
        query = query.eq('profile_id', selectedProfile)
      }

      // Filtrer par type d'événement
      if (selectedEventType !== 'all') {
        query = query.eq('event_type', selectedEventType)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error loading events:', error)
      } else {
        setEvents(data || [])
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filtrer par recherche
  const filteredEvents = events.filter(event => {
    if (!searchQuery) return true
    const search = searchQuery.toLowerCase()
    return (
      event.user_agent?.toLowerCase().includes(search) ||
      event.device_type?.toLowerCase().includes(search) ||
      event.browser?.toLowerCase().includes(search) ||
      event.os?.toLowerCase().includes(search) ||
      event.country?.toLowerCase().includes(search) ||
      event.city?.toLowerCase().includes(search) ||
      event.ip_address?.toLowerCase().includes(search)
    )
  })

  // Pagination
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage)
  const paginatedEvents = filteredEvents.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  )

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'profile_viewed':
        return <Eye className="w-4 h-4" />
      case 'link_clicked':
        return <MousePointer className="w-4 h-4" />
      case 'qr_scanned':
        return <QrCode className="w-4 h-4" />
      default:
        return <Eye className="w-4 h-4" />
    }
  }

  const getEventLabel = (type: string) => {
    switch (type) {
      case 'profile_viewed':
        return 'Vue du profil'
      case 'link_clicked':
        return 'Clic sur lien'
      case 'qr_scanned':
        return 'Scan QR Code'
      default:
        return type
    }
  }

  const getEventColor = (type: string) => {
    switch (type) {
      case 'profile_viewed':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'link_clicked':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'qr_scanned':
        return 'bg-orange-100 text-orange-700 border-orange-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getDeviceIcon = (type?: string) => {
    switch (type) {
      case 'mobile':
        return <Smartphone className="w-4 h-4" />
      case 'tablet':
        return <Tablet className="w-4 h-4" />
      case 'desktop':
        return <Monitor className="w-4 h-4" />
      default:
        return <Monitor className="w-4 h-4" />
    }
  }

  const exportToCSV = () => {
    const headers = ['Date', 'Heure', 'Profil', 'Type', 'Appareil', 'OS', 'Navigateur', 'Pays', 'Ville', 'IP']
    const rows = filteredEvents.map(event => {
      const profile = profiles?.find(p => p.id === event.profile_id)
      return [
        format(new Date(event.created_at), 'dd/MM/yyyy', { locale: fr }),
        format(new Date(event.created_at), 'HH:mm:ss', { locale: fr }),
        profile?.name || 'N/A',
        getEventLabel(event.event_type),
        event.device_type || 'N/A',
        event.os || 'N/A',
        event.browser || 'N/A',
        event.country || 'N/A',
        event.city || 'N/A',
        event.ip_address || 'N/A'
      ]
    })

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `historique-analytics-${format(new Date(), 'yyyy-MM-dd')}.csv`
    link.click()
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement de l'historique...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link href="/dashboard/analytics">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux statistiques
          </Button>
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Historique des visites</h1>
        <p className="text-gray-600">
          Consultez l'historique détaillé de toutes les interactions avec vos profils
        </p>
      </div>

      {/* Filtres */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Recherche */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Rechercher (appareil, OS, pays, IP...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Profil */}
            <Select value={selectedProfile} onValueChange={setSelectedProfile}>
              <SelectTrigger>
                <SelectValue placeholder="Tous les profils" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les profils</SelectItem>
                {profiles?.map(profile => (
                  <SelectItem key={profile.id} value={profile.id}>
                    {profile.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Type d'événement */}
            <Select value={selectedEventType} onValueChange={setSelectedEventType}>
              <SelectTrigger>
                <SelectValue placeholder="Tous les types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="profile_viewed">Vues du profil</SelectItem>
                <SelectItem value="link_clicked">Clics sur liens</SelectItem>
                <SelectItem value="qr_scanned">Scans QR Code</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-600">
              {filteredEvents.length} événement{filteredEvents.length > 1 ? 's' : ''} trouvé{filteredEvents.length > 1 ? 's' : ''}
            </div>
            <Button onClick={exportToCSV} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Exporter en CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Liste des événements */}
      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {paginatedEvents.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <Eye className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>Aucun événement trouvé</p>
              </div>
            ) : (
              paginatedEvents.map((event) => {
                const profile = profiles?.find(p => p.id === event.profile_id)
                
                return (
                  <div key={event.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-4">
                      {/* Icône et type */}
                      <div className="flex-shrink-0">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${getEventColor(event.event_type)}`}>
                          {getEventIcon(event.event_type)}
                        </div>
                      </div>

                      {/* Contenu principal */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-gray-900">
                                {getEventLabel(event.event_type)}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {profile?.name || 'Profil supprimé'}
                              </Badge>
                            </div>
                            
                            {/* Lien cliqué */}
                            {event.event_type === 'link_clicked' && event.event_data?.link_url && (
                              <div className="text-sm text-gray-600 truncate">
                                <MousePointer className="w-3 h-3 inline mr-1" />
                                {event.event_data.link_url}
                              </div>
                            )}
                          </div>

                          {/* Date et heure */}
                          <div className="flex-shrink-0 text-right">
                            <div className="text-sm font-medium text-gray-900 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {format(new Date(event.created_at), 'dd MMM yyyy', { locale: fr })}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center gap-1 justify-end">
                              <Clock className="w-3 h-3" />
                              {format(new Date(event.created_at), 'HH:mm:ss', { locale: fr })}
                            </div>
                          </div>
                        </div>

                        {/* Détails */}
                        <div className="flex flex-wrap gap-3 text-xs text-gray-600">
                          {/* Appareil */}
                          {event.device_type && (
                            <div className="flex items-center gap-1">
                              {getDeviceIcon(event.device_type)}
                              <span className="capitalize">{event.device_type}</span>
                            </div>
                          )}

                          {/* OS */}
                          {event.os && (
                            <div className="flex items-center gap-1">
                              <Globe className="w-3 h-3" />
                              <span>{event.os}</span>
                            </div>
                          )}

                          {/* Navigateur */}
                          {event.browser && (
                            <div className="flex items-center gap-1">
                              <span>{event.browser}</span>
                            </div>
                          )}

                          {/* Localisation */}
                          {(event.country || event.city) && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              <span>
                                {[event.city, event.country].filter(Boolean).join(', ')}
                              </span>
                            </div>
                          )}

                          {/* IP */}
                          {event.ip_address && (
                            <div className="flex items-center gap-1 text-gray-400">
                              <span>{event.ip_address}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Précédent
          </Button>
          <div className="text-sm text-gray-600">
            Page {page} sur {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Suivant
          </Button>
        </div>
      )}
    </div>
  )
}
