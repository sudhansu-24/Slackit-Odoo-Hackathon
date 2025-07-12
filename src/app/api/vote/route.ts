import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * API route to handle voting on questions and answers
 * POST /api/vote
 */
export async function POST(request: Request) {
  try {
    const { target_id, target_type, vote_type } = await request.json()
    
    console.log('Processing vote:', { target_id, target_type, vote_type })
    
    if (!target_id || !target_type || !vote_type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    if (!['question', 'answer'].includes(target_type)) {
      return NextResponse.json({ error: 'Invalid target type' }, { status: 400 })
    }
    
    if (!['upvote', 'downvote'].includes(vote_type)) {
      return NextResponse.json({ error: 'Invalid vote type' }, { status: 400 })
    }
    
    // Get current user from session
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    
    // Check if user has already voted on this target
    const { data: existingVote, error: voteCheckError } = await supabaseAdmin
      .from('votes')
      .select('*')
      .eq('user_id', user.id)
      .eq('target_id', target_id)
      .eq('target_type', target_type)
      .single()
    
    if (voteCheckError && voteCheckError.code !== 'PGRST116') {
      console.error('Vote check error:', voteCheckError)
      return NextResponse.json({ error: voteCheckError.message }, { status: 500 })
    }
    
    if (existingVote) {
      // User has already voted, update or remove vote
      if (existingVote.vote_type === vote_type) {
        // Same vote type, remove vote
        const { error: deleteError } = await supabaseAdmin
          .from('votes')
          .delete()
          .eq('id', existingVote.id)
        
        if (deleteError) {
          console.error('Vote deletion error:', deleteError)
          return NextResponse.json({ error: deleteError.message }, { status: 500 })
        }
        
        console.log('Vote removed')
      } else {
        // Different vote type, update vote
        const { error: updateError } = await supabaseAdmin
          .from('votes')
          .update({ vote_type })
          .eq('id', existingVote.id)
        
        if (updateError) {
          console.error('Vote update error:', updateError)
          return NextResponse.json({ error: updateError.message }, { status: 500 })
        }
        
        console.log('Vote updated')
      }
    } else {
      // User hasn't voted yet, create new vote
      const { error: insertError } = await supabaseAdmin
        .from('votes')
        .insert({
          user_id: user.id,
          target_id,
          target_type,
          vote_type
        })
      
      if (insertError) {
        console.error('Vote insertion error:', insertError)
        return NextResponse.json({ error: insertError.message }, { status: 500 })
      }
      
      console.log('New vote created')
    }
    
    // Update vote count in target table
    const { error: updateCountError } = await supabaseAdmin.rpc('update_vote_count', {
      p_target_id: target_id,
      p_target_type: target_type
    })
    
    if (updateCountError) {
      console.error('Vote count update error:', updateCountError)
      // Don't return error since the vote was processed, just log it
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 