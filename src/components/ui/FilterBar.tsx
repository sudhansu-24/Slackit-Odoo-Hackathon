'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, ChevronDown, Filter, Tags, Clock, MessageCircle } from 'lucide-react'
import { logInfo } from '@/lib/client-logger'

/**
 * FilterBar component for StackIt home page
 * Matches the exact mockup layout: Ask New Question, Newest, Unanswered, more, Search
 */
interface FilterBarProps {
  onFilterChange: (filter: 'newest' | 'unanswered' | 'popular' | 'all') => void
  onSearchChange: (searchTerm: string) => void
  currentFilter: 'newest' | 'unanswered' | 'popular' | 'all'
  searchTerm: string
}

export default function FilterBar({
  onFilterChange,
  onSearchChange,
  currentFilter,
  searchTerm
}: FilterBarProps) {
  const [isMoreDropdownOpen, setIsMoreDropdownOpen] = useState(false)
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm)

  /**
   * Handle filter selection
   */
  const handleFilterClick = (filter: 'newest' | 'unanswered' | 'popular' | 'all') => {
    onFilterChange(filter)
    setIsMoreDropdownOpen(false)
    logInfo('Filter changed in filter bar', { filter })
  }

  /**
   * Handle search form submission
   */
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearchChange(localSearchTerm)
    logInfo('Search submitted from filter bar', { searchTerm: localSearchTerm })
  }

  /**
   * Handle search input changes
   */
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearchTerm(e.target.value)
    // Trigger search on empty string to clear search
    if (e.target.value === '') {
      onSearchChange('')
    }
  }

  /**
   * Toggle more dropdown
   */
  const toggleMoreDropdown = () => {
    setIsMoreDropdownOpen(!isMoreDropdownOpen)
    logInfo('More dropdown toggled in filter bar', { isOpen: !isMoreDropdownOpen })
  }

  return (
    <div className="bg-dark-card border-b border-dark-border p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          {/* Left side - Ask Question Button and Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            {/* Ask New Question Button */}
            <Link
              href="/ask"
              className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center justify-center"
            >
              <span className="mr-2">+</span>
              Ask New Question
            </Link>

            {/* Filter Buttons */}
            <div className="flex items-center space-x-2">
              {/* Newest Filter */}
              <button
                onClick={() => handleFilterClick('newest')}
                className={`px-3 py-2 rounded-lg font-medium transition-colors flex items-center space-x-1 ${
                  currentFilter === 'newest'
                    ? 'bg-primary text-white'
                    : 'bg-dark-bg text-dark-text hover:bg-dark-hover hover:text-white'
                }`}
              >
                <Clock className="h-4 w-4" />
                <span>Newest</span>
                <ChevronDown className="h-3 w-3" />
              </button>

              {/* Unanswered Filter */}
              <button
                onClick={() => handleFilterClick('unanswered')}
                className={`px-3 py-2 rounded-lg font-medium transition-colors flex items-center space-x-1 ${
                  currentFilter === 'unanswered'
                    ? 'bg-primary text-white'
                    : 'bg-dark-bg text-dark-text hover:bg-dark-hover hover:text-white'
                }`}
              >
                <MessageCircle className="h-4 w-4" />
                <span>Unanswered</span>
                <ChevronDown className="h-3 w-3" />
              </button>

              {/* More Dropdown */}
              <div className="relative">
                <button
                  onClick={toggleMoreDropdown}
                  className="px-3 py-2 rounded-lg font-medium transition-colors flex items-center space-x-1 bg-dark-bg text-dark-text hover:bg-dark-hover hover:text-white"
                >
                  <Filter className="h-4 w-4" />
                  <span>More</span>
                  <ChevronDown className={`h-3 w-3 transition-transform ${isMoreDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* More Dropdown Menu */}
                {isMoreDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-dark-card rounded-lg shadow-dark-lg border border-dark-border z-10">
                    <div className="py-1">
                      <button
                        onClick={() => handleFilterClick('popular')}
                        className={`w-full text-left px-4 py-2 hover:bg-dark-hover transition-colors flex items-center space-x-2 ${
                          currentFilter === 'popular' ? 'text-primary' : 'text-dark-text'
                        }`}
                      >
                        <Tags className="h-4 w-4" />
                        <span>Popular</span>
                      </button>
                      <button
                        onClick={() => handleFilterClick('all')}
                        className={`w-full text-left px-4 py-2 hover:bg-dark-hover transition-colors flex items-center space-x-2 ${
                          currentFilter === 'all' ? 'text-primary' : 'text-dark-text'
                        }`}
                      >
                        <Filter className="h-4 w-4" />
                        <span>All Questions</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right side - Search Bar */}
          <div className="flex-shrink-0">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search questions..."
                value={localSearchTerm}
                onChange={handleSearchChange}
                className="w-full md:w-80 px-4 py-2 pl-10 bg-dark-bg text-dark-text rounded-lg border border-dark-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-dark-muted" />
              <button
                type="submit"
                className="absolute right-2 top-1.5 p-1 text-dark-muted hover:text-primary transition-colors"
              >
                🔍
              </button>
            </form>
          </div>
        </div>

        {/* Mobile Filter Row */}
        <div className="md:hidden mt-4">
          <div className="flex items-center space-x-2 overflow-x-auto">
            <button
              onClick={() => handleFilterClick('newest')}
              className={`px-3 py-2 rounded-lg font-medium transition-colors flex items-center space-x-1 whitespace-nowrap ${
                currentFilter === 'newest'
                  ? 'bg-primary text-white'
                  : 'bg-dark-bg text-dark-text hover:bg-dark-hover hover:text-white'
              }`}
            >
              <Clock className="h-4 w-4" />
              <span>Newest</span>
              <ChevronDown className="h-3 w-3" />
            </button>

            <button
              onClick={() => handleFilterClick('unanswered')}
              className={`px-3 py-2 rounded-lg font-medium transition-colors flex items-center space-x-1 whitespace-nowrap ${
                currentFilter === 'unanswered'
                  ? 'bg-primary text-white'
                  : 'bg-dark-bg text-dark-text hover:bg-dark-hover hover:text-white'
              }`}
            >
              <MessageCircle className="h-4 w-4" />
              <span>Unanswered</span>
              <ChevronDown className="h-3 w-3" />
            </button>

            <div className="relative">
              <button
                onClick={toggleMoreDropdown}
                className="px-3 py-2 rounded-lg font-medium transition-colors flex items-center space-x-1 whitespace-nowrap bg-dark-bg text-dark-text hover:bg-dark-hover hover:text-white"
              >
                <Filter className="h-4 w-4" />
                <span>More</span>
                <ChevronDown className={`h-3 w-3 transition-transform ${isMoreDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Mobile More Dropdown */}
              {isMoreDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-dark-card rounded-lg shadow-dark-lg border border-dark-border z-10">
                  <div className="py-1">
                    <button
                      onClick={() => handleFilterClick('popular')}
                      className={`w-full text-left px-4 py-2 hover:bg-dark-hover transition-colors flex items-center space-x-2 ${
                        currentFilter === 'popular' ? 'text-primary' : 'text-dark-text'
                      }`}
                    >
                      <Tags className="h-4 w-4" />
                      <span>Popular</span>
                    </button>
                    <button
                      onClick={() => handleFilterClick('all')}
                      className={`w-full text-left px-4 py-2 hover:bg-dark-hover transition-colors flex items-center space-x-2 ${
                        currentFilter === 'all' ? 'text-primary' : 'text-dark-text'
                      }`}
                    >
                      <Filter className="h-4 w-4" />
                      <span>All Questions</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Simplified FilterBar for mobile-first design
 */
export function MobileFilterBar({
  onFilterChange,
  onSearchChange,
  currentFilter,
  searchTerm
}: FilterBarProps) {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm)

  const handleFilterClick = (filter: 'newest' | 'unanswered' | 'popular' | 'all') => {
    onFilterChange(filter)
    logInfo('Mobile filter changed', { filter })
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearchChange(localSearchTerm)
    logInfo('Mobile search submitted', { searchTerm: localSearchTerm })
  }

  return (
    <div className="bg-dark-card border-b border-dark-border p-4 space-y-4">
      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <input
          type="text"
          placeholder="Search questions..."
          value={localSearchTerm}
          onChange={(e) => setLocalSearchTerm(e.target.value)}
          className="w-full px-4 py-2 pl-10 bg-dark-bg text-dark-text rounded-lg border border-dark-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-dark-muted" />
      </form>

      {/* Filter Buttons */}
      <div className="flex items-center space-x-2 overflow-x-auto">
        <button
          onClick={() => handleFilterClick('newest')}
          className={`px-3 py-2 rounded-lg font-medium transition-colors flex items-center space-x-1 whitespace-nowrap ${
            currentFilter === 'newest'
              ? 'bg-primary text-white'
              : 'bg-dark-bg text-dark-text hover:bg-dark-hover hover:text-white'
          }`}
        >
          <span>Newest</span>
          <ChevronDown className="h-3 w-3" />
        </button>

        <button
          onClick={() => handleFilterClick('unanswered')}
          className={`px-3 py-2 rounded-lg font-medium transition-colors flex items-center space-x-1 whitespace-nowrap ${
            currentFilter === 'unanswered'
              ? 'bg-primary text-white'
              : 'bg-dark-bg text-dark-text hover:bg-dark-hover hover:text-white'
          }`}
        >
          <span>Unanswered</span>
          <ChevronDown className="h-3 w-3" />
        </button>

        <button
          onClick={() => handleFilterClick('popular')}
          className={`px-3 py-2 rounded-lg font-medium transition-colors flex items-center space-x-1 whitespace-nowrap ${
            currentFilter === 'popular'
              ? 'bg-primary text-white'
              : 'bg-dark-bg text-dark-text hover:bg-dark-hover hover:text-white'
          }`}
        >
          <span>Popular</span>
          <ChevronDown className="h-3 w-3" />
        </button>
      </div>

      {/* Ask Question Button */}
      <Link
        href="/ask"
        className="w-full bg-primary hover:bg-primary-hover text-white px-4 py-3 rounded-lg font-medium transition-colors inline-flex items-center justify-center"
      >
        <span className="mr-2">+</span>
        Ask New Question
      </Link>
    </div>
  )
} 