// =====================================================
// PAGE DE REDIRECTION QR CODE DYNAMIQUE
// =====================================================

import { createClient } from '@/lib/supabase/server'
import { trackQRScan } from '@/lib/services/qr-redirect'
import { headers } from 'next/headers'
import { getClientIp, validateTargetUrl } from '@/lib/utils/qr-validation'

interface QRRedirectPageProps {
  params: Promise<{
    shortCode: string
  }>
}

export default async function QRRedirectPage({ params }: QRRedirectPageProps) {
  const { shortCode } = await params
  const supabase = await createClient()

  try {
    // Récupérer la redirection
    console.log(`🔍 [QR] Recherche du code: "${shortCode}"`)
    
    const { data: qrRedirect, error } = await supabase
      .from('qr_redirects')
      .select('*')
      .ilike('short_code', shortCode) // Insensible à la casse
      .eq('is_active', true)
      .is('deleted_at', null)
      .maybeSingle() 

    if (error) {
      console.error('❌ [QR] Erreur Supabase:', error)
    }

    if (!qrRedirect) {
      console.warn(`⚠️ [QR] Aucune redirection active trouvée pour "${shortCode}"`)
      // Debug: vérifier si le code existe mais est inactif
      const { data: inactive } = await supabase
        .from('qr_redirects')
        .select('is_active')
        .ilike('short_code', shortCode)
        .maybeSingle()
      
      if (inactive) {
        console.warn(`💡 [QR] Le code existe mais is_active est:`, inactive.is_active)
      } else {
        console.warn(`💡 [QR] Le code n'existe pas du tout dans la table qr_redirects`)
      }
      
      // Redirection non trouvée - retourner une page HTML au lieu de redirect()
      return (
        <html lang="fr">
          <head>
            <meta charSet="utf-8" />
            <title>QR Code introuvable</title>
          </head>
          <body style={{
            fontFamily: 'system-ui',
            padding: '20px',
            textAlign: 'center'
          }}>
            <h1>QR Code introuvable</h1>
            <p>Le code "<strong>{shortCode}</strong>" n'existe pas ou a été désactivé.</p>
            <script dangerouslySetInnerHTML={{
              __html: `setTimeout(() => window.location.href = '/', 3000);`
            }} />
          </body>
        </html>
      )
    }

    // Tracker le scan (en arrière-plan, ne pas attendre)
    // AVEC PROTECTION CONTRE DOUBLE INCRÉMENTATION
    const headersList = await headers()
    const userAgent = headersList.get('user-agent') || ''
    const referrer = headersList.get('referer') || ''
    const ipAddress = getClientIp(headersList)

    // Vérifier cookie de debounce (éviter double scan)
    const cookieHeader = headersList.get('cookie') || ''
    const debounceKey = `qr_scan_${shortCode}`
    const alreadyScanned = cookieHeader.includes(`${debounceKey}=1`)

    // Mode debug: permettre de bypasser le debounce avec ?force=1
    const url = new URL(`http://localhost${headersList.get('x-invoke-path') || ''}`)
    const forceTrack = url.searchParams.get('force') === '1'

    // Enregistrer le scan seulement si pas déjà scanné récemment (ou mode force)
    if (!alreadyScanned || forceTrack) {
      trackQRScan(shortCode, {
        userAgent,
        referrer,
        ipAddress
      }).catch(err => console.error('Error tracking scan:', err))
    } else {
      console.log('⏭️ Scan ignoré (debounce actif)')
    }

    let targetUrl = qrRedirect.nfc_link

    // SMART REDIRECT: Si c'est juste un slug (ex: "errison"), on construit l'URL complète dynamiquement
    // ET on force le paramètre source=qr pour les trackers clients
    if (targetUrl && !targetUrl.startsWith('http')) {
      const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || '').replace(/\/$/, '')
      const cleanSlug = targetUrl.replace(/^\//, '')
      targetUrl = `${baseUrl}/${cleanSlug}`
    } else if (targetUrl) {
      // Nettoyage des doubles slashes accidentels dans les URLs complètes
      targetUrl = targetUrl.replace(/([^:]\/)\/+/g, "$1")
    }

    // Ajouter le paramètre de tracking si absent
    if (targetUrl) {
      const urlObj = new URL(targetUrl.includes('://') ? targetUrl : `https://${targetUrl}`)
      if (!urlObj.searchParams.has('source') && !urlObj.searchParams.has('src')) {
        urlObj.searchParams.set('source', 'qr')
        targetUrl = urlObj.toString().replace('https://', '').includes('://') ? urlObj.toString() : urlObj.toString().split('//')[1]
        // Fix for local absolute URLs
        if (targetUrl.startsWith('localhost')) targetUrl = 'http://' + targetUrl
        else if (!targetUrl.startsWith('http')) targetUrl = 'https://' + targetUrl
      }
    }

    // VALIDATION DE SÉCURITÉ - Empêcher XSS et protocoles dangereux
    const validation = validateTargetUrl(targetUrl)
    if (!validation.valid) {
      console.warn(`🛑 Tentative de redirection vers une URL non autorisée: ${targetUrl}`)
      return (
        <html lang="fr">
          <head>
            <meta charSet="utf-8" />
            <title>Lien non autorisé</title>
          </head>
          <body style={{
            fontFamily: 'system-ui',
            padding: '20px',
            textAlign: 'center'
          }}>
            <h1>Lien non autorisé</h1>
            <p>Le lien de destination n'est pas autorisé pour des raisons de sécurité.</p>
            <a href="/">Retour à l'accueil</a>
          </body>
        </html>
      )
    }

    console.log('🔍 QR Redirect:', { shortCode, targetUrl })

    // TOUJOURS utiliser une page HTML avec redirection client-side
    // C'est plus fiable que redirect() de Next.js pour les redirections externes
    return (
      <html lang="fr">
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Redirection...</title>
          <meta name="robots" content="noindex, nofollow" />
        </head>
        <body style={{
          fontFamily: 'system-ui, -apple-system, sans-serif',
          padding: '20px',
          textAlign: 'center',
          backgroundColor: '#f9fafb',
          margin: 0
        }}>
          <div style={{
            maxWidth: '500px',
            margin: '50px auto',
            padding: '30px',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              margin: '0 auto 20px',
              backgroundColor: '#f97316',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '30px'
            }}>
              📱
            </div>
            <h2 style={{ color: '#1f2937', marginBottom: '10px' }}>Redirection en cours...</h2>
            <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '20px' }}>
              Si la redirection ne fonctionne pas automatiquement, cliquez sur le bouton ci-dessous
            </p>
            <a
              href={targetUrl}
              style={{
                display: 'inline-block',
                padding: '12px 30px',
                background: '#f97316',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px',
                fontWeight: '500',
                fontSize: '16px'
              }}
            >
              Ouvrir
            </a>
            <p style={{
              marginTop: '20px',
              fontSize: '12px',
              color: '#9ca3af',
              wordBreak: 'break-all',
              padding: '0 20px'
            }}>
              Destination: {targetUrl}
            </p>
          </div>
          <script dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  // Marquer ce scan avec un cookie (durée: 30 secondes)
                  var debounceKey = ${JSON.stringify(debounceKey)};
                  document.cookie = debounceKey + '=1; path=/; max-age=30; SameSite=Lax';
                  
                  console.log('🚀 Redirection vers:', ${JSON.stringify(targetUrl)});
                  // Tentative de redirection immédiate
                  window.location.replace(${JSON.stringify(targetUrl)});
                } catch (e) {
                  console.error('❌ Erreur de redirection:', e);
                  // Si erreur, essayer avec href
                  try {
                    window.location.href = ${JSON.stringify(targetUrl)};
                  } catch (e2) {
                    console.error('❌ Erreur de redirection (fallback):', e2);
                  }
                }
              })();
            `
          }} />
        </body>
      </html>
    )
  } catch (error) {
    console.error('Error in QR redirect:', error)
    return (
      <html lang="fr">
        <head>
          <meta charSet="utf-8" />
          <title>Erreur</title>
        </head>
        <body style={{
          fontFamily: 'system-ui',
          padding: '20px',
          textAlign: 'center'
        }}>
          <h1>Erreur</h1>
          <p>Une erreur s'est produite lors de la redirection.</p>
          <script dangerouslySetInnerHTML={{
            __html: `setTimeout(() => window.location.href = '/', 3000);`
          }} />
        </body>
      </html>
    )
  }
}

// Metadata pour SEO
export async function generateMetadata({ params }: QRRedirectPageProps) {
  const { shortCode } = await params
  const supabase = await createClient()

  const { data: qrRedirect } = await supabase
    .from('qr_redirects')
    .select('title, description')
    .eq('short_code', shortCode)
    .eq('is_active', true)
    .single()

  return {
    title: qrRedirect?.title || 'Redirection',
    description: qrRedirect?.description || 'Redirection en cours...',
    robots: 'noindex, nofollow'
  }
}
