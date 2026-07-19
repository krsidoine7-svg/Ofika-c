'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { User, Upload, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'

interface Step1BasicInfoProps {
  data: any
  onChange: (data: any) => void
  onNext: () => void
}

export function Step1BasicInfo({ data, onChange, onNext }: Step1BasicInfoProps) {
  const [formData, setFormData] = useState({
    fullName: data.fullName || '',
    username: data.username || '',
    bio: data.bio || '',
    profilePhoto: data.profilePhoto || null,
    profilePhotoPreview: data.profilePhotoPreview || null
  })

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Handler pour les changements de champ
  const handleChange = (field: string, value: any) => {
    const updated = { ...formData, [field]: value }
    setFormData(updated)
    onChange(updated)
  }

  // Handler pour l'upload de photo
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image')
      return
    }

    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('L\'image ne doit pas dépasser 5MB')
      return
    }

    // Créer un aperçu
    const reader = new FileReader()
    reader.onloadend = () => {
      const updated = {
        ...formData,
        profilePhoto: file,
        profilePhotoPreview: reader.result as string
      }
      setFormData(updated)
      onChange(updated)
    }
    reader.readAsDataURL(file)
  }

  // Générer un username à partir du nom complet
  const generateUsername = () => {
    if (!formData.fullName) return

    const username = formData.fullName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Enlever les accents
      .replace(/[^a-z0-9]/g, '-') // Remplacer les caractères spéciaux par -
      .replace(/-+/g, '-') // Remplacer les -- par -
      .replace(/^-|-$/g, '') // Enlever les - au début et à la fin

    handleChange('username', username)
    toast.success('Username généré !')
  }

  // Validation du formulaire
  const isValid = () => {
    return formData.fullName.trim().length > 0 && 
           formData.username.trim().length > 0
  }

  const handleSubmit = () => {
    if (!isValid()) {
      toast.error('Veuillez remplir les champs requis')
      return
    }

    // Vérifier le format du username
    const usernameRegex = /^[a-z0-9-]+$/
    if (!usernameRegex.test(formData.username)) {
      toast.error('Le username ne doit contenir que des lettres minuscules, chiffres et tirets')
      return
    }

    onNext()
  }

  return (
    <div className="space-y-6">
      {/* Photo de profil */}
      <div className="flex flex-col items-center gap-4 p-6 bg-gray-50 rounded-lg">
        <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
          <AvatarImage src={formData.profilePhotoPreview || ''} />
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-4xl">
            {formData.fullName ? formData.fullName[0].toUpperCase() : <User className="h-12 w-12" />}
          </AvatarFallback>
        </Avatar>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handlePhotoUpload}
        />

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-4 w-4 mr-2" />
          {formData.profilePhotoPreview ? 'Changer la photo' : 'Ajouter une photo'}
        </Button>

        <p className="text-xs text-gray-500 text-center">
          Format : JPG, PNG ou WebP • Taille max : 5MB
        </p>
      </div>

      {/* Nom complet */}
      <div className="space-y-2">
        <Label htmlFor="fullName" className="text-base font-semibold">
          Nom complet <span className="text-red-500">*</span>
        </Label>
        <Input
          id="fullName"
          type="text"
          placeholder="Ex: Jean Dupont"
          value={formData.fullName}
          onChange={(e) => handleChange('fullName', e.target.value)}
          className="text-lg"
        />
        <p className="text-sm text-gray-500">
          Votre nom tel qu'il apparaîtra sur votre page
        </p>
      </div>

      {/* Username */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="username" className="text-base font-semibold">
            Nom d'utilisateur <span className="text-red-500">*</span>
          </Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={generateUsername}
            disabled={!formData.fullName}
          >
            Générer automatiquement
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-500 font-medium">
            {(process.env.NEXT_PUBLIC_APP_URL || 'ofika.com')
              .replace(/^https?:\/\//, '')
              .replace(/\/$/, '') + '/'}
          </span>
          <Input
            id="username"
            type="text"
            placeholder="mon-nom"
            value={formData.username}
            onChange={(e) => handleChange('username', e.target.value.toLowerCase())}
            className="text-lg"
            pattern="[a-z0-9-]+"
          />
        </div>
        <p className="text-sm text-gray-500">
          Lettres minuscules, chiffres et tirets uniquement
        </p>
      </div>

      {/* Bio */}
      <div className="space-y-2">
        <Label htmlFor="bio" className="text-base font-semibold">
          Biographie
        </Label>
        <Textarea
          id="bio"
          placeholder="Parlez un peu de vous..."
          value={formData.bio}
          onChange={(e) => handleChange('bio', e.target.value)}
          rows={4}
          className="resize-none"
          maxLength={500}
        />
        <div className="flex justify-between text-sm">
          <p className="text-gray-500">Optionnel, mais recommandé</p>
          <p className="text-gray-400">{formData.bio.length}/500</p>
        </div>
      </div>

      {/* Bouton suivant */}
      <div className="flex justify-end pt-4">
        <Button
          onClick={handleSubmit}
          size="lg"
          disabled={!isValid()}
          className="min-w-[200px]"
        >
          Continuer
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
