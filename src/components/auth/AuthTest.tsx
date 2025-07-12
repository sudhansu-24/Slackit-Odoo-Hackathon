'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'

/**
 * Authentication test component for debugging auth flow
 * Shows current authentication state and provides login/logout functionality
 */
export default function AuthTest() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user || null)
        setMessage(session ? 'User is authenticated' : 'User is not authenticated')
      } catch (error) {
        setMessage(`Error getting session: ${error}`)
      } finally {
        setLoading(false)
      }
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null)
        setMessage(`Auth event: ${event}, User: ${session?.user?.email || 'none'}`)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      setMessage('Logged out successfully')
    } catch (error) {
      setMessage(`Logout error: ${error}`)
    }
  }

  if (loading) {
    return (
      <div className="p-4 bg-gray-800 rounded-lg">
        <p className="text-white">Loading auth state...</p>
      </div>
    )
  }

  return (
    <div className="p-4 bg-gray-800 rounded-lg space-y-4">
      <h3 className="text-white font-bold">Authentication Status</h3>
      <div className="text-sm">
        <p className="text-gray-300">Status: {message}</p>
        {user && (
          <div className="mt-2 text-gray-300">
            <p>User ID: {user.id}</p>
            <p>Email: {user.email}</p>
            <p>Created: {new Date(user.created_at).toLocaleString()}</p>
          </div>
        )}
      </div>
      <div className="flex space-x-2">
        {user ? (
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
          >
            Logout
          </button>
        ) : (
          <div className="space-x-2">
            <a
              href="/auth/login"
              className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
            >
              Login
            </a>
            <a
              href="/auth/register"
              className="inline-block px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
            >
              Register
            </a>
          </div>
        )}
      </div>
    </div>
  )
} 