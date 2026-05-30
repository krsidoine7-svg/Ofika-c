'use client'

import { useState } from 'react'
import { Button } from '@/components/core/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/core/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/core/ui/select'
import { Calendar } from '@/components/core/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/core/ui/popover'
import { Download, FileText, Table, Calendar as CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface ExportAnalyticsProps {
  data: any[]
  onExport: (format: 'csv' | 'json', dateRange: { from: Date; to: Date }) => void
}

export function ExportAnalytics({ data, onExport }: ExportAnalyticsProps) {
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv')
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 jours
    to: new Date()
  })
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    try {
      await onExport(exportFormat, dateRange)
    } finally {
      setIsExporting(false)
    }
  }

  const convertToCSV = (data: any[]) => {
    if (!data.length) return ''
    
    const headers = Object.keys(data[0])
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header]
          return typeof value === 'string' && value.includes(',') 
            ? `"${value}"` 
            : value
        }).join(',')
      )
    ].join('\n')
    
    return csvContent
  }

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const exportData = () => {
    const filteredData = data.filter(item => {
      const itemDate = new Date(item.created_at || item.date)
      return itemDate >= dateRange.from && itemDate <= dateRange.to
    })

    const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss')
    
    if (exportFormat === 'csv') {
      const csvContent = convertToCSV(filteredData)
      downloadFile(csvContent, `analytics_${timestamp}.csv`, 'text/csv')
    } else {
      const jsonContent = JSON.stringify(filteredData, null, 2)
      downloadFile(jsonContent, `analytics_${timestamp}.json`, 'application/json')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Download className="w-5 h-5 mr-2" />
          Exporter les données
        </CardTitle>
        <CardDescription>
          Téléchargez vos analytics au format CSV ou JSON
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Format d'export</label>
            <Select value={exportFormat} onValueChange={(value: any) => setExportFormat(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">
                  <div className="flex items-center">
                    <Table className="w-4 h-4 mr-2" />
                    CSV (Excel)
                  </div>
                </SelectItem>
                <SelectItem value="json">
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    JSON
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Période</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from ? format(dateRange.from, 'dd/MM/yyyy', { locale: fr }) : 'Sélectionner'}
                  {dateRange.to && (
                    <>
                      {' - '}
                      {format(dateRange.to, 'dd/MM/yyyy', { locale: fr })}
                    </>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={(range) => {
                    if (range?.from && range?.to) {
                      setDateRange({ from: range.from, to: range.to })
                    }
                  }}
                  locale={fr}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-gray-500">
            {data.length} enregistrements disponibles
          </div>
          <Button 
            onClick={exportData} 
            disabled={isExporting || !data.length}
            className="bg-orange-500 hover:bg-orange-600"
          >
            {isExporting ? (
              <>
                <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Export en cours...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Exporter
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
