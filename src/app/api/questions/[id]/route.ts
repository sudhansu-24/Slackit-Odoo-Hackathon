import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

/**
 * API route to get a single question with its answers
 * GET /api/questions/[id]
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('Fetching question with ID:', params.id)
    
    // First, get the question with author
    const { data: question, error: questionError } = await supabaseAdmin
      .from('questions')
      .select(`
        *,
        author:profiles!author_id(id, username, avatar_url)
      `)
      .eq('id', params.id)
      .single()

    if (questionError) {
      console.error('Question fetch error:', questionError)
      return NextResponse.json({ error: questionError.message }, { status: 500 })
    }

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 })
    }

    // Get answers for this question
    const { data: answers, error: answersError } = await supabaseAdmin
      .from('answers')
      .select(`
        *,
        author:profiles!author_id(id, username, avatar_url)
      `)
      .eq('question_id', params.id)
      .order('created_at', { ascending: false })

    if (answersError) {
      console.error('Answers fetch error:', answersError)
      return NextResponse.json({ error: answersError.message }, { status: 500 })
    }

    // Get answer count
    const { count: answerCount, error: countError } = await supabaseAdmin
      .from('answers')
      .select('*', { count: 'exact', head: true })
      .eq('question_id', params.id)

    if (countError) {
      console.error('Answer count error:', countError)
    }

    // Combine the data
    const questionWithAnswers = {
      ...question,
      answers: answers || [],
      answer_count: answerCount || 0
    }

    console.log('Successfully fetched question:', {
      id: params.id,
      title: question.title,
      answerCount: answerCount || 0
    })

    return NextResponse.json(questionWithAnswers)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 