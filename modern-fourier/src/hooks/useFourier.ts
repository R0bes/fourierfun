import { useState, useEffect, useRef } from 'react'
import { useControls } from 'leva'

export interface Point {
  x: number
  y: number
}

export interface FourierComponent {
  amplitude: number
  phase: number
  frequency: number
}

export interface FourierData {
  components: FourierComponent[]
  path: Point[]
  animationTime: number
  reconstructedPath: Point[]
}

export const useFourier = () => {
  const [drawing, setDrawing] = useState<Point[]>([])
  const [fourierData, setFourierData] = useState<FourierData>({
    components: [],
    path: [],
    animationTime: 0,
    reconstructedPath: []
  })
  
  const [isCalculating, setIsCalculating] = useState(false)
  const [isDrawing, setIsDrawing] = useState(false)
  const animationRef = useRef<number>()
  
  const {
    frequencyCount,
    animationSpeed,
    glowIntensity,
    distortionAmount,
    color1,
    color2,
    showCircles,
    showTrails,
    trailLength,
    showDrawing,
    showReconstructedPath,
    circleSize,
    lineThickness
  } = useControls({
    frequencyCount: { value: 20, min: 5, max: 100, step: 1 },
    animationSpeed: { value: 1.0, min: 0.1, max: 5.0, step: 0.1 },
    glowIntensity: { value: 2.0, min: 0.0, max: 10.0, step: 0.1 },
    distortionAmount: { value: 0.1, min: 0.0, max: 1.0, step: 0.01 },
    color1: { value: '#00ff88' },
    color2: { value: '#ff0088' },
    showCircles: { value: true },
    showTrails: { value: true },
    trailLength: { value: 100, min: 10, max: 500, step: 10 },
    showDrawing: { value: true },
    showReconstructedPath: { value: true },
    circleSize: { value: 1.0, min: 0.1, max: 3.0, step: 0.1 },
    lineThickness: { value: 2.0, min: 0.5, max: 10.0, step: 0.1 }
  })

  // Convert drawing points to complex numbers for FFT
  const pointsToComplex = (points: Point[]): { real: number; imag: number }[] => {
    return points.map(point => ({
      real: point.x,
      imag: point.y
    }))
  }

  // FFT implementation for drawing points
  const calculateFFT = (points: Point[]): FourierComponent[] => {
    if (points.length === 0) return []
    
    const N = points.length
    const components: FourierComponent[] = []
    
    // Convert points to complex numbers
    const complexPoints = pointsToComplex(points)
    
    for (let k = 0; k < Math.min(frequencyCount, N); k++) {
      let real = 0
      let imag = 0
      
      for (let n = 0; n < N; n++) {
        const angle = -2 * Math.PI * k * n / N
        real += complexPoints[n].real * Math.cos(angle) - complexPoints[n].imag * Math.sin(angle)
        imag += complexPoints[n].real * Math.sin(angle) + complexPoints[n].imag * Math.cos(angle)
      }
      
      const amplitude = Math.sqrt(real * real + imag * imag) / N
      const phase = Math.atan2(imag, real)
      
      components.push({
        amplitude,
        phase,
        frequency: k
      })
    }
    
    return components
  }

  // Reconstruct path from Fourier components
  const reconstructPath = (components: FourierComponent[], time: number): Point[] => {
    const path: Point[] = []
    const steps = 200
    
    for (let i = 0; i < steps; i++) {
      const t = (i / steps) * 2 * Math.PI
      let x = 0
      let y = 0
      
      components.forEach((component) => {
        const angle = component.frequency * t + component.phase + time * animationSpeed
        const radius = component.amplitude
        
        x += radius * Math.cos(angle)
        y += radius * Math.sin(angle)
      })
      
      path.push({ x, y })
    }
    
    return path
  }

  // Add point to drawing
  const addPoint = (point: Point) => {
    setDrawing(prev => [...prev, point])
  }

  // Start drawing
  const startDrawing = (point: Point) => {
    console.log('🎨 Starting to draw at:', point)
    setIsDrawing(true)
    setDrawing([point])
  }

  // Continue drawing
  const continueDrawing = (point: Point) => {
    if (isDrawing) {
      console.log('✏️ Drawing point:', point)
      addPoint(point)
    }
  }

  // Finish drawing
  const finishDrawing = () => {
    console.log('✅ Finished drawing with', drawing.length, 'points')
    setIsDrawing(false)
    if (drawing.length > 0) {
      calculateFourierFromDrawing()
    }
  }

  // Clear drawing
  const clearDrawing = () => {
    setDrawing([])
    setFourierData({
      components: [],
      path: [],
      animationTime: 0,
      reconstructedPath: []
    })
  }

  // Calculate Fourier from current drawing
  const calculateFourierFromDrawing = () => {
    if (drawing.length === 0) return
    
    console.log('🔄 Calculating Fourier for', drawing.length, 'points')
    setIsCalculating(true)
    
    // Simulate calculation delay for smooth UX
    setTimeout(() => {
      const components = calculateFFT(drawing)
      const reconstructedPath = reconstructPath(components, 0)
      
      console.log('🌀 Generated', components.length, 'Fourier components')
      
      setFourierData(prev => ({
        ...prev,
        components,
        reconstructedPath
      }))
      
      setIsCalculating(false)
    }, 100)
  }

  // Add a test drawing on startup
  useEffect(() => {
    // Add some test points to see if drawing works
    const testPoints: Point[] = [
      { x: -2, y: 0 },
      { x: -1, y: 1 },
      { x: 0, y: 0 },
      { x: 1, y: -1 },
      { x: 2, y: 0 }
    ]
    
    setDrawing(testPoints)
    console.log('🧪 Added test drawing points:', testPoints.length)
  }, [])

  // Recalculate Fourier when drawing changes
  useEffect(() => {
    if (drawing.length > 0 && !isDrawing) {
      calculateFourierFromDrawing()
    }
  }, [drawing, isDrawing])

  // Animation loop
  useEffect(() => {
    const animate = () => {
      setFourierData(prev => {
        const newTime = prev.animationTime + 0.016 * animationSpeed
        const reconstructedPath = reconstructPath(prev.components, newTime)
        
        return {
          ...prev,
          animationTime: newTime,
          reconstructedPath
        }
      })
      
      animationRef.current = requestAnimationFrame(animate)
    }
    
    animationRef.current = requestAnimationFrame(animate)
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [animationSpeed, fourierData.components])

  return {
    drawing,
    fourierData,
    isCalculating,
    isDrawing,
    startDrawing,
    continueDrawing,
    finishDrawing,
    clearDrawing,
    controls: {
      frequencyCount,
      animationSpeed,
      glowIntensity,
      distortionAmount,
      color1,
      color2,
      showCircles,
      showTrails,
      trailLength,
      showDrawing,
      showReconstructedPath,
      circleSize,
      lineThickness
    }
  }
}
