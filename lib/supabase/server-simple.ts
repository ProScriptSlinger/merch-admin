import { createClient } from '@supabase/supabase-js'

export function createSimpleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables. Please check your .env.local file and Vercel environment variables.')
  }

  return createClient(supabaseUrl, supabaseAnonKey)
} 