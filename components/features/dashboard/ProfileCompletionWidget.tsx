'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Circle, ArrowRight, Trophy, Plus } from 'lucide-react'
import Link from 'next/link'

interface Profile {
    id: string
    name: string
    bio?: string | null
    avatar_url?: string | null
    links?: any[]
    socials?: any
    theme?: string
}

interface ProfileCompletionWidgetProps {
    profiles: Profile[]
    loading?: boolean
}

export function ProfileCompletionWidget({ profiles, loading }: ProfileCompletionWidgetProps) {
    // Calculer le score pour le profil le plus récent ou complet
    const { score, nextSteps, bestProfile } = useMemo(() => {
        if (!profiles || profiles.length === 0) {
            return {
                score: 0,
                nextSteps: [],
                bestProfile: null
            }
        }

        // Prendre le premier profil (souvent le plus récent)
        const profile = profiles[0]
        let totalScore = 0
        const steps = []

        // 1. Nom (toujours présent si profil existe) - 10 pts
        totalScore += 10

        // 2. Photo de profil - 25 pts
        if (profile.avatar_url) {
            totalScore += 25
        } else {
            steps.push({
                label: 'Ajouter une photo de profil',
                points: 25,
                action: `/dashboard/profiles/${profile.id}/edit`
            })
        }

        // 3. Bio / Description - 20 pts
        if (profile.bio && profile.bio.length > 10) {
            totalScore += 20
        } else {
            steps.push({
                label: 'Rédiger une bio accrocheuse',
                points: 20,
                action: `/dashboard/profiles/${profile.id}/edit`
            })
        }

        // 4. Liens (au moins 1) - 25 pts
        const linksCount = Array.isArray(profile.links) ? profile.links.length : 0
        if (linksCount > 0) {
            totalScore += 25
        } else {
            steps.push({
                label: 'Ajouter vos premiers liens',
                points: 25,
                action: `/dashboard/profiles/${profile.id}/links`
            })
        }

        // 5. Thème personnalisé - 20 pts (simulé si on considère qu'un thème par défaut compte pour moitié)
        if (profile.theme && profile.theme !== 'default') {
            totalScore += 20
        } else {
            // On donne 10 points par défaut car il y a toujours un thème
            totalScore += 10
            steps.push({
                label: 'Choisir un design unique',
                points: 10,
                action: `/dashboard/profiles/${profile.id}/design`
            })
        }

        // Trier les étapes par points (les plus rentables d'abord)
        steps.sort((a, b) => b.points - a.points)

        return {
            score: Math.min(100, totalScore),
            nextSteps: steps.slice(0, 3), // Montrer max 3 prochaines actions
            bestProfile: profile
        }
    }, [profiles])

    if (loading) return null // Skeleton handled by parent usually

    if (!bestProfile) {
        return (
            <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-100">
                <CardContent className="pt-6 text-center">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm text-indigo-500">
                        <Plus className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">Aucun profil</h3>
                    <p className="text-sm text-gray-500 mb-4">Créez votre premier profil pour commencer</p>
                    <Link href="/dashboard/profiles/new">
                        <Button className="w-full bg-indigo-600 hover:bg-indigo-700">Commencer</Button>
                    </Link>
                </CardContent>
            </Card>
        )
    }

    // Couleur de la barre selon le score
    const progressColor = score >= 80 ? 'bg-green-500' : score >= 50 ? 'bg-orange-500' : 'bg-red-500'
    const textColor = score >= 80 ? 'text-green-700' : score >= 50 ? 'text-orange-700' : 'text-red-700'
    const bgColor = score >= 80 ? 'bg-green-50' : score >= 50 ? 'bg-orange-50' : 'bg-red-50'
    const borderColor = score >= 80 ? 'border-green-100' : score >= 50 ? 'border-orange-100' : 'border-red-100'

    return (
        <Card className={`${bgColor} ${borderColor} border shadow-sm`}>
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <Trophy className={`w-4 h-4 ${textColor}`} />
                        Score du profil
                    </CardTitle>
                    <span className={`text-sm font-bold ${textColor}`}>{score}%</span>
                </div>
                <CardDescription className="text-xs">
                    {bestProfile.name}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {/* Barre de progression */}
                <div className="mb-4">
                    <Progress value={score} className="h-2 bg-white/50" />
                </div>

                {/* Prochaines étapes */}
                {score < 100 ? (
                    <div className="space-y-3">
                        <p className="text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Pour atteindre 100% :
                        </p>
                        {nextSteps.map((step, index) => (
                            <div key={index} className="flex items-center justify-between bg-white/60 p-2 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <div className={`w-1.5 h-1.5 rounded-full ${index === 0 ? 'bg-indigo-500 animate-pulse' : 'bg-gray-300'}`} />
                                    <span className="text-sm text-gray-700">{step.label}</span>
                                </div>
                                <Link href={step.action}>
                                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-white">
                                        <ArrowRight className="w-3 h-3" />
                                    </Button>
                                </Link>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-2">
                        <div className="inline-flex items-center justify-center p-2 bg-green-100 rounded-full mb-2">
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                        </div>
                        <p className="text-sm font-medium text-green-800">
                            Profil parfait ! 🎉
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                            Prêt à être partagé avec le monde
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
