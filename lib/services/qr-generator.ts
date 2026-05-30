// =====================================================
// SERVICE DE GÉNÉRATION QR CODE AVEC PERSONNALISATION
// Utilise qr-code-styling pour génération locale
// =====================================================

import QRCodeStyling from 'qr-code-styling'
import type { Options as QRCodeOptions } from 'qr-code-styling'

/**
 * Options de personnalisation du QR Code
 */
export interface QRCustomizationOptions {
  // Données
  data: string
  
  // Dimensions
  width?: number
  height?: number
  
  // Style des points
  dotsType?: 'rounded' | 'dots' | 'classy' | 'classy-rounded' | 'square' | 'extra-rounded'
  dotsColor?: string
  dotsGradient?: {
    type: 'linear' | 'radial'
    colorStops: Array<{ offset: number; color: string }>
  }
  
  // Style du coin (carrés de positionnement)
  cornersSquareType?: 'dot' | 'square' | 'extra-rounded'
  cornersSquareColor?: string
  cornersDotType?: 'dot' | 'square'
  cornersDotColor?: string
  
  // Fond
  backgroundColor?: string
  backgroundGradient?: {
    type: 'linear' | 'radial'
    colorStops: Array<{ offset: number; color: string }>
  }
  
  // Logo au centre
  logo?: string // URL ou data URL
  logoWidth?: number
  logoHeight?: number
  logoMargin?: number
  logoCornerRadius?: number
  
  // Correction d'erreur
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H' // L=7%, M=15%, Q=25%, H=30%
  
  // Forme de l'image
  imageShape?: 'square' | 'circle'
  
  // Marge autour du QR
  margin?: number
}

/**
 * Présets de styles prédéfinis
 */
export const QR_PRESETS = {
  classic: {
    dotsType: 'square' as const,
    dotsColor: '#000000',
    cornersSquareType: 'square' as const,
    backgroundColor: '#FFFFFF'
  },
  modern: {
    dotsType: 'rounded' as const,
    dotsColor: '#f97316',
    cornersSquareType: 'extra-rounded' as const,
    cornersSquareColor: '#f97316',
    backgroundColor: '#FFFFFF'
  },
  elegant: {
    dotsType: 'classy-rounded' as const,
    dotsColor: '#1f2937',
    cornersSquareType: 'dot' as const,
    cornersSquareColor: '#6366f1',
    backgroundColor: '#f9fafb'
  },
  gradient: {
    dotsType: 'rounded' as const,
    dotsGradient: {
      type: 'linear' as const,
      colorStops: [
        { offset: 0, color: '#f97316' },
        { offset: 1, color: '#ec4899' }
      ] as Array<{ offset: number; color: string }>
    },
    cornersSquareType: 'extra-rounded' as const,
    backgroundColor: '#FFFFFF'
  },
  minimal: {
    dotsType: 'dots' as const,
    dotsColor: '#374151',
    cornersSquareType: 'square' as const,
    cornersSquareColor: '#374151',
    backgroundColor: 'transparent'
  }
}

/**
 * Génère un QR code personnalisé
 * UTILISE LA LIBRAIRIE LOCALE qr-code-styling
 */
export class QRCodeGenerator {
  private qrCode: QRCodeStyling | null = null
  
  constructor(private options: QRCustomizationOptions) {
    this.initialize()
  }
  
  /**
   * Initialise le générateur QR
   */
  private initialize() {
    const qrOptions: QRCodeOptions = {
      width: this.options.width || 500,
      height: this.options.height || 500,
      data: this.options.data,
      margin: this.options.margin ?? 10,
      
      // Style des points (dots)
      dotsOptions: {
        type: this.options.dotsType || 'rounded',
        color: this.options.dotsColor || '#000000',
        gradient: this.options.dotsGradient
      },
      
      // Style des carrés de coin
      cornersSquareOptions: {
        type: this.options.cornersSquareType || 'square',
        color: this.options.cornersSquareColor || this.options.dotsColor || '#000000'
      },
      
      // Style des points de coin
      cornersDotOptions: {
        type: this.options.cornersDotType || 'dot',
        color: this.options.cornersDotColor || this.options.dotsColor || '#000000'
      },
      
      // Fond
      backgroundOptions: {
        color: this.options.backgroundColor || '#FFFFFF',
        gradient: this.options.backgroundGradient
      },
      
      // Correction d'erreur (important si logo)
      qrOptions: {
        errorCorrectionLevel: this.options.errorCorrectionLevel || 'M'
      }
    }
    
    // Ajouter le logo si fourni
    if (this.options.logo) {
      qrOptions.image = this.options.logo as string
      qrOptions.imageOptions = {
        hideBackgroundDots: true,
        imageSize: 0.4,
        margin: this.options.logoMargin ?? 10,
        crossOrigin: 'anonymous'
      }
    }
    
    this.qrCode = new QRCodeStyling(qrOptions)
  }
  
