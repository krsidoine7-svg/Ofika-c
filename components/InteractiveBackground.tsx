"use client";

import { SplashCursor } from "@/components/core/ui/splash-cursor";

interface InteractiveBackgroundProps {
  enabled?: boolean;
  intensity?: 'low' | 'medium' | 'high';
  colorScheme?: 'default' | 'brand' | 'minimal' | 'pastel';
}

export function InteractiveBackground({ 
  enabled = true, 
  intensity = 'high',
  colorScheme = 'default'
}: InteractiveBackgroundProps) {
  if (!enabled) return null;

  // Configuration basée sur l'intensité
  const intensityConfig = {
    low: {
      SIM_RESOLUTION: 64,
      DYE_RESOLUTION: 512,
      CAPTURE_RESOLUTION: 256,
      DENSITY_DISSIPATION: 1.2, // Augmenté pour une dissipation plus rapide
      VELOCITY_DISSIPATION: 0.3, // Augmenté pour des mouvements plus doux
      PRESSURE: 0.4,
      PRESSURE_ITERATIONS: 10,
      CURL: 15,
      SPLAT_RADIUS: 0.15,
      SPLAT_FORCE: 2000, // Réduit pour des effets plus doux
      COLOR_UPDATE_SPEED: 5,
    },
    medium: {
      SIM_RESOLUTION: 128,
      DYE_RESOLUTION: 1024,
      CAPTURE_RESOLUTION: 512,
      DENSITY_DISSIPATION: 1.8, // Augmenté pour une dissipation plus rapide
      VELOCITY_DISSIPATION: 0.4, // Augmenté pour des mouvements plus doux
      PRESSURE: 0.8,
      PRESSURE_ITERATIONS: 20,
      CURL: 30,
      SPLAT_RADIUS: 0.25,
      SPLAT_FORCE: 4000, // Réduit pour des effets plus doux
      COLOR_UPDATE_SPEED: 10,
    },
    high: {
      SIM_RESOLUTION: 256,
      DYE_RESOLUTION: 2048,
      CAPTURE_RESOLUTION: 1024,
      DENSITY_DISSIPATION: 2.5, // Augmenté pour une dissipation plus rapide
      VELOCITY_DISSIPATION: 0.6, // Augmenté pour des mouvements plus doux
      PRESSURE: 1.2,
      PRESSURE_ITERATIONS: 30,
      CURL: 50,
      SPLAT_RADIUS: 0.35,
      SPLAT_FORCE: 7000, // Réduit pour des effets plus doux
      COLOR_UPDATE_SPEED: 15,
    }
  };

  // Configuration des couleurs basée sur le schéma - couleurs plus légères
  const colorConfig = {
    default: { r: 0.0, g: 0.0, b: 0.0 },
    brand: { r: 0.0, g: 0.0, b: 0.0 }, // Fond transparent pour laisser voir les couleurs de la marque
    minimal: { r: 0.0, g: 0.0, b: 0.0 },
    pastel: { r: 0.0, g: 0.0, b: 0.0 } // Fond transparent pour les couleurs pastel
  };

  const config = intensityConfig[intensity];
  const backColor = colorConfig[colorScheme];

  return (
    <SplashCursor
      SIM_RESOLUTION={config.SIM_RESOLUTION}
      DYE_RESOLUTION={config.DYE_RESOLUTION}
      CAPTURE_RESOLUTION={config.CAPTURE_RESOLUTION}
      DENSITY_DISSIPATION={config.DENSITY_DISSIPATION}
      VELOCITY_DISSIPATION={config.VELOCITY_DISSIPATION}
      PRESSURE={config.PRESSURE}
      PRESSURE_ITERATIONS={config.PRESSURE_ITERATIONS}
      CURL={config.CURL}
      SPLAT_RADIUS={config.SPLAT_RADIUS}
      SPLAT_FORCE={config.SPLAT_FORCE}
      SHADING={true}
      COLOR_UPDATE_SPEED={config.COLOR_UPDATE_SPEED}
      BACK_COLOR={backColor}
      TRANSPARENT={true}
    />
  );
}
