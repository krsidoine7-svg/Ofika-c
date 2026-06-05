'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { User, ShoppingCart, Calendar, ArrowRight, PlusCircle, CreditCard, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

interface ActivityItem {
    id: string
    type: 'profile_created' | 'profile_updated' | 'order_created'
    title: string
    description: string
    date: Date
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
                const { data: profiles, error: profilesError } = await supabase
                    .from('profiles')
                    .select('id, name, created_at, updated_at')
                    .eq('user_id', user.id)
                    .order('updated_at', { ascending: false })
                    .limit(5)

                // 2. Récupérer les commandes récentes
                const { data: orders, error: ordersError } = await supabase
                    .from('orders')
                    .select('id, order_number, amount_cents, created_at, status')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(5)

                console.log('Profils:', profiles)
                console.log('Commandes:', orders)

                // 3. Normaliser et fusionner les activités
                const allActivities: ActivityItem[] = []

                // Ajouter les profils créés/modifiés
                if (profiles) {
                    profiles.forEach(profile => {
                        const isNew = new Date(profile.created_at).getTime() === new Date(profile.updated_at).getTime()

                        allActivities.push({
                            id: `profile-${profile.id}`,
                            type: isNew ? 'profile_created' : 'profile_updated',
                            title: isNew ? 'Nouveau profil créé' : 'Profil mis à jour',
                            description: `Profil "${profile.name}"`,
                            date: new Date(profile.updated_at),
                            details: { id: profile.id }
                        })
                    })
                }

                // Ajouter les commandes
                if (orders) {
                    orders.forEach(order => {
                        allActivities.push({
                            id: `order-${order.id}`,
                            type: 'order_created',
                            title: 'Commande effectuée',
                            description: `Commande #${order.order_number} (${order.status === 'pending' ? 'En attente' : order.status})`,
                            date: new Date(order.created_at),
                            details: { amount: (order.amount_cents || 0) / 100 }
                        })
                    })
                }

                // 4. Trier par date décroissante et garder les 10 derniers
                const sortedActivities = allActivities
                    .sort((a, b) => b.date.getTime() - a.date.getTime())
                    .slice(0, 10)

                setActivities(sortedActivities)
            } catch (error) {
                console.error('Erreur chargement activité:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchActivity()
    }, [])

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'profile_created':
                return <PlusCircle className="w-5 h-5 text-green-500" />
            case 'profile_updated':
                return <User className="w-5 h-5 text-blue-500" />
            case 'order_created':
                return <ShoppingCart className="w-5 h-5 text-orange-500" />
            default:
                return <Calendar className="w-5 h-5 text-gray-500" />
        }
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Activité récente</CardTitle>
                        <CardDescription>Vos dernières actions sur Ofika</CardDescription>
                    </div>
                    <Badge variant="outline" className="ml-2">
                        {activities.length}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-8">
                        <Loader2 className="w-8 h-8 animate-spin text-orange-500 mb-2" />
                        <p className="text-sm text-gray-500">Chargement de votre activité...</p>
                    </div>
                ) : activities.length > 0 ? (
                    <div className="space-y-6">
                        <div className="relative border-l border-gray-200 ml-3 space-y-6">
                            {activities.map((activity, index) => (
                                <div key={activity.id} className="relative pl-6">
                                    {/* Point sur la ligne temporelle */}
                                    <span className="absolute -left-2.5 top-1 bg-white p-0.5 rounded-full ring-4 ring-white">
                                        {getActivityIcon(activity.type)}
                                    </span>

                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                {activity.title}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {activity.description}
                                            </p>
                                        </div>
                                        <time className="text-xs text-gray-400 whitespace-nowrap">
                                            {formatDistanceToNow(activity.date, { addSuffix: true, locale: fr })}
                                        </time>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <User className="w-12 h-12 mx-auto mb-4 text-gray-200" />
                        <p className="text-gray-900 font-medium">Aucune activité récente</p>
                        <p className="text-sm text-gray-500 mb-4">Commencez par créer votre premier profil pour voir de l'activité.</p>
                        <Link href="/dashboard/profiles">
                            <Button size="sm" className="bg-orange-500 hover:bg-orange-600">
                                <PlusCircle className="w-4 h-4 mr-2" />
                                Créer un profil
                            </Button>
                        </Link>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
