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
    // Skip if we already have a user profile for this user
    if (userProfile && userProfile.id === userId) {
      console.log('Profile already exists, skipping fetch')
      return
    }

    console.log('fetchUserProfile called with userId:', userId)
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
        console.log(`No data found, retrying... (${retries} retries left)`)
        await new Promise(resolve => setTimeout(resolve, 1000))
        return fetchUserProfile(userId, retries - 1)
      }

      console.log('User profile fetched successfully:', data)
      setUserProfile(data)
    } catch (err) {
      console.error('Error fetching user profile:', err)
      setError('Failed to load user profile')
      if (retries > 0) {
        console.log(`Error occurred, retrying... (${retries} retries left)`)
        await new Promise(resolve => setTimeout(resolve, 1000))
        return fetchUserProfile(userId, retries - 1)
      }
    } finally {
      console.log('fetchUserProfile completed, setting isLoading to false')
      setIsLoading(false)
    }
  }, [userProfile])

  // Create user profile with transaction safety
  const createUserProfile = useCallback(async (user: User) => {
    // Skip if we already have a user profile for this user
    if (userProfile && userProfile.id === user.id) {
      console.log('Profile already exists, skipping creation')
      return
    }

    console.log('createUserProfile called with user:', user.id)
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
        console.log('Profile already exists in database, setting it')
        setUserProfile(existingProfile)
        return
      }

      console.log('Creating new user profile')
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

      console.log('User profile created successfully, fetching it')
      // Fetch the newly created profile without setting loading state again
      const { data: newProfile, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (fetchError) throw fetchError
      
      console.log('New profile fetched successfully:', newProfile)
      setUserProfile(newProfile)
    } catch (err) {
      console.error('Error creating user profile:', err)
      setError('Failed to create user profile')
    } finally {
      console.log('createUserProfile completed, setting isLoading to false')
      setIsLoading(false)
    }
  }, [userProfile])

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
        console.log('Getting initial session...')
        // Get existing session without creating a new one
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) throw sessionError
        
        if (mounted) {
          setSession(session)
          setUser(session?.user ?? null)
          
          // Only create user profile if session exists and user profile doesn't exist
          if (session?.user && !userProfile) {
            console.log('Session user exists, creating profile...')
            await createUserProfile(session.user)
          } else if (session?.user && userProfile) {
            console.log('Session user exists, profile already loaded')
          } else {
            console.log('No session or user')
          }
        }
      } catch (err) {
        console.error('Error initializing auth:', err)
        if (mounted) setError('Failed to initialize authentication')
      } finally {
        if (mounted) {
          console.log('Setting isLoading to false')
          setIsLoading(false)
        }
      }
    }

    initializeAuth()

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (!mounted) return
        
        console.log('Auth state change:', event, session?.user?.email)
        console.log('Current user state before update:', { user, userProfile, isLoading })
        
        try {
          setSession(session)
          setUser(session?.user ?? null)

          if (session?.user) {
            console.log('Session user exists, handling event:', event)
            switch (event) {
              case 'SIGNED_IN':
              case 'USER_UPDATED':
                console.log('Handling SIGNED_IN or USER_UPDATED event')
                // Only create profile if it doesn't exist
                if (!userProfile) {
                  console.log('createUserProfile called with user:', session.user.id)
                  await createUserProfile(session.user)
                } else {
                  console.log('Profile already exists, skipping creation')
                }
                break
              case 'TOKEN_REFRESHED':
                console.log('Handling TOKEN_REFRESHED event')
                // Only refresh if we don't have a profile or if explicitly needed
                if (!userProfile) {
                  console.log('fetchUserProfile called with userId:', session.user.id)
                  await fetchUserProfile(session.user.id)
                } else {
                  console.log('Profile already exists, skipping refresh')
                }
                break
              case 'SIGNED_OUT':
                console.log('Handling SIGNED_OUT event')
                setUserProfile(null)
                break
            }
          } else {
            console.log('No session user, clearing profile')
            setUserProfile(null)
          }
        } catch (err) {
          console.error('Error handling auth change:', err)
          setError('Authentication error occurred')
        } finally {
          // Ensure loading is set to false after auth state changes
          if (mounted) {
            console.log('Setting isLoading to false after auth change')
            setIsLoading(false)
          }
        }
      }
    )

    return () => {
      mounted = false
      subscription?.unsubscribe()
    }
  }, [createUserProfile, fetchUserProfile, userProfile])

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