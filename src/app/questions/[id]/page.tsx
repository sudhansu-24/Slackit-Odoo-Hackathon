'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Mail, MailOpen, Tag, Calendar, User, MessageCircle, AlertCircle, CheckCircle } from 'lucide-react'
import { getQuestionWithAnswers, createAnswer, vote } from '@/lib/api'
import { QuestionWithAnswers, AnswerFormData, VoteFormData } from '@/types/database'
import { logInfo, logError } from '@/lib/client-logger'

/**
 * Question Detail Page (Screen 3) for SlackIt Q&A platform
 * Shows a real question with answers and voting system using mail-like icons
 * Fetches data from database instead of using mock data
 */

export default function QuestionDetailPage({ params }: { params: { id: string } }) {
  const [question, setQuestion] = useState<QuestionWithAnswers | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [newAnswer, setNewAnswer] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitSuccess, setSubmitSuccess] = useState('')

  // Fetch question data on component mount
  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        setIsLoading(true)
        setError('')
        
        logInfo('Fetching question details', { questionId: params.id })
        
        const questionData = await getQuestionWithAnswers(params.id)
        
        if (!questionData) {
          setError('Question not found')
          logError('Question not found', { questionId: params.id })
          return
        }
        
        setQuestion(questionData)
        logInfo('Question details fetched successfully', { 
          questionId: params.id, 
          title: questionData.title,
          answerCount: questionData.answers?.length || 0
        })
        
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load question'
        setError(errorMessage)
        logError('Error fetching question details', err as Error)
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      fetchQuestion()
    }
  }, [params.id])

  /**
   * Handle voting on question or answer - Real database operation
   */
  const handleVote = async (targetType: 'question' | 'answer', targetId: string, voteType: 'upvote' | 'downvote') => {
    try {
      logInfo('Submitting vote', { targetType, targetId, voteType })
      
      const voteData: VoteFormData = {
        target_id: targetId,
        target_type: targetType,
        vote_type: voteType
      }
      
      const success = await vote(voteData)
      
      if (success) {
        logInfo('Vote submitted successfully', voteData)
        // Refresh question data to show updated votes
        const updatedQuestion = await getQuestionWithAnswers(params.id)
        if (updatedQuestion) {
          setQuestion(updatedQuestion)
        }
      } else {
        logError('Vote submission failed')
      }
      
    } catch (error) {
      logError('Error submitting vote', error as Error)
    }
  }

  /**
   * Handle submitting a new answer - Real database operation
   */
  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError('')
    setSubmitSuccess('')
    
    try {
      if (!newAnswer.trim()) {
        setSubmitError('Please enter an answer')
        return
      }

      logInfo('Submitting new answer', { 
        questionId: params.id, 
        answerLength: newAnswer.trim().length 
      })

      const answerData: AnswerFormData = {
        content: newAnswer.trim()
      }

      const createdAnswer = await createAnswer(params.id, answerData)

      if (!createdAnswer) {
        setSubmitError('Failed to submit answer. Please try again.')
        logError('Answer creation failed - API returned null')
        return
      }

      // Success
      setSubmitSuccess('Answer submitted successfully!')
      setNewAnswer('')
      logInfo('Answer submitted successfully', { answerId: createdAnswer.id })

      // Refresh question data to show new answer
      const updatedQuestion = await getQuestionWithAnswers(params.id)
      if (updatedQuestion) {
        setQuestion(updatedQuestion)
      }

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSubmitSuccess('')
      }, 3000)

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      setSubmitError(errorMessage)
      logError('Error submitting answer', error as Error)
    } finally {
      setIsSubmitting(false)
    }
  }

  /**
   * Format date for display
   */
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="bg-gray-800 border-b border-gray-700">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center space-x-4">
              <Link 
                href="/" 
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Questions</span>
              </Link>
            </div>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 animate-pulse">
            <div className="h-8 bg-gray-700 rounded mb-4"></div>
            <div className="h-4 bg-gray-700 rounded mb-2"></div>
            <div className="h-4 bg-gray-700 rounded mb-2"></div>
            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="bg-gray-800 border-b border-gray-700">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center space-x-4">
              <Link 
                href="/" 
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Questions</span>
              </Link>
            </div>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-900 border border-red-700 rounded-lg p-6">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
              <div className="text-sm text-red-300">
                {error}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // No question found
  if (!question) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <Link 
              href="/" 
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Questions</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Question */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-8">
          <div className="flex items-start space-x-4">
            {/* Voting */}
            <div className="flex flex-col items-center space-y-2">
              <button
                onClick={() => handleVote('question', question.id, 'upvote')}
                className="p-2 rounded transition-colors text-gray-400 hover:text-green-500 hover:bg-gray-700"
                title="Upvote this question"
              >
                <MailOpen className="h-5 w-5" />
              </button>
              <span className="text-lg font-semibold">{question.votes}</span>
              <button
                onClick={() => handleVote('question', question.id, 'downvote')}
                className="p-2 rounded transition-colors text-gray-400 hover:text-red-500 hover:bg-gray-700"
                title="Downvote this question"
              >
                <Mail className="h-5 w-5" />
              </button>
            </div>

            {/* Question Content */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white mb-4">{question.title}</h1>
              
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {question.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-600 text-white"
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </span>
                ))}
              </div>

              {/* Description */}
              <div className="prose prose-invert max-w-none mb-4">
                <p className="text-gray-300 whitespace-pre-wrap">{question.description}</p>
              </div>

              {/* Question Meta */}
              <div className="flex items-center justify-between text-sm text-gray-400">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <User className="h-4 w-4" />
                    <span>{question.author.username}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(question.created_at)}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span>{question.answers?.length || 0} answers</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Answers */}
        <div className="space-y-6 mb-8">
          <h2 className="text-xl font-semibold text-white">{question.answers?.length || 0} Answers</h2>
          
          {question.answers?.map((answer) => (
            <div key={answer.id} className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <div className="flex items-start space-x-4">
                {/* Voting */}
                <div className="flex flex-col items-center space-y-2">
                  <button
                    onClick={() => handleVote('answer', answer.id, 'upvote')}
                    className="p-2 rounded transition-colors text-gray-400 hover:text-green-500 hover:bg-gray-700"
                    title="Upvote this answer"
                  >
                    <MailOpen className="h-5 w-5" />
                  </button>
                  <span className="text-lg font-semibold">{answer.votes}</span>
                  <button
                    onClick={() => handleVote('answer', answer.id, 'downvote')}
                    className="p-2 rounded transition-colors text-gray-400 hover:text-red-500 hover:bg-gray-700"
                    title="Downvote this answer"
                  >
                    <Mail className="h-5 w-5" />
                  </button>
                  {answer.is_accepted && (
                    <div className="mt-2 p-1 bg-green-600 rounded-full">
                      <MessageCircle className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>

                {/* Answer Content */}
                <div className="flex-1">
                  <div className="prose prose-invert max-w-none mb-4">
                    <p className="text-gray-300 whitespace-pre-wrap">{answer.content}</p>
                  </div>

                  {/* Answer Meta */}
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span>{answer.author.username}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(answer.created_at)}</span>
                      </div>
                    </div>
                    {answer.is_accepted && (
                      <span className="text-green-500 font-medium">✓ Accepted Answer</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Answer Form */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Your Answer</h3>
          <form onSubmit={handleSubmitAnswer}>
            <textarea
              value={newAnswer}
              onChange={(e) => {
                setNewAnswer(e.target.value)
                setSubmitError('')
                setSubmitSuccess('')
              }}
              placeholder="Write your answer here..."
              rows={6}
              className="w-full px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
              required
            />

            {/* Error Message */}
            {submitError && (
              <div className="rounded-md bg-red-900 border border-red-700 p-4 mt-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
                  <div className="text-sm text-red-300">
                    {submitError}
                  </div>
                </div>
              </div>
            )}

            {/* Success Message */}
            {submitSuccess && (
              <div className="rounded-md bg-green-900 border border-green-700 p-4 mt-4">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
                  <div className="text-sm text-green-300">
                    {submitSuccess}
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end mt-4">
              <button
                type="submit"
                disabled={isSubmitting || !newAnswer.trim()}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <span>Post Your Answer</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 