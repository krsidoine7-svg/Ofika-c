# 🔧 EXEMPLE D'INTÉGRATION DES CORRECTIONS

## 1️⃣ Ajouter ScriptProtection dans le Layout

**Fichier :** `app/layout.tsx`

```typescript
import { ScriptProtection } from '@/components/ScriptProtection'
import './globals.css'

export const metadata = {
  title: 'Ofika - NFC Cards',
  description: 'Digital business cards',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body>
        {/* ✅ Ajouter ce composant pour protéger contre les doubles scripts */}
        <ScriptProtection />
        
        {children}
      </body>
    </html>
  )
}
```

---

## 2️⃣ Utiliser safeFetch dans un composant

**Fichier :** `app/nfc/[nfcLink]/page.tsx`

```typescript
'use client'

import { useEffect, useState } from 'react'
import { safeFetch } from '@/lib/utils/safe-fetch'

export default function NFCProfilePage({ params }: { params: { nfcLink: string } }) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadProfile()
  }, [params.nfcLink])

  const loadProfile = async () => {
    setLoading(true)
    
    // ✅ AVANT (peut causer 406)
    // const response = await fetch(`/api/nfc/public/${params.nfcLink}`)
    // const data = await response.json()

    // ✅ APRÈS (headers corrects automatiquement)
    const { success, data, error } = await safeFetch(
      `/api/nfc/public/${params.nfcLink}`,
      {
        timeout: 5000, // 5 secondes
        retry: true,   // Retry automatique
        retries: 3,    // 3 tentatives max
      }
    )

    if (success) {
      setProfile(data)
      setError(null)
    } else {
      setError(error)
      setProfile(null)
    }

    setLoading(false)
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  if (!profile) return <div>Profile not found</div>

  return (
    <div>
      <h1>{profile.profile_name}</h1>
      {/* ... */}
    </div>
  )
}
```

---

## 3️⃣ Utiliser apiSuccess/apiError dans une route API

**Fichier :** `app/api/profiles/route.ts`

```typescript
import { NextRequest } from 'next/server'
import { 
  apiSuccess, 
  apiBadRequest, 
  apiUnauthorized,
  apiHandler,
  parseJsonBody,
  validateParams 
} from '@/lib/utils/api-response'
import { createClient } from '@/lib/supabase/server'

// ✅ GET avec gestion d'erreur automatique
export async function GET(request: NextRequest) {
  return apiHandler(async () => {
    const supabase = createClient()
    
    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return apiUnauthorized('You must be logged in')
    }

    // Récupérer les profils
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)

    if (error) {
      throw new Error(error.message)
    }

    // ✅ Retourne automatiquement avec les bons headers
    return apiSuccess(profiles, 'Profiles fetched successfully')
  })
}

// ✅ POST avec validation
export async function POST(request: NextRequest) {
  return apiHandler(async () => {
    const supabase = createClient()
    
    // Parser le body JSON de manière sécurisée
    const bodyResult = await parseJsonBody(request)
    
    if (!bodyResult.success) {
      return apiBadRequest(bodyResult.error)
    }

    const body = bodyResult.data

    // Valider les paramètres requis
    const validation = validateParams(body, ['profile_name', 'user_id'])
    
    if (!validation.valid) {
      return apiBadRequest(
        'Missing required fields',
        { missing: validation.missing }
      )
    }

    // Créer le profil
    const { data: profile, error } = await supabase
      .from('profiles')
      .insert(body)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    // ✅ Retourne 201 Created avec les bons headers
    return apiSuccess(profile, 'Profile created successfully', 201)
  })
}
```

---

## 4️⃣ Charger des scripts externes de manière sécurisée

**Fichier :** `components/GoogleAnalytics.tsx`

```typescript
'use client'

import { useEffect } from 'react'
import { loadScriptSafely } from '@/lib/utils/script-loader-protection'

export function GoogleAnalytics({ gaMeasurementId }: { gaMeasurementId: string }) {
  useEffect(() => {
    // ✅ Charger Google Analytics de manière sécurisée
    loadScriptSafely(
      `https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`,
      {
        async: true,
        id: 'google-analytics',
        onLoad: () => {
          console.log('✅ Google Analytics loaded successfully')
          
          // Initialiser GA
          window.dataLayer = window.dataLayer || []
          function gtag(...args: any[]) {
            window.dataLayer.push(args)
          }
          gtag('js', new Date())
          gtag('config', gaMeasurementId)
        },
        onError: (error) => {
          console.error('❌ Failed to load Google Analytics', error)
        },
      }
    ).catch((error) => {
      console.error('Error loading GA:', error)
    })
  }, [gaMeasurementId])

  return null
}
```

---

## 5️⃣ Route API avec gestion complète d'erreur

**Fichier :** `app/api/nfc-cards/route.ts`

```typescript
import { NextRequest } from 'next/server'
import {
  apiSuccess,
  apiBadRequest,
  apiNotFound,
  apiForbidden,
  apiHandler,
  parseJsonBody,
} from '@/lib/utils/api-response'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  return apiHandler(async () => {
    const supabase = createClient()
    
    // Authentification
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return apiForbidden('Authentication required')
    }

    // Récupérer les cartes NFC
    const { data: cards, error } = await supabase
      .from('nfc_profiles')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }

    return apiSuccess(cards, `Found ${cards.length} NFC cards`)
  })
}

export async function POST(request: NextRequest) {
  return apiHandler(async () => {
    const supabase = createClient()
    
    // Parser le body
    const bodyResult = await parseJsonBody(request)
    if (!bodyResult.success) {
      return apiBadRequest(bodyResult.error)
    }

    const { profile_name, design_id, color_theme } = bodyResult.data

    // Validation
    if (!profile_name || !design_id) {
      return apiBadRequest(
        'Missing required fields',
        { required: ['profile_name', 'design_id'] }
      )
    }

    // Authentification
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return apiForbidden('Authentication required')
    }

    // Créer la carte NFC
    const { data: card, error } = await supabase
      .from('nfc_profiles')
      .insert({
        user_id: user.id,
        profile_name,
        design_id,
        color_theme: color_theme || 'blue',
        status: 'active',
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create NFC card: ${error.message}`)
    }

    return apiSuccess(card, 'NFC card created successfully', 201)
  })
}
```

---

## 6️⃣ Hook personnalisé avec safeFetch

**Fichier :** `lib/hooks/useProfiles.ts`

```typescript
'use client'

import { useState, useEffect } from 'react'
import { safeFetch } from '@/lib/utils/safe-fetch'

interface Profile {
  id: string
  profile_name: string
  user_id: string
  // ...
}

export function useProfiles() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadProfiles()
  }, [])

  const loadProfiles = async () => {
    setLoading(true)
    
    const { success, data, error } = await safeFetch<Profile[]>('/api/profiles', {
      retry: true,
      retries: 3,
    })

    if (success && data) {
      setProfiles(data)
      setError(null)
    } else {
      setError(error || 'Failed to load profiles')
      setProfiles([])
    }

    setLoading(false)
  }

  const createProfile = async (profileData: Partial<Profile>) => {
    const { success, data, error } = await safeFetch<Profile>(
      '/api/profiles',
      {
        method: 'POST',
        body: JSON.stringify(profileData),
      }
    )

    if (success && data) {
      setProfiles(prev => [...prev, data])
      return { success: true, data }
    }

    return { success: false, error }
  }

  const deleteProfile = async (id: string) => {
    const { success, error } = await safeFetch(`/api/profiles/${id}`, {
      method: 'DELETE',
    })

    if (success) {
      setProfiles(prev => prev.filter(p => p.id !== id))
      return { success: true }
    }

    return { success: false, error }
  }

  return {
    profiles,
    loading,
    error,
    createProfile,
    deleteProfile,
    refresh: loadProfiles,
  }
}
```

---

## 7️⃣ TypeScript Types

**Fichier :** `lib/types/api.ts`

```typescript
// Types pour les réponses API
export interface ApiSuccessResponse<T = any> {
  success: true
  data: T
  message?: string
}

export interface ApiErrorResponse {
  success: false
  error: string
  code?: string
  details?: any
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse

// Exemple d'utilisation
const response: ApiResponse<Profile[]> = await fetch('/api/profiles').then(r => r.json())

if (response.success) {
  console.log(response.data) // Type-safe: Profile[]
} else {
  console.error(response.error) // Type-safe: string
}
```

---

## ✅ CHECKLIST D'INTÉGRATION

- [ ] `ScriptProtection` ajouté dans `app/layout.tsx`
- [ ] Remplacer tous les `fetch()` par `safeFetch()`
- [ ] Utiliser `apiSuccess`/`apiError` dans toutes les routes API
- [ ] Ajouter `parseJsonBody()` pour parser les bodies JSON
- [ ] Utiliser `validateParams()` pour valider les paramètres
- [ ] Charger les scripts externes avec `loadScriptSafely()`
- [ ] Créer des hooks personnalisés avec `safeFetch`
- [ ] Tester dans la console (F12) : pas d'erreurs

---

*Exemple d'intégration complet - Version 1.0*
