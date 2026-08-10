import { CreatePaymentInput, GeniusPayTransaction } from './types';

function getGeniusPayHeaders(): Record<string, string> {
  const apiKey = process.env.GENIUSPAY_API_KEY;
  const apiSecret = process.env.GENIUSPAY_API_SECRET;

  if (!apiKey || !apiSecret) {
    throw new Error('Les identifiants GeniusPay (GENIUSPAY_API_KEY / GENIUSPAY_API_SECRET) ne sont pas configurés dans votre fichier .env.local.');
  }

  return {
    'X-API-Key': apiKey,
    'X-API-Secret': apiSecret,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'User-Agent': 'OfikaApp/1.0'
  };
}

const getBaseUrl = () => process.env.GENIUSPAY_BASE_URL || 'https://geniuspay.ci/api/v1/merchant';

async function parseGeniusPayResponse<T = any>(response: Response, endpoint: string): Promise<T> {
  const text = await response.text();
  let data: any;

  try {
    data = JSON.parse(text);
  } catch (e) {
    console.error(`[GeniusPay API Error] HTTP ${response.status} ${response.statusText} sur ${endpoint}:`, text.substring(0, 500));
    throw new Error(
      `Le service GeniusPay a répondu avec du HTML au lieu de JSON (HTTP ${response.status}). Assurez-vous d'avoir configuré des identifiants valides dans .env.local.`
    );
  }

  if (!response.ok || !data.success) {
    console.error(`[GeniusPay API Fail] Endpoint ${endpoint} (HTTP ${response.status}):`, data);
    throw new Error(data.error?.message || `Erreur lors de la requête GeniusPay sur ${endpoint}`);
  }

  return data;
}

export async function createGeniusPayPayment(input: CreatePaymentInput): Promise<GeniusPayTransaction> {
  const url = `${getBaseUrl()}/payments`;
  const response = await fetch(url, {
    method: 'POST',
    headers: getGeniusPayHeaders(),
    body: JSON.stringify(input)
  });

  const parsed = await parseGeniusPayResponse(response, '/payments');
  return parsed.data;
}

export async function getGeniusPayPayment(reference: string): Promise<GeniusPayTransaction> {
  const url = `${getBaseUrl()}/payments/${reference}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: getGeniusPayHeaders()
  });

  const parsed = await parseGeniusPayResponse(response, `/payments/${reference}`);
  return parsed.data;
}

export async function listGeniusPayPayments(filters?: { status?: string; payment_method?: string; from?: string; to?: string; search?: string; per_page?: number }): Promise<{ data: GeniusPayTransaction[], meta: any }> {
  const url = new URL(`${getBaseUrl()}/payments`);
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: getGeniusPayHeaders()
  });

  const parsed = await parseGeniusPayResponse(response, '/payments');
  return { data: parsed.data, meta: parsed.meta };
}

export async function getGeniusPayAccount(): Promise<any> {
  const url = `${getBaseUrl()}/account`;
  const response = await fetch(url, {
    method: 'GET',
    headers: getGeniusPayHeaders()
  });

  const parsed = await parseGeniusPayResponse(response, '/account');
  return parsed.data;
}

export async function getGeniusPayBalance(): Promise<{ available: number; pending: number; total: number; currency: string }> {
  const url = `${getBaseUrl()}/account/balance`;
  const response = await fetch(url, {
    method: 'GET',
    headers: getGeniusPayHeaders()
  });

  const parsed = await parseGeniusPayResponse(response, '/account/balance');
  return parsed.data;
}

export async function listPawapayProviders(country: string = 'CI'): Promise<any> {
  const url = `${getBaseUrl()}/pawapay/providers?country=${country}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: getGeniusPayHeaders()
  });

  const parsed = await parseGeniusPayResponse(response, `/pawapay/providers`);
  return parsed.data;
}
