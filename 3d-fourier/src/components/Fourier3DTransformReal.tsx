import React, { useMemo } from 'react'
import { Line, Sphere, Circle } from '@react-three/drei'
import * as THREE from 'three'

interface Point3D {
  x: number
  y: number
  z: number
  id: string
}

interface Fourier3DComponent {
  amplitudeX: number
  amplitudeY: number
  amplitudeZ: number
  phaseX: number
  phaseY: number
  phaseZ: number
  frequency: number
  color: string
  opacity: number
}

interface Fourier3DTransformProps {
  points3D: Point3D[]
  time: number
  showCircles: boolean
  showTrails: boolean
  trailLength: number
  trailColor: string
  showCompletePath: boolean
  maxCoefficients: number
}

export const Fourier3DTransformReal: React.FC<Fourier3DTransformProps> = ({
  points3D,
  time,
  showCircles,
  showTrails,
  trailLength,
  trailColor,
  showCompletePath,
  maxCoefficients
}) => {
  // Calculate proper 3D Fourier coefficients from 3D points
  const fourierComponents = useMemo(() => {
    if (points3D.length < 2) return []

    const N = points3D.length
    const components: Fourier3DComponent[] = []

    // Calculate coefficients for different frequencies - proper 3D Fourier
    for (let k = -Math.floor(N/2); k <= Math.floor(N/2); k++) {
      let realX = 0, imagX = 0
      let realY = 0, imagY = 0
      let realZ = 0, imagZ = 0

      for (let n = 0; n < N; n++) {
        const angle = (-2 * Math.PI * k * n) / N

        // Calculate Fourier coefficients for each dimension separately
        realX += points3D[n].x * Math.cos(angle)
        imagX += points3D[n].x * Math.sin(angle)
        
        realY += points3D[n].y * Math.cos(angle)
        imagY += points3D[n].y * Math.sin(angle)
        
        realZ += points3D[n].z * Math.cos(angle)
        imagZ += points3D[n].z * Math.sin(angle)
      }

      realX /= N; imagX /= N
      realY /= N; imagY /= N
      realZ /= N; imagZ /= N

      const amplitudeX = Math.sqrt(realX * realX + imagX * imagX)
      const phaseX = Math.atan2(imagX, realX)

      const amplitudeY = Math.sqrt(realY * realY + imagY * imagY)
      const phaseY = Math.atan2(imagY, realY)

      const amplitudeZ = Math.sqrt(realZ * realZ + imagZ * imagZ)
      const phaseZ = Math.atan2(imagZ, realZ)

      const totalAmplitude = Math.sqrt(amplitudeX * amplitudeX + amplitudeY * amplitudeY + amplitudeZ * amplitudeZ)
      const color = `hsl(${(k * 30 + 180) % 360}, 100%, 50%)`

      if (totalAmplitude > 0.01) { // Only show significant coefficients
        components.push({
          amplitudeX, amplitudeY, amplitudeZ,
          phaseX, phaseY, phaseZ,
          frequency: k,
          color,
          opacity: 0.8
        })
      }
    }

    return components.sort((a, b) => {
      const aTotal = Math.sqrt(a.amplitudeX * a.amplitudeX + a.amplitudeY * a.amplitudeY + a.amplitudeZ * a.amplitudeZ)
      const bTotal = Math.sqrt(b.amplitudeX * b.amplitudeX + b.amplitudeY * b.amplitudeY + b.amplitudeZ * b.amplitudeZ)
      return bTotal - aTotal
    }).slice(0, maxCoefficients)
  }, [points3D, maxCoefficients])

  // Calculate current 3D Fourier reconstruction
  const currentPosition = useMemo(() => {
    let x = 0
    let y = 0
    let z = 0

    for (const component of fourierComponents) {
      const angle = component.frequency * time
      
      // Proper 3D Fourier reconstruction - each dimension reconstructed separately
      x += component.amplitudeX * Math.cos(angle + component.phaseX)
      y += component.amplitudeY * Math.cos(angle + component.phaseY)
      z += component.amplitudeZ * Math.cos(angle + component.phaseZ)
    }

    return { x, y, z }
  }, [fourierComponents, time])

  // Calculate trail points
  const trailPoints = useMemo(() => {
    if (!showTrails) return []

    const points: Point3D[] = []
    const steps = Math.min(trailLength, 200)

    for (let i = 0; i < steps; i++) {
      const trailTime = time - (i * 0.02)
      let x = 0
      let y = 0
      let z = 0

      for (const component of fourierComponents) {
        const angle = component.frequency * trailTime
        
        // Proper 3D Fourier reconstruction - each dimension reconstructed separately
        x += component.amplitudeX * Math.cos(angle + component.phaseX)
        y += component.amplitudeY * Math.cos(angle + component.phaseY)
        z += component.amplitudeZ * Math.cos(angle + component.phaseZ)
      }

      points.push({ x, y, z, id: `trail-${i}` })
    }

    return points
  }, [fourierComponents, time, showTrails, trailLength])

  // Calculate complete reconstructed path
  const completePath = useMemo(() => {
    if (!showCompletePath) return []

    const points: Point3D[] = []
    const steps = 200

    for (let i = 0; i < steps; i++) {
      const t = (i / steps) * 2 * Math.PI
      let x = 0
      let y = 0
      let z = 0

      for (const component of fourierComponents) {
        const angle = component.frequency * t
        
        // Proper 3D Fourier reconstruction - each dimension reconstructed separately
        x += component.amplitudeX * Math.cos(angle + component.phaseX)
        y += component.amplitudeY * Math.cos(angle + component.phaseY)
        z += component.amplitudeZ * Math.cos(angle + component.phaseZ)
      }

      points.push({ x, y, z, id: `complete-${i}` })
    }

    return points
  }, [fourierComponents, showCompletePath])

  return (
    <group>
      {/* Original 3D points */}
      {points3D.map(p => (
        <Sphere key={p.id} args={[0.1, 16, 16]} position={[p.x, p.y, p.z]}>
          <meshStandardMaterial color="#ffff00" emissive="#ffff00" emissiveIntensity={0.3} />
        </Sphere>
      ))}

      {/* Complete reconstructed path */}
      {showCompletePath && completePath.length > 1 && (
        <Line
          points={completePath.map(p => [p.x, p.y, p.z])}
          color="#ffffff"
          lineWidth={2}
          transparent={true}
          opacity={0.7}
        />
      )}

      {/* Robot arm with multiple joints - each Fourier component is a joint */}
      {fourierComponents.map((component, index) => {
        let centerX = 0
        let centerY = 0
        let centerZ = 0

        // Calculate position of this joint based on all previous joints
        for (let i = 0; i < index; i++) {
          const prevComponent = fourierComponents[i]
          const angle = prevComponent.frequency * time
          
          // Proper 3D Fourier reconstruction - each dimension reconstructed separately
          centerX += prevComponent.amplitudeX * Math.cos(angle + prevComponent.phaseX)
          centerY += prevComponent.amplitudeY * Math.cos(angle + prevComponent.phaseY)
          centerZ += prevComponent.amplitudeZ * Math.cos(angle + prevComponent.phaseZ)
        }

        // Calculate the end position of this arm segment
        const angle = component.frequency * time
        
        // Proper 3D Fourier reconstruction - each dimension reconstructed separately
        const endX = centerX + component.amplitudeX * Math.cos(angle + component.phaseX)
        const endY = centerY + component.amplitudeY * Math.cos(angle + component.phaseY)
        const endZ = centerZ + component.amplitudeZ * Math.cos(angle + component.phaseZ)

        return (
          <group key={`arm-segment-${index}`}>
            {/* Epicycle circle - shows the actual rotation plane */}
            {showCircles && (() => {
              // Calculate the actual rotation plane from the movement
              // We need two vectors: the radius vector and the velocity vector
              const angle = component.frequency * time
              
              // Current position vector (radius vector)
              const radiusX = component.amplitudeX * Math.cos(angle + component.phaseX)
              const radiusY = component.amplitudeY * Math.cos(angle + component.phaseY)
              const radiusZ = component.amplitudeZ * Math.cos(angle + component.phaseZ)
              
              // Velocity vector (tangent to the circle)
              const velocityX = -component.amplitudeX * Math.sin(angle + component.phaseX) * component.frequency
              const velocityY = -component.amplitudeY * Math.sin(angle + component.phaseY) * component.frequency
              const velocityZ = -component.amplitudeZ * Math.sin(angle + component.phaseZ) * component.frequency
              
              // Cross product to get the normal vector to the rotation plane
              const normalX = radiusY * velocityZ - radiusZ * velocityY
              const normalY = radiusZ * velocityX - radiusX * velocityZ
              const normalZ = radiusX * velocityY - radiusY * velocityX
              
              // Normalize the normal vector
              const normalLength = Math.sqrt(normalX * normalX + normalY * normalY + normalZ * normalZ)
              if (normalLength === 0) return null
              
              const normalizedNormalX = normalX / normalLength
              const normalizedNormalY = normalY / normalLength
              const normalizedNormalZ = normalZ / normalLength
              
              // Calculate rotation angles from the normal vector
              const rotationX = Math.atan2(normalizedNormalY, normalizedNormalZ)
              const rotationY = Math.atan2(-normalizedNormalX, Math.sqrt(normalizedNormalY * normalizedNormalY + normalizedNormalZ * normalizedNormalZ))
              const rotationZ = 0
              
              // Create circle points for a thick white line
              const radius = Math.sqrt(component.amplitudeX * component.amplitudeX + component.amplitudeY * component.amplitudeY + component.amplitudeZ * component.amplitudeZ)
              const circlePoints = []
              const segments = 64
              
              for (let i = 0; i <= segments; i++) {
                const angle = (i / segments) * 2 * Math.PI
                const x = radius * Math.cos(angle)
                const y = radius * Math.sin(angle)
                const z = 0
                circlePoints.push([x, y, z])
              }
              
              return (
                <Line
                  points={circlePoints}
                  position={[centerX, centerY, centerZ]}
                  rotation={[rotationX, rotationY, rotationZ]}
                  color="#ffffff"
                  lineWidth={3}
                  transparent={true}
                  opacity={0.8}
                />
              )
            })()}
            
            {/* Arm segment - the "bone" of the robot arm */}
            <Line
              points={[
                [centerX, centerY, centerZ],
                [endX, endY, endZ]
              ]}
              color={component.color}
              lineWidth={4}
              transparent={true}
              opacity={0.8}
            />
            
            {/* Joint sphere - the "elbow" of the robot arm */}
            <Sphere
              args={[0.08, 12, 12]}
              position={[centerX, centerY, centerZ]}
            >
              <meshStandardMaterial
                color={component.color}
                transparent={true}
                opacity={0.6}
                emissive={component.color}
                emissiveIntensity={0.2}
              />
            </Sphere>

            {/* End effector - the "magic wand" at the end */}
            {index === fourierComponents.length - 1 && (
              <Sphere
                args={[0.12, 16, 16]}
                position={[endX, endY, endZ]}
              >
                <meshStandardMaterial
                  color="#ff00ff"
                  transparent={true}
                  opacity={0.9}
                  emissive="#ff00ff"
                  emissiveIntensity={0.5}
                />
              </Sphere>
            )}
          </group>
        )
      })}

      {/* Trail Line */}
      {showTrails && trailPoints.length > 1 && (
        <Line
          points={trailPoints.map(p => [p.x, p.y, p.z])}
          color={trailColor}
          lineWidth={5}
          transparent={true}
          opacity={0.9}
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