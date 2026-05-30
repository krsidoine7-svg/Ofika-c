"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Instagram,
    Youtube,
    Twitter,
    Facebook,
    Music, // For TikTok
    Search,
    CheckCircle2,
    AlertCircle,
    Users,
    Image as ImageIcon,
    ArrowRight,
    TrendingUp,
    ShieldCheck,
    RefreshCcw,
    Loader2
} from 'lucide-react'
import { Button } from "@/components/core/ui/button"
import { Input } from "@/components/core/ui/input"
import { Card } from "@/components/core/ui/card"
import { SocialScraperService, SocialProfile, SocialPlatform } from '@/lib/services/social-scraper'
import { toast } from "sonner"

interface SocialOnboardingProps {
    platform: SocialPlatform
    onProfileImport: (profile: SocialProfile) => void
    onClose: () => void
}

export function SocialOnboarding({ platform, onProfileImport, onClose }: SocialOnboardingProps) {
    const [username, setUsername] = useState('')
    const [status, setStatus] = useState<'idle' | 'searching' | 'found' | 'error'>('idle')
    const [profile, setProfile] = useState<SocialProfile | null>(null)
    const [loadingStep, setLoadingStep] = useState(0)
    const [error, setError] = useState('')

    const platformInfo: Record<SocialPlatform, { name: string, icon: any, color: string, gradient: string }> = {
        instagram: {
            name: "Instagram",
            icon: Instagram,
            color: "#ee2a7b",
            gradient: "from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]"
        },
        tiktok: {
            name: "TikTok",
            icon: Music,
            color: "#000000",
            gradient: "from-[#00f2ea] via-[#000000] to-[#ff0050]"
        },
        youtube: {
            name: "YouTube",
            icon: Youtube,
            color: "#ff0000",
            gradient: "from-[#ff0000] to-[#c4302b]"
        },
        twitter: {
            name: "Twitter / X",
            icon: Twitter,
            color: "#1DA1F2",
            gradient: "from-[#1DA1F2] to-[#000000]"
        },
        facebook: {
            name: "Facebook",
            icon: Facebook,
            color: "#1877F2",
            gradient: "from-[#1877F2] to-[#0a5cc2]"
        }
    }

    const currentPlatform = platformInfo[platform]

    const loadingSteps = [
        `Connexion sécurisée à ${currentPlatform.name}...`,
        "Analyse de l'audience de @${username}...",
        "Calcul du nombre exact d'abonnés...",
        "Vérification du statut de certification...",
        "Calcul de la puissance sociale...",
        "Finalisation de la vérification..."
    ]

    useEffect(() => {
        let interval: NodeJS.Timeout
        if (status === 'searching') {
            setLoadingStep(0)
            interval = setInterval(() => {
                setLoadingStep(prev => (prev < loadingSteps.length - 1 ? prev + 1 : prev))
            }, 500)
        }
        return () => clearInterval(interval)
    }, [status])

    const handleSearch = async () => {
        if (!username.trim()) {
            toast.error(`Veuillez entrer un nom d'utilisateur ${currentPlatform.name}`)
            return
        }

        setStatus('searching')
        setError('')

        try {
            const data = await SocialScraperService.scrapeProfile(platform, username)
            setStatus('found')
            setProfile(data)
            toast.success(`${currentPlatform.name} trouvé !`)
        } catch (err: any) {
            setStatus('error')
            setError(err.message || "Impossible de trouver ce profil.")
            toast.error("Erreur lors de la recherche")
        }
    }

    const handleApply = () => {
        if (profile) {
            onProfileImport(profile)
            onClose()
        }
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
                <div className={`absolute top-0 left-0 right-0 h-32 bg-gradient-to-tr ${currentPlatform.gradient} opacity-10`} />

                <div className="p-8 pt-10">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className={`p-3 bg-gradient-to-tr ${currentPlatform.gradient} rounded-2xl shadow-lg`}>
                                <currentPlatform.icon className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Scraping {currentPlatform.name}</h2>
                                <p className="text-gray-500">Ajoutez votre audience réelle sur Ofika</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={onClose} className="rounded-full h-8 w-8 p-0">✕</Button>
                    </div>

                    <AnimatePresence mode="wait">
                        {status === 'idle' || status === 'error' ? (
                            <motion.div key="input" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-lg">@</span>
                                    <Input
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value.replace('@', ''))}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                        placeholder="nom_utilisateur"
                                        className="pl-9 h-14 rounded-2xl border-2 border-gray-100 focus:ring-0 text-lg font-medium transition-all"
                                        style={{ borderColor: status === 'error' ? '#ef4444' : '' }}
                                        autoFocus
                                    />
                                    <Button
                                        onClick={handleSearch}
                                        className={`absolute right-2 top-2 h-10 px-6 bg-gradient-to-tr ${currentPlatform.gradient} hover:opacity-90 transition-all rounded-xl text-white`}
                                    >
                                        Scraper
                                    </Button>
                                </div>

                                {status === 'error' && (
                                    <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600">
                                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                        <p className="text-sm font-medium">{error}</p>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FeatureItem icon={<Users className="w-5 h-5" />} title="Audience Réelle" desc={`Vos abonnés ${currentPlatform.name}`} />
                                    <FeatureItem icon={<CheckCircle2 className="w-5 h-5" />} title="Statut Vérifié" desc="Badge officiel importé" />
                                </div>
                            </motion.div>
                        ) : status === 'searching' ? (
                            <motion.div key="loading" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} className="py-12 flex flex-col items-center justify-center text-center space-y-8">
                                <div className="relative">
                                    <div className={`absolute inset-0 bg-gradient-to-tr ${currentPlatform.gradient} rounded-full animate-pulse opacity-20 scale-150`} />
                                    <div className="relative h-24 w-24 bg-white rounded-3xl shadow-xl flex items-center justify-center border-2 border-gray-50">
                                        <Loader2 className="w-12 h-12 animate-spin" style={{ color: currentPlatform.color }} />
                                    </div>
                                </div>
                                <div className="space-y-2 max-w-xs mx-auto">
                                    <h3 className="text-xl font-bold text-gray-900">Scraping en cours...</h3>
                                    <p className="font-medium animate-pulse" style={{ color: currentPlatform.color }}>
                                        {loadingSteps[loadingStep].replace('${username}', username)}
                                    </p>
                                    <div className="flex justify-center gap-1 mt-4">
                                        {[0, 1, 2, 3, 4, 5].map((idx) => (
                                            <div key={idx} className={`h-1.5 rounded-full transition-all duration-300 ${idx <= loadingStep ? 'w-8' : 'w-2 bg-gray-100'}`} style={{ backgroundColor: idx <= loadingStep ? currentPlatform.color : '' }} />
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        ) : status === 'found' && profile && (
                            <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                                <Card className="p-6 rounded-3xl border-2 border-gray-50 shadow-xl bg-gradient-to-b from-white to-gray-50">
                                    <div className="flex flex-col md:flex-row items-center gap-6">
                                        <div className="relative">
                                            <div className={`absolute -inset-1 bg-gradient-to-tr ${currentPlatform.gradient} rounded-[2rem] p-[3px]`}>
                                                <div className="bg-white rounded-[1.9rem] p-1 h-full w-full">
                                                    <img src={profile.profilePicUrl} alt={profile.username} className="w-24 h-24 rounded-[1.6rem] object-cover" />
                                                </div>
                                            </div>
                                            {profile.isVerified && (
                                                <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white rounded-full p-1.5 shadow-lg border-2 border-white">
                                                    <CheckCircle2 className="w-4 h-4 fill-current" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 text-center md:text-left">
                                            <h3 className="text-2xl font-bold text-gray-900">@{profile.username}</h3>
                                            <p className="text-gray-600 font-medium mb-3">{profile.fullName}</p>

                                            <div className="flex items-center justify-center md:justify-start gap-4">
                                                <StatItem value={SocialScraperService.formatCount(profile.followersCount)} label={platform === 'youtube' ? 'Abos' : 'Abonnés'} icon={<Users className="w-4 h-4" />} />
                                                <div className="w-px h-8 bg-gray-200" />
                                                <StatItem value={SocialScraperService.formatCount(profile.postCount)} label={platform === 'youtube' ? 'Vidéos' : 'Posts'} icon={<ImageIcon className="w-4 h-4" />} />
                                                {profile.isVerified && (
                                                    <>
                                                        <div className="w-px h-8 bg-gray-200" />
                                                        <div className="flex flex-col items-center md:items-start">
                                                            <span className="text-blue-500 flex items-center gap-1 font-bold"><ShieldCheck className="w-4 h-4" /> Certifié</span>
                                                            <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Statut</span>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-8 p-4 bg-white/60 rounded-2xl border border-white text-center">
                                        <p className="text-gray-500 text-sm font-medium">Seules les statistiques seront ajoutées à votre profil Ofika.</p>
                                    </div>
                                </Card>

                                <div className="flex gap-4">
                                    <Button variant="outline" onClick={() => setStatus('idle')} className="flex-1 h-12 rounded-2xl border-2 hover:bg-gray-50 flex gap-2">
                                        <RefreshCcw className="w-4 h-4" /> Refaire
                                    </Button>
                                    <Button onClick={handleApply} className="flex-[2] h-12 bg-black hover:bg-gray-900 text-white rounded-2xl shadow-xl shadow-black/10 flex gap-2">
                                        Utiliser ces statistiques <ArrowRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    )
}

function FeatureItem({ icon, title, desc }: { icon: any, title: string, desc: string }) {
    return (
        <div className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50 space-y-1">
            <div className="text-gray-900">{icon}</div>
            <h4 className="font-bold text-gray-900 text-sm">{title}</h4>
            <p className="text-xs text-gray-500">{desc}</p>
        </div>
    )
}

function StatItem({ value, label, icon }: { value: string, label: string, icon: any }) {
    return (
        <div className="flex flex-col items-center md:items-start">
            <span className="text-lg font-bold text-gray-900">{value}</span>
            <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider flex items-center gap-1">{icon}{label}</span>
        </div>
    )
}
