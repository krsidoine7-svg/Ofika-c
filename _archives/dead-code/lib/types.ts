export interface User {
  id: string
  email: string
  emailVerified?: Date
  phone?: string
  name?: string
  image?: string
  preferredLanguage: string
  subscriptionTier: string
  cardsOrdered: number
  is_active: boolean
  lastLogin?: Date
  created_at: Date
  updated_at: Date
}

export interface Profile {
  id: string
  user_id: string
  profile_type: 'professional' | 'personal' | 'event'
  name: string
  bio?: string
  image_url?: string
  custom_url?: string
  phone?: string
  is_active: boolean
  created_at: Date
  updated_at: Date
  user?: User
  links?: Link[]
}

export interface Link {
  id: string
  profile_id: string
  title: string
  url: string
  position: 1 | 2
  click_count: number
  is_active: boolean
  created_at: Date
  updated_at: Date
}

export interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}

export interface LoginFormData {
  email: string
  password: string
}

export interface RegisterFormData {
  email: string
  password: string
  confirmPassword: string
  name?: string
}

export interface ProfileFormData {
  name: string
  profile_type: 'professional' | 'personal' | 'event'
  bio?: string
  image_url?: string
  custom_url?: string
}
