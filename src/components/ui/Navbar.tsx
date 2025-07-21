'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Bell, Search, User, Menu, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { getCurrentUserProfile } from '@/lib/api'
import { Profile } from '@/types/database'
import { logAuth, logInfo } from '@/lib/client-logger'

/**
 * Navigation bar component for SlackIt Q&A platform
 * Matches the exact mockup design with dark theme
 * Includes responsive mobile menu with hamburger
 */
export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()

  useEffect(() => {
    /**
     * Load user profile on component mount
     * Sets up authentication state management
     */
    const loadUser = async () => {
      try {
        logAuth('Loading user profile for navbar')
        const profile = await getCurrentUserProfile()
        setUser(profile)
        logAuth('User profile loaded for navbar', { hasUser: !!profile })
      } catch (_error) {
        logAuth('Error loading user profile for navbar')
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        logAuth('Auth state changed in navbar', { event, hasSession: !!session })
        if (event === 'SIGNED_IN') {
          const profile = await getCurrentUserProfile()
          setUser(profile)
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  /**
   * Handle user logout
   */
  const handleLogout = async () => {
    try {
      logAuth('User logging out from navbar')
      await supabase.auth.signOut()
      setUser(null)
      router.push('/')
      logAuth('User successfully logged out')
    } catch (_error) {
      logAuth('Error during logout')
    }
  }

  /**
   * Handle search form submission
   */
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      logInfo('Search initiated from navbar', { searchTerm })
      router.push(`/?search=${encodeURIComponent(searchTerm.trim())}`)
    }
  }

  /**
   * Toggle mobile menu
   */
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
    logInfo('Mobile menu toggled', { isOpen: !isMenuOpen })
  }

  return (
    <nav className="bg-dark-bg border-b border-dark-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-white hover:text-primary-light transition-colors">
              SlackIt
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-80 px-4 py-2 pl-10 bg-dark-card text-dark-text rounded-lg border border-dark-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-dark-muted" />
            </form>

            {/* Ask Question Button */}
            <Link
              href="/ask"
              className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Ask Question
            </Link>

            {/* User Menu */}
            {isLoading ? (
              <div className="w-8 h-8 bg-dark-card rounded-full animate-pulse"></div>
            ) : user ? (
              <div className="flex items-center space-x-4">
                {/* Notification Bell */}
                <button className="relative p-2 text-dark-text hover:text-white transition-colors">
                  <Bell className="h-5 w-5" />
                  {/* Notification badge - placeholder for future implementation */}
                  <span className="absolute -top-1 -right-1 bg-error h-2 w-2 rounded-full"></span>
                </button>

                {/* User Avatar */}
                <div className="relative group">
                  <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-dark-hover transition-colors">
                    {user.avatar_url ? (
                      <img 
                        src={user.avatar_url} 
                        alt={user.username}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-white" />
                      </div>
                    )}
                    <span className="text-dark-text font-medium">{user.username}</span>
                  </button>
                  
                  {/* User Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-dark-card rounded-lg shadow-dark-lg border border-dark-border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="py-1">
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-dark-text hover:bg-dark-hover hover:text-white transition-colors"
                      >
                        Profile
                      </Link>
                      <Link
                        href="/my-questions"
                        className="block px-4 py-2 text-dark-text hover:bg-dark-hover hover:text-white transition-colors"
                      >
                        My Questions
                      </Link>
                      <Link
                        href="/my-answers"
                        className="block px-4 py-2 text-dark-text hover:bg-dark-hover hover:text-white transition-colors"
                      >
                        My Answers
                      </Link>
                      <hr className="my-1 border-dark-border" />
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-dark-text hover:bg-dark-hover hover:text-white transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/auth/login"
                  className="text-dark-text hover:text-white transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-dark-text hover:text-white transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-dark-card border-t border-dark-border">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="relative mb-4">
              <input
                type="text"
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 pl-10 bg-dark-bg text-dark-text rounded-lg border border-dark-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-dark-muted" />
            </form>

            {/* Mobile Navigation Links */}
            <Link
              href="/ask"
              className="block px-3 py-2 text-white bg-primary hover:bg-primary-hover rounded-lg font-medium transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Ask Question
            </Link>

            {user ? (
              <>
                <Link
                  href="/profile"
                  className="block px-3 py-2 text-dark-text hover:text-white transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
                <Link
                  href="/my-questions"
                  className="block px-3 py-2 text-dark-text hover:text-white transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Questions
                </Link>
                <Link
                  href="/my-answers"
                  className="block px-3 py-2 text-dark-text hover:text-white transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Answers
                </Link>
                <button
                  onClick={() => {
                    handleLogout()
                    setIsMenuOpen(false)
                  }}
                  className="block w-full text-left px-3 py-2 text-dark-text hover:text-white transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="block px-3 py-2 text-dark-text hover:text-white transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="block px-3 py-2 text-dark-text hover:text-white transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
} 