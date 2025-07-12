import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

/**
 * Server-only Supabase admin client for SlackIt Q&A platform
 * This file should ONLY be imported on the server-side
 * Never import this in client components or browser code
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase admin environment variables')
}

/**
 * Admin client for server-side operations requiring elevated permissions
 * Only use this for operations that require service role access
 * WARNING: This should NEVER be used in client components
 */
export const supabaseAdmin = createClient<Database>(
  supabaseUrl,
  supabaseServiceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
) 