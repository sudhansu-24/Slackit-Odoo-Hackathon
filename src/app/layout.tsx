import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

/**
 * Inter font configuration for optimal loading
 */
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
})

/**
 * Simplified metadata configuration for SlackIt Q&A platform
 */
export const metadata: Metadata = {
  title: 'SlackIt - Q&A Platform',
  description: 'A modern Q&A platform for developers and tech enthusiasts.',
}

/**
 * Simplified root layout component for SlackIt Q&A platform
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} font-sans antialiased`}>
        {/* Temporary simple navbar */}
        <nav className="bg-dark-card border-b border-dark-border p-4">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-white text-xl font-bold">SlackIt</h1>
          </div>
        </nav>
        
        {/* Main Content Area */}
        <main className="min-h-screen bg-dark-bg">
          {children}
        </main>
        
        {/* Simple Footer */}
        <footer className="bg-dark-card border-t border-dark-border">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <p className="text-dark-text text-sm text-center">
              © {new Date().getFullYear()} SlackIt. All rights reserved.
            </p>
          </div>
        </footer>
      </body>
    </html>
  )
} 