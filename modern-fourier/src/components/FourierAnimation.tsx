import React, { useEffect, useRef } from 'react'
import { CurveData } from '../types'

interface FourierAnimationProps {
  curveData: CurveData
  canvasWidth: number
  canvasHeight: number
}

export const FourierAnimation: React.FC<FourierAnimationProps> = ({
  curveData,
  canvasWidth,
  canvasHeight
}) => {
  const animationRef = useRef<number>()
  const startTimeRef = useRef<number>()

  useEffect(() => {
    if (!curveData.isCurveFixed || curveData.fourierComponents.length === 0) {
      return
    }

    const animate = (currentTime: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = currentTime
      }

      const elapsed = (currentTime - startTimeRef.current) / 1000 // Convert to seconds
      const animationSpeed = 0.5 // Adjust speed as needed
      void (elapsed * animationSpeed)

      // Update animation time in parent component
      // This would need to be passed as a prop or handled differently
      
      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [curveData.isCurveFixed, curveData.fourierComponents.length])

  if (!curveData.isCurveFixed || curveData.fourierComponents.length === 0) {
    return null
  }

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: 10
    }}>
      {/* Fourier animation will be rendered here */}
      <svg width={canvasWidth} height={canvasHeight} style={{ position: 'absolute', top: 0, left: 0 }}>
        {/* This will be implemented in the next step */}
      </svg>
    </div>
  )
}
