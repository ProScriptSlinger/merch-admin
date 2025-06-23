'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/contexts/AppContext'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'admin' | 'manager' | 'staff'
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, userProfile, isLoading } = useApp()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth')
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (!isLoading && user && userProfile && requiredRole) {
      const roleHierarchy = {
        staff: 1,
        manager: 2,
        admin: 3,
      }

      const userRoleLevel = roleHierarchy[userProfile.role]
      const requiredRoleLevel = roleHierarchy[requiredRole]

      if (userRoleLevel < requiredRoleLevel) {
        router.push('/dashboard')
      }
    }
  }, [user, userProfile, requiredRole, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Cargando...</span>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (requiredRole && userProfile) {
    const roleHierarchy = {
      staff: 1,
      manager: 2,
      admin: 3,
    }

    const userRoleLevel = roleHierarchy[userProfile.role]
    const requiredRoleLevel = roleHierarchy[requiredRole]

    if (userRoleLevel < requiredRoleLevel) {
      return null
    }
  }

  return <>{children}</>
} 