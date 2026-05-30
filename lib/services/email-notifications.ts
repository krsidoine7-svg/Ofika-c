// =====================================================
// SERVICE DE NOTIFICATIONS EMAIL
// =====================================================

import { Order } from '@/lib/types/payments'
import { createClient } from '@/lib/supabase/client'

// Configuration email
const EMAIL_CONFIG = {
  fromEmail: process.env.FROM_EMAIL || 'noreply@ofika.app',
  fromName: process.env.FROM_NAME || 'Ofika',
  supportEmail: process.env.SUPPORT_EMAIL || 'support@ofika.app',
  apiKey: process.env.EMAIL_API_KEY || '',
  provider: process.env.EMAIL_PROVIDER || 'resend' // 'resend', 'sendgrid', 'mailgun'
}

// Types pour les templates d'email
interface EmailTemplate {
  subject: string
  html: string
  text: string
}

interface OrderConfirmationData {
  order: Order
  customerName: string
  customerEmail: string
  estimatedDelivery: string
}

// =====================================================
// TEMPLATES D'EMAIL
// =====================================================

/**
 * Template de confirmation de commande
 */
function getOrderConfirmationTemplate(data: OrderConfirmationData): EmailTemplate {
  const { order, customerName, estimatedDelivery } = data
  
  const cardTypeLabel = order.card_type === 'nfc_qr' ? 'NFC + QR Code' : 'QR Code uniquement'
  const formattedPrice = order.total_amount.toLocaleString('fr-FR') + ' XOF'
  
  const subject = `✅ Commande confirmée #${order.id.slice(-8)} - Ofika`
  
  const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Commande confirmée</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f97316, #ea580c); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .status-badge { background: #10b981; color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: bold; }
        .next-steps { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 20px 0; }
        .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
        .button { background: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Commande confirmée !</h1>
          <p>Merci pour votre confiance, ${customerName}</p>
        </div>
        
        <div class="content">
          <div class="order-details">
            <h2>Détails de votre commande</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;"><strong>Numéro de commande</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">#${order.id.slice(-8)}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;"><strong>Type de carte</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">${cardTypeLabel}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;"><strong>Quantité</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">${order.quantity}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;"><strong>Total payé</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #f97316;">${formattedPrice}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0;"><strong>Statut</strong></td>
                <td style="padding: 10px 0;"><span class="status-badge">Payée</span></td>
              </tr>
            </table>
          </div>
          
          <div class="next-steps">
            <h3>📋 Prochaines étapes</h3>
            <ul>
              <li><strong>Production :</strong> Votre carte est maintenant en production</li>
              <li><strong>Livraison estimée :</strong> ${estimatedDelivery}</li>
              <li><strong>Suivi :</strong> Vous recevrez un email avec le numéro de suivi</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/orders/${order.id}" class="button">
              Voir ma commande
            </a>
          </div>
          
          <div class="footer">
            <p>Des questions ? Contactez-nous à <a href="mailto:${EMAIL_CONFIG.supportEmail}">${EMAIL_CONFIG.supportEmail}</a></p>
            <p>Merci de faire confiance à Ofika pour vos cartes de visite digitales !</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
  
  const text = `
    🎉 Commande confirmée !
    
    Bonjour ${customerName},
    
    Votre commande #${order.id.slice(-8)} a été confirmée et payée avec succès.
    
    Détails de la commande :
    - Type de carte : ${cardTypeLabel}
    - Quantité : ${order.quantity}
    - Total payé : ${formattedPrice}
    - Statut : Payée
    
    Prochaines étapes :
    - Production : Votre carte est maintenant en production
    - Livraison estimée : ${estimatedDelivery}
    - Suivi : Vous recevrez un email avec le numéro de suivi
    
    Vous pouvez suivre votre commande ici : ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/orders/${order.id}
    
    Des questions ? Contactez-nous à ${EMAIL_CONFIG.supportEmail}
    
    Merci de faire confiance à Ofika !
  `
  
  return { subject, html, text }
}

/**
 * Template de notification d'échec de paiement
 */
function getPaymentFailedTemplate(order: Order, customerName: string): EmailTemplate {
  const subject = `❌ Paiement échoué #${order.id.slice(-8)} - Ofika`
  
  const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Paiement échoué</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc2626; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { background: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>❌ Paiement échoué</h1>
        </div>
        <div class="content">
          <p>Bonjour ${customerName},</p>
          <p>Nous n'avons pas pu traiter le paiement pour votre commande #${order.id.slice(-8)}.</p>
          <p>Vous pouvez réessayer le paiement en cliquant sur le bouton ci-dessous :</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/orders/new" class="button">
              Réessayer le paiement
            </a>
          </div>
          <p>Si le problème persiste, contactez-nous à ${EMAIL_CONFIG.supportEmail}</p>
        </div>
      </div>
    </body>
    </html>
  `
  
  const text = `
    Paiement échoué
    
    Bonjour ${customerName},
    
    Nous n'avons pas pu traiter le paiement pour votre commande #${order.id.slice(-8)}.
    
    Vous pouvez réessayer le paiement ici : ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/orders/new
    
    Si le problème persiste, contactez-nous à ${EMAIL_CONFIG.supportEmail}
  `
  
  return { subject, html, text }
}

// =====================================================
// SERVICES D'ENVOI D'EMAIL
// =====================================================

/**
 * Envoie un email via Resend
 */
async function sendEmailViaResend(
  to: string,
  template: EmailTemplate
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${EMAIL_CONFIG.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: `${EMAIL_CONFIG.fromName} <${EMAIL_CONFIG.fromEmail}>`,
        to: [to],
        subject: template.subject,
        html: template.html,
        text: template.text
      })
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Resend API error: ${error}`)
    }

    return { success: true }
  } catch (error) {
    console.error('Erreur Resend:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erreur inconnue' 
    }
  }
}

/**
 * Simulation d'envoi d'email pour le développement
 */
async function simulateEmailSend(
  to: string,
  template: EmailTemplate
): Promise<{ success: boolean; error?: string }> {
  console.log('📧 SIMULATION EMAIL')
  console.log('To:', to)
  console.log('Subject:', template.subject)
  console.log('Content preview:', template.text.substring(0, 200) + '...')
  
  // Simuler un délai
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Simuler occasionnellement des erreurs (2% de chance)
  if (Math.random() < 0.02) {
    return { success: false, error: 'Simulation d\'erreur email' }
  }
  
  return { success: true }
}

// =====================================================
// API PUBLIQUE
// =====================================================

/**
 * Envoie un email de confirmation de commande
 */
export async function sendOrderConfirmationEmail(
  order: Order,
  customerName: string,
  customerEmail: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Calculer la date de livraison estimée (7-14 jours ouvrés)
    const deliveryDate = new Date()
    deliveryDate.setDate(deliveryDate.getDate() + 10) // 10 jours en moyenne
    const estimatedDelivery = deliveryDate.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    const template = getOrderConfirmationTemplate({
      order,
      customerName,
      customerEmail,
      estimatedDelivery
    })

    // En développement ou si pas de clé API, utiliser la simulation
    if (process.env.NODE_ENV === 'development' || !EMAIL_CONFIG.apiKey) {
      return simulateEmailSend(customerEmail, template)
    }

    // En production, utiliser le service configuré
    switch (EMAIL_CONFIG.provider) {
      case 'resend':
        return sendEmailViaResend(customerEmail, template)
      default:
        return simulateEmailSend(customerEmail, template)
    }

  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email de confirmation:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erreur inconnue' 
    }
  }
}

/**
 * Envoie un email de notification d'échec de paiement
 */
export async function sendPaymentFailedEmail(
  order: Order,
  customerName: string,
  customerEmail: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const template = getPaymentFailedTemplate(order, customerName)

    if (process.env.NODE_ENV === 'development' || !EMAIL_CONFIG.apiKey) {
      return simulateEmailSend(customerEmail, template)
    }

    switch (EMAIL_CONFIG.provider) {
      case 'resend':
        return sendEmailViaResend(customerEmail, template)
      default:
        return simulateEmailSend(customerEmail, template)
    }

  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email d\'échec:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erreur inconnue' 
    }
  }
}

/**
 * Récupère les informations client pour une commande
 */
export async function getCustomerInfoForOrder(order: Order): Promise<{
  name: string
  email: string
} | null> {
  try {
    // Utiliser les informations de shipping_address en priorité
    if (order.shipping_address) {
      const shippingAddr = order.shipping_address as any
      return {
        name: shippingAddr.name || 'Client',
        email: shippingAddr.email || ''
      }
    }

    // Fallback : récupérer les infos utilisateur depuis Supabase Auth
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      return {
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Client',
        email: user.email || ''
      }
    }

    // Dernier fallback
    return {
      name: 'Client',
      email: ''
    }

  } catch (error) {
    console.error('Erreur lors de la récupération des infos client:', error)
    return {
      name: 'Client',
      email: ''
    }
  }
}

// Export de la configuration pour les tests
export const EmailConfig = {
  ...EMAIL_CONFIG,
  isConfigured: () => !!EMAIL_CONFIG.apiKey,
  isSimulationMode: () => process.env.NODE_ENV === 'development' || !EMAIL_CONFIG.apiKey
}
