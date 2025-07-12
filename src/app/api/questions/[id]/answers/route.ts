import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

/**
 * API route to create a new answer for a question
 * POST /api/questions/[id]/answers
 */
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('Creating answer for question ID:', params.id)
    
    const { content } = await request.json()
    
    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Answer content is required' }, { status: 400 })
    }
    
    // Get current user
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    
    // Create the answer
    const { data: answer, error: answerError } = await supabaseAdmin
      .from('answers')
      .insert({
        question_id: params.id,
        content: content.trim(),
        author_id: user.id
      })
      .select()
      .single()
    
    if (answerError) {
      console.error('Answer creation error:', answerError)
      return NextResponse.json({ error: answerError.message }, { status: 500 })
    }
    
    console.log('Successfully created answer:', {
      id: answer.id,
      questionId: params.id,
      authorId: user.id
    })
    
    return NextResponse.json(answer)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 