import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database'

/**
 * Supabase client configuration for SlackIt Q&A platform
 * Handles authentication, database operations, and real-time subscriptions
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

/**
 * Browser client for client-side operations
 * Uses SSR-compatible client from @supabase/ssr
 */
export const supabase = createBrowserClient<Database>(
  supabaseUrl,
  supabaseAnonKey
)

/**
 * Helper function to get current user from session
 * Returns null if no user is authenticated
 */
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

/**
 * Helper function to check if user is authenticated
 */
export const isAuthenticated = async (): Promise<boolean> => {
  const user = await getCurrentUser()
  return user !== null
} 