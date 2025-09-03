/**
 * Enterprise Logging System
 * Structured logging with different levels and contexts
 */

import { captureException, captureMessage } from './monitoring';
import { appConfig } from '../config/app';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

interface LogContext {
  userId?: string;
  sessionId?: string;
  component?: string;
  action?: string;
  metadata?: Record<string, any>;
  timestamp?: string;
  userAgent?: string;
  url?: string;
}

interface LogEntry {
  level: LogLevel;
  message: string;
  context: LogContext;
  error?: Error;
}

class Logger {
  private logLevel: LogLevel;
  private sessionId: string;
  private buffer: LogEntry[] = [];
  private maxBufferSize = 100;

  constructor() {
    this.logLevel = this.getLogLevelFromConfig();
    this.sessionId = this.generateSessionId();
    
    // Flush logs periodically in production
    if (appConfig.nodeEnv === 'production') {
      setInterval(() => this.flush(), 30000); // Every 30 seconds
    }
  }

  private getLogLevelFromConfig(): LogLevel {
    const configLevel = appConfig.monitoring.logLevel as string;
    switch (configLevel) {
      case 'debug': return LogLevel.DEBUG;
      case 'info': return LogLevel.INFO;
      case 'warn': return LogLevel.WARN;
      case 'error': return LogLevel.ERROR;
      default: return LogLevel.INFO;
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.logLevel;
  }

  private createLogEntry(level: LogLevel, message: string, context: Partial<LogContext> = {}, error?: Error): LogEntry {
    const fullContext: LogContext = {
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      ...context,
    };

    return {
      level,
      message,
      context: fullContext,
      error,
    };
  }

  private formatLogMessage(entry: LogEntry): string {
    const levelName = LogLevel[entry.level];
    const { timestamp, component, action } = entry.context;
    
    let formatted = `[${timestamp}] ${levelName}`;
    
    if (component) {
      formatted += ` [${component}]`;
    }
    
    if (action) {
      formatted += ` [${action}]`;
    }
    
    formatted += `: ${entry.message}`;
    
    return formatted;
  }

  private outputToConsole(entry: LogEntry): void {
    const formatted = this.formatLogMessage(entry);
    
    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(formatted, entry.context, entry.error);
        break;
      case LogLevel.INFO:
        console.info(formatted, entry.context);
        break;
      case LogLevel.WARN:
        console.warn(formatted, entry.context, entry.error);
        break;
      case LogLevel.ERROR:
        console.error(formatted, entry.context, entry.error);
        break;
    }
  }

  private addToBuffer(entry: LogEntry): void {
    this.buffer.push(entry);
    
    if (this.buffer.length > this.maxBufferSize) {
      this.buffer.shift(); // Remove oldest entry
    }
  }

  private log(level: LogLevel, message: string, context: Partial<LogContext> = {}, error?: Error): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const entry = this.createLogEntry(level, message, context, error);
    
    // Always output to console in development
    if (appConfig.nodeEnv === 'development') {
      this.outputToConsole(entry);
    }
    
    // Add to buffer for production logging
    this.addToBuffer(entry);
    
    // Send critical errors immediately to monitoring service
    if (level === LogLevel.ERROR && error) {
      captureException(error, entry.context);
    } else if (level >= LogLevel.WARN) {
      captureMessage(entry.message, level === LogLevel.WARN ? 'warning' : 'error');
    }
  }

  /**
   * Log debug message
   */
  debug(message: string, context?: Partial<LogContext>): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  /**
   * Log info message
   */
  info(message: string, context?: Partial<LogContext>): void {
    this.log(LogLevel.INFO, message, context);
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: Partial<LogContext>, error?: Error): void {
    this.log(LogLevel.WARN, message, context, error);
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error, context?: Partial<LogContext>): void {
    this.log(LogLevel.ERROR, message, context, error);
  }

  /**
   * Log user action for analytics
   */
  userAction(action: string, component: string, metadata?: Record<string, any>): void {
    this.info(`User action: ${action}`, {
      component,
      action,
      metadata,
    });
  }

  /**
   * Log performance metrics
   */
  performance(metric: string, value: number, unit: string = 'ms', context?: Partial<LogContext>): void {
    this.info(`Performance: ${metric} = ${value}${unit}`, {
      ...context,
      metadata: {
        metric,
        value,
        unit,
        ...context?.metadata,
      },
    });
  }

  /**
   * Log API calls
   */
  apiCall(method: string, url: string, status: number, duration: number, context?: Partial<LogContext>): void {
    const level = status >= 400 ? LogLevel.WARN : LogLevel.INFO;
    const message = `API ${method} ${url} - ${status} (${duration}ms)`;
    
    this.log(level, message, {
      ...context,
      action: 'api_call',
      metadata: {
        method,
        url,
        status,
        duration,
        ...context?.metadata,
      },
    });
  }

  /**
   * Set user context for all subsequent logs
   */
  setUserContext(userId: string): void {
    // Store user context for future logs
    (this as any).defaultContext = { userId };
  }

  /**
   * Flush buffered logs to external service
   */
  flush(): void {
    if (this.buffer.length === 0) {
      return;
    }

    // In a real implementation, you would send logs to your logging service
    // For now, we'll just clear the buffer
    if (appConfig.nodeEnv === 'production') {
      // TODO: Implement log shipping to external service
      console.log(`Flushing ${this.buffer.length} log entries`);
    }
    
    this.buffer = [];
  }

  /**
   * Get current buffer for debugging
   */
  getBuffer(): LogEntry[] {
    return [...this.buffer];
  }

  /**
   * Clear all logs
   */
  clear(): void {
    this.buffer = [];
  }
}

// Create singleton logger instance
export const logger = new Logger();

// Export convenience functions
export const log = {
  debug: (message: string, context?: Partial<LogContext>) => logger.debug(message, context),
  info: (message: string, context?: Partial<LogContext>) => logger.info(message, context),
  warn: (message: string, context?: Partial<LogContext>, error?: Error) => logger.warn(message, context, error),
  error: (message: string, error?: Error, context?: Partial<LogContext>) => logger.error(message, error, context),
  userAction: (action: string, component: string, metadata?: Record<string, any>) => logger.userAction(action, component, metadata),
  performance: (metric: string, value: number, unit?: string, context?: Partial<LogContext>) => logger.performance(metric, value, unit, context),
  apiCall: (method: string, url: string, status: number, duration: number, context?: Partial<LogContext>) => logger.apiCall(method, url, status, duration, context),
};

// Performance logging utilities
export const performanceLogger = {
  /**
   * Measure and log function execution time
   */
  measure: <T>(name: string, fn: () => T, context?: Partial<LogContext>): T => {
    const start = performance.now();
    const result = fn();
    const duration = performance.now() - start;
    
    logger.performance(name, duration, 'ms', context);
    
    return result;
  },

  /**
   * Measure and log async function execution time
   */
  measureAsync: async <T>(name: string, fn: () => Promise<T>, context?: Partial<LogContext>): Promise<T> => {
    const start = performance.now();
    const result = await fn();
    const duration = performance.now() - start;
    
    logger.performance(name, duration, 'ms', context);
    
    return result;
  },

  /**
   * Create a performance timer
   */
  timer: (name: string, context?: Partial<LogContext>) => {
    const start = performance.now();
    
    return {
      end: () => {
        const duration = performance.now() - start;
        logger.performance(name, duration, 'ms', context);
        return duration;
      },
    };
  },
};

