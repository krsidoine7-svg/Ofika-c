import { QrCode, Upload } from "lucide-react"
import QRCode from 'react-qr-code'
import { useEffect, useState } from 'react'

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

// Logo par défaut Ofika - utilise le fichier SVG avec filtre de couleur
const DefaultLogo = ({ color = '#000000', size = 'w-12 h-12' }: { color?: string, size?: string }) => {
    return (
        <svg viewBox="0 0 100 100" className={size} fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="45" stroke={color} strokeWidth="2"/>
            <path d="M30 50L45 65L70 35" stroke={color} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
            <text x="50" y="85" textAnchor="middle" fill={color} fontSize="10" fontWeight="bold">OFIKA</text>
        </svg>
    )
}

export function CardVisual({ design, color, isFlipped, data }: CardVisualProps) {
    const [processedLogo, setProcessedLogo] = useState<string | null>(null)
    const [logoAspectRatio, setLogoAspectRatio] = useState<'square' | 'horizontal' | 'vertical'>('square')

    const convertLogoToMonochrome = (logoData: string, backgroundColor: 'black' | 'white') => {
        return new Promise<string>((resolve) => {
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')
            const img = new Image()

            img.onload = () => {
                canvas.width = img.width
                canvas.height = img.height

                if (ctx) {
                    ctx.drawImage(img, 0, 0)
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
                    const data = imageData.data

                    for (let i = 0; i < data.length; i += 4) {
                        const r = data[i]
                        const g = data[i + 1]
                        const b = data[i + 2]
                        const alpha = data[i + 3]
                        const luminance = 0.299 * r + 0.587 * g + 0.114 * b
                        const isBackground = luminance > 240 && alpha > 200

                        if (isBackground) {
                            data[i + 3] = 0
                        } else {
                            if (backgroundColor === 'black') {
                                data[i] = 255; data[i + 1] = 255; data[i + 2] = 255
                            } else {
                                data[i] = 0; data[i + 1] = 0; data[i + 2] = 0
                            }
                            data[i + 3] = alpha
                        }
                    }
                    ctx.putImageData(imageData, 0, 0)
                    resolve(canvas.toDataURL('image/png'))
                }
            }
            img.crossOrigin = "Anonymous" // Needed if images are from external value
            img.src = logoData
        })
    }

    useEffect(() => {
        if (data.logoUrl) {
            const img = new Image()
            img.onload = () => {
                const ratio = img.width / img.height
                if (ratio > 1.2) setLogoAspectRatio('horizontal')
                else if (ratio < 0.8) setLogoAspectRatio('vertical')
                else setLogoAspectRatio('square')
            }
            img.crossOrigin = "Anonymous"
            img.src = data.logoUrl

            // Désactivation temporaire du monochrome qui casse certaines images
            // convertLogoToMonochrome(data.logoUrl, color)
            //    .then(setProcessedLogo)
            //    .catch(err => {
            //        console.error("Logo processing failed, using original", err)
            setProcessedLogo(data.logoUrl)
            //    })
        } else {
            setProcessedLogo(null)
            setLogoAspectRatio('square')
        }
    }, [data.logoUrl, color])

    const textColor = color === 'black' ? 'text-white' : 'text-black'
    const qrValue = data.qrValue || `https://ofika.ci/`

    if (!isFlipped) {
        // RECTO
        return (
            <div
                className={`relative w-full h-full rounded-xl p-4 sm:p-5 md:p-6 ${design === 'design2' ? 'flex flex-col justify-center items-center' : 'flex flex-col justify-center'} ${color === 'black' ? 'bg-black' : 'bg-white'
                    } border-2 border-gray-200 transition-all duration-300 shadow-xl`}
            >
                {design === 'design1' ? (
                    /* Design 1 - Logo et QR côte à côte */
                    <div className="flex items-center justify-center space-x-2 sm:space-x-3 h-full">
                        <div className="flex flex-col items-center space-y-2">
                            <div className={`flex items-center justify-center overflow-hidden ${processedLogo
                                ? logoAspectRatio === 'horizontal'
                                    ? 'w-24 h-14 sm:w-28 sm:h-16'
                                    : logoAspectRatio === 'vertical'
                                        ? 'w-14 h-24 sm:w-16 sm:h-28'
                                        : 'w-16 h-16 sm:w-20 sm:h-20'
                                : 'w-16 h-16 sm:w-20 sm:h-20'
                                }`}>
                                {processedLogo ? (
                                    <img
                                        src={processedLogo}
                                        alt="Company Logo"
                                        className="w-full h-full object-contain"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                            setProcessedLogo(null);
                                        }}
                                    />
                                ) : (
                                    <DefaultLogo color={color === 'black' ? '#FFFFFF' : '#000000'} />
                                )}
                            </div>
                            <h3 className={`text-xs sm:text-sm font-bold ${textColor} font-inter text-center`}>
                                {data.company || 'Votre Entreprise'}
                            </h3>
                        </div>
                        <div className={`h-20 sm:h-24 w-px ${color === 'black' ? 'bg-white/20' : 'bg-black/20'}`}></div>
                        <div className="flex flex-col items-center space-y-2">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white p-1 rounded">
                                <QRCode value={qrValue} size={96} style={{ height: "auto", maxWidth: "100%", width: "100%" }} />
                            </div>
                            <div className="flex items-center space-x-1">
                                <QrCode className={`w-3 h-3 ${textColor}`} />
                                <span className={`text-[10px] ${textColor}`}>Scannez-moi</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Design 2 - Logo + Entreprise uniquement */
                    <div className="flex flex-col items-center space-y-4">
                        <div className={`flex items-center justify-center overflow-hidden ${processedLogo
                            ? logoAspectRatio === 'horizontal'
                                ? 'w-28 h-16 sm:w-32 sm:h-20'
                                : logoAspectRatio === 'vertical'
                                    ? 'w-16 h-28 sm:w-20 sm:h-32'
                                    : 'w-16 h-16 sm:w-20 sm:h-20'
                            : 'w-16 h-16 sm:w-20 sm:h-20'
                            }`}>
                            {processedLogo ? (
                                <img
                                    src={processedLogo}
                                    alt="Company Logo"
                                    className="w-full h-full object-cover"
                                    style={{
                                        filter: color === 'black' ? 'brightness(0) invert(1)' : 'brightness(0)'
                                    }}
                                />
                            ) : (
                                <DefaultLogo color={color === 'black' ? '#FFFFFF' : '#000000'} />
                            )}
                        </div>
                        <h3 className={`text-lg sm:text-xl font-bold ${textColor} font-inter text-center`}>
                            {data.company || 'Votre Entreprise'}
                        </h3>
                    </div>
                )}
                {/* Point décoratif */}
                <div className="absolute bottom-4 right-4">
                    <div className={`w-2 h-2 rounded-full ${textColor} bg-current`}></div>
                </div>
            </div>
        )
    } else {
        // VERSO
        return (
            <div
                className={`relative w-full h-full rounded-xl p-4 sm:p-5 md:p-6 ${design === 'design2' ? 'flex flex-col justify-center' : 'flex flex-col justify-center items-center text-center'
                    } ${color === 'black' ? 'bg-black' : 'bg-white'} border-2 border-gray-200 transition-all duration-300 shadow-xl`}
            >
                {design === 'design2' ? (
                    /* Design 2 Verso - QR Code + Nom + Poste côte à côte */
                    <div className="flex items-center justify-center space-x-2 sm:space-x-3 h-full">
                        <div className="flex flex-col items-center space-y-2">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white p-1 rounded">
                                <QRCode value={qrValue} size={96} style={{ height: "auto", maxWidth: "100%", width: "100%" }} />
                            </div>
                            <div className="flex items-center space-x-1">
                                <QrCode className={`w-3 h-3 ${textColor}`} />
                                <span className={`text-[10px] ${textColor}`}>Scannez-moi</span>
                            </div>
                        </div>
                        <div className={`h-20 sm:h-24 w-px ${color === 'black' ? 'bg-white/20' : 'bg-black/20'}`}></div>
                        <div className="flex flex-col justify-center space-y-2 text-left">
                            <h2 className={`text-base sm:text-lg font-bold ${textColor} font-inter`}>
                                {data.fullName || 'Votre Nom'}
                            </h2>
                            <p className={`text-sm sm:text-base ${textColor} font-medium`}>
                                {data.jobTitle || 'Votre Poste'}
                            </p>
                        </div>
                    </div>
                ) : (
                    /* Design 1 Verso - Nom + Poste centré */
                    <div className="space-y-2 sm:space-y-3">
                        <h2 className={`text-xl sm:text-2xl font-bold ${textColor} font-inter`}>
                            {data.fullName || 'Votre Nom'}
                        </h2>
                        <p className={`text-base sm:text-lg ${textColor} font-medium`}>
                            {data.jobTitle || 'Votre Poste'}
                        </p>
                    </div>
                )}
                <div className="absolute bottom-4 right-4">
                    <div className={`w-2 h-2 rounded-full ${textColor} bg-current`}></div>
                </div>
            </div>
        )
    }
}