  /**
   * Génère le QR code en Data URL (base64)
   * Format PNG par défaut
   */
  async toDataURL(type: 'png' | 'jpeg' | 'webp' = 'png'): Promise<string> {
    if (!this.qrCode) throw new Error('QR Code non initialisé')
    
    return new Promise((resolve, reject) => {
      this.qrCode!.getRawData(type).then((blobData) => {
        if (!blobData) {
          reject(new Error('Impossible de générer le QR code'))
          return
        }
        
        // Convertir en Blob si nécessaire
        const blob = blobData instanceof Blob ? blobData : new Blob([blobData as any])
        
        const reader = new FileReader()
        reader.onloadend = () => {
          resolve(reader.result as string)
        }
        reader.onerror = reject
        reader.readAsDataURL(blob)
      }).catch(reject)
    })
  }
  
  /**
   * Génère le QR code en SVG
   */
  async toSVG(): Promise<string> {
    if (!this.qrCode) throw new Error('QR Code non initialisé')
    
    return new Promise((resolve, reject) => {
      this.qrCode!.getRawData('svg').then((blobData) => {
        if (!blobData) {
          reject(new Error('Impossible de générer le QR code'))
          return
        }
        
        // Convertir en Blob si nécessaire
        const blob = blobData instanceof Blob ? blobData : new Blob([blobData as any], { type: 'image/svg+xml' })
        
        const reader = new FileReader()
        reader.onloadend = () => {
          resolve(reader.result as string)
        }
        reader.onerror = reject
        reader.readAsText(blob)
      }).catch(reject)
    })
  }
  
  /**
   * Génère un Blob pour téléchargement
   */
  async toBlob(type: 'png' | 'jpeg' | 'webp' = 'png'): Promise<Blob> {
    if (!this.qrCode) throw new Error('QR Code non initialisé')
    
    const blobData = await this.qrCode.getRawData(type)
    if (!blobData) throw new Error('Impossible de générer le QR code')
    
    // Convertir en Blob si nécessaire
    return blobData instanceof Blob ? blobData : new Blob([blobData as any])
  }
  
  /**
   * Télécharge directement le QR code
   */
  async download(filename: string, extension: 'png' | 'jpeg' | 'svg' = 'png') {
    if (!this.qrCode) throw new Error('QR Code non initialisé')
    
    await this.qrCode.download({
      name: filename,
      extension
    })
  }
  
  /**
   * Met à jour les données du QR code
   */
  updateData(newData: string) {
    if (this.qrCode) {
      this.qrCode.update({ data: newData })
    }
  }
  
  /**
   * Met à jour les options de style
   */
  updateOptions(newOptions: Partial<QRCustomizationOptions>) {
    this.options = { ...this.options, ...newOptions }
    this.initialize()
  }
}

/**
 * Helper pour créer rapidement un QR code avec preset
 */
export function createQRWithPreset(
  data: string,
  preset: keyof typeof QR_PRESETS,
  logo?: string
): QRCodeGenerator {
  const presetOptions = QR_PRESETS[preset]
  
  return new QRCodeGenerator({
    data,
    ...presetOptions,
    logo,
    width: 500,
    height: 500,
    errorCorrectionLevel: logo ? 'H' : 'M' // Plus de correction si logo
  })
}

/**
 * Génère un simple QR code data URL (pour usage rapide)
 */
export async function generateSimpleQR(
  data: string,
  size: number = 300,
  color: string = '#000000'
): Promise<string> {
  const generator = new QRCodeGenerator({
    data,
    width: size,
    height: size,
    dotsColor: color,
    backgroundColor: '#FFFFFF'
  })
  
  return generator.toDataURL('png')
}

/**
 * Valide une URL de logo
 */
export function validateLogoURL(url: string): { valid: boolean; error?: string } {
  if (!url) return { valid: true } // Pas de logo = OK
  
  // Vérifier que c'est une URL valide ou data URL
  if (!url.startsWith('http') && !url.startsWith('data:image/')) {
    return { valid: false, error: 'Le logo doit être une URL HTTP(S) ou une data URL' }
  }
  
  // Vérifier la taille max pour data URL (2MB)
  if (url.startsWith('data:image/') && url.length > 2 * 1024 * 1024) {
    return { valid: false, error: 'Le logo est trop volumineux (max 2MB)' }
  }
  
  return { valid: true }
}
