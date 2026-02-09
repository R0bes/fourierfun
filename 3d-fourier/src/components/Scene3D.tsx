import React, { useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { FourierVisualization } from './FourierVisualization'

// Define interfaces locally to avoid import issues
interface Fourier3DComponent {
  amplitude: number
  phase: number
  frequency: number
  zOffset: number
  spiralFactor: number
  heightMap: boolean
  color: string
  opacity: number
}

type FourierPreset = 'circle' | 'square' | 'triangle' | 'heart' | 'spiral'

// Enhanced presets with more components for better visibility
const FOURIER_PRESETS: Record<FourierPreset, Fourier3DComponent[]> = {
  circle: [
    { amplitude: 3, phase: 0, frequency: 1, zOffset: 0, spiralFactor: 0, heightMap: false, color: '#00ffff', opacity: 0.8 }
  ],
  square: [
    { amplitude: 2.5, phase: 0, frequency: 1, zOffset: 0, spiralFactor: 0, heightMap: false, color: '#00ffff', opacity: 0.8 },
    { amplitude: 0.8, phase: 0, frequency: 3, zOffset: 0, spiralFactor: 0, heightMap: false, color: '#ff00ff', opacity: 0.6 },
    { amplitude: 0.5, phase: 0, frequency: 5, zOffset: 0, spiralFactor: 0, heightMap: false, color: '#00ff80', opacity: 0.4 },
    { amplitude: 0.35, phase: 0, frequency: 7, zOffset: 0, spiralFactor: 0, heightMap: false, color: '#ff8000', opacity: 0.3 },
    { amplitude: 0.25, phase: 0, frequency: 9, zOffset: 0, spiralFactor: 0, heightMap: false, color: '#8000ff', opacity: 0.2 }
  ],
  triangle: [
    { amplitude: 2.5, phase: 0, frequency: 1, zOffset: 0, spiralFactor: 0, heightMap: false, color: '#00ffff', opacity: 0.8 },
    { amplitude: 0.28, phase: 0, frequency: 3, zOffset: 0, spiralFactor: 0, heightMap: false, color: '#ff00ff', opacity: 0.6 },
    { amplitude: 0.1, phase: 0, frequency: 5, zOffset: 0, spiralFactor: 0, heightMap: false, color: '#00ff80', opacity: 0.4 },
    { amplitude: 0.05, phase: 0, frequency: 7, zOffset: 0, spiralFactor: 0, heightMap: false, color: '#ff8000', opacity: 0.3 },
    { amplitude: 0.03, phase: 0, frequency: 9, zOffset: 0, spiralFactor: 0, heightMap: false, color: '#8000ff', opacity: 0.2 }
  ],
  heart: [
    { amplitude: 2, phase: 0, frequency: 1, zOffset: 0, spiralFactor: 0, heightMap: false, color: '#ff00ff', opacity: 0.8 },
    { amplitude: 1, phase: 0, frequency: 2, zOffset: 0, spiralFactor: 0, heightMap: false, color: '#ff0080', opacity: 0.6 },
    { amplitude: 0.5, phase: 0, frequency: 3, zOffset: 0, spiralFactor: 0, heightMap: false, color: '#ff4000', opacity: 0.4 },
    { amplitude: 0.25, phase: 0, frequency: 4, zOffset: 0, spiralFactor: 0, heightMap: false, color: '#ff8000', opacity: 0.3 },
    { amplitude: 0.125, phase: 0, frequency: 5, zOffset: 0, spiralFactor: 0, heightMap: false, color: '#ffff00', opacity: 0.2 }
  ],
  spiral: [
    { amplitude: 3, phase: 0, frequency: 1, zOffset: 0, spiralFactor: 0.8, heightMap: false, color: '#00ffff', opacity: 0.8 },
    { amplitude: 1.5, phase: Math.PI / 2, frequency: 2, zOffset: 1, spiralFactor: 0.6, heightMap: false, color: '#ff00ff', opacity: 0.6 },
    { amplitude: 0.75, phase: Math.PI, frequency: 3, zOffset: 2, spiralFactor: 0.4, heightMap: false, color: '#00ff80', opacity: 0.4 },
    { amplitude: 0.375, phase: 3 * Math.PI / 2, frequency: 4, zOffset: 3, spiralFactor: 0.2, heightMap: false, color: '#ff8000', opacity: 0.3 }
  ]
}

interface Scene3DProps {
  autoRotate: boolean
  animationSpeed: number
  showGrid: boolean
  preset: FourierPreset
  showCircles: boolean
  showTrails: boolean
  trailLength: number
}

export const Scene3D: React.FC<Scene3DProps> = ({ 
  autoRotate, 
  animationSpeed, 
  showGrid,
  preset,
  showCircles,
  showTrails,
  trailLength
}) => {
  const [time, setTime] = useState(0)

  useFrame((state, delta) => {
    const speed = delta * animationSpeed
    
    // Update Fourier time
    setTime(prevTime => prevTime + speed * 0.5)
  })

  // Get current Fourier components based on preset
  const fourierComponents = FOURIER_PRESETS[preset]

  return (
    <group>
      {/* Fourier Visualization */}
      <FourierVisualization
        components={fourierComponents}
        time={time}
        showTrails={showTrails}
        trailLength={trailLength}
        showCircles={showCircles}
      />

      {/* Clean scene - only Fourier visualization */}
    </group>
  )
}