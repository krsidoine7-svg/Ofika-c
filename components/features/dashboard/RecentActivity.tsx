'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { User, Package, Calendar, ArrowRight, PlusCircle, Users, Loader2, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

interface ActivityItem {
  id: string
  type: 'profile_created' | 'profile_updated' | 'order_created' | 'lead_captured'
  title: string
  description: string
  date: Date
  link?: string
  details?: any
}

export function RecentActivity() {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchActivity = async () => {
      setLoading(true)
      const supabase = createClient()

      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // 1. Récupérer les profils récents
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, name, created_at, updated_at')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })
          .limit(5)

        // 2. Récupérer les commandes récentes
        const { data: orders } = await supabase
          .from('orders')
          .select('id, order_number, amount_cents, total_amount, created_at, status')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5)

        // 3. Récupérer les prospects captés récents
        const profileIds = (profiles || []).map(p => p.id)
        let capturedLeads: any[] = []
        if (profileIds.length > 0) {
          try {
            const { data: leads } = await supabase
              .from('captured_contacts')
              .select('id, name, phone, email, created_at, profile_id')
              .in('profile_id', profileIds)
              .order('created_at', { ascending: false })
              .limit(5)
            capturedLeads = leads || []
          } catch (_) {
            capturedLeads = []
          }
        }

        // 4. Normaliser et fusionner les flux d'activités
        const allActivities: ActivityItem[] = []

        // A. Profils
        if (profiles) {
          profiles.forEach(profile => {
            const isNew = new Date(profile.created_at).getTime() === new Date(profile.updated_at).getTime()
            allActivities.push({
              id: `profile-${profile.id}`,
              type: isNew ? 'profile_created' : 'profile_updated',
              title: isNew ? 'Nouveau profil créé' : 'Profil mis à jour',
              description: `Page « ${profile.name} »`,
              date: new Date(profile.updated_at),
              link: `/dashboard/profiles`,
              details: { id: profile.id }
            })
          })
        }

        // B. Commandes
        if (orders) {
          orders.forEach(order => {
            const num = order.order_number || `#${order.id.slice(-8).toUpperCase()}`
            const statusLabel = order.status === 'delivered' ? 'Livrée' : order.status === 'shipped' ? 'En livraison' : order.status === 'paid' ? 'Payée' : 'En attente'
            allActivities.push({
              id: `order-${order.id}`,
              type: 'order_created',
              title: 'Commande de carte NFC',
              description: `${num} (${statusLabel})`,
              date: new Date(order.created_at),
              link: `/dashboard/orders`,
              details: { id: order.id }
            })
          })
        }

        // C. Nouveaux prospects captés
        if (capturedLeads) {
          capturedLeads.forEach(lead => {
            const contactDetail = lead.phone || lead.email || 'Coordonnées enregistrées'
            allActivities.push({
              id: `lead-${lead.id}`,
              type: 'lead_captured',
              title: 'Nouveau contact capté !',
              description: `${lead.name || 'Prospect'} (${contactDetail})`,
              date: new Date(lead.created_at),
              link: `/dashboard/contacts`,
              details: { id: lead.id }
            })
          })
        }

        // 5. Trier par date décroissante
        const sortedActivities = allActivities
          .sort((a, b) => b.date.getTime() - a.date.getTime())
          .slice(0, 8)

        setActivities(sortedActivities)
      } catch (error) {
        console.error('Erreur chargement activité récente:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchActivity()
  }, [])

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'lead_captured':
        return (
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200/80">
            <Users className="w-3.5 h-3.5" />
          </div>
        )
      case 'profile_created':
        return (
          <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-sky-200/80">
            <PlusCircle className="w-3.5 h-3.5" />
          </div>
        )
      case 'profile_updated':
        return (
          <div className="w-7 h-7 rounded-lg bg-neutral-100 text-neutral-700 flex items-center justify-center shrink-0 border border-neutral-200/80">
            <User className="w-3.5 h-3.5" />
          </div>
        )
      case 'order_created':
        return (
          <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 border border-orange-200/80">
            <Package className="w-3.5 h-3.5" />
          </div>
        )
      default:
        return (
          <div className="w-7 h-7 rounded-lg bg-neutral-100 text-neutral-500 flex items-center justify-center shrink-0">
            <Calendar className="w-3.5 h-3.5" />
          </div>
        )
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-2 text-neutral-400">
        <Loader2 className="w-5 h-5 animate-spin text-neutral-800" />
        <span className="text-xs">Chargement du flux d'activité...</span>
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 space-y-2">
        <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-bold text-neutral-900">Aucune activité récente</p>
          <p className="text-[11px] text-neutral-400 mt-0.5">
            Vos modifications de profils, commandes et contacts captés apparaîtront ici.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="divide-y divide-neutral-100">
      {activities.map((activity) => (
        <div
          key={activity.id}
          className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3 group/item transition-colors"
        >
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {getActivityIcon(activity.type)}

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-xs font-bold text-neutral-900 truncate">
                  {activity.title}
                </p>
                {activity.type === 'lead_captured' && (
                  <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wider shrink-0">
                    Lead
                  </span>
                )}
              </div>
              <p className="text-[11px] text-neutral-500 truncate mt-0.5">
                {activity.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <time className="text-[10px] font-mono text-neutral-400">
              {formatDistanceToNow(activity.date, { addSuffix: true, locale: fr })}
            </time>
            {activity.link && (
              <Link
                href={activity.link}
                className="text-neutral-400 hover:text-neutral-900 transition-colors p-1"
                title="Consulter"
              >
                <ArrowRight className="w-3.5 h-3.5 group-hover/item:translate-x-0.5 transition-transform" />
              </Link>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
