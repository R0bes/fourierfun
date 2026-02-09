import React, { useRef, useState, useCallback, useEffect } from 'react'

interface DrawingCanvasProps {
  onPathChange: (points: { x: number; y: number }[]) => void
  isDrawing: boolean
  onDrawingChange: (drawing: boolean) => void
}

type DrawingMode = 'draw' | 'points'

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
  onPathChange,
  isDrawing,
  onDrawingChange
}) => {
  const [points, setPoints] = useState<{ x: number; y: number }[]>([])
  const [isMouseDown, setIsMouseDown] = useState(false)
  const [mode, setMode] = useState<DrawingMode>('draw')
  const [isCurveClosed, setIsCurveClosed] = useState(false)
  const [isCurveFixed, setIsCurveFixed] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const lastRightClickRef = useRef<number>(0)

  // Draw the current path on canvas
  const drawPath = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // Draw grid
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.2)'
    ctx.lineWidth = 1
    for (let i = 0; i < canvas.width; i += 20) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i, canvas.height)
      ctx.stroke()
    }
    for (let i = 0; i < canvas.height; i += 20) {
      ctx.beginPath()
      ctx.moveTo(0, i)
      ctx.lineTo(canvas.width, i)
      ctx.stroke()
    }
    
    // Draw center lines
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(canvas.width / 2, 0)
    ctx.lineTo(canvas.width / 2, canvas.height)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(0, canvas.height / 2)
    ctx.lineTo(canvas.width, canvas.height / 2)
    ctx.stroke()
    
    if (points.length === 0) return
    
    // Draw path
    ctx.strokeStyle = '#00ffff'
    ctx.lineWidth = 3
    ctx.beginPath()
    
    points.forEach((point, index) => {
      const x = point.x * 10 + canvas.width / 2
      const y = -point.y * 10 + canvas.height / 2
      
      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.stroke()
    
    // Draw points
    ctx.fillStyle = '#ff00ff'
    points.forEach(point => {
      const x = point.x * 10 + canvas.width / 2
      const y = -point.y * 10 + canvas.height / 2
      ctx.beginPath()
      ctx.arc(x, y, 4, 0, 2 * Math.PI)
      ctx.fill()
    })
  }, [points])

  // Bézier curve interpolation
  const interpolateWithBezier = useCallback((controlPoints: { x: number; y: number }[]) => {
    if (controlPoints.length < 2) return controlPoints
    
    const interpolatedPoints: { x: number; y: number }[] = []
    const steps = 30 // Number of interpolation steps per segment
    
    for (let i = 0; i < controlPoints.length - 1; i++) {
      const p0 = controlPoints[i]
      const p1 = controlPoints[i + 1]
      
      // Calculate control points for smooth curves
      let cp1x, cp1y, cp2x, cp2y
      
      if (i === 0) {
        // First segment: use next point to calculate control point
        const p2 = controlPoints[i + 2] || p1
        cp1x = p0.x + (p1.x - p0.x) * 0.3
        cp1y = p0.y + (p1.y - p0.y) * 0.3
        cp2x = p1.x - (p2.x - p0.x) * 0.1
        cp2y = p1.y - (p2.y - p0.y) * 0.1
      } else if (i === controlPoints.length - 2) {
        // Last segment: use previous point to calculate control point
        const pPrev = controlPoints[i - 1]
        cp1x = p0.x + (p1.x - pPrev.x) * 0.1
        cp1y = p0.y + (p1.y - pPrev.y) * 0.1
        cp2x = p1.x - (p1.x - p0.x) * 0.3
        cp2y = p1.y - (p1.y - p0.y) * 0.3
      } else {
        // Middle segments: use both neighbors
        const pPrev = controlPoints[i - 1]
        const pNext = controlPoints[i + 2] || p1
        cp1x = p0.x + (p1.x - pPrev.x) * 0.1
        cp1y = p0.y + (p1.y - pPrev.y) * 0.1
        cp2x = p1.x - (pNext.x - p0.x) * 0.1
        cp2y = p1.y - (pNext.y - p0.y) * 0.1
      }
      
      // Generate Bézier curve points
      for (let j = 0; j < steps; j++) {
        const t = j / steps
        const u = 1 - t
        const tt = t * t
        const uu = u * u
        const uuu = uu * u
        const ttt = tt * t
        
        const x = uuu * p0.x + 3 * uu * t * cp1x + 3 * u * tt * cp2x + ttt * p1.x
        const y = uuu * p0.y + 3 * uu * t * cp1y + 3 * u * tt * cp2y + ttt * p1.y
        
        interpolatedPoints.push({ x, y })
      }
    }
    
    // Add the last control point
    interpolatedPoints.push(controlPoints[controlPoints.length - 1])
    
    return interpolatedPoints
  }, [])

  useEffect(() => {
    drawPath()
  }, [drawPath])

  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    if (!isDrawing || isCurveFixed) return
    
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    
    const x = (event.clientX - rect.left - rect.width / 2) / 10
    const y = -(event.clientY - rect.top - rect.height / 2) / 10
    
    if (mode === 'draw') {
      setIsMouseDown(true)
      const newPoints = [{ x, y }]
      setPoints(newPoints)
      onPathChange(newPoints)
    } else if (mode === 'points') {
      const newControlPoints = [...points, { x, y }]
      setPoints(newControlPoints)
      
      // Automatically interpolate with Bézier curves
      if (newControlPoints.length >= 2) {
        const interpolatedPoints = interpolateWithBezier(newControlPoints)
        onPathChange(interpolatedPoints)
      } else {
        onPathChange(newControlPoints)
      }
    }
  }, [isDrawing, isCurveFixed, mode, points, onPathChange, interpolateWithBezier])

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (!isDrawing || isCurveFixed || !isMouseDown || mode !== 'draw') return
    
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    
    const x = (event.clientX - rect.left - rect.width / 2) / 10
    const y = -(event.clientY - rect.top - rect.height / 2) / 10
    
    setPoints(prev => {
      const newPoints = [...prev, { x, y }]
      
      // Automatically interpolate with Bézier curves for smooth drawing
      if (newPoints.length >= 3) {
        const interpolatedPoints = interpolateWithBezier(newPoints)
        onPathChange(interpolatedPoints)
      } else {
        onPathChange(newPoints)
      }
      
      return newPoints
    })
  }, [isDrawing, isCurveFixed, isMouseDown, mode, onPathChange, interpolateWithBezier])

  const handleMouseUp = useCallback(() => {
    setIsMouseDown(false)
  }, [])

  const handleContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault() // Prevent browser context menu
    
    const now = Date.now()
    const delta = now - lastRightClickRef.current
    lastRightClickRef.current = now
    
    if (!isDrawing) return
    
    // Double right-click within 300ms -> fix curve (Phase 3)
    if (delta < 300 && isCurveClosed && points.length >= 2) {
      setIsCurveFixed(true)
      onDrawingChange(false)
      return
    }

    // Single right-click -> close curve (Phase 2)
    if (!isCurveClosed && points.length >= 2) {
      const firstPoint = points[0]
      const closedPoints = [...points, firstPoint]
      const interpolatedPoints = interpolateWithBezier(closedPoints)
      setPoints(interpolatedPoints)
      onPathChange(interpolatedPoints)
      setIsCurveClosed(true)
    }
  }, [isDrawing, isCurveClosed, points, onPathChange, interpolateWithBezier, onDrawingChange])

  const clearPath = useCallback(() => {
    setPoints([])
    setIsCurveClosed(false)
    setIsCurveFixed(false)
    onPathChange([])
  }, [onPathChange])


  return (
    <div className="drawing-canvas-container">
      <div className="drawing-controls">
        <div className="mode-selector">
          <button 
            className={`mode-button ${mode === 'draw' ? 'active' : ''}`}
            onClick={() => setMode('draw')}
          >
            Draw
          </button>
          <button 
            className={`mode-button ${mode === 'points' ? 'active' : ''}`}
            onClick={() => setMode('points')}
          >
            Points
          </button>
        </div>
        
        <div className="action-buttons">
          <button 
            className={`drawing-button ${isDrawing ? 'active' : ''}`}
            onClick={() => onDrawingChange(!isDrawing)}
          >
            {isDrawing ? 'Stop' : 'Start'}
          </button>
          <button 
            className="drawing-button clear"
            onClick={clearPath}
          >
            Clear
          </button>
        </div>
      </div>
      
      <canvas
        ref={canvasRef}
        className="drawing-canvas"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onContextMenu={handleContextMenu}
        width={400}
        height={300}
      />
    </div>
  )
}
