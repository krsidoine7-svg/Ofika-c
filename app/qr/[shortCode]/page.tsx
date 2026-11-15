// =====================================================
// PAGE DE REDIRECTION QR CODE DYNAMIQUE & CARTE NFC
// Résolution ultra-rapide (<50ms) via HTTP 307 Server Redirect
// Tracking asynchrone non-bloquant via after() Next.js 15
// =====================================================

import { createAdminClient } from '@/lib/supabase/service-role'
import { trackQRScan } from '@/lib/services/qr-redirect'
import { headers } from 'next/headers'
import { after } from 'next/server'
import { redirect } from 'next/navigation'
import { getClientIp, validateTargetUrl } from '@/lib/utils/qr-validation'
import { getLocationFromHeaders } from '@/lib/utils/analytics-parser'
import Link from 'next/link'

interface QRRedirectPageProps {
  params: Promise<{
    shortCode: string
  }>
}

export default async function QRRedirectPage({ params }: QRRedirectPageProps) {
  const { shortCode } = await params
  const supabase = createAdminClient()

  let redirectTargetUrl: string | null = null

  try {
    // 1. Récupération ultra-rapide de la redirection
    console.log(`🔍 [QR/NFC] Résolution du code: "${shortCode}"`)

    const { data: qrRedirect, error } = await supabase
      .from('qr_redirects')
      .select('id, user_id, short_code, target_url, title, type, is_active, deleted_at')
      .ilike('short_code', shortCode) // Insensible à la casse (index optimisé)
      .eq('is_active', true)
      .is('deleted_at', null)
      .maybeSingle()

    if (error) {
      console.error('❌ [QR/NFC] Erreur Supabase:', error)
    }

    if (!qrRedirect) {
      console.warn(`⚠️ [QR/NFC] Aucun QR ou carte active pour "${shortCode}"`)
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
              ⚠️
            </div>
            <h1 className="text-xl font-bold text-slate-900 mb-2">QR Code introuvable</h1>
            <p className="text-xs text-slate-500 mb-6">
              Le code &quot;<strong className="text-slate-800">{shortCode}</strong>&quot; n&apos;existe pas ou a été désactivé.
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
            >
              Retour à l&apos;accueil
            </Link>
          </div>
        </div>
      )
    }

    // 2. Préparation du tracking analytics en arrière-plan
    const headersList = await headers()
    const userAgent = headersList.get('user-agent') || ''
    const referrer = headersList.get('referer') || ''
    const ipAddress = getClientIp(headersList)

    const cookieHeader = headersList.get('cookie') || ''
    const debounceKey = `qr_scan_${shortCode}`
    const alreadyScanned = cookieHeader.includes(`${debounceKey}=1`)

    const url = new URL(`http://localhost${headersList.get('x-invoke-path') || ''}`)
    const forceTrack = url.searchParams.get('force') === '1'
    const location = getLocationFromHeaders(headersList)

    // Exécution du tracking en tâche de fond après envoi de la redirection (0 milliseconde de blocage)
    if (!alreadyScanned || forceTrack) {
      after(async () => {
        try {
          await trackQRScan(
            shortCode,
            {
              userAgent,
              referrer,
              ipAddress,
              country: location.country,
              city: location.city
            },
            {
              id: qrRedirect.id,
              user_id: qrRedirect.user_id,
              target_url: qrRedirect.target_url
            }
          )
        } catch (err) {
          console.error('❌ Erreur tracking scan en arrière-plan:', err)
        }
      })
    }

    let targetUrl = qrRedirect.target_url

    if (!targetUrl) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
            <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
              🔗
            </div>
            <h1 className="text-xl font-bold text-slate-900 mb-2">Lien non configuré</h1>
            <p className="text-xs text-slate-500 mb-6">
              Ce QR Code n&apos;a pas encore de lien de destination configuré.
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
            >
              Retour à l&apos;accueil
            </Link>
          </div>
        </div>
      )
    }

    // Validation préalable du lien brut
    const preValidation = validateTargetUrl(targetUrl)
    if (!preValidation.valid) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
              🛡️
            </div>
            <h1 className="text-xl font-bold text-slate-900 mb-2">Lien non autorisé</h1>
            <p className="text-xs text-slate-500 mb-6">
              Le lien de destination n&apos;est pas autorisé pour des raisons de sécurité.
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
            >
              Retour à l&apos;accueil
            </Link>
          </div>
        </div>
      )
    }

    // Cas du Texte Brut encodé via text:
    if (targetUrl.startsWith('text:')) {
      const plainText = targetUrl.replace(/^text:/, '')
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-slate-100 text-center">
            <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">
              📝
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              {qrRedirect.title || 'Contenu du QR Code'}
            </h2>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 my-6 text-left whitespace-pre-wrap text-xs font-mono text-slate-700 leading-relaxed max-h-80 overflow-y-auto">
              {plainText}
            </div>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
            >
              Propulsé par Ofika
            </Link>
          </div>
        </div>
      )
    }

    // Traitement et normalisation de l'URL cible
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://ofika.ci').replace(/\/$/, '')

    if (
      !targetUrl.startsWith('http://') &&
      !targetUrl.startsWith('https://') &&
      !targetUrl.startsWith('tel:') &&
      !targetUrl.startsWith('mailto:') &&
      !targetUrl.startsWith('data:')
    ) {
      const cleanPath = targetUrl.startsWith('/') ? targetUrl : `/${targetUrl}`
      targetUrl = `${appUrl}${cleanPath}`
    }

    if (targetUrl.startsWith('http://') || targetUrl.startsWith('https://')) {
      try {
        const urlObj = new URL(targetUrl)
        if (!urlObj.searchParams.has('source') && !urlObj.searchParams.has('src')) {
          urlObj.searchParams.set('source', 'qr')
        }
        targetUrl = urlObj.toString()
      } catch (e) {
        console.error('Error adding tracking param:', e)
      }
    }

    const finalValidation = validateTargetUrl(targetUrl)
    if (!finalValidation.valid) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
              🛑
            </div>
            <h1 className="text-xl font-bold text-slate-900 mb-2">Redirection non autorisée</h1>
            <p className="text-xs text-slate-500 mb-6">
              Le lien de destination n&apos;est pas autorisé pour des raisons de sécurité.
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
            >
              Retour à l&apos;accueil
            </Link>
          </div>
        </div>
      )
    }

    // Cas spécifique des schémas d'action mobile (téléphone, email)
    if (targetUrl.startsWith('tel:') || targetUrl.startsWith('mailto:')) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
          <meta httpEquiv="refresh" content={`0;url=${targetUrl}`} />
          <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
            <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
              {targetUrl.startsWith('tel:') ? '📞' : '✉️'}
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              {targetUrl.startsWith('tel:') ? 'Appel téléphonique' : 'Envoyer un email'}
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Cliquez sur le bouton ci-dessous pour lancer l&apos;action sur votre téléphone.
            </p>
            <a
              href={targetUrl}
              className="inline-block px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
            >
              Ouvrir l&apos;application
            </a>
          </div>
        </div>
      )
    }

    console.log('⚡ [QR/NFC] Redirection HTTP 307 instantanée vers:', targetUrl)
    redirectTargetUrl = targetUrl
  } catch (error) {
    console.error('Error in QR redirect:', error)
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
          <h1 className="text-xl font-bold text-slate-900 mb-2">Erreur</h1>
          <p className="text-xs text-slate-500 mb-6">
            Une erreur s&apos;est produite lors de la redirection.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    )
  }

  // 3. Redirection HTTP 307 native Next.js hors try/catch (évite l'interception de NEXT_REDIRECT)
  if (redirectTargetUrl) {
    redirect(redirectTargetUrl)
  }
}

export async function generateMetadata({ params }: QRRedirectPageProps) {
  const { shortCode } = await params
  const supabase = createAdminClient()

  const { data: qrRedirect } = await supabase
    .from('qr_redirects')
    .select('title, description')
    .ilike('short_code', shortCode)
    .eq('is_active', true)
    .is('deleted_at', null)
    .maybeSingle()

  return {
    title: qrRedirect?.title || 'Redirection',
    description: qrRedirect?.description || 'Redirection en cours...',
    robots: 'noindex, nofollow'
  }
}
