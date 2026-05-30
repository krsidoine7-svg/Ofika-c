'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/core/ui/card"
import { Badge } from "@/components/core/ui/badge"
import { Button } from "@/components/core/ui/button"
import { Input } from "@/components/core/ui/input"
import { Search, Download, Loader2, Mail, Phone, Calendar, User, Building, Trash2, CheckCircle2 } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { toast } from "sonner"
import { motion, AnimatePresence } from 'framer-motion'

export default function AdminLeadsPage() {
    const [leads, setLeads] = React.useState<any[]>([])
    const [loading, setLoading] = React.useState(true)
    const [searchQuery, setSearchQuery] = React.useState("")

    const fetchLeads = async () => {
        try {
            const res = await fetch('/api/admin/leads')
            const json = await res.json()
            if (json.success) {
                setLeads(json.leads)
            }
        } catch (err) {
            console.error(err)
            toast.error("Erreur lors de la récupération des leads")
        } finally {
            setLoading(false)
        }
    }

    React.useEffect(() => {
        fetchLeads()
    }, [])

    const filteredLeads = leads.filter(lead => 
        (lead.name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (lead.email?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (lead.company?.toLowerCase().includes(searchQuery.toLowerCase()))
    )

    const exportToCSV = () => {
        const headers = ["Date", "Nom", "Email", "Téléphone", "Entreprise", "Fonction", "Profil Source", "Message"]
        const rows = filteredLeads.map(lead => [
            format(new Date(lead.created_at), 'dd/MM/yyyy HH:mm'),
            lead.name,
            lead.email,
            lead.phone,
            lead.company,
            lead.job_title,
            lead.profiles?.name || lead.profile_id,
            lead.message
        ])

        const csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n")

        const encodedUri = encodeURI(csvContent)
        const link = document.createElement("a")
        link.setAttribute("href", encodedUri)
        link.setAttribute("download", `ofika-leads-${format(new Date(), 'yyyy-MM-dd')}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 shadow-sm h-8 animate-spin text-orange-500" />
            </div>
        )
    }

    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-20">
            {/* Header */}
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-3xl blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/60 backdrop-blur-xl border border-white/40 p-10 rounded-[2.5rem] shadow-sm">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-100 font-black text-[10px] tracking-widest px-3 py-1">
                                CRM & LEADS
                            </Badge>
                        </div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Centrale des Leads</h1>
                        <p className="text-gray-500 font-medium max-w-xl">
                            Consultez et exportez tous les contacts capturés par vos utilisateurs via leurs mini-sites Ofika.
                        </p>
                    </div>
                    <Button 
                        onClick={exportToCSV}
                        className="bg-gray-900 hover:bg-black text-white rounded-2xl px-6 h-14 font-black text-xs tracking-widest gap-2 shadow-xl hover:scale-105 transition-all"
                    >
                        <Download className="w-4 h-4" />
                        EXPORTER CSV
                    </Button>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input 
                        placeholder="Rechercher un lead (nom, email, entreprise...)" 
                        className="pl-14 h-16 rounded-3xl border-none bg-white shadow-sm font-bold text-gray-900 placeholder:text-gray-300 focus-visible:ring-2 focus-visible:ring-blue-500/20 transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Leads Table/Grid */}
            <div className="grid grid-cols-1 gap-6">
                <AnimatePresence mode="popLayout">
                    {filteredLeads.length > 0 ? (
                        filteredLeads.map((lead, idx) => (
                            <motion.div
                                key={lead.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <Card className="border-none shadow-sm rounded-3xl bg-white hover:shadow-xl transition-all group overflow-hidden">
                                    <div className="p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                                        <div className="flex flex-col lg:flex-row lg:items-center gap-8 flex-1">
                                            {/* Avatar/Initial */}
                                            <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors shrink-0">
                                                <User className="w-8 h-8" />
                                            </div>

                                            {/* Info Principale */}
                                            <div className="space-y-3 flex-1 min-w-0">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="text-xl font-black text-gray-900 truncate">{lead.name}</h3>
                                                    {lead.company && (
                                                        <Badge variant="secondary" className="bg-gray-100 text-gray-600 font-bold px-3 py-1 rounded-lg">
                                                            <Building className="w-3 h-3 mr-1" />
                                                            {lead.company}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="flex flex-wrap gap-4">
                                                    <div className="flex items-center gap-2 text-sm font-bold text-gray-400 group-hover:text-gray-600 transition-colors">
                                                        <Mail className="w-4 h-4" />
                                                        {lead.email || 'Pas d\'email'}
                                                    </div>
                                                    {lead.phone && (
                                                        <div className="flex items-center gap-2 text-sm font-bold text-gray-400">
                                                            <Phone className="w-4 h-4" />
                                                            {lead.phone}
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-2 text-sm font-bold text-blue-400">
                                                        <Calendar className="w-4 h-4" />
                                                        {format(new Date(lead.created_at), 'dd MMM yyyy', { locale: fr })}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Profil Source */}
                                        <div className="flex flex-col lg:items-end gap-2">
                                            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Source</span>
                                            <div className="flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-xl border border-orange-100">
                                                <div className="w-2 h-2 bg-orange-500 rounded-full" />
                                                <span className="text-xs font-black text-orange-600">@{lead.profiles?.username || 'Inconnu'}</span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" className="h-12 w-12 rounded-2xl text-gray-400 hover:text-red-500 hover:bg-red-50">
                                                <Trash2 className="w-5 h-5" />
                                            </Button>
                                            <Button variant="outline" className="h-12 rounded-2xl border-gray-100 font-black text-xs px-6 hover:bg-gray-50">
                                                VOIR DÉTAILS
                                            </Button>
                                        </div>
                                    </div>
                                    
                                    {/* Message Preview */}
                                    {lead.message && (
                                        <div className="px-8 pb-8">
                                            <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100">
                                                <p className="text-sm italic text-gray-500 line-clamp-2">
                                                    "{lead.message}"
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </Card>
                            </motion.div>
                        ))
                    ) : (
                        <div className="py-24 text-center space-y-4 bg-white rounded-[3rem] border border-dashed border-gray-200">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
                                <Search className="w-10 h-10" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-gray-900">Aucun lead trouvé</h3>
                                <p className="text-gray-400 font-medium">Réessayez avec d'autres critères de recherche.</p>
                            </div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
