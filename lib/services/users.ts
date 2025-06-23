import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'

export type UserProfile = Database['public']['Tables']['users']['Row']

export interface UpdateUserProfileData {
  full_name?: string
  phone?: string
  avatar_url?: string
  role?: 'admin' | 'manager' | 'staff'
}

// Fetch all users (admin only)
export async function getUsers(): Promise<UserProfile[]> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Error fetching users: ${error.message}`)
  }

  return data
}

// Fetch single user profile
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw new Error(`Error fetching user profile: ${error.message}`)
  }

  return data
}

// Update user profile
export async function updateUserProfile(userId: string, profileData: UpdateUserProfileData): Promise<UserProfile> {
  const { data, error } = await supabase
    .from('users')
    .update({
      ...profileData,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    throw new Error(`Error updating user profile: ${error.message}`)
  }

  return data
}

// Update user role (admin only)
export async function updateUserRole(userId: string, role: 'admin' | 'manager' | 'staff'): Promise<UserProfile> {
  const { data, error } = await supabase
    .from('users')
    .update({
      role,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    throw new Error(`Error updating user role: ${error.message}`)
  }

  return data
}

// Update user balance
export async function updateUserBalance(userId: string, amount: number): Promise<UserProfile> {
  // First get current balance
  const { data: currentUser, error: fetchError } = await supabase
    .from('users')
    .select('balance')
    .eq('id', userId)
    .single()

  if (fetchError) {
    throw new Error(`Error fetching user balance: ${fetchError.message}`)
  }

  const newBalance = Math.max(0, (currentUser.balance || 0) + amount)

  const { data, error } = await supabase
    .from('users')
    .update({
      balance: newBalance,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    throw new Error(`Error updating user balance: ${error.message}`)
  }

  return data
}

// Update user last activity
export async function updateUserLastActivity(userId: string): Promise<void> {
  const { error } = await supabase
    .from('users')
    .update({
      last_activity: new Date().toISOString(),
    })
    .eq('id', userId)

  if (error) {
    console.error('Error updating user last activity:', error)
  }
}

// Get users by role
export async function getUsersByRole(role: 'admin' | 'manager' | 'staff'): Promise<UserProfile[]> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('role', role)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Error fetching users by role: ${error.message}`)
  }

  return data
}

// Search users by name or email
export async function searchUsers(query: string): Promise<UserProfile[]> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Error searching users: ${error.message}`)
  }

  return data
}

// Get user by QR code
export async function getUserByQRCode(qrCode: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('qr_code', qrCode)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw new Error(`Error fetching user by QR code: ${error.message}`)
  }

  return data
} 