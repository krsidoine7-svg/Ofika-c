// =====================================================
// API ROUTE POUR TÉLÉCHARGER LES QR CODES
// Proxy sécurisé contre SSRF avec validation stricte
// =====================================================

import { NextRequest, NextResponse } from 'next/server'

// Forcer le rendu dynamique pour cette route API
export const dynamic = 'force-dynamic'
import { validateProxyUrl } from '@/lib/utils/qr-validation'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const url = searchParams.get('url')

    if (!url) {
      return NextResponse.json(
        { error: 'URL manquante' },
        { status: 400 }
      )
    }

    // PROTECTION SSRF: Valider strictement l'URL
    const validation = validateProxyUrl(url)
    if (!validation.valid) {
      console.warn('SSRF attempt blocked:', { url, error: validation.error })
      return NextResponse.json(
        { error: validation.error || 'URL non autorisée' },
        { status: 403 }
      )
    }

    // Télécharger l'image depuis l'API QR avec timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s timeout

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; QR-Code-Downloader/1.0)'
        }
      })
      
      clearTimeout(timeoutId)

      if (!response.ok) {
        return NextResponse.json(
          { error: 'Erreur lors du téléchargement' },
          { status: response.status }
        )
      }

      // Vérifier le Content-Type
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.startsWith('image/')) {
        return NextResponse.json(
          { error: 'Type de fichier invalide (image attendue)' },
          { status: 400 }
        )
      }

      const blob = await response.blob()
      
      // Vérifier la taille (max 5MB pour une image QR)
      if (blob.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: 'Image trop volumineuse' },
          { status: 413 }
        )
      }

      const arrayBuffer = await blob.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      // Retourner l'image avec les bons headers
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'image/png',
          'Content-Disposition': 'attachment; filename="qr-code.png"',
          'Cache-Control': 'public, max-age=31536000, immutable',
          'X-Content-Type-Options': 'nosniff'
        }
      })
    } catch (fetchError: any) {
      if (fetchError.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Timeout lors du téléchargement' },
          { status: 504 }
        )
      }
      throw fetchError
    }
  } catch (error) {
    console.error('Error downloading QR code:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
