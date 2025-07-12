'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { logAuth } from '@/lib/client-logger'

/**
 * Authentication guard component that protects routes
 * Redirects to login if user is not authenticated
 */
interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  redirectTo?: string
}

export default function AuthGuard({ 
  children, 
  fallback = <AuthLoadingSpinner />, 
  redirectTo = '/auth/login' 
}: AuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    /**
     * Check authentication state on component mount
     */
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const authenticated = !!session
        
        setIsAuthenticated(authenticated)
        logAuth('Auth guard check completed', { authenticated })
        
        if (!authenticated) {
          const currentPath = window.location.pathname
          const redirectUrl = `${redirectTo}?redirect=${encodeURIComponent(currentPath)}`
          logAuth('Redirecting to login', { currentPath, redirectUrl })
          router.push(redirectUrl)
        }
      } catch (error) {
        logAuth('Auth guard check failed', error)
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()

    /**
     * Listen for authentication state changes
     */
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const authenticated = !!session
        logAuth('Auth state changed in guard', { event, authenticated })
        setIsAuthenticated(authenticated)
        
        if (!authenticated && event === 'SIGNED_OUT') {
          const currentPath = window.location.pathname
          const redirectUrl = `${redirectTo}?redirect=${encodeURIComponent(currentPath)}`
          router.push(redirectUrl)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [router, redirectTo])

  // Show loading state while checking authentication
  if (isLoading) {
    return fallback
  }

  // Show children if authenticated
  if (isAuthenticated) {
    return <>{children}</>
  }

  // Show loading state while redirecting
  return fallback
}

/**
 * Loading spinner component for authentication guard
 */
function AuthLoadingSpinner() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-gray-400">Checking authentication...</p>
      </div>
    </div>
  )
} 