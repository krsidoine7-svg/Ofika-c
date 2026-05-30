// =====================================================
// SERVICE DE LOGGING CENTRALISÉ
// =====================================================

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

export interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  context?: Record<string, any>
  userId?: string
  requestId?: string
}

class Logger {
  private currentLevel: LogLevel = LogLevel.INFO
  private isDevelopment: boolean = process.env.NODE_ENV === 'development'

  constructor() {
    // Définir le niveau de log selon l'environnement
    this.currentLevel = this.isDevelopment ? LogLevel.DEBUG : LogLevel.INFO
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.currentLevel
  }

  private formatMessage(level: LogLevel, message: string, context?: Record<string, any>): string {
    const timestamp = new Date().toISOString()
    const levelName = LogLevel[level]
    
    let formattedMessage = `[${timestamp}] ${levelName}: ${message}`
    
    if (context && Object.keys(context).length > 0) {
      formattedMessage += ` | Context: ${JSON.stringify(context)}`
    }
    
    return formattedMessage
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>): void {
    if (!this.shouldLog(level)) return

    const formattedMessage = this.formatMessage(level, message, context)
    
    // En développement, utiliser console avec couleurs
    if (this.isDevelopment) {
      switch (level) {
        case LogLevel.DEBUG:
          console.debug(`🐛 ${formattedMessage}`)
          break
        case LogLevel.INFO:
          console.info(`ℹ️ ${formattedMessage}`)
          break
        case LogLevel.WARN:
          console.warn(`⚠️ ${formattedMessage}`)
          break
        case LogLevel.ERROR:
          console.error(`❌ ${formattedMessage}`)
          break
      }
    } else {
      // En production, utiliser console standard
      switch (level) {
        case LogLevel.DEBUG:
          console.debug(formattedMessage)
          break
        case LogLevel.INFO:
          console.info(formattedMessage)
          break
        case LogLevel.WARN:
          console.warn(formattedMessage)
          break
        case LogLevel.ERROR:
          console.error(formattedMessage)
          break
      }
    }
  }

  debug(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, context)
  }

  info(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, context)
  }

  warn(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, context)
  }

  error(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.ERROR, message, context)
  }

  // Méthodes spécialisées pour les cas d'usage courants
  auth(message: string, userId?: string, context?: Record<string, any>): void {
    this.info(`[AUTH] ${message}`, { userId, ...context })
  }

  payment(message: string, orderId?: string, context?: Record<string, any>): void {
    this.info(`[PAYMENT] ${message}`, { orderId, ...context })
  }

  webhook(message: string, webhookType?: string, context?: Record<string, any>): void {
    this.info(`[WEBHOOK] ${message}`, { webhookType, ...context })
  }

  security(message: string, context?: Record<string, any>): void {
    this.warn(`[SECURITY] ${message}`, context)
  }

  performance(message: string, duration?: number, context?: Record<string, any>): void {
    this.info(`[PERFORMANCE] ${message}`, { duration, ...context })
  }
}

// Instance singleton
export const logger = new Logger()

// Export des types et fonctions utilitaires
export { Logger }
export default logger