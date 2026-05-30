'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/core/ui/card"
import { Badge } from "@/components/core/ui/badge"
import { Button } from "@/components/core/ui/button"
import { Input } from "@/components/core/ui/input"
import { Building, Search, Plus, ExternalLink, Users, MoreVertical, Globe, Mail, MapPin, Loader2, Landmark, X } from "lucide-react"
import { toast } from "sonner"
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from "@/components/core/ui/dialog"
import { Label } from "@/components/core/ui/label"

export default function AdminCompaniesPage() {
    const [companies, setCompanies] = React.useState<any[]>([])
    const [loading, setLoading] = React.useState(true)
    const [searchQuery, setSearchQuery] = React.useState("")
    const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false)
    const [isSubmitting, setIsSubmitting] = React.useState(false)

    // Form state
    const [formData, setFormData] = React.useState({
        name: '',
        slug: '',
        industry: '',
        website: '',
        contact_email: ''
    })

    const fetchCompanies = async () => {
        try {
            const res = await fetch('/api/admin/companies')
            const json = await res.json()
            if (json.success) setCompanies(json.companies)
        } catch (err) {
            toast.error("Erreur de chargement")
        } finally {
            setLoading(false)
        }
    }

    React.useEffect(() => {
        fetchCompanies()
    }, [])

    const handleCreateCompany = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.name || !formData.slug) {
            toast.error("Le nom et l'identifiant (slug) sont obligatoires")
            return
        }

        setIsSubmitting(true)
        try {
            const res = await fetch('/api/admin/companies', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
            const json = await res.json()
            if (json.success) {
                toast.success("Entreprise créée avec succès")
                setIsCreateModalOpen(false)
                setFormData({ name: '', slug: '', industry: '', website: '', contact_email: '' })
                fetchCompanies()
            } else {
                throw new Error(json.error)
            }
        } catch (err: any) {
            toast.error(err.message || "Erreur lors de la création")
        } finally {
            setIsSubmitting(false)
        }
    }

    const filteredCompanies = companies.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.industry?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (loading) return <div className="flex h-[400px] items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /></div>

    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-20">
            {/* Header */}
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-teal-600 rounded-3xl blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/60 backdrop-blur-xl border border-white/40 p-10 rounded-[2.5rem] shadow-sm">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-100 font-black text-[10px] tracking-widest px-3 py-1">
                                CORPORATE
                            </Badge>
                        </div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight text-center">Gestion Entreprises</h1>
                        <p className="text-gray-500 font-medium max-w-xl">
                            Administrez vos comptes B2B, gérez les flottes de cartes et surveillez l'adoption corporate.
                        </p>
                    </div>
                    <Button 
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl h-14 px-8 font-black text-xs tracking-widest gap-2 shadow-xl hover:scale-105 transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        NOUVELLE ENTREPRISE
                    </Button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-none shadow-sm rounded-3xl bg-white p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <Building className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Corporate</p>
                            <p className="text-2xl font-black text-gray-900">{companies.length}</p>
                        </div>
                    </div>
                </Card>
                <Card className="border-none shadow-sm rounded-3xl bg-white p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Employés Actifs</p>
                            <p className="text-2xl font-black text-gray-900">
                                {companies.reduce((acc, curr) => acc + (curr.employee_count?.[0]?.count || 0), 0)}
                            </p>
                        </div>
                    </div>
                </Card>
                <Card className="border-none shadow-sm rounded-3xl bg-white p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
                            <Landmark className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Industrie Top</p>
                            <p className="text-2xl font-black text-gray-900">Tech & Finance</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Controls */}
            <div className="relative">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input 
                    placeholder="Rechercher une entreprise..." 
                    className="pl-14 h-16 rounded-3xl border-none bg-white shadow-sm font-bold text-gray-900"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                <AnimatePresence>
                    {filteredCompanies.map((company, idx) => (
                        <motion.div
                            key={company.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <Card className="border-none shadow-sm rounded-[2.5rem] bg-white overflow-hidden group hover:shadow-2xl transition-all duration-500">
                                <div className="p-8 space-y-6">
                                    <div className="flex items-start justify-between">
                                        <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                                            {company.logo_url ? (
                                                <img src={company.logo_url} alt={company.name} className="w-full h-full object-cover rounded-2xl" />
                                            ) : <Building className="w-8 h-8" />}
                                        </div>
                                        <Button variant="ghost" size="icon" className="rounded-full">
                                            <MoreVertical className="w-4 h-4" />
                                        </Button>
                                    </div>

                                    <div>
                                        <h3 className="text-xl font-black text-gray-900 group-hover:text-emerald-600 transition-colors uppercase tracking-tight">{company.name}</h3>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">{company.industry || 'Secteur non défini'}</p>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 text-xs font-bold text-gray-500">
                                            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                                                <Users className="w-4 h-4" />
                                            </div>
                                            <span>{company.employee_count?.[0]?.count || 0} Employés rattachés</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs font-bold text-gray-500">
                                            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                                                <Globe className="w-4 h-4" />
                                            </div>
                                            <span className="truncate">{company.website || 'Site non renseigné'}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 pt-4">
                                        <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[9px] px-3 py-1 uppercase">
                                            {company.status}
                                        </Badge>
                                        <Badge variant="outline" className="border-gray-100 text-[9px] font-black uppercase tracking-widest text-gray-400">
                                            DEPUIS {format(new Date(company.created_at), 'MMM yyyy', { locale: fr })}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="p-2 px-8 pb-8">
                                    <Button className="w-full h-12 rounded-2xl bg-gray-900 hover:bg-black text-white font-black text-[10px] tracking-widest gap-2">
                                        GÉRER LA FLOTTE
                                        <ExternalLink className="w-3 h-3" />
                                    </Button>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Create Company Modal */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent className="sm:max-w-[500px] border-none rounded-[2.5rem] p-0 overflow-hidden shadow-2xl">
                    <div className="bg-emerald-600 p-8 text-white relative">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black tracking-tight uppercase">Nouvelle Entreprise B2B</DialogTitle>
                            <DialogDescription className="text-emerald-100 font-medium">
                                Enregistrez une nouvelle entité pour la gestion de flotte Ofika.
                            </DialogDescription>
                        </DialogHeader>
                        <Building className="absolute -right-4 -bottom-4 w-24 h-24 text-white opacity-10" />
                    </div>
                    
                    <form onSubmit={handleCreateCompany} className="p-8 space-y-6 bg-white">
                        <div className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Nom de l'entreprise</Label>
                                <Input 
                                    id="name" 
                                    placeholder="Ex: Ofika Group SARL" 
                                    className="h-12 rounded-xl border-gray-100 font-bold"
                                    value={formData.name}
                                    onChange={(e) => {
                                        const name = e.target.value
                                        const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')
                                        setFormData({...formData, name, slug})
                                    }}
                                />
                            </div>
                            
                            <div className="grid gap-2">
                                <Label htmlFor="slug" className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Identifiant unique (slug)</Label>
                                <Input 
                                    id="slug" 
                                    placeholder="ex: ofika-group" 
                                    className="h-12 rounded-xl border-gray-100 font-mono text-xs font-bold bg-gray-50"
                                    value={formData.slug}
                                    onChange={(e) => setFormData({...formData, slug: e.target.value})}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="industry" className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Secteur</Label>
                                    <Input 
                                        id="industry" 
                                        placeholder="Ex: Technologie" 
                                        className="h-12 rounded-xl border-gray-100 font-bold"
                                        value={formData.industry}
                                        onChange={(e) => setFormData({...formData, industry: e.target.value})}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="website" className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Site Web</Label>
                                    <Input 
                                        id="website" 
                                        placeholder="www.exemple.com" 
                                        className="h-12 rounded-xl border-gray-100 font-bold"
                                        value={formData.website}
                                        onChange={(e) => setFormData({...formData, website: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Email Contact</Label>
                                <Input 
                                    id="email" 
                                    type="email"
                                    placeholder="contact@entreprise.com" 
                                    className="h-12 rounded-xl border-gray-100 font-bold"
                                    value={formData.contact_email}
                                    onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
                                />
                            </div>
                        </div>

                        <DialogFooter className="pt-4 gap-3">
                            <Button 
                                type="button" 
                                variant="ghost" 
                                className="rounded-xl font-black text-[10px] tracking-widest uppercase hover:bg-gray-50 h-12 flex-1"
                                onClick={() => setIsCreateModalOpen(false)}
                            >
                                ANNULER
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={isSubmitting}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-[10px] tracking-widest uppercase h-12 flex-1 shadow-lg shadow-emerald-100"
                            >
                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "CRÉER L'ENTREPRISE"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
