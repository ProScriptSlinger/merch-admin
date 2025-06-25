'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase'

type UserProfile = Database['public']['Tables']['users']['Row']

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  session: Session | null
  isLoading: boolean
  error: string | null
  signOut: () => Promise<void>
  refreshUserProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Memoized fetch user profile with retry logic
  const fetchUserProfile = useCallback(async (userId: string, retries = 3): Promise<void> => {
    setIsLoading(true)
    setError(null)
    
    try {
      const { data, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (fetchError) {
        throw fetchError
      }

      if (!data && retries > 0) {
        // If no data but we have retries left, wait and try again
        await new Promise(resolve => setTimeout(resolve, 1000))
        return fetchUserProfile(userId, retries - 1)
      }

      setUserProfile(data)
    } catch (err) {
      console.error('Error fetching user profile:', err)
      setError('Failed to load user profile')
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        return fetchUserProfile(userId, retries - 1)
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Create user profile with transaction safety
  const createUserProfile = useCallback(async (user: User) => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Check if profile exists within a transaction
      const { data: existingProfile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (existingProfile) {
        setUserProfile(existingProfile)
        return
      }

      // Create new profile
      const qrCode = `QR_${user.id.slice(0, 8)}_${Date.now().toString(36)}`
      
      const { error: createError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email!,
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
          avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
          role: 'staff',
          qr_code: qrCode,
          balance: 0.00,
          total_purchases: 0,
          last_activity: new Date().toISOString(),
        })

      if (createError) throw createError

      // Fetch the newly created profile
      await fetchUserProfile(user.id)
    } catch (err) {
      console.error('Error creating user profile:', err)
      setError('Failed to create user profile')
    } finally {
      setIsLoading(false)
    }
  }, [fetchUserProfile])

  // Sign out with cleanup
  const signOut = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const { error: signOutError } = await supabase.auth.signOut()
      if (signOutError) throw signOutError
      
      setUser(null)
      setUserProfile(null)
      setSession(null)
    } catch (err) {
      console.error('Error signing out:', err)
      setError('Failed to sign out')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Refresh user profile with error handling
  const refreshUserProfile = useCallback(async () => {
    if (!user) return
    
    try {
      await fetchUserProfile(user.id)
    } catch (err) {
      console.error('Error refreshing profile:', err)
      setError('Failed to refresh profile')
    }
  }, [user, fetchUserProfile])

  // Initialize auth state
  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) throw sessionError
        
        if (mounted) {
          setSession(session)
          setUser(session?.user ?? null)
          
          if (session?.user) {
            await createUserProfile(session.user)
          }
        }
      } catch (err) {
        console.error('Error initializing auth:', err)
        if (mounted) setError('Failed to initialize authentication')
      } finally {
        if (mounted) setIsLoading(false)
      }
    }

    initializeAuth()

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (!mounted) return
        
        try {
          setSession(session)
          setUser(session?.user ?? null)

          if (session?.user) {
            switch (event) {
              case 'SIGNED_IN':
              case 'USER_UPDATED':
                await createUserProfile(session.user)
                break
              case 'TOKEN_REFRESHED':
                await fetchUserProfile(session.user.id)
                break
              case 'SIGNED_OUT':
                setUserProfile(null)
                break
            }
          } else {
            setUserProfile(null)
          }
        } catch (err) {
          console.error('Error handling auth change:', err)
          setError('Authentication error occurred')
        }
      }
    )

    return () => {
      mounted = false
      subscription?.unsubscribe()
    }
  }, [createUserProfile, fetchUserProfile])

  const value: AuthContextType = {
    user,
    userProfile,
    session,
    isLoading,
    error,
    signOut,
    refreshUserProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}