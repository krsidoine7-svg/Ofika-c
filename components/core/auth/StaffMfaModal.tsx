'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getStaffMfaStatus, StaffMfaStatus } from '@/lib/auth/mfa'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Shield, KeyRound, QrCode, LogOut, CheckCircle2, Loader2, Copy, Check } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface StaffMfaModalProps {
  onSuccess?: () => void
}

export function StaffMfaModal({ onSuccess }: StaffMfaModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<StaffMfaStatus | null>(null)
  const [code, setCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [enrollData, setEnrollData] = useState<{ id: string; qr: string; secret: string } | null>(null)
  const [copied, setCopied] = useState(false)

  const supabase = createClient()
  const router = useRouter()

  const checkMfa = async () => {
    setLoading(true)
    try {
      const mfaStatus = await getStaffMfaStatus(supabase)
      setStatus(mfaStatus)

      // Sécurité 2FA rendue optionnelle - Ne bloque plus le superadmin
      setIsOpen(false)
      if (onSuccess) onSuccess()
    } catch (err) {
      console.error('Erreur vérification 2FA staff:', err)
    } finally {
      setLoading(false)
    }
  }

  const startEnrollment = async () => {
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        issuer: 'Ofika Admin'
      })
      if (error) throw error

      if (data && data.totp) {
        setEnrollData({
          id: data.id,
          qr: data.totp.qr_code,
          secret: data.totp.secret
        })
      }
    } catch (err: any) {
      toast.error('Erreur lors de l\'initialisation du 2FA')
      console.error('MFA Enroll Error:', err)
    }
  }

  useEffect(() => {
    checkMfa()
  }, [])

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code || code.trim().length !== 6) {
      toast.error('Veuillez saisir le code à 6 chiffres')
      return
    }

    setSubmitting(true)
    try {
      const factorId = status?.isEnrolled ? status.factorId! : enrollData?.id

      if (!factorId) {
        throw new Error('Identifiant de facteur manquant')
      }

      // Valider le code TOTP
      const { data, error } = await supabase.auth.mfa.challengeAndVerify({
        factorId,
        code: code.trim()
      })

      if (error) throw error

      toast.success('Double authentification validée avec succès !')
      setIsOpen(false)
      if (onSuccess) onSuccess()
      router.refresh()
    } catch (err: any) {
      console.error('Erreur validation 2FA:', err)
      toast.error('Code à 6 chiffres invalide ou expiré')
    } finally {
      setSubmitting(false)
    }
  }

  const copySecret = () => {
    if (!enrollData?.secret) return
    navigator.clipboard.writeText(enrollData.secret)
    setCopied(true)
    toast.success('Clé secrète copiée !')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading || !isOpen) {
    return null
  }

  const isEnrolling = !status?.isEnrolled

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-md p-6 bg-white rounded-2xl shadow-2xl border-0 sm:max-w-md [&>button]:hidden">
        <DialogHeader className="text-center space-y-2">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto text-orange-600 mb-1">
            <Shield className="w-6 h-6" />
          </div>
          <DialogTitle className="text-xl font-bold text-gray-900">
            {isEnrolling ? 'Activer la Double Authentification (2FA)' : 'Vérification de Sécurité (2FA)'}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            {isEnrolling
              ? 'En tant qu\'administrateur, la double authentification est obligatoire pour sécuriser l\'accès à la plateforme.'
              : 'Entrez le code à 6 chiffres généré par votre application d\'authentification (Google Authenticator, Apple Passwords).'}
          </DialogDescription>
        </DialogHeader>

        {isEnrolling && enrollData && (
          <div className="space-y-4 my-2">
            <div className="flex justify-center p-3 bg-gray-50 rounded-xl border border-gray-100">
              <img
                src={enrollData.qr}
                alt="QR Code 2FA"
                className="w-44 h-44 object-contain"
              />
            </div>
            <div className="text-xs text-gray-500 text-center">
              Scannez ce QR Code avec votre application d&apos;authentification ou utilisez la clé :
            </div>
            <div className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
              <span className="font-mono text-xs text-gray-700 tracking-wider truncate max-w-[240px]">
                {enrollData.secret}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={copySecret}
                className="h-7 px-2 text-xs text-orange-600 hover:text-orange-700"
              >
                {copied ? <Check className="w-3.5 h-3.5 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                {copied ? 'Copié' : 'Copier'}
              </Button>
            </div>
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="totp-code" className="text-sm font-medium text-gray-700">
              Code de vérification (6 chiffres)
            </Label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="totp-code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                className="pl-10 text-center text-lg tracking-widest font-mono h-11"
                required
                autoFocus
                disabled={submitting}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white h-11 font-medium"
            disabled={submitting || code.length !== 6}
          >
            {submitting ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Vérification en cours...
              </div>
            ) : isEnrolling ? (
              'Confirmer et activer le 2FA'
            ) : (
              'Valider et accéder'
            )}
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={handleSignOut}
            className="w-full text-xs text-gray-500 hover:text-red-600 flex items-center justify-center gap-1 h-9"
          >
            <LogOut className="w-3.5 h-3.5 mr-1" />
            Se déconnecter
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
