'use client'

import React, { useState, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { createClient } from '@/lib/supabase/client'
import { useCreatePayment } from '@/lib/hooks/usePayments'
import { toast } from 'sonner'
import { Loader2, Upload, AlertCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface WaveReceiptUploadButtonProps {
  orderId: string
  paymentStatus: string
  onUploadComplete?: () => void
  className?: string
}

export function WaveReceiptUploadButton({ orderId, paymentStatus, onUploadComplete, className }: WaveReceiptUploadButtonProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const supabase = createClient()
  const { uploadReceipt } = useCreatePayment()

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${orderId}-${Math.random()}.${fileExt}`
      const filePath = `receipts/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('order_receipts')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('order_receipts')
        .getPublicUrl(filePath)

      const submitResult = await uploadReceipt(orderId, publicUrl)

      if (submitResult.success) {
        toast.success('Preuve de paiement soumise avec succès !')
        setIsDialogOpen(false)
        if (onUploadComplete) onUploadComplete()
      } else {
        throw new Error(submitResult.error || 'Erreur lors de la soumission')
      }
    } catch (err: any) {
      console.error('Error uploading receipt:', err)
      toast.error(`Échec de l'envoi : ${err.message}`)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleClick = () => {
    if (paymentStatus === 'failed') {
      setIsDialogOpen(true)
    } else {
      fileInputRef.current?.click()
    }
  }

  const isFailed = paymentStatus === 'failed'

  return (
    <>
      <Button
        onClick={handleClick}
        disabled={isUploading}
        className={cn(
          "w-full text-xs py-1 font-bold shadow-sm transition-all flex items-center justify-center gap-2",
          isFailed 
            ? "bg-red-600 hover:bg-red-700 text-white" 
            : "bg-orange-500 hover:bg-orange-600 text-white",
          className
        )}
      >
        {isUploading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Upload className="h-4 w-4" />
        )}
        {isUploading 
          ? "Envoi en cours..." 
          : isFailed 
            ? "Reçu Invalide - Renvoyer" 
            : "Uploader le justificatif"
        }
      </Button>

      {/* Hidden file input for direct upload (pending status) */}
      <input 
        type="file" 
        accept="image/*" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleFileSelect} 
      />

      {/* Dialog for failed status */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl p-6">
          <DialogHeader className="text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto text-red-600 mb-2">
              <AlertCircle className="w-6 h-6" />
            </div>
            <DialogTitle className="text-xl font-black text-gray-900">
              Reçu non validé
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600 font-medium">
              Votre précédent reçu n'a pas pu être validé par notre équipe (image floue, fausse capture ou montant incorrect). 
              Veuillez uploader une nouvelle capture d'écran valide de votre transfert Wave.
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-6 flex flex-col items-center justify-center gap-4">
            <label className="w-full flex flex-col items-center justify-center border-2 border-dashed border-red-200 rounded-xl p-6 cursor-pointer hover:bg-red-50 transition-all group">
              <Upload className="h-8 w-8 text-red-400 mb-3 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-bold text-red-600">Choisir une nouvelle image</span>
              <span className="text-xs text-gray-400 mt-1 block">Galerie ou Appareil photo</span>
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileSelect}
                disabled={isUploading}
              />
            </label>

            {isUploading && (
              <div className="flex items-center gap-2 text-sm font-semibold text-orange-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                Envoi sécurisé en cours...
              </div>
            )}
          </div>
          
          <DialogFooter className="mt-6">
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
              className="w-full font-bold"
              disabled={isUploading}
            >
              Annuler
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
