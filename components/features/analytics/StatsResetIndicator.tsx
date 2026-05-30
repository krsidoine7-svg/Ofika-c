'use client'

// =====================================================
// COMPOSANT D'AFFICHAGE DU STATUT DE RESET DES STATS
// =====================================================

import { useStatsResetInfo } from '@/lib/hooks/useStatsAutoReset'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/core/ui/card'
import { Badge } from '@/components/core/ui/badge'
import { Progress } from '@/components/core/ui/progress'
import { Calendar, RotateCcw, TrendingUp } from 'lucide-react'

export function StatsResetIndicator() {
    const { resetInfo, loading } = useStatsResetInfo()

    if (loading || !resetInfo) {
        return null
    }

    const { daysSinceReset, daysUntilNextReset, resetCycleProgress, nextResetDate } = resetInfo

    // Formater la date du prochain reset
    const nextResetFormatted = new Date(nextResetDate).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    })

    return (
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <RotateCcw className="h-4 w-4 text-blue-600" />
                        Cycle de Statistiques
                    </CardTitle>
                    <Badge variant="outline" className="bg-white border-blue-300 text-blue-700">
                        Jour {daysSinceReset}/40
                    </Badge>
                </div>
                <CardDescription className="text-xs">
                    Reset automatique tous les 40 jours
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                {/* Barre de progression */}
                <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-600">
                        <span>Progression</span>
                        <span className="font-medium">{resetCycleProgress}%</span>
                    </div>
                    <Progress value={resetCycleProgress} className="h-2" />
                </div>

                {/* Informations */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1.5 text-gray-600">
                        <TrendingUp className="h-3.5 w-3.5 text-blue-500" />
                        <span>Jours écoulés: <strong className="text-gray-900">{daysSinceReset}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-600">
                        <Calendar className="h-3.5 w-3.5 text-blue-500" />
                        <span>Restants: <strong className="text-gray-900">{daysUntilNextReset}</strong></span>
                    </div>
                </div>

                {/* Prochain reset */}
                <div className="pt-2 border-t border-blue-100">
                    <p className="text-xs text-gray-600">
                        Prochain reset : <strong className="text-blue-700">{nextResetFormatted}</strong>
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}
