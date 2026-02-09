import React, { useMemo } from 'react'
import { Line, Sphere, Circle } from '@react-three/drei'

interface FourierTransformProps {
  drawnPoints: { x: number; y: number }[]
  time: number
  showCircles: boolean
  showTrails: boolean
  trailLength: number
  showCompletePath: boolean
}

export const FourierTransform: React.FC<FourierTransformProps> = ({
  drawnPoints,
  time,
  showCircles,
  showTrails,
  trailLength,
  showCompletePath
}) => {
  // Calculate Fourier coefficients from drawn points
  const fourierCoefficients = useMemo(() => {
    if (drawnPoints.length < 2) return []
    
    const N = drawnPoints.length
    const coefficients: { amplitude: number; phase: number; frequency: number; color: string }[] = []
    
    // Calculate coefficients for different frequencies
    for (let k = -5; k <= 5; k++) {
      let real = 0
      let imag = 0
      
      for (let n = 0; n < N; n++) {
        const angle = (-2 * Math.PI * k * n) / N
        real += drawnPoints[n].x * Math.cos(angle) - drawnPoints[n].y * Math.sin(angle)
        imag += drawnPoints[n].x * Math.sin(angle) + drawnPoints[n].y * Math.cos(angle)
      }
      
      real /= N
      imag /= N
      
      const amplitude = Math.sqrt(real * real + imag * imag)
      const phase = Math.atan2(imag, real)
      
      if (amplitude > 0.05) { // Only show significant coefficients
        coefficients.push({
          amplitude,
          phase,
          frequency: k,
          color: k === 0 ? '#00ffff' : k > 0 ? '#ff00ff' : '#00ff80'
        })
      }
    }
    
    return coefficients.sort((a, b) => b.amplitude - a.amplitude)
  }, [drawnPoints])

  // Calculate current Fourier reconstruction
  const currentPosition = useMemo(() => {
    let x = 0
    let y = 0
    
    for (const coeff of fourierCoefficients) {
      const angle = coeff.frequency * time + coeff.phase
      x += coeff.amplitude * Math.cos(angle)
      y += coeff.amplitude * Math.sin(angle)
    }
    
    return { x, y }
  }, [fourierCoefficients, time])

  // Calculate trail points
  const trailPoints = useMemo(() => {
    if (!showTrails) return []
    
    const points: { x: number; y: number }[] = []
    const steps = Math.min(trailLength, 200)
    
    for (let i = 0; i < steps; i++) {
      const trailTime = time - (i * 0.02)
      let x = 0
      let y = 0
      
      for (const coeff of fourierCoefficients) {
        const angle = coeff.frequency * trailTime + coeff.phase
        x += coeff.amplitude * Math.cos(angle)
        y += coeff.amplitude * Math.sin(angle)
      }
      
      points.push({ x, y })
    }
    
    return points
  }, [fourierCoefficients, time, showTrails, trailLength])

  // Calculate complete reconstructed path
  const completePath = useMemo(() => {
    if (!showCompletePath) return []
    
    const points: { x: number; y: number }[] = []
    const steps = 100
    
    for (let i = 0; i < steps; i++) {
      const t = (i / steps) * 2 * Math.PI
      let x = 0
      let y = 0
      
      for (const coeff of fourierCoefficients) {
        const angle = coeff.frequency * t + coeff.phase
        x += coeff.amplitude * Math.cos(angle)
        y += coeff.amplitude * Math.sin(angle)
      }
      
      points.push({ x, y })
    }
    
    return points
  }, [fourierCoefficients, showCompletePath])

  return (
    <group>
      {/* Original drawn path */}
      {drawnPoints.length > 1 && (
        <Line
          points={drawnPoints.map(p => [p.x, p.y, 0.1])}
          color="#ffff00"
          lineWidth={1}
          transparent={true}
          opacity={0.5}
        />
      )}

      {/* Complete reconstructed path */}
      {showCompletePath && completePath.length > 1 && (
        <Line
          points={completePath.map(p => [p.x, p.y, 0])}
          color="#ffffff"
          lineWidth={2}
          transparent={true}
          opacity={0.7}
        />
      )}

      {/* Fourier circles */}
      {showCircles && fourierCoefficients.map((coeff, index) => {
        let centerX = 0
        let centerY = 0
        
        // Calculate center position for this circle
        for (let i = 0; i < index; i++) {
          const prevCoeff = fourierCoefficients[i]
          const angle = prevCoeff.frequency * time + prevCoeff.phase
          centerX += prevCoeff.amplitude * Math.cos(angle)
          centerY += prevCoeff.amplitude * Math.sin(angle)
        }

        return (
          <Circle
            key={index}
            args={[coeff.amplitude, 32]}
            position={[centerX, centerY, 0]}
            rotation={[0, 0, 0]}
          >
            <meshBasicMaterial
              color={coeff.color}
              transparent={true}
              opacity={0.3}
            />
          </Circle>
        )
      })}

      {/* Component spheres */}
      {showCircles && fourierCoefficients.map((coeff, index) => {
        let centerX = 0
        let centerY = 0
        
        for (let i = 0; i < index; i++) {
          const prevCoeff = fourierCoefficients[i]
          const angle = prevCoeff.frequency * time + prevCoeff.phase
          centerX += prevCoeff.amplitude * Math.cos(angle)
          centerY += prevCoeff.amplitude * Math.sin(angle)
        }

        const angle = coeff.frequency * time + coeff.phase
        const sphereX = centerX + coeff.amplitude * Math.cos(angle)
        const sphereY = centerY + coeff.amplitude * Math.sin(angle)

        return (
          <Sphere
            key={`component-${index}`}
            args={[0.08, 8, 8]}
            position={[sphereX, sphereY, 0]}
          >
            <meshBasicMaterial
              color={coeff.color}
              transparent={true}
              opacity={0.8}
            />
          </Sphere>
        )
      })}

      {/* Trail */}
      {showTrails && trailPoints.length > 1 && (
        <Line
          points={trailPoints.map(p => [p.x, p.y, 0])}
          color="#00ffff"
          lineWidth={3}
          transparent={true}
          opacity={0.8}
        />
      )}

      {/* Current position */}
      <Sphere
        args={[0.1, 16, 16]}
        position={[currentPosition.x, currentPosition.y, 0]}
      >
        <meshBasicMaterial
          color="#ff00ff"
          transparent={true}
          opacity={0.9}
        />
      </Sphere>
    </group>
  )
}
