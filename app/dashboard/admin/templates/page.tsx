'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sparkles, Search, Plus, Eye, Layout, Palette, Code, CheckCircle2, MoreVertical, Trash2, Edit3, Image as ImageIcon, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from "sonner"

export default function AdminTemplatesPage() {
    const [loading, setLoading] = React.useState(true)
    const [searchQuery, setSearchQuery] = React.useState("")

    // Mock templates data based on the app's existing designs
    const [templates, setTemplates] = React.useState([
        { id: 'design1', name: 'Classique', category: 'Standard', views: 840, uses: 1250, status: 'active', color: 'bg-blue-500' },
        { id: 'design2', name: 'Design Modern', category: 'Standard', views: 920, uses: 1100, status: 'active', color: 'bg-indigo-500' },
        { id: 'design3', name: 'Créatif', category: 'Standard', views: 750, uses: 600, status: 'active', color: 'bg-purple-500' },
        { id: 'design4', name: 'Nature', category: 'Ecologique', views: 430, uses: 300, status: 'active', color: 'bg-green-500' },
        { id: 'influencer', name: 'Influenceur', category: 'Premium', views: 1560, uses: 890, status: 'active', color: 'bg-pink-500' },
        { id: 'ecommerce', name: 'E-commerce', category: 'Premium', views: 1100, uses: 450, status: 'active', color: 'bg-emerald-500' },
        { id: 'freelance', name: 'Freelance', category: 'Premium', views: 890, uses: 720, status: 'active', color: 'bg-amber-500' }
    ])

    React.useEffect(() => {
        // Simulation loading
        const timer = setTimeout(() => setLoading(false), 500)
        return () => clearTimeout(timer)
    }, [])

    const filteredTemplates = templates.filter(t => 
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (loading) return <div className="flex h-[400px] items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /></div>

    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-20">
            {/* Header */}
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-400 to-indigo-600 rounded-3xl blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/60 backdrop-blur-xl border border-white/40 p-10 rounded-[2.5rem] shadow-sm">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="bg-purple-50 text-purple-600 border-purple-100 font-black text-[10px] tracking-widest px-3 py-1">
                                UI / UX ENGINE
                            </Badge>
                        </div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Gestion des Templates</h1>
                        <p className="text-gray-500 font-medium max-w-xl">
                            Configurez les mises en page visuelles disponibles pour vos utilisateurs et gérez les styles premium.
                        </p>
                    </div>
                    <Button className="bg-purple-600 hover:bg-purple-700 text-white rounded-2xl h-14 px-8 font-black text-xs tracking-widest gap-2 shadow-xl hover:scale-105 transition-all">
                        <Plus className="w-4 h-4" />
                        NOUVEAU TEMPLATE
                    </Button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="border-none shadow-sm rounded-3xl bg-white p-6">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Templates</p>
                    <p className="text-2xl font-black text-gray-900">{templates.length}</p>
                </Card>
                <Card className="border-none shadow-sm rounded-3xl bg-white p-6">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Plus Utilisé</p>
                    <p className="text-2xl font-black text-purple-600 uppercase tracking-tight">Influencer</p>
                </Card>
                <Card className="border-none shadow-sm rounded-3xl bg-white p-6">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Nouveauté</p>
                    <p className="text-2xl font-black text-gray-900 uppercase tracking-tight">E-commerce</p>
                </Card>
                <Card className="border-none shadow-sm rounded-3xl bg-white p-6">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</p>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <p className="text-2xl font-black text-gray-900">SYNCED</p>
                    </div>
                </Card>
            </div>

            {/* Controls */}
            <div className="relative">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input 
                    placeholder="Rechercher un template..." 
                    className="pl-14 h-16 rounded-3xl border-none bg-white shadow-sm font-bold text-gray-900"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <AnimatePresence>
                    {filteredTemplates.map((template, idx) => (
                        <motion.div
                            key={template.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.05 }}
                        >
                            <Card className="border-none shadow-sm rounded-[2.5rem] bg-white overflow-hidden group hover:shadow-2xl transition-all duration-500 relative">
                                <div className={`h-40 ${template.color} relative overflow-hidden flex items-center justify-center`}>
                                   <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                                   <Layout className="w-16 h-16 text-white/40 group-hover:scale-110 transition-transform duration-500" />
                                   
                                   {/* Status Badge Over Image */}
                                   <div className="absolute top-6 left-6">
                                       <Badge className="bg-white/90 backdrop-blur-md text-gray-900 border-none font-black text-[9px] px-3 py-1 rounded-full uppercase">
                                           {template.category}
                                       </Badge>
                                   </div>
                                </div>

                                <div className="p-8 space-y-6">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="text-xl font-black text-gray-900 group-hover:text-purple-600 transition-colors uppercase tracking-tight">{template.name}</h3>
                                            <p className="text-[10px] font-mono text-gray-400 font-bold uppercase mt-1">ID: {template.id}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="icon" className="rounded-xl hover:bg-gray-50"><Edit3 className="w-4 h-4" /></Button>
                                            <Button variant="ghost" size="icon" className="rounded-xl hover:bg-gray-50"><MoreVertical className="w-4 h-4" /></Button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-gray-50 p-4 rounded-2xl">
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Vues</p>
                                            <p className="text-sm font-black text-gray-900">{template.views.toLocaleString()}</p>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-2xl">
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Utilisations</p>
                                            <p className="text-sm font-black text-gray-900">{template.uses.toLocaleString()}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 pt-4">
                                        <Button className="flex-1 h-12 rounded-2xl bg-gray-900 hover:bg-black text-white font-black text-[10px] tracking-widest gap-2">
                                            <Eye className="w-3 h-3" />
                                            PRÉVISUALISER
                                        </Button>
                                        <Button variant="outline" className="h-12 w-12 rounded-2xl border-gray-100 flex items-center justify-center">
                                            <Code className="w-4 h-4 text-gray-400" />
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Add New Placeholder */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="border-4 border-dashed border-gray-100 rounded-[2.5rem] flex flex-col items-center justify-center p-12 text-center space-y-6 hover:border-purple-200 transition-colors cursor-pointer group"
                >
                    <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-purple-50 group-hover:text-purple-500 transition-all duration-500">
                        <Plus className="w-10 h-10" />
                    </div>
                    <div>
                        <h4 className="text-lg font-black text-gray-900 uppercase">Créer un Layout</h4>
                        <p className="text-xs text-gray-400 font-medium">Ajoutez un nouveau design React à votre catalogue.</p>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
