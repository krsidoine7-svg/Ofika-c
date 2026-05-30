// Types de base de données pour Supabase (remplace Prisma)

export interface User {
  id: string
  email: string
  email_verified?: string
  phone?: string
  name?: string
  image?: string
  preferred_language: string
  subscription_tier: string
  cards_ordered: number
  is_active: boolean
  last_login?: string
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  user_id: string
  profile_type: string
  name: string
  bio?: string
  image_url?: string
  cover_image_url?: string
  custom_url?: string
  username?: string
  // Contact
  email?: string
  phone?: string
  location?: string
  company?: string
  job_title?: string
  // Réseaux sociaux (liste déroulante)
  social_links?: Array<{
    platform: 'whatsapp' | 'facebook' | 'instagram' | 'twitter' | 'youtube' | 'tiktok' | 'linkedin' | 'snapchat' | 'telegram' | 'website' | 'github' | 'shop' | 'other'
    url: string
  }>
  // Liens personnalisés
  custom_links?: Array<{
    title: string
    url: string
    type: 'website' | 'shop' | 'other'
  }>
  design_choice?: string
  color_theme?: string
  is_public: boolean
  display_reviews?: boolean
  instagram_followers?: number
  instagram_posts?: number
  instagram_verified?: boolean
  ig_show_followers?: boolean
  ig_show_posts?: boolean
  ig_show_verified?: boolean

  tiktok_followers?: number
  tiktok_posts?: number
  tiktok_verified?: boolean
  tt_show_followers?: boolean
  tt_show_posts?: boolean
  tt_show_verified?: boolean

  youtube_subscribers?: number
  youtube_videos?: number
  youtube_verified?: boolean
  yt_show_subscribers?: boolean
  yt_show_videos?: boolean
  yt_show_verified?: boolean

  twitter_followers?: number
  twitter_posts?: number
  twitter_verified?: boolean
  tw_show_followers?: boolean
  tw_show_posts?: boolean
  tw_show_verified?: boolean

  facebook_followers?: number
  facebook_verified?: boolean
  fb_show_followers?: boolean
  fb_show_verified?: boolean

  is_active: boolean
  suspension_reason?: string
  created_at: string
  updated_at: string
}

export interface Link {
  id: string
  profile_id: string
  title: string
  url: string
  position: number
  click_count: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Card {
  id: string
  user_id: string
  profile_id: string
  card_type: string
  unique_code: string
  is_activated: boolean
  tap_count: number
  created_at: string
  updated_at: string
}

export interface CardDesign {
  id: string
  card_id: string
  front_design: any
  back_design: any
  qr_code_url?: string
  nfc_data?: string
  created_at: string
}

export interface Order {
  id: string
  user_id: string
  profile_id: string
  card_type: string
  quantity: number
  unit_price: number
  total_price: number
  currency: string
  status: string
  lygos_payment_id?: string
  lygos_payment_url?: string
  created_at: string
  updated_at: string
}

export interface PaymentMethod {
  id: string
  name: string
  provider: string
  is_active: boolean
  icon_url?: string
  created_at: string
}

export interface AnalyticsEvent {
  id: string
  user_id?: string
  profile_id?: string
  event_type: string
  event_data?: any
  user_agent?: string
  device_type?: string
  created_at: string
}

export interface DashboardWidget {
  id: string
  user_id: string
  widget_type: string
  position: number
  is_visible: boolean
  config?: any
  created_at: string
}

// Types personnalisés pour l'application
export type ProfileWithLinks = Profile & {
  links: Link[]
}

export type UserWithProfiles = User & {
  profiles: Profile[]
}

export interface CardWithDesign extends Card {
  design?: CardDesign
}

// Types pour les requêtes Supabase
export interface Database {
  public: {
    Tables: {
      users: {
        Row: User
        Insert: Omit<User, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>
      }
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>
      }
      links: {
        Row: Link
        Insert: Omit<Link, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Link, 'id' | 'created_at' | 'updated_at'>>
      }
      cards: {
        Row: Card
        Insert: Omit<Card, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Card, 'id' | 'created_at' | 'updated_at'>>
      }
      card_designs: {
        Row: CardDesign
        Insert: Omit<CardDesign, 'id' | 'created_at'>
        Update: Partial<Omit<CardDesign, 'id' | 'created_at'>>
      }
      orders: {
        Row: Order
        Insert: Omit<Order, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Order, 'id' | 'created_at' | 'updated_at'>>
      }
      payment_methods: {
        Row: PaymentMethod
        Insert: Omit<PaymentMethod, 'id' | 'created_at'>
        Update: Partial<Omit<PaymentMethod, 'id' | 'created_at'>>
      }
      analytics_events: {
        Row: AnalyticsEvent
        Insert: Omit<AnalyticsEvent, 'id' | 'created_at'>
        Update: Partial<Omit<AnalyticsEvent, 'id' | 'created_at'>>
      }
      dashboard_widgets: {
        Row: DashboardWidget
        Insert: Omit<DashboardWidget, 'id' | 'created_at'>
        Update: Partial<Omit<DashboardWidget, 'id' | 'created_at'>>
      }
    }
  }
}
