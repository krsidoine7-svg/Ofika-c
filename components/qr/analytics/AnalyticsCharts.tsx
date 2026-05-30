'use client'

// =====================================================
// COMPOSANTS DE GRAPHIQUES POUR ANALYTICS QR
// Utilise Recharts pour visualisation
// =====================================================

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

// Couleurs Ofika
const COLORS = ['#f97316', '#ec4899', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#6b7280']

interface ScansTimelineChartProps {
  data: Array<{ date: string; count: number }>
}

export function ScansTimelineChart({ data }: ScansTimelineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => {
            const date = new Date(value)
            return `${date.getDate()}/${date.getMonth() + 1}`
          }}
        />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '8px 12px'
          }}
          labelFormatter={(value) => {
            const date = new Date(value)
            return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long' })
          }}
        />
        <Area
          type="monotone"
          dataKey="count"
          stroke="#f97316"
          strokeWidth={2}
          fill="url(#colorScans)"
          name="Scans"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

interface ScansHourlyChartProps {
  data: Array<{ hour: number; count: number }>
}

export function ScansHourlyChart({ data }: ScansHourlyChartProps) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="hour"
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => `${value}h`}
        />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '8px 12px'
          }}
          labelFormatter={(value) => `${value}:00`}
        />
        <Bar dataKey="count" fill="#f97316" radius={[4, 4, 0, 0]} name="Scans" />
      </BarChart>
    </ResponsiveContainer>
  )
}

interface DeviceDistributionChartProps {
  data: Array<{ device: string; count: number; percentage: number }>
}

export function DeviceDistributionChart({ data }: DeviceDistributionChartProps) {
  const chartData = data.map(item => ({
    name: item.device || 'Inconnu',
    value: item.count
  }))

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '8px 12px'
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

interface WeeklyDistributionChartProps {
  data: Array<{ day: string; count: number }>
}

export function WeeklyDistributionChart({ data }: WeeklyDistributionChartProps) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="day"
          tick={{ fontSize: 11 }}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '8px 12px'
          }}
        />
        <Bar dataKey="count" fill="#ec4899" radius={[4, 4, 0, 0]} name="Scans" />
      </BarChart>
    </ResponsiveContainer>
  )
}

interface CountriesChartProps {
  data: Array<{ country: string; count: number; percentage: number }>
}

export function CountriesChart({ data }: CountriesChartProps) {
  // Limiter à top 10
  const topData = data.slice(0, 10)

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={topData} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis type="number" tick={{ fontSize: 12 }} />
        <YAxis
          dataKey="country"
          type="category"
          width={100}
          tick={{ fontSize: 11 }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '8px 12px'
          }}
        />
        <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} name="Scans" />
      </BarChart>
    </ResponsiveContainer>
  )
}
