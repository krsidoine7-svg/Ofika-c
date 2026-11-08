'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts'
import { TrendingUp, Calendar, Download } from 'lucide-react'
import { useState } from 'react'

interface ChartData {
  name: string
  value: number
  color?: string
}

interface AnalyticsChartsProps {
  data: {
    daily: Array<{ date: string; views: number; clicks: number; scans: number }>
    deviceBreakdown: Array<{ name: string; value: number; color: string }>
    profileComparison: Array<{ name: string; views: number; clicks: number; scans: number }>
  }
  onExport?: () => void
}

const COLORS = ['#f97316', '#ec4899', '#8b5cf6', '#06b6d4', '#10b981']

export function AnalyticsCharts({ data, onExport }: AnalyticsChartsProps) {
  const [selectedChart, setSelectedChart] = useState<'daily' | 'devices' | 'profiles'>('daily')
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')

  const formatTooltip = (value: number, name: string) => {
    const labels: { [key: string]: string } = {
      views: 'Vues',
      clicks: 'Clics',
      scans: 'Scans QR',
      value: 'Valeur'
    }
    return [value, labels[name] || name]
  }

  return (
    <div className="space-y-6">
      {/* Contrôles */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Select value={selectedChart} onValueChange={(value: any) => setSelectedChart(value)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Évolution quotidienne</SelectItem>
              <SelectItem value="devices">Répartition appareils</SelectItem>
              <SelectItem value="profiles">Comparaison profils</SelectItem>
            </SelectContent>
          </Select>

          {selectedChart === 'daily' && (
            <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7 jours</SelectItem>
                <SelectItem value="30d">30 jours</SelectItem>
                <SelectItem value="90d">90 jours</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>

        {onExport && (
          <Button onClick={onExport} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
        )}
      </div>

      {/* Graphique d'évolution quotidienne */}
      {selectedChart === 'daily' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Évolution quotidienne
            </CardTitle>
            <CardDescription>
              Vues, clics et scans QR au fil du temps
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.daily}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString('fr-FR', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={formatTooltip}
                    labelFormatter={(value) => new Date(value).toLocaleDateString('fr-FR')}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="views" 
                    stackId="1" 
                    stroke="#f97316" 
                    fill="#f97316" 
                    fillOpacity={0.6}
                    name="Vues"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="clicks" 
                    stackId="1" 
                    stroke="#ec4899" 
                    fill="#ec4899" 
                    fillOpacity={0.6}
                    name="Clics"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="scans" 
                    stackId="1" 
                    stroke="#8b5cf6" 
                    fill="#8b5cf6" 
                    fillOpacity={0.6}
                    name="Scans QR"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Graphique de répartition des appareils */}
      {selectedChart === 'devices' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Répartition par appareil</CardTitle>
              <CardDescription>
                Types d'appareils utilisés
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.deviceBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {data.deviceBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={formatTooltip} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Détail des appareils</CardTitle>
              <CardDescription>
                Répartition détaillée
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.deviceBreakdown.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div 
                        className="w-4 h-4 rounded-full mr-3" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm font-medium">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{item.value}</div>
                      <div className="text-xs text-gray-500">
                        {data.deviceBreakdown.reduce((acc, d) => acc + d.value, 0) > 0 
                          ? Math.round((item.value / data.deviceBreakdown.reduce((acc, d) => acc + d.value, 0)) * 100)
                          : 0}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Comparaison des profils */}
      {selectedChart === 'profiles' && (
        <Card>
          <CardHeader>
            <CardTitle>Comparaison des profils</CardTitle>
            <CardDescription>
              Performance relative de chaque profil
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.profileComparison}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip formatter={formatTooltip} />
                  <Bar dataKey="views" fill="#f97316" name="Vues" />
                  <Bar dataKey="clicks" fill="#ec4899" name="Clics" />
                  <Bar dataKey="scans" fill="#8b5cf6" name="Scans QR" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
