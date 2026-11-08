'use client'

import { motion, useMotionValue, useSpring, useTransform, useScroll } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowRight, Smartphone, Check, Sparkles } from 'lucide-react'
import Link from 'next/link'

interface ModernHeroProps {
    videoUrl?: string
}

export const ModernHero = ({ videoUrl }: ModernHeroProps) => {
    const sectionRef = useRef<HTMLElement>(null)
    const cardRef = useRef<HTMLDivElement>(null)
    const [isHovered, setIsHovered] = useState(false)
    const [activeFace, setActiveFace] = useState<'both' | 'recto' | 'verso'>('both')
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    // --- PARALLAXE AU SCROLL ---
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ['start start', 'end start'],
    })
    const scrollCardY = useTransform(scrollYProgress, [0, 1], [0, 80])
    const scrollCardRotate = useTransform(scrollYProgress, [0, 1], [0, -3])

    // --- INTERACTION 3D TILT & PARALLAXE À LA SOURIS ---
    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)

    const springConfig = { damping: 26, stiffness: 190 }
    const tiltX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), springConfig)
    const tiltY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-12, 12]), springConfig)

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const xPct = (e.clientX - rect.left) / rect.width - 0.5
        const yPct = (e.clientY - rect.top) / rect.height - 0.5
        mouseX.set(xPct)
        mouseY.set(yPct)
    }

    const handleMouseEnter = () => {
        setIsHovered(true)
    }

    const handleMouseLeave = () => {
        setIsHovered(false)
        mouseX.set(0)
        mouseY.set(0)
    }

    return (
        <section 
            ref={sectionRef}
            suppressHydrationWarning
            className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-white"
        >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 max-w-7xl">
                {/* --- GRILLE 2 COLONNES : TEXTE À GAUCHE / SHOWCASE DUAL-CARD À DROITE --- */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
                    
                    {/* COLONNE GAUCHE (7 COLONNES) : TITRES, SOUS-TITRE & CTA */}
                    <div className="lg:col-span-7 text-left">
                        {/* Badge Pilule Supérieur */}
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200/80 text-[11px] sm:text-xs font-semibold text-orange-600 mb-6 tracking-wide shadow-sm"
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                            LA CARTE DE VISITE NOUVELLE GÉNÉRATION
                        </motion.div>

                        {/* Titre Principal (H1) avec badges équilibrés */}
                        <motion.h1 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="text-2xl sm:text-4xl lg:text-5xl font-black text-gray-900 leading-[1.2] tracking-tight mb-5"
                        >
                            Partagez vos coordonnées <br />
                            <span className="inline-block px-3.5 py-1 my-1 bg-gradient-to-r from-orange-600 to-ofika-orange text-white rounded-xl transform -rotate-1 shadow-md shadow-orange-500/20 font-black">
                                d'un simple geste
                            </span> <br />
                            sans carte en <span className="inline-block px-3.5 py-1 my-1 bg-gradient-to-r from-pink-600 to-rose-500 text-white rounded-xl transform rotate-1 shadow-md shadow-pink-500/20 font-black">papier</span>
                        </motion.h1>

                        {/* Sous-titre rassurant et sans jargon */}
                        <motion.p 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="text-sm sm:text-base text-gray-600 font-normal max-w-xl mb-8 leading-relaxed"
                        >
                            Approchez votre carte d'un smartphone : votre <span className="text-orange-600 font-semibold">numéro</span>, votre <span className="text-orange-600 font-semibold">WhatsApp</span> et vos <span className="text-gray-900 font-semibold">réseaux</span> s'enregistrent en 1 seconde. <span className="text-gray-900 font-medium">Sans aucune application à installer.</span>
                        </motion.p>

                        {/* Bouton d'Action Principal (CTA) */}
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="flex flex-col sm:flex-row items-start sm:items-center gap-4"
                        >
                            <Link href="/onboarding/public-page">
                                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                    <Button size="lg" className="h-12 sm:h-14 px-8 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white rounded-xl sm:rounded-2xl text-sm sm:text-base font-bold shadow-lg shadow-orange-500/25 transition-all group flex items-center gap-2">
                                        Créer mon profil gratuit
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </motion.div>
                            </Link>
                        </motion.div>

                        {/* Ligne de réassurance discrète */}
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            className="flex flex-wrap items-center gap-3 text-xs text-gray-500 font-medium mt-6 pt-4 border-t border-gray-100 max-w-xl"
                        >
                            <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                                <Check className="w-3.5 h-3.5" /> Puce NFC sans contact
                            </span>
                            <span className="text-gray-300">•</span>
                            <span className="inline-flex items-center gap-1 text-gray-600">
                                <Smartphone className="w-3.5 h-3.5 text-gray-400" /> Compatible 100% smartphones
                            </span>
                            <span className="text-gray-300">•</span>
                            <span>Valable à vie</span>
                        </motion.div>
                    </div>

                    {/* COLONNE DROITE (5 COLONNES) : SHOWCASE DUAL-CARD (RECTO + VERSO 100% DÉGAGÉS ET VISIBLES EN ENTIER) */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.7, delay: 0.25 }}
                        style={isMounted ? {
                            y: scrollCardY,
                            rotate: scrollCardRotate,
                        } : {}}
                        className="lg:col-span-5 flex flex-col items-center justify-center relative select-none w-full"
                    >
                        {/* Zone 3D Perspective interactive - Aérée pour permettre une visibilité totale des deux faces */}
                        <div 
                            ref={cardRef}
                            onMouseMove={handleMouseMove}
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                            className="relative w-full max-w-[460px] sm:max-w-[500px] lg:max-w-[530px] h-[340px] sm:h-[440px] lg:h-[480px] [perspective:1400px] flex items-center justify-center cursor-pointer"
                        >
                            {/* --- CARTE 1 : FACE AVANT (RECTO) --- */}
                            {/* Positionnée en haut à droite pour exposer complètement le logo Ofika et l'emblème sans aucun masque */}
                            <motion.div
                                style={isMounted ? {
                                    rotateX: isHovered ? tiltX : 0,
                                    rotateY: isHovered ? tiltY : 0,
                                } : {}}
                                animate={!isHovered ? {
                                    y: [-6, 6, -6],
                                    rotateZ: [2.5, 1.5, 2.5],
                                } : {
                                    y: activeFace === 'recto' ? -10 : -4,
                                    rotateZ: activeFace === 'recto' ? 0 : 3,
                                    scale: activeFace === 'recto' ? 1.04 : 1,
                                }}
                                transition={!isHovered ? {
                                    duration: 6,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                } : { duration: 0.3 }}
                                onClick={() => setActiveFace(prev => prev === 'recto' ? 'both' : 'recto')}
                                onMouseEnter={() => setActiveFace('recto')}
                                onMouseLeave={() => setActiveFace('both')}
                                className={`absolute right-0 top-1 w-[82%] sm:w-[80%] aspect-[1.586/1] transition-all duration-300 [transform-style:preserve-3d] ${
                                    activeFace === 'recto' ? 'z-30' : 'z-10'
                                }`}
                            >
                                {/* Badge élégant discret au-dessus de la carte */}
                                <div className="absolute -top-6 right-3 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-neutral-900/80 border border-neutral-700/60 text-[10px] font-semibold text-neutral-300 shadow-sm backdrop-blur-sm pointer-events-none">
                                    <Sparkles className="w-3 h-3 text-orange-400" />
                                    <span>Face avant • Recto</span>
                                </div>

                                <div className="w-full h-full rounded-[14px] sm:rounded-[18px] overflow-hidden border border-neutral-800 bg-[#0f1115] shadow-xl hover:shadow-2xl transition-all duration-300 group">
                                    {/* SVG Officiel Complet Recto avec toutes les lettres O-F-I-K-A et Emblème */}
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img 
                                        src="/assets/recto-black-full.svg" 
                                        alt="Carte Ofika - Face avant officielle avec logo et puce NFC"
                                        className="w-full h-full object-contain pointer-events-none select-none"
                                    />
                                </div>
                            </motion.div>

                            {/* --- CARTE 2 : FACE ARRIÈRE (VERSO) --- */}
                            {/* Positionnée en bas à gauche pour que le QR code, la signature et la certification soient 100% lisibles et dégagés */}
                            <motion.div
                                style={isMounted ? {
                                    rotateX: isHovered ? tiltX : 0,
                                    rotateY: isHovered ? tiltY : 0,
                                } : {}}
                                animate={!isHovered ? {
                                    y: [6, -6, 6],
                                    rotateZ: [-2.5, -1.5, -2.5],
                                } : {
                                    y: activeFace === 'verso' ? -4 : 6,
                                    rotateZ: activeFace === 'verso' ? 0 : -3,
                                    scale: activeFace === 'verso' ? 1.04 : 1,
                                }}
                                transition={!isHovered ? {
                                    duration: 6,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                    delay: 0.2,
                                } : { duration: 0.3 }}
                                onClick={() => setActiveFace(prev => prev === 'verso' ? 'both' : 'verso')}
                                onMouseEnter={() => setActiveFace('verso')}
                                onMouseLeave={() => setActiveFace('both')}
                                className={`absolute left-0 bottom-1 w-[82%] sm:w-[80%] aspect-[1.586/1] transition-all duration-300 [transform-style:preserve-3d] ${
                                    activeFace === 'verso' ? 'z-30' : 'z-20'
                                }`}
                            >
                                {/* Badge élégant discret au-dessus du verso */}
                                <div className="absolute -top-6 left-3 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-neutral-900/80 border border-neutral-700/60 text-[10px] font-semibold text-neutral-300 shadow-sm backdrop-blur-sm pointer-events-none">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    <span>Face arrière • QR Code & NFC</span>
                                </div>

                                <div className="w-full h-full rounded-[14px] sm:rounded-[18px] overflow-hidden border border-neutral-800 bg-[#0f1115] shadow-2xl transition-all duration-300 group">
                                    {/* SVG Officiel Complet Verso avec vrai QR Code, Signature calligraphiée et Certification */}
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img 
                                        src="/assets/verso-black.svg" 
                                        alt="Carte Ofika - Face arrière avec vrai QR code et signature"
                                        className="w-full h-full object-contain pointer-events-none select-none"
                                    />
                                </div>
                            </motion.div>
                        </div>

                        {/* Réassurance discrète et sobre sous les cartes */}
                        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs text-neutral-500 font-medium text-center">
                            <span className="inline-flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                                Carte physique sans contact
                            </span>
                            <span className="text-neutral-300">•</span>
                            <span className="hidden sm:inline">Survolez ou cliquez pour inspecter</span>
                            <span className="sm:hidden">Touchez pour inspecter</span>
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    )
}
