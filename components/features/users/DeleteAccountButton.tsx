"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useUser } from '@/lib/hooks/useUser'
import { Loader2, Trash2, AlertTriangle, Lock } from 'lucide-react'

export function DeleteAccountButton() {
  const { deleteAccount } = useUser()
  const [isOpen, setIsOpen] = useState(false)
  const [password, setPassword] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    if (!password) {
      setError('Veuillez entrer votre mot de passe')
      return
    }

    setIsDeleting(true)
    setError(null)

    const success = await deleteAccount({ password })
    
    if (!success) {
      setIsDeleting(false)
    }
    // Si succès, l'utilisateur sera redirigé automatiquement
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      setPassword('')
      setError(null)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-red-200 shadow-[0_8px_30px_rgb(220,38,38,0.06)] p-6 md:p-8">
      <Alert variant="destructive" className="mb-6 bg-red-50/50 border-red-100">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle className="font-bold">Attention</AlertTitle>
        <AlertDescription className="mt-2 text-red-700">
          La suppression de votre compte est définitive et irréversible. Toutes vos données seront perdues.
        </AlertDescription>
      </Alert>

      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button variant="destructive" className="w-full h-12 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-md transition-all font-medium">
            <Trash2 className="mr-2 h-4 w-4" />
            Supprimer mon compte
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Confirmer la suppression
            </DialogTitle>
            <DialogDescription>
              Cette action est irréversible. Toutes vos données seront définitivement supprimées.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Alert variant="destructive">
              <AlertDescription className="text-sm">
                <strong>Vous allez perdre :</strong>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Tous vos profils</li>
                  <li>Toutes vos cartes NFC</li>
                  <li>Toutes vos commandes</li>
                  <li>Toutes vos statistiques</li>
                  <li>Tous vos paramètres</li>
                </ul>
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Entrez votre mot de passe pour confirmer
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Votre mot de passe"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setError(null)
                  }}
                  className="pl-10 h-11 rounded-lg"
                  disabled={isDeleting}
                />
              </div>
              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isDeleting}
              className="w-full sm:w-auto h-11 rounded-lg"
            >
              Annuler
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting || !password}
              className="w-full sm:w-auto h-11 rounded-lg"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Suppression...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer définitivement
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
