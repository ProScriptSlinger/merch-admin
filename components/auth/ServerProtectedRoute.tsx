import { redirect } from 'next/navigation'
import { createSimpleClient } from '@/lib/supabase/server-simple'

interface ServerProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'admin' | 'manager' | 'staff'
}

export default async function ServerProtectedRoute({ 
  children, 
  requiredRole 
}: ServerProtectedRouteProps) {
  const supabase = createSimpleClient()

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      redirect('/auth')
    }

    // If a specific role is required, check user profile
    if (requiredRole) {
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profileError || !userProfile) {
        redirect('/auth')
      }

      // Check role hierarchy: admin > manager > staff
      const roleHierarchy = {
        'admin': 3,
        'manager': 2,
        'staff': 1
      }

      const userRoleLevel = roleHierarchy[userProfile.role as keyof typeof roleHierarchy] || 0
      const requiredRoleLevel = roleHierarchy[requiredRole] || 0

      if (userRoleLevel < requiredRoleLevel) {
        redirect('/dashboard') // Redirect to dashboard if insufficient permissions
      }
    }

    return <>{children}</>
  } catch (error) {
    console.error('ServerProtectedRoute error:', error)
    redirect('/auth')
  }
} 