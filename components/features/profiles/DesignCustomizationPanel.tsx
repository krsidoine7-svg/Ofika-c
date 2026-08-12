'use client'

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Image as ImageIcon, PaintBucket, LayoutTemplate } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface DesignCustomizationPanelProps {
  profile: any;
  onUpdate: (updatedProfile: any) => void;
  onClose?: () => void;
}

// Composant triable pour dnd-kit
function SortableLinkItem({ id, item }: { id: string, item: any }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`flex items-center gap-3 p-3 bg-gray-50 rounded-lg border ${isDragging ? 'border-orange-500 shadow-lg scale-105' : 'border-gray-200'} transition-all`}
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-700">
        <GripVertical className="w-5 h-5" />
      </div>
      <div className="flex-1 font-medium text-sm text-gray-700">
        {item.platform || item.title || item.id}
      </div>
    </div>
  );
}

export function DesignCustomizationPanel({ profile, onUpdate, onClose }: DesignCustomizationPanelProps) {
  const [themeSettings, setThemeSettings] = useState(profile.theme_settings || {
    primary_color: '#000000',
    secondary_color: '#d4af37',
    banner_choice: 'logo1',
    profile_shape: 'rounded-full',
    link_order: []
  });
  
  const [isSaving, setIsSaving] = useState(false);

  // Préparer la liste des liens pour le drag & drop
  const activeSocialLinks = profile.social_links?.filter((l: any) => !['shop', 'website', 'other'].includes(l.platform) && l.is_active !== false) || [];
  const specialLinks = profile.social_links?.filter((l: any) => ['shop', 'website', 'other'].includes(l.platform) && l.is_active !== false) || [];
  const customLinks = profile.custom_links?.filter((l: any) => l.is_active !== false) || [];
  
  const allLinks = [
    ...specialLinks.map((l: any) => ({ ...l, id: l.platform, isSpecial: true })),
    ...customLinks.map((l: any) => ({ ...l, id: l.title, isCustom: true }))
  ];

  const [items, setItems] = useState(() => {
    if (themeSettings.link_order && themeSettings.link_order.length > 0) {
      // Trier selon l'ordre sauvegardé
      return [...allLinks].sort((a: any, b: any) => {
        const idxA = themeSettings.link_order.indexOf(a.id);
        const idxB = themeSettings.link_order.indexOf(b.id);
        if (idxA === -1) return 1;
        if (idxB === -1) return -1;
        return idxA - idxB;
      });
    }
    return allLinks;
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        
        // Mettre à jour les settings
        updateSetting('link_order', newItems.map(i => i.id));
        return newItems;
      });
    }
  };

  const updateSetting = (key: string, value: any) => {
    const newSettings = { ...themeSettings, [key]: value };
    setThemeSettings(newSettings);
    // On met à jour le profil en temps réel pour l'aperçu
    onUpdate({ ...profile, theme_settings: newSettings });
  };

  const saveSettings = async () => {
    setIsSaving(true);
    const supabase = createClient();
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ theme_settings: themeSettings })
        .eq('id', profile.id);

      if (error) throw error;
      toast.success("Design sauvegardé avec succès !");
      if (onClose) onClose();
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la sauvegarde.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 w-full max-w-md">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <PaintBucket className="w-5 h-5 text-orange-500" />
          Personnaliser le Design
        </h3>
      </div>

      <Tabs defaultValue="colors" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="colors">Couleurs</TabsTrigger>
          <TabsTrigger value="banner">Bannière</TabsTrigger>
          <TabsTrigger value="links">Liens</TabsTrigger>
        </TabsList>
        
        <TabsContent value="colors" className="space-y-4">
          <div className="space-y-2">
            <Label>Couleur Principale (Fond)</Label>
            <div className="flex gap-2">
              <Input 
                type="color" 
                value={themeSettings.primary_color || '#000000'}
                onChange={(e) => updateSetting('primary_color', e.target.value)}
                className="w-12 h-12 p-1 cursor-pointer"
              />
              <Input 
                type="text" 
                value={themeSettings.primary_color || '#000000'}
                onChange={(e) => updateSetting('primary_color', e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
          
          <div className="space-y-2 mt-4">
            <Label>Couleur Secondaire (Or / Accents)</Label>
            <div className="flex gap-2">
              <Input 
                type="color" 
                value={themeSettings.secondary_color || '#d4af37'}
                onChange={(e) => updateSetting('secondary_color', e.target.value)}
                className="w-12 h-12 p-1 cursor-pointer"
              />
              <Input 
                type="text" 
                value={themeSettings.secondary_color || '#d4af37'}
                onChange={(e) => updateSetting('secondary_color', e.target.value)}
                className="flex-1"
              />
            </div>
          </div>

          <div className="space-y-3 mt-6">
            <Label>Forme de la Photo de Profil</Label>
            <RadioGroup 
              value={themeSettings.profile_shape || 'rounded-full'} 
              onValueChange={(val) => updateSetting('profile_shape', val)}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="rounded-full" id="shape-circle" />
                <Label htmlFor="shape-circle">Cercle</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="rounded-xl" id="shape-rounded" />
                <Label htmlFor="shape-rounded">Arrondi</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="rounded-none" id="shape-square" />
                <Label htmlFor="shape-square">Carré</Label>
              </div>
            </RadioGroup>
          </div>
        </TabsContent>
        
        <TabsContent value="banner" className="space-y-4">
          <Label>Choix de la Bannière</Label>
          <RadioGroup 
            value={themeSettings.banner_choice || 'logo1'} 
            onValueChange={(val) => updateSetting('banner_choice', val)}
            className="space-y-3"
          >
            <div className="flex items-center space-x-3 border p-3 rounded-lg hover:bg-gray-50 cursor-pointer" onClick={() => updateSetting('banner_choice', 'logo1')}>
              <RadioGroupItem value="logo1" id="banner-1" />
              <Label htmlFor="banner-1" className="cursor-pointer flex-1">Logo CJCD Or (Standard)</Label>
            </div>
            <div className="flex items-center space-x-3 border p-3 rounded-lg hover:bg-gray-50 cursor-pointer" onClick={() => updateSetting('banner_choice', 'logo2')}>
              <RadioGroupItem value="logo2" id="banner-2" />
              <Label htmlFor="banner-2" className="cursor-pointer flex-1">Logo CJCD Blanc (Minimaliste)</Label>
            </div>
            <div className="flex items-center space-x-3 border p-3 rounded-lg hover:bg-gray-50 cursor-pointer" onClick={() => updateSetting('banner_choice', 'custom')}>
              <RadioGroupItem value="custom" id="banner-custom" />
              <Label htmlFor="banner-custom" className="cursor-pointer flex-1">Image personnalisée</Label>
            </div>
          </RadioGroup>

          {themeSettings.banner_choice === 'custom' && (
            <div className="mt-4 space-y-2">
              <Label>URL de l'image (temporaire)</Label>
              <Input 
                placeholder="https://..." 
                value={themeSettings.custom_banner_url || ''}
                onChange={(e) => updateSetting('custom_banner_url', e.target.value)}
              />
              <p className="text-xs text-gray-500">Collez le lien direct vers une image pour la bannière.</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="links" className="space-y-4">
          <Label className="mb-2 block">Réorganiser l'ordre des liens</Label>
          <p className="text-xs text-gray-500 mb-4">Maintenez et glissez pour modifier l'ordre d'affichage sur votre profil.</p>
          
          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={items.map((i: any) => i.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {items.map((item: any) => (
                  <SortableLinkItem key={item.id} id={item.id} item={item} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </TabsContent>
      </Tabs>

      <div className="mt-8 pt-4 border-t border-gray-100 flex justify-end gap-3">
        {onClose && (
          <Button variant="ghost" onClick={onClose} disabled={isSaving}>Annuler</Button>
        )}
        <Button onClick={saveSettings} disabled={isSaving} className="bg-orange-500 hover:bg-orange-600">
          {isSaving ? 'Sauvegarde...' : 'Sauvegarder le design'}
        </Button>
      </div>
    </div>
  );
}
