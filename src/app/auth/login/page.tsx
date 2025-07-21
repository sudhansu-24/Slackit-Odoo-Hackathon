'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { logAuth, logError } from '@/lib/client-logger'

/**
 * Login form component that uses useSearchParams
 */
function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [redirectTo, setRedirectTo] = useState('/')

  // Get redirect parameter from URL
  useEffect(() => {
    const redirect = searchParams.get('redirect')
    if (redirect) {
      setRedirectTo(redirect)
      logAuth('Login page loaded with redirect parameter', { redirect })
    }
  }, [searchParams])

  /**
   * Handle user login with Supabase authentication
   * @param e - Form submission event
   */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      logAuth('Attempting user login', { email })
      
      // Validate inputs
      if (!email || !password) {
        setError('Email and password are required')
        return
      }

      // Attempt to sign in with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        logError('Login failed', error)
        setError(error.message)
        return
      }

      if (data.user) {
        logAuth('Login successful', { userId: data.user.id, redirectTo })
        router.push(redirectTo)
        router.refresh()
      }
    } catch (err) {
      logError('Unexpected error during login', err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Sign in to SlackIt
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Or{' '}
            <Link
              href="/auth/register"
              className="font-medium text-blue-400 hover:text-blue-300 transition-colors"
            >
              create a new account
            </Link>
          </p>
        </div>

        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm space-y-4">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-500 text-white bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:z-10 sm:text-sm"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-500 text-white bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:z-10 sm:text-sm"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-md bg-red-900 border border-red-700 p-4">
              <div className="text-sm text-red-300">
                {error}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          {/* Additional Links */}
          <div className="text-center">
            <Link
              href="/"
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

/**
 * Login page component with Supabase authentication
 * Features:
 * - Dark theme matching app design
 * - Form validation with error handling
 * - Email/password authentication
 * - Loading states and user feedback
 * - Navigation to registration page
 */
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
} 