export interface GeniusPayCustomer {
  name?: string;
  email?: string;
  phone?: string;
  country?: string;
}

export interface CreatePaymentInput {
  amount: number;
  currency?: string;
  payment_method?: string;
  gateway?: string;
  mmo_provider?: string;
  description?: string;
  customer?: GeniusPayCustomer;
  success_url?: string;
  error_url?: string;
  metadata?: Record<string, any>;
}

export interface GeniusPayTransaction {
  id: string;
  reference: string;
  amount: number;
  currency: string;
  fees: number;
  net_amount: number;
  status: string;
  payment_method: string;
  payment_provider: string;
  environment: string;
  customer: GeniusPayCustomer;
  metadata: Record<string, any>;
  checkout_url?: string;
  payment_url?: string;
  created_at: string;
  completed_at?: string;
  expires_at?: string;
}

export interface GeniusPayWebhookPayload {
  id: string;
  event: GeniusPayEventType;
  timestamp: string;
  created_at: string;
  data: GeniusPayTransaction & {
    object?: string;
    provider?: string;
    customer_name?: string;
    customer_phone?: string;
    merchant_id?: string;
  };
  environment: string;
  api_version: string;
}

export interface GeniusPayApiError {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export type GeniusPayEventType = 
  | "payment.initiated"
  | "payment.success"
  | "payment.failed"
  | "payment.cancelled"
  | "payment.refunded"
  | "payment.expired"
  | "cashout.requested"
  | "cashout.approved"
  | "cashout.completed"
  | "cashout.failed"
  | "webhook.test";
