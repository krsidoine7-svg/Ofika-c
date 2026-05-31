export function getSupabaseUrl(): string {
  const value = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  return value || ''
}

export function getSupabaseAnonKey(): string {
  const publishable = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim()
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  return publishable || anon || ''
}

export function hasSupabaseEnv(): boolean {
  return Boolean(getSupabaseUrl() && getSupabaseAnonKey())
}

export function assertSupabaseEnv(context = 'Supabase client'): void {
  if (hasSupabaseEnv()) return

  throw new Error(
    `${context}: NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (ou NEXT_PUBLIC_SUPABASE_ANON_KEY) sont requis. ` +
      'Configurez-les dans .env.local et sur Vercel → Settings → Environment Variables.'
  )
}
