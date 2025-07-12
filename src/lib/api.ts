import { supabase } from '@/lib/supabase'
import { 
  Question, 
  Answer, 
  Vote, 
  Profile,
  QuestionWithAuthor,
  AnswerWithAuthor,
  QuestionWithAnswers,
  QuestionFormData,
  AnswerFormData,
  VoteFormData,
  PaginatedResponse
} from '@/types/database'
import { logAPI, logError, logAuth } from '@/lib/client-logger'

/**
 * API utility functions for StackIt Q&A platform
 * All functions include comprehensive logging for tracking workflows
 */

// ================================
// AUTHENTICATION OPERATIONS
// ================================

/**
 * Get current authenticated user profile
 */
export const getCurrentUserProfile = async (): Promise<Profile | null> => {
  try {
    logAuth('Fetching current user profile')
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      logError('Authentication error when fetching user', authError)
      return null
    }
    
    if (!user) {
      logAuth('No authenticated user found')
      return null
    }
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    
    if (profileError) {
      logError('Error fetching user profile', profileError)
      return null
    }
    
    logAuth('Successfully fetched user profile', { username: profile.username })
    return profile
  } catch (error) {
    logError('Unexpected error in getCurrentUserProfile', error as Error)
    return null
  }
}

/**
 * Update user profile
 */
export const updateUserProfile = async (profileData: Partial<Profile>): Promise<Profile | null> => {
  try {
    logAPI('Updating user profile', profileData)
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      logAuth('User not authenticated for profile update')
      return null
    }
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', user.id)
      .select()
      .single()
    
    if (error) {
      logError('Error updating user profile', error)
      return null
    }
    
    logAPI('Successfully updated user profile', { username: profile.username })
    return profile
  } catch (error) {
    logError('Unexpected error in updateUserProfile', error as Error)
    return null
  }
}

// ================================
// QUESTION OPERATIONS
// ================================

/**
 * Fetch all questions with pagination and filtering
 */
export const getQuestions = async (
  page: number = 1,
  limit: number = 10,
  filter: 'newest' | 'unanswered' | 'all' = 'all',
  searchTerm?: string
): Promise<PaginatedResponse<QuestionWithAuthor>> => {
  try {
    logAPI('Fetching questions', { page, limit, filter, searchTerm })
    
    let query = supabase
      .from('questions')
      .select(`
        *,
        author:profiles!author_id(id, username, avatar_url),
        answers(count)
      `)
      .order('created_at', { ascending: false })
    
    // Apply filters
    if (filter === 'unanswered') {
      query = query.eq('answers.count', 0)
    }
    
    // Apply search
    if (searchTerm) {
      query = query.or(`title.ilike.%${searchTerm}%, description.ilike.%${searchTerm}%`)
    }
    
    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    
    const { data: questions, error, count } = await query
      .range(from, to)
      .returns<QuestionWithAuthor[]>()
    
    if (error) {
      logError('Error fetching questions', error)
      return { data: [], count: 0, page, per_page: limit, total_pages: 0 }
    }
    
    // Transform data to include answer count
    const transformedQuestions = questions?.map(question => ({
      ...question,
      answer_count: question.answers?.[0]?.count || 0
    })) || []
    
    const totalPages = Math.ceil((count || 0) / limit)
    
    logAPI('Successfully fetched questions', { 
      count: transformedQuestions.length, 
      totalCount: count,
      page,
      totalPages
    })
    
    return {
      data: transformedQuestions,
      count: count || 0,
      page,
      per_page: limit,
      total_pages: totalPages
    }
  } catch (error) {
    logError('Unexpected error in getQuestions', error as Error)
    return { data: [], count: 0, page, per_page: limit, total_pages: 0 }
  }
}

/**
 * Fetch a single question with its answers
 */
export const getQuestionWithAnswers = async (questionId: string): Promise<QuestionWithAnswers | null> => {
  try {
    logAPI('Fetching question with answers via API', { questionId })
    
    const response = await fetch(`/api/questions/${questionId}`)
    
    if (!response.ok) {
      const errorData = await response.json()
      logError('API error fetching question', { 
        status: response.status, 
        error: errorData.error || 'Unknown error' 
      })
      return null
    }
    
    const question = await response.json()
    
    logAPI('Successfully fetched question with answers via API', { 
      questionId, 
      answerCount: question.answers?.length || 0 
    })
    
    return question
  } catch (error) {
    logError('Unexpected error in getQuestionWithAnswers', error as Error)
    return null
  }
}

/**
 * Create a new question
 */
