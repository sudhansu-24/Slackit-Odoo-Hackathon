import type { Config } from 'tailwindcss'

/**
 * Tailwind CSS configuration for StackIt Q&A platform
 * Custom dark theme matching the provided mockups exactly
 */
const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Custom color palette for dark theme
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        
        // StackIt specific dark theme colors
        dark: {
          bg: '#1a1a1a',        // Main background
          card: '#2d2d2d',      // Card backgrounds
          text: '#e5e5e5',      // Primary text
          muted: '#a0a0a0',     // Secondary text
          border: '#404040',    // Border color
          hover: '#3a3a3a',     // Hover states
          accent: '#4a4a4a',    // Accent elements
        },
        
        // Button and interactive elements
        primary: {
          DEFAULT: '#2563eb',   // Blue primary
          hover: '#1d4ed8',     // Darker blue hover
          light: '#3b82f6',     // Light blue
        },
        
        // Status colors
        success: '#10b981',     // Green for success
        warning: '#f59e0b',     // Yellow for warnings
        error: '#ef4444',       // Red for errors
        
        // Voting colors
        upvote: '#10b981',      // Green for upvotes
        downvote: '#ef4444',    // Red for downvotes
        
        // Tag colors
        tag: {
          bg: '#2563eb',        // Blue background for tags
          text: '#ffffff',      // White text for tags
          hover: '#1d4ed8',     // Darker blue on hover
        }
      },
      
      // Custom border radius for rounded corners
      borderRadius: {
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
      },
      
      // Custom font sizes
      fontSize: {
        'xs': '0.75rem',
        'sm': '0.875rem',
        'base': '1rem',
        'lg': '1.125rem',
        'xl': '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
      },
      
      // Custom spacing
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      
      // Custom box shadows for cards
      boxShadow: {
        'dark': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'dark-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      
      // Animation for smooth transitions
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

export default config 