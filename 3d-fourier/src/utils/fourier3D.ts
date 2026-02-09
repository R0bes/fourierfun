import * as THREE from 'three'
import { Fourier3DComponent } from '../types'

// Simple Point3D interface for this utility
interface Point3D {
  x: number
  y: number
  z: number
  amplitude?: number
  phase?: number
  frequency?: number
  color?: string
}

/**
 * 3D Fourier Transform Mathematics
 * Erweitert die klassische 2D-Fourier-Transformation um 3D-Effekte
 */

// Basis-Fourier-Berechnung für 2D
export function calculateFourier2D(
  components: Fourier3DComponent[],
  time: number,
  resolution: number = 100
): Point3D[] {
  const points: Point3D[] = []
  
  for (let i = 0; i <= resolution; i++) {
    const t = (i / resolution) * 2 * Math.PI
    let x = 0
    let y = 0
    
    // Berechne Epicycles
    for (const component of components) {
      const angle = component.frequency * t + component.phase
      x += component.amplitude * Math.cos(angle)
      y += component.amplitude * Math.sin(angle)
    }
    
    points.push({
      x,
      y,
      z: 0,
      amplitude: Math.sqrt(x * x + y * y),
      phase: Math.atan2(y, x),
      frequency: 1,
      color: '#00ffff'
    })
  }
  
  return points
}

// 3D-Fourier-Berechnung mit Z-Tiefe
export function calculateFourier3D(
  components: Fourier3DComponent[],
  time: number,
  resolution: number = 100
): Point3D[] {
  const points: Point3D[] = []
  
  for (let i = 0; i <= resolution; i++) {
    const t = (i / resolution) * 2 * Math.PI
    let x = 0
    let y = 0
    let z = 0
    
    // Berechne 3D Epicycles
    for (const component of components) {
      const angle = component.frequency * t + component.phase + time
      
      // Basis-Kreis
      const baseX = component.amplitude * Math.cos(angle)
      const baseY = component.amplitude * Math.sin(angle)
      
      // Z-Tiefe basierend auf Amplitude und Spiral-Faktor
      const zDepth = component.zOffset + (component.spiralFactor * component.amplitude * Math.sin(angle * 0.5))
      
      x += baseX
      y += baseY
      z += zDepth
    }
    
    points.push({
      x,
      y,
      z,
      amplitude: Math.sqrt(x * x + y * y + z * z),
      phase: Math.atan2(y, x),
      frequency: 1,
      color: getColorFromZ(z)
    })
  }
  
  return points
}

// Spiral-Fourier für komplexe 3D-Effekte
export function calculateSpiralFourier(
  components: Fourier3DComponent[],
  time: number,
  resolution: number = 100
): Point3D[] {
  const points: Point3D[] = []
  
  for (let i = 0; i <= resolution; i++) {
    const t = (i / resolution) * 2 * Math.PI
    let x = 0
    let y = 0
    let z = 0
    
    for (const component of components) {
      const angle = component.frequency * t + component.phase + time
      
      // Spiral-Effekt
      const spiralRadius = component.amplitude * (1 + component.spiralFactor * Math.sin(angle * 2))
      const spiralZ = component.zOffset + component.spiralFactor * component.amplitude * Math.cos(angle)
      
      x += spiralRadius * Math.cos(angle)
      y += spiralRadius * Math.sin(angle)
      z += spiralZ
    }
    
    points.push({
      x,
      y,
      z,
      amplitude: Math.sqrt(x * x + y * y + z * z),
      phase: Math.atan2(y, x),
      frequency: 1,
      color: getColorFromZ(z)
    })
  }
  
  return points
}

// Höhen-Mapping für Amplituden
export function calculateHeightMappedFourier(
  components: Fourier3DComponent[],
  time: number,
  resolution: number = 100
): Point3D[] {
  const points: Point3D[] = []
  
  for (let i = 0; i <= resolution; i++) {
    const t = (i / resolution) * 2 * Math.PI
    let x = 0
    let y = 0
    let z = 0
    
    for (const component of components) {
      const angle = component.frequency * t + component.phase + time
      
      if (component.heightMap) {
        // Höhen-Mapping: Amplitude wird zu Z-Koordinate
        const amplitude = component.amplitude * Math.sin(angle)
        x += amplitude * Math.cos(angle)
        y += amplitude * Math.sin(angle)
        z += component.zOffset + amplitude * 0.5
      } else {
        // Standard-Epicycle
        x += component.amplitude * Math.cos(angle)
        y += component.amplitude * Math.sin(angle)
        z += component.zOffset
      }
    }
    
    points.push({
      x,
      y,
      z,
      amplitude: Math.sqrt(x * x + y * y + z * z),
      phase: Math.atan2(y, x),
      frequency: 1,
      color: getColorFromZ(z)
    })
  }
  
  return points
}

// Multi-Layer Fourier für verschiedene Frequenz-Ebenen
export function calculateMultiLayerFourier(
  components: Fourier3DComponent[],
  time: number,
  layers: number = 3,
  resolution: number = 100
): Point3D[] {
  const points: Point3D[] = []
  
  for (let layer = 0; layer < layers; layer++) {
    const layerZ = (layer - layers / 2) * 2
    const layerComponents = components.map(comp => ({
      ...comp,
      zOffset: layerZ,
      amplitude: comp.amplitude * (1 - layer * 0.2) // Reduziere Amplitude für höhere Layer
    }))
    
    const layerPoints = calculateFourier3D(layerComponents, time, resolution)
    points.push(...layerPoints)
  }
  
  return points
}

// Hilfsfunktionen
function getColorFromZ(z: number): string {
  // Farb-Gradient basierend auf Z-Koordinate
  const normalizedZ = (z + 10) / 20 // Normalisiere Z zwischen 0 und 1
  const hue = normalizedZ * 360
  return `hsl(${hue}, 100%, 50%)`
}

// Vordefinierte Fourier-Presets
export const FOURIER_PRESETS = {
  circle: [
    { amplitude: 2, phase: 0, frequency: 1, zOffset: 0, spiralFactor: 0, heightMap: false, color: '#00ffff', opacity: 0.8 }
  ],
  
  square: [
    { amplitude: 1.273, phase: 0, frequency: 1, zOffset: 0, spiralFactor: 0, heightMap: false, color: '#00ffff', opacity: 0.8 },
    { amplitude: 0.424, phase: 0, frequency: 3, zOffset: 0, spiralFactor: 0, heightMap: false, color: '#ff00ff', opacity: 0.6 },
    { amplitude: 0.255, phase: 0, frequency: 5, zOffset: 0, spiralFactor: 0, heightMap: false, color: '#00ff80', opacity: 0.4 },
    { amplitude: 0.182, phase: 0, frequency: 7, zOffset: 0, spiralFactor: 0, heightMap: false, color: '#ff8000', opacity: 0.3 }
  ],
  
  triangle: [
    { amplitude: 1.273, phase: 0, frequency: 1, zOffset: 0, spiralFactor: 0, heightMap: false, color: '#00ffff', opacity: 0.8 },
    { amplitude: 0.141, phase: 0, frequency: 3, zOffset: 0, spiralFactor: 0, heightMap: false, color: '#ff00ff', opacity: 0.6 },
    { amplitude: 0.051, phase: 0, frequency: 5, zOffset: 0, spiralFactor: 0, heightMap: false, color: '#00ff80', opacity: 0.4 },
    { amplitude: 0.026, phase: 0, frequency: 7, zOffset: 0, spiralFactor: 0, heightMap: false, color: '#ff8000', opacity: 0.3 }
  ],
  
  heart: [
    { amplitude: 1, phase: 0, frequency: 1, zOffset: 0, spiralFactor: 0, heightMap: false, color: '#ff00ff', opacity: 0.8 },
    { amplitude: 0.5, phase: 0, frequency: 2, zOffset: 0, spiralFactor: 0, heightMap: false, color: '#ff0080', opacity: 0.6 },
    { amplitude: 0.25, phase: 0, frequency: 3, zOffset: 0, spiralFactor: 0, heightMap: false, color: '#ff4000', opacity: 0.4 }
  ],
  
  spiral: [
    { amplitude: 2, phase: 0, frequency: 1, zOffset: 0, spiralFactor: 0.5, heightMap: false, color: '#00ffff', opacity: 0.8 },
    { amplitude: 1, phase: Math.PI / 2, frequency: 2, zOffset: 1, spiralFactor: 0.3, heightMap: false, color: '#ff00ff', opacity: 0.6 },
    { amplitude: 0.5, phase: Math.PI, frequency: 3, zOffset: 2, spiralFactor: 0.2, heightMap: false, color: '#00ff80', opacity: 0.4 }
  ]
}

// Utility-Funktionen für mathematische Operationen
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function normalize(value: number, min: number, max: number): number {
  return (value - min) / (max - min)
}

export function remap(value: number, fromMin: number, fromMax: number, toMin: number, toMax: number): number {
  return toMin + (value - fromMin) * (toMax - toMin) / (fromMax - fromMin)
}
