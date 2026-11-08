'use client'

import type { CSSProperties, ReactNode } from 'react'

interface TemplateShellProps {
  /** true dans les aperçus (iPhone de l'onboarding, dashboard) */
  isPreview?: boolean
  /** Couleur de fond du template (remplit tout l'écran sur tablette / ordinateur) */
  background: string
  /** Image floutée affichée derrière la colonne sur grand écran (ex. template Immersif) */
  backdropImage?: string
  /** Classes des polices (variables next/font) et autres classes du template */
  className?: string
  style?: CSSProperties
  children: ReactNode
}

/**
 * Taille de texte fluide : `max` px quand la page fait 390 px de large (largeur de conception),
 * réduite proportionnellement sur les petits téléphones, jamais sous `min` px.
 * Basé sur la largeur de la colonne (unité cqw) et non de l'écran : fonctionne aussi dans les aperçus.
 */
export function fluid(max: number, min: number): string {
  return `clamp(${min}px, ${((max / 390) * 100).toFixed(2)}cqw, ${max}px)`
}

/**
 * Coque commune des templates.
 * - Téléphone : pleine largeur.
 * - Tablette / ordinateur : la couleur du template remplit l'écran, le contenu est centré
 *   dans une colonne de 480 px max et la page défile normalement (pas de boîte à faire défiler).
 * - Aperçus : contenu brut, à la taille du cadre.
 */
export function TemplateShell({ isPreview = false, background, backdropImage, className = '', style, children }: TemplateShellProps) {
  // container-type : permet aux tailles fluides (cqw) de suivre la largeur de la colonne
  const columnStyle: CSSProperties = { background, containerType: 'inline-size', ...style }

  if (isPreview) {
    return (
      <div className={`w-full min-h-full relative flex flex-col [&>*:first-child]:flex-1 ${className}`} style={columnStyle}>
        {children}
      </div>
    )
  }

  return (
    <div className="relative min-h-[100dvh] w-full overflow-x-hidden" style={{ background }}>
      {backdropImage && (
        <div className="hidden min-[520px]:block fixed inset-0 pointer-events-none" aria-hidden="true">
          <img src={backdropImage} alt="" className="w-full h-full object-cover scale-110 blur-3xl opacity-60" />
          <div className="absolute inset-0" style={{ background: `${background}b3` }} />
        </div>
      )}
      <div
        className={`relative mx-auto w-full max-w-[480px] min-h-[100dvh] flex flex-col [&>*:first-child]:flex-1 min-[520px]:shadow-[0_0_60px_-20px_rgba(0,0,0,0.25)] ${className}`}
        style={columnStyle}
      >
        {children}
      </div>
    </div>
  )
}
