'use client'

import React, { useMemo, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, PaintBucket, ExternalLink } from "lucide-react"
import { toast } from "sonner"
import { ProfileColorCustomizer } from "./ProfileColorCustomizer"
import { safeHex } from "@/lib/utils/theme-colors"

interface DesignCustomizationPanelProps {
  /** Profil tel que chargé depuis la base (sert de référence) */
  profile: any
  /** Appelé à chaque changement pour mettre à jour l'aperçu en direct */
  onUpdate: (previewProfile: any) => void
  /** Appelé après une sauvegarde réussie */
  onSaved?: (savedProfile: any) => void
  onClose?: () => void
}

interface SortableLink {
  /** Identifiant stable = position d'origine dans custom_links (évite les doublons de titre) */
  id: string
  originalIndex: number
  link: any
}

// Élément déplaçable de la liste
function SortableLinkItem({ item }: { item: SortableLink }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
      }}
      className={`flex items-center gap-3 p-3 bg-white rounded-xl border transition-shadow ${
        isDragging ? 'border-orange-500 shadow-lg' : 'border-gray-200'
      }`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-700 touch-none p-1 -m-1"
        aria-label={`Déplacer le lien ${item.link.title || ''}`}
      >
        <GripVertical className="w-5 h-5" />
      </button>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-gray-800 truncate">{item.link.title || 'Lien sans titre'}</p>
        {item.link.url && <p className="text-[11px] text-gray-400 truncate">{item.link.url}</p>}
      </div>
      <ExternalLink className="w-3.5 h-3.5 text-gray-300 shrink-0" />
    </div>
  )
}

export function DesignCustomizationPanel({ profile, onUpdate, onSaved, onClose }: DesignCustomizationPanelProps) {
  // Seules les couleurs réellement choisies sont gardées ; sinon le template utilise les siennes
  const pickColors = (settings: any) => {
    const out: { primary_color?: string; secondary_color?: string } = {}
    const p = safeHex(settings?.primary_color, '')
    const s = safeHex(settings?.secondary_color, '')
    if (p) out.primary_color = p
    if (s) out.secondary_color = s
    return out
  }
  const initialSettings = profile.theme_settings || {}
  const [themeSettings, setThemeSettings] = useState<any>(() => pickColors(initialSettings))
  const [isSaving, setIsSaving] = useState(false)
  const [isDirty, setIsDirty] = useState(false)

  // Liens personnalisés, identifiés par leur position d'origine
  const originalLinks: any[] = useMemo(
    () => (Array.isArray(profile.custom_links) ? profile.custom_links : []),
    [profile.custom_links]
  )
  const [items, setItems] = useState<SortableLink[]>(() =>
    originalLinks.map((link, i) => ({ id: `link-${i}`, originalIndex: i, link }))
  )

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  // Met à jour l'aperçu avec les réglages et l'ordre en cours
  const pushPreview = (settings: any, orderedItems: SortableLink[]) => {
    onUpdate({
      ...profile,
      theme_settings: settings,
      custom_links: orderedItems.map((i) => i.link),
    })
  }

  const handleColorsChange = (updated: any) => {
    const next = pickColors(updated)
    setThemeSettings(next)
    setIsDirty(true)
    pushPreview(next, items)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = items.findIndex((i) => i.id === active.id)
    const newIndex = items.findIndex((i) => i.id === over.id)
    const newItems = arrayMove(items, oldIndex, newIndex)
    setItems(newItems)
    setIsDirty(true)
    pushPreview(themeSettings, newItems)
  }

  const handleReset = () => {
    const resetItems = originalLinks.map((link, i) => ({ id: `link-${i}`, originalIndex: i, link }))
    const resetSettings = pickColors(initialSettings)
    setItems(resetItems)
    setThemeSettings(resetSettings)
    setIsDirty(false)
    onUpdate(profile)
  }

  const saveSettings = async () => {
    setIsSaving(true)
    try {
      const res = await fetch(`/api/profiles/${profile.id}/theme`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // null = pas de couleur choisie → le template garde sa couleur d'origine
          primary_color: themeSettings.primary_color ?? null,
          secondary_color: themeSettings.secondary_color ?? null,
          link_order: items.map((i) => i.originalIndex),
        }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error || 'Erreur lors de la sauvegarde.')

      toast.success('Design enregistré ! Votre page publique est à jour.')
      setIsDirty(false)
      // Le nouvel ordre devient la référence : on renumérote les positions d'origine
      setItems((prev) => prev.map((it, i) => ({ id: `link-${i}`, originalIndex: i, link: it.link })))
      onSaved?.({
        ...profile,
        theme_settings: json.theme_settings,
        custom_links: items.map((i) => i.link),
      })
    } catch (error: any) {
      console.error(error)
      toast.error(error.message || 'Erreur lors de la sauvegarde.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 sm:p-6 w-full">
      <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-1">
        <PaintBucket className="w-5 h-5 text-orange-500" />
        Personnaliser le design
      </h3>
      <p className="text-sm text-gray-500 mb-5">Les changements s'affichent tout de suite dans l'aperçu.</p>

      <Tabs defaultValue="colors" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-5">
          <TabsTrigger value="colors">Couleurs</TabsTrigger>
          <TabsTrigger value="links">Ordre des liens</TabsTrigger>
        </TabsList>

        <TabsContent value="colors" className="space-y-3">
          <ProfileColorCustomizer
            currentSettings={themeSettings}
            onChange={handleColorsChange}
            designId={profile.design_choice}
          />
          <p className="text-xs text-gray-500">
            Cliquez sur une couleur pour la changer. Le texte s'adapte tout seul pour rester lisible.
          </p>
        </TabsContent>

        <TabsContent value="links" className="space-y-3">
          {items.length === 0 ? (
            <div className="p-6 text-center rounded-xl border border-dashed border-gray-200 text-sm text-gray-500">
              Aucun lien personnalisé pour l'instant. Ajoutez-en depuis « Modifier le profil ».
            </div>
          ) : (
            <>
              <p className="text-xs text-gray-500">
                Maintenez la poignée <GripVertical className="inline w-3.5 h-3.5 -mt-0.5" /> et glissez pour changer l'ordre d'affichage.
              </p>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2">
                    {items.map((item) => (
                      <SortableLinkItem key={item.id} item={item} />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </>
          )}
        </TabsContent>
      </Tabs>

      <div className="mt-6 pt-4 border-t border-gray-100 flex flex-wrap justify-end gap-3">
        {isDirty && (
          <Button variant="ghost" onClick={handleReset} disabled={isSaving}>
            Annuler les changements
          </Button>
        )}
        {onClose && !isDirty && (
          <Button variant="ghost" onClick={onClose} disabled={isSaving}>Fermer</Button>
        )}
        <Button
          onClick={saveSettings}
          disabled={isSaving || !isDirty}
          className="bg-orange-500 hover:bg-orange-600 text-white"
        >
          {isSaving ? 'Enregistrement...' : 'Enregistrer le design'}
        </Button>
      </div>
    </div>
  )
}
