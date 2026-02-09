import React, { useMemo } from 'react'
import { Line, Sphere, Circle } from '@react-three/drei'
import * as THREE from 'three'

interface Fourier3DTransformProps {
  drawnPoints: { x: number; y: number }[]
  time: number
  showCircles: boolean
  showTrails: boolean
  trailLength: number
  showCompletePath: boolean
}

interface Fourier3DComponent {
  amplitude: number
  phaseX: number
  phaseY: number
  frequencyX: number
  frequencyY: number
  color: string
  opacity: number
}

export const Fourier3DTransform: React.FC<Fourier3DTransformProps> = ({
  drawnPoints,
  time,
  showCircles,
  showTrails,
  trailLength,
  showCompletePath
}) => {
  // Calculate 3D Fourier coefficients from drawn points
  const fourierComponents = useMemo(() => {
    if (drawnPoints.length < 2) return []

    const N = drawnPoints.length
    const components: Fourier3DComponent[] = []

    // Calculate coefficients for different frequencies in X and Y
    for (let kx = -3; kx <= 3; kx++) {
      for (let ky = -3; ky <= 3; ky++) {
        let realX = 0
        let imagX = 0
        let realY = 0
        let imagY = 0

        for (let n = 0; n < N; n++) {
          const angleX = (-2 * Math.PI * kx * n) / N
          const angleY = (-2 * Math.PI * ky * n) / N
          
          realX += drawnPoints[n].x * Math.cos(angleX)
          imagX += drawnPoints[n].x * Math.sin(angleX)
          realY += drawnPoints[n].y * Math.cos(angleY)
          imagY += drawnPoints[n].y * Math.sin(angleY)
        }

        realX /= N
        imagX /= N
        realY /= N
        imagY /= N

        const amplitudeX = Math.sqrt(realX * realX + imagX * imagX)
        const amplitudeY = Math.sqrt(realY * realY + imagY * imagY)
        const amplitude = Math.sqrt(amplitudeX * amplitudeX + amplitudeY * amplitudeY)
        
        const phaseX = Math.atan2(imagX, realX)
        const phaseY = Math.atan2(imagY, realY)

        if (amplitude > 0.1) { // Only show significant coefficients
          components.push({
            amplitude,
            phaseX,
            phaseY,
            frequencyX: kx,
            frequencyY: ky,
            color: kx === 0 && ky === 0 ? '#00ffff' : 
                   kx > 0 ? '#ff00ff' : '#00ff80',
            opacity: Math.min(amplitude * 2, 0.9)
          })
        }
      }
    }

    return components.sort((a, b) => b.amplitude - a.amplitude).slice(0, 20) // Limit to top 20 components
  }, [drawnPoints])

  // Calculate current 3D Fourier reconstruction
  const currentPosition = useMemo(() => {
    let x = 0
    let y = 0
    let z = 0

    for (const component of fourierComponents) {
      const angleX = component.frequencyX * time + component.phaseX
      const angleY = component.frequencyY * time + component.phaseY
      
      x += component.amplitude * Math.cos(angleX) * Math.cos(angleY)
      y += component.amplitude * Math.sin(angleX) * Math.cos(angleY)
      z += component.amplitude * Math.sin(angleY)
    }

    return { x, y, z }
  }, [fourierComponents, time])

  // Calculate trail points in 3D
  const trailPoints = useMemo(() => {
    if (!showTrails) return []

    const points: { x: number; y: number; z: number }[] = []
    const steps = Math.min(trailLength, 200)

    for (let i = 0; i < steps; i++) {
      const trailTime = time - (i * 0.02)
      let x = 0
      let y = 0
      let z = 0

      for (const component of fourierComponents) {
        const angleX = component.frequencyX * trailTime + component.phaseX
        const angleY = component.frequencyY * trailTime + component.phaseY
        
        x += component.amplitude * Math.cos(angleX) * Math.cos(angleY)
        y += component.amplitude * Math.sin(angleX) * Math.cos(angleY)
        z += component.amplitude * Math.sin(angleY)
      }

      points.push({ x, y, z })
    }

    return points
  }, [fourierComponents, time, showTrails, trailLength])

  // Calculate complete reconstructed path in 3D
  const completePath = useMemo(() => {
    if (!showCompletePath) return []

    const points: { x: number; y: number; z: number }[] = []
    const steps = 100

    for (let i = 0; i < steps; i++) {
      const t = (i / steps) * 2 * Math.PI
      let x = 0
      let y = 0
      let z = 0

      for (const component of fourierComponents) {
        const angleX = component.frequencyX * t + component.phaseX
        const angleY = component.frequencyY * t + component.phaseY
        
        x += component.amplitude * Math.cos(angleX) * Math.cos(angleY)
        y += component.amplitude * Math.sin(angleX) * Math.cos(angleY)
        z += component.amplitude * Math.sin(angleY)
      }

      points.push({ x, y, z })
    }

    return points
  }, [fourierComponents, showCompletePath])

  return (
    <group>
      {/* Original drawn path projected to 3D */}
      {drawnPoints.length > 1 && (
        <Line
          points={drawnPoints.map(p => [p.x, p.y, 0.1])}
          color="#ffff00"
          lineWidth={1}
          transparent={true}
          opacity={0.5}
        />
      )}

      {/* Complete reconstructed 3D path */}
      {showCompletePath && completePath.length > 1 && (
        <Line
          points={completePath.map(p => [p.x, p.y, p.z])}
          color="#ffffff"
          lineWidth={2}
          transparent={true}
          opacity={0.7}
        />
      )}

      {/* 3D Fourier circles/spheres */}
      {showCircles && fourierComponents.map((component, index) => {
        let centerX = 0
        let centerY = 0
        let centerZ = 0

        // Calculate center position for this component
        for (let i = 0; i < index; i++) {
          const prevComponent = fourierComponents[i]
          const angleX = prevComponent.frequencyX * time + prevComponent.phaseX
          const angleY = prevComponent.frequencyY * time + prevComponent.phaseY
          
          centerX += prevComponent.amplitude * Math.cos(angleX) * Math.cos(angleY)
          centerY += prevComponent.amplitude * Math.sin(angleX) * Math.cos(angleY)
          centerZ += prevComponent.amplitude * Math.sin(angleY)
        }

        const angleX = component.frequencyX * time + component.phaseX
        const angleY = component.frequencyY * time + component.phaseY
        
        const sphereX = centerX + component.amplitude * Math.cos(angleX) * Math.cos(angleY)
        const sphereY = centerY + component.amplitude * Math.sin(angleX) * Math.cos(angleY)
        const sphereZ = centerZ + component.amplitude * Math.sin(angleY)

        return (
          <group key={`component-${index}`}>
            {/* Rotating sphere representing the Fourier component */}
            <Sphere
              args={[component.amplitude * 0.4, 20, 20]}
              position={[centerX, centerY, centerZ]}
            >
              <meshStandardMaterial
                color={component.color}
                transparent={true}
                opacity={0.3}
                emissive={component.color}
                emissiveIntensity={0.2}
              />
            </Sphere>
            
            {/* Component sphere at current position */}
            <Sphere
              args={[0.1, 12, 12]}
              position={[sphereX, sphereY, sphereZ]}
            >
              <meshStandardMaterial
                color={component.color}
                transparent={true}
                opacity={component.opacity}
                emissive={component.color}
                emissiveIntensity={0.3}
              />
            </Sphere>

            {/* Connection line from center to component */}
            <Line
              points={[
                [centerX, centerY, centerZ],
                [sphereX, sphereY, sphereZ]
              ]}
              color={component.color}
              lineWidth={2}
              transparent={true}
              opacity={0.6}
            />
          </group>
        )
      })}

      {/* 3D Trail */}
      {showTrails && trailPoints.length > 1 && (
        <Line
          points={trailPoints.map(p => [p.x, p.y, p.z])}
          color="#00ffff"
          lineWidth={3}
          transparent={true}
          opacity={0.8}
        />
      )}

      {/* Current position sphere */}
      <Sphere
        args={[0.15, 20, 20]}
        position={[currentPosition.x, currentPosition.y, currentPosition.z]}
      >
        <meshStandardMaterial
          color="#ff00ff"
          transparent={true}
          opacity={0.9}
          emissive="#ff00ff"
          emissiveIntensity={0.4}
        />
      </Sphere>
    </group>
  )
}
