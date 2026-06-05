'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { 
  Phone, 
  Mail, 
  MapPin, 
  Instagram, 
  Linkedin, 
  Globe,
  User,
  Building,
  Briefcase,
  Heart,
  QrCode
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { NFCProfile } from '@/lib/types/nfc-card-onboarding'

interface DesignCardsPublicProps {
  profile: NFCProfile
  className?: string
}

// Configuration des styles selon le design choisi
const DESIGN_STYLES = {
  classic: {
    container: 'bg-white border border-gray-200 shadow-lg',
    header: 'bg-gradient-to-r from-gray-50 to-gray-100',
    accent: 'border-gray-300',
    text: 'text-gray-900',
    subtitle: 'text-gray-600'
  },
  modern: {
    container: 'bg-gradient-to-br from-white to-gray-50 border-0 shadow-xl',
    header: 'bg-gradient-to-r from-blue-50 to-purple-50',
    accent: 'border-blue-200',
    text: 'text-gray-900',
    subtitle: 'text-gray-700'
  },
  minimal: {
    container: 'bg-white border-2 border-gray-100 shadow-sm',
    header: 'bg-white',
    accent: 'border-gray-200',
    text: 'text-gray-900',
    subtitle: 'text-gray-500'
  },
  'ofika-optimized': {
    container: 'bg-gradient-to-br from-orange-50 to-pink-50 border-0 shadow-xl',
    header: 'bg-gradient-to-r from-orange-100 to-pink-100',
    accent: 'border-orange-200',
    text: 'text-gray-900',
    subtitle: 'text-gray-700'
  }
} as const

// Configuration des couleurs selon le thème
const COLOR_THEMES = {
  ofika: {
    primary: 'bg-gradient-to-r from-orange-500 to-pink-500',
    button: 'bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-700 hover:to-pink-700',
    accent: 'text-orange-600',
    icon: 'text-orange-500'
  },
  blue: {
    primary: 'bg-gradient-to-r from-blue-500 to-purple-500',
    button: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700',
    accent: 'text-blue-600',
    icon: 'text-blue-500'
  },
  green: {
    primary: 'bg-gradient-to-r from-green-500 to-cyan-500',
    button: 'bg-gradient-to-r from-green-600 to-cyan-600 hover:from-green-700 hover:to-cyan-700',
    accent: 'text-green-600',
    icon: 'text-green-500'
  },
  red: {
    primary: 'bg-gradient-to-r from-red-500 to-orange-500',
    button: 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700',
    accent: 'text-red-600',
    icon: 'text-red-500'
  },
  purple: {
    primary: 'bg-gradient-to-r from-purple-500 to-pink-500',
    button: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700',
    accent: 'text-purple-600',
    icon: 'text-purple-500'
  },
  gray: {
    primary: 'bg-gradient-to-r from-gray-500 to-gray-700',
    button: 'bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900',
    accent: 'text-gray-600',
    icon: 'text-gray-500'
  },
  black: {
    primary: 'bg-gradient-to-r from-black to-gray-800',
    button: 'bg-gradient-to-r from-black to-gray-900 hover:from-gray-800 hover:to-black',
    accent: 'text-black',
    icon: 'text-gray-700'
  },
  white: {
    primary: 'bg-gradient-to-r from-white to-gray-100',
    button: 'bg-gradient-to-r from-gray-800 to-black hover:from-gray-900 hover:to-black',
    accent: 'text-gray-800',
    icon: 'text-gray-600'
  }
} as const

// Animation variants pour Framer Motion
const cardVariants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    scale: 0.95
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut" as const,
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
}

export function DesignCardsPublic({ profile, className }: DesignCardsPublicProps) {
  // Récupération des styles selon le design et la couleur
  const designStyle = DESIGN_STYLES[profile.design_choice as keyof typeof DESIGN_STYLES] || DESIGN_STYLES.classic
  const colorTheme = COLOR_THEMES[profile.color_theme as keyof typeof COLOR_THEMES] || COLOR_THEMES.ofika

  // Fonction pour gérer l'ajout aux contacts
  const handleAddToContacts = () => {
    console.log('Ajouter aux contacts:', {
      name: profile.full_name,
      company: profile.company,
      email: profile.email,
      phone: profile.phone,
      profileUrl: profile.nfc_link
    })
    
    // Ici vous pouvez intégrer la logique réelle d'ajout aux contacts
    // Par exemple : générer un fichier vCard, ouvrir l'app Contacts, etc.
  }

  // Génération des initiales pour l'avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Fonction pour nettoyer les URLs des réseaux sociaux
  const cleanSocialUrl = (url: string | undefined | null) => {
    if (!url) return undefined
    if (url.startsWith('http')) return url
    return `https://${url}`
  }

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className={cn('w-full max-w-md mx-auto', className)}
    >
      <Card className={cn(
        'overflow-hidden transition-all duration-300 hover:shadow-2xl',
        designStyle.container
      )}>
        {/* Header avec gradient */}
        <div className={cn('px-6 py-8 text-center', designStyle.header)}>
          <motion.div variants={itemVariants}>
            <Avatar className="w-24 h-24 mx-auto mb-4 ring-4 ring-white shadow-lg">
              <AvatarImage 
                src={profile.logo_url} 
                alt={profile.full_name}
                className="object-cover"
              />
              <AvatarFallback className={cn('text-2xl font-bold text-white', colorTheme.primary)}>
                {getInitials(profile.full_name)}
              </AvatarFallback>
            </Avatar>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-2">
            <h1 className={cn('text-2xl font-bold', designStyle.text)}>
              {profile.full_name}
            </h1>
            
            {profile.job_title && (
              <div className="flex items-center justify-center gap-2">
                <Briefcase className={cn('w-4 h-4', colorTheme.icon)} />
                <p className={cn('text-lg font-medium', colorTheme.accent)}>
                  {profile.job_title}
                </p>
              </div>
            )}
            
            {profile.company && (
              <div className="flex items-center justify-center gap-2">
                <Building className={cn('w-4 h-4', colorTheme.icon)} />
                <p className={cn('text-base', designStyle.subtitle)}>
                  {profile.company}
                </p>
              </div>
            )}
          </motion.div>

          {/* Bio */}
          {profile.bio && (
            <motion.div variants={itemVariants} className="mt-4">
              <p className={cn('text-sm leading-relaxed', designStyle.subtitle)}>
                {profile.bio}
              </p>
            </motion.div>
          )}
        </div>

        {/* Contenu principal */}
        <CardContent className="px-6 py-6 space-y-6">
          {/* Informations de contact */}
          <motion.div variants={itemVariants} className="space-y-3">
            {profile.phone && (
              <div className="flex items-center gap-3">
                <Phone className={cn('w-5 h-5', colorTheme.icon)} />
                <a 
                  href={`tel:${profile.phone}`}
                  className={cn('text-sm hover:underline', designStyle.text)}
                >
                  {profile.phone}
                </a>
              </div>
            )}
            
            {profile.email && (
              <div className="flex items-center gap-3">
                <Mail className={cn('w-5 h-5', colorTheme.icon)} />
                <a 
                  href={`mailto:${profile.email}`}
                  className={cn('text-sm hover:underline', designStyle.text)}
                >
                  {profile.email}
                </a>
              </div>
            )}
            
            {profile.location && (
              <div className="flex items-center gap-3">
                <MapPin className={cn('w-5 h-5', colorTheme.icon)} />
                <span className={cn('text-sm', designStyle.text)}>
                  {profile.location}
                </span>
              </div>
            )}
          </motion.div>

          {/* Réseaux sociaux */}
          {(profile.instagram || profile.linkedin || profile.other_links) && (
            <motion.div variants={itemVariants} className="space-y-3">
              <h3 className={cn('text-sm font-semibold', designStyle.text)}>
                Réseaux sociaux
              </h3>
              <div className="flex flex-wrap gap-3">

                {/* Instagram */}
                {profile.instagram && (
                  <a
                    href={cleanSocialUrl(profile.instagram)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white text-sm hover:shadow-lg transition-all duration-200"
                  >
                    <Instagram className="w-4 h-4" />
                    <span>Instagram</span>
                  </a>
                )}
                {/* LinkedIn */}
                {profile.linkedin && (
                  <a
                    href={cleanSocialUrl(profile.linkedin)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-full bg-blue-600 text-white text-sm hover:bg-blue-700 transition-all duration-200"
                  >
                    <Linkedin className="w-4 h-4" />
                    <span>LinkedIn</span>
                  </a>
                )}
                {/* Autres liens */}
                {profile.other_links && (
                  <a
                    href={cleanSocialUrl(profile.other_links)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-full bg-gray-600 text-white text-sm hover:bg-gray-700 transition-all duration-200"
                  >
                    <Globe className="w-4 h-4" />
                    <span>Site web</span>
                  </a>
                )}
              </div>
            </motion.div>
          )}

          {/* QR Code si disponible */}
          {profile.qr_code_url && (
            <motion.div variants={itemVariants} className="text-center">
              <div className="inline-block p-4 bg-white rounded-lg shadow-md">
                <img 
                  src={profile.qr_code_url} 
                  alt="QR Code" 
                  className="w-24 h-24 mx-auto"
                />
                <p className="text-xs text-gray-500 mt-2">Scanner pour ajouter aux contacts</p>
              </div>
            </motion.div>
          )}

          {/* Bouton CTA principal */}
          <motion.div variants={itemVariants}>
            <Button
              onClick={handleAddToContacts}
              className={cn(
                'w-full text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 hover:shadow-lg transform hover:scale-105',
                colorTheme.button
              )}
            >
              <User className="w-4 h-4 mr-2" />
              Ajouter à mes contacts
            </Button>
          </motion.div>

          {/* Footer avec marque */}
          <motion.div variants={itemVariants} className="pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Heart className="w-3 h-3 text-red-500" />
                <span>Créé avec Ofika</span>
              </div>
              <span>© 2024</span>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Composant wrapper pour la page publique
export function PublicProfileCard({ profile }: { profile: NFCProfile }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <DesignCardsPublic profile={profile} />
    </div>
  )
}
