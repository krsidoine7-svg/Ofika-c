import { SupportTicket } from '@/lib/services/support-tickets'

/**
 * Exporte une liste de tickets/avis au format CSV compatible avec Microsoft Excel (BOM UTF-8)
 */
export function exportTicketsToCSV(tickets: SupportTicket[], filenamePrefix: string = 'ofika_tickets_avis') {
  if (!tickets || tickets.length === 0) return

  const headers = [
    'Numéro Ticket',
    'Catégorie',
    'Auteur',
    'Rôle / Profession',
    'Localisation',
    'Sujet',
    'Description',
    'Note (sur 5)',
    'Statut',
    'Publié sur Landing Page',
    'Date de Création'
  ]

  const formatCategory = (cat: string) => {
    switch (cat) {
      case 'review': return 'Avis Client'
      case 'suggestion': return 'Suggestion'
      case 'bug': return 'Signalement Bug'
      case 'support': return 'Support / Question'
      default: return cat
    }
  }

  const rows = tickets.map(t => [
    t.ticket_number || '',
    formatCategory(t.category),
    `"${(t.author_name || 'Anonyme').replace(/"/g, '""')}"`,
    `"${(t.author_role || '').replace(/"/g, '""')}"`,
    `"${(t.author_location || '').replace(/"/g, '""')}"`,
    `"${(t.subject || '').replace(/"/g, '""')}"`,
    `"${(t.description || '').replace(/"/g, '""')}"`,
    t.rating || '',
    t.status || '',
    t.is_featured ? 'Oui' : 'Non',
    t.created_at ? new Date(t.created_at).toLocaleString('fr-FR') : ''
  ])

  // Ajout du BOM \uFEFF pour qu'Excel ouvre directement le fichier avec l'encodage UTF-8 (accents é, è, à)
  const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n')
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  const dateStr = new Date().toISOString().split('T')[0]
  
  link.setAttribute('href', url)
  link.setAttribute('download', `${filenamePrefix}_${dateStr}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Exporte une liste de tickets/avis au format JSON structuré
 */
export function exportTicketsToJSON(tickets: SupportTicket[], filenamePrefix: string = 'ofika_tickets_avis') {
  if (!tickets || tickets.length === 0) return

  const jsonContent = JSON.stringify(tickets, null, 2)
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  const dateStr = new Date().toISOString().split('T')[0]

  link.setAttribute('href', url)
  link.setAttribute('download', `${filenamePrefix}_${dateStr}.json`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
