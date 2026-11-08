'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, ArrowRight, Smartphone, MessageCircle, UserPlus, MousePointer2, AlertTriangle, Clock, Zap } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export const FrictionSection = () => {
    const [activeTab, setActiveTab] = useState<'friction' | 'solution'>('friction')

    // Cycle automatically every 5 seconds if the user hasn't interacted
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveTab(prev => prev === 'friction' ? 'solution' : 'friction')
        }, 8000)
        return () => clearInterval(interval)
    }, [])

    const frictionSteps = [
        { id: 1, text: "Recopier le numéro...", icon: <MousePointer2 className="w-4 h-4" />, delay: 0.1 },
        { id: 2, text: "Quitter l'application...", icon: <Smartphone className="w-4 h-4" />, delay: 0.2 },
        { id: 3, text: "Ouvrir les Contacts...", icon: <UserPlus className="w-4 h-4" />, delay: 0.3 },
        { id: 4, text: "Enregistrer le contact...", icon: <Check className="w-4 h-4" />, delay: 0.4 },
        { id: 5, text: "Ouvrir WhatsApp...", icon: <MessageCircle className="w-4 h-4" />, delay: 0.5 },
        { id: 6, text: "Chercher le nom...", icon: <MessageCircle className="w-4 h-4" />, delay: 0.6 },
    ]

    return (
        <section id="problem" className="py-24 bg-white overflow-hidden relative">
            {/* Decoration Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 -left-20 w-80 h-80 bg-orange-100/30 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-purple-100/30 rounded-full blur-3xl" />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-16">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <Badge className="mb-4 px-4 py-1.5 bg-orange-100 text-orange-600 border-orange-200 uppercase tracking-widest font-bold text-xs">
                                Le Problème vs La Solution
                            </Badge>
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-6 tracking-tight">
                                Vos clients veulent acheter.<br />
                                <span className="text-gray-400">Mais c'est trop compliqué.</span>
                            </h2>
                        </motion.div>

                        {/* Switcher */}
                        <div className="flex justify-center mt-10">
                            <div className="bg-gray-100 p-1.5 rounded-2xl flex items-center shadow-inner border border-gray-200">
                                <button
                                    onClick={() => setActiveTab('friction')}
                                    className={`px-6 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'friction' ? 'bg-white shadow-md text-red-600' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    <AlertTriangle className="w-4 h-4" />
                                    Le Parcours Classique
                                </button>
                                <button
                                    onClick={() => setActiveTab('solution')}
                                    className={`px-6 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'solution' ? 'bg-white shadow-md text-orange-600' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    <Zap className="w-4 h-4" />
                                    L'Autoroute Ofika
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center min-h-[600px]">
                        {/* Simulation Column */}
                        <div className="relative flex justify-center order-2 lg:order-1">
                            <AnimatePresence mode="wait">
                                {activeTab === 'friction' ? (
                                    <motion.div
                                        key="friction-phone"
                                        initial={{ opacity: 0, x: -50 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -50 }}
                                        transition={{ duration: 0.5, ease: "easeOut" }}
                                        className="relative"
                                    >
                                        {/* Realistic Phone Shell - Friction Version */}
                                        <div className="w-[300px] h-[600px] bg-gray-900 rounded-[3rem] p-3 shadow-2xl border-[8px] border-gray-800 relative">
                                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-800 rounded-b-2xl z-20" />

                                            {/* Screen Content */}
                                            <div className="w-full h-full bg-white rounded-[2.2rem] overflow-hidden relative flex flex-col">
                                                {/* Header Mockup */}
                                                <div className="h-14 bg-gray-50 border-b flex items-center px-4 justify-between">
                                                    <div className="flex gap-2 items-center">
                                                        <div className="w-2 h-2 rounded-full bg-red-400" />
                                                        <div className="h-2 w-16 bg-gray-200 rounded" />
                                                    </div>
                                                    <div className="h-2 w-8 bg-gray-200 rounded" />
                                                </div>

                                                {/* Profile Mockup */}
                                                <div className="p-6 text-center space-y-4 pt-10">
                                                    <div className="w-24 h-24 rounded-full bg-orange-50 mx-auto border-2 border-orange-100 flex items-center justify-center overflow-hidden">
                                                        <img
                                                            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                                                            alt="Entrepreneur"
                                                            className="w-full h-full object-cover grayscale opacity-80"
                                                        />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-black text-gray-900 text-xl tracking-tight">JD</h4>
                                                        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mt-1">💼 Entrepreneur & Coach</p>
                                                    </div>

                                                    <div className="space-y-4 pt-4">
                                                        <div className="text-center">
                                                            <p className="text-[10px] text-gray-400 font-bold mb-1">👇 Écris-moi sur WhatsApp :</p>
                                                            <div className="bg-yellow-50 border-2 border-dashed border-red-200 py-3 rounded-xl">
                                                                <span className="font-mono text-red-500 font-bold tracking-widest text-lg">0712018685</span>
                                                            </div>
                                                        </div>

                                                        <div className="w-full h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                                                            <span className="text-gray-400 text-xs font-bold italic">Lien indisponible</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Friction Overlay */}
                                                <div className="absolute inset-0 bg-red-900/10 backdrop-blur-[2px] z-10 flex items-center justify-center p-6">
                                                    <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-2xl border border-red-100 w-full space-y-3">
                                                        {frictionSteps.map((step, i) => (
                                                            <motion.div
                                                                key={step.id}
                                                                initial={{ opacity: 0, x: -10 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                transition={{ delay: i * 0.15, duration: 0.3 }}
                                                                className="flex items-center gap-3"
                                                            >
                                                                <div className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-[10px] font-black shrink-0">
                                                                    {step.id}
                                                                </div>
                                                                <span className="text-[11px] font-bold text-gray-600 leading-none">{step.text}</span>
                                                            </motion.div>
                                                        ))}

                                                        <motion.div
                                                            initial={{ scale: 0, rotate: -10 }}
                                                            animate={{ scale: 1, rotate: 5 }}
                                                            transition={{ delay: 1, type: "spring" }}
                                                            className="absolute -bottom-4 -right-4 bg-red-600 text-white px-6 py-3 rounded-xl shadow-2xl border-4 border-white font-black text-center"
                                                        >
                                                            <h5 className="text-sm uppercase tracking-tighter">Client Perdu</h5>
                                                            <p className="text-[9px] opacity-80 uppercase">Parcours trop long.</p>
                                                        </motion.div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="solution-phone"
                                        initial={{ opacity: 0, x: 50 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 50 }}
                                        transition={{ duration: 0.5, ease: "easeOut" }}
                                        className="relative"
                                    >
                                        {/* Realistic Phone Shell - Solution Version */}
                                        <div className="w-[300px] h-[600px] bg-gray-900 rounded-[3rem] p-3 shadow-2xl border-[8px] border-ofika-orange relative">
                                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-800 rounded-b-2xl z-20" />

                                            {/* Screen Content */}
                                            <div className="w-full h-full bg-gradient-to-b from-orange-50 to-white rounded-[2.2rem] overflow-hidden relative flex flex-col">
                                                {/* Dynamic Island Glow */}
                                                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-30 flex items-center justify-center overflow-hidden">
                                                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-transparent" />
                                                </div>

                                                {/* Profile Header */}
                                                <div className="h-32 bg-gradient-to-br from-orange-500 to-red-600 relative">
                                                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '12px 12px' }} />
                                                </div>

                                                <div className="flex-1 px-6 -mt-10 relative z-10 text-center space-y-4">
                                                    <div className="w-24 h-24 rounded-full bg-white mx-auto border-4 border-white shadow-xl flex items-center justify-center overflow-hidden">
                                                        <img
                                                            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                                                            alt="Entrepreneur"
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>

                                                    <div>
                                                        <h4 className="font-black text-gray-900 text-xl tracking-tight">Joseph Brou</h4>
                                                        <p className="text-orange-600 text-[10px] font-black uppercase tracking-widest mt-1">Entrepreneur & Coach</p>
                                                    </div>

                                                    {/* Smart Links */}
                                                    <div className="space-y-3 pt-4">
                                                        <motion.div
                                                            whileHover={{ scale: 1.02 }}
                                                            className="w-full h-14 bg-white rounded-2xl shadow-sm border border-orange-100 flex items-center px-4 gap-4 cursor-pointer hover:border-orange-200 transition-all"
                                                        >
                                                            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
                                                                <MessageCircle className="w-5 h-5 text-green-500" />
                                                            </div>
                                                            <div className="text-left">
                                                                <p className="text-sm font-black text-gray-900 leading-tight">M'écrire sur WhatsApp</p>
                                                                <p className="text-[10px] text-gray-400 font-bold uppercase">Réponse instantanée</p>
                                                            </div>
                                                        </motion.div>

                                                        <motion.div
                                                            whileHover={{ scale: 1.02 }}
                                                            className="w-full h-14 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center px-4 gap-4 cursor-pointer hover:border-gray-200 transition-all"
                                                        >
                                                            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                                                                <Smartphone className="w-5 h-5 text-blue-500" />
                                                            </div>
                                                            <div className="text-left">
                                                                <p className="text-sm font-black text-gray-900 leading-tight">Voir mon catalogue</p>
                                                                <p className="text-[10px] text-gray-400 font-bold uppercase">Nos services 2024</p>
                                                            </div>
                                                        </motion.div>

                                                        <motion.div
                                                            whileHover={{ scale: 1.02 }}
                                                            className="w-full h-14 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center px-4 gap-4 cursor-pointer hover:border-gray-200 transition-all"
                                                        >
                                                            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center shrink-0">
                                                                <UserPlus className="w-5 h-5 text-purple-500" />
                                                            </div>
                                                            <div className="text-left">
                                                                <p className="text-sm font-black text-gray-900 leading-tight">Enregistrer mon contact</p>
                                                                <p className="text-[10px] text-gray-400 font-bold uppercase">Ajouter au répertoire</p>
                                                            </div>
                                                        </motion.div>
                                                    </div>

                                                    {/* Success Badge */}
                                                    <motion.div
                                                        initial={{ opacity: 0, scale: 0.8 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        transition={{ delay: 0.3 }}
                                                        className="pt-6"
                                                    >
                                                        <div className="inline-flex items-center gap-2 bg-green-50 text-green-600 px-3 py-1.5 rounded-full border border-green-100 font-black text-[10px] uppercase">
                                                            <Check className="w-3 h-3" />
                                                            Conversion Maximale
                                                        </div>
                                                    </motion.div>
                                                </div>
                                            </div>

                                            {/* Solution Tag */}
                                            <motion.div
                                                initial={{ scale: 0, rotate: 10 }}
                                                animate={{ scale: 1, rotate: -5 }}
                                                className="absolute -top-4 -left-4 bg-orange-600 text-white px-6 py-3 rounded-xl shadow-2xl border-4 border-white font-black text-center z-40"
                                            >
                                                <h5 className="text-sm uppercase tracking-tighter">Client Gagné</h5>
                                                <p className="text-[9px] opacity-80 uppercase">Expérience en 1 clic.</p>
                                            </motion.div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Floating Stats */}
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute -top-10 -right-4 lg:-right-10 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 z-50 hidden md:block"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${activeTab === 'friction' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'}`}>
                                        {activeTab === 'friction' ? <Clock className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase leading-none mb-1">Impact</p>
                                        <p className={`text-lg font-black leading-none ${activeTab === 'friction' ? 'text-red-600' : 'text-green-600'}`}>
                                            {activeTab === 'friction' ? '80% Abandon' : '+300% Clics'}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Text Column */}
                        <div className="order-1 lg:order-2 flex flex-col justify-center space-y-8">
                            <AnimatePresence mode="wait">
                                {activeTab === 'friction' ? (
                                    <motion.div
                                        key="friction-text"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.4 }}
                                        className="space-y-6"
                                    >
                                        <h3 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight">
                                            Imaginez le parcours de <br />
                                            <span className="text-red-600">votre futur client :</span>
                                        </h3>

                                        <div className="space-y-4">
                                            <div className="flex items-start gap-4 p-4 rounded-2xl bg-red-50/50 border border-red-100 transition-all hover:bg-red-50">
                                                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0 mt-1">
                                                    <X className="w-4 h-4" />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-lg font-bold text-gray-900 leading-tight">C'est trop long.</p>
                                                    <p className="text-gray-600 text-sm">Le client doit copier, quitter, enregistrer, attendre... À chaque étape, vous en perdez un.</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100 opacity-80">
                                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 shrink-0 mt-1">
                                                    <Clock className="w-4 h-4" />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-lg font-bold text-gray-900 leading-tight">La flemme gagne toujours.</p>
                                                    <p className="text-gray-600 text-sm">Un prospect motivé peut abandonner si l'effort est trop grand. C'est l'overdose cognitive.</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-4">
                                            <Button
                                                variant="outline"
                                                onClick={() => setActiveTab('solution')}
                                                className="border-red-200 text-red-600 hover:bg-red-50 font-bold px-8 py-6 rounded-2xl text-lg group"
                                            >
                                                Voir l'alternative Ofika
                                                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                            </Button>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="solution-text"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.4 }}
                                        className="space-y-6"
                                    >
                                        <h3 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight">
                                            La solution Ofika ? <br />
                                            <span className="text-orange-600">Un seul lien. Un seul clic.</span>
                                        </h3>

                                        <div className="space-y-4">
                                            <div className="flex items-start gap-4 p-4 rounded-2xl bg-orange-50 border border-orange-100 transition-all hover:bg-orange-100/50">
                                                <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white shrink-0 mt-1 shadow-lg shadow-orange-500/20">
                                                    <Zap className="w-4 h-4" />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-lg font-bold text-gray-900 leading-tight">Expérience Instantanée.</p>
                                                    <p className="text-gray-600 text-sm">WhatsApp, Site web, Localisation, Catalogue... Tout est regroupé au même endroit, prêt à l'emploi.</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-4 p-4 rounded-2xl bg-green-50 border border-green-100 transition-all hover:bg-green-100/50">
                                                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white shrink-0 mt-1 shadow-lg shadow-green-500/20">
                                                    <Check className="w-4 h-4" />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-lg font-bold text-gray-900 leading-tight">Professionnalisme Radical.</p>
                                                    <p className="text-gray-600 text-sm">Finis les numéros volants. Vous projetez une image d'expert qui respecte le temps de ses clients.</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-4">
                                            <Button
                                                className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-10 py-7 rounded-2xl text-xl shadow-2xl shadow-orange-500/20 group"
                                            >
                                                Créer mon lien maintenant
                                                <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
                                            </Button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
