'use client'

import React, { useState, useMemo } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { DailyMetricPoint } from '@/lib/hooks/useDashboardAnalytics'
import { TrendingUp, QrCode, Eye, Calendar, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DashboardActivityChartProps {
  data: DailyMetricPoint[]
  loading?: boolean
  className?: string
}

export function DashboardActivityChart({ data, loading, className }: DashboardActivityChartProps) {
  const [timeRange, setTimeRange] = useState<'7d' | '30d'>('7d')

  // Filtrer les données selon la période sélectionnée
  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return []
    const sliceCount = timeRange === '7d' ? 7 : 30
    return data.slice(-sliceCount)
  }, [data, timeRange])

  // Calculer les totaux sur la période choisie
  const periodTotals = useMemo(() => {
    const totalViews = filteredData.reduce((acc, curr) => acc + (curr.views || 0), 0)
    const totalScans = filteredData.reduce((acc, curr) => acc + (curr.scans || 0), 0)
    return { totalViews, totalScans }
  }, [filteredData])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-md border border-neutral-200/90 rounded-xl shadow-lg p-3 text-xs space-y-1.5 min-w-[150px]">
          <p className="font-bold text-neutral-900 border-b border-neutral-100 pb-1">
            {label}
          </p>
          <div className="flex items-center justify-between gap-3 text-neutral-600">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-500" />
              <span>Vues profil :</span>
            </span>
            <span className="font-mono font-bold text-neutral-900 tabular-nums">
              {payload.find((p: any) => p.dataKey === 'views')?.value || 0}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 text-neutral-600">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-orange-500" />
              <span>Scans NFC/QR :</span>
            </span>
            <span className="font-mono font-bold text-neutral-900 tabular-nums">
              {payload.find((p: any) => p.dataKey === 'scans')?.value || 0}
            </span>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className={cn("bg-white rounded-2xl border border-neutral-100 p-4 sm:p-5 shadow-xs space-y-4", className)}>
      {/* En-tête du graphique avec sélecteur de période */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-neutral-100/80">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-700 shrink-0">
            <TrendingUp className="w-4 h-4 text-neutral-800" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
              <span>Fréquentation & Partages</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Temps réel</span>
              </span>
            </h3>
            <p className="text-[11px] text-neutral-400">
              Évolution de vos interactions sur vos cartes connectées et profils en ligne
            </p>
          </div>
        </div>

        {/* Boutons de période segmentés */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <div className="inline-flex p-0.5 bg-neutral-100 rounded-xl border border-neutral-200/70">
            <button
              type="button"
              onClick={() => setTimeRange('7d')}
              className={cn(
                "px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all cursor-pointer",
                timeRange === '7d'
                  ? "bg-white text-neutral-950 shadow-xs"
                  : "text-neutral-500 hover:text-neutral-900"
              )}
            >
              7 jours
            </button>
            <button
              type="button"
              onClick={() => setTimeRange('30d')}
              className={cn(
                "px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all cursor-pointer",
                timeRange === '30d'
                  ? "bg-white text-neutral-950 shadow-xs"
                  : "text-neutral-500 hover:text-neutral-900"
              )}
            >
              30 jours
            </button>
          </div>
        </div>
      </div>

      {/* Mini-Légende et Compteurs de la période */}
      <div className="flex flex-wrap items-center gap-4 text-xs pt-0.5">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
          <span className="text-neutral-500">Vues de profil :</span>
          <span className="font-mono font-bold text-neutral-900 tabular-nums">
            {periodTotals.totalViews}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
          <span className="text-neutral-500">Scans NFC & QR :</span>
          <span className="font-mono font-bold text-neutral-900 tabular-nums">
            {periodTotals.totalScans}
          </span>
        </div>
      </div>

      {/* Zone du Graphique Recharts */}
      <div className="h-56 sm:h-64 w-full pt-2">
        {loading ? (
          <div className="h-full flex items-center justify-center text-xs text-neutral-400">
            <span>Chargement des métriques...</span>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-neutral-400 gap-1">
            <Sparkles className="w-5 h-5 text-neutral-300" />
            <p className="text-xs">Aucune interaction enregistrée pour le moment</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="scansGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                tickMargin={8}
                minTickGap={20}
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                tickMargin={4}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="views"
                name="views"
                stroke="#0ea5e9"
                strokeWidth={2}
                fill="url(#viewsGradient)"
              />
              <Area
                type="monotone"
                dataKey="scans"
                name="scans"
                stroke="#f97316"
                strokeWidth={2}
                fill="url(#scansGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
