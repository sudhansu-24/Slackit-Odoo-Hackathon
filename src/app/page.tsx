'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import FilterBar from '@/components/ui/FilterBar'
import QuestionCard, { QuestionCardSkeleton, EmptyQuestionState } from '@/components/ui/QuestionCard'
import Pagination from '@/components/ui/Pagination'
import AuthTest from '@/components/auth/AuthTest'
import { getQuestions } from '@/lib/api'
import { QuestionWithAuthor } from '@/types/database'
import { logInfo, logError } from '@/lib/client-logger'

/**
 * Home page component for StackIt Q&A platform (Screen 1)
 * Matches the exact mockup design with filter bar, question cards, and pagination
 * Features: "User can see questions without login"
 */
export default function HomePage() {
  // State management
  const [questions, setQuestions] = useState<QuestionWithAuthor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [currentFilter, setCurrentFilter] = useState<'newest' | 'unanswered' | 'popular' | 'all'>('newest')
  const [searchTerm, setSearchTerm] = useState('')
  
  // URL search params
  const searchParams = useSearchParams()
  
  // Constants
  const QUESTIONS_PER_PAGE = 10

  useEffect(() => {
    /**
     * Initialize filters from URL parameters
     */
    const initializeFromURL = () => {
      const urlSearch = searchParams.get('search')
      const urlFilter = searchParams.get('filter')
      const urlPage = searchParams.get('page')
      
      if (urlSearch) {
        setSearchTerm(urlSearch)
      }
      
      if (urlFilter && ['newest', 'unanswered', 'popular', 'all'].includes(urlFilter)) {
        setCurrentFilter(urlFilter as typeof currentFilter)
      }
      
      if (urlPage) {
        const pageNum = parseInt(urlPage)
        if (pageNum > 0) {
          setCurrentPage(pageNum)
        }
      }
      
      logInfo('Home page initialized with URL parameters', {
        search: urlSearch,
        filter: urlFilter,
        page: urlPage
      })
    }
    
    initializeFromURL()
  }, [searchParams])

  useEffect(() => {
    /**
     * Fetch questions when filters change
     */
    const fetchQuestions = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        logInfo('Fetching questions for home page', {
          page: currentPage,
          filter: currentFilter,
          search: searchTerm
        })
        
        const result = await getQuestions(
          currentPage,
          QUESTIONS_PER_PAGE,
          currentFilter,
          searchTerm
        )
        
        setQuestions(result.data)
        setTotalPages(result.total_pages)
        setTotalCount(result.count)
        
        logInfo('Questions fetched successfully for home page', {
          count: result.data.length,
          totalCount: result.count,
          totalPages: result.total_pages
        })
        
      } catch (err) {
        const error = err as Error
        logError('Failed to fetch questions for home page', error)
        setError('Failed to load questions. Please try again.')
        setQuestions([])
        setTotalPages(1)
        setTotalCount(0)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchQuestions()
  }, [currentPage, currentFilter, searchTerm])

  /**
   * Handle filter changes
   */
  const handleFilterChange = (filter: typeof currentFilter) => {
    setCurrentFilter(filter)
    setCurrentPage(1) // Reset to first page when filter changes
    
    // Update URL without causing page refresh
    const url = new URL(window.location.href)
    url.searchParams.set('filter', filter)
    url.searchParams.set('page', '1')
    window.history.pushState({}, '', url.toString())
    
    logInfo('Filter changed on home page', { filter, resetPage: true })
  }

  /**
   * Handle search changes
   */
  const handleSearchChange = (search: string) => {
    setSearchTerm(search)
    setCurrentPage(1) // Reset to first page when search changes
    
    // Update URL without causing page refresh
    const url = new URL(window.location.href)
    if (search) {
      url.searchParams.set('search', search)
    } else {
      url.searchParams.delete('search')
    }
    url.searchParams.set('page', '1')
    window.history.pushState({}, '', url.toString())
    
    logInfo('Search changed on home page', { search, resetPage: true })
  }

  /**
   * Handle page changes
   */
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    
    // Update URL without causing page refresh
    const url = new URL(window.location.href)
    url.searchParams.set('page', page.toString())
    window.history.pushState({}, '', url.toString())
    
    // Scroll to top of questions list
    const mainContent = document.getElementById('main-content')
    if (mainContent) {
      mainContent.scrollIntoView({ behavior: 'smooth' })
    }
    
    logInfo('Page changed on home page', { page })
  }

  /**
   * Render error state
   */
  if (error) {
    return (
      <div className="min-h-screen bg-dark-bg">
        <FilterBar
          onFilterChange={handleFilterChange}
          onSearchChange={handleSearchChange}
          currentFilter={currentFilter}
          searchTerm={searchTerm}
        />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-dark-card rounded-lg p-8 border border-dark-border text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-error/10 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Oops! Something went wrong</h2>
            <p className="text-dark-text mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Filter Bar - Matches mockup exactly */}
      <FilterBar
        onFilterChange={handleFilterChange}
        onSearchChange={handleSearchChange}
        currentFilter={currentFilter}
        searchTerm={searchTerm}
      />
      
      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">
                {searchTerm ? (
                  <>Search Results for "{searchTerm}"</>
                ) : (
                  <>
                    {currentFilter === 'newest' && 'Newest Questions'}
                    {currentFilter === 'unanswered' && 'Unanswered Questions'}
                    {currentFilter === 'popular' && 'Popular Questions'}
                    {currentFilter === 'all' && 'All Questions'}
                  </>
                )}
              </h1>
              <p className="text-dark-text">
                {isLoading ? (
                  'Loading questions...'
                ) : (
                  `${totalCount} question${totalCount !== 1 ? 's' : ''} found`
                )}
              </p>
            </div>
            
            {/* Quick Stats */}
            {!isLoading && questions.length > 0 && (
              <div className="flex items-center space-x-4 mt-4 sm:mt-0">
                <div className="text-center">
                  <div className="text-lg font-semibold text-white">{totalCount}</div>
                  <div className="text-xs text-dark-muted">Questions</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-white">
                    {questions.reduce((acc, q) => acc + q.answer_count, 0)}
                  </div>
                  <div className="text-xs text-dark-muted">Answers</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-6">
          {isLoading ? (
            // Loading skeletons
            <>
              {Array.from({ length: 5 }).map((_, index) => (
                <QuestionCardSkeleton key={index} />
              ))}
            </>
          ) : questions.length === 0 ? (
            // Empty state
            <EmptyQuestionState 
              message={searchTerm ? `No questions found for "${searchTerm}"` : "No questions found"}
              showAskButton={!searchTerm}
            />
          ) : (
            // Questions list
            <>
              {questions.map((question) => (
                <QuestionCard 
                  key={question.id} 
                  question={question} 
                />
              ))}
            </>
          )}
        </div>

        {/* Pagination - Matches mockup exactly */}
        {!isLoading && questions.length > 0 && totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            maxVisiblePages={7}
          />
        )}

        {/* Authentication Test Component - For debugging only */}
        <div className="mt-12 mb-8">
          <AuthTest />
        </div>
      </div>
    </div>
  )
}

/**
 * Loading component for suspense boundary
 */
export function HomePageLoading() {
  return (
    <div className="min-h-screen bg-dark-bg">
      <div className="bg-dark-card border-b border-dark-border p-4 animate-pulse">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-10 w-32 bg-dark-hover rounded-lg"></div>
              <div className="h-10 w-20 bg-dark-hover rounded-lg"></div>
              <div className="h-10 w-24 bg-dark-hover rounded-lg"></div>
            </div>
            <div className="h-10 w-80 bg-dark-hover rounded-lg"></div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {Array.from({ length: 5 }).map((_, index) => (
            <QuestionCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </div>
  )
} 