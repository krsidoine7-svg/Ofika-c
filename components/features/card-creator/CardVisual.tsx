import { QrCode } from "lucide-react"
import QRCode from 'react-qr-code'
import React, { useEffect, useState } from 'react'

interface CardVisualProps {
    design: 'design1' | 'design2'
    color: 'black' | 'white'
    isFlipped: boolean
    data: {
        company?: string
        logoUrl?: string
        fullName?: string
        jobTitle?: string
        qrValue?: string
    }
}

/**
 * Emblème officiel vectoriel Ofika (4 courbes géométriques parfaites)
 * Rendu vectoriel pur, net sur tous les écrans, sans dépendance réseau.
 */
export const OfikaEmblem = ({ color = '#FFFFFF', className = 'w-10 h-10' }: { color?: string; className?: string }) => {
    return (
        <svg viewBox="0 0 344.19 347" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
            <g>
                <path fill={color} d="m171.53,210.3c18.45-.4,33.06,14.47,35.37,35.99,3.63,33.84,6.13,36.76,39.2,43.6,15.85,3.28,28.36,10.81,27.96,28.65-.34,15.3-8.3,27.53-25,28.39-17.96.93-27.86-8.99-31.68-27.08-6.7-31.7-14.18-37.22-45.56-37.28-30.74-.07-38.03,5.7-45.29,37.21-4.01,17.42-13.7,28.27-31.97,27.06-15.25-1.01-23.5-11.31-24.12-26.41-.8-19.2,10.84-29.18,28.17-30.37,26.21-1.8,35.43-16.65,37.79-40.93,2.5-25.76,15.17-38.4,35.16-38.84Z"/>
                <path fill={color} d="m315.27,69.66c15.82,2.09,27.1,9.65,28.49,25.92,1.49,17.46-9.59,27.39-24.91,31.78-35.39,10.15-48.44,35.46-35.83,71.17,4.3,12.18,12.92,19.25,25.7,20.01,9.58.57,18.08,2.92,25.28,9.61,8.71,8.1,12.57,17.79,8.66,29.33-3.8,11.22-12.19,18.02-23.77,19.44-11.82,1.45-21.11-3.89-26.82-14.31-2.53-4.62-3.78-10.1-4.88-15.35-6.44-30.91-11.39-35.54-42.24-38.73-22.53-2.33-35.85-15.15-35.99-34.64-.15-20.49,13.82-34.73,37.22-35.34,23.89-.63,37.54-11.29,40.16-35.56,1.96-18.1,9.89-30.76,28.92-33.34Z"/>
                <path fill={color} d="m0,246.93c2.03-17.01,13.36-25.17,30.31-28.05,25.82-4.39,34.21-15.98,33.97-45.71-.24-29.84-8.12-40.03-34.88-44.91C12.57,125.18.2,117.06.4,98.14c.17-16.18,9.49-26.71,25.48-27.61,18.39-1.04,29.02,10.48,30.66,27.98,2.71,28.91,17.83,39.85,45.7,40.36,19.9.36,33.61,17.14,32.38,35.3-1.4,20.65-12.49,32.33-33.42,34.53-34.79,3.67-36.73,5.46-44.63,40.82-3.87,17.34-13.15,28.74-31.49,27.2-15.96-1.34-23.95-12.35-25.07-29.79Z"/>
                <path fill={color} d="m175.22,136.35c-21.57.7-36.87-12.44-38.89-36.85-2.23-27.02-13.33-40.92-40.98-43.03-16.37-1.25-26.33-12.68-24.86-30.58,1.24-15.12,9.77-24.94,24.97-25.59,17.05-.74,26.62,9.31,30.72,25.72,9.04,36.12,37.33,49.61,71.39,35.03,16.41-7.03,17.63-21.67,20.72-36.25C221.54,9.51,231.31.15,247.42,0c14.59-.14,22.45,9.06,25.82,22.28,3.91,15.31-2.86,29.54-16.61,31.1-36.6,4.14-51.52,22.87-52.85,59.25-.52,14.14-14.94,22.72-28.56,23.72Z"/>
            </g>
        </svg>
    )
}

/**
 * Icône sans contact NFC officielle
 */
const ContactlessIcon = ({ className = "w-4 h-4", color = "currentColor" }: { className?: string, color?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 8.5a7 7 0 0 1 0 7" />
        <path d="M10 6a11 11 0 0 1 0 12" />
        <path d="M14 3.5a15 15 0 0 1 0 17" />
    </svg>
)

/**
 * Signature de marque Ofika discrète et élégante
 */
const OfikaBrandBadge = ({ color = 'black' }: { color: 'black' | 'white' }) => {
    const isDark = color === 'black'
    return (
        <div className="flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity select-none">
            <OfikaEmblem color={isDark ? '#FFFFFF' : '#0F172A'} className="w-3.5 h-3.5" />
            <span className={`text-[9px] font-black tracking-[0.22em] uppercase ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                OFIKA
            </span>
        </div>
    )
}

/**
 * Logo Ofika officiel par défaut quand aucun logo entreprise personnalisé n'est fourni
 * Rendu vectoriel inline garanti à 100% (zéro dépendance externe / aucun risque d'échec de chargement)
 */
const DefaultOfikaLogo = ({ color = 'black', size = 'w-14 h-14' }: { color: 'black' | 'white'; size?: string }) => {
    const isDark = color === 'black'
    return (
        <div className={`flex items-center justify-center ${size}`}>
            <OfikaEmblem
                color={isDark ? '#FFFFFF' : '#0F172A'}
                className="w-full h-full object-contain filter drop-shadow-sm"
            />
        </div>
    )
}

export function CardVisual({ design, color, isFlipped, data }: CardVisualProps) {
    const [processedLogo, setProcessedLogo] = useState<string | null>(data.logoUrl || null)
    const [logoAspectRatio, setLogoAspectRatio] = useState<'square' | 'horizontal' | 'vertical'>('square')

    useEffect(() => {
        if (data.logoUrl) {
            setProcessedLogo(data.logoUrl)
            const img = new Image()
            img.onload = () => {
                const ratio = img.width / img.height
                if (ratio > 1.2) setLogoAspectRatio('horizontal')
                else if (ratio < 0.8) setLogoAspectRatio('vertical')
                else setLogoAspectRatio('square')
            }
            if (data.logoUrl.startsWith('http://') || data.logoUrl.startsWith('https://')) {
                img.crossOrigin = "Anonymous"
            }
            img.src = data.logoUrl
        } else {
            setProcessedLogo(null)
            setLogoAspectRatio('square')
        }
    }, [data.logoUrl])

    const textColor = color === 'black' ? 'text-white' : 'text-slate-900'
    const qrValue = data.qrValue || `https://ofika.ci/`

    if (!isFlipped) {
        // ====================================================================
        // RECTO (FACE AVANT DE LA CARTE)
        // ====================================================================
        return (
            <div
                className={`relative w-full h-full rounded-2xl p-4 sm:p-5 md:p-6 flex flex-col justify-between ${
                    color === 'black' 
                        ? 'bg-[#0b0c10] text-white shadow-2xl border border-white/10' 
                        : 'bg-white text-slate-900 shadow-xl border border-slate-200'
                } transition-all duration-300 select-none overflow-hidden`}
            >
                {/* Micro-texture de reflet luxueux */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-transparent pointer-events-none" />

                {/* HAUT DU RECTO : Indicateur NFC */}
                <div className="relative z-10 flex items-center justify-between w-full h-5">
                    <div className="flex items-center gap-1.5 opacity-70">
                        <ContactlessIcon
                            className="w-3.5 h-3.5"
                            color={color === 'black' ? '#FFFFFF' : '#0F172A'}
                        />
                        <span className={`text-[9px] font-bold tracking-widest uppercase ${textColor}`}>
                            NFC
                        </span>
                    </div>

                    {/* Logo d'angle si l'utilisateur a son propre logo entreprise au centre */}
                    {processedLogo && (
                        <OfikaBrandBadge color={color} />
                    )}
                </div>

                {/* CENTRE DU RECTO */}
                <div className="relative z-10 my-auto w-full">
                    {design === 'design1' ? (
                        /* Design 1 : Logo Entreprise/Ofika et QR Code côte à côte */
                        <div className="flex items-center justify-center space-x-3 sm:space-x-5 h-full">
                            {/* Bloc Logo & Nom Entreprise */}
                            <div className="flex flex-col items-center space-y-2 max-w-[48%]">
                                <div className={`flex items-center justify-center ${
                                    processedLogo
                                        ? logoAspectRatio === 'horizontal'
                                            ? 'w-24 h-14 sm:w-28 sm:h-16'
                                            : logoAspectRatio === 'vertical'
                                                ? 'w-14 h-24 sm:w-16 sm:h-28'
                                                : 'w-16 h-16 sm:w-20 sm:h-20'
                                        : 'w-16 h-16 sm:w-20 sm:h-20'
                                }`}>
                                    {processedLogo ? (
                                        <div className={`w-full h-full p-1 rounded-xl flex items-center justify-center overflow-hidden ${
                                            color === 'black'
                                                ? 'bg-white/10 backdrop-blur-xs border border-white/15 shadow-xs'
                                                : 'bg-black/5 border border-black/10 shadow-xs'
                                        }`}>
                                            <img
                                                src={processedLogo}
                                                alt="Logo Entreprise"
                                                className="max-w-full max-h-full w-auto h-auto object-contain drop-shadow-sm"
                                                onError={() => {
                                                    setProcessedLogo(null)
                                                }}
                                            />
                                        </div>
                                    ) : (
                                        <DefaultOfikaLogo color={color} size="w-14 h-14 sm:w-16 sm:h-16" />
                                    )}
                                </div>
                                <h3 className={`text-xs sm:text-sm font-bold ${textColor} font-inter text-center leading-tight truncate max-w-full`}>
                                    {data.company || 'OFIKA GLOBAL'}
                                </h3>
                            </div>

                            {/* Séparateur vertical fin */}
                            <div className={`h-20 sm:h-24 w-px ${color === 'black' ? 'bg-white/20' : 'bg-black/15'}`} />

                            {/* Bloc QR Code */}
                            <div className="flex flex-col items-center space-y-2">
                                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white p-1.5 rounded-xl shadow-md border border-slate-200/80 flex items-center justify-center">
                                    <QRCode
                                        value={qrValue}
                                        size={96}
                                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                        viewBox="0 0 256 256"
                                    />
                                </div>
                                <div className="flex items-center space-x-1">
                                    <QrCode className={`w-3 h-3 ${color === 'black' ? 'text-orange-400' : 'text-orange-500'}`} />
                                    <span className={`text-[10px] font-medium ${textColor}`}>Scannez-moi</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Design 2 : Logo centré avec nom d'entreprise */
                        <div className="flex flex-col items-center justify-center space-y-3">
                            <div className={`flex items-center justify-center ${
                                processedLogo
                                    ? logoAspectRatio === 'horizontal'
                                        ? 'w-28 h-16 sm:w-36 sm:h-20'
                                        : logoAspectRatio === 'vertical'
                                            ? 'w-16 h-28 sm:w-20 sm:h-36'
                                            : 'w-20 h-20 sm:w-24 sm:h-24'
                                    : 'w-20 h-20 sm:w-24 sm:h-24'
                            }`}>
                                {processedLogo ? (
                                    <div className={`w-full h-full p-1.5 rounded-2xl flex items-center justify-center overflow-hidden ${
                                        color === 'black'
                                            ? 'bg-white/10 backdrop-blur-xs border border-white/15 shadow-xs'
                                            : 'bg-black/5 border border-black/10 shadow-xs'
                                    }`}>
                                        <img
                                            src={processedLogo}
                                            alt="Logo Entreprise"
                                            className="max-w-full max-h-full w-auto h-auto object-contain drop-shadow-md"
                                            onError={() => {
                                                setProcessedLogo(null)
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <DefaultOfikaLogo color={color} size="w-20 h-20 sm:w-24 sm:h-24" />
                                )}
                            </div>
                            <h3 className={`text-base sm:text-xl font-bold ${textColor} font-inter text-center tracking-tight`}>
                                {data.company || 'OFIKA GLOBAL'}
                            </h3>
                        </div>
                    )}
                </div>

                {/* BAS DU RECTO : Signature Officielle Ofika */}
                <div className="relative z-10 flex items-center justify-between w-full h-5">
                    <span className={`text-[8px] font-mono tracking-widest uppercase opacity-60 ${textColor}`}>
                        CARTE NFC
                    </span>
                    <OfikaBrandBadge color={color} />
                </div>
            </div>
        )
    } else {
        // ====================================================================
        // VERSO (FACE ARRIÈRE DE LA CARTE)
        // ====================================================================
        return (
            <div
                className={`relative w-full h-full rounded-2xl p-4 sm:p-5 md:p-6 flex flex-col justify-between ${
                    color === 'black' 
                        ? 'bg-[#0b0c10] text-white shadow-2xl border border-white/10' 
                        : 'bg-white text-slate-900 shadow-xl border border-slate-200'
                } transition-all duration-300 select-none overflow-hidden`}
            >
                {/* Micro-texture de reflet luxueux */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-transparent pointer-events-none" />

                {/* HAUT DU VERSO : NFC (aucun logo sur le verso) */}
                <div className="relative z-10 flex items-center justify-between w-full h-5">
                    <div className="flex items-center gap-1.5 opacity-70">
                        <ContactlessIcon
                            className="w-3.5 h-3.5"
                            color={color === 'black' ? '#FFFFFF' : '#0F172A'}
                        />
                        <span className={`text-[9px] font-bold tracking-widest uppercase ${textColor}`}>
                            NFC
                        </span>
                    </div>
                </div>

                {/* CENTRE DU VERSO */}
                <div className="relative z-10 my-auto w-full">
                    {design === 'design2' ? (
                        /* Design 2 Verso : QR Code + Nom + Poste côte à côte (sans logo ni nom d'entreprise) */
                        <div className="flex items-center justify-center space-x-3 sm:space-x-5 h-full">
                            <div className="flex flex-col items-center space-y-2">
                                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white p-1.5 rounded-xl shadow-md border border-slate-200/80 flex items-center justify-center">
                                    <QRCode
                                        value={qrValue}
                                        size={96}
                                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                        viewBox="0 0 256 256"
                                    />
                                </div>
                                <div className="flex items-center space-x-1">
                                    <QrCode className={`w-3 h-3 ${color === 'black' ? 'text-orange-400' : 'text-orange-500'}`} />
                                    <span className={`text-[10px] font-medium ${textColor}`}>Scannez-moi</span>
                                </div>
                            </div>

                            <div className={`h-20 sm:h-24 w-px ${color === 'black' ? 'bg-white/20' : 'bg-black/15'}`} />

                            <div className="flex flex-col justify-center space-y-1.5 text-left max-w-[50%]">
                                <h2 className={`text-base sm:text-xl font-bold ${textColor} font-inter leading-tight tracking-tight`}>
                                    {data.fullName || 'Votre Nom'}
                                </h2>
                                <p className={`text-xs sm:text-sm font-medium ${color === 'black' ? 'text-neutral-400' : 'text-neutral-600'}`}>
                                    {data.jobTitle || 'Votre Poste'}
                                </p>
                            </div>
                        </div>
                    ) : (
                        /* Design 1 Verso : Nom + Fonction centré pur (aucun logo, aucun nom d'entreprise) */
                        <div className="flex flex-col items-center justify-center space-y-2 sm:space-y-2.5 text-center my-auto">
                            <h2 className={`text-2xl sm:text-3xl font-extrabold ${textColor} font-inter tracking-tight leading-tight`}>
                                {data.fullName || 'Votre Nom'}
                            </h2>
                            <p className={`text-sm sm:text-base ${color === 'black' ? 'text-neutral-400' : 'text-neutral-600'} font-medium`}>
                                {data.jobTitle || 'Votre Poste'}
                            </p>
                        </div>
                    )}
                </div>

                {/* BAS DU VERSO : Mention digitale épurée */}
                <div className="relative z-10 flex items-center justify-between w-full h-5">
                    <span className={`text-[8px] font-mono tracking-widest uppercase opacity-40 ${textColor}`}>
                        CARTE CONNECTÉE
                    </span>
                    <span className={`text-[8px] font-mono tracking-widest uppercase opacity-40 ${textColor}`}>
                        DIGITAL CARD
                    </span>
                </div>
            </div>
        )
    }
}
