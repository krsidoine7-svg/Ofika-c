'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Megaphone, X, Info, AlertTriangle, Rocket, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

interface Announcement {
    id: string
    title: string
    content: string
    type: string
    target_audience: string
}

const DISMISSED_KEY = 'ofika_dismissed_announcements'

/**
 * Récupère les IDs des annonces dismissées depuis le localStorage
 */
function getDismissedIds(): string[] {
    if (typeof window === 'undefined') return []
    try {
        const stored = localStorage.getItem(DISMISSED_KEY)
        if (!stored) return []
        const parsed = JSON.parse(stored)
        // Nettoyer les entrées de plus de 30 jours
        const now = Date.now()
        const valid = parsed.filter((entry: { id: string, at: number }) =>
            now - entry.at < 30 * 24 * 60 * 60 * 1000 // 30 jours
        )
        // Re-sauvegarder si nettoyé
        if (valid.length !== parsed.length) {
            localStorage.setItem(DISMISSED_KEY, JSON.stringify(valid))
        }
        return valid.map((entry: { id: string }) => entry.id)
    } catch {
        return []
    }
}

/**
 * Ajoute un ID à la liste des annonces dismissées dans le localStorage
 */
function addDismissedId(id: string) {
    if (typeof window === 'undefined') return
    try {
        const stored = localStorage.getItem(DISMISSED_KEY)
        const parsed = stored ? JSON.parse(stored) : []
        // Éviter les doublons
        if (!parsed.some((entry: { id: string }) => entry.id === id)) {
            parsed.push({ id, at: Date.now() })
            localStorage.setItem(DISMISSED_KEY, JSON.stringify(parsed))
        }
    } catch {
        // Silently fail
    }
}

export function AnnouncementBanner() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([])
    const [dismissed, setDismissed] = useState<string[]>([])
    const [userPlan, setUserPlan] = useState<string>('free')
    const supabase = useMemo(() => createClient(), [])

    // Charger les dismissed depuis le localStorage au montage
    useEffect(() => {
        setDismissed(getDismissedIds())
    }, [])

    // Récupérer le plan de l'utilisateur pour le filtrage audience
    useEffect(() => {
        async function fetchUserPlan() {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (user) {
                    // Récupérer le tier de l'utilisateur directement dans la table users
                    const { data: userData } = await supabase
                        .from('users')
                        .select('subscription_tier')
                        .eq('id', user.id)
                        .maybeSingle()

                    if (userData?.subscription_tier && userData.subscription_tier.toLowerCase() !== 'free') {
                        setUserPlan('pro')
                    } else {
                        setUserPlan('free')
                    }
                }
            } catch (err) {
                // En cas d'erreur, on reste sur 'free' par défaut
                console.error('Error fetching user plan for announcements:', err)
            }
        }
        fetchUserPlan()
    }, [supabase])

    // Récupérer les annonces actives
    useEffect(() => {
        async function fetchAnnouncements() {
            const { data } = await supabase
                .from('announcements')
                .select('id, title, content, type, target_audience')
                .eq('is_active', true)
                .order('created_at', { ascending: false })

            if (data) setAnnouncements(data)
        }
        fetchAnnouncements()
    }, [supabase])

    // Filtrer par audience + dismissed
    const activeAnnouncements = announcements.filter(a => {
        // Vérifier si l'annonce a été dismissée
        if (dismissed.includes(a.id)) return false

        // Filtrer par audience
        if (a.target_audience === 'all') return true
        if (a.target_audience === 'free' && userPlan === 'free') return true
        if (a.target_audience === 'pro' && userPlan === 'pro') return true

        return false
    })

    if (activeAnnouncements.length === 0) return null

    const handleDismiss = (id: string) => {
        setDismissed(prev => [...prev, id])
        addDismissedId(id)
    }

    return (
        <div className="space-y-2 mb-6">
            <AnimatePresence>
                {activeAnnouncements.map((ann) => (
                    <motion.div
                        key={ann.id}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className={cn(
                            "relative overflow-hidden p-4 rounded-2xl border flex items-start gap-4 shadow-sm",
                            ann.type === 'warning' ? "bg-yellow-50 border-yellow-100 text-yellow-800" :
                                ann.type === 'promo' ? "bg-purple-50 border-purple-100 text-purple-800" :
                                    ann.type === 'success' ? "bg-green-50 border-green-100 text-green-800" :
                                        "bg-blue-50 border-blue-100 text-blue-800"
                        )}
                    >
                        <div className="flex-shrink-0 mt-0.5">
                            {ann.type === 'warning' ? <AlertTriangle className="w-5 h-5" /> :
                                ann.type === 'promo' ? <Rocket className="w-5 h-5" /> :
                                    ann.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> :
                                        <Info className="w-5 h-5" />}
                        </div>
                        <div className="flex-1 pr-6">
                            <h4 className="text-sm font-bold leading-tight">{ann.title}</h4>
                            <p className="text-xs mt-1 opacity-90 leading-relaxed">{ann.content}</p>
                        </div>
                        <button
                            onClick={() => handleDismiss(ann.id)}
                            className="absolute top-3 right-3 p-1 hover:bg-black/5 rounded-full transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    )
}
