'use client'

import { motion } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles, Zap, Smartphone } from 'lucide-react'
import Link from 'next/link'

interface ModernHeroProps {
    videoUrl?: string
}

export const ModernHero = ({ videoUrl }: ModernHeroProps) => {
    const containerRef = useRef<HTMLElement>(null)
    const [isLoaded, setIsLoaded] = useState(false)
    const [particles, setParticles] = useState<any[]>([])

    useEffect(() => {
        setIsLoaded(true)
        // Generate particles only on the client
        const newParticles = [...Array(8)].map((_, i) => ({
            id: i,
            x: Math.random() * 500 - 250,
            y: Math.random() * 500 - 250,
            targetY: Math.random() * -100 - 50,
            duration: Math.random() * 4 + 3,
            delay: Math.random() * 5
        }))
        setParticles(newParticles)
    }, [])





    return (
        <section
            ref={containerRef}
            className="relative min-h-screen flex items-center justify-center pt-24 pb-20 overflow-hidden bg-white"
        >
            {/* Ambient Background Glows */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <motion.div
                    className="absolute top-[-10%] left-[-5%] w-[60%] h-[60%] bg-orange-100/40 rounded-full blur-[120px]"
                    animate={{
                        scale: [1, 1.05, 1],
                        opacity: [0.3, 0.4, 0.3]
                    }}
                    transition={{ duration: 10, repeat: Infinity }}
                />
                <motion.div
                    className="absolute bottom-[-10%] right-[-5%] w-[60%] h-[60%] bg-purple-50/30 rounded-full blur-[120px]"
                    animate={{
                        scale: [1.05, 1, 1.05],
                        opacity: [0.2, 0.3, 0.2]
                    }}
                    transition={{ duration: 12, repeat: Infinity, delay: 1 }}
                />
            </div>



            {/* --- PREMIUM DARK CONTAINER (CINETPAY STYLE) --- */}
            <div className="container mx-auto px-4 sm:px-6 relative z-10">
                <motion.div 
                    className="relative w-full max-w-[1186px] mx-auto rounded-[20px] bg-[#09090b] border border-white/[0.08] shadow-[0_24px_80px_rgba(0,0,0,0.4)] py-16 px-6 sm:px-12 md:py-24 text-center overflow-hidden"
                >
                    {/* Warm Center Glow */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.15)_0%,transparent_65%)] pointer-events-none" />
                    
                    {/* Decorative glowing top line */}
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    
                    {/* Grid Pattern inside the dark container */}
                    <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
                        style={{ backgroundImage: `radial-gradient(#fff 1px, transparent 1px)`, backgroundSize: '30px 30px' }}
                    />

                    {/* Content Wrapper */}
                    <div className="relative z-10">
                        {/* Top Pill Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs sm:text-sm font-semibold text-gray-300 mb-8 sm:mb-10">
                            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                            DÉCOUVREZ LA NOUVELLE CARTE NFC OFIKA
                        </div>

                        {/* Centered Headline with Tilted Orange Badge */}
                        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white leading-[1.22] tracking-tight mb-6 max-w-4xl mx-auto">
                            Le profil professionnel <br />
                            <span className="inline-block px-5 py-1.5 my-2 bg-gradient-to-r from-orange-600 to-ofika-orange text-white rounded-2xl transform -rotate-2 shadow-lg shadow-orange-500/20 font-black">
                                numérique
                            </span> <br />
                            que tu emmènes <span className="inline-block px-5 py-1.5 my-2 bg-gradient-to-r from-pink-600 to-rose-500 text-white rounded-2xl transform rotate-2 shadow-lg shadow-pink-500/20 font-black">partout</span>
                        </h1>

                        {/* Subtitle / Tagline Identité Visuelle */}
                        <p className="text-base sm:text-xl text-gray-300 font-medium max-w-3xl mx-auto mb-10 leading-relaxed">
                            La <span className="text-orange-400 font-semibold">carte NFC</span> et le <span className="text-orange-400 font-semibold">QR code</span> deviennent simplement les moyens d'accès instantanés à votre <span className="text-white font-bold">identité</span>.
                        </p>

                        {/* CTA Button */}
                        <div className="flex justify-center mb-16">
                            <Link href="/onboarding/public-page">
                                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                    <Button size="lg" className="h-[66px] px-10 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white rounded-[20px] text-base sm:text-lg font-bold shadow-lg shadow-orange-500/20 transition-all group flex items-center gap-2">
                                        Créer mon profil gratuit
                                        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </motion.div>
                            </Link>
                        </div>

                        {/* Bottom Value Props */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-10 border-t border-white/[0.08] max-w-2xl mx-auto">
                            <div className="flex items-center sm:justify-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 flex-shrink-0">
                                    <Zap className="w-5 h-5" />
                                </div>
                                <div className="text-left">
                                    <span className="text-sm font-bold text-white block">Configuration 2 min</span>
                                    <span className="text-xs text-gray-500">Simple et ultra rapide</span>
                                </div>
                            </div>
                            
                            <div className="flex items-center sm:justify-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 flex-shrink-0">
                                    <Smartphone className="w-5 h-5" />
                                </div>
                                <div className="text-left">
                                    <span className="text-sm font-bold text-white block">Zéro Friction</span>
                                    <span className="text-xs text-gray-500">Un seul tap pour connecter</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
            

        </section>
    )
}
