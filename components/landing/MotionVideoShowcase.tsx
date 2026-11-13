'use client'

import { useRef, useState } from 'react'
import { Play, Pause, Volume2, VolumeX } from 'lucide-react'

interface MotionVideoShowcaseProps {
  videoUrl?: string
}

export function MotionVideoShowcase({ videoUrl = '/ofika-deo-motion.mp4' }: MotionVideoShowcaseProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isMuted, setIsMuted] = useState(true)

  const togglePlay = () => {
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.pause()
      setIsPlaying(false)
    } else {
      videoRef.current.play()
      setIsPlaying(true)
    }
  }

  const toggleMute = () => {
    if (!videoRef.current) return
    videoRef.current.muted = !isMuted
    setIsMuted(!isMuted)
  }

  return (
    <section id="demo-video" className="py-16 sm:py-24 bg-white border-b border-gray-100 overflow-hidden">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* En-tête de section Éditorial & Minimaliste */}
        <div className="text-center mb-8 sm:mb-12 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 border border-neutral-200/70 text-[11px] sm:text-xs font-medium text-neutral-700 mb-4 tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Démo vidéo officielle • 20s</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-neutral-900 tracking-tight leading-[1.18] sm:leading-[1.15] mb-4">
            Ofika en mouvement, <br />
            <span className="text-neutral-400 font-normal">l&apos;expérience sans contact en action.</span>
          </h2>
          <p className="text-base sm:text-lg text-neutral-600 leading-relaxed">
            Regardez comment une simple carte physique transforme instantanément vos rencontres et votre visibilité professionnelle.
          </p>
        </div>

        {/* Cadre Lecteur Vidéo 16:9 Cinématique */}
        <div className="relative w-full max-w-5xl mx-auto rounded-2xl sm:rounded-3xl overflow-hidden border border-neutral-200/90 shadow-sm bg-neutral-950 group">
          <video
            ref={videoRef}
            src={videoUrl}
            autoPlay
            loop
            muted={isMuted}
            playsInline
            preload="metadata"
            className="w-full aspect-video object-cover cursor-pointer"
            onClick={togglePlay}
          />

          {/* Contrôles discrets au survol / au toucher */}
          <div className="absolute bottom-4 right-4 flex items-center gap-2 z-20">
            {/* Bouton Mute / Unmute */}
            <button
              type="button"
              onClick={toggleMute}
              className="w-10 h-10 rounded-full bg-neutral-950/80 hover:bg-black text-white border border-white/20 backdrop-blur-md flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-sm"
              title={isMuted ? "Activer le son" : "Couper le son"}
              aria-label={isMuted ? "Activer le son" : "Couper le son"}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>

            {/* Bouton Play / Pause */}
            <button
              type="button"
              onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-neutral-950/80 hover:bg-black text-white border border-white/20 backdrop-blur-md flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-sm"
              title={isPlaying ? "Mettre en pause" : "Lire la vidéo"}
              aria-label={isPlaying ? "Mettre en pause" : "Lire la vidéo"}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 translate-x-0.5" />}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
