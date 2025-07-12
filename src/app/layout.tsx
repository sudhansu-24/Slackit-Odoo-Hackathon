import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/ui/Navbar'

/**
 * Inter font configuration for optimal loading
 */
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
})

/**
 * Comprehensive metadata configuration for SlackIt Q&A platform
 */
export const metadata: Metadata = {
  title: 'SlackIt - Q&A Platform',
  description: 'A modern Q&A platform for developers and tech enthusiasts.',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/icon-192x192.png',
  },
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#1F2937',
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
        {/* Navigation Bar */}
        <Navbar />
        
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