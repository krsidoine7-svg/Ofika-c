'use client'

import { motion, useMotionValue, useSpring, useTransform, useScroll } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowRight, Smartphone, Check } from 'lucide-react'
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
            className="relative pt-24 pb-16 sm:pt-32 sm:pb-24 lg:pt-36 lg:pb-28 overflow-hidden bg-white"
        >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 max-w-7xl">
                {/* --- GRILLE 2 COLONNES : TEXTE À GAUCHE / SHOWCASE DUAL-CARD À DROITE --- */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
                    
                    {/* COLONNE GAUCHE (7 COLONNES) : TITRES, SOUS-TITRE & CTA */}
                    <div className="lg:col-span-7 text-left">
                        {/* Badge Sobre Supérieur */}
                        <motion.div 
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 border border-neutral-200/70 text-[11px] sm:text-xs font-medium text-neutral-700 mb-5 tracking-wide"
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>Carte connectée NFC &amp; QR intelligent</span>
                        </motion.div>

                        {/* Titre Principal (H1) Épuré & Éditorial */}
                        <motion.h1 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-neutral-900 tracking-tight leading-[1.18] sm:leading-[1.15] mb-5"
                        >
                            Partagez vos coordonnées <br />
                            <span className="text-neutral-900">d&apos;un simple geste,</span>{' '}
                            <span className="text-neutral-400 font-normal">sans carte papier.</span>
                        </motion.h1>

                        {/* Sous-titre uniforme et fluide */}
                        <motion.p 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="text-sm sm:text-base text-neutral-600 font-normal max-w-xl mb-7 leading-relaxed"
                        >
                            Approchez votre carte d&apos;un smartphone : vos coordonnées, votre WhatsApp et vos réseaux s&apos;enregistrent en 1 seconde. Sans aucune application à installer.
                        </motion.p>

                        {/* Bouton d'Action Principal (CTA) */}
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4"
                        >
                            <Link href="/onboarding/public-page" className="w-full sm:w-auto">
                                <Button 
                                    size="lg" 
                                    className="w-full sm:w-auto h-12 sm:h-13 px-8 bg-neutral-950 hover:bg-black text-white rounded-xl text-sm sm:text-base font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-sm active:scale-[0.98]"
                                >
                                    <span>Créer mon profil gratuit</span>
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                        </motion.div>

                        {/* Réassurance mobile soignée (sans rupture de ligne disgracieuse) */}
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-4 text-xs text-neutral-500 font-medium mt-6 pt-5 border-t border-neutral-100 max-w-xl"
                        >
                            <span className="inline-flex items-center gap-1.5 text-neutral-700">
                                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                Puce NFC sans contact
                            </span>
                            <span className="hidden sm:inline text-neutral-300">•</span>
                            <span className="inline-flex items-center gap-1.5 text-neutral-600">
                                <Smartphone className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                                Compatible 100% smartphones
                            </span>
                            <span className="hidden sm:inline text-neutral-300">•</span>
                            <span className="inline-flex items-center gap-1.5 text-neutral-600">
                                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 sm:hidden" />
                                Valable à vie sans abonnement
                            </span>
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
