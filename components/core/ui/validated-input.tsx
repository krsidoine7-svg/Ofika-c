// =====================================================
// COMPOSANT D'INPUT AVEC VALIDATION EN TEMPS RÉEL
// =====================================================

import React, { useState, useEffect } from 'react'
import { AlertCircle, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { InputSanitizer } from '@/lib/security/input-sanitizer'
import { AriaLabels } from '@/lib/accessibility/aria-labels'

interface ValidatedInputProps {
  label: string
  value: string
  onChange: (value: string) => void
  onValidationChange?: (isValid: boolean, error?: string) => void
  placeholder?: string
  type?: 'text' | 'email' | 'tel' | 'password' | 'url'
  required?: boolean
  validator?: (value: string) => { isValid: boolean; error?: string }
  formatter?: (value: string) => string
  className?: string
  disabled?: boolean
  ariaLabel?: string
  ariaDescribedBy?: string
  maxLength?: number
  minLength?: number
}

export function ValidatedInput({
  label,
  value,
  onChange,
  onValidationChange,
  placeholder,
  type = 'text',
  required = false,
  validator,
  formatter,
  className,
  disabled = false,
  ariaLabel,
  ariaDescribedBy,
  maxLength,
  minLength
}: ValidatedInputProps) {
  const [error, setError] = useState<string | undefined>()
  const [isValid, setIsValid] = useState<boolean>(true)
  const [isTouched, setIsTouched] = useState(false)

  // Validation en temps réel
  useEffect(() => {
    if (!validator) return

    const validation = validator(value)
    setError(validation.isValid ? undefined : validation.error)
    setIsValid(validation.isValid)
    
    if (onValidationChange) {
      onValidationChange(validation.isValid, validation.error)
    }
  }, [value, validator, onValidationChange])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value
    
    // Sanitisation de sécurité
    try {
      if (type === 'email') {
        newValue = InputSanitizer.sanitizeEmail(newValue)
      } else if (type === 'tel') {
        newValue = InputSanitizer.sanitizePhone(newValue)
      } else if (type === 'url') {
        newValue = InputSanitizer.sanitizeUrl(newValue)
      } else {
        newValue = InputSanitizer.sanitizeString(newValue)
      }
    } catch (error) {
      // En cas d'erreur de sanitisation, garder la valeur originale
      console.warn('Erreur de sanitisation:', error)
    }
    
    // Appliquer le formateur si fourni
    if (formatter) {
      newValue = formatter(newValue)
    }
    
    onChange(newValue)
  }

  const handleBlur = () => {
    setIsTouched(true)
  }

  const handleFocus = () => {
    setIsTouched(true)
  }

  const showError = isTouched && !isValid && error
  const showSuccess = isTouched && isValid && value.length > 0

  // Générer un ID unique pour l'accessibilité
  const inputId = React.useId()
  const errorId = `${inputId}-error`
  const descriptionId = `${inputId}-description`

  return (
    <div className={cn("space-y-2", className)}>
      <label 
        htmlFor={inputId}
        className="block text-sm font-medium text-gray-700"
      >
        {label}
        {required && <span className="text-red-500 ml-1" aria-label="obligatoire">*</span>}
      </label>
      
      <div className="relative">
        <input
          id={inputId}
          type={type}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          minLength={minLength}
          aria-label={ariaLabel || label}
          aria-describedby={cn(
            ariaDescribedBy,
            showError && errorId,
            placeholder && !showError && descriptionId
          )}
          aria-invalid={showError ? "true" : "false"}
          aria-required={required}
          className={cn(
            "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors",
            showError 
              ? "border-red-300 focus:ring-red-500 bg-red-50" 
              : showSuccess
              ? "border-green-300 focus:ring-green-500 bg-green-50"
              : "border-gray-300 focus:ring-orange-500",
            disabled && "bg-gray-100 cursor-not-allowed"
          )}
        />
        
        {/* Icônes de validation */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {showError && (
            <AlertCircle className="h-4 w-4 text-red-500" />
          )}
          {showSuccess && (
            <CheckCircle className="h-4 w-4 text-green-500" />
          )}
        </div>
      </div>
      
      {/* Message d'erreur */}
      {showError && (
        <p 
          id={errorId}
          className="text-sm text-red-600 flex items-center"
          role="alert"
          aria-live="polite"
        >
          <AlertCircle className="h-4 w-4 mr-1" aria-hidden="true" />
          {error}
        </p>
      )}
      
      {/* Message d'aide */}
      {!showError && placeholder && value.length === 0 && (
        <p 
          id={descriptionId}
          className="text-sm text-gray-500"
        >
          {placeholder}
        </p>
      )}
    </div>
  )
}

// =====================================================
// COMPOSANT DE CHAMP DE TÉLÉPHONE SPÉCIALISÉ
// =====================================================

interface PhoneInputProps {
  label: string
  value: string
  onChange: (value: string) => void
  onValidationChange?: (isValid: boolean, error?: string) => void
  required?: boolean
  className?: string
  disabled?: boolean
}

export function PhoneInput({
  label,
  value,
  onChange,
  onValidationChange,
  required = false,
  className,
  disabled = false
}: PhoneInputProps) {
  const [error, setError] = useState<string | undefined>()
  const [isValid, setIsValid] = useState<boolean>(true)
  const [isTouched, setIsTouched] = useState(false)

  // Validation du téléphone (utilise la fonction de lib/validations/order-form.ts)
  const validatePhone = (phone: string) => {
    if (!phone || phone.trim().length === 0) {
      return { isValid: !required, error: required ? 'Le téléphone est requis' : undefined }
    }

    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '')
    const phonePattern = /^\+[1-9]\d{6,14}$/
    
    if (!phonePattern.test(cleanPhone)) {
      return { 
        isValid: false, 
        error: 'Format invalide. Utilisez le format international: +221 XX XXX XX XX' 
      }
    }

    return { isValid: true }
  }

  // Formatage du téléphone
  const formatPhone = (value: string) => {
    let cleaned = value.replace(/[^\d+]/g, '')
    
    if (!cleaned.startsWith('+')) {
      cleaned = '+' + cleaned.replace(/^\+/, '')
    }
    
    if (cleaned.length > 16) {
      cleaned = cleaned.substring(0, 16)
    }
    
    return cleaned
  }

  useEffect(() => {
    const validation = validatePhone(value)
    setError(validation.isValid ? undefined : validation.error)
    setIsValid(validation.isValid)
    
    if (onValidationChange) {
      onValidationChange(validation.isValid, validation.error)
    }
  }, [value, onValidationChange, required])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatPhone(e.target.value)
    onChange(formattedValue)
  }

  const handleBlur = () => {
    setIsTouched(true)
  }

  const handleFocus = () => {
    setIsTouched(true)
  }

  const showError = isTouched && !isValid && error
  const showSuccess = isTouched && isValid && value.length > 0

  return (
    <div className={cn("space-y-2", className)}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        <input
          type="tel"
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder="+221 XX XXX XX XX"
          disabled={disabled}
          className={cn(
            "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors",
            showError 
              ? "border-red-300 focus:ring-red-500 bg-red-50" 
              : showSuccess
              ? "border-green-300 focus:ring-green-500 bg-green-50"
              : "border-gray-300 focus:ring-orange-500",
            disabled && "bg-gray-100 cursor-not-allowed"
          )}
        />
        
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {showError && (
            <AlertCircle className="h-4 w-4 text-red-500" />
          )}
          {showSuccess && (
            <CheckCircle className="h-4 w-4 text-green-500" />
          )}
        </div>
      </div>
      
      {showError && (
        <p className="text-sm text-red-600 flex items-center">
          <AlertCircle className="h-4 w-4 mr-1" />
          {error}
        </p>
      )}
      
      {!showError && (
        <p className="text-sm text-gray-500">
          Format international requis (ex: +221 XX XXX XX XX)
        </p>
      )}
    </div>
  )
}
