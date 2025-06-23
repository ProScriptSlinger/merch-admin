'use server'

import { createSimpleClient } from '@/lib/supabase/server-simple'
import { redirect } from 'next/navigation'

export async function signOut() {
  const supabase = createSimpleClient()

  // Check if we have a session
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    await supabase.auth.signOut()
  }

  redirect('/auth')
}

export async function getUser() {
  const supabase = createSimpleClient()

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return null
    }

    return user
  } catch (error) {
    console.error('Error getting user:', error)
    return null
  }
}

export async function getUserProfile(userId: string) {
  const supabase = createSimpleClient()

  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching user profile:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return null
  }
} 