'use client'

import { ProfileWithLinks } from '@/lib/types/database'
import { Instagram, Youtube, Music, Facebook, Twitter, Globe, ExternalLink, Users, Mail, MapPin, CheckCircle2, Briefcase, Calendar, ShoppingBag, Phone } from 'lucide-react'
import { AddToContactsAuto } from '@/components/AddToContactsAuto'
import { ContactExchangeForm } from "@/components/features/contacts/ContactExchangeForm"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { PublicReviewsSection } from "@/components/features/reviews/PublicReviewsSection"
import { useLinkTracker } from "@/lib/hooks/useLinkTracker"
import { SocialIcon } from "@/components/ui/social-icons"
import { OfikaBlinkingLogo } from "@/components/brand/OfikaBlinkingLogo"

interface LinkInBioInfluencerProps {
  profile: ProfileWithLinks
  showAddToContacts?: boolean
  isPreview?: boolean
}

export function LinkInBioInfluencer({ profile, showAddToContacts, isPreview = false }: LinkInBioInfluencerProps) {
  const [isExchangeFormOpen, setIsExchangeFormOpen] = useState(false)
  const { trackAndOpen } = useLinkTracker(profile.id)

  const formatCount = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
    return num.toString()
  }

  const socialConfig: Record<string, any> = {
    instagram: { icon: Instagram, color: 'from-purple-600 to-pink-600' },
    tiktok: { icon: Music, color: 'from-black to-gray-800' },
    youtube: { icon: Youtube, color: 'from-red-600 to-red-700' },
    twitter: { icon: Twitter, color: 'from-sky-500 to-blue-500' },
    facebook: { icon: Facebook, color: 'from-blue-600 to-blue-700' }
  }

  const content = (
    <div className="flex flex-col items-center w-full px-6">
      {/* Glass Profile Header */}
      <div className="relative w-full px-4 -mt-4 mb-6">
        <div className="flex flex-col items-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-2xl">
                {profile.image_url ? (
                  <img src={profile.image_url} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-800 text-white text-3xl font-bold">
                    {profile.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-2xl font-black bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent italic">
              {profile.name}
            </h1>
          </div>
        </div>
      </div>

      {/* Social Icons (Standard) - Moved Above Actions */}
      {profile.social_links && profile.social_links.filter((link: any) => !['shop', 'website', 'other'].includes(link.platform)).length > 0 && (
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {profile.social_links
            .filter((link: any) => !['shop', 'website', 'other'].includes(link.platform))
            .map((link: any, index: number) => {
              return (
                <button
                  key={index}
                  onClick={() => trackAndOpen(link.platform, link.url)}
                  className="relative w-12 h-12 rounded-[16px] bg-white flex items-center justify-center transition-all duration-500 shadow-[0_6px_15px_-3px_rgba(0,0,0,0.1)] hover:shadow-[0_12px_25px_-5px_rgba(0,0,0,0.15)] hover:-translate-y-1.5 active:scale-95 group p-0 overflow-hidden border border-gray-50"
                >
                  {/* Realistic Glare Effect */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                  <div className="relative transform group-hover:scale-110 transition-transform duration-300">
                    <SocialIcon platform={link.platform} className="w-7 h-7" />
                  </div>
                </button>
              )
            })}
        </div>
      )}

      <div className="w-full mb-8 space-y-3">
        {showAddToContacts && (
          <>
            <AddToContactsAuto
              profile={profile}
              variant="auto"
              size="lg"
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-6 rounded-xl transform active:scale-95 transition-all shadow-lg"
            />
            <Button
              variant="outline"
              className="w-full bg-black border-white/10 hover:border-white/40 text-white py-6 rounded-xl transform active:scale-95 transition-all duration-300"
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
            const labels: any = { shop: 'Ma Boutique', website: 'Mon Site Web', other: 'Autre lien' };
            const config = socialConfig[link.platform] || { icon: Globe, color: 'from-gray-600 to-gray-700' }
            return (
              <Button
                key={`special-${index}`}
                className="w-full bg-white/10 backdrop-blur-md text-white font-bold py-6 rounded-xl border border-white/20 hover:border-white/50 hover:bg-white/20 transition-all duration-300 flex items-center justify-between px-6 transform active:scale-95 shadow-md group"
                onClick={() => trackAndOpen(link.platform, link.url)}
              >
                <div className={`relative w-11 h-11 rounded-[14px] bg-gradient-to-br ${config.color} flex items-center justify-center shadow-[0_4px_10px_-2px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.3)] group-hover:shadow-[0_8px_15px_-3px_rgba(0,0,0,0.4)] transition-all duration-300 overflow-hidden border border-white/10 group-hover:-translate-y-0.5`}>
                  {/* Glare effect like the main icons */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <SocialIcon platform={link.platform} className="w-5 h-5 text-white relative z-10 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <span className="uppercase tracking-widest text-[10px]">{labels[link.platform] || link.platform}</span>
                <div className="relative w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] group-hover:bg-white/10 transition-all duration-300 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <ExternalLink className="w-4 h-4 text-white opacity-40 group-hover:opacity-100 transition-opacity" />
                </div>
              </Button>
            );
          })}
      </div>

      <div className="w-full space-y-2 mb-8">
        {(profile.custom_links || []).map((link: any, index: number) => (
          <button
            key={index}
            onClick={() => trackAndOpen(link.title, link.url)}
            className="w-full bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 hover:border-orange-500/60 rounded-xl py-4 flex items-center justify-between px-6 group transition-all duration-300"
          >
            <div className="flex items-center gap-4">
              <div className="text-white opacity-80 group-hover:opacity-100 transition-opacity">
                {link.type === 'portfolio' && <Briefcase className="w-5 h-5" />}
                {link.type === 'appointment' && <Calendar className="w-5 h-5" />}
                {link.type === 'contact' && <Phone className="w-5 h-5" />}
                {link.type === 'website' && <Globe className="w-5 h-5" />}
                {link.type === 'shop' && <ShoppingBag className="w-5 h-5" />}
                {!['portfolio', 'appointment', 'contact', 'website', 'shop'].includes(link.type) && <ExternalLink className="w-5 h-5" />}
              </div>
              <span className="font-bold text-white text-sm">{link.title}</span>
            </div>
            <div className="relative w-8 h-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] group-hover:bg-white/10 transition-all duration-300 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <ExternalLink className="w-4 h-4 text-white opacity-20 group-hover:opacity-100 transition-opacity" />
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
          <OfikaBlinkingLogo fontSize="text-2xl" color="text-white" />
        </a>
      </div>
    </div>
  );

  const header = (
    <div className="relative h-40 overflow-hidden">
      {profile.cover_image_url ? (
        <img src={profile.cover_image_url} alt="Cover" className="w-full h-full object-cover" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-red-500/20" />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black"></div>
    </div>
  );

  if (isPreview) {
    return (
      <div className="h-full bg-black relative overflow-y-auto custom-scrollbar">
        {header}
        <div className="relative z-10 -mt-12">{content}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div
        className="relative bg-black shadow-2xl overflow-hidden"
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
