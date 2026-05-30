'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/core/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/core/ui/select'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts'
import { format, subDays } from 'date-fns'
import { fr } from 'date-fns/locale'

interface ChartDataPoint {
    date: string
    views: number
    scans: number
    clicks: number
}

interface AnalyticsChartProps {
    data: ChartDataPoint[]
    title?: string
    description?: string
    loading?: boolean
}

export function AnalyticsChart({ data, title = "Évolution", description = "Vues et scans sur la période", loading }: AnalyticsChartProps) {
    const [timeRange, setTimeRange] = useState("30d")

    if (loading) {
        return (
            <Card className="h-[400px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </Card>
        )
    }

    // Filtrer les données selon la période
    const filteredData = data // Pour l'instant on affiche tout, la logique de filtre serait côté parent ou ici

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white border rounded-lg shadow-lg p-3 text-sm">
                    <p className="font-medium text-gray-900 mb-2">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center gap-2 mb-1 last:mb-0">
                            <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: entry.color }}
                            />
                            <span className="text-gray-600 capitalize">
                                {entry.name === 'views' ? 'Vues' : entry.name === 'scans' ? 'Scans' : 'Clics'} :
                            </span>
                            <span className="font-bold">{entry.value}</span>
                        </div>
                    ))}
                </div>
            )
        }
        return null
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div className="space-y-1">
                    <CardTitle className="text-base font-semibold">{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </div>
                <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger className="w-[120px] h-8 text-xs">
                        <SelectValue placeholder="Période" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="7d">7 jours</SelectItem>
                        <SelectItem value="30d">30 jours</SelectItem>
                        <SelectItem value="90d">3 mois</SelectItem>
                    </SelectContent>
                </Select>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                            <XAxis
                                dataKey="date"
                                tickLine={false}
                                axisLine={false}
                                tick={{ fontSize: 12, fill: '#6b7280' }}
                                tickMargin={10}
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tick={{ fontSize: 12, fill: '#6b7280' }}
                                tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="views"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorViews)"
                                name="views"
                            />
                            <Area
                                type="monotone"
                                dataKey="scans"
                                stroke="#f97316"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorScans)"
                                name="scans"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
