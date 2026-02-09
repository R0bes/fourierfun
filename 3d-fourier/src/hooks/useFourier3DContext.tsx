import React, { createContext, useContext, useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { Fourier3DComponent, Fourier3DConfig, AnimationState, Point3D, FourierPreset } from '../types'
import { 
  calculateFourier3D, 
  calculateSpiralFourier, 
  calculateHeightMappedFourier,
  calculateMultiLayerFourier,
  FOURIER_PRESETS 
} from '../utils/fourier3D'

interface Fourier3DContextType {
  // State
  config: Fourier3DConfig
  animation: AnimationState
  points: Point3D[]
  
  // Actions
  updateConfig: (newConfig: Partial<Fourier3DConfig>) => void
  updateComponent: (index: number, component: Fourier3DComponent) => void
  addComponent: (component: Fourier3DComponent) => void
  removeComponent: (index: number) => void
  setPreset: (preset: FourierPreset) => void
  
  // Animation Controls
  play: () => void
  pause: () => void
  stop: () => void
  setSpeed: (speed: number) => void
  setTime: (time: number) => void
  
  // Calculation Methods
  recalculate: () => void
}

const Fourier3DContext = createContext<Fourier3DContextType | undefined>(undefined)

export const useFourier3DContext = () => {
  const context = useContext(Fourier3DContext)
  if (!context) {
    throw new Error('useFourier3DContext must be used within a Fourier3DProvider')
  }
  return context
}

interface Fourier3DProviderProps {
  children: React.ReactNode
}

export const Fourier3DProvider: React.FC<Fourier3DProviderProps> = ({ children }) => {
  // Initial Configuration
  const [config, setConfig] = useState<Fourier3DConfig>({
    components: FOURIER_PRESETS.circle,
    time: 0,
    animationSpeed: 1.0,
    showTrails: true,
    trailLength: 100,
    showGrid: true,
    autoRotate: false,
    cameraDistance: 10
  })
  
  // Animation State
  const [animation, setAnimation] = useState<AnimationState>({
    isPlaying: true,
    currentTime: 0,
    speed: 1.0,
    paused: false
  })
  
  // Calculated Points
  const [points, setPoints] = useState<Point3D[]>([])
  
  // Animation Frame Reference
  const animationRef = useRef<number>()
  const lastTimeRef = useRef<number>(0)
  
  // Performance: Memoized calculation
  const calculatedPoints = useMemo(() => {
    return calculateFourier3D(
      config.components,
      config.time,
      100
    )
  }, [config.components, config.time])
  
  // Performance: Memoized configuration updates
  const updateConfig = useCallback((newConfig: Partial<Fourier3DConfig>) => {
    setConfig(prevConfig => ({ ...prevConfig, ...newConfig }))
  }, [])
  
  // Performance: Memoized component management
  const updateComponent = useCallback((index: number, component: Fourier3DComponent) => {
    setConfig(prevConfig => ({
      ...prevConfig,
      components: prevConfig.components.map((comp, i) => 
        i === index ? component : comp
      )
    }))
  }, [])
  
  const addComponent = useCallback((component: Fourier3DComponent) => {
    setConfig(prevConfig => ({
      ...prevConfig,
      components: [...prevConfig.components, component]
    }))
  }, [])
  
  const removeComponent = useCallback((index: number) => {
    setConfig(prevConfig => ({
      ...prevConfig,
      components: prevConfig.components.filter((_, i) => i !== index)
    }))
  }, [])
  
  // Performance: Memoized preset management
  const setPreset = useCallback((preset: FourierPreset) => {
    setConfig(prevConfig => ({
      ...prevConfig,
      components: FOURIER_PRESETS[preset]
    }))
  }, [])
  
  // Performance: Memoized animation controls
  const play = useCallback(() => {
    setAnimation(prev => ({ ...prev, isPlaying: true, paused: false }))
  }, [])
  
  const pause = useCallback(() => {
    setAnimation(prev => ({ ...prev, paused: true }))
  }, [])
  
  const stop = useCallback(() => {
    setAnimation(prev => ({ ...prev, isPlaying: false, paused: false }))
    setConfig(prevConfig => ({ ...prevConfig, time: 0 }))
  }, [])
  
  const setSpeed = useCallback((speed: number) => {
    setAnimation(prev => ({ ...prev, speed: Math.max(0.1, Math.min(5.0, speed)) }))
  }, [])
  
  const setTime = useCallback((time: number) => {
    setConfig(prevConfig => ({ ...prevConfig, time }))
  }, [])
  
  // Performance: Memoized recalculation
  const recalculate = useCallback(() => {
    setPoints(calculatedPoints)
  }, [calculatedPoints])
  
  // Performance: Optimized animation loop
  const animate = useCallback((currentTime: number) => {
    if (!animation.isPlaying || animation.paused) {
      animationRef.current = requestAnimationFrame(animate)
      return
    }
    
    const deltaTime = (currentTime - lastTimeRef.current) / 1000
    lastTimeRef.current = currentTime
    
    // Performance: Only update if significant change
    if (deltaTime > 0.016) { // ~60fps
      setConfig(prevConfig => ({
        ...prevConfig,
        time: prevConfig.time + deltaTime * animation.speed * config.animationSpeed
      }))
    }
    
    animationRef.current = requestAnimationFrame(animate)
  }, [animation.isPlaying, animation.paused, animation.speed, config.animationSpeed])
  
  // Start Animation
  useEffect(() => {
    if (animation.isPlaying && !animation.paused) {
      lastTimeRef.current = performance.now()
      animationRef.current = requestAnimationFrame(animate)
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [animate, animation.isPlaying, animation.paused])
  
  // Performance: Only recalculate when points change
  useEffect(() => {
    setPoints(calculatedPoints)
  }, [calculatedPoints])
  
  // Performance: Memoized context value
  const value: Fourier3DContextType = useMemo(() => ({
    // State
    config,
    animation,
    points,
    
    // Actions
    updateConfig,
    updateComponent,
    addComponent,
    removeComponent,
    setPreset,
    
    // Animation Controls
    play,
    pause,
    stop,
    setSpeed,
    setTime,
    
    // Calculation Methods
    recalculate
  }), [
    config,
    animation,
    points,
    updateConfig,
    updateComponent,
    addComponent,
    removeComponent,
    setPreset,
    play,
    pause,
    stop,
    setSpeed,
    setTime,
    recalculate
  ])
  
  return (
    <Fourier3DContext.Provider value={value}>
      {children}
    </Fourier3DContext.Provider>
  )
}
