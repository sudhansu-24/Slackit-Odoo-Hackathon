/**
 * Client-safe logging utility for SlackIt Q&A platform
 * Works in browser environments without Node.js dependencies
 */

/**
 * Log levels for client-side logging
 */
type LogLevel = 'info' | 'warn' | 'error' | 'debug'

/**
 * Client-side logger that safely logs to console and can be extended
 */
class ClientLogger {
  private isDevelopment = process.env.NODE_ENV === 'development'
  
  private formatMessage(level: LogLevel, message: string, meta?: any): string {
    const timestamp = new Date().toISOString()
    const prefix = `[${timestamp}] [${level.toUpperCase()}]:`
    return meta ? `${prefix} ${message} ${JSON.stringify(meta)}` : `${prefix} ${message}`
  }

  /**
   * Log info messages
   */
  info(message: string, meta?: any): void {
    if (this.isDevelopment) {
      console.log(this.formatMessage('info', message, meta))
    }
  }

  /**
   * Log warning messages
   */
  warn(message: string, meta?: any): void {
    if (this.isDevelopment) {
      console.warn(this.formatMessage('warn', message, meta))
    }
  }

  /**
   * Log error messages
   */
  error(message: string, error?: Error, meta?: any): void {
    const errorMeta = error ? { error: error.message, stack: error.stack, ...meta } : meta
    if (this.isDevelopment) {
      console.error(this.formatMessage('error', message, errorMeta))
    }
  }

  /**
   * Log debug messages
   */
  debug(message: string, meta?: any): void {
    if (this.isDevelopment) {
      console.debug(this.formatMessage('debug', message, meta))
    }
  }

  /**
   * Log authentication events
   */
  auth(message: string, meta?: any): void {
    this.info(`[AUTH] ${message}`, meta)
  }

  /**
   * Log API events
   */
  api(message: string, meta?: any): void {
    this.info(`[API] ${message}`, meta)
  }
}

/**
 * Singleton client logger instance
 */
export const clientLogger = new ClientLogger()

/**
 * Helper functions for easy usage
 */
export const logClientInfo = (message: string, meta?: any) => clientLogger.info(message, meta)
export const logClientWarn = (message: string, meta?: any) => clientLogger.warn(message, meta)  
export const logClientError = (message: string, error?: Error, meta?: any) => clientLogger.error(message, error, meta)
export const logClientDebug = (message: string, meta?: any) => clientLogger.debug(message, meta)
export const logClientAuth = (message: string, meta?: any) => clientLogger.auth(message, meta)
export const logClientAPI = (message: string, meta?: any) => clientLogger.api(message, meta)

/**
 * Universal logging functions that work on both client and server
 * Automatically choose the right logger based on environment
 */
export const logInfo = typeof window !== 'undefined' 
  ? logClientInfo 
  : async (message: string, meta?: any) => {
      const { logInfo: serverLogInfo } = await import('@/lib/logger')
      return serverLogInfo(message, meta)
    }

export const logAuth = typeof window !== 'undefined'
  ? logClientAuth
  : async (message: string, meta?: any) => {
      const { logAuth: serverLogAuth } = await import('@/lib/logger')
      return serverLogAuth(message, meta)
    }

export const logAPI = typeof window !== 'undefined'
  ? logClientAPI
  : async (message: string, meta?: any) => {
      const { logAPI: serverLogAPI } = await import('@/lib/logger')
      return serverLogAPI(message, meta)
    }

export const logError = typeof window !== 'undefined'
  ? logClientError
  : async (message: string, error?: Error, meta?: any) => {
      const { logError: serverLogError } = await import('@/lib/logger')
      return serverLogError(message, error, meta)
    } 