import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Line, Sphere, Circle } from '@react-three/drei'
import * as THREE from 'three'

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

interface Point3D {
  x: number
  y: number
  z: number
}

interface FourierVisualizationProps {
  components: Fourier3DComponent[]
  time: number
  showTrails: boolean
  trailLength: number
  showCircles: boolean
}

export const FourierVisualization: React.FC<FourierVisualizationProps> = ({
  components,
  time,
  showTrails,
  trailLength,
  showCircles
}) => {
  const trailRef = useRef<THREE.Group>(null)
  const circlesRef = useRef<THREE.Group>(null)

  // Calculate Fourier points
  const fourierPoints = useMemo(() => {
    const points: Point3D[] = []
    let currentX = 0
    let currentY = 0
    let currentZ = 0

    for (let i = 0; i < components.length; i++) {
      const component = components[i]
      const angle = component.frequency * time + component.phase
      
      // Calculate circle center
      const centerX = currentX
      const centerY = currentY
      const centerZ = currentZ

      // Add circle points for visualization
      if (showCircles) {
        for (let j = 0; j <= 64; j++) {
          const circleAngle = (j / 64) * Math.PI * 2
          const x = centerX + component.amplitude * Math.cos(circleAngle)
          const y = centerY + component.amplitude * Math.sin(circleAngle)
          const z = centerZ + component.zOffset
          points.push({ x, y, z })
        }
      }

      // Update current position
      currentX += component.amplitude * Math.cos(angle)
      currentY += component.amplitude * Math.sin(angle)
      currentZ += component.zOffset
    }

    // Add final point
    points.push({ x: currentX, y: currentY, z: currentZ })
    return points
  }, [components, time, showCircles])

  // Calculate trail points
  const trailPoints = useMemo(() => {
    if (!showTrails) return []
    
    const points: Point3D[] = []
    const trailSteps = Math.min(trailLength, 300) // Increased max trail length
    
    for (let step = 0; step < trailSteps; step++) {
      const trailTime = time - (step * 0.015) // Slower trail decay for longer trails
      let currentX = 0
      let currentY = 0
      let currentZ = 0

      for (const component of components) {
        const angle = component.frequency * trailTime + component.phase
        currentX += component.amplitude * Math.cos(angle)
        currentY += component.amplitude * Math.sin(angle)
        currentZ += component.zOffset
      }

      points.push({ x: currentX, y: currentY, z: currentZ })
    }
    return points
  }, [components, time, showTrails, trailLength])

  // Calculate current position
  const currentPosition = useMemo(() => {
    let currentX = 0
    let currentY = 0
    let currentZ = 0

    for (const component of components) {
      const angle = component.frequency * time + component.phase
      currentX += component.amplitude * Math.cos(angle)
      currentY += component.amplitude * Math.sin(angle)
      currentZ += component.zOffset
    }

    return { x: currentX, y: currentY, z: currentZ }
  }, [components, time])

  useFrame(() => {
    // Update trail position
    if (trailRef.current && showTrails) {
      trailRef.current.position.set(currentPosition.x, currentPosition.y, currentPosition.z)
    }
  })

  return (
    <group>
      {/* Fourier Circles */}
      {showCircles && (
        <group ref={circlesRef}>
          {components.map((component, index) => {
            let centerX = 0
            let centerY = 0
            let centerZ = 0

            // Calculate center position for this circle
            for (let i = 0; i < index; i++) {
              const prevComponent = components[i]
              const angle = prevComponent.frequency * time + prevComponent.phase
              centerX += prevComponent.amplitude * Math.cos(angle)
              centerY += prevComponent.amplitude * Math.sin(angle)
              centerZ += prevComponent.zOffset
            }

            return (
              <Circle
                key={index}
                args={[component.amplitude, 32]}
                position={[centerX, centerY, centerZ]}
                rotation={[0, 0, 0]}
              >
                <meshBasicMaterial
                  color={component.color}
                  transparent={true}
                  opacity={0.2}
                />
              </Circle>
            )
          })}
        </group>
      )}

      {/* Trail Line */}
      {showTrails && trailPoints.length > 1 && (
        <group ref={trailRef}>
          <Line
            points={trailPoints.map(p => [p.x, p.y, p.z])}
            color="#00ffff"
            lineWidth={3}
            transparent={true}
            opacity={0.8}
          />
        </group>
      )}

      {/* Current Position Sphere */}
      <Sphere
        args={[0.15, 16, 16]}
        position={[currentPosition.x, currentPosition.y, currentPosition.z]}
      >
        <meshBasicMaterial
          color="#ff00ff"
          transparent={true}
          opacity={0.9}
        />
      </Sphere>

      {/* Component Spheres */}
      {components.map((component, index) => {
        let centerX = 0
        let centerY = 0
        let centerZ = 0

        // Calculate center position for this component
        for (let i = 0; i < index; i++) {
          const prevComponent = components[i]
          const angle = prevComponent.frequency * time + prevComponent.phase
          centerX += prevComponent.amplitude * Math.cos(angle)
          centerY += prevComponent.amplitude * Math.sin(angle)
          centerZ += prevComponent.zOffset
        }

        const angle = component.frequency * time + component.phase
        const sphereX = centerX + component.amplitude * Math.cos(angle)
        const sphereY = centerY + component.amplitude * Math.sin(angle)
        const sphereZ = centerZ + component.zOffset

        return (
          <Sphere
            key={`component-${index}`}
            args={[0.12, 12, 12]}
            position={[sphereX, sphereY, sphereZ]}
          >
            <meshBasicMaterial
              color={component.color}
              transparent={true}
              opacity={component.opacity}
            />
          </Sphere>
        )
      })}
    </group>
  )
}
