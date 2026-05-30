'use client'

import { createContext, useContext, useEffect, useState, useCallback, useMemo, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User, AuthError, Session } from '@supabase/supabase-js'

interface AuthContextType {
    user: User | null
    loading: boolean
    error: AuthError | null
    signIn: (email: string, password: string) => Promise<{ success: boolean; data?: any; error?: AuthError }>
    signUp: (email: string, password: string, metadata?: Record<string, any>) => Promise<{ success: boolean; data?: any; error?: AuthError }>
    signOut: () => Promise<boolean>
    refreshUser: () => Promise<User | null>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<AuthError | null>(null)

    const supabase = useMemo(() => createClient(), [])

    const refreshUser = useCallback(async () => {
        try {
            const { data: { user }, error } = await supabase.auth.getUser()
            if (error) throw error

            setUser(prev => {
                if (prev?.id === user?.id && prev?.email === user?.email) {
                    return prev
                }
                return user
            })
            return user
        } catch (err) {
            const authError = err as AuthError
            // Don't set error state for no session, just clear user
            if (authError.message.includes('Auth session missing')) {
                setUser(null)
            } else {
                setError(authError)
                setUser(null)
            }
            return null
        }
    }, [supabase])

    useEffect(() => {
        let mounted = true

        // 1. Initial load - Une seule fois
        const initializeAuth = async () => {
            try {
                const { data: { session }, error: sessionError } = await supabase.auth.getSession()
                if (!mounted) return

                if (session?.user) {
                    setUser(session.user)
                } else {
                    setUser(null)
                }
            } catch (err) {
                console.error('Initial auth error:', err)
                if (mounted) setUser(null)
            } finally {
                if (mounted) setLoading(false)
            }
        }

        initializeAuth()

        // 2. Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (!mounted) return

                console.log('🔄 Auth event:', event)

                if (session?.user) {
                    setUser(prev => (prev?.id === session.user.id ? prev : session.user))
                } else {
                    setUser(null)
                }

                // S'assurer que loading passe à false sur n'importe quel événement valide
                setLoading(false)
            }
        )

        return () => {
            mounted = false
            subscription.unsubscribe()
        }
    }, [supabase])

    const signIn = useCallback(async (email: string, password: string) => {
        try {
            setLoading(true)
            setError(null)

            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            })

            if (error) {
                setError(error)
                return { success: false, error }
            }

            return { success: true, data }

        } catch (err) {
            const authError = err as AuthError
            setError(authError)
            return { success: false, error: authError }
        } finally {
            setLoading(false)
        }
    }, [supabase])

    const signUp = useCallback(async (email: string, password: string, metadata?: Record<string, any>) => {
        try {
            setLoading(true)
            setError(null)

            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: metadata
                }
            })

            if (error) {
                setError(error)
                return { success: false, error }
            }

            return { success: true, data }

        } catch (err) {
            const authError = err as AuthError
            setError(authError)
            return { success: false, error: authError }
        } finally {
            setLoading(false)
        }
    }, [supabase])

    const signOut = useCallback(async () => {
        try {
            setLoading(true)
            const { error } = await supabase.auth.signOut()
            if (error) throw error
            setUser(null)
            return true
        } catch (err) {
            const authError = err as AuthError
            console.error('Sign out error:', authError)
            setError(authError)
            return false
        } finally {
            setLoading(false)
        }
    }, [supabase])

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            error,
            signIn,
            signUp,
            signOut,
            refreshUser
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuthContext() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuthContext must be used within an AuthProvider')
    }
    return context
}
