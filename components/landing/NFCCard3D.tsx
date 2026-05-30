'use client'

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { Wifi, QrCode } from 'lucide-react'
import { useState } from 'react'

interface NFCCard3DProps {
    className?: string
    delay?: number
    variant?: 1 | 2 | 3
}

export const NFCCard3D = ({ className = '', delay = 0, variant = 1 }: NFCCard3DProps) => {
    const [isHovered, setIsHovered] = useState(false)

    // Mouse tracking for 3D effect
    const x = useMotionValue(0)
    const y = useMotionValue(0)

    // Spring physics configuration
    const springConfig = { damping: 20, stiffness: 200, mass: 0.5 }
    const rotateXSpring = useSpring(useTransform(y, [-0.5, 0.5], [15, -15]), springConfig)
    const rotateYSpring = useSpring(useTransform(x, [-0.5, 0.5], [-15, 15]), springConfig)

    // Parallax values for inner elements
    const innerX = useSpring(useTransform(x, [-0.5, 0.5], [10, -10]), springConfig)
    const innerY = useSpring(useTransform(y, [-0.5, 0.5], [10, -10]), springConfig)

    const variants = {
        1: {
            gradient: 'from-gray-900 via-[#1a1c2e] to-gray-900',
            accent: 'orange-500',
            glow: 'rgba(249, 115, 22, 0.4)',
            name: 'Entrepreneur'
        },
        2: {
            gradient: 'from-[#2e1065] via-[#4c1d95] to-[#2e1065]',
            accent: 'purple-500',
            glow: 'rgba(168, 85, 247, 0.4)',
            name: 'Designer'
        },
        3: {
            gradient: 'from-[#431407] via-[#78350f] to-[#431407]',
            accent: 'orange-400',
            glow: 'rgba(251, 146, 60, 0.4)',
            name: 'Développeur'
        }
    }

    const currentVariant = variants[variant]

    function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
        const rect = event.currentTarget.getBoundingClientRect()
        const width = rect.width
        const height = rect.height
        const mouseX = event.clientX - rect.left
        const mouseY = event.clientY - rect.top
        const xPct = (mouseX / width) - 0.5
        const yPct = (mouseY / height) - 0.5
        x.set(xPct)
        y.set(yPct)
    }

    function handleMouseLeave() {
        x.set(0)
        y.set(0)
        setIsHovered(false)
    }

    return (
        <div
            className={`relative ${className} group`}
            style={{ perspective: '1200px' }}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={handleMouseLeave}
        >
            {/* Dynamic Glow Shadow */}
            <motion.div
                className="absolute inset-4 rounded-3xl blur-3xl transition-opacity duration-500"
                style={{
                    backgroundColor: currentVariant.glow,
                    opacity: isHovered ? 0.8 : 0.3,
                    scale: isHovered ? 1.1 : 1,
                    translateX: useTransform(x, [-0.5, 0.5], [-20, 20]),
                    translateY: useTransform(y, [-0.5, 0.5], [-20, 20]),
                }}
            />

            {/* Main Interactive Card */}
            <motion.div
                className="relative w-full h-[220px] sm:h-[260px] cursor-pointer"
                style={{
                    rotateX: rotateXSpring,
                    rotateY: rotateYSpring,
                    transformStyle: 'preserve-3d',
                }}
                animate={!isHovered ? {
                    y: [0, -10, 0],
                    rotateY: [-5, 5, -5],
                    rotateX: [2, -2, 2],
                } : {}}
                transition={!isHovered ? {
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay
                } : { type: "spring", ...springConfig }}
            >
                {/* Card Body */}
                <div className={`
                    relative w-full h-full
                    bg-gradient-to-br ${currentVariant.gradient}
                    rounded-2xl p-6 sm:p-8
                    shadow-[0_20px_50px_rgba(0,0,0,0.5)]
                    border-0 lg:border border-white/20
                    overflow-hidden backdrop-blur-sm
                `}>
                    {/* Reflective Sheen Layer */}
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none"
                        style={{
                            translateX: useTransform(x, [-0.5, 0.5], [-50, 50]),
                            translateY: useTransform(y, [-0.5, 0.5], [-50, 50]),
                        }}
                    />

                    {/* Content Wrapper with Parallax */}
                    <motion.div
                        className="relative h-full flex flex-col justify-between z-10"
                        style={{
                            translateX: innerX,
                            translateY: innerY,
                            z: 50
                        }}
                    >
                        {/* Top Section */}
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="h-8 w-24 relative mb-2">
                                    <img
                                        src="/assets/logos/logo-white-full.svg"
                                        alt="OFIKA"
                                        className="w-full h-full object-contain opacity-90"
                                    />
                                </div>
                                <p className={`text-${currentVariant.accent} text-[10px] sm:text-xs font-bold uppercase tracking-widest`}>
                                    Smart Connectivity
                                </p>
                            </div>

                            <motion.div
                                animate={{
                                    scale: [1, 1.2, 1],
                                    opacity: [0.3, 0.8, 0.3],
                                }}
                                transition={{ duration: 3, repeat: Infinity, delay }}
                            >
                                <Wifi className="w-8 h-8 sm:w-10 sm:h-10 text-white/40" />
                            </motion.div>
                        </div>

                        {/* Middle - Interactive Lines */}
                        <div className="space-y-2">
                            <motion.div
                                className={`h-1.5 w-full bg-gradient-to-r from-${currentVariant.accent} via-white/20 to-transparent rounded-full`}
                                style={{ x: useTransform(x, [-0.5, 0.5], [-10, 10]) }}
                            />
                            <motion.div
                                className="h-1 w-2/3 bg-gradient-to-r from-white/20 to-transparent rounded-full"
                                style={{ x: useTransform(x, [-0.5, 0.5], [5, -5]) }}
                            />
                        </div>

                        {/* Bottom Section */}
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-white text-lg sm:text-xl font-bold tracking-tight">John Doe</p>
                                <p className="text-white/50 text-xs font-medium uppercase">{currentVariant.name}</p>
                            </div>

                            <div className="bg-white/10 p-2 rounded-xl backdrop-blur-md border border-white/10 group-hover:bg-white/20 transition-colors">
                                <QrCode className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                        </div>
                    </motion.div>

                    {/* Continuous Scanning Light Effect */}
                    <motion.div
                        className="absolute top-0 left-[-100%] w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-[-20deg]"
                        animate={{
                            left: ['100%', '-100%'],
                        }}
                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "linear",
                            delay: delay * 2
                        }}
                    />
                </div>
            </motion.div>
        </div>
    )
}
