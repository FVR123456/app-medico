/**
 * Centralized logging service with severity levels
 */

type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

const LOG_LEVELS = {
  DEBUG: 'DEBUG' as const,
  INFO: 'INFO' as const,
  WARN: 'WARN' as const,
  ERROR: 'ERROR' as const,
};

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  data?: unknown;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;
  private logs: LogEntry[] = [];
  private maxLogs = 100;

  private formatTimestamp(): string {
    return new Date().toISOString();
  }

  private shouldLog(level: LogLevel): boolean {
    if (this.isDevelopment) return true;
    // In production, only log errors and warnings
    return level === 'ERROR' || level === 'WARN';
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: string,
    data?: unknown
  ): LogEntry {
    return {
      timestamp: this.formatTimestamp(),
      level,
      message,
      context,
      data,
    };
  }

  private storeLogs(entry: LogEntry): void {
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift(); // Remove oldest log
    }
  }

  private printLog(entry: LogEntry): void {
    const prefix = `[${entry.level}] ${entry.timestamp}`;
    const context = entry.context ? ` [${entry.context}]` : '';
    const message = `${prefix}${context}: ${entry.message}`;

    switch (entry.level) {
      case LOG_LEVELS.DEBUG:
        console.debug(message, entry.data || '');
        break;
      case LOG_LEVELS.INFO:
        console.info(message, entry.data || '');
        break;
      case LOG_LEVELS.WARN:
        console.warn(message, entry.data || '');
        break;
      case LOG_LEVELS.ERROR:
        console.error(message, entry.data || '');
        break;
    }
  }

  debug(message: string, context?: string, data?: unknown): void {
    const entry = this.createLogEntry(LOG_LEVELS.DEBUG, message, context, data);
    if (this.shouldLog(LOG_LEVELS.DEBUG)) {
      this.printLog(entry);
    }
    this.storeLogs(entry);
  }

  info(message: string, context?: string, data?: unknown): void {
    const entry = this.createLogEntry(LOG_LEVELS.INFO, message, context, data);
    if (this.shouldLog(LOG_LEVELS.INFO)) {
      this.printLog(entry);
    }
    this.storeLogs(entry);
  }

  warn(message: string, context?: string, data?: unknown): void {
    const entry = this.createLogEntry(LOG_LEVELS.WARN, message, context, data);
    if (this.shouldLog(LOG_LEVELS.WARN)) {
      this.printLog(entry);
    }
    this.storeLogs(entry);
  }

  error(message: string, context?: string, data?: unknown): void {
    const entry = this.createLogEntry(LOG_LEVELS.ERROR, message, context, data);
    if (this.shouldLog(LOG_LEVELS.ERROR)) {
      this.printLog(entry);
    }
    this.storeLogs(entry);
  }

  getLogs(level?: LogLevel): LogEntry[] {
    if (level) {
      return this.logs.filter(log => log.level === level);
    }
    return this.logs;
  }

  clearLogs(): void {
    this.logs = [];
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

export type { LogLevel };

// Export singleton instance
export const logger = new Logger();
