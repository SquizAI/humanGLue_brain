/**
 * ============================================================================
 * Application Logger
 * ============================================================================
 *
 * Centralized logging for the HumanGlue platform
 *
 * Features:
 * - Structured logging with levels (debug, info, warn, error)
 * - Context enrichment
 * - Environment-aware (dev vs production)
 * - Integration with error tracking (Sentry)
 * - Performance-optimized
 *
 * Usage:
 * ```ts
 * import { logger } from '@/lib/monitoring/logger'
 *
 * logger.info('User logged in', { userId: '123' })
 * logger.error('Payment failed', { error, orderId: '456' })
 * ```
 * ============================================================================
 */

import { captureException, captureMessage } from './sentry'

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface LogContext {
  [key: string]: any
}

export interface LogEntry {
  level: LogLevel
  message: string
  context?: LogContext
  timestamp: string
  environment: string
}

class Logger {
  private environment: string
  private logLevel: LogLevel

  constructor() {
    this.environment = process.env.NEXT_PUBLIC_ENV || process.env.NODE_ENV || 'development'
    this.logLevel = this.getLogLevel()
  }

  /**
   * Determine the minimum log level based on environment
   */
  private getLogLevel(): LogLevel {
    const configuredLevel = process.env.LOG_LEVEL?.toLowerCase() as LogLevel

    if (configuredLevel && this.isValidLogLevel(configuredLevel)) {
      return configuredLevel
    }

    // Default log levels by environment
    switch (this.environment) {
      case 'production':
        return 'info'
      case 'staging':
        return 'debug'
      default:
        return 'debug'
    }
  }

  /**
   * Check if a log level is valid
   */
  private isValidLogLevel(level: string): level is LogLevel {
    return ['debug', 'info', 'warn', 'error'].includes(level)
  }

  /**
   * Check if a message should be logged based on current log level
   */
  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error']
    const currentLevelIndex = levels.indexOf(this.logLevel)
    const messageLevelIndex = levels.indexOf(level)

    return messageLevelIndex >= currentLevelIndex
  }

  /**
   * Format a log entry for output
   */
  private formatLog(entry: LogEntry): string {
    const { level, message, context, timestamp } = entry

    if (this.environment === 'development') {
      // Pretty format for development
      const contextStr = context ? `\n${JSON.stringify(context, null, 2)}` : ''
      return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`
    } else {
      // JSON format for production (easier to parse in logging systems)
      return JSON.stringify(entry)
    }
  }

  /**
   * Create a log entry
   */
  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: LogContext
  ): LogEntry {
    return {
      level,
      message,
      context: this.enrichContext(context),
      timestamp: new Date().toISOString(),
      environment: this.environment,
    }
  }

  /**
   * Enrich context with additional metadata
   */
  private enrichContext(context?: LogContext): LogContext {
    const enriched: LogContext = {
      ...context,
    }

    // Add browser information if available
    if (typeof window !== 'undefined') {
      enriched.userAgent = navigator.userAgent
      enriched.url = window.location.href
    }

    // Add request ID if available (for server-side logging)
    // You can set this in middleware or from request headers
    if (typeof global !== 'undefined' && (global as any).requestId) {
      enriched.requestId = (global as any).requestId
    }

    return enriched
  }

  /**
   * Output log to console
   */
  private output(level: LogLevel, entry: LogEntry): void {
    const formatted = this.formatLog(entry)

    switch (level) {
      case 'debug':
        console.debug(formatted)
        break
      case 'info':
        console.info(formatted)
        break
      case 'warn':
        console.warn(formatted)
        break
      case 'error':
        console.error(formatted)
        break
    }
  }

  /**
   * Send error to Sentry
   */
  private reportToSentry(level: LogLevel, message: string, context?: LogContext): void {
    if (level === 'error' && context?.error) {
      captureException(context.error, {
        contexts: { custom: context },
      })
    } else if (level === 'error' || level === 'warn') {
      captureMessage(message, level === 'error' ? 'error' : 'warning')
    }
  }

  /**
   * Log a debug message
   */
  debug(message: string, context?: LogContext): void {
    if (!this.shouldLog('debug')) return

    const entry = this.createLogEntry('debug', message, context)
    this.output('debug', entry)
  }

  /**
   * Log an info message
   */
  info(message: string, context?: LogContext): void {
    if (!this.shouldLog('info')) return

    const entry = this.createLogEntry('info', message, context)
    this.output('info', entry)
  }

  /**
   * Log a warning message
   */
  warn(message: string, context?: LogContext): void {
    if (!this.shouldLog('warn')) return

    const entry = this.createLogEntry('warn', message, context)
    this.output('warn', entry)

    // Report warnings to Sentry in production
    if (this.environment === 'production') {
      this.reportToSentry('warn', message, context)
    }
  }

  /**
   * Log an error message
   */
  error(message: string, context?: LogContext): void {
    if (!this.shouldLog('error')) return

    const entry = this.createLogEntry('error', message, context)
    this.output('error', entry)

    // Always report errors to Sentry
    this.reportToSentry('error', message, context)
  }

  /**
   * Create a child logger with additional context
   *
   * @example
   * ```ts
   * const paymentLogger = logger.child({ module: 'payment' })
   * paymentLogger.info('Processing payment') // Automatically includes module: 'payment'
   * ```
   */
  child(context: LogContext): Logger {
    const childLogger = new Logger()
    const originalEnrichContext = childLogger.enrichContext.bind(childLogger)

    childLogger.enrichContext = (additionalContext?: LogContext) => {
      return originalEnrichContext({
        ...context,
        ...additionalContext,
      })
    }

    return childLogger
  }

  /**
   * Time a function execution
   *
   * @example
   * ```ts
   * await logger.time('Database query', async () => {
   *   return await db.query(...)
   * })
   * ```
   */
  async time<T>(
    label: string,
    fn: () => Promise<T>,
    context?: LogContext
  ): Promise<T> {
    const start = performance.now()

    try {
      const result = await fn()
      const duration = performance.now() - start

      this.debug(`${label} completed`, {
        ...context,
        duration: `${duration.toFixed(2)}ms`,
      })

      return result
    } catch (error) {
      const duration = performance.now() - start

      this.error(`${label} failed`, {
        ...context,
        error,
        duration: `${duration.toFixed(2)}ms`,
      })

      throw error
    }
  }
}

// Export singleton instance
export const logger = new Logger()

// Export convenience methods for common patterns
export const log = {
  debug: logger.debug.bind(logger),
  info: logger.info.bind(logger),
  warn: logger.warn.bind(logger),
  error: logger.error.bind(logger),
}

// Export for API route logging
export function createAPILogger(req: any) {
  return logger.child({
    method: req.method,
    url: req.url,
    ip: req.headers?.['x-forwarded-for'] || req.socket?.remoteAddress,
  })
}

// Export for server component logging
export function createServerLogger(componentName: string) {
  return logger.child({
    component: componentName,
    server: true,
  })
}

// Export for client component logging
export function createClientLogger(componentName: string) {
  return logger.child({
    component: componentName,
    client: true,
  })
}
