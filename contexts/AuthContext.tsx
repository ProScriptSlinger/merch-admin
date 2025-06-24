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
  signOut: () => Promise<void>
  refreshUserProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch user profile
  const fetchUserProfile = useCallback(async (userId: string) => {
    console.log('fetchUserProfile called with userId:', userId)
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      console.log('fetchUserProfile result:', { data, error })

      if (error) {
        console.error('Error fetching user profile:', error)
        return
      }

      console.log('Setting userProfile to:', data)
      setUserProfile(data)
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }, [supabase])

  // Create user profile if it doesn't exist
  const createUserProfile = useCallback(async (user: User) => {
    console.log('createUserProfile called with user:', user.id)
    try {
      const { data: existingProfile, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      console.log('Existing profile check:', { existingProfile, fetchError })

      if (!existingProfile) {
        console.log('Creating new user profile...')
        // Generate a unique QR code for the user
        const qrCode = `QR_${user.id.slice(0, 8)}_${Date.now().toString(36)}`
        
        const { error } = await supabase
          .from('users')
          .insert({
            id: user.id,
            email: user.email!,
            full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
            avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
            role: 'staff', // Default role for new users
            qr_code: qrCode,
            balance: 0.00,
            total_purchases: 0,
            last_activity: new Date().toISOString(),
          })

        if (error) {
          console.error('Error creating user profile:', error)
        } else {
          console.log('User profile created successfully, fetching...')
          try {
            await fetchUserProfile(user.id)
          } catch (fetchError) {
            console.error('Error fetching user profile after creation:', fetchError)
          }
        }
      } else {
        console.log('User profile already exists, setting to:', existingProfile)
        setUserProfile(existingProfile)
      }
    } catch (error) {
      console.error('Error creating user profile:', error)
    }
  }, [supabase, fetchUserProfile])

  // Sign out function
  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setUserProfile(null)
      setSession(null)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }, [supabase])

  // Refresh user profile
  const refreshUserProfile = useCallback(async () => {
    if (user) {
      await fetchUserProfile(user.id)
    }
  }, [user, fetchUserProfile])

  useEffect(() => {
    if (user) {
      console.log('User changed, fetching profile for:', user.id)
      fetchUserProfile(user.id)
    }
  }, [user, fetchUserProfile])

  // Set loading to false when userProfile is set
  useEffect(() => {
    if (user && userProfile) {
      console.log('User and userProfile both set, setting isLoading to false')
      setIsLoading(false)
    }
  }, [user, userProfile])
  
  // Initialize auth state
  useEffect(() => {
    const getSession = async () => {
      console.log('Getting initial session...')
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        console.log('Initial session result:', { session: session?.user?.email, error })
        
        if (error) {
          console.error('Error getting session:', error)
          setIsLoading(false)
          return
        }
        
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          console.log('Initial session has user, creating/fetching profile...')
          await createUserProfile(session.user)
        }
        
        setIsLoading(false)
        console.log('getSession completed, isLoading set to false')
      } catch (error) {
        console.error('Exception in getSession:', error)
        setIsLoading(false)
      }
    }

    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        console.log('Auth state change:', event, session?.user?.email)
        console.log('Current user state before update:', { user, userProfile, isLoading })
        
        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          console.log('Session user exists, handling event:', event)
          // Handle different auth events
          if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
            console.log('Handling SIGNED_IN or USER_UPDATED event')
            await createUserProfile(session.user)
          } else if (event === 'TOKEN_REFRESHED') {
            console.log('Handling TOKEN_REFRESHED event')
            await fetchUserProfile(session.user.id)
          }
        } else {
          console.log('No session user, clearing userProfile')
          setUserProfile(null)
        }
        
        setIsLoading(false)
        console.log('Auth state change completed')
      }
    )

    return () => subscription.unsubscribe()
  }, [createUserProfile, fetchUserProfile])

  const value: AuthContextType = {
    user,
    userProfile,
    session,
    isLoading,
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