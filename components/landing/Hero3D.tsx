'use client'

import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { Button } from '@/components/core/ui/button'
import { ArrowRight, TrendingUp, CheckCircle, Play, Zap, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { NFCCard3D } from './NFCCard3D'
import { useRef } from 'react'

interface Hero3DProps {
    onDemoClick?: () => void
}

export const Hero3D = ({ onDemoClick }: Hero3DProps) => {
    const containerRef = useRef<HTMLElement>(null)

    // Scroll animations avec easing smooth
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    })

    // Smooth spring physics
    const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 }
    const scrollSpring = useSpring(scrollYProgress, springConfig)

    // PARALLAX MULTI-LAYER EFFECTS
    const backgroundY = useTransform(scrollSpring, [0, 1], [0, 400])
    const middleY = useTransform(scrollSpring, [0, 1], [0, 200])
    const contentY = useTransform(scrollSpring, [0, 1], [0, 100])

    // Zoom effects
    const scale = useTransform(scrollSpring, [0, 0.5, 1], [1, 1.1, 0.95])
    const cardScale = useTransform(scrollSpring, [0, 0.3, 1], [1, 1.15, 0.8])

    // Opacity fades
    const opacity = useTransform(scrollSpring, [0, 0.3, 0.7], [1, 1, 0])
    const bgOpacity = useTransform(scrollSpring, [0, 0.5], [1, 0.3])

    // Rotation effects
    const rotate = useTransform(scrollSpring, [0, 1], [0, 15])
    const rotateZ = useTransform(scrollSpring, [0, 1], [0, -5])

    // Horizontal movement
    const leftX = useTransform(scrollSpring, [0, 1], [0, -300])
    const rightX = useTransform(scrollSpring, [0, 1], [0, 300])

    const scrollToSection = (sectionId: string) => {
        const element = document.getElementById(sectionId)
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            })
        }
    }

    return (
        <section
            ref={containerRef}
            className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#fafafa]"
        >
            {/* --- ANIMATED BACKGROUND LAYERS --- */}

            {/* Layer 1: Deep Background with movement */}
            <motion.div
                className="absolute inset-0 z-0"
                style={{ y: backgroundY, opacity: bgOpacity }}
            >
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,#fff_0%,#f8fafc_100%)]" />
            </motion.div>

            {/* Layer 2: Animated Grid Pattern */}
            <motion.div
                className="absolute inset-0 z-0 opacity-[0.2]"
                style={{ y: middleY, scale }}
            >
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `radial-gradient(#cbd5e1 1px, transparent 1px)`,
                        backgroundSize: '32px 32px',
                    }}
                />
            </motion.div>

            {/* Layer 3: Moving Spotlights with scroll zoom */}
            <motion.div
                className="absolute inset-0 z-0 pointer-events-none"
                style={{ scale: cardScale }}
            >
                {/* Main Orange Spotlight - Déplacement gauche */}
                <motion.div
                    className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] bg-orange-400/20 rounded-full blur-[120px]"
                    style={{ x: leftX }}
                    animate={{
                        scale: [1, 1.2, 1],
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                />

                {/* Purple Spotlight - Déplacement droite */}
                <motion.div
                    className="absolute -bottom-[20%] -right-[10%] w-[70%] h-[70%] bg-purple-400/20 rounded-full blur-[150px]"
                    style={{ x: rightX }}
                    animate={{
                        scale: [1, 1.3, 1],
                    }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                />

                {/* Pink Accent - Mouvement vertical */}
                <motion.div
                    className="absolute top-1/3 right-1/4 w-[50%] h-[50%] bg-pink-400/15 rounded-full blur-[100px]"
                    style={{ y: middleY, rotate }}
                    animate={{
                        scale: [1, 1.4, 1],
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 4 }}
                />
            </motion.div>

            {/* Layer 4: Dynamic Light Streaks */}
            <motion.div
                className="absolute inset-0 z-0 overflow-hidden opacity-50"
                style={{ y: contentY }}
            >
                {[...Array(5)].map((_, i) => (
                    <motion.div
                        key={i}
                        className={`absolute top-0 w-[2px] h-full bg-gradient-to-b from-transparent via-${i % 2 === 0 ? 'orange' : 'purple'}-300 to-transparent`}
                        style={{
                            left: `${20 + (i * 15)}%`,
                            rotate: rotateZ
                        }}
                        animate={{
                            x: ['-100%', '400%'],
                            opacity: [0, 0.8, 0]
                        }}
                        transition={{
                            duration: 8 + (i * 2),
                            repeat: Infinity,
                            ease: "linear",
                            delay: i * 1.5
                        }}
                    />
                ))}
            </motion.div>

            {/* Layer 5: Floating Particles with Zoom */}
            <motion.div
                className="absolute inset-0 z-0 overflow-hidden pointer-events-none"
                style={{ scale: cardScale }}
            >
                {[...Array(30)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute rounded-full bg-gradient-to-br from-orange-400/40 to-purple-400/40"
                        style={{
                            width: `${Math.random() * 8 + 2}px`,
                            height: `${Math.random() * 8 + 2}px`,
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                            y: [0, -200, 0],
                            x: [0, Math.random() * 100 - 50, 0],
                            opacity: [0, 0.8, 0],
                            scale: [0, 1.5, 0],
                        }}
                        transition={{
                            duration: Math.random() * 15 + 10,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: Math.random() * 5,
                        }}
                    />
                ))}
            </motion.div>

            {/* Layer 6: Central Glow with Pulse */}
            <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl max-h-[600px] bg-orange-400/10 rounded-full blur-[180px] z-0 pointer-events-none"
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.8, 0.5]
                }}
                transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />

            {/* Grain Texture */}
            <div
                className="absolute inset-0 z-[1] opacity-[0.03] pointer-events-none mix-blend-multiply"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                }}
            />

            {/* Main Content with Scroll Effects */}
            <motion.div
                className="relative z-10 container mx-auto px-4 py-20"
                style={{ opacity, y: contentY }}
            >
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

                    {/* Left Column - Text Content */}
                    <motion.div
                        className="w-full lg:w-1/2 text-center lg:text-left"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                    >


                        {/* Headline avec animation de vague */}
                        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 mb-6 leading-[1.1] tracking-tight">
                            {['Ne', 'laissez', 'plus', 'vos', 'clients'].map((word, wordIndex) => (
                                <motion.span
                                    key={wordIndex}
                                    className="inline-block mr-3 sm:mr-4"
                                    initial={{ opacity: 0, y: 50, rotateX: -90 }}
                                    animate={{
                                        opacity: 1,
                                        y: [50, -10, 0],
                                        rotateX: 0
                                    }}
                                    transition={{
                                        delay: 0.3 + (wordIndex * 0.1),
                                        duration: 0.6,
                                        ease: "easeOut"
                                    }}
                                >
                                    {word}
                                </motion.span>
                            ))}

                            {/* Mot spécial avec gradient et effet 3D */}
                            <span className="relative inline-block">
                                <motion.span
                                    className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-orange-500 to-purple-600"
                                    initial={{ opacity: 0, y: 50, rotateX: -90 }}
                                    animate={{
                                        opacity: 1,
                                        y: [50, -10, 0],
                                        rotateX: 0
                                    }}
                                    transition={{
                                        delay: 0.8,
                                        duration: 0.6,
                                        ease: "easeOut"
                                    }}
                                    whileHover={{ scale: 1.05 }}
                                >
                                    s'échapper
                                </motion.span>

                                {/* Soulignement animé avec glow */}
                                <motion.span
                                    className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-r from-orange-400 to-purple-400 opacity-30 blur-sm -z-10"
                                    initial={{ scaleX: 0 }}
                                    animate={{ scaleX: 1 }}
                                    transition={{ delay: 1.1, duration: 0.6 }}
                                />
                            </span>

                            {/* Point final avec bounce */}
                            <motion.span
                                className="inline-block text-orange-600"
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{
                                    opacity: 1,
                                    scale: [0, 1.5, 1],
                                }}
                                transition={{
                                    delay: 1.2,
                                    duration: 0.5,
                                    ease: "backOut"
                                }}
                            >
                                .
                            </motion.span>
                        </h1>

                        {/* Subheadline avec wave */}
                        <div className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-10 sm:mb-12 leading-relaxed">
                            <div className="relative inline-block overflow-hidden pb-2">
                                {"Vos abonnés TikTok & Instagram abandonnent face à la difficulté de vous contacter.".split(' ').map((word, i) => (
                                    <motion.span
                                        key={i}
                                        className="inline-block mr-[0.3em]"
                                        initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                                        transition={{
                                            delay: 0.8 + (i * 0.05),
                                            duration: 0.5,
                                            ease: [0.215, 0.61, 0.355, 1]
                                        }}
                                    >
                                        {word}
                                    </motion.span>
                                ))}

                                {/* Wavy Underline animé */}
                                <svg
                                    className="absolute -bottom-1 left-0 w-full h-3 text-orange-400 opacity-60"
                                    viewBox="0 0 400 20"
                                    preserveAspectRatio="none"
                                >
                                    <motion.path
                                        d="M 0 10 Q 10 0, 20 10 T 40 10 T 60 10 T 80 10 T 100 10 T 120 10 T 140 10 T 160 10 T 180 10 T 200 10 T 220 10 T 240 10 T 260 10 T 280 10 T 300 10 T 320 10 T 340 10 T 360 10 T 380 10 T 400 10"
                                        fill="transparent"
                                        stroke="currentColor"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        initial={{ pathLength: 0, opacity: 0 }}
                                        animate={{ pathLength: 1, opacity: 1 }}
                                        transition={{
                                            delay: 1.8,
                                            duration: 1.5,
                                            ease: "easeInOut"
                                        }}
                                    />
                                </svg>
                            </div>

                            <motion.span
                                className="block mt-4 font-semibold text-gray-900"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 2.5, duration: 0.8 }}
                            >
                                Adoptez la{' '}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
                                    Carte de Visite Numérique
                                </span>{' '}
                                (NFC + QR) qui convertit vos prospects en un clic.
                            </motion.span>
                        </div>

                        {/* CTAs avec animations avancées */}
                        <motion.div
                            className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <Link href="/onboarding/public-page" className="w-full sm:w-auto">
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Button
                                        size="lg"
                                        className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-lg sm:text-xl font-bold px-8 py-6 sm:py-7 w-full sm:w-auto shadow-xl shadow-orange-500/30 rounded-xl group relative overflow-hidden"
                                    >
                                        {/* Animated Shimmer */}
                                        <motion.div
                                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                                            animate={{
                                                x: ['-200%', '200%'],
                                            }}
                                            transition={{
                                                duration: 3,
                                                repeat: Infinity,
                                                ease: "linear"
                                            }}
                                        />
                                        <span className="relative z-10 flex items-center gap-2">
                                            Créer mon lien gratuit
                                            <motion.div
                                                animate={{ x: [0, 5, 0] }}
                                                transition={{ duration: 1.5, repeat: Infinity }}
                                            >
                                                <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6" />
                                            </motion.div>
                                        </span>
                                    </Button>
                                </motion.div>
                            </Link>

                            <motion.button
                                onClick={() => scrollToSection('demo')}
                                className="w-full sm:w-auto group"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <div className="flex items-center justify-center gap-3 px-8 py-6 sm:py-7 rounded-xl border-2 border-gray-200 hover:border-orange-500/50 hover:bg-orange-500/5 backdrop-blur-sm transition-all">
                                    <motion.div
                                        animate={{ scale: [1, 1.2, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    >
                                        <Play className="w-5 h-5 text-gray-600 group-hover:text-orange-500 fill-current transition-colors" />
                                    </motion.div>
                                    <span className="text-lg font-bold text-gray-600 group-hover:text-gray-900 transition-colors">
                                        Voir comment ça marche
                                    </span>
                                </div>
                            </motion.button>
                        </motion.div>

                        {/* Trust Indicators */}
                        <motion.p
                            className="text-sm text-gray-500 mt-6 flex flex-wrap items-center justify-center lg:justify-start gap-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                        >
                            <motion.span
                                className="flex items-center gap-2"
                                whileHover={{ scale: 1.05 }}
                            >
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                Gratuit à vie
                            </motion.span>
                            <span className="text-gray-300">•</span>
                            <motion.span
                                className="flex items-center gap-2"
                                whileHover={{ scale: 1.05 }}
                            >
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                Configuration en 2 minutes
                            </motion.span>
                        </motion.p>
                    </motion.div>

                    {/* Right Column - 3D Cards avec Scroll Effects */}
                    <motion.div
                        className="w-full lg:w-1/2 flex justify-center relative"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                            duration: 1,
                            ease: 'easeOut',
                            delay: 0.4
                        }}
                        style={{ scale: cardScale, rotateY: rotate }}
                    >
                        <div className="relative w-full max-w-md">
                            {/* Carte 1 - Centre avec zoom au scroll */}
                            <motion.div
                                className="absolute top-0 left-1/2 -translate-x-1/2 w-[280px] sm:w-[320px] z-30"
                                initial={{ x: -100, opacity: 0, rotateY: -45 }}
                                animate={{ x: '-50%', opacity: 1, rotateY: 0 }}
                                transition={{ delay: 0.5, duration: 0.8 }}
                                style={{ y: contentY }}
                            >
                                <NFCCard3D variant={1} delay={0} />
                            </motion.div>

                            {/* Carte 2 - Gauche se déplace vers la gauche au scroll */}
                            <motion.div
                                className="absolute top-12 left-0 w-[240px] sm:w-[280px] z-20 opacity-70"
                                initial={{ x: -150, opacity: 0, rotateY: 45 }}
                                animate={{ x: 0, opacity: 0.7, rotateY: 15 }}
                                transition={{ delay: 0.6, duration: 0.8 }}
                                style={{ x: leftX, y: middleY }}
                            >
                                <NFCCard3D variant={2} delay={0.5} />
                            </motion.div>

                            {/* Carte 3 - Droite se déplace vers la droite au scroll */}
                            <motion.div
                                className="absolute top-12 right-0 w-[240px] sm:w-[280px] z-20 opacity-70"
                                initial={{ x: 150, opacity: 0, rotateY: -45 }}
                                animate={{ x: 0, opacity: 0.7, rotateY: -15 }}
                                transition={{ delay: 0.7, duration: 0.8 }}
                                style={{ x: rightX, y: middleY }}
                            >
                                <NFCCard3D variant={3} delay={1} />
                            </motion.div>

                            {/* Espace */}
                            <div className="h-[300px] sm:h-[350px]" />
                        </div>
                    </motion.div>

                </div>
            </motion.div>

            {/* Scroll Indicator avec animation fluide */}
            <motion.div
                className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.8 }}
                style={{ opacity }}
            >
                <motion.div
                    className="w-6 h-10 border-2 border-gray-300 rounded-full flex justify-center pt-2 backdrop-blur-sm"
                    animate={{ y: [0, 8, 0] }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                >
                    <motion.div
                        className="w-1.5 h-1.5 bg-orange-500 rounded-full"
                        animate={{
                            scale: [1, 1.3, 1],
                            opacity: [1, 0.5, 1]
                        }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                </motion.div>
                <p className="text-xs text-gray-400 mt-2 text-center font-medium">Scroll pour découvrir</p>
            </motion.div>

        </section>
    )
}
