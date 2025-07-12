'use client'

import { useState, useEffect } from 'react'
import { Mail, MailCheck } from 'lucide-react'
import { vote, getUserVote } from '@/lib/api'
import { VoteFormData, Vote } from '@/types/database'
import { logInfo, logAuth } from '@/lib/client-logger'

/**
 * VotingButtons component with mail-like icons
 * Matches the exact mockup requirement for mail-like voting icons (not arrows)
 */
interface VotingButtonsProps {
  targetId: string
  targetType: 'question' | 'answer'
  currentVotes: number
  isAuthenticated: boolean
  onVoteChange?: (newVoteCount: number) => void
}

export default function VotingButtons({
  targetId,
  targetType,
  currentVotes,
  isAuthenticated,
  onVoteChange
}: VotingButtonsProps) {
  const [userVote, setUserVote] = useState<Vote | null>(null)
  const [voteCount, setVoteCount] = useState(currentVotes)
  const [isLoading, setIsLoading] = useState(false)
  const [showLoginMessage, setShowLoginMessage] = useState(false)

  useEffect(() => {
    /**
     * Load user's existing vote on component mount
     */
    const loadUserVote = async () => {
      if (!isAuthenticated) return
      
      try {
        const vote = await getUserVote(targetId, targetType)
        setUserVote(vote)
        logInfo('User vote loaded for voting buttons', { 
          targetId, 
          targetType, 
          hasVote: !!vote 
        })
      } catch (error) {
        logInfo('Error loading user vote for voting buttons')
      }
    }

    loadUserVote()
  }, [targetId, targetType, isAuthenticated])

  /**
   * Handle vote submission
   */
  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    if (!isAuthenticated) {
      setShowLoginMessage(true)
      setTimeout(() => setShowLoginMessage(false), 3000)
      logAuth('Unauthenticated user attempted to vote')
      return
    }

    setIsLoading(true)
    
    try {
      const voteData: VoteFormData = {
        target_id: targetId,
        target_type: targetType,
        vote_type: voteType
      }

      const success = await vote(voteData)
      
      if (success) {
        // Calculate new vote count
        let newVoteCount = voteCount
        
        if (userVote) {
          // User already voted, so we're changing their vote
          const oldVoteValue = userVote.vote_type === 'upvote' ? 1 : -1
          const newVoteValue = voteType === 'upvote' ? 1 : -1
          newVoteCount = voteCount - oldVoteValue + newVoteValue
        } else {
          // User is voting for the first time
          newVoteCount = voteCount + (voteType === 'upvote' ? 1 : -1)
        }

        // Update local state
        setVoteCount(newVoteCount)
        setUserVote({
          id: userVote?.id || '',
          user_id: '',
          target_id: targetId,
          target_type: targetType,
          vote_type: voteType,
          created_at: new Date().toISOString()
        })

        // Notify parent component
        onVoteChange?.(newVoteCount)

        logInfo('Vote submitted successfully', { 
          targetId, 
          targetType, 
          voteType, 
          newVoteCount 
        })
      } else {
        logInfo('Vote submission failed', { targetId, targetType, voteType })
      }
    } catch (error) {
      logInfo('Error submitting vote', { targetId, targetType, voteType })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center space-y-2">
      {/* Upvote Button */}
      <button
        onClick={() => handleVote('upvote')}
        disabled={isLoading}
        className={`p-2 rounded-lg transition-all duration-200 ${
          userVote?.vote_type === 'upvote'
            ? 'bg-upvote text-white'
            : 'bg-dark-card text-dark-muted hover:bg-dark-hover hover:text-upvote'
        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        title={isAuthenticated ? 'Upvote' : 'Login to vote'}
      >
        {userVote?.vote_type === 'upvote' ? (
          <MailCheck className="h-5 w-5" />
        ) : (
          <Mail className="h-5 w-5" />
        )}
      </button>

      {/* Vote Count */}
      <span className={`text-sm font-medium ${
        voteCount > 0 
          ? 'text-upvote' 
          : voteCount < 0 
            ? 'text-downvote' 
            : 'text-dark-text'
      }`}>
        {voteCount}
      </span>

      {/* Downvote Button */}
      <button
        onClick={() => handleVote('downvote')}
        disabled={isLoading}
        className={`p-2 rounded-lg transition-all duration-200 ${
          userVote?.vote_type === 'downvote'
            ? 'bg-downvote text-white'
            : 'bg-dark-card text-dark-muted hover:bg-dark-hover hover:text-downvote'
        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        title={isAuthenticated ? 'Downvote' : 'Login to vote'}
      >
        {userVote?.vote_type === 'downvote' ? (
          <MailCheck className="h-5 w-5 rotate-180" />
        ) : (
          <Mail className="h-5 w-5 rotate-180" />
        )}
      </button>

      {/* Login Message */}
      {showLoginMessage && (
        <div className="absolute mt-20 bg-dark-card border border-dark-border rounded-lg p-3 shadow-dark-lg z-10">
          <p className="text-dark-text text-sm">
            Please log in to vote
          </p>
        </div>
      )}
    </div>
  )
}

/**
 * Voting display component for showing vote counts without interaction
 */
export function VoteDisplay({ 
  voteCount, 
  isAccepted = false 
}: { 
  voteCount: number
  isAccepted?: boolean 
}) {
  return (
    <div className="flex flex-col items-center space-y-2">
      {/* Upvote Icon */}
      <div className="p-2 rounded-lg bg-dark-card">
        <Mail className="h-5 w-5 text-dark-muted" />
      </div>

      {/* Vote Count */}
      <div className="flex flex-col items-center space-y-1">
        <span className={`text-sm font-medium ${
          voteCount > 0 
            ? 'text-upvote' 
            : voteCount < 0 
              ? 'text-downvote' 
              : 'text-dark-text'
        }`}>
          {voteCount}
        </span>
        
        {/* Accepted Answer Badge */}
        {isAccepted && (
          <div className="bg-success text-white px-2 py-1 rounded-full text-xs font-medium">
            ✓ Accepted
          </div>
        )}
      </div>

      {/* Downvote Icon */}
      <div className="p-2 rounded-lg bg-dark-card">
        <Mail className="h-5 w-5 text-dark-muted rotate-180" />
      </div>
    </div>
  )
}

/**
 * Compact voting component for smaller spaces
 */
export function CompactVotingButtons({
  targetId,
  targetType,
  currentVotes,
  isAuthenticated,
  onVoteChange
}: VotingButtonsProps) {
  const [userVote, setUserVote] = useState<Vote | null>(null)
  const [voteCount, setVoteCount] = useState(currentVotes)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const loadUserVote = async () => {
      if (!isAuthenticated) return
      
      try {
        const vote = await getUserVote(targetId, targetType)
        setUserVote(vote)
      } catch (error) {
        // Handle error silently
      }
    }

    loadUserVote()
  }, [targetId, targetType, isAuthenticated])

  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    if (!isAuthenticated) return

    setIsLoading(true)
    
    try {
      const voteData: VoteFormData = {
        target_id: targetId,
        target_type: targetType,
        vote_type: voteType
      }

      const success = await vote(voteData)
      
      if (success) {
        let newVoteCount = voteCount
        
        if (userVote) {
          const oldVoteValue = userVote.vote_type === 'upvote' ? 1 : -1
          const newVoteValue = voteType === 'upvote' ? 1 : -1
          newVoteCount = voteCount - oldVoteValue + newVoteValue
        } else {
          newVoteCount = voteCount + (voteType === 'upvote' ? 1 : -1)
        }

        setVoteCount(newVoteCount)
        setUserVote({
          id: userVote?.id || '',
          user_id: '',
          target_id: targetId,
          target_type: targetType,
          vote_type: voteType,
          created_at: new Date().toISOString()
        })

        onVoteChange?.(newVoteCount)
      }
    } catch (error) {
      // Handle error silently
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center space-x-2">
      {/* Upvote */}
      <button
        onClick={() => handleVote('upvote')}
        disabled={isLoading || !isAuthenticated}
        className={`p-1 rounded transition-colors ${
          userVote?.vote_type === 'upvote'
            ? 'text-upvote'
            : 'text-dark-muted hover:text-upvote'
        }`}
      >
        <Mail className="h-4 w-4" />
      </button>

      {/* Vote Count */}
      <span className={`text-sm font-medium ${
        voteCount > 0 
          ? 'text-upvote' 
          : voteCount < 0 
            ? 'text-downvote' 
            : 'text-dark-text'
      }`}>
        {voteCount}
      </span>

      {/* Downvote */}
      <button
        onClick={() => handleVote('downvote')}
        disabled={isLoading || !isAuthenticated}
        className={`p-1 rounded transition-colors ${
          userVote?.vote_type === 'downvote'
            ? 'text-downvote'
            : 'text-dark-muted hover:text-downvote'
        }`}
      >
        <Mail className="h-4 w-4 rotate-180" />
      </button>
    </div>
  )
} 