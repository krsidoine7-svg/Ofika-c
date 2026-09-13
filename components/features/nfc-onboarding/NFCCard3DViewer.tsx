'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion'
import QRCode from 'react-qr-code'
import { RotateCcw, Play, Pause, Sparkles, QrCode, Wifi, Smartphone, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface NFCCard3DViewerProps {
  fullName?: string
  jobTitle?: string
  company?: string
  logoUrl?: string
  backgroundColor?: 'black' | 'white'
  cardDesign?: 'design1' | 'design2'
  qrValue?: string
  autoRotateDefault?: boolean
  className?: string
  compact?: boolean
  showControls?: boolean
}

// Logo SVG Officiel Ofika
const DefaultOfikaLogo = ({ color = '#FFFFFF', className = 'w-12 h-12' }: { color?: string; className?: string }) => (
  <svg className={className} viewBox="0 0 73.69 74.29" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill={color} d="m36.73,45.03c3.95-.09,7.08,3.1,7.57,7.71.78,7.24,1.31,7.87,8.39,9.33,3.39.7,6.07,2.32,5.99,6.13-.07,3.27-1.78,5.89-5.35,6.08-3.85.2-5.97-1.92-6.78-5.8-1.43-6.79-3.04-7.97-9.76-7.98-6.58-.01-8.14,1.22-9.7,7.97-.86,3.73-2.93,6.05-6.84,5.79-3.27-.22-5.03-2.42-5.16-5.65-.17-4.11,2.32-6.25,6.03-6.5,5.61-.38,7.59-3.56,8.09-8.76.54-5.52,3.25-8.22,7.53-8.31Z" />
    <path fill={color} d="m67.5,14.91c3.39.45,5.8,2.07,6.1,5.55.32,3.74-2.05,5.86-5.33,6.81-7.58,2.17-10.37,7.59-7.67,15.24.92,2.61,2.77,4.12,5.5,4.28,2.05.12,3.87.63,5.41,2.06,1.86,1.73,2.69,3.81,1.85,6.28-.81,2.4-2.61,3.86-5.09,4.16-2.53.31-4.52-.83-5.74-3.06-.54-.99-.81-2.16-1.04-3.29-1.38-6.62-2.44-7.61-9.04-8.29-4.82-.5-7.67-3.24-7.7-7.42-.03-4.39,2.96-7.44,7.97-7.57,5.12-.13,8.04-2.42,8.6-7.61.42-3.87,2.12-6.59,6.19-7.14Z" />
    <path fill={color} d="m0,52.87c.43-3.64,2.86-5.39,6.49-6.01,5.53-.94,7.32-3.42,7.27-9.79-.05-6.39-1.74-8.57-7.47-9.62C2.69,26.8.04,25.06.09,21.01c.04-3.46,2.03-5.72,5.45-5.91,3.94-.22,6.21,2.24,6.56,5.99.58,6.19,3.82,8.53,9.78,8.64,4.26.08,7.2,3.67,6.93,7.56-.3,4.42-2.67,6.92-7.15,7.39-7.45.79-7.86,1.17-9.56,8.74-.83,3.71-2.81,6.15-6.74,5.82-3.42-.29-5.13-2.64-5.37-6.38Z" />
    <path fill={color} d="m37.51,29.19c-4.62.15-7.89-2.66-8.33-7.89-.48-5.78-2.85-8.76-8.77-9.21-3.51-.27-5.64-2.72-5.32-6.55C15.36,2.31,17.18.21,20.44.06c3.65-.16,5.7,1.99,6.58,5.51,1.94,7.73,7.99,10.62,15.28,7.5,3.51-1.5,3.77-4.64,4.44-7.76C47.43,2.04,49.52.03,52.97,0c3.12-.03,4.81,1.94,5.53,4.77.84,3.28-.61,6.32-3.56,6.66-7.84.89-11.03,4.9-11.31,12.69-.11,3.03-3.2,4.86-6.12,5.08Z" />
  </svg>
)

// Contactless NFC Wave Icon (Authentic card style)
const ContactlessIcon = ({ className = "w-5 h-5", color = "currentColor" }: { className?: string; color?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 17.5a6.5 6.5 0 0 1 0-11" opacity="0.4" />
    <path d="M10 19a9.5 9.5 0 0 1 0-14" opacity="0.7" />
    <path d="M13 20.5a12.5 12.5 0 0 1 0-17" />
    <path d="M16 22a15.5 15.5 0 0 1 0-20" opacity="0.9" />
  </svg>
)

// EMV/NFC Chip Mockup for ultra-modern aesthetic
const MetallicChip = ({ isDark = true }: { isDark?: boolean }) => (
  <div className={cn(
    "relative w-9 h-7 rounded-md p-0.5 border overflow-hidden shadow-inner",
    isDark
      ? "bg-gradient-to-br from-amber-200 via-amber-400 to-yellow-600 border-amber-300/60"
      : "bg-gradient-to-br from-amber-100 via-amber-300 to-yellow-500 border-amber-400/50"
  )}>
    <div className="w-full h-full border border-black/20 rounded-sm relative flex flex-col justify-between p-0.5">
      <div className="w-full h-[1px] bg-black/30" />
      <div className="flex justify-between w-full">
        <div className="w-2 h-[1px] bg-black/30" />
        <div className="w-2 h-2 rounded-full border border-black/30" />
        <div className="w-2 h-[1px] bg-black/30" />
      </div>
      <div className="w-full h-[1px] bg-black/30" />
    </div>
  </div>
)

export function NFCCard3DViewer({
  fullName = 'Alexandre Dupont',
  jobTitle = 'Directeur Commercial',
  company = 'OFIKA GLOBAL',
  logoUrl,
  backgroundColor = 'black',
  cardDesign = 'design1',
  qrValue = 'https://ofika.ci/demo-card',
  autoRotateDefault = false,
  className,
  compact = false,
  showControls = true
}: NFCCard3DViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isFlipped, setIsFlipped] = useState(false)
  const [isAutoRotating, setIsAutoRotating] = useState(autoRotateDefault)
  const [isHovered, setIsHovered] = useState(false)

  // Motion values for tilt & rotation
  const rotateX = useSpring(0, { stiffness: 180, damping: 20 })
  const rotateY = useSpring(0, { stiffness: 180, damping: 20 })
  const glareX = useSpring(50, { stiffness: 200, damping: 25 })
  const glareY = useSpring(50, { stiffness: 200, damping: 25 })
  const glareOpacity = useSpring(0, { stiffness: 200, damping: 25 })

  // Auto rotation continuous loop
  useEffect(() => {
    let animationFrameId: number
    let startTime: number | null = null

    const animate = (time: number) => {
      if (!startTime) startTime = time
      const elapsed = time - startTime

      if (isAutoRotating && !isHovered) {
        // Full 360 rotation every 10 seconds
        const currentAngle = (elapsed / 10000) * 360 % 360
        rotateY.set(currentAngle)

        // Subtle dynamic light glare shifting with rotation
        const gX = 50 + Math.sin((currentAngle * Math.PI) / 180) * 40
        const gY = 50 + Math.cos((currentAngle * Math.PI) / 180) * 20
        glareX.set(gX)
        glareY.set(gY)
        glareOpacity.set(0.35)
      }

      animationFrameId = requestAnimationFrame(animate)
    }

    if (isAutoRotating) {
      animationFrameId = requestAnimationFrame(animate)
    }

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId)
    }
  }, [isAutoRotating, isHovered, rotateY, glareX, glareY, glareOpacity])

  // Mouse tilt handlers for realistic 3D feel
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || isAutoRotating) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    const rotX = -((y - centerY) / centerY) * 16 // Max 16 deg X tilt
    const baseRotY = isFlipped ? 180 : 0
    const rotY = baseRotY + ((x - centerX) / centerX) * 20 // Max 20 deg Y tilt

    rotateX.set(rotX)
    rotateY.set(rotY)

    glareX.set((x / rect.width) * 100)
    glareY.set((y / rect.height) * 100)
    glareOpacity.set(0.4)
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
    if (!isAutoRotating) {
      glareOpacity.set(0.3)
    }
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    if (!isAutoRotating) {
      rotateX.set(0)
      rotateY.set(isFlipped ? 180 : 0)
      glareOpacity.set(0)
    }
  }

  const handleFlipToggle = () => {
    const nextFlipped = !isFlipped
    setIsFlipped(nextFlipped)
    setIsAutoRotating(false)
    rotateX.set(0)
    rotateY.set(nextFlipped ? 180 : 0)
  }

  const toggleAutoRotate = () => {
    if (isAutoRotating) {
      setIsAutoRotating(false)
      rotateX.set(0)
      rotateY.set(isFlipped ? 180 : 0)
      glareOpacity.set(0)
    } else {
      setIsAutoRotating(true)
    }
  }

  const resetView = () => {
    setIsAutoRotating(false)
    setIsFlipped(false)
    rotateX.set(0)
    rotateY.set(0)
    glareOpacity.set(0)
  }

  const isDark = backgroundColor === 'black'

  const cardThemeClasses = isDark
    ? "bg-gradient-to-br from-[#0c0d10] via-[#171920] to-[#20232c] text-white border-white/15"
    : "bg-gradient-to-br from-[#ffffff] via-[#fbfbfc] to-[#f0f2f5] text-gray-900 border-gray-200/80"

  const cardShadowClasses = isDark
    ? "shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85),0_0_20px_rgba(255,255,255,0.04)_inset]"
    : "shadow-[0_25px_50px_-12px_rgba(0,0,0,0.18),0_0_20px_rgba(0,0,0,0.02)_inset]"

  const logoColor = isDark ? '#FFFFFF' : '#0F172A'
  const textColor = isDark ? 'text-white' : 'text-slate-900'
  const textMutedColor = isDark ? 'text-slate-400' : 'text-slate-500'
  const accentBorderColor = isDark ? 'border-white/10' : 'border-black/10'

  return (
    <div className={cn("flex flex-col items-center w-full select-none", className)}>
      {/* 3D Scene Viewport */}
      <div
        className="w-full relative flex items-center justify-center py-4"
        style={{ perspective: '1400px' }}
      >
        {/* Animated Glow Backdrop */}
        <div
          className={cn(
            "absolute w-72 h-44 sm:w-96 sm:h-56 rounded-full blur-3xl opacity-30 transition-all duration-700 pointer-events-none -z-10",
            isDark ? "bg-orange-500/20" : "bg-orange-400/20"
          )}
        />

        {/* 3D Card Interactive Container */}
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={handleFlipToggle}
          className={cn(
            "cursor-pointer relative aspect-[85.6/53.98] transition-transform",
            compact
              ? "w-full max-w-[320px] sm:max-w-[380px]"
              : "w-full max-w-[340px] sm:max-w-[440px] md:max-w-[480px]"
          )}
          style={{ transformStyle: 'preserve-3d' }}
        >
          <motion.div
            className="w-full h-full relative"
            style={{
              rotateX,
              rotateY,
              transformStyle: 'preserve-3d'
            }}
          >
            {/* ========================================================
                RECTO (FRONT FACE)
            ======================================================== */}
            <div
              className={cn(
                "absolute inset-0 w-full h-full rounded-[18px] sm:rounded-[22px] border p-5 sm:p-6 md:p-7 flex flex-col justify-between overflow-hidden transition-colors duration-500",
                cardThemeClasses,
                cardShadowClasses
              )}
              style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: 'rotateY(0deg)',
              }}
            >
              {/* Dynamic Sheen / Glare Layer */}
              <motion.div
                className="absolute inset-0 pointer-events-none rounded-[inherit]"
                style={{
                  background: useTransform(
                    [glareX, glareY],
                    ([gx, gy]) =>
                      `radial-gradient(circle 280px at ${gx}% ${gy}%, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.06) 40%, transparent 80%)`
                  ),
                  opacity: glareOpacity
                }}
              />

              {/* Brushed Metallic Micro-Texture Effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.02] to-transparent pointer-events-none" />

              {/* TOP ROW: Contactless NFC wave & Tech Tag */}
              <div className="relative z-10 flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] sm:text-[10px] font-semibold tracking-wider uppercase border",
                    isDark
                      ? "bg-white/5 border-white/10 text-white/80 backdrop-blur-sm"
                      : "bg-black/5 border-black/10 text-slate-700 backdrop-blur-sm"
                  )}>
                    <Sparkles className="w-2.5 h-2.5 text-orange-500" />
                    <span>Ofika Smart Card</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <ContactlessIcon
                    className="w-5 h-5 sm:w-6 sm:h-6 opacity-80"
                    color={isDark ? "#FFFFFF" : "#0F172A"}
                  />
                </div>
              </div>

              {/* CENTER: Logo & Brand Identity */}
              {cardDesign === 'design1' ? (
                /* Design 1: Minimalist Balance with Side-by-side Harmony */
                <div className="relative z-10 my-auto flex items-center justify-center gap-4 sm:gap-6">
                  {/* Brand Monogram / Custom Logo */}
                  <div className="w-14 h-14 sm:w-18 sm:h-18 md:w-20 md:h-20 flex items-center justify-center flex-shrink-0 drop-shadow-sm">
                    {logoUrl ? (
                      <img
                        src={logoUrl}
                        alt="Logo Entreprise"
                        className="max-h-full max-w-full object-contain rounded-sm"
                      />
                    ) : (
                      <DefaultOfikaLogo
                        color={logoColor}
                        className="w-12 h-12 sm:w-16 sm:h-16"
                      />
                    )}
                  </div>

                  {/* Vertical Elegant Divider */}
                  <div className={cn("h-12 sm:h-16 w-px", accentBorderColor, "bg-current opacity-20")} />

                  {/* Company & Motto */}
                  <div className="flex flex-col justify-center text-left">
                    <h3 className={cn("font-bold text-sm sm:text-base md:text-lg tracking-[0.15em] uppercase font-sans leading-tight", textColor)}>
                      {company || 'OFIKA CONNECT'}
                    </h3>
                    <p className={cn("text-[10px] sm:text-xs tracking-wider uppercase mt-0.5", textMutedColor)}>
                      Smart NFC Profile
                    </p>
                  </div>
                </div>
              ) : (
                /* Design 2: Centerpiece Executive Luxury */
                <div className="relative z-10 my-auto flex flex-col items-center justify-center text-center space-y-2 sm:space-y-3">
                  <div className="w-14 h-14 sm:w-18 sm:h-18 md:w-20 md:h-20 flex items-center justify-center drop-shadow-md">
                    {logoUrl ? (
                      <img
                        src={logoUrl}
                        alt="Logo Entreprise"
                        className="max-h-full max-w-full object-contain rounded-sm"
                      />
                    ) : (
                      <DefaultOfikaLogo
                        color={logoColor}
                        className="w-12 h-12 sm:w-16 sm:h-16"
                      />
                    )}
                  </div>
                  <div>
                    <h3 className={cn("font-extrabold text-base sm:text-lg md:text-xl tracking-[0.2em] uppercase font-sans", textColor)}>
                      {company || 'OFIKA CONNECT'}
                    </h3>
                    <div className="flex items-center justify-center gap-1.5 mt-1">
                      <span className={cn("text-[9px] sm:text-[10px] tracking-[0.25em] uppercase", textMutedColor)}>
                        Digital Card
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* BOTTOM ROW: Chip Accent & Micro Tap indicator */}
              <div className="relative z-10 flex items-end justify-between w-full">
                <div className="flex items-center gap-2">
                  <MetallicChip isDark={isDark} />
                </div>

                <div className="flex items-center gap-1.5 opacity-60 text-[9px] sm:text-[10px] font-medium tracking-wider uppercase">
                  <Wifi className="w-3 h-3 text-orange-500 animate-pulse" />
                  <span>Tap to Connect</span>
                </div>
              </div>
            </div>

            {/* ========================================================
                VERSO (BACK FACE - ROTATED 180 DEG)
            ======================================================== */}
            <div
              className={cn(
                "absolute inset-0 w-full h-full rounded-[18px] sm:rounded-[22px] border p-4 sm:p-5 md:p-6 flex flex-col justify-between overflow-hidden transition-colors duration-500",
                cardThemeClasses,
                cardShadowClasses
              )}
              style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
              }}
            >
              {/* Dynamic Sheen / Glare Layer on Verso */}
              <motion.div
                className="absolute inset-0 pointer-events-none rounded-[inherit]"
                style={{
                  background: useTransform(
                    [glareX, glareY],
                    ([gx, gy]) =>
                      `radial-gradient(circle 280px at ${gx}% ${gy}%, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 40%, transparent 80%)`
                  ),
                  opacity: glareOpacity
                }}
              />

              {/* Verso Layout - Structured High-End Business Card */}
              {cardDesign === 'design1' ? (
                /* Verso Design 1: Professional Side-by-Side (QR + User Profile) */
                <div className="relative z-10 h-full flex flex-col justify-between">
                  {/* Top Bar on Verso */}
                  <div className="flex items-center justify-between w-full pb-1 border-b border-current/10">
                    <span className={cn("text-[9px] sm:text-[10px] font-bold tracking-[0.2em] uppercase", textMutedColor)}>
                      {company || 'OFIKA NETWORK'}
                    </span>
                    <div className="flex items-center gap-1 text-[9px] sm:text-[10px] font-medium text-orange-500">
                      <ContactlessIcon className="w-3.5 h-3.5" color="#f97316" />
                      <span>NFC ENABLED</span>
                    </div>
                  </div>

                  {/* Middle Content */}
                  <div className="flex items-center justify-between gap-3 sm:gap-4 my-auto">
                    {/* Left: QR Code in crisp luxury container */}
                    <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                      <div className="p-1.5 sm:p-2 bg-white rounded-xl shadow-md border border-slate-200/80 flex items-center justify-center">
                        <QRCode
                          value={qrValue || 'https://ofika.ci'}
                          size={88}
                          style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                          className="w-16 h-16 sm:w-20 sm:h-20 md:w-22 md:h-22"
                          viewBox="0 0 256 256"
                        />
                      </div>
                      <span className={cn("text-[8px] sm:text-[9px] font-medium tracking-wide flex items-center gap-1", textMutedColor)}>
                        <QrCode className="w-2.5 h-2.5 text-orange-500" />
                        Scannez-moi
                      </span>
                    </div>

                    {/* Right: Personal & Professional Details */}
                    <div className="flex-1 flex flex-col justify-center text-left pl-1 sm:pl-2">
                      <h4 className={cn("font-bold text-sm sm:text-base md:text-lg leading-tight tracking-tight", textColor)}>
                        {fullName || 'Alexandre Dupont'}
                      </h4>
                      <p className={cn("text-xs sm:text-sm font-medium mt-0.5", textMutedColor)}>
                        {jobTitle || 'Directeur Général'}
                      </p>
                      
                      <div className="mt-2 pt-2 border-t border-current/10 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                        <span className={cn("text-[9px] sm:text-[10px] font-mono", textMutedColor)}>
                          ofika.ci/connect
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Bar */}
                  <div className="flex items-center justify-between text-[8px] sm:text-[9px] opacity-60 font-mono">
                    <span>ID: OFK-{(fullName || 'CARD').slice(0, 4).toUpperCase()}</span>
                    <span>TOUCH & SHARE</span>
                  </div>
                </div>
              ) : (
                /* Verso Design 2: Centered Executive Signature */
                <div className="relative z-10 h-full flex flex-col justify-between text-center items-center">
                  <div className="flex items-center justify-between w-full pb-1 border-b border-current/10">
                    <span className={cn("text-[9px] font-bold tracking-widest uppercase", textMutedColor)}>
                      OFIKA PASS
                    </span>
                    <ContactlessIcon className="w-3.5 h-3.5 text-orange-500" />
                  </div>

                  {/* Center Info + Mini QR */}
                  <div className="flex flex-col items-center justify-center my-auto space-y-2">
                    <div className="p-1.5 bg-white rounded-lg shadow border border-slate-200">
                      <QRCode
                        value={qrValue || 'https://ofika.ci'}
                        size={64}
                        className="w-12 h-12 sm:w-14 sm:h-14"
                      />
                    </div>
                    <div>
                      <h4 className={cn("font-extrabold text-sm sm:text-base md:text-lg", textColor)}>
                        {fullName || 'Alexandre Dupont'}
                      </h4>
                      <p className={cn("text-xs font-medium text-orange-500", textMutedColor)}>
                        {jobTitle || 'Fondateur & CEO'}
                      </p>
                    </div>
                  </div>

                  <div className="w-full flex justify-between items-center text-[8px] sm:text-[9px] opacity-50 font-mono">
                    <span>NFC TAP READY</span>
                    <span>ALL RIGHTS RESERVED</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Floating Side Active Indicator & Interactive Controls */}
      {showControls && (
        <div className="w-full max-w-md mt-3 sm:mt-4 flex flex-col items-center gap-3">
          {/* Active Side Badge */}
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all shadow-sm",
                !isFlipped
                  ? "bg-orange-500/10 text-orange-600 border border-orange-200"
                  : "bg-slate-900/10 text-slate-800 border border-slate-200"
              )}
            >
              <span className={cn(
                "w-2 h-2 rounded-full",
                !isFlipped ? "bg-orange-500 animate-pulse" : "bg-blue-500"
              )} />
              {!isFlipped ? "Face Avant (Recto)" : "Face Arrière (Verso)"}
            </span>

            {isAutoRotating && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 animate-fade-in">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                Rotation 360° active
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2 w-full px-2">
            {/* Flip Button */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleFlipToggle}
              className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold rounded-xl hover:bg-orange-50 hover:text-orange-600 hover:border-orange-300 transition-all shadow-sm"
            >
              <RotateCcw className={cn("w-3.5 h-3.5 transition-transform duration-500", isFlipped && "rotate-180")} />
              <span>{isFlipped ? "Voir le Recto" : "Voir le Verso"}</span>
            </Button>

            {/* Auto-Rotation Button */}
            <Button
              type="button"
              variant={isAutoRotating ? "default" : "outline"}
              size="sm"
              onClick={toggleAutoRotate}
              className={cn(
                "flex items-center gap-1.5 text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-sm",
                isAutoRotating
                  ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white border-0 hover:from-orange-600 hover:to-pink-600"
                  : "hover:bg-orange-50 hover:text-orange-600 hover:border-orange-300"
              )}
            >
              {isAutoRotating ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause 360°</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>Rotation Auto 360°</span>
                </>
              )}
            </Button>

            {/* Reset View Button */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={resetView}
              className="text-xs text-gray-500 hover:text-gray-900 rounded-xl px-2 sm:px-3"
            >
              Recentrer
            </Button>
          </div>

          {/* Interaction Tip */}
          <p className="text-[11px] sm:text-xs text-gray-400 text-center flex items-center justify-center gap-1">
            <span>💡</span>
            <span>Cliquez sur la carte ou survolez-la pour l'incliner en 3D</span>
          </p>
        </div>
      )}
    </div>
  )
}
