import { createClient } from '@/lib/supabase/middleware'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  try {
    // Create a Supabase client configured to use cookies
    const { supabase, response } = createClient(request)

    // IMPORTANT: Avoid writing any logic between createClient and
    // supabase.auth.getUser(). A simple mistake could make it very
    // hard to debug issues with users being randomly logged out.

    // Refresh session if expired - required for Server Components
    // https://supabase.com/docs/guides/auth/auth-helpers/nextjs#managing-session-with-middleware
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // If there's no user and the user is trying to access a protected route
    if (!user) {
      const { pathname } = request.nextUrl
      
      // Allow access to auth page and public assets
      if (pathname.startsWith('/auth') || 
          pathname.startsWith('/_next') || 
          pathname.startsWith('/api') ||
          pathname === '/') {
        return response
      }
      
      // Redirect to auth page for protected routes
      const redirectUrl = new URL('/auth', request.url)
      return NextResponse.redirect(redirectUrl)
    }

    // If there's a user and they're trying to access auth page, redirect to dashboard
    if (user) {
      const { pathname } = request.nextUrl
      if (pathname.startsWith('/auth')) {
        const redirectUrl = new URL('/dashboard', request.url)
        return NextResponse.redirect(redirectUrl)
      }
    }

    return response
  } catch (e) {
    // If you are here, a Supabase client could not be created!
    // This is likely because you have not set up environment variables.
    // Check that you have set up the following environment variables:
    // - NEXT_PUBLIC_SUPABASE_URL
    // - NEXT_PUBLIC_SUPABASE_ANON_KEY

    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    })
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 