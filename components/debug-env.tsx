"use client"

import { useEffect, useState } from 'react'

export function DebugEnv() {
  const [envVars, setEnvVars] = useState<{
    supabaseUrl: string | undefined
    supabaseKey: string | undefined
    nodeEnv: string | undefined
  }>({
    supabaseUrl: undefined,
    supabaseKey: undefined,
    nodeEnv: undefined,
  })

  useEffect(() => {
    setEnvVars({
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET',
      nodeEnv: process.env.NODE_ENV,
    })
  }, [])

  if (process.env.NODE_ENV === 'production') {
    return null // Don't show in production
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">Environment Variables Debug</h3>
      <div className="space-y-1">
        <div>NODE_ENV: {envVars.nodeEnv}</div>
        <div>SUPABASE_URL: {envVars.supabaseUrl ? 'SET' : 'NOT SET'}</div>
        <div>SUPABASE_KEY: {envVars.supabaseKey}</div>
      </div>
    </div>
  )
} 