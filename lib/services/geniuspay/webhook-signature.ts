import crypto from 'crypto';

/**
 * Vérifie la signature HMAC du webhook GeniusPay.
 * Formule: HMAC-SHA256(timestamp + "." + rawBody, secret)
 * 
 * @param rawBody Le corps brut de la requête (non parsé)
 * @param signatureHeader La signature reçue dans l'en-tête X-Webhook-Signature
 * @param timestampHeader Le timestamp reçu dans l'en-tête X-Webhook-Timestamp
 * @param secret Le secret webhook (GENIUSPAY_WEBHOOK_SECRET)
 */
export function verifyGeniusPayWebhookSignature(
  rawBody: string, 
  signatureHeader: string, 
  timestampHeader: string, 
  secret: string
): boolean {
  try {
    const payloadToSign = `${timestampHeader}.${rawBody}`;
    
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(payloadToSign);
    const expectedSignature = hmac.digest('hex');

    const expectedBuffer = Buffer.from(expectedSignature);
    const signatureBuffer = Buffer.from(signatureHeader);

    // crypto.timingSafeEqual crash (RangeError) si les buffers n'ont pas la même taille
    if (expectedBuffer.length !== signatureBuffer.length) {
      return false;
    }

    // Comparaison à temps constant pour éviter les attaques temporelles
    return crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
  } catch (error) {
    console.error('Erreur lors de la vérification de la signature webhook:', error);
    return false;
  }
}

/**
 * Vérifie la validité du timestamp du webhook pour éviter les attaques par rejeu.
 * 
 * @param timestampHeader Le timestamp reçu dans l'en-tête X-Webhook-Timestamp
 * @param toleranceSeconds La tolérance maximale en secondes (défaut 300 = 5 minutes)
 */
export function isWebhookTimestampValid(
  timestampHeader: string, 
  toleranceSeconds: number = 300
): boolean {
  try {
    const timestamp = parseInt(timestampHeader, 10);
    
    if (isNaN(timestamp)) {
      return false;
    }

    const currentTimestamp = Math.floor(Date.now() / 1000);
    const difference = Math.abs(currentTimestamp - timestamp);

    return difference <= toleranceSeconds;
  } catch (error) {
    return false;
  }
}
