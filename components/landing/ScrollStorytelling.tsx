'use client'

import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Instagram, MessageCircle, Chrome, Camera, Music, Mail, Loader2, Globe, Shield, Zap } from 'lucide-react'

interface ScrollStorytellingProps {
    videoUrl?: string
}

export const ScrollStorytelling = ({ videoUrl }: ScrollStorytellingProps) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const sectionRef = useRef<HTMLDivElement>(null)
    const isInView = useInView(sectionRef, { once: true, margin: "-10% 0px" })

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end end"]
    })

    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    })

    // RANGES POUR 5 ÉTAPES (Progress de 0 à 1)
    // On ajuste pour que l'action commence dès le début du sticky
    const cardX = useTransform(smoothProgress, [0, 0.15, 0.25, 0.4, 0.6, 1], [100, 0, -100, -180, -250, -300])
    const cardY = useTransform(smoothProgress, [0, 0.15, 0.25, 0.4, 0.6, 1], [-150, 0, -30, -50, -70, -90])
    const cardRotate = useTransform(smoothProgress, [0, 0.15, 0.25, 0.4], [10, 0, -10, -18])
    const cardZ = useTransform(smoothProgress, [0, 0.2, 0.25], [50, 50, -10])
    const cardScale = useTransform(smoothProgress, [0, 0.15, 0.25, 0.5, 0.8], [0.8, 1.1, 0.9, 0.8, 0.7])
    const cardOpacity = useTransform(smoothProgress, [0, 0.05, 0.85, 1], [0, 1, 1, 0])

    // Le téléphone entre dès que la section remonte à l'écran (progress 0→0.15 = section qui arrive du bas)
    const phoneX = useTransform(smoothProgress, [0, 0.12, 1], [60, 0, 0])
    const phoneY = useTransform(smoothProgress, [0, 0.12, 0.85, 1], [80, 0, 0, -20])
    const phoneOpacity = useTransform(smoothProgress, [0, 0.08, 0.88, 1], [0, 1, 1, 0])

    const homeScreenOpacity = useTransform(smoothProgress, [0, 0.15, 0.2], [1, 1, 0])
    const notificationOpacity = useTransform(smoothProgress, [0.15, 0.2, 0.35, 0.4], [0, 1, 1, 0])
    const loadingOpacity = useTransform(smoothProgress, [0.35, 0.4, 0.55, 0.6], [0, 1, 1, 0])
    const bioPageOpacity = useTransform(smoothProgress, [0.55, 0.6, 0.75, 0.8], [0, 1, 1, 0])
    const dashboardOpacity = useTransform(smoothProgress, [0.75, 0.8, 0.95, 1], [0, 1, 1, 0])

    const videoOverlayOpacity = useTransform(smoothProgress, [0.7, 0.8], [1, 0])

    // Opacité des étapes — toujours bien visibles (min 0.85), highlight l’étape active
    const text1Opacity = useTransform(smoothProgress, [0, 0.1, 0.2, 0.25], [0.85, 1, 1, 0.85])
    const text2Opacity = useTransform(smoothProgress, [0.25, 0.35, 0.45, 0.5], [0.85, 1, 1, 0.85])
    const text3Opacity = useTransform(smoothProgress, [0.5, 0.6, 0.7, 0.75], [0.85, 1, 1, 0.85])
    const text4Opacity = useTransform(smoothProgress, [0.75, 0.85, 0.95, 1], [0.85, 1, 1, 1])
    const text5Opacity = useTransform(smoothProgress, [0.92, 0.98, 1], [0, 1, 1])

    return (
        <div ref={containerRef} className="relative min-h-[110vh] lg:min-h-[125vh] bg-white overflow-hidden">
            {/* Fond propre, sans gradient flou */}
            <div className="absolute inset-0 bg-white pointer-events-none" />
            {/* Mesh Pattern subtil */}
            <div className="absolute inset-0 opacity-[0.15] pointer-events-none hidden lg:block"
                style={{ backgroundImage: `radial-gradient(#cbd5e1 1px, transparent 1px)`, backgroundSize: '32px 32px' }}
            />

            <div ref={sectionRef} className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center -z-10 hidden lg:flex">
                    <motion.div className="w-[800px] h-[800px] bg-orange-400/10 rounded-full blur-[120px]" animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 10, repeat: Infinity }} />
                </div>

                <div className="container mx-auto px-4 h-full flex flex-col lg:flex-row items-center justify-center lg:justify-start gap-2 lg:gap-16">

                    {/* Colonne DROITE : Grille 2x2 des 4 étapes */}
                    <div className="w-full lg:w-1/2 relative flex items-center order-2 lg:order-2">
                        <div className="grid grid-cols-2 gap-2 lg:gap-6 w-full">

                            {/* Étape 1 — haut gauche */}
                            <motion.div
                                style={{ opacity: text1Opacity }}
                                className="flex flex-col p-3 lg:p-6 rounded-2xl bg-white shadow-md border border-gray-100 hover:border-orange-200 hover:shadow-lg transition-all duration-300"
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-7 h-7 bg-orange-100 rounded-lg flex items-center justify-center shrink-0">
                                        <span className="text-orange-500 font-black text-xs">1</span>
                                    </div>
                                    <span className="text-orange-500 font-bold uppercase tracking-widest text-[9px]">Étape 1</span>
                                </div>
                                <h3 className="text-sm lg:text-lg font-black text-gray-900 mb-1">Le Contact <span className="text-orange-500">Magique</span></h3>
                                <p className="text-gray-500 text-[10px] leading-tight">Approchez votre carte du téléphone pour une expérience instantanée.</p>
                            </motion.div>

                            {/* Étape 2 — haut droite */}
                            <motion.div
                                style={{ opacity: text2Opacity }}
                                className="flex flex-col p-3 lg:p-6 rounded-2xl bg-white shadow-md border border-gray-100 hover:border-purple-200 hover:shadow-lg transition-all duration-300"
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-7 h-7 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
                                        <span className="text-purple-600 font-black text-xs">2</span>
                                    </div>
                                    <span className="text-purple-600 font-bold uppercase tracking-widest text-[9px]">Étape 2</span>
                                </div>
                                <h3 className="text-sm lg:text-lg font-black text-gray-900 mb-1">La Connexion <span className="text-purple-600">NFC</span></h3>
                                <p className="text-gray-500 text-[10px] leading-tight">Pas d'application à installer. Tout se fait sans effort.</p>
                            </motion.div>

                            {/* Étape 3 — bas gauche (sous l'étape 1) */}
                            <motion.div
                                style={{ opacity: text3Opacity }}
                                className="flex flex-col p-3 lg:p-6 rounded-2xl bg-white shadow-md border border-gray-100 hover:border-green-200 hover:shadow-lg transition-all duration-300"
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-7 h-7 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                                        <span className="text-green-600 font-black text-xs">3</span>
                                    </div>
                                    <span className="text-green-600 font-bold uppercase tracking-widest text-[9px]">Étape 3</span>
                                </div>
                                <h3 className="text-sm lg:text-lg font-black text-gray-900 mb-1">Impact <span className="text-green-500">Immédiat</span></h3>
                                <p className="text-gray-500 text-[10px] leading-tight">Vos liens s'affichent dans un design premium.</p>
                            </motion.div>

                            {/* Étape 4 — bas droite (sous l'étape 2) */}
                            <motion.div
                                style={{ opacity: text4Opacity }}
                                className="flex flex-col p-2 lg:p-6 rounded-2xl bg-white shadow-md border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300"
                            >
                                <div className="flex items-center gap-2 mb-1.5">
                                    <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                                        <span className="text-blue-600 font-black text-[10px]">4</span>
                                    </div>
                                    <span className="text-blue-600 font-bold uppercase tracking-widest text-[8px]">Étape 4</span>
                                </div>
                                <h3 className="text-xs lg:text-lg font-black text-gray-900 mb-0.5">Mise à Jour <span className="text-blue-500">Instantanée</span></h3>
                                <p className="text-gray-500 text-[9px] leading-tight">Modifiez vos liens en un clic sur votre dashboard.</p>
                            </motion.div>

                        </div>


                    </div>

                    {/* Colonne GAUCHE : Mockup téléphone */}
                    <div className="w-full lg:w-1/2 relative h-[420px] lg:h-[700px] flex items-center justify-center order-1 lg:order-1 overflow-visible -mt-8 lg:mt-0">
                        <motion.div className="absolute z-30" style={{ x: cardX, y: cardY, rotate: cardRotate, scale: cardScale, opacity: cardOpacity, zIndex: cardZ }}>
                            <div className="relative group cursor-pointer perspective-[1000px]">
                                <img src="/assets/recto-white.svg" alt="Ofika Card" className="w-[160px] lg:w-[260px] drop-shadow-2xl rounded-2xl border border-white/50" />
                            </div>
                        </motion.div>

                        <motion.div className="absolute z-20" style={{ x: phoneX, y: phoneY, opacity: phoneOpacity }}>
                            {/* Cadre téléphone réaliste */}
                            <div className="relative">
                                {/* Boutons volume gauche */}
                                <div className="absolute -left-[3px] top-[60px] w-[3px] h-[20px] bg-gray-700 rounded-l-sm" />
                                <div className="absolute -left-[3px] top-[100px] w-[3px] h-[35px] bg-gray-700 rounded-l-sm" />
                                <div className="absolute -left-[3px] top-[150px] w-[3px] h-[35px] bg-gray-700 rounded-l-sm" />
                                {/* Bouton power droite */}
                                <div className="absolute -right-[3px] top-[100px] w-[3px] h-[45px] bg-gray-700 rounded-r-sm" />

                                {/* Boîtier principal */}
                                <div className="relative h-[400px] lg:h-[600px] w-[200px] lg:w-[295px] bg-gray-900 rounded-[2.2rem] lg:rounded-[2.8rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)] border border-gray-800 p-[8px] lg:p-[10px]">

                                    {/* Écran interne */}
                                    <div className="relative h-full w-full overflow-hidden rounded-[1.8rem] lg:rounded-[2.2rem] bg-white">

                                        {/* Dynamic Island (encoche) */}
                                        <div className="absolute top-2 lg:top-3 left-1/2 -translate-x-1/2 w-[60px] lg:w-[80px] h-[20px] lg:h-[26px] bg-black rounded-full z-50 flex items-center justify-center gap-1.5 lg:gap-2">
                                            <div className="w-2 h-2 rounded-full bg-gray-800 border border-gray-700" />
                                            <div className="w-[6px] h-[6px] rounded-full bg-gray-700" />
                                        </div>

                                        {/* Barre de statut */}
                                        <div className="absolute top-0 left-0 right-0 h-10 z-40 flex items-end justify-between px-6 pb-1">
                                            <span className="text-[9px] font-bold text-gray-500">9:41</span>
                                            <div className="flex items-center gap-1">
                                                <div className="w-3 h-1.5 bg-gray-400 rounded-sm" />
                                                <div className="w-2 h-2 rounded-full border border-gray-400" />
                                                <div className="flex gap-px items-end h-2.5">
                                                    <div className="w-0.5 h-1 bg-gray-400 rounded-full" />
                                                    <div className="w-0.5 h-1.5 bg-gray-400 rounded-full" />
                                                    <div className="w-0.5 h-2 bg-gray-400 rounded-full" />
                                                    <div className="w-0.5 h-2.5 bg-gray-400 rounded-full" />
                                                </div>
                                            </div>
                                        </div>

                                        {videoUrl && (
                                            <motion.div className="absolute inset-0 z-10 bg-black" style={{ opacity: videoOverlayOpacity }}>
                                                <video src={videoUrl} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                                            </motion.div>
                                        )}

                                        <motion.div className="absolute inset-0 pt-14 px-5" style={{ opacity: homeScreenOpacity }}>
                                            <div className="grid grid-cols-4 gap-3">
                                                {[Instagram, MessageCircle, Chrome, Camera, Music, Mail, Zap, Globe].map((Icon, i) => (
                                                    <div key={i} className="flex flex-col items-center gap-1.5"><div className="w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center"><Icon className="w-5 h-5 text-gray-400" /></div></div>
                                                ))}
                                            </div>
                                        </motion.div>

                                        <motion.div
                                            className="absolute top-12 right-2 left-2 z-50"
                                            initial={{ opacity: 0, y: -12 }}
                                            animate={isInView
                                                ? { opacity: [0, 1, 1, 0], y: [-12, 0, 0, -12] }
                                                : { opacity: 0, y: -12 }
                                            }
                                            transition={{
                                                times: [0, 0.1, 0.7, 1],
                                                duration: 3.5,
                                                ease: "easeInOut",
                                                delay: 0.5
                                            }}
                                        >
                                            <div className="bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-orange-100 flex items-center gap-3">
                                                <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shrink-0"><Zap className="w-6 h-6 text-white" /></div>
                                                <div><p className="text-xs font-black text-gray-900">Carte Ofika détectée</p></div>
                                            </div>
                                        </motion.div>

                                        <motion.div className="absolute inset-0 bg-white flex flex-col items-center justify-center p-8 text-center" style={{ opacity: loadingOpacity }}>
                                            <Loader2 className="w-8 h-8 text-orange-500 animate-spin mb-4" />
                                        </motion.div>

                                        <motion.div className="absolute inset-0 bg-white flex flex-col" style={{ opacity: bioPageOpacity }}>
                                            <div className="h-24 bg-gradient-to-br from-orange-400 to-purple-600" />
                                            <div className="mt-8 text-center px-4">
                                                <div className="w-16 h-16 rounded-full mx-auto -mt-16 border-4 border-white bg-gray-100" />
                                                <h4 className="font-bold mt-2">John Doe</h4>
                                                <div className="mt-4 space-y-2">
                                                    {[1, 2, 3].map(i => <div key={i} className="h-10 bg-gray-50 rounded-lg" />)}
                                                </div>
                                            </div>
                                        </motion.div>

                                        <motion.div className="absolute inset-0 bg-gray-50 p-6 pt-14" style={{ opacity: dashboardOpacity }}>
                                            <div className="bg-white rounded-xl p-4 mb-4 shadow-sm h-full" />
                                        </motion.div>

                                        {/* Home indicator */}
                                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[80px] h-[4px] bg-gray-300 rounded-full z-50" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                </div>
            </div>
        </div>
    )
}
