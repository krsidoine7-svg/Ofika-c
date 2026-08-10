export type ProductType = 'nfc_qr' | 'qr_only' | 'premium_subscription' | 'custom'

export interface Product {
  id: string
  name: string
  type: ProductType
  price: number
  currency: string
  description: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}