export const createQuestion = async (questionData: QuestionFormData): Promise<Question | null> => {
  try {
    logAPI('Creating new question', { title: questionData.title, tags: questionData.tags })
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      logAuth('User not authenticated for question creation')
      return null
    }
    
    const { data: question, error } = await supabase
      .from('questions')
      .insert({
        title: questionData.title,
        description: questionData.description,
        tags: questionData.tags,
        author_id: user.id
      })
      .select()
      .single()
    
    if (error) {
      logError('Error creating question', error)
      return null
    }
    
    logAPI('Successfully created question', { questionId: question.id, title: question.title })
    return question
  } catch (error) {
    logError('Unexpected error in createQuestion', error as Error)
    return null
  }
}

// ================================
// ANSWER OPERATIONS
// ================================

/**
 * Create a new answer
 */
export const createAnswer = async (questionId: string, answerData: AnswerFormData): Promise<Answer | null> => {
  try {
    logAPI('Creating new answer via API', { questionId, contentLength: answerData.content.length })
    
    const response = await fetch(`/api/questions/${questionId}/answers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(answerData),
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      logError('API error creating answer', { 
        status: response.status, 
        error: errorData.error || 'Unknown error' 
      })
      return null
    }
    
    const answer = await response.json()
    
    logAPI('Successfully created answer via API', { answerId: answer.id, questionId })
    return answer
  } catch (error) {
    logError('Unexpected error in createAnswer', error as Error)
    return null
  }
}

/**
 * Accept an answer (only question owner can do this)
 */
export const acceptAnswer = async (answerId: string): Promise<boolean> => {
  try {
    logAPI('Accepting answer', { answerId })
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      logAuth('User not authenticated for answer acceptance')
      return false
    }
    
    // First, check if the user is the question owner
    const { data: answer, error: answerError } = await supabase
      .from('answers')
      .select('question_id, questions!inner(author_id)')
      .eq('id', answerId)
      .single()
    
    if (answerError) {
      logError('Error fetching answer for acceptance', answerError)
      return false
    }
    
    if (answer.questions?.author_id !== user.id) {
      logAuth('User not authorized to accept this answer')
      return false
    }
    
    // Unaccept all other answers for this question
    await supabase
      .from('answers')
      .update({ is_accepted: false })
      .eq('question_id', answer.question_id)
    
    // Accept the selected answer
    const { error: updateError } = await supabase
      .from('answers')
      .update({ is_accepted: true })
      .eq('id', answerId)
    
    if (updateError) {
      logError('Error accepting answer', updateError)
      return false
    }
    
    logAPI('Successfully accepted answer', { answerId })
    return true
  } catch (error) {
    logError('Unexpected error in acceptAnswer', error as Error)
    return false
  }
}

// ================================
// VOTING OPERATIONS
// ================================

/**
 * Vote on a question or answer
 */
export const vote = async (voteData: VoteFormData): Promise<boolean> => {
  try {
    logAPI('Submitting vote via API', voteData)
    
    const response = await fetch('/api/vote', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(voteData),
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      logError('API error submitting vote', { 
        status: response.status, 
        error: errorData.error || 'Unknown error' 
      })
      return false
    }
    
    const result = await response.json()
    
    logAPI('Successfully submitted vote via API', { success: result.success })
    return result.success
  } catch (error) {
    logError('Unexpected error in vote', error as Error)
    return false
  }
}

/**
 * Get user's vote for a specific target
 */
export const getUserVote = async (targetId: string, targetType: 'question' | 'answer'): Promise<Vote | null> => {
  try {
    logAPI('Fetching user vote', { targetId, targetType })
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return null
    }
    
    const { data: vote, error } = await supabase
      .from('votes')
      .select('*')
      .eq('user_id', user.id)
      .eq('target_id', targetId)
      .eq('target_type', targetType)
      .single()
    
    if (error && error.code !== 'PGRST116') {
      logError('Error fetching user vote', error)
      return null
    }
    
    return vote
  } catch (error) {
    logError('Unexpected error in getUserVote', error as Error)
    return null
  }
}

// ================================
// UTILITY FUNCTIONS
// ================================

/**
 * Get popular tags
 */
export const getPopularTags = async (limit: number = 20): Promise<string[]> => {
  try {
    logAPI('Fetching popular tags', { limit })
    
    const { data: questions, error } = await supabase
      .from('questions')
      .select('tags')
      .limit(1000) // Get recent questions to analyze tags
    
    if (error) {
      logError('Error fetching questions for tags', error)
      return []
    }
    
    // Count tag occurrences
    const tagCounts: Record<string, number> = {}
    questions?.forEach(question => {
      question.tags?.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1
      })
    })
    
    // Sort by popularity and return top tags
    const popularTags = Object.entries(tagCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([tag]) => tag)
    
    logAPI('Successfully fetched popular tags', { count: popularTags.length })
    return popularTags
  } catch (error) {
    logError('Unexpected error in getPopularTags', error as Error)
    return []
  }
} 