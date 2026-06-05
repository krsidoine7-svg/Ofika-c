"use client"

import { useState, useEffect } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, Loader2, RefreshCw } from "lucide-react"
import { checkCustomUrlAvailability, checkUsernameAvailability } from "@/lib/supabase/check-url-availability"

interface UrlAvailabilityCheckerProps {
  value: string
  onChange: (value: string) => void
  type: 'custom_url' | 'username'
  excludeProfileId?: string
  placeholder?: string
  className?: string
}

export function UrlAvailabilityChecker({
  value,
  onChange,
  type,
  excludeProfileId,
  placeholder,
  className = ""
}: UrlAvailabilityCheckerProps) {
  const [isChecking, setIsChecking] = useState(false)
  const [availability, setAvailability] = useState<{
    isAvailable: boolean
    suggestion?: string
    error?: string
  } | null>(null)
  const [lastChecked, setLastChecked] = useState<string>('')

  const checkAvailability = async (url: string) => {
    if (!url.trim()) {
      setAvailability(null)
      return
    }

    if (url === lastChecked) {
      return // Éviter les vérifications en double
    }

    try {
      setIsChecking(true)
      setLastChecked(url)

      const result = type === 'custom_url' 
        ? await checkCustomUrlAvailability(url, excludeProfileId)
        : await checkUsernameAvailability(url, excludeProfileId)

      setAvailability(result)
    } catch (error) {
      setAvailability({
        isAvailable: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      })
    } finally {
      setIsChecking(false)
    }
  }

  // Vérifier automatiquement après 500ms de pause dans la frappe
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      checkAvailability(value)
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [value])

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion)
  }

  const getStatusIcon = () => {
    if (isChecking) {
      return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
    }
    
    if (!availability) {
      return null
    }
    
    return availability.isAvailable ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    )
  }

  const getStatusColor = () => {
    if (isChecking) return "border-blue-200"
    if (!availability) return "border-gray-200"
    return availability.isAvailable ? "border-green-200" : "border-red-200"
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="relative">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`pr-10 ${getStatusColor()}`}
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {getStatusIcon()}
        </div>
      </div>

      {availability && (
        <div className="space-y-2">
          {availability.isAvailable ? (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                {type === 'custom_url' ? 'URL personnalisée' : 'Nom d\'utilisateur'} disponible
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                {type === 'custom_url' ? 'URL personnalisée' : 'Nom d\'utilisateur'} déjà utilisée
                {availability.error && `: ${availability.error}`}
              </AlertDescription>
            </Alert>
          )}

          {availability.suggestion && (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Suggestions disponibles :
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSuggestionClick(availability.suggestion!)}
                >
                  {availability.suggestion}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => checkAvailability(value)}
                  disabled={isChecking}
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Vérifier
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
