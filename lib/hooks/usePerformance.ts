"use client"

import { useEffect, useRef, useCallback } from 'react'

interface PerformanceMetrics {
  renderCount: number
  lastRenderTime: number
  averageRenderTime: number
  memoryUsage?: number
}

interface UsePerformanceOptions {
  componentName: string
  logRenders?: boolean
  trackMemory?: boolean
  warnThreshold?: number // Seuil d'avertissement en ms
}

export function usePerformance(options: UsePerformanceOptions) {
  const {
    componentName,
    logRenders = false,
    trackMemory = false,
    warnThreshold = 16 // 16ms = 60fps
  } = options

  const metricsRef = useRef<PerformanceMetrics>({
    renderCount: 0,
    lastRenderTime: 0,
    averageRenderTime: 0
  })

  const startTimeRef = useRef<number>(0)

  // Démarrer le chronomètre au début du render
  useEffect(() => {
    startTimeRef.current = performance.now()
  })

  // Calculer les métriques à la fin du render
  useEffect(() => {
    const endTime = performance.now()
    const renderTime = endTime - startTimeRef.current

    const metrics = metricsRef.current
    metrics.renderCount++
    metrics.lastRenderTime = renderTime
    metrics.averageRenderTime = 
      (metrics.averageRenderTime * (metrics.renderCount - 1) + renderTime) / metrics.renderCount

    // Avertissement si le render est trop lent
    if (renderTime > warnThreshold) {
      console.warn(
        `🐌 ${componentName} render lent: ${renderTime.toFixed(2)}ms (seuil: ${warnThreshold}ms)`
      )
    }

    // Log des renders si activé
    if (logRenders) {
      console.log(
        `📊 ${componentName} - Render #${metrics.renderCount}: ${renderTime.toFixed(2)}ms (moyenne: ${metrics.averageRenderTime.toFixed(2)}ms)`
      )
    }

    // Tracking mémoire si activé
    if (trackMemory && 'memory' in performance) {
      const memory = (performance as any).memory
      metrics.memoryUsage = memory.usedJSHeapSize / 1024 / 1024 // MB
    }
  })

  // Fonction pour forcer un re-render (utile pour les tests)
  const forceRender = useCallback(() => {
    // Cette fonction peut être utilisée pour déclencher un re-render
    // et mesurer les performances
  }, [])

  // Fonction pour obtenir les métriques actuelles
  const getMetrics = useCallback(() => {
    return { ...metricsRef.current }
  }, [])

  // Fonction pour réinitialiser les métriques
  const resetMetrics = useCallback(() => {
    metricsRef.current = {
      renderCount: 0,
      lastRenderTime: 0,
      averageRenderTime: 0
    }
  }, [])

  return {
    metrics: metricsRef.current,
    getMetrics,
    resetMetrics,
    forceRender
  }
}

// Hook pour détecter les re-renders inutiles
export function useRenderTracker(componentName: string) {
  const renderCountRef = useRef(0)
  const prevPropsRef = useRef<any>({})

  useEffect(() => {
    renderCountRef.current++
    
    if (renderCountRef.current > 1) {
      console.log(`🔄 ${componentName} re-render #${renderCountRef.current}`)
    }
  })

  const trackProps = useCallback((props: any) => {
    const prevProps = prevPropsRef.current
    const changedProps = Object.keys(props).filter(
      key => prevProps[key] !== props[key]
    )

    if (changedProps.length > 0) {
      console.log(`📝 ${componentName} props changés:`, changedProps)
    }

    prevPropsRef.current = { ...props }
  }, [componentName])

  return { trackProps }
}

// Hook pour optimiser les callbacks
export function useOptimizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  const callbackRef = useRef(callback)
  const depsRef = useRef(deps)

  // Vérifier si les dépendances ont changé
  const depsChanged = depsRef.current.length !== deps.length ||
    depsRef.current.some((dep, index) => dep !== deps[index])

  if (depsChanged) {
    callbackRef.current = callback
    depsRef.current = deps
  }

  return callbackRef.current as T
}
