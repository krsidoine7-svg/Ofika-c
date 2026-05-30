import { toast } from 'sonner'

export interface ErrorContext {
  action: string
  component?: string
  userId?: string
  profileId?: string
}

export class ErrorService {
  /**
   * Gestion centralisée des erreurs avec logging et notifications
   */
  static handle(error: any, context: ErrorContext): void {
    // Log de l'erreur pour le debugging
    console.error(`[${context.component || 'Unknown'}] ${context.action}:`, error)

    // Détermination du type d'erreur et message approprié
    const errorInfo = this.parseError(error)
    
    // Affichage de la notification utilisateur
    this.showUserNotification(errorInfo, context)
    
    // Logging pour monitoring (à implémenter avec un service externe si nécessaire)
    this.logError(error, context, errorInfo)
  }

  /**
   * Gestion des erreurs de réseau avec retry automatique
   */
  static async handleWithRetry<T>(
    operation: () => Promise<T>,
    context: ErrorContext,
    maxRetries: number = 3
  ): Promise<T | null> {
    let lastError: any = null
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error
        
        if (attempt === maxRetries) {
          this.handle(error, { ...context, action: `${context.action} (tentative ${attempt}/${maxRetries})` })
          return null
        }
        
        // Attendre avant de réessayer (backoff exponentiel)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
      }
    }
    
    return null
  }

  /**
   * Parse l'erreur pour extraire les informations pertinentes
   */
  private static parseError(error: any): {
    type: 'validation' | 'business' | 'network' | 'auth' | 'unknown'
    message: string
    code?: string
    details?: any
  } {
    // Erreurs Supabase
    if (error?.code) {
      switch (error.code) {
        case 'PGRST116':
          return {
            type: 'validation',
            message: 'Ressource non trouvée',
            code: error.code
          }
        case '23505':
          return {
            type: 'validation',
            message: 'Cette information est déjà utilisée par un autre utilisateur',
            code: error.code
          }
        case '23503':
          return {
            type: 'validation',
            message: 'Référence invalide',
            code: error.code
          }
        case '42501':
          return {
            type: 'auth',
            message: 'Vous n\'avez pas les permissions nécessaires',
            code: error.code
          }
        case 'PGRST301':
          return {
            type: 'business',
            message: 'Limite atteinte. Vous ne pouvez pas créer plus d\'éléments',
            code: error.code
          }
        default:
          return {
            type: 'unknown',
            message: error.message || 'Une erreur inattendue s\'est produite',
            code: error.code
          }
      }
    }

    // Erreurs de validation Zod
    if (error?.issues) {
      const firstIssue = error.issues[0]
      return {
        type: 'validation',
        message: firstIssue.message || 'Données invalides',
        details: error.issues
      }
    }

    // Erreurs réseau
    if (error?.name === 'NetworkError' || error?.message?.includes('fetch')) {
      return {
        type: 'network',
        message: 'Problème de connexion. Vérifiez votre connexion internet'
      }
    }

    // Erreurs d'authentification
    if (error?.message?.includes('auth') || error?.message?.includes('session')) {
      return {
        type: 'auth',
        message: 'Session expirée. Veuillez vous reconnecter'
      }
    }

    // Erreur générique
    return {
      type: 'unknown',
      message: error?.message || 'Une erreur inattendue s\'est produite'
    }
  }

  /**
   * Affiche la notification appropriée à l'utilisateur
   */
  private static showUserNotification(
    errorInfo: ReturnType<typeof this.parseError>, 
    context: ErrorContext
  ): void {
    const { type, message } = errorInfo

    switch (type) {
      case 'validation':
        toast.error(message, {
          description: 'Vérifiez les informations saisies'
        })
        break
      
      case 'business':
        toast.warning(message, {
          description: 'Contrainte métier non respectée'
        })
        break
      
      case 'network':
        toast.error(message, {
          description: 'Vérifiez votre connexion internet',
          action: {
            label: 'Réessayer',
            onClick: () => window.location.reload()
          }
        })
        break
      
      case 'auth':
        toast.error(message, {
          description: 'Redirection vers la page de connexion',
          action: {
            label: 'Se connecter',
            onClick: () => window.location.href = '/auth/login'
          }
        })
        break
      
      default:
        toast.error(message, {
          description: 'Contactez le support si le problème persiste'
        })
    }
  }

  /**
   * Log l'erreur pour monitoring et debugging
   */
  private static logError(
    error: any, 
    context: ErrorContext, 
    errorInfo: ReturnType<typeof this.parseError>
  ): void {
    // Log structuré pour faciliter le monitoring
    const logData = {
      timestamp: new Date().toISOString(),
      context,
      error: {
        message: error?.message,
        code: error?.code,
        stack: error?.stack
      },
      parsed: errorInfo,
      userAgent: navigator.userAgent,
      url: window.location.href
    }

    // Log local pour debugging
    console.error('Error logged:', logData)

    // Ici, vous pourriez envoyer les erreurs à un service de monitoring
    // comme Sentry, LogRocket, ou un service personnalisé
    // this.sendToMonitoringService(logData)
  }

  /**
   * Gestion spécifique des erreurs de création de profil
   */
  static handleProfileCreationError(error: any, context: ErrorContext): void {
    // Vérification spécifique pour les contraintes de profils
    if (error?.message?.includes('Maximum 3 profiles')) {
      toast.warning('Limite de profils atteinte', {
        description: 'Vous ne pouvez créer que 3 profils maximum',
        action: {
          label: 'Gérer mes profils',
          onClick: () => window.location.href = '/dashboard/profiles'
        }
      })
      return
    }

    // Gestion standard pour les autres erreurs
    this.handle(error, context)
  }

  /**
   * Gestion spécifique des erreurs de création de liens
   */
  static handleLinkCreationError(error: any, context: ErrorContext): void {
    // Vérification spécifique pour les contraintes de liens
    if (error?.message?.includes('Maximum 2 links')) {
      toast.warning('Limite de liens atteinte', {
        description: 'Vous ne pouvez ajouter que 2 liens maximum par profil'
      })
      return
    }

    // Gestion standard pour les autres erreurs
    this.handle(error, context)
  }
}
