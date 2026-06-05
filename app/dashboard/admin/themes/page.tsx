'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { 
    Palette, 
    Layout, 
    Plus, 
    Eye, 
    Loader2, 
    Sparkles, 
    Paintbrush,
    Image as ImageIcon,
    Trash2,
    Settings,
    X,
    Users,
    BarChart3,
    Grid3X3,
    ToggleLeft,
    ToggleRight,
    Edit3,
    Save,
    ChevronDown,
    Smartphone
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

// Design components
import { LinkInBioDesign1 } from "@/components/features/profiles/LinkInBioDesign1"
import { LinkInBioDesign2 } from "@/components/features/profiles/LinkInBioDesign2"
import { LinkInBioDesign3 } from "@/components/features/profiles/LinkInBioDesign3"
import { LinkInBioDesign4 } from "@/components/features/profiles/LinkInBioDesign4"
import { LinkInBioDesign7 } from "@/components/features/profiles/LinkInBioDesign7"
import { LinkInBioInfluencer } from "@/components/features/profiles/LinkInBioInfluencer"
import { LinkInBioEcommerce } from "@/components/features/profiles/LinkInBioEcommerce"
import { LinkInBioFreelance } from "@/components/features/profiles/LinkInBioFreelance"

// Données d'exemple pour la prévisualisation
const PREVIEW_PROFILE = {
    id: 'preview-admin',
    user_id: 'admin',
    name: 'Marie Dupont',
    bio: 'Consultante en transformation digitale 🚀 Créatrice de contenu • Conférencière',
    image_url: '',
    email: 'marie@exemple.com',
    phone: '+225 0712345678',
    location: 'Abidjan, Côte d\'Ivoire',
    username: 'marie-dupont',
    custom_url: 'marie-dupont',
    is_public: true,
    is_active: true,
    display_reviews: false,
    profile_type: 'professional',
    design_choice: 'design1',
    color_theme: 'default',
    links: [
        { id: '1', title: 'Mon Portfolio', url: 'https://portfolio.exemple.com', type: 'website', is_active: true, order_index: 0, click_count: 0, position: 0, created_at: '', updated_at: '' },
        { id: '2', title: 'Réserver un appel', url: 'https://calendly.com/mariedupont', type: 'website', is_active: true, order_index: 1, click_count: 0, position: 1, created_at: '', updated_at: '' },
    ],
    social_links: [
        { type: 'instagram', url: 'https://instagram.com/mariedupont' },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
}

// Mapping slug → design component key
const SLUG_TO_DESIGN: Record<string, string> = {
    'design1': 'design1', 'classique': 'design1', 'classic': 'design1',
    'design2': 'design2', 'design': 'design2',
    'design3': 'design3', 'creatif': 'design3', 'creative': 'design3',
    'design4': 'design4', 'nature': 'design4',
    'influencer': 'influencer', 'influenceur': 'influencer',
    'ecommerce': 'ecommerce', 'e-commerce': 'ecommerce',
    'design7': 'design7', 'dark-elegant': 'design7', 'dark': 'design7',
    'freelance': 'freelance',
}

const DESIGN_NAMES: Record<string, string> = {
    design1: 'Classique', design2: 'Design', design3: 'Créatif', design4: 'Nature',
    influencer: 'Influenceur', ecommerce: 'E-commerce', design7: 'Dark Elegant', freelance: 'Freelance'
}

export default function AdminThemesPage() {
    const [data, setData] = useState<{templates: any[], recentDesigns: any[], stats: any}>({templates: [], recentDesigns: [], stats: { totalThemes: 0, totalCategories: 0, totalUsage: 0, categories: [] }})
    const [loading, setLoading] = useState(true)
    const [showCreateForm, setShowCreateForm] = useState(false)
    const [creating, setCreating] = useState(false)
    const [newTheme, setNewTheme] = useState({ name: '', slug: '', description: '', category: 'professional', icon: 'layout' })
    const [filterCategory, setFilterCategory] = useState('all')
    const [previewTheme, setPreviewTheme] = useState<any>(null)

    const fetchThemes = async () => {
        try {
            setLoading(true)
            const res = await fetch('/api/admin/themes')
            const json = await res.json()
            if (json.success) setData(json)
        } catch (err) {
            toast.error("Erreur lors du chargement des thèmes")
        } finally {
            setLoading(false)
        }
    }

    const handleCreateTheme = async () => {
        if (!newTheme.name || !newTheme.slug) {
            toast.error("Le nom et le slug sont obligatoires")
            return
        }
        try {
            setCreating(true)
            const res = await fetch('/api/admin/themes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newTheme.name,
                    slug: newTheme.slug.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
                    description: newTheme.description,
                    category: newTheme.category,
                    icon: newTheme.icon,
                    is_active: true
                })
            })
            const json = await res.json()
            if (json.success) {
                toast.success("Thème créé avec succès !")
                setShowCreateForm(false)
                setNewTheme({ name: '', slug: '', description: '', category: 'professional', icon: 'layout' })
                fetchThemes()
            } else {
                toast.error(json.error)
            }
        } catch (err) {
            toast.error("Erreur lors de la création")
        } finally {
            setCreating(false)
        }
    }

    const handleDeleteTheme = async (id: string) => {
        if (!window.confirm("Supprimer ce thème ?")) return
        try {
            const res = await fetch(`/api/admin/themes?id=${id}`, { method: 'DELETE' })
            const json = await res.json()
            if (json.success) {
                toast.success("Thème supprimé")
                fetchThemes()
            }
        } catch (err) {
            toast.error("Erreur")
        }
    }

    const handleToggleActive = async (theme: any) => {
        try {
            await fetch('/api/admin/themes', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: theme.id, is_active: !theme.is_active })
            })
            fetchThemes()
        } catch (err) {
            toast.error("Erreur")
        }
    }

    useEffect(() => {
        fetchThemes()
    }, [])

    const filteredTemplates = filterCategory === 'all' 
        ? data.templates 
        : data.templates.filter(t => t.category === filterCategory)

    const categoryColors: Record<string, string> = {
        professional: 'bg-blue-50 text-blue-600 border-blue-100',
        personal: 'bg-purple-50 text-purple-600 border-purple-100',
        event: 'bg-pink-50 text-pink-600 border-pink-100',
        ecommerce: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        creative: 'bg-amber-50 text-amber-600 border-amber-100',
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="flex-1 space-y-2">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <Palette className="w-8 h-8 text-orange-500" />
                        Thèmes & Design
                    </h1>
                    <p className="text-gray-500 font-medium">Gestion des apparences et contrôle esthétique de la plateforme.</p>
                </div>
                <Button 
                    className="bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs h-12 shadow-lg shadow-orange-200"
                    onClick={() => setShowCreateForm(!showCreateForm)}
                >
                    {showCreateForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                    {showCreateForm ? 'Annuler' : 'Nouveau Thème'}
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-none shadow-sm rounded-3xl bg-white">
                    <CardContent className="p-6 text-center">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-orange-50 flex items-center justify-center">
                            <Grid3X3 className="w-6 h-6 text-orange-500" />
                        </div>
                        <p className="text-3xl font-black text-gray-900">{data.stats.totalThemes}</p>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Thèmes</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm rounded-3xl bg-white">
                    <CardContent className="p-6 text-center">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-blue-50 flex items-center justify-center">
                            <Layout className="w-6 h-6 text-blue-500" />
                        </div>
                        <p className="text-3xl font-black text-gray-900">{data.stats.totalCategories}</p>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Catégories</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm rounded-3xl bg-white">
                    <CardContent className="p-6 text-center">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-green-50 flex items-center justify-center">
                            <Users className="w-6 h-6 text-green-500" />
                        </div>
                        <p className="text-3xl font-black text-gray-900">{data.stats.totalUsage}</p>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Utilisations</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm rounded-3xl bg-white">
                    <CardContent className="p-6 text-center">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-purple-50 flex items-center justify-center">
                            <BarChart3 className="w-6 h-6 text-purple-500" />
                        </div>
                        <p className="text-3xl font-black text-gray-900">{data.templates.filter(t => t.is_active).length}</p>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Actifs</p>
                    </CardContent>
                </Card>
            </div>

            {/* Create Form */}
            {showCreateForm && (
                <Card className="border-2 border-orange-200 shadow-lg rounded-[2rem] bg-white animate-in fade-in slide-in-from-top-4 duration-300 overflow-hidden">
                    <CardHeader className="p-8 bg-orange-50/50 border-b border-orange-100">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-orange-500" />
                            Créer un Nouveau Thème
                        </CardTitle>
                        <CardDescription>Définissez les bases de votre thème.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Nom *</label>
                                <Input 
                                    value={newTheme.name}
                                    onChange={(e) => setNewTheme({
                                        ...newTheme, 
                                        name: e.target.value,
                                        slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
                                    })}
                                    className="rounded-xl h-12"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Slug *</label>
                                <Input 
                                    value={newTheme.slug}
                                    onChange={(e) => setNewTheme({...newTheme, slug: e.target.value})}
                                    className="rounded-xl h-12 font-mono text-sm"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3">
                            <Button variant="ghost" onClick={() => setShowCreateForm(false)}>Annuler</Button>
                            <Button onClick={handleCreateTheme} disabled={creating} className="bg-orange-500 text-white rounded-xl uppercase tracking-widest text-xs h-11 px-8">
                                {creating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                Créer
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Category Filters */}
            <div className="flex items-center gap-2 flex-wrap">
                <Button 
                    size="sm" variant={filterCategory === 'all' ? 'default' : 'outline'}
                    onClick={() => setFilterCategory('all')}
                    className="rounded-xl text-xs font-black uppercase tracking-widest"
                >
                    Tous ({data.templates.length})
                </Button>
                {data.stats.categories?.map((cat: string) => (
                    <Button 
                        key={cat} size="sm" variant={filterCategory === cat ? 'default' : 'outline'}
                        onClick={() => setFilterCategory(cat)}
                        className="rounded-xl text-xs font-black uppercase tracking-widest"
                    >
                        {cat}
                    </Button>
                ))}
            </div>

            {/* Templates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.map((theme) => (
                    <Card key={theme.id} className="border-none shadow-sm rounded-3xl overflow-hidden group hover:shadow-xl transition-all duration-300">
                        <div className="aspect-[16/9] bg-gray-100 flex items-center justify-center">
                            <Layout className="w-8 h-8 opacity-20" />
                        </div>
                        <CardContent className="p-6">
                            <h3 className="font-black text-gray-900">{theme.name}</h3>
                            <div className="mt-4 flex items-center justify-between">
                                <Button size="sm" variant="ghost" className="text-orange-500 p-0 h-8 w-8" onClick={() => setPreviewTheme(theme)}>
                                    <Eye className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="ghost" className="text-gray-400 p-0 h-8 w-8" onClick={() => handleDeleteTheme(theme.id)}>
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Preview Modal */}
            {previewTheme && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setPreviewTheme(null)}>
                    <div className="relative flex flex-col items-center gap-6 max-h-[95vh]" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-4 text-white">
                            <Smartphone className="w-5 h-5" />
                            <h3 className="font-black text-lg">{previewTheme.name}</h3>
                            <Button size="sm" variant="ghost" className="text-white hover:bg-white/10 rounded-full h-8 w-8 p-0" onClick={() => setPreviewTheme(null)}>
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                        <div className="relative w-[300px] h-[600px] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border-[6px] border-gray-800">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-gray-800 rounded-b-2xl z-20" />
                            <div className="w-full h-full overflow-y-auto" style={{ transform: 'scale(0.72)', transformOrigin: 'top left', width: '138.9%', height: '138.9%' }}>
                                    {(() => {
                                        const designKey = SLUG_TO_DESIGN[previewTheme.slug] || ''
                                        const profileData = { ...PREVIEW_PROFILE, design_choice: designKey } as any
                                        switch(designKey) {
                                            case 'design1': return <LinkInBioDesign1 profile={profileData} isPreview={true} />
                                            case 'design2': return <LinkInBioDesign2 profile={profileData} isPreview={true} />
                                            case 'design3': return <LinkInBioDesign3 profile={profileData} isPreview={true} />
                                            case 'design4': return <LinkInBioDesign4 profile={profileData} isPreview={true} />
                                            case 'design7': return <LinkInBioDesign7 profile={profileData} isPreview={true} />
                                            case 'influencer': return <LinkInBioInfluencer profile={profileData} isPreview={true} />
                                            case 'ecommerce': return <LinkInBioEcommerce profile={profileData} isPreview={true} />
                                            case 'freelance': return <LinkInBioFreelance profile={profileData} isPreview={true} />
                                            default: return <div className="p-8 text-center">Design {previewTheme.slug} non prêt</div>
                                        }
                                    })()}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
