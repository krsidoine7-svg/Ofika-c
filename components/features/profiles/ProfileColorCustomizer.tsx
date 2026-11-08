'use client'

import { Palette, RotateCcw } from 'lucide-react'
import { getTemplateColorDefaults, readableTextOn, safeHex } from '@/lib/utils/theme-colors'

interface ProfileColorCustomizerProps {
  currentSettings?: {
    primary_color?: string
    secondary_color?: string
    [key: string]: any
  }
  onChange: (updatedSettings: any) => void
  /** Template affiché : sert à montrer ses vraies couleurs quand rien n'est choisi */
  designId?: string | null
  className?: string
}

/**
 * Sélecteur de couleurs simple : 2 couleurs libres choisies par l'utilisateur.
 * Tant que rien n'est choisi, le template garde ses couleurs d'origine.
 */
export function ProfileColorCustomizer({
  currentSettings = {},
  onChange,
  designId,
  className = ''
}: ProfileColorCustomizerProps) {
  const defaults = getTemplateColorDefaults(designId)
  const hasCustomColors = Boolean(currentSettings.primary_color || currentSettings.secondary_color)

  const fields = [
    {
      key: 'primary_color' as const,
      label: defaults.primaryLabel,
      value: safeHex(currentSettings.primary_color, defaults.primary),
    },
    {
      key: 'secondary_color' as const,
      label: defaults.secondaryLabel,
      value: safeHex(currentSettings.secondary_color, defaults.secondary),
    },
  ]

  const handleColor = (key: 'primary_color' | 'secondary_color', color: string) => {
    const { palette_id: _unused, ...rest } = currentSettings
    onChange({ ...rest, [key]: color })
  }

  const handleReset = () => {
    const { primary_color: _p, secondary_color: _s, palette_id: _id, ...rest } = currentSettings
    onChange(rest)
  }

  return (
    <div className={`w-full bg-white/90 backdrop-blur-md border border-gray-200/90 rounded-2xl p-3 shadow-xs ${className}`}>
      <div className="flex items-center justify-between mb-2.5 px-0.5">
        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800 tracking-tight">
          <Palette className="w-3.5 h-3.5 text-orange-500" />
          <span>Mes couleurs</span>
        </div>
        {hasCustomColors && (
          <button
            type="button"
            onClick={handleReset}
            className="text-[11px] font-semibold text-gray-500 hover:text-orange-600 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Couleurs d'origine</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {fields.map((field) => (
          // Le <label> rend toute la pastille cliquable : un clic ouvre le sélecteur de couleur
          <label
            key={field.key}
            className="relative flex items-center gap-2.5 border border-gray-200 rounded-xl p-2 bg-white cursor-pointer hover:border-orange-300 focus-within:ring-2 focus-within:ring-orange-500/30 transition-colors"
          >
            <span
              className="w-9 h-9 rounded-lg border border-black/10 shadow-inner shrink-0 flex items-center justify-center"
              style={{ backgroundColor: field.value }}
            >
              <Palette className="w-3.5 h-3.5" style={{ color: readableTextOn(field.value), opacity: 0.7 }} />
            </span>
            <span className="min-w-0">
              <span className="block text-[11px] font-semibold text-gray-800 leading-tight">{field.label}</span>
              <span className="block text-[10px] font-mono text-gray-400 uppercase">{field.value}</span>
            </span>
            <input
              type="color"
              value={field.value}
              onChange={(e) => handleColor(field.key, e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              aria-label={`Choisir la couleur : ${field.label}`}
            />
          </label>
        ))}
      </div>
    </div>
  )
}
