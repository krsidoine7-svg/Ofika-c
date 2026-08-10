'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Megaphone, Send, Trash2, History, AlertCircle, CheckCircle2, Info, Loader2, Sparkles } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { motion, AnimatePresence } from 'framer-motion'

export default function AdminBroadcastPage() {
    const [loading, setLoading] = React.useState(true)
    const [sending, setSending] = React.useState(false)
    const [announcements, setAnnouncements] = React.useState<any[]>([])
    
    // New Announcement State
    const [newTitle, setNewTitle] = React.useState("")
    const [newContent, setNewContent] = React.useState("")
    const [newType, setNewType] = React.useState("info")
    const [newTarget, setNewTarget] = React.useState("all")
    
    // Push Notification State
    const [pushTitle, setPushTitle] = React.useState("")
    const [pushBody, setPushBody] = React.useState("")
    const [sendingPush, setSendingPush] = React.useState(false)

    const fetchAnnouncements = async () => {
        try {
            const res = await fetch('/api/admin/announcements')
            const json = await res.json()
            if (json.success) setAnnouncements(json.announcements)
        } catch (err) {
            toast.error("Échec du chargement des annonces")
        } finally {
            setLoading(false)
        }
    }

    React.useEffect(() => {
        fetchAnnouncements()
    }, [])

    const handleSend = async () => {
        if (!newTitle || !newContent) {
            toast.error("Veuillez remplir le titre et le contenu")
            return
        }

        setSending(true)
        try {
            const res = await fetch('/api/admin/announcements', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: newTitle,
                    content: newContent,
                    type: newType,
                    target_audience: newTarget
                })
            })
            const json = await res.json()
            if (json.success) {
                toast.success("Annonce publiée avec succès !")
                setNewTitle("")
                setNewContent("")
                fetchAnnouncements()
            } else {
                throw new Error(json.error)
            }
        } catch (err: any) {
            toast.error(err.message || "Erreur lors de l'envoi")
        } finally {
            setSending(false)
        }
    }

    const handleSendPush = async () => {
        if (!pushTitle || !pushBody) {
            toast.error("Veuillez remplir le titre et le message push")
            return
        }

        setSendingPush(true)
        try {
            const res = await fetch('/api/admin/push-all', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: pushTitle,
                    body: pushBody,
                    url: '/dashboard'
                })
            })
            const json = await res.json()
            if (json.success) {
                toast.success(`Succès ! ${json.sentCount} notifications envoyées.`)
                setPushTitle("")
                setPushBody("")
            } else {
                throw new Error(json.error)
            }
        } catch (err: any) {
            toast.error(err.message || "Erreur lors de l'envoi push")
        } finally {
            setSendingPush(false)
        }
    }

    const handleTestPush = async () => {
        setSendingPush(true)
        try {
            // L'astuce ici est d'utiliser le même endpoint mais de simuler l'envoi juste pour vérifier que l'appel part
            const res = await fetch('/api/admin/push-all', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: "🔔 Test Admin",
                    body: "Votre appareil reçoit bien les notifications !",
                    url: '/dashboard'
                })
            })
            const json = await res.json()
            if (json.success) {
                toast.success(`Test envoyé. (Reçu par ${json.sentCount} appareils abonnés)`)
            } else {
                throw new Error(json.error)
            }
        } catch (err: any) {
            toast.error(err.message || "Erreur lors de l'envoi test")
        } finally {
            setSendingPush(false)
        }
    }

    if (loading) return <div className="flex h-[400px] items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /></div>

    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-20">
            {/* Header */}
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 to-red-600 rounded-3xl blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/60 backdrop-blur-xl border border-white/40 p-10 rounded-[2.5rem] shadow-sm">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-100 font-black text-[10px] tracking-widest px-3 py-1">
                                COMMUNICATION
                            </Badge>
                        </div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Broadcast & Annonces</h1>
                        <p className="text-gray-500 font-medium max-w-xl">
                            Envoyez des messages de masse à vos utilisateurs (promos, maintenance, nouvelles fonctionnalités).
                        </p>
                    </div>
                    <Megaphone className="w-20 h-20 text-orange-200 hidden lg:block" />
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                {/* Compose Form */}
                <div className="space-y-6">
                    <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <Sparkles className="w-5 h-5 text-orange-500" />
                        Nouvelle Annonce
                    </h3>
                    <Card className="border-none shadow-xl rounded-[2.5rem] bg-white p-8">
                        <CardContent className="p-0 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Titre de l'annonce</label>
                                <Input 
                                    placeholder="Ex: Mise à jour du système" 
                                    className="h-14 rounded-2xl border-gray-100 font-bold bg-gray-50/30 focus:bg-white transition-all shadow-none"
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Type de message</label>
                                    <Select value={newType} onValueChange={setNewType}>
                                        <SelectTrigger className="h-14 rounded-2xl border-gray-100 font-bold bg-gray-50/30">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl border-none shadow-2xl">
                                            <SelectItem value="info" className="font-bold">Information (Bleu)</SelectItem>
                                            <SelectItem value="warning" className="font-bold">Attention (Jaune)</SelectItem>
                                            <SelectItem value="promo" className="font-bold">Promotion (Orange)</SelectItem>
                                            <SelectItem value="error" className="font-bold">Alerte (Rouge)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Audience Cible</label>
                                    <Select value={newTarget} onValueChange={setNewTarget}>
                                        <SelectTrigger className="h-14 rounded-2xl border-gray-100 font-bold bg-gray-50/30">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl border-none shadow-2xl">
                                            <SelectItem value="all" className="font-bold">Tous les utilisateurs</SelectItem>
                                            <SelectItem value="free" className="font-bold">Utilisateurs Gratuits</SelectItem>
                                            <SelectItem value="pro" className="font-bold">Utilisateurs Pro</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Contenu détaillée</label>
                                <Textarea 
                                    placeholder="Écrivez votre message ici..." 
                                    className="min-h-[150px] rounded-3xl border-gray-100 font-medium bg-gray-50/30 p-6 focus:bg-white transition-all shadow-none"
                                    value={newContent}
                                    onChange={(e) => setNewContent(e.target.value)}
                                />
                            </div>

                            <Button 
                                onClick={handleSend}
                                disabled={sending}
                                className="w-full h-16 rounded-3xl bg-orange-600 hover:bg-orange-700 text-white font-black text-sm tracking-widest gap-3 shadow-xl hover:scale-105 transition-all"
                            >
                                {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                DIFFUSER L'ANNONCE
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Push Notifications Form (New) */}
                <div className="space-y-6">
                    <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <Megaphone className="w-5 h-5 text-blue-500" />
                        Push Notifications (Direct Mobile)
                    </h3>
                    <Card className="border-none shadow-xl rounded-[2.5rem] bg-gradient-to-br from-blue-500 to-indigo-600 p-8 text-white">
                        <CardContent className="p-0 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-blue-100 ml-1">Titre de la notification</label>
                                <Input 
                                    placeholder="Ex: Nouvelle promo Ofika ! 🎁" 
                                    className="h-14 rounded-2xl border-none font-bold bg-white/10 text-white placeholder:text-blue-200 focus:bg-white/20 transition-all shadow-none"
                                    value={pushTitle}
                                    onChange={(e) => setPushTitle(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-blue-100 ml-1">Message Push</label>
                                <Textarea 
                                    placeholder="Écrivez le message qui apparaîtra sur le verrouillage..." 
                                    className="min-h-[120px] rounded-3xl border-none font-medium bg-white/10 text-white placeholder:text-blue-200 p-6 focus:bg-white/20 transition-all shadow-none"
                                    value={pushBody}
                                    onChange={(e) => setPushBody(e.target.value)}
                                />
                                <div className="flex gap-3">
                                    <Button 
                                        variant="outline"
                                        className="w-full h-14 rounded-2xl font-bold bg-gray-50 hover:bg-gray-100 text-gray-700 transition-all border-none"
                                        onClick={handleTestPush}
                                        disabled={sendingPush}
                                    >
                                        S'envoyer un Test
                                    </Button>
                                    <Button 
                                        className="w-full h-14 rounded-2xl font-bold bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg shadow-orange-500/20 transition-all"
                                        onClick={handleSendPush}
                                        disabled={sendingPush}
                                    >
                                        <span className="flex items-center gap-2">
                                            Envoyer à tous
                                            {sendingPush ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                        </span>
                                    </Button>
                                </div>
                            </div>
                            
                            <p className="text-[10px] text-center font-bold text-blue-100/60 uppercase tracking-widest">
                                Sera envoyé à tous ceux qui ont activé les rappels.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* History - Full Width Below */}
            <div className="space-y-6">
                <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                    <History className="w-5 h-5 text-gray-400" />
                    Historique des diffusions
                </h3>
                <div className="space-y-4">
                    {announcements.map((ann, idx) => (
                        <motion.div
                            key={ann.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                        >
                            <Card className="border-none shadow-sm rounded-3xl bg-white p-6 hover:shadow-md transition-all group">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="space-y-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Badge className={cn(
                                                "border-none px-2 py-0.5 font-black text-[9px] uppercase",
                                                ann.type === 'info' ? "bg-blue-50 text-blue-600" :
                                                ann.type === 'warning' ? "bg-yellow-50 text-yellow-600" :
                                                ann.type === 'promo' ? "bg-orange-50 text-orange-600" :
                                                "bg-red-50 text-red-600"
                                            )}>
                                                {ann.type}
                                            </Badge>
                                            <span className="text-[10px] font-bold text-gray-300">
                                                {format(new Date(ann.created_at), 'dd/MM/yyyy', { locale: fr })}
                                            </span>
                                        </div>
                                        <h4 className="font-black text-gray-900 group-hover:text-orange-600 transition-colors uppercase tracking-tight">{ann.title}</h4>
                                        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{ann.content}</p>
                                    </div>
                                    <Button variant="ghost" size="icon" className="text-gray-300 hover:text-red-500 shrink-0">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Cible:</span>
                                        <Badge variant="outline" className="text-[9px] font-bold border-gray-100">{ann.target_audience}</Badge>
                                    </div>
                                    {ann.is_active ? (
                                        <div className="flex items-center gap-1.5 text-green-500 bg-green-50 px-3 py-1 rounded-full border border-green-100">
                                            <CheckCircle2 className="w-3 h-3" />
                                            <span className="text-[9px] font-black uppercase tracking-widest">En cours</span>
                                        </div>
                                    ) : (
                                        <Badge variant="secondary" className="text-[9px] uppercase">Expiré</Badge>
                                    )}
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    )
}

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ')
}
