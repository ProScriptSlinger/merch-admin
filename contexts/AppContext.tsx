'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'

type UserProfile = Database['public']['Tables']['users']['Row']

interface AppContextType {
  user: User | null
  userProfile: UserProfile | null
  session: Session | null
  isLoading: boolean
  signOut: () => Promise<void>
  refreshUserProfile: () => Promise<void>
  realtimeSubscriptions: Map<string, any>
  subscribeToRealtime: (table: string, callback: (payload: any) => void) => void
  unsubscribeFromRealtime: (table: string) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [realtimeSubscriptions, setRealtimeSubscriptions] = useState<Map<string, any>>(new Map())

  // Fetch user profile
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching user profile:', error)
        return
      }

      setUserProfile(data)
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }

  // Create user profile if it doesn't exist
  const createUserProfile = async (user: User) => {
    try {
      const { data: existingProfile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (!existingProfile) {
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
          await fetchUserProfile(user.id)
        }
      } else {
        setUserProfile(existingProfile)
      }
    } catch (error) {
      console.error('Error creating user profile:', error)
    }
  }

  // Sign out function
  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setUserProfile(null)
      setSession(null)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  // Refresh user profile
  const refreshUserProfile = async () => {
    if (user) {
      await fetchUserProfile(user.id)
    }
  }

  // Real-time subscription management
  const subscribeToRealtime = (table: string, callback: (payload: any) => void) => {
    // Unsubscribe from existing subscription if it exists
    unsubscribeFromRealtime(table)

    const subscription = supabase
      .channel(`public:${table}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table,
        },
        callback
      )
      .subscribe()

    setRealtimeSubscriptions(prev => new Map(prev).set(table, subscription))
  }

  const unsubscribeFromRealtime = (table: string) => {
    const subscription = realtimeSubscriptions.get(table)
    if (subscription) {
      supabase.removeChannel(subscription)
      setRealtimeSubscriptions(prev => {
        const newMap = new Map(prev)
        newMap.delete(table)
        return newMap
      })
    }
  }

  // Initialize auth state
  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)
    }

    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.email)
        
        setSession(session)
        setUser(session?.user ?? null)
        setIsLoading(false)

        if (session?.user) {
          // Handle different auth events
          if (event === 'SIGNED_IN' || event === 'SIGNED_UP') {
            await createUserProfile(session.user)
          } else if (event === 'TOKEN_REFRESHED') {
            await fetchUserProfile(session.user.id)
          }
        } else {
          setUserProfile(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Cleanup real-time subscriptions on unmount
  useEffect(() => {
    return () => {
      realtimeSubscriptions.forEach((subscription) => {
        supabase.removeChannel(subscription)
      })
    }
  }, [realtimeSubscriptions])

  const value: AppContextType = {
    user,
    userProfile,
    session,
    isLoading,
    signOut,
    refreshUserProfile,
    realtimeSubscriptions,
    subscribeToRealtime,
    unsubscribeFromRealtime,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
} 