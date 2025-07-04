'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'admin' | 'manager' | 'staff'
}

export default function ProtectedRoute({ 
  children, 
  requiredRole 
}: ProtectedRouteProps) {
  const { user, userProfile, isLoading } = useAuth()
  const router = useRouter()
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth')
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (!isLoading && user && userProfile && requiredRole) {
      // Check role hierarchy: admin > manager > staff
      const roleHierarchy = {
        'admin': 3,
        'manager': 2,
        'staff': 1
      }

      const userRoleLevel = roleHierarchy[userProfile.role as keyof typeof roleHierarchy] || 0
      const requiredRoleLevel = roleHierarchy[requiredRole] || 0

      if (userRoleLevel < requiredRoleLevel) {
        router.push('/dashboard') // Redirect to dashboard if insufficient permissions
      }
    }
  }, [user, userProfile, requiredRole, isLoading, router])

  // if (isLoading) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen">
  //       <div className="flex items-center space-x-2">
  //         <Loader2 className="h-6 w-6 animate-spin" />
  //         <span>Cargando...</span>
  //       </div>
  //     </div>
  //   )
  // }

  if (!user) {
    return null
  }

  if (requiredRole && userProfile) {
    const roleHierarchy = {
      'admin': 3,
      'manager': 2,
      'staff': 1
    }

    const userRoleLevel = roleHierarchy[userProfile.role as keyof typeof roleHierarchy] || 0
    const requiredRoleLevel = roleHierarchy[requiredRole] || 0

    if (userRoleLevel < requiredRoleLevel) {
      return null
    }
  }

  return <>{children}</>
} 