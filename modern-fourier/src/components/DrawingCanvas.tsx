import React, { useRef, useEffect, useCallback, useState, forwardRef } from 'react'
import { Point, CurveData, DragState, Settings, Machine } from '../types'
import { drawCoordinateSystem, drawCurve, drawOriginalPoints, drawUniformPoints, drawCenterOfMass, drawModeIndicator, drawFourierCircles, drawFourierTrail, drawFourierCirclesFromFrame, drawFourierPathPoint, canvasToMath, mathToCanvas, drawBackgroundImage } from '../utils/canvas'
import { GridOverlay } from '../utils/Grid'
import { drawFrequencySpectrumOverlay, drawPhaseDiagramOverlay } from '../utils/fourierOverlays'

interface DrawingCanvasProps {
  curveData: CurveData
  dragState: DragState
  settings: Settings
  /** When set, colors/alphas override global settings for the active machine */
  activeMachine: Machine | null
  onAddPoint: (point: Point) => void
  onCloseCurve: () => void
  onUpdatePoint: (index: number, point: Point) => void
  onInsertPoint: (index: number, point: Point) => void
  onDeletePoint: (index: number) => void
  onUpdateCenterOfMass: (point: Point) => void
  onInitializeCenterOfMass: () => void
  onStartDraggingCenter: () => void
  onStopDraggingCenter: () => void
  onToggleDraggingPoint: (index: number) => void
  onStopAllDragging: () => void
  onUpdateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void
  onConfigureCurve: () => void
  onStartCurve: () => void
  onStartFourier: () => void
  onStopFourier: () => void
  onUpdateAnimationTime: (time: number) => void
  onUpdateAnimationStep: (step: number) => void
  onAddLinePoints: (points: Point[]) => void
}

export const DrawingCanvas = forwardRef<HTMLCanvasElement, DrawingCanvasProps>(function DrawingCanvas(
  {
  curveData,
  dragState,
  settings,
  activeMachine,
  onAddPoint,
  onCloseCurve,
  onUpdatePoint,
  onInsertPoint,
  onDeletePoint,
  onUpdateCenterOfMass,
  onInitializeCenterOfMass: _onInitializeCenterOfMass,
  onStartDraggingCenter,
  onStopDraggingCenter: _onStopDraggingCenter,
  onToggleDraggingPoint,
  onStopAllDragging,
  onUpdateSetting: _onUpdateSetting,
  onConfigureCurve,
  onStartCurve,
  onStartFourier: _onStartFourier,
  onStopFourier: _onStopFourier,
  onUpdateAnimationTime,
  onUpdateAnimationStep,
  onAddLinePoints
  },
  ref
) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gridRef = useRef<GridOverlay | null>(null)

  const setCanvasRef = useCallback(
    (node: HTMLCanvasElement | null) => {
      ;(canvasRef as React.MutableRefObject<HTMLCanvasElement | null>).current = node
      if (typeof ref === 'function') {
        ref(node)
      } else if (ref) {
        ;(ref as React.MutableRefObject<HTMLCanvasElement | null>).current = node
      }
    },
    [ref]
  )
  const trailRef = useRef<Point[]>([])
  const onUpdateAnimationTimeRef = useRef(onUpdateAnimationTime)
  const onUpdateAnimationStepRef = useRef(onUpdateAnimationStep)
  
  // Line drawing state
  const [isDrawingLine, setIsDrawingLine] = useState(false)
  const [linePoints, setLinePoints] = useState<Point[]>([])
  
  // Update refs when functions change
  useEffect(() => {
    onUpdateAnimationTimeRef.current = onUpdateAnimationTime
  }, [onUpdateAnimationTime])
  
  useEffect(() => {
    onUpdateAnimationStepRef.current = onUpdateAnimationStep
  }, [onUpdateAnimationStep])

  // Helper function to find the closest point on the curve
  const findClosestPointOnCurve = useCallback((clickPoint: Point, curve: Point[]): number => {
    if (curve.length === 0) return -1
    
    let closestIndex = -1
    let minDistance = Infinity
    const threshold = 20 // Maximum distance to consider a hit
    
    for (let i = 0; i < curve.length; i++) {
      const point = curve[i]
      const distance = Math.sqrt(
        Math.pow(clickPoint.x - point.x, 2) + 
        Math.pow(clickPoint.y - point.y, 2)
      )
      
      if (distance < threshold && distance < minDistance) {
        minDistance = distance
        closestIndex = i
      }
    }
    
    return closestIndex
  }, [])

  // Helper function to insert a point on the curve
  const insertPointOnCurve = useCallback((newPoint: Point, curveIndex: number) => {
    if (curveData.drawnPoints.length === 0) {
      onAddPoint(newPoint)
      return
    }
    
    // Calculate the position along the curve where the click occurred
    const totalCurveLength = curveData.completeCurve.length
    const positionRatio = curveIndex / totalCurveLength
    
    // Find the corresponding position in the original points
    // Add 1 to insert after the calculated position (not before)
    const originalIndex = Math.floor(positionRatio * curveData.drawnPoints.length) + 1
    const clampedIndex = Math.min(originalIndex, curveData.drawnPoints.length)
    
    onInsertPoint(clampedIndex, newPoint)
  }, [curveData.drawnPoints, curveData.completeCurve, onAddPoint, onInsertPoint])

  // Helper function to draw the current line being drawn
  const drawCurrentLine = useCallback((ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    if (linePoints.length < 2) return
    
    ctx.strokeStyle = '#00ff80'
    ctx.lineWidth = 2
    ctx.beginPath()
    
    for (let i = 0; i < linePoints.length; i++) {
      const canvasPoint = mathToCanvas(linePoints[i], canvas.width, canvas.height)
      if (i === 0) {
        ctx.moveTo(canvasPoint.x, canvasPoint.y)
      } else {
        ctx.lineTo(canvasPoint.x, canvasPoint.y)
      }
    }
    
    ctx.stroke()
  }, [linePoints])

  // Grid drawing removed - we draw on clean background now

  // Main redraw function
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // Ensure proper canvas context setup for text rendering
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ;(ctx as CanvasRenderingContext2D & { textRenderingOptimization?: string }).textRenderingOptimization =
      'optimizeQuality'
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // Determine phase color
    const phaseColor = !curveData.isCurveConfigured 
      ? '#00ff80' // Green for Phase 1 (Draw - both open and closed)
      : !curveData.isCurveFixed 
      ? '#ffff00' // Yellow for Phase 2 (Config)
      : '#ff00ff' // Magenta for Phase 3 (Run)
    
    // Draw coordinate system first
    drawCoordinateSystem(ctx, canvas.width, canvas.height, phaseColor)

    const c = activeMachine?.colors
    const a = activeMachine?.alphas
    const colorOriginal = c?.drawn ?? settings.colorOriginalPoints
    const colorUniform = c?.uniformPoints ?? settings.colorUniformPoints
    const colorCom = c?.centerOfMass ?? settings.colorCenterOfMass
    const colorCircles = c?.circles ?? settings.colorFourierCircles
    const colorConn = c?.amplitudes ?? settings.colorFourierConnections
    const colorTrail = c?.trail ?? settings.colorFourierTrail
    const colorPath = c?.path ?? settings.colorFourierPath
    const alphaCircles = Math.min(1, settings.fourierAlpha * (a?.circles ?? 1))
    const effTrailAlpha = a?.trail ?? 1
    const effPathAlpha = a?.path ?? 1
    const centerPt = curveData.centerOfMass ?? { x: 0, y: 0 }

    if (settings.showGrid) {
      if (!gridRef.current) {
        gridRef.current = new GridOverlay(canvas.width, canvas.height, settings.gridCellSize)
      } else {
        gridRef.current.setCellSize(settings.gridCellSize, canvas.width, canvas.height)
      }
      gridRef.current.setShowGrid(true)
      gridRef.current.setRainbowMode(settings.gridRainbowMode)
      gridRef.current.setParticleSystem(settings.gridParticleSystem)
      gridRef.current.update(16)
      gridRef.current.render(ctx)
    }
    
    // Draw background image if available
    if (curveData.backgroundImage) {
      console.log('🖼️ Drawing background image in redrawCanvas')
      drawBackgroundImage(ctx, curveData.backgroundImage, canvas.width, canvas.height)
    } else {
      console.log('❌ No background image available')
    }
    
    // Draw mode indicator
    drawModeIndicator(ctx, canvas.width, canvas.height, phaseColor, curveData.isCurveClosed, curveData.isCurveConfigured, curveData.isCurveFixed)
    
    // Draw curve if we have points
    if (curveData.completeCurve.length > 0) {
      drawCurve(ctx, curveData.completeCurve, canvas.width, canvas.height, phaseColor)
    }
    
    // Draw original points
    if (settings.showPoints && curveData.drawnPoints.length > 0) {
      ctx.globalAlpha = a?.drawn ?? 1
      drawOriginalPoints(ctx, curveData.drawnPoints, canvas.width, canvas.height, colorOriginal)
      ctx.globalAlpha = 1
    }
    
    // Draw uniform points
    if (settings.showUniformPoints && curveData.uniformPoints.length > 0) {
      ctx.globalAlpha = a?.uniformPoints ?? 1
      drawUniformPoints(ctx, curveData.uniformPoints, canvas.width, canvas.height, colorUniform)
      ctx.globalAlpha = 1
    }
    
    // Draw center of mass
    if (settings.showCenterOfMass && curveData.centerOfMass) {
      ctx.globalAlpha = a?.centerOfMass ?? 1
      drawCenterOfMass(ctx, curveData.centerOfMass, canvas.width, canvas.height, colorCom)
      ctx.globalAlpha = 1
    }
    
    // Draw static Fourier circles in Config phase (no animation)
    if (curveData.isCurveConfigured && !curveData.isCurveFixed && curveData.fourierComponents.length > 0) {
      if (settings.showFourierCircles) {
        drawFourierCircles(ctx, curveData.fourierComponents, canvas.width, canvas.height, colorCircles, alphaCircles, centerPt, 0)
      }
    }
    
    // Draw Fourier visualization if we have animation data
    if (curveData.fourierAnimation && curveData.fourierAnimation.length > 0) {
      const currentStep = curveData.currentAnimationStep || 0
      const animationData = curveData.fourierAnimation[currentStep]
      
      if (animationData && animationData.length > 0) {
        // Draw Fourier circles
        if (settings.showFourierCircles) {
          drawFourierCirclesFromFrame(ctx, animationData, canvas.width, canvas.height, colorCircles, alphaCircles)
        }
        
        // Draw Fourier connections
        if (settings.showFourierConnections) {
          ctx.strokeStyle = colorConn
          ctx.globalAlpha = a?.amplitudes ?? 1
          for (let i = 1; i < animationData.length; i++) {
            const p0 = mathToCanvas(animationData[i - 1].position, canvas.width, canvas.height)
            const p1 = mathToCanvas(animationData[i].position, canvas.width, canvas.height)
            ctx.beginPath()
            ctx.moveTo(p0.x, p0.y)
            ctx.lineTo(p1.x, p1.y)
            ctx.lineWidth = 1
            ctx.stroke()
          }
          ctx.globalAlpha = 1
        }
        
        // Draw Fourier path point
        if (settings.showFourierPath) {
          ctx.globalAlpha = effPathAlpha
          drawFourierPathPoint(ctx, animationData, canvas.width, canvas.height, colorPath)
          ctx.globalAlpha = 1
        }
      }
    }
    
    // Draw Fourier trail
    if (settings.showFourierTrail && trailRef.current.length > 0) {
      ctx.globalAlpha = effTrailAlpha
      drawFourierTrail(ctx, trailRef.current, canvas.width, canvas.height, colorTrail)
      ctx.globalAlpha = 1
    }

    if (activeMachine && curveData.isCurveFixed && curveData.fourierAnimation?.length) {
      const step = curveData.currentAnimationStep || 0
      const frame = curveData.fourierAnimation[step]
      const mc = activeMachine.colors
      if (settings.showFrequencySpectrum) {
        drawFrequencySpectrumOverlay(
          ctx,
          frame,
          settings.spectrumPanelX,
          settings.spectrumPanelY,
          300,
          120,
          mc,
          true
        )
      }
      if (settings.showPhaseDiagram) {
        drawPhaseDiagramOverlay(
          ctx,
          frame,
          settings.phasePanelX,
          settings.phasePanelY,
          150,
          mc,
          true
        )
      }
    }
    
    // Draw current line being drawn (in line mode)
    if (settings.drawMode === 'line' && isDrawingLine) {
      drawCurrentLine(ctx, canvas)
    }
  }, [curveData, settings, activeMachine, trailRef, drawCurrentLine, isDrawingLine])

  // Handle mouse down - start drawing line or handle points mode
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    // If currently dragging, stop dragging on click
    if (dragState.isDraggingCenter || dragState.draggedPointIndex !== null) {
      onStopAllDragging()
      return
    }
    
    // Don't allow adding points if curve is fixed (Phase 3)
    if (curveData.isCurveFixed) {
      return
    }
    
    const rect = canvas.getBoundingClientRect()
    const canvasPoint: Point = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    }
    
    const mathPoint = canvasToMath(canvasPoint, canvas.width, canvas.height)
    
    // Line mode: start drawing a line
    if (settings.drawMode === 'line') {
      setIsDrawingLine(true)
      setLinePoints([mathPoint])
      return
    }
    
    // Points mode: existing logic
    // Check if clicking on center of mass
    if (curveData.centerOfMass) {
      const centerCanvas = mathToCanvas(curveData.centerOfMass, canvas.width, canvas.height)
      const distance = Math.sqrt(
        Math.pow(canvasPoint.x - centerCanvas.x, 2) + 
        Math.pow(canvasPoint.y - centerCanvas.y, 2)
      )
      
      if (distance < 15) {
        onStartDraggingCenter()
        return
      }
    }
    
    // Check if clicking on an existing point
    if (curveData.drawnPoints.length > 0) {
      const closestIndex = findClosestPointOnCurve(mathPoint, curveData.drawnPoints)
      if (closestIndex !== -1) {
        onToggleDraggingPoint(closestIndex)
        return
      }
    }
    
    // Check if clicking on the curve to insert a point (works for both open and closed curves)
    if (!curveData.isCurveFixed && curveData.completeCurve.length > 0) {
      const closestCurveIndex = findClosestPointOnCurve(mathPoint, curveData.completeCurve)
      if (closestCurveIndex !== -1) {
        insertPointOnCurve(mathPoint, closestCurveIndex)
        return
      }
    }
    
    // Otherwise, add a new point (only if curve is not closed OR we're in edit phase)
    if (!curveData.isCurveClosed || (!curveData.isCurveConfigured && !curveData.isCurveFixed)) {
      onAddPoint(mathPoint)
    }
  }, [curveData, dragState, settings, onAddPoint, onStartDraggingCenter, onToggleDraggingPoint, onStopAllDragging, insertPointOnCurve, findClosestPointOnCurve])

  // Handle mouse click - only for ending drag operations
  const handleClick = useCallback((_e: React.MouseEvent<HTMLCanvasElement>) => {
    // If currently dragging, stop dragging on click
    if (dragState.isDraggingCenter || dragState.draggedPointIndex !== null) {
      onStopAllDragging()
      return
    }
  }, [dragState, onStopAllDragging])

  // Handle right click - delete point or close curve
  const handleRightClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    
    const canvas = canvasRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const canvasPoint: Point = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    }
    
    const mathPoint = canvasToMath(canvasPoint, canvas.width, canvas.height)
    
    // First check if clicking on a point to delete it
    if (curveData.drawnPoints.length > 0) {
      const closestIndex = findClosestPointOnCurve(mathPoint, curveData.drawnPoints)
      if (closestIndex !== -1) {
        onDeletePoint(closestIndex)
        return
      }
    }
    
    // If not clicking on a point, close curve if we have at least 2 points
    if (curveData.drawnPoints && curveData.drawnPoints.length >= 2 && !curveData.isCurveClosed) {
      onCloseCurve()
    }
  }, [curveData.drawnPoints, curveData.isCurveClosed, onCloseCurve, onDeletePoint, findClosestPointOnCurve])

  // Handle mouse move for dragging and line drawing
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const canvasPoint: Point = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    }
    
    const mathPoint = canvasToMath(canvasPoint, canvas.width, canvas.height)
    
    // Line mode: add points to the current line only if mouse is pressed
    if (settings.drawMode === 'line' && isDrawingLine && e.buttons === 1) {
      setLinePoints(prev => [...prev, mathPoint])
      return
    }
    
    // Points mode: existing dragging logic
    if (dragState.isDraggingCenter) {
      // Grid snap removed - no grid anymore
      onUpdateCenterOfMass(mathPoint)
    } else if (dragState.draggedPointIndex !== null) {
      // Grid snap removed - no grid anymore
      onUpdatePoint(dragState.draggedPointIndex, mathPoint)
    }
  }, [dragState, settings, onUpdateCenterOfMass, onUpdatePoint, isDrawingLine])

  // Handle mouse up - finish line drawing or stop dragging
  const handleMouseUp = useCallback(() => {
    // Line mode: finish drawing the line when mouse is released
    if (settings.drawMode === 'line' && isDrawingLine) {
      if (linePoints.length > 1) {
        onAddLinePoints(linePoints)
      }
      setIsDrawingLine(false)
      setLinePoints([])
      return
    }
    
    // Points mode: don't automatically stop dragging here - let the click handler decide
    // This allows for click-to-drop functionality
  }, [settings.drawMode, isDrawingLine, linePoints, onAddLinePoints])

  // Handle keyboard events
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (dragState.draggedPointIndex !== null) {
        onDeletePoint(dragState.draggedPointIndex)
        onStopAllDragging()
      }
    } else if (e.key === 'Escape') {
      onStopAllDragging()
    } else if (e.key === ' ') { // Spacebar
      e.preventDefault()
      if (curveData.isCurveClosed && !curveData.isCurveConfigured) {
        // Phase 1 -> Phase 2 (Config)
        onConfigureCurve()
      } else if (curveData.isCurveConfigured && !curveData.isCurveFixed) {
        // Phase 2 -> Phase 3 (Run)
        onStartCurve()
      }
    }
  }, [dragState, curveData.isCurveClosed, curveData.isCurveConfigured, curveData.isCurveFixed, onDeletePoint, onStopAllDragging, onConfigureCurve, onStartCurve])

  // Animation loop
  useEffect(() => {
    if (!curveData.isCurveFixed || !curveData.fourierAnimation || curveData.fourierAnimation.length === 0) {
      return
    }
    
    const animate = () => {
      const currentStep = curveData.currentAnimationStep || 0
      const nextStep = (currentStep + 1) % curveData.fourierAnimation.length
      
      onUpdateAnimationStepRef.current(nextStep)
      
      // Update trail
      if (curveData.fourierAnimation[nextStep] && curveData.fourierAnimation[nextStep].length > 0) {
        const lastFrame = curveData.fourierAnimation[nextStep]
        const lastPoint = lastFrame[lastFrame.length - 1]
        if (lastPoint) {
          trailRef.current.push({ x: lastPoint.position.x, y: lastPoint.position.y })
          
          // Limit trail length
          if (trailRef.current.length > 1000) {
            trailRef.current = trailRef.current.slice(-500)
          }
        }
      }
      
      redrawCanvas()
    }
    
    const interval = setInterval(animate, 1000 / 60) // 60 FPS
    return () => clearInterval(interval)
  }, [curveData.isCurveFixed, curveData.fourierAnimation, curveData.currentAnimationStep, redrawCanvas])

  // Redraw when data changes
  useEffect(() => {
    redrawCanvas()
  }, [redrawCanvas])

  // Initial canvas setup
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    // Ensure canvas is properly sized
    const container = canvas.parentElement
    if (!container) return
    
    const rect = container.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`
    
    // Ensure proper canvas context setup
    const ctx = canvas.getContext('2d')
    if (ctx) {
      // Reset any transformations
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      // Ensure proper text rendering
      ;(ctx as CanvasRenderingContext2D & { textRenderingOptimization?: string }).textRenderingOptimization =
      'optimizeQuality'
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
    }
    
    // Focus canvas for keyboard events
    canvas.focus()
    
    // Initial draw to show empty canvas with proper delay
    setTimeout(() => {
      redrawCanvas()
    }, 100) // Increased delay to ensure proper initialization
  }, [redrawCanvas])

  // Handle canvas resize with proper scaling - simplified
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const resizeCanvas = () => {
      const container = canvas.parentElement
      if (!container) return
      
      const rect = container.getBoundingClientRect()
      const containerWidth = rect.width
      const containerHeight = rect.height
      
      // Only resize if dimensions actually changed
      if (canvas.width !== containerWidth || canvas.height !== containerHeight) {
        canvas.width = containerWidth
        canvas.height = containerHeight
        canvas.style.width = `${containerWidth}px`
        canvas.style.height = `${containerHeight}px`
        
        // Only redraw if we're not in animation mode
        if (!curveData.isCurveFixed) {
          redrawCanvas()
        }
      }
    }
    
    // Initial resize
    resizeCanvas()
    
    // Resize observer for container changes
    const resizeObserver = new ResizeObserver(resizeCanvas)
    resizeObserver.observe(canvas.parentElement!)
    
    return () => {
      resizeObserver.disconnect()
    }
  }, [redrawCanvas, curveData.isCurveFixed])

  return (
    <canvas
      ref={setCanvasRef}
      className="drawing-canvas"
      style={{
        width: '100%',
        height: '100%',
        cursor: dragState.isDraggingCenter || dragState.draggedPointIndex !== null ? 'grabbing' : 'crosshair',
        background: 'transparent',
        display: 'block'
      }}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      onContextMenu={handleRightClick}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onKeyDown={handleKeyDown}
      onLoad={() => {
        // Ensure canvas is drawn when loaded
        setTimeout(() => {
          redrawCanvas()
        }, 10)
      }}
      tabIndex={0}
    />
  )
})