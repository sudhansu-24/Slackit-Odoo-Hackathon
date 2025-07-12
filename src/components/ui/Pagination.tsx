import { ChevronLeft, ChevronRight } from 'lucide-react'
import { logInfo } from '@/lib/client-logger'

/**
 * Pagination component for StackIt Q&A platform
 * Matches the exact mockup design with numbered pages and dark theme
 */
interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  maxVisiblePages?: number
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  maxVisiblePages = 7
}: PaginationProps) {
  /**
   * Handle page change with logging
   */
  const handlePageChange = (page: number) => {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      onPageChange(page)
      logInfo('Page changed in pagination', { currentPage, newPage: page, totalPages })
    }
  }

  /**
   * Generate array of page numbers to display
   */
  const getVisiblePages = () => {
    const pages: (number | string)[] = []
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Complex pagination logic
      const halfVisible = Math.floor(maxVisiblePages / 2)
      
      if (currentPage <= halfVisible) {
        // Show first pages
        for (let i = 1; i <= maxVisiblePages - 1; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      } else if (currentPage > totalPages - halfVisible) {
        // Show last pages
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - maxVisiblePages + 2; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        // Show middle pages
        pages.push(1)
        pages.push('...')
        for (let i = currentPage - halfVisible + 1; i <= currentPage + halfVisible - 1; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      }
    }
    
    return pages
  }

  if (totalPages <= 1) {
    return null
  }

  const visiblePages = getVisiblePages()

  return (
    <div className="flex items-center justify-center space-x-2 py-8">
      {/* Previous Button */}
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`flex items-center px-3 py-2 rounded-lg font-medium transition-colors ${
          currentPage === 1
            ? 'bg-dark-card text-dark-muted cursor-not-allowed'
            : 'bg-dark-card text-dark-text hover:bg-dark-hover hover:text-white'
        }`}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="ml-1 hidden sm:inline">Previous</span>
      </button>

      {/* Page Numbers */}
      {visiblePages.map((page, index) => (
        <div key={index}>
          {page === '...' ? (
            <span className="px-3 py-2 text-dark-muted">...</span>
          ) : (
            <button
              onClick={() => handlePageChange(page as number)}
              className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                currentPage === page
                  ? 'bg-primary text-white'
                  : 'bg-dark-card text-dark-text hover:bg-dark-hover hover:text-white'
              }`}
              aria-label={`Go to page ${page}`}
              aria-current={currentPage === page ? 'page' : undefined}
            >
              {page}
            </button>
          )}
        </div>
      ))}

      {/* Next Button */}
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`flex items-center px-3 py-2 rounded-lg font-medium transition-colors ${
          currentPage === totalPages
            ? 'bg-dark-card text-dark-muted cursor-not-allowed'
            : 'bg-dark-card text-dark-text hover:bg-dark-hover hover:text-white'
        }`}
        aria-label="Next page"
      >
        <span className="mr-1 hidden sm:inline">Next</span>
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  )
}

/**
 * Simplified pagination for mobile devices
 */
export function MobilePagination({
  currentPage,
  totalPages,
  onPageChange
}: PaginationProps) {
  const handlePageChange = (page: number) => {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      onPageChange(page)
      logInfo('Mobile page changed', { currentPage, newPage: page, totalPages })
    }
  }

  if (totalPages <= 1) {
    return null
  }

  return (
    <div className="flex items-center justify-between py-6">
      {/* Previous Button */}
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
          currentPage === 1
            ? 'bg-dark-card text-dark-muted cursor-not-allowed'
            : 'bg-dark-card text-dark-text hover:bg-dark-hover hover:text-white'
        }`}
      >
        <ChevronLeft className="h-4 w-4 mr-2" />
        Previous
      </button>

      {/* Page Info */}
      <div className="flex items-center space-x-2">
        <span className="text-dark-text text-sm">
          Page {currentPage} of {totalPages}
        </span>
      </div>

      {/* Next Button */}
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
          currentPage === totalPages
            ? 'bg-dark-card text-dark-muted cursor-not-allowed'
            : 'bg-dark-card text-dark-text hover:bg-dark-hover hover:text-white'
        }`}
      >
        Next
        <ChevronRight className="h-4 w-4 ml-2" />
      </button>
    </div>
  )
}

/**
 * Compact pagination for smaller spaces
 */
export function CompactPagination({
  currentPage,
  totalPages,
  onPageChange
}: PaginationProps) {
  const handlePageChange = (page: number) => {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      onPageChange(page)
      logInfo('Compact page changed', { currentPage, newPage: page, totalPages })
    }
  }

  if (totalPages <= 1) {
    return null
  }

  return (
    <div className="flex items-center justify-center space-x-1 py-4">
      {/* Previous */}
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`p-2 rounded-lg transition-colors ${
          currentPage === 1
            ? 'text-dark-muted cursor-not-allowed'
            : 'text-dark-text hover:bg-dark-hover hover:text-white'
        }`}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {/* Page Numbers - Show only current and adjacent */}
      {currentPage > 1 && (
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          className="px-3 py-2 rounded-lg text-dark-text hover:bg-dark-hover hover:text-white transition-colors"
        >
          {currentPage - 1}
        </button>
      )}

      {/* Current Page */}
      <button
        className="px-3 py-2 rounded-lg bg-primary text-white font-medium"
        aria-current="page"
      >
        {currentPage}
      </button>

      {/* Next Page */}
      {currentPage < totalPages && (
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          className="px-3 py-2 rounded-lg text-dark-text hover:bg-dark-hover hover:text-white transition-colors"
        >
          {currentPage + 1}
        </button>
      )}

      {/* Next */}
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`p-2 rounded-lg transition-colors ${
          currentPage === totalPages
            ? 'text-dark-muted cursor-not-allowed'
            : 'text-dark-text hover:bg-dark-hover hover:text-white'
        }`}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  )
}

/**
 * Pagination info component
 */
export function PaginationInfo({
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems
}: {
  currentPage: number
  totalPages: number
  itemsPerPage: number
  totalItems: number
}) {
  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  return (
    <div className="flex items-center justify-between py-4 text-sm text-dark-text">
      <span>
        Showing {startItem} to {endItem} of {totalItems} questions
      </span>
      <span>
        Page {currentPage} of {totalPages}
      </span>
    </div>
  )
} 