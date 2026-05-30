// Supabase Edge Function pour envoyer des notifications push
// Déployer avec: npx supabase functions deploy send-push-notifications

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PushPayload {
  title: string
  body: string
  data?: Record<string, any>
  userId?: string
  tag?: string
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')!
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY')!

    const supabase = createClient(supabaseUrl, supabaseKey)

    const payload: PushPayload = await req.json()
    const { title, body, data, userId, tag } = payload

    // Récupérer les subscriptions
    let query = supabase.from('push_subscriptions').select('*')
    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data: subscriptions, error } = await query

    if (error) throw error

    const results = []

    // Envoyer notification à chaque subscription
    for (const sub of subscriptions || []) {
      try {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth
          }
        }

        const notificationPayload = JSON.stringify({
          title,
          body,
          data: data || {},
          tag: tag || 'ofika-notification'
        })

        // Utiliser web-push (à installer via import map)
        // Pour l'instant, on utilise l'API fetch directe
        const response = await fetch(sub.endpoint, {
          method: 'POST',
          headers: {
            'TTL': '86400',
            'Content-Type': 'application/json',
            'Authorization': `vapid t=${generateVAPIDToken(vapidPublicKey, vapidPrivateKey, sub.endpoint)},k=${vapidPublicKey}`
          },
          body: notificationPayload
        })

        if (response.ok) {
          results.push({ success: true, endpoint: sub.endpoint })
          
          // Mettre à jour last_used_at
          await supabase
            .from('push_subscriptions')
            .update({ last_used_at: new Date().toISOString() })
            .eq('id', sub.id)
        } else {
          // Si 410 Gone, supprimer la subscription
          if (response.status === 410) {
            await supabase
              .from('push_subscriptions')
              .delete()
              .eq('id', sub.id)
          }
          results.push({ success: false, endpoint: sub.endpoint, status: response.status })
        }
      } catch (error) {
        console.error('Error sending to subscription:', error)
        results.push({ success: false, endpoint: sub.endpoint, error: error.message })
      }
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Push notification error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

// Helper pour générer VAPID token (simplifié)
function generateVAPIDToken(publicKey: string, privateKey: string, audience: string): string {
  // En production, utiliser une vraie lib JWT + VAPID
  // Pour demo, retourner un placeholder
  return 'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiJ9...'
}
