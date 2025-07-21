import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { QuestionWithAuthor } from '@/types/database'
import { logInfo } from '@/lib/client-logger'

/**
 * QuestionCard component for displaying individual questions
 * Matches the exact mockup design with dark theme and rounded corners
 */
interface QuestionCardProps {
  question: QuestionWithAuthor
}

export default function QuestionCard({ question }: QuestionCardProps) {
  /**
   * Handle question card click for analytics
   */
  const handleQuestionClick = () => {
    logInfo('Question card clicked', { 
      questionId: question.id, 
      title: question.title,
      author: question.author.username 
    })
  }

  /**
   * Truncate description to fit card layout
   */
  const truncateDescription = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength).trim() + '...'
  }

  /**
   * Format creation date in relative time
   */
  const getTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch (_error) {
      return 'Unknown time'
    }
  }

  return (
    <div className="bg-dark-card rounded-lg p-6 border border-dark-border hover:border-dark-hover transition-all duration-200 animate-fade-in">
      <Link 
        href={`/questions/${question.id}`}
        onClick={handleQuestionClick}
        className="block group"
      >
        {/* Question Title */}
        <h3 className="text-lg font-semibold text-white mb-3 group-hover:text-primary-light transition-colors line-clamp-2">
          {question.title}
        </h3>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-3">
          {question.tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-tag-bg text-tag-text hover:bg-tag-hover transition-colors"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Question Description Preview */}
        <p className="text-dark-text text-sm mb-4 line-clamp-3">
          {truncateDescription(question.description)}
        </p>

        {/* Question Meta Information */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Author Info */}
            <div className="flex items-center space-x-2">
              {question.author.avatar_url ? (
                <img 
                  src={question.author.avatar_url} 
                  alt={question.author.username}
                  className="w-6 h-6 rounded-full"
                />
              ) : (
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-white">
                    {question.author.username.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <span className="text-dark-muted text-sm font-medium">
                {question.author.username}
              </span>
            </div>

            {/* Creation Time */}
            <span className="text-dark-muted text-sm">
              {getTimeAgo(question.created_at)}
            </span>
          </div>

          {/* Answer Count Badge */}
          <div className="flex items-center space-x-2">
            <span 
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                question.answer_count > 0 
                  ? 'bg-success text-white' 
                  : 'bg-dark-accent text-dark-muted'
              }`}
            >
              {question.answer_count} {question.answer_count === 1 ? 'answer' : 'answers'}
            </span>
          </div>
        </div>
      </Link>
    </div>
  )
}

/**
 * QuestionCard Skeleton for loading states
 */
export function QuestionCardSkeleton() {
  return (
    <div className="bg-dark-card rounded-lg p-6 border border-dark-border animate-pulse">
      {/* Title skeleton */}
      <div className="h-6 bg-dark-hover rounded mb-3"></div>
      
      {/* Tags skeleton */}
      <div className="flex gap-2 mb-3">
        <div className="h-5 w-16 bg-dark-hover rounded-full"></div>
        <div className="h-5 w-20 bg-dark-hover rounded-full"></div>
        <div className="h-5 w-14 bg-dark-hover rounded-full"></div>
      </div>
      
      {/* Description skeleton */}
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-dark-hover rounded w-full"></div>
        <div className="h-4 bg-dark-hover rounded w-3/4"></div>
        <div className="h-4 bg-dark-hover rounded w-1/2"></div>
      </div>
      
      {/* Meta info skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-dark-hover rounded-full"></div>
            <div className="h-4 w-20 bg-dark-hover rounded"></div>
          </div>
          <div className="h-4 w-16 bg-dark-hover rounded"></div>
        </div>
        <div className="h-5 w-16 bg-dark-hover rounded-full"></div>
      </div>
    </div>
  )
}

/**
 * Empty state component for when no questions are found
 */
export function EmptyQuestionState({ 
  message = "No questions found",
  showAskButton = true 
}: { 
  message?: string
  showAskButton?: boolean 
}) {
  return (
    <div className="bg-dark-card rounded-lg p-12 border border-dark-border text-center">
      <div className="max-w-md mx-auto">
        <div className="w-16 h-16 mx-auto mb-4 bg-dark-accent rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-dark-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">{message}</h3>
        <p className="text-dark-text mb-6">
          {showAskButton 
            ? "Be the first to ask a question and help build the community!"
            : "Try adjusting your search or filters to find what you're looking for."
          }
        </p>
        {showAskButton && (
          <Link
            href="/ask"
            className="inline-flex items-center px-6 py-3 bg-primary hover:bg-primary-hover text-white font-medium rounded-lg transition-colors"
          >
            Ask First Question
          </Link>
        )}
      </div>
    </div>
  )
} 