'use client'

import { ProfileWithLinks } from '@/lib/types/database'
import { ShoppingBag, Zap, TrendingUp, ExternalLink, Instagram, Facebook, Twitter, Youtube, Globe, CheckCircle, Sparkles, Mail, MapPin, Briefcase, Calendar, Phone } from 'lucide-react'
import { AddToContactsAuto } from '@/components/AddToContactsAuto'
import { ContactExchangeForm } from "@/components/features/contacts/ContactExchangeForm"
import { useState } from "react"
import { Button } from "@/components/core/ui/button"
import { toast } from "sonner"
import { PublicReviewsSection } from "@/components/features/reviews/PublicReviewsSection"
import { useLinkTracker } from "@/lib/hooks/useLinkTracker"
import { SocialIcon } from "@/components/core/ui/social-icons"
import { OfikaBlinkingLogo } from "@/components/brand/OfikaBlinkingLogo"

interface LinkInBioEcommerceProps {
  profile: ProfileWithLinks
  showAddToContacts?: boolean
  isPreview?: boolean
}

export function LinkInBioEcommerce({ profile, showAddToContacts, isPreview = false }: LinkInBioEcommerceProps) {
  const [isExchangeFormOpen, setIsExchangeFormOpen] = useState(false)
  const { trackAndOpen } = useLinkTracker(profile.id)

  const content = (
    <div className="flex flex-col items-center w-full px-6">
      {/* Glass Profile Header */}
      <div className="relative w-full px-4 -mt-12 mb-6">
        <div className="bg-white/40 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/50 flex flex-col items-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500 rounded-full blur opacity-50"></div>
              <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-xl bg-white">
                {profile.image_url ? (
                  <img src={profile.image_url} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-800 text-3xl font-bold">
                    {profile.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-2xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500 bg-clip-text text-transparent italic tracking-tighter uppercase">
              {profile.name}
            </h1>
          </div>
        </div>
      </div>

      {profile.social_links && profile.social_links.filter((link: any) => !['shop', 'website', 'other'].includes(link.platform)).length > 0 && (
        <div className="flex flex-wrap justify-center gap-4 mb-4">
          {profile.social_links
            .filter((link: any) => !['shop', 'website', 'other'].includes(link.platform))
            .map((link: any, index: number) => (
              <button
                key={index}
                className="w-10 h-10 rounded-xl bg-white shadow-sm border border-gray-100 flex items-center justify-center hover:scale-110 transition-all cursor-pointer p-0"
                onClick={() => trackAndOpen(link.platform, link.url)}
              >
                <SocialIcon platform={link.platform} className="w-5 h-5 text-gray-800" />
              </button>
            ))}
        </div>
      )}

      <div className="w-full mb-8 space-y-3">
        {showAddToContacts && (
          <>
            <AddToContactsAuto
              profile={profile}
              variant="auto"
              size="lg"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-black py-6 rounded-2xl transform active:scale-95 transition-all shadow-lg"
            />
            <Button
              variant="outline"
              className="w-full border-2 border-orange-200 text-orange-600 font-bold py-6 rounded-2xl transform active:scale-95 transition-all"
              onClick={() => setIsExchangeFormOpen(true)}
            >
              <Mail className="w-4 h-4 mr-2" />
              Echanger
            </Button>
          </>
        )}

        {/* Special Links as primary buttons */}
        {profile.social_links
          ?.filter((link: any) => ['shop', 'website', 'other'].includes(link.platform))
          .map((link: any, index: number) => {
            const labels: any = { shop: 'Visiter la Boutique', website: 'Consulter le Site Web', other: 'Autre lien' };
            return (
              <Button
                key={`special-${index}`}
                className="w-full bg-black text-white font-black py-6 rounded-2xl hover:scale-[1.02] transition-all shadow-lg border-none transform active:scale-95"
                onClick={() => trackAndOpen(link.platform, link.url)}
              >
                <div className="flex items-center justify-between w-full px-4">
                  <div className="bg-white/10 p-1 rounded-lg">
                    <SocialIcon platform={link.platform} className="w-5 h-5 text-white" />
                  </div>
                  <span className="uppercase tracking-tighter text-sm">{labels[link.platform] || link.platform}</span>
                  <ExternalLink className="w-4 h-4" />
                </div>
              </Button>
            );
          })}
      </div>

      <div className="w-full space-y-4 mb-8">
        {(profile.custom_links || []).map((link: any, index: number) => (
          <button
            key={index}
            onClick={() => trackAndOpen(link.title, link.url)}
            className="w-full bg-white border-2 border-gray-100 rounded-2xl p-5 hover:border-blue-500 transition-colors cursor-pointer text-left"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  {link.type === 'portfolio' && <Briefcase className="w-5 h-5 text-blue-600" />}
                  {link.type === 'appointment' && <Calendar className="w-5 h-5 text-blue-600" />}
                  {link.type === 'contact' && <Phone className="w-5 h-5 text-blue-600" />}
                  {link.type === 'website' && <Globe className="w-5 h-5 text-blue-600" />}
                  {link.type === 'shop' && <ShoppingBag className="w-5 h-5 text-blue-600" />}
                  {!['portfolio', 'appointment', 'contact', 'website', 'shop'].includes(link.type) && <ExternalLink className="w-5 h-5 text-blue-600" />}
                </div>
                <div>
                  <div className="font-bold text-gray-900">{link.title}</div>
                  <div className="text-[10px] text-blue-600 font-bold uppercase tracking-widest">
                    {link.type === 'shop' ? 'Shop now' : link.type || 'Link'}
                  </div>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400" />
            </div>
          </button>
        ))}
      </div>

      <div className="w-full">
        <PublicReviewsSection profileId={profile.id} className="mb-8" />
      </div>

      <ContactExchangeForm
        profileId={profile.id}
        profileName={profile.name}
        isOpen={isExchangeFormOpen}
        onClose={() => setIsExchangeFormOpen(false)}
        onSuccess={() => toast.success("Sent!")}
      />

      {/* Footer */}
      <div className="mt-12 pb-8 text-center w-full">
        <a 
          href="/onboarding/public-page" 
          className="inline-block hover:scale-110 transition-transform duration-300"
        >
          <OfikaBlinkingLogo fontSize="text-2xl" />
        </a>
      </div>
    </div>
  );

  const header = (
    <div className="relative h-48 overflow-hidden">
      {profile.cover_image_url ? (
        <img src={profile.cover_image_url} alt="Cover" className="w-full h-full object-cover" />
      ) : (
        <div className="absolute inset-0 bg-blue-50" />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-transparent" />
    </div>
  );

  if (isPreview) {
    return (
      <div className="h-full bg-white relative overflow-y-auto">
        {header}
        <div className="relative z-10 -mt-12">{content}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
      <div
        className="relative bg-white shadow-2xl overflow-hidden"
        style={{
          aspectRatio: '390 / 844',
          maxWidth: '390px',
          maxHeight: '844px',
          width: '90vw',
          height: '90vh'
        }}
      >
        <div className="h-full overflow-y-auto overflow-x-hidden relative">
          {header}
          <div className="relative z-10 -mt-12">{content}</div>
        </div>
      </div>
    </div>
  );
}
