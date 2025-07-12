'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Mail, MailOpen, Tag, Calendar, User, MessageCircle } from 'lucide-react'

/**
 * Question Detail Page (Screen 3) for SlackIt Q&A platform
 * Shows a question with answers and voting system using mail-like icons
 */

// Mock data for demonstration
const mockQuestion = {
  id: '1',
  title: 'How to implement user authentication in Next.js 13 with app router?',
  description: `I'm trying to implement user authentication in a Next.js 13 application using the new app router. I've looked at various tutorials but most of them are for the pages router.

What I've tried:
- NextAuth.js with the pages router setup (didn't work)
- Custom authentication with cookies (having issues with middleware)
- Firebase Auth (works but seems overkill for my simple app)

What I need:
- Simple email/password authentication
- Protected routes
- Session management
- Login/logout functionality

Can someone provide a working example or guide me in the right direction?`,
  tags: ['next.js', 'authentication', 'app-router', 'react'],
  author: {
    username: 'johndoe',
    avatar: null
  },
  votes: 15,
  userVote: null, // null, 'up', or 'down'
  answers: 3,
  views: 247,
  createdAt: '2024-01-15T10:30:00Z'
}

const mockAnswers = [
  {
    id: '1',
    content: `You can use NextAuth.js with the app router. Here's a working setup:

First, install NextAuth.js:
\`\`\`bash
npm install next-auth
\`\`\`

Then create \`app/api/auth/[...nextauth]/route.ts\`:
\`\`\`typescript
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Add your authentication logic here
        if (credentials?.email === "user@example.com" && credentials?.password === "password") {
          return { id: "1", name: "User", email: "user@example.com" }
        }
        return null
      }
    })
  ]
})

export { handler as GET, handler as POST }
\`\`\`

This should work with the app router!`,
    author: {
      username: 'nextjsdev',
      avatar: null
    },
    votes: 8,
    userVote: 'up',
    isAccepted: true,
    createdAt: '2024-01-15T11:45:00Z'
  },
  {
    id: '2',
    content: `Another approach is to use Clerk, which has excellent Next.js 13 app router support:

\`\`\`bash
npm install @clerk/nextjs
\`\`\`

Then wrap your app in \`app/layout.tsx\`:
\`\`\`typescript
import { ClerkProvider } from '@clerk/nextjs'

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}
\`\`\`

Clerk handles everything automatically and has great documentation for the app router.`,
    author: {
      username: 'clerkfan',
      avatar: null
    },
    votes: 5,
    userVote: null,
    isAccepted: false,
    createdAt: '2024-01-15T14:20:00Z'
  }
]

export default function QuestionDetailPage({ params }: { params: { id: string } }) {
  const [question] = useState(mockQuestion)
  const [answers] = useState(mockAnswers)
  const [newAnswer, setNewAnswer] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [questionVote, setQuestionVote] = useState(question.userVote)
  const [answerVotes, setAnswerVotes] = useState(
    answers.reduce((acc, answer) => ({ ...acc, [answer.id]: answer.userVote }), {})
  )

  /**
   * Handle voting on question or answer
   */
  const handleVote = (type: 'question' | 'answer', id: string, voteType: 'up' | 'down') => {
    if (type === 'question') {
      setQuestionVote(questionVote === voteType ? null : voteType)
    } else {
      setAnswerVotes(prev => ({
        ...prev,
        [id]: prev[id] === voteType ? null : voteType
      }))
    }
  }

  /**
   * Handle submitting a new answer
   */
  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate answer submission
    setTimeout(() => {
      setIsSubmitting(false)
      setNewAnswer('')
      alert('Answer submitted successfully! (This is a demo)')
    }, 2000)
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
                onClick={() => handleVote('question', question.id, 'up')}
                className={`p-2 rounded transition-colors ${
                  questionVote === 'up' 
                    ? 'bg-green-600 text-white' 
                    : 'text-gray-400 hover:text-green-500 hover:bg-gray-700'
                }`}
              >
                <MailOpen className="h-5 w-5" />
              </button>
              <span className="text-lg font-semibold">{question.votes}</span>
              <button
                onClick={() => handleVote('question', question.id, 'down')}
                className={`p-2 rounded transition-colors ${
                  questionVote === 'down' 
                    ? 'bg-red-600 text-white' 
                    : 'text-gray-400 hover:text-red-500 hover:bg-gray-700'
                }`}
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
                    <span>{formatDate(question.createdAt)}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span>{question.views} views</span>
                  <span>{question.answers} answers</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Answers */}
        <div className="space-y-6 mb-8">
          <h2 className="text-xl font-semibold text-white">{answers.length} Answers</h2>
          
          {answers.map((answer) => (
            <div key={answer.id} className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <div className="flex items-start space-x-4">
                {/* Voting */}
                <div className="flex flex-col items-center space-y-2">
                  <button
                    onClick={() => handleVote('answer', answer.id, 'up')}
                    className={`p-2 rounded transition-colors ${
                      answerVotes[answer.id] === 'up' 
                        ? 'bg-green-600 text-white' 
                        : 'text-gray-400 hover:text-green-500 hover:bg-gray-700'
                    }`}
                  >
                    <MailOpen className="h-5 w-5" />
                  </button>
                  <span className="text-lg font-semibold">{answer.votes}</span>
                  <button
                    onClick={() => handleVote('answer', answer.id, 'down')}
                    className={`p-2 rounded transition-colors ${
                      answerVotes[answer.id] === 'down' 
                        ? 'bg-red-600 text-white' 
                        : 'text-gray-400 hover:text-red-500 hover:bg-gray-700'
                    }`}
                  >
                    <Mail className="h-5 w-5" />
                  </button>
                  {answer.isAccepted && (
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
                        <span>{formatDate(answer.createdAt)}</span>
                      </div>
                    </div>
                    {answer.isAccepted && (
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
              onChange={(e) => setNewAnswer(e.target.value)}
              placeholder="Write your answer here..."
              rows={6}
              className="w-full px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
              required
            />
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