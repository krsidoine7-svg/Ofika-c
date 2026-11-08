'use client'

import {
  Globe,
  ShoppingBag,
  Briefcase,
  Calendar,
  Phone,
  ExternalLink
} from 'lucide-react'

interface CustomLink {
  title: string
  url: string
  type?: string
  description?: string
  is_active?: boolean
}

interface FeaturedLinksListProps {
  links?: CustomLink[]
  onLinkClick: (title: string, url: string) => void
  theme?: 'light' | 'dark'
  accentColor?: string
  className?: string
}

export function FeaturedLinksList({
  links = [],
  onLinkClick,
  theme = 'light',
  accentColor,
  className = ''
}: FeaturedLinksListProps) {
  const activeLinks = (links || []).filter(l => l.is_active !== false && l.url)

  if (activeLinks.length === 0) return null

  const isDark = theme === 'dark'

  const getLinkIcon = (type?: string, iconClass: string = 'w-4 h-4') => {
    switch (type) {
      case 'website': return <Globe className={iconClass} />
      case 'shop': return <ShoppingBag className={iconClass} />
      case 'portfolio': return <Briefcase className={iconClass} />
      case 'appointment': return <Calendar className={iconClass} />
      case 'contact': return <Phone className={iconClass} />
      default: return <ExternalLink className={iconClass} />
    }
  }

  const [featuredLink, ...secondaryLinks] = activeLinks

  return (
    <div className={`w-full space-y-2.5 ${className}`}>
      {/* 1. Carte "Lien Vedette" (Premier lien mis en avant) */}
      {featuredLink && (
        <button
          type="button"
          onClick={() => onLinkClick(featuredLink.title, featuredLink.url)}
          className={`w-full text-left p-4 rounded-2xl transition-all duration-200 active:scale-[0.98] group relative flex items-center justify-between cursor-pointer shadow-sm ${
            isDark
              ? 'bg-[#18181b] hover:bg-[#222227] border-2 border-white/20 hover:border-white/40 text-white'
              : 'bg-white hover:bg-slate-50 border-2 border-slate-900 text-slate-900'
          }`}
          style={accentColor ? { borderColor: accentColor } : undefined}
        >
          <div className="flex items-center gap-3.5 min-w-0 flex-1 pr-3">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-xs transition-transform duration-200 group-hover:scale-105 ${
                isDark
                  ? 'bg-white text-black'
                  : 'bg-slate-900 text-white'
              }`}
              style={accentColor ? { backgroundColor: accentColor, color: isDark ? '#000' : '#fff' } : undefined}
            >
              {getLinkIcon(featuredLink.type, 'w-5 h-5')}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                    isDark
                      ? 'bg-white/10 text-neutral-300 border border-white/15'
                      : 'bg-orange-50 text-orange-600 border border-orange-200/60'
                  }`}
                >
                  À la une
                </span>
              </div>
              <h3 className="font-bold text-sm truncate leading-snug">
                {featuredLink.title}
              </h3>
              {featuredLink.description && (
                <p className={`text-xs truncate mt-0.5 ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                  {featuredLink.description}
                </p>
              )}
            </div>
          </div>

          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
              isDark
                ? 'bg-white/10 text-neutral-400 group-hover:text-white group-hover:bg-white/20'
                : 'bg-slate-100 text-slate-500 group-hover:text-slate-900 group-hover:bg-slate-200'
            }`}
          >
            <ExternalLink className="w-4 h-4" />
          </div>
        </button>
      )}

      {/* 2. Liens Secondaires Épurés */}
      {secondaryLinks.length > 0 && (
        <div className="space-y-2 pt-0.5">
          {secondaryLinks.map((link, index) => (
            <button
              key={index}
              type="button"
              onClick={() => onLinkClick(link.title, link.url)}
              className={`w-full text-left p-3.5 rounded-xl transition-all duration-200 active:scale-[0.98] flex items-center justify-between group cursor-pointer border ${
                isDark
                  ? 'bg-[#121216] hover:bg-[#1a1a20] border-white/10 hover:border-white/25 text-white'
                  : 'bg-white hover:bg-slate-50 border-gray-200/90 hover:border-slate-800 text-slate-900 shadow-2xs'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    isDark
                      ? 'bg-white/10 text-neutral-300'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {getLinkIcon(link.type, 'w-4 h-4')}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="font-semibold text-xs truncate block">
                    {link.title}
                  </span>
                  {link.description && (
                    <span className={`text-[10px] truncate block ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                      {link.description}
                    </span>
                  )}
                </div>
              </div>

              <ExternalLink
                className={`w-3.5 h-3.5 shrink-0 transition-colors ${
                  isDark ? 'text-neutral-500 group-hover:text-white' : 'text-slate-400 group-hover:text-slate-800'
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
