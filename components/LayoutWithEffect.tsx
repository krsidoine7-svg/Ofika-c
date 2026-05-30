"use client";

import { useState, useEffect } from 'react';
import { InteractiveBackground } from './InteractiveBackground';
import { Button } from './core/ui/button';
import { Settings, Eye, EyeOff } from 'lucide-react';

interface LayoutWithEffectProps {
  children: React.ReactNode;
  showControls?: boolean;
  defaultEnabled?: boolean;
  defaultIntensity?: 'low' | 'medium' | 'high';
  defaultColorScheme?: 'default' | 'brand' | 'minimal' | 'pastel';
}

export function LayoutWithEffect({ 
  children, 
  showControls = true,
  defaultEnabled = true,
  defaultIntensity = 'high',
  defaultColorScheme = 'default'
}: LayoutWithEffectProps) {
  const [enabled, setEnabled] = useState(defaultEnabled);
  const [intensity, setIntensity] = useState<'low' | 'medium' | 'high'>(defaultIntensity);
  const [colorScheme, setColorScheme] = useState<'default' | 'brand' | 'minimal' | 'pastel'>(defaultColorScheme);
  const [showSettings, setShowSettings] = useState(false);

  // Sauvegarder les préférences dans localStorage
  useEffect(() => {
    const savedEnabled = localStorage.getItem('splash-effect-enabled');
    const savedIntensity = localStorage.getItem('splash-effect-intensity');
    const savedColorScheme = localStorage.getItem('splash-effect-color-scheme');
    
    if (savedEnabled !== null) {
      setEnabled(savedEnabled === 'true');
    }
    if (savedIntensity && ['low', 'medium', 'high'].includes(savedIntensity)) {
      setIntensity(savedIntensity as 'low' | 'medium' | 'high');
    }
    if (savedColorScheme && ['default', 'brand', 'minimal', 'pastel'].includes(savedColorScheme)) {
      setColorScheme(savedColorScheme as 'default' | 'brand' | 'minimal' | 'pastel');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('splash-effect-enabled', enabled.toString());
    localStorage.setItem('splash-effect-intensity', intensity);
    localStorage.setItem('splash-effect-color-scheme', colorScheme);
  }, [enabled, intensity, colorScheme]);

  return (
    <div className="min-h-screen bg-white relative">
      {/* Effet de fond interactif */}
      <InteractiveBackground 
        enabled={enabled}
        intensity={intensity}
        colorScheme={colorScheme}
      />
      
      {/* Contrôles flottants */}
      {showControls && (
        <div className="fixed top-4 right-4 z-50">
          <div className="flex flex-col space-y-2">
            {/* Bouton principal */}
            <Button
              onClick={() => setEnabled(!enabled)}
              variant={enabled ? "default" : "outline"}
              size="sm"
              className="shadow-lg"
            >
              {enabled ? (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Effet ON
                </>
              ) : (
                <>
                  <EyeOff className="h-4 w-4 mr-2" />
                  Effet OFF
                </>
              )}
            </Button>
            
            {/* Bouton de paramètres */}
            <Button
              onClick={() => setShowSettings(!showSettings)}
              variant="outline"
              size="sm"
              className="shadow-lg"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Panneau de paramètres */}
          {showSettings && (
            <div className="absolute top-12 right-0 bg-white rounded-lg shadow-lg border p-4 min-w-[200px]">
              <h3 className="font-semibold mb-3">Paramètres</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Intensité</label>
                  <div className="flex space-x-1 mt-1">
                    {(['low', 'medium', 'high'] as const).map((level) => (
                      <Button
                        key={level}
                        onClick={() => setIntensity(level)}
                        variant={intensity === level ? "default" : "outline"}
                        size="sm"
                        className="text-xs px-2 py-1"
                      >
                        {level === 'low' ? 'Faible' : level === 'medium' ? 'Moyen' : 'Élevé'}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Couleurs</label>
                  <div className="flex space-x-1 mt-1">
                    {(['default', 'brand', 'minimal', 'pastel'] as const).map((scheme) => (
                      <Button
                        key={scheme}
                        onClick={() => setColorScheme(scheme)}
                        variant={colorScheme === scheme ? "default" : "outline"}
                        size="sm"
                        className="text-xs px-2 py-1"
                      >
                        {scheme === 'default' ? 'Défaut' : 
                         scheme === 'brand' ? 'Marque' : 
                         scheme === 'minimal' ? 'Minimal' : 'Pastel'}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div className="pt-2 border-t">
                  <Button
                    onClick={() => {
                      setEnabled(true);
                      setIntensity('high');
                      setColorScheme('default');
                    }}
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                  >
                    Réinitialiser
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Contenu */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
