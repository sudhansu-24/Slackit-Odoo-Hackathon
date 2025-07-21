import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * API route to create a new question
 * POST /api/questions
 */
export async function POST(request: Request) {
  try {
    console.log('Creating new question')
    
    const { title, description, tags } = await request.json()
    
    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Question title is required' }, { status: 400 })
    }
    
    if (!description || !description.trim()) {
      return NextResponse.json({ error: 'Question description is required' }, { status: 400 })
    }
    
    if (!tags || !Array.isArray(tags) || tags.length === 0) {
      return NextResponse.json({ error: 'At least one tag is required' }, { status: 400 })
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
    
    // Create the question
    const { data: question, error: questionError } = await supabaseAdmin
      .from('questions')
      .insert({
        title: title.trim(),
        description: description.trim(),
        tags: tags,
        author_id: user.id
      })
      .select()
      .single()
    
    if (questionError) {
      console.error('Question creation error:', questionError)
      return NextResponse.json({ error: questionError.message }, { status: 500 })
    }
    
    console.log('Successfully created question:', {
      id: question.id,
      title: question.title,
      authorId: user.id
    })
    
    return NextResponse.json(question)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 