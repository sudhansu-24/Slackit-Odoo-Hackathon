import winston from 'winston'

/**
 * Winston logger configuration for StackIt Q&A platform
 * Logs every logical connection and workflow of the codebase
 * Uses different logging levels based on workflow and logic
 */

// Define custom log levels for better categorization
const customLevels = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    auth: 3,
    database: 4,
    api: 5,
    debug: 6
  },
  colors: {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    auth: 'blue',
    database: 'magenta',
    api: 'cyan',
    debug: 'white'
  }
}

// Add colors to winston
winston.addColors(customLevels.colors)

/**
 * Custom log format for better readability
 * Includes timestamp, log level, and message with colorization
 */
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.colorize({ all: true }),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let logMessage = `${timestamp} [${level}]: ${message}`
    
    // Add stack trace for errors
    if (stack) {
      logMessage += `\n${stack}`
    }
    
    // Add metadata if present
    if (Object.keys(meta).length > 0) {
      logMessage += `\n${JSON.stringify(meta, null, 2)}`
    }
    
    return logMessage
  })
)

/**
 * Winston logger instance with custom configuration
 */
const logger = winston.createLogger({
  levels: customLevels.levels,
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  transports: [
    // Console transport for development
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        logFormat
      )
    }),
    
    // File transport for errors
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    }),
    
    // File transport for all logs
    new winston.transports.File({
      filename: 'logs/app.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    })
  ]
})

/**
 * Helper functions for specific logging categories
 */
export const logAuth = (message: string, meta?: any) => {
  logger.log('auth', message, meta)
}

export const logDatabase = (message: string, meta?: any) => {
  logger.log('database', message, meta)
}

export const logAPI = (message: string, meta?: any) => {
  logger.log('api', message, meta)
}

export const logError = (message: string, error?: Error, meta?: any) => {
  logger.error(message, { error: error?.stack, ...meta })
}

export const logInfo = (message: string, meta?: any) => {
  logger.info(message, meta)
}

export const logWarn = (message: string, meta?: any) => {
  logger.warn(message, meta)
}

export const logDebug = (message: string, meta?: any) => {
  logger.debug(message, meta)
}

export default logger 