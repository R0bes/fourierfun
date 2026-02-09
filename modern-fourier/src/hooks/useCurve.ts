import { useState, useCallback } from 'react'
import { Point, CurveData, FourierComponent, AnimationFrame } from '../types'
import { generateCubicBezierCurve, generateUniformPointsOnCurve, calculateCenterOfMass, iterativelyReduceLinePoints, calculateCurveAnalysis } from '../utils/math'
import { computeFourierDFT } from '../utils/fourier'
import { loadImageForBackground } from '../utils/imageProcessing'
import { Settings } from '../types'

// Helper function for scaling contours (moved from imageProcessing.ts)
const scaleContoursToCanvas = (contours: Point[][], imageWidth: number, imageHeight: number): Point[] => {
  if (contours.length === 0) return []
  
  const contour = contours[0] // Use the largest contour
  
  // Scale to fill 90% of our coordinate system (-180 to 180)
  const targetSize = 360 // 90% of 400 (which is -200 to 200)
  const scaleX = targetSize / imageWidth
  const scaleY = targetSize / imageHeight
  const scale = Math.min(scaleX, scaleY)
  
  // Center the contour
  const centerX = imageWidth / 2
  const centerY = imageHeight / 2
  
  return contour.map(point => ({
    x: (point.x - centerX) * scale,
    y: (point.y - centerY) * scale
  }))
}

export const useCurve = () => {
  const [curveData, setCurveData] = useState<CurveData>({
    drawnPoints: [],
    completeCurve: [],
    uniformPoints: [],
    centerOfMass: null, // No center of mass until curve is closed
    isCurveClosed: false,
    isCurveFixed: false,
    isCurveConfigured: false, // New phase: Config
    fourierComponents: [],
    animationTime: 0,
    fourierAnimation: [],
    currentAnimationStep: 0,
    animationSteps: 100,
    curveAnalysis: null,
    backgroundImage: null,
    processedImage: null
  })

  // Define generateAnimation first, before other functions that use it
  const generateAnimation = useCallback((components: FourierComponent[], steps: number = 100) => {
    const animation: AnimationFrame[][] = []
    
    for (let step = 0; step < steps; step++) {
      const t = (step / steps) * 2 * Math.PI
      const frame: AnimationFrame[] = []
      
      // Start from origin (0,0) - this is the correct Fourier calculation
      let currentX = 0
      let currentY = 0
      
      for (const component of components) {
        const angle = component.freq * t + component.phase
        const x = currentX + component.amplitude * Math.cos(angle)
        const y = currentY + component.amplitude * Math.sin(angle)
        
        frame.push({
          position: { x, y },
          angle: angle,
          amplitude: component.amplitude
        })
        
        currentX = x
        currentY = y
      }
      
      animation.push(frame)
    }
    
    return animation
  }, [])

  const addPoint = useCallback((point: Point) => {
    setCurveData(prev => {
      const newDrawnPoints = [...prev.drawnPoints, point]
      
      // If this is the first point, automatically close the curve
      const shouldCloseCurve = newDrawnPoints.length === 1
      const newIsCurveClosed = shouldCloseCurve || prev.isCurveClosed
      
      // Generate curve (closed if first point or already closed)
      const newCompleteCurve = generateCubicBezierCurve(newDrawnPoints, newIsCurveClosed)
      
      // Update uniform points and center of mass if curve is closed
      let newUniformPoints = prev.uniformPoints
      let newCenterOfMass = prev.centerOfMass
      
      if (newIsCurveClosed) {
        newUniformPoints = generateUniformPointsOnCurve(newCompleteCurve, 32)
        newCenterOfMass = { x: 0, y: 0 } // Default to origin
        // Note: autoCalculateCenter will be handled by the calling function
      }
      
      return {
        ...prev,
        drawnPoints: newDrawnPoints,
        completeCurve: newCompleteCurve,
        uniformPoints: newUniformPoints,
        centerOfMass: newCenterOfMass,
        isCurveClosed: newIsCurveClosed
      }
    })
  }, [])

  const addLinePoints = useCallback((points: Point[]) => {
    setCurveData(prev => {
      if (points.length === 0) return prev
      
      // Iteratively reduce points to find the optimal balance between smoothness and detail
      const optimizedPoints = iterativelyReduceLinePoints(points)
      const newDrawnPoints = [...prev.drawnPoints, ...optimizedPoints]
      
      // Line mode: always close the curve automatically
      const newIsCurveClosed = true
      
      // Generate closed curve with Bezier interpolation
      const newCompleteCurve = generateCubicBezierCurve(newDrawnPoints, true) // true = closed
      
      // Update uniform points and center of mass for closed curve
      const newUniformPoints = generateUniformPointsOnCurve(newCompleteCurve, 32)
      const newCenterOfMass = { x: 0, y: 0 } // Default to origin
      
      // Calculate curve analysis for the optimized points using uniform points
      const curveAnalysis = calculateCurveAnalysis(optimizedPoints, newUniformPoints)
      
      return {
        ...prev,
        drawnPoints: newDrawnPoints,
        completeCurve: newCompleteCurve,
        uniformPoints: newUniformPoints,
        centerOfMass: newCenterOfMass,
        isCurveClosed: newIsCurveClosed,
        curveAnalysis: curveAnalysis
      }
    })
  }, [])

  const closeCurve = useCallback((autoCalculateCenter: boolean) => {
    setCurveData(prev => {
      if (prev.drawnPoints.length < 1) return prev

      // Generate closed curve without duplicating the first point
      const closedCurve = generateCubicBezierCurve(prev.drawnPoints, true) // true = closed
      const uniformPoints = generateUniformPointsOnCurve(closedCurve, 32)
      
      let centerOfMass = { x: 0, y: 0 } // Default to origin
      if (autoCalculateCenter) {
        centerOfMass = calculateCenterOfMass(uniformPoints)
      }

      return {
        ...prev,
        completeCurve: closedCurve,
        uniformPoints,
        centerOfMass,
        isCurveClosed: true,
        isCurveFixed: false // Stay in Phase 2 (EDIT) after closing
      }
    })
  }, [])

  const configureCurve = useCallback(() => {
    setCurveData(prev => {
      if (!prev.isCurveClosed || prev.uniformPoints.length === 0) {
        return prev // Can't configure if curve is not closed
      }
      
      // Generate Fourier components but no animation yet
      const fourierComponents = computeFourierDFT(prev.uniformPoints, prev.centerOfMass || { x: 0, y: 0 })
      
      return {
        ...prev,
        isCurveConfigured: true,
        fourierComponents
      }
    })
  }, [])

  const startCurve = useCallback(() => {
    setCurveData(prev => {
      if (!prev.isCurveConfigured || prev.fourierComponents.length === 0) {
        return prev // Can't start if curve is not configured
      }
      
      // Generate animation from existing components
      const fourierAnimation = generateAnimation(prev.fourierComponents, 100)
      
      return {
        ...prev,
        isCurveFixed: true,
        fourierAnimation,
        currentAnimationStep: 0,
        animationSteps: 100
      }
    })
  }, [generateAnimation])

  const clearCurve = useCallback(() => {
    setCurveData({
      drawnPoints: [],
      completeCurve: [],
      uniformPoints: [],
      centerOfMass: null, // No center of mass until curve is closed
      isCurveClosed: false,
      isCurveFixed: false,
      isCurveConfigured: false, // Reset config phase
      fourierComponents: [],
      animationTime: 0,
      fourierAnimation: [],
      currentAnimationStep: 0,
      animationSteps: 100,
      curveAnalysis: null,
      backgroundImage: null,
      processedImage: null
    })
  }, [])

  const updatePoint = useCallback((index: number, newPoint: Point) => {
    setCurveData(prev => {
      const newDrawnPoints = [...prev.drawnPoints]
      newDrawnPoints[index] = newPoint
      
      // If curve is closed, keep it closed; otherwise keep it open
      const newCompleteCurve = generateCubicBezierCurve(newDrawnPoints, prev.isCurveClosed)
      
      // Update uniform points and center of mass if curve is closed
      let newUniformPoints = prev.uniformPoints
      let newCenterOfMass = prev.centerOfMass
      
      if (prev.isCurveClosed) {
        newUniformPoints = generateUniformPointsOnCurve(newCompleteCurve, 32)
        newCenterOfMass = { x: 0, y: 0 } // Default to origin
        // Note: autoCalculateCenter will be handled by the calling function
      }
      
      return {
        ...prev,
        drawnPoints: newDrawnPoints,
        completeCurve: newCompleteCurve,
        uniformPoints: newUniformPoints,
        centerOfMass: newCenterOfMass
      }
    })
  }, [])

  const insertPoint = useCallback((index: number, point: Point) => {
    setCurveData(prev => {
      const newDrawnPoints = [...prev.drawnPoints]
      newDrawnPoints.splice(index, 0, point) // Insert at specific position
      
      // If curve is closed, keep it closed; otherwise keep it open
      const newCompleteCurve = generateCubicBezierCurve(newDrawnPoints, prev.isCurveClosed)
      
      // Update uniform points and center of mass if curve is closed
      let newUniformPoints = prev.uniformPoints
      let newCenterOfMass = prev.centerOfMass
      
      if (prev.isCurveClosed) {
        newUniformPoints = generateUniformPointsOnCurve(newCompleteCurve, 32)
        newCenterOfMass = { x: 0, y: 0 } // Default to origin
        // Note: autoCalculateCenter will be handled by the calling function
      }
      
      return {
        ...prev,
        drawnPoints: newDrawnPoints,
        completeCurve: newCompleteCurve,
        uniformPoints: newUniformPoints,
        centerOfMass: newCenterOfMass
      }
    })
  }, [])

  const updateUniformPoints = useCallback((numPoints: number, autoCalculateCenter: boolean = true) => {
    setCurveData(prev => {
      if (prev.completeCurve.length < 1) return prev
      
      const uniformPoints = generateUniformPointsOnCurve(prev.completeCurve, numPoints)
      
      let centerOfMass = prev.centerOfMass
      if (autoCalculateCenter) {
        centerOfMass = calculateCenterOfMass(uniformPoints)
      }
      
      return {
        ...prev,
        uniformPoints,
        centerOfMass
      }
    })
  }, [])

  const updateCenterOfMass = useCallback((autoCalculate: boolean, newCenter?: Point) => {
    setCurveData(prev => {
      if (newCenter) {
        // When manually moving center, recalculate Fourier if curve is fixed
        if (prev.isCurveFixed && prev.uniformPoints.length > 0) {
          const fourierComponents = computeFourierDFT(prev.uniformPoints, newCenter)
          const fourierAnimation = generateAnimation(fourierComponents, prev.animationSteps)
          
          return {
            ...prev,
            centerOfMass: newCenter,
            fourierComponents,
            fourierAnimation,
            currentAnimationStep: 0
          }
        }
        
        return {
          ...prev,
          centerOfMass: newCenter
        }
      }
      
      if (!autoCalculate) return prev
      
      const centerOfMass = calculateCenterOfMass(prev.uniformPoints)
      
      // Recalculate Fourier if curve is fixed
      if (prev.isCurveFixed && prev.uniformPoints.length > 0) {
        const fourierComponents = computeFourierDFT(prev.uniformPoints, centerOfMass)
        const fourierAnimation = generateAnimation(fourierComponents, prev.animationSteps)
        
        return {
          ...prev,
          centerOfMass,
          fourierComponents,
          fourierAnimation,
          currentAnimationStep: 0
        }
      }
      
      return {
        ...prev,
        centerOfMass
      }
    })
  }, [])

  const updateCenterOfMassAutomatically = useCallback((autoCalculateCenter: boolean) => {
    setCurveData(prev => {
      if (!autoCalculateCenter) {
        // If auto-calculate is disabled, keep center at current position
        return prev
      }
      
      if (prev.uniformPoints.length === 0) return prev
      
      // Calculate center of mass from uniform points
      const centerOfMass = calculateCenterOfMass(prev.uniformPoints)
      
      // Recalculate Fourier if curve is fixed
      if (prev.isCurveFixed && prev.uniformPoints.length > 0) {
        const fourierComponents = computeFourierDFT(prev.uniformPoints, centerOfMass)
        const fourierAnimation = generateAnimation(fourierComponents, prev.animationSteps)
        
        return {
          ...prev,
          centerOfMass,
          fourierComponents,
          fourierAnimation,
          currentAnimationStep: 0
        }
      }
      
      return {
        ...prev,
        centerOfMass
      }
    })
  }, [])

  const initializeCenterOfMass = useCallback(() => {
    setCurveData(prev => ({
      ...prev,
      centerOfMass: { x: 0, y: 0 }, // Start at mathematical origin (0,0)
      fourierComponents: [],
      animationTime: 0
    }))
  }, [])

  const startFourier = useCallback(() => {
    setCurveData(prev => {
      // Compute Fourier components from uniform points relative to center of mass
      const fourierComponents = computeFourierDFT(prev.uniformPoints, prev.centerOfMass || { x: 0, y: 0 })
      
      // Generate pre-computed animation
      const fourierAnimation = generateAnimation(fourierComponents, prev.animationSteps)
      
      return {
        ...prev,
        isCurveFixed: true,
        fourierComponents,
        animationTime: 0,
        fourierAnimation,
        currentAnimationStep: 0
      }
    })
  }, [generateAnimation])

  const stopFourier = useCallback(() => {
    setCurveData(prev => ({
      ...prev,
      isCurveFixed: false,
      fourierComponents: [],
      fourierAnimation: [],
      animationTime: 0,
      currentAnimationStep: 0
    }))
  }, [])

  const deletePoint = useCallback((index: number) => {
    console.log('🔴 DELETE POINT aufgerufen! Index:', index, 'Zeitstempel:', new Date().toISOString())
    setCurveData(prev => {
      if (prev.drawnPoints.length <= 1) {
        console.log('🔴 DELETE POINT abgebrochen - nur 1 Punkt vorhanden')
        return prev // Don't delete if we have only 1 point
      }
      
      console.log('🔴 DELETE POINT wird ausgeführt - Punkt wird gelöscht')
      const newDrawnPoints = [...prev.drawnPoints]
      newDrawnPoints.splice(index, 1)
      
      // If curve is closed, keep it closed; otherwise keep it open
      const newCompleteCurve = generateCubicBezierCurve(newDrawnPoints, prev.isCurveClosed)
      
      // Update uniform points and center of mass if curve is closed
      let newUniformPoints = prev.uniformPoints
      let newCenterOfMass = prev.centerOfMass
      
      if (prev.isCurveClosed) {
        newUniformPoints = generateUniformPointsOnCurve(newCompleteCurve, 32)
        newCenterOfMass = { x: 0, y: 0 } // Default to origin
        // Note: autoCalculateCenter will be handled by the calling function
      }
      
      return {
        ...prev,
        drawnPoints: newDrawnPoints,
        completeCurve: newCompleteCurve,
        uniformPoints: newUniformPoints,
        centerOfMass: newCenterOfMass
      }
    })
  }, [])

  const updateAnimationTime = useCallback((time: number) => {
    setCurveData(prev => ({
      ...prev,
      animationTime: time
    }))
  }, [])

  const updateAnimationStep = useCallback((step: number) => {
    setCurveData(prev => ({
      ...prev,
      currentAnimationStep: step % prev.animationSteps
    }))
  }, [])

  const goToEditPhase = useCallback(() => {
    setCurveData(prev => ({
      ...prev,
      isCurveConfigured: false,
      isCurveFixed: false,
      fourierComponents: [],
      fourierAnimation: [],
      currentAnimationStep: 0
    }))
  }, [])

  const goToDrawPhase = useCallback(() => {
    setCurveData(prev => ({
      ...prev,
      isCurveClosed: false,
      isCurveConfigured: false,
      isCurveFixed: false,
      // Keep the drawn points but regenerate the curve as open
      completeCurve: generateCubicBezierCurve(prev.drawnPoints, false),
      uniformPoints: [],
      centerOfMass: null,
      fourierComponents: [],
      fourierAnimation: [],
      currentAnimationStep: 0
    }))
  }, [])

  const loadImage = useCallback(async (file: File) => {
    console.log('🖼️ Starting image load:', file.name, file.type, file.size)
    
    try {
      // First, load image for background display
      console.log('📸 Loading image for background...')
      const backgroundImage = await loadImageForBackground(file)
      console.log('✅ Background image loaded:', backgroundImage.width, 'x', backgroundImage.height)
      
      // Create processed image canvas for editing
      console.log('🎨 Creating processed image canvas...')
      const processedCanvas = document.createElement('canvas')
      const processedCtx = processedCanvas.getContext('2d')
      if (!processedCtx) throw new Error('Could not get canvas context')
      
      processedCanvas.width = backgroundImage.width
      processedCanvas.height = backgroundImage.height
      processedCtx.drawImage(backgroundImage, 0, 0)
      console.log('✅ Processed image canvas created:', processedCanvas.width, 'x', processedCanvas.height)
      
      // Clear existing curve and load image
      setCurveData(prev => {
        console.log('🔄 Updating curve data...')
        
        return {
          ...prev,
          backgroundImage: backgroundImage,
          processedImage: processedCanvas
        }
      })
    } catch (error) {
      console.error('❌ Error processing image:', error)
    }
  }, [])

  const processImage = useCallback((settings: Settings) => {
    if (!curveData.processedImage || !curveData.backgroundImage) return
    
    console.log('🎨 Processing image with settings:', settings)
    
    const canvas = curveData.processedImage
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // Clear canvas and redraw original image
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(curveData.backgroundImage, 0, 0)
    
    // Apply image processing
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data
    
    // Apply brightness and contrast
    const brightness = settings.imageBrightness
    const contrast = settings.imageContrast
    
    for (let i = 0; i < data.length; i += 4) {
      // Apply brightness
      data[i] = Math.max(0, Math.min(255, data[i] + brightness))
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + brightness))
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + brightness))
      
      // Apply contrast
      const factor = (259 * (contrast + 255)) / (255 * (259 - contrast))
      data[i] = Math.max(0, Math.min(255, factor * (data[i] - 128) + 128))
      data[i + 1] = Math.max(0, Math.min(255, factor * (data[i + 1] - 128) + 128))
      data[i + 2] = Math.max(0, Math.min(255, factor * (data[i + 2] - 128) + 128))
    }
    
    // Apply threshold if enabled
    if (settings.imageThreshold !== 128) {
      for (let i = 0; i < data.length; i += 4) {
        const gray = (data[i] + data[i + 1] + data[i + 2]) / 3
        const value = gray > settings.imageThreshold ? 255 : 0
        data[i] = value
        data[i + 1] = value
        data[i + 2] = value
      }
    }
    
    // Apply invert if enabled
    if (settings.imageInvert) {
      for (let i = 0; i < data.length; i += 4) {
        data[i] = 255 - data[i]
        data[i + 1] = 255 - data[i + 1]
        data[i + 2] = 255 - data[i + 2]
      }
    }
    
    // Put processed data back
    ctx.putImageData(imageData, 0, 0)
    
    console.log('✅ Image processing complete')
  }, [curveData.processedImage, curveData.backgroundImage])

  const extractPointsFromProcessedImage = useCallback(() => {
    if (!curveData.processedImage) return []
    
    console.log('🔍 Extracting points from processed image...')
    
    const canvas = curveData.processedImage
    const ctx = canvas.getContext('2d')
    if (!ctx) return []
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data
    
    // Simple edge detection - find pixels that are significantly different from their neighbors
    const points: Point[] = []
    
    for (let y = 1; y < canvas.height - 1; y++) {
      for (let x = 1; x < canvas.width - 1; x++) {
        const idx = (y * canvas.width + x) * 4
        const currentGray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3
        
        // Check neighbors
        let maxDiff = 0
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue
            const nIdx = ((y + dy) * canvas.width + (x + dx)) * 4
            const neighborGray = (data[nIdx] + data[nIdx + 1] + data[nIdx + 2]) / 3
            const diff = Math.abs(currentGray - neighborGray)
            maxDiff = Math.max(maxDiff, diff)
          }
        }
        
        // If there's a significant difference, it's an edge
        if (maxDiff > 50) {
          points.push({ x, y })
        }
      }
    }
    
    console.log('📊 Extracted', points.length, 'edge points')
    
    // Scale points to canvas coordinates
    const scaledPoints = scaleContoursToCanvas([points], canvas.width, canvas.height)
    console.log('📏 Scaled to', scaledPoints.length, 'canvas points')
    
    return scaledPoints
  }, [curveData.processedImage])

  return {
    curveData,
    addPoint,
    addLinePoints,
    closeCurve,
    configureCurve,
    startCurve,
    clearCurve,
    updatePoint,
    insertPoint,
    deletePoint,
    updateUniformPoints,
    updateCenterOfMass,
    updateCenterOfMassAutomatically,
    initializeCenterOfMass,
    startFourier,
    stopFourier,
    updateAnimationTime,
    updateAnimationStep,
    goToEditPhase,
    goToDrawPhase,
    loadImage,
    processImage,
    extractPointsFromProcessedImage
  }
}
