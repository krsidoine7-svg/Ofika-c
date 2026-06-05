'use client'

import { Button } from "@/components/ui/button"
import {
  UserPlus,
  Phone,
  Mail,
  MapPin,
  Instagram,
  Globe,
  ExternalLink,
  Facebook,
  Twitter,
  MessageCircle,
  Play,
  Music,
  Briefcase,
  Calendar,
  ShoppingBag
} from "lucide-react"
import { ProfileWithLinks } from "@/lib/types/database"
import { toast } from "sonner"
import { AddToContactsAuto } from "@/components/AddToContactsAuto"
import { SocialIcon } from "@/components/ui/social-icons"
import { ContactExchangeForm } from "@/components/features/contacts/ContactExchangeForm"
import { useState } from "react"
import { PublicReviewsSection } from "@/components/features/reviews/PublicReviewsSection"
import { useLinkTracker } from "@/lib/hooks/useLinkTracker"
import { OfikaBlinkingLogo } from "@/components/brand/OfikaBlinkingLogo"

interface LinkInBioDesign4Props {
  profile: ProfileWithLinks
  showAddToContacts?: boolean
  onAddToContacts?: () => void
  isPreview?: boolean
}

export function LinkInBioDesign4({
  profile,
  showAddToContacts = false,
  onAddToContacts,
  isPreview = false
}: LinkInBioDesign4Props) {
  const [isExchangeFormOpen, setIsExchangeFormOpen] = useState(false)
  const { trackAndOpen } = useLinkTracker(profile.id)

  const getLinkIcon = (link: any) => {
    const iconClass = "w-4 h-4 text-black"
    if (link.type === 'website') return <Globe className={iconClass} />
    if (link.type === 'shop') return <ShoppingBag className={iconClass} />
    if (link.type === 'portfolio') return <Briefcase className={iconClass} />
    if (link.type === 'appointment') return <Calendar className={iconClass} />
    if (link.type === 'contact') return <Phone className={iconClass} />
    return <ExternalLink className={iconClass} />
  }

  const deviceDimensions = { width: 390, height: 844 }
  const deviceAspectRatio = '390 / 844'

  const content = (
    <div className="flex flex-col items-center w-full font-sans text-black">
      {/* Container Layout Style like Classique */}
      <div className="relative w-[85%] mx-auto -mt-7 mb-6">
        <div className="bg-white/10 backdrop-blur-sm border border-white/40 rounded-2xl p-3 shadow-md flex flex-row items-center justify-center gap-4">
          {/* Profile Photo - Grayscale Rectangle like requested */}
          <div className="flex-shrink-0">
            {profile.image_url ? (
              <img
                src={profile.image_url}
                alt={profile.name}
                className="w-10 h-14 rounded-lg object-cover border border-white shadow-sm contrast-[1.1]"
              />
            ) : (
              <div className="w-10 h-14 rounded-lg bg-black flex items-center justify-center text-white text-xs font-bold border border-white shadow-sm">
                {profile.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Name */}
          <h1 className="text-sm font-black text-black uppercase tracking-tight text-left">
            {profile.name}
          </h1>
        </div>
      </div>

      {/* Bio */}
      {profile.bio && (
        <p className="text-sm text-black/70 mb-4 leading-relaxed text-center px-4 max-w-xs font-medium">
          {profile.bio}
        </p>
      )}

      {/* Localisation */}
      {profile.location && (
        <div className="flex items-center justify-center text-black/40 mb-6 text-xs font-black uppercase tracking-widest">
          <MapPin className="w-3 h-3 mr-1" />
          {profile.location}
        </div>
      )}

      {/* Social Media Icons - B&W Circular style */}
      {profile.social_links && profile.social_links.filter((link: any) => !['shop', 'website', 'other'].includes(link.platform) && link.is_active !== false).length > 0 && (
        <div className="w-full mb-10">
          <div className="flex flex-wrap justify-center gap-4">
            {profile.social_links
              .filter((link: any) => !['shop', 'website', 'other'].includes(link.platform) && link.is_active !== false)
              .map((link: any, index: number) => (
                <button
                  key={index}
                  className="w-12 h-12 rounded-xl bg-white border-2 border-black/5 shadow-md flex items-center justify-center hover:bg-black hover:text-white transition-all group p-0"
                  onClick={() => trackAndOpen(link.platform, link.url)}
                >
                  <SocialIcon platform={link.platform} className="w-6 h-6" />
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Primary Actions - B&W High contrast */}
      <div className="w-full mb-8 space-y-3 px-4">
        {showAddToContacts && (
          <>
            <AddToContactsAuto
              profile={profile}
              variant="auto"
              size="lg"
              className="w-full bg-black hover:bg-black text-white rounded-xl py-7 shadow-lg transform active:scale-95 transition-all text-sm font-black border-none"
            />
            <Button
              variant="outline"
              className="w-full border-2 border-black/5 bg-gray-50 text-black py-7 rounded-xl font-black transform active:scale-95 transition-all"
              onClick={() => setIsExchangeFormOpen(true)}
            >
              <Mail className="w-4 h-4 mr-2" />
              Échanger
            </Button>
          </>
        )}

        {/* Special Links - Minimalist rows */}
        {profile.social_links
          ?.filter((link: any) => ['shop', 'website', 'other'].includes(link.platform) && link.is_active !== false)
          .map((link: any, index: number) => {
            const labels: any = { shop: 'Ma Boutique', website: 'Mon Site Web', other: 'Mon Lien' };
            return (
              <Button
                key={`special-${index}`}
                className="w-full bg-white border border-black/10 text-black py-7 rounded-xl hover:bg-black hover:text-white transition-all shadow-md group transform active:scale-95 px-6"
                onClick={() => trackAndOpen(link.platform, link.url)}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <SocialIcon platform={link.platform} className="w-4 h-4" />
                    <span className="font-bold tracking-tight">{labels[link.platform] || link.platform}</span>
                  </div>
                  <ExternalLink className="w-4 h-4 opacity-30 group-hover:opacity-100" />
                </div>
              </Button>
            );
          })}
      </div>

      {/* Custom Links - Stark White buttons */}
      {profile.custom_links && profile.custom_links.filter((l: any) => l.is_active !== false).length > 0 && (
        <div className="w-full space-y-3 mb-8 px-4">
          {profile.custom_links.filter((l: any) => l.is_active !== false).map((link: any, index: number) => (
            <Button
              key={index}
              variant="outline"
              className="w-full py-7 px-6 rounded-xl border-2 border-black/5 bg-white shadow-sm flex items-center justify-between group hover:border-black transition-all"
              onClick={() => trackAndOpen(link.title, link.url)}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-black/5 rounded-lg flex items-center justify-center">
                  {getLinkIcon(link)}
                </div>
                <span className="font-bold text-black uppercase tracking-tight text-xs">{link.title}</span>
              </div>
              <ExternalLink className="w-4 h-4 opacity-20 group-hover:opacity-100" />
            </Button>
          ))}
        </div>
      )}

      {/* Reviews */}
      <div className="w-full px-4 mb-8">
        <div className="bg-gray-50 border border-black/5 rounded-3xl p-1">
          <PublicReviewsSection profileId={profile.id} className="contrast-125" />
        </div>
      </div>

      <ContactExchangeForm
        profileId={profile.id}
        profileName={profile.name}
        isOpen={isExchangeFormOpen}
        onClose={() => setIsExchangeFormOpen(false)}
        onSuccess={() => toast.success("Envoyé !")}
      />

      {/* Footer Branding */}
      <div className="mt-3 pb-3 text-center w-full px-8">
        <div className="h-0.5 w-full bg-black/5 mb-2" />
        <a 
          href="/onboarding/public-page" 
          className="inline-flex flex-col items-center group"
        >
          <div className="bg-white border-2 border-black/10 p-2 rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
            <OfikaBlinkingLogo fontSize="text-xl" />
          </div>
        </a>
      </div>
    </div>
  );

  const coverSection = (
    <div className="absolute top-0 left-0 right-0 h-44 sm:h-52 overflow-hidden z-0 bg-gray-200">
      {profile.cover_image_url ? (
        <>
          <img src={profile.cover_image_url} alt="Cover" className="w-full h-full object-cover opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/20"></div>
        </>
      ) : (
        <div className="w-full h-full bg-gray-300"></div>
      )}
    </div>
  );

  if (isPreview) {
    return (
      <div className="h-full bg-white relative overflow-y-auto custom-scrollbar">
        {coverSection}
        <div className="relative z-10 p-4 pt-36">{content}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div
        className="relative bg-white shadow-2xl overflow-hidden"
        style={{
          aspectRatio: deviceAspectRatio,
          maxWidth: `${deviceDimensions.width}px`,
          maxHeight: `${deviceDimensions.height}px`,
          width: '90vw',
          height: '90vh'
        }}
      >
        <div className="h-full overflow-y-auto overflow-x-hidden relative bg-white custom-scrollbar">
          {coverSection}
          <div className="relative z-10 p-6 pt-36 sm:pt-44">{content}</div>
        </div>
      </div>
    </div>
  );
}
