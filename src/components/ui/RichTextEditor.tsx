'use client'

import React, { useState, useRef } from 'react'
import { 
  Bold, 
  Italic, 
  Underline, 
  Code, 
  Link, 
  List, 
  ListOrdered,
  Quote,
  Eye,
  Edit
} from 'lucide-react'
import { logInfo } from '@/lib/client-logger'

/**
 * Rich Text Editor Component for SlackIt Q&A platform
 * Provides a clean interface for writing questions and answers
 * Supports basic formatting, markdown, and live preview
 */

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minHeight?: string
  error?: string
}

export default function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = "Write your content here...",
  minHeight = "200px",
  error
}: RichTextEditorProps) {
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  /**
   * Handle formatting actions
   */
  const handleFormat = (format: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = textarea.value.substring(start, end)
    let newText = ''

    logInfo('Rich text editor formatting applied', { format, hasSelection: selectedText.length > 0 })

    switch (format) {
      case 'bold':
        newText = `**${selectedText || 'bold text'}**`
        break
      case 'italic':
        newText = `*${selectedText || 'italic text'}*`
        break
      case 'underline':
        newText = `<u>${selectedText || 'underlined text'}</u>`
        break
      case 'code':
        if (selectedText.includes('\n')) {
          newText = `\`\`\`\n${selectedText || 'code block'}\n\`\`\``
        } else {
          newText = `\`${selectedText || 'code'}\``
        }
        break
      case 'link':
        newText = `[${selectedText || 'link text'}](url)`
        break
      case 'unordered-list':
        newText = selectedText 
          ? selectedText.split('\n').map(line => `- ${line}`).join('\n')
          : '- List item'
        break
      case 'ordered-list':
        newText = selectedText
          ? selectedText.split('\n').map((line, i) => `${i + 1}. ${line}`).join('\n')
          : '1. List item'
        break
      case 'quote':
        newText = selectedText
          ? selectedText.split('\n').map(line => `> ${line}`).join('\n')
          : '> Quote'
        break
      default:
        return
    }

    // Insert the formatted text
    const newValue = value.substring(0, start) + newText + value.substring(end)
    onChange(newValue)

    // Restore focus and set cursor position
    setTimeout(() => {
      textarea.focus()
      const newCursorPos = start + newText.length
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }

  /**
   * Handle keyboard shortcuts
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault()
          handleFormat('bold')
          break
        case 'i':
          e.preventDefault()
          handleFormat('italic')
          break
        case 'k':
          e.preventDefault()
          handleFormat('link')
          break
        case '`':
          e.preventDefault()
          handleFormat('code')
          break
      }
    }
  }

  /**
   * Convert markdown to HTML for preview
   */
  const markdownToHtml = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code class="bg-dark-hover text-primary px-1 rounded">$1</code>')
      .replace(/```([\s\S]*?)```/g, '<pre class="bg-dark-hover p-3 rounded-lg overflow-x-auto"><code>$1</code></pre>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary hover:underline">$1</a>')
      .replace(/^- (.*$)/gm, '<li class="ml-4">$1</li>')
      .replace(/^(\d+)\. (.*$)/gm, '<li class="ml-4">$1. $2</li>')
      .replace(/^> (.*$)/gm, '<blockquote class="border-l-4 border-primary pl-4 italic text-dark-muted">$1</blockquote>')
      .replace(/\n/g, '<br>')
  }

  return (
    <div className="w-full">
      {/* Toolbar */}
      <div className="bg-dark-card border border-dark-border rounded-t-lg p-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => handleFormat('bold')}
            className="p-2 text-dark-text hover:text-white hover:bg-dark-hover rounded transition-colors"
            title="Bold (Ctrl+B)"
          >
            <Bold className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => handleFormat('italic')}
            className="p-2 text-dark-text hover:text-white hover:bg-dark-hover rounded transition-colors"
            title="Italic (Ctrl+I)"
          >
            <Italic className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => handleFormat('underline')}
            className="p-2 text-dark-text hover:text-white hover:bg-dark-hover rounded transition-colors"
            title="Underline"
          >
            <Underline className="h-4 w-4" />
          </button>
          <div className="w-px h-6 bg-dark-border"></div>
          <button
            type="button"
            onClick={() => handleFormat('code')}
            className="p-2 text-dark-text hover:text-white hover:bg-dark-hover rounded transition-colors"
            title="Code (Ctrl+`)"
          >
            <Code className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => handleFormat('link')}
            className="p-2 text-dark-text hover:text-white hover:bg-dark-hover rounded transition-colors"
            title="Link (Ctrl+K)"
          >
            <Link className="h-4 w-4" />
          </button>
          <div className="w-px h-6 bg-dark-border"></div>
          <button
            type="button"
            onClick={() => handleFormat('unordered-list')}
            className="p-2 text-dark-text hover:text-white hover:bg-dark-hover rounded transition-colors"
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => handleFormat('ordered-list')}
            className="p-2 text-dark-text hover:text-white hover:bg-dark-hover rounded transition-colors"
            title="Numbered List"
          >
            <ListOrdered className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => handleFormat('quote')}
            className="p-2 text-dark-text hover:text-white hover:bg-dark-hover rounded transition-colors"
            title="Quote"
          >
            <Quote className="h-4 w-4" />
          </button>
        </div>
        
        {/* Preview Toggle */}
        <button
          type="button"
          onClick={() => setIsPreviewMode(!isPreviewMode)}
          className={`p-2 rounded transition-colors ${
            isPreviewMode 
              ? 'bg-primary text-white' 
              : 'text-dark-text hover:text-white hover:bg-dark-hover'
          }`}
          title={isPreviewMode ? 'Edit Mode' : 'Preview Mode'}
        >
          {isPreviewMode ? <Edit className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>

      {/* Editor/Preview Area */}
      <div className="relative">
        {isPreviewMode ? (
          <div 
            className={`w-full p-4 bg-dark-bg border-x border-b border-dark-border rounded-b-lg text-dark-text prose prose-invert max-w-none`}
            style={{ minHeight }}
            dangerouslySetInnerHTML={{ __html: markdownToHtml(value) || '<p class="text-dark-muted italic">Nothing to preview</p>' }}
          />
        ) : (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={`w-full p-4 bg-dark-bg border-x border-b border-dark-border rounded-b-lg text-dark-text placeholder-dark-muted resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
              error ? 'border-error' : ''
            }`}
            style={{ minHeight }}
          />
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p className="mt-2 text-sm text-error">{error}</p>
      )}

      {/* Help Text */}
      <div className="mt-2 text-sm text-dark-muted">
        <p>
          <strong>Formatting shortcuts:</strong> Ctrl+B (bold), Ctrl+I (italic), Ctrl+K (link), Ctrl+` (code)
        </p>
        <p>
          <strong>Markdown supported:</strong> **bold**, *italic*, `code`, [link](url), &gt; quote, - list
        </p>
      </div>
    </div>
  )
} 