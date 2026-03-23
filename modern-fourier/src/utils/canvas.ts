import { Point, FourierComponent, AnimationFrame } from '../types'
import { generateFourierPath, generateEpicycles } from './fourier'

/**
 * Convert mathematical coordinates to canvas coordinates
 */
export const mathToCanvas = (
  mathPoint: Point, 
  canvasWidth: number, 
  canvasHeight: number
): Point => {
  const centerX = canvasWidth / 2
  const centerY = canvasHeight / 2
  
  return {
    x: centerX + mathPoint.x,
    y: centerY - mathPoint.y
  }
}

/**
 * Convert canvas coordinates to mathematical coordinates
 */
export const canvasToMath = (
  canvasPoint: Point, 
  canvasWidth: number, 
  canvasHeight: number
): Point => {
  const centerX = canvasWidth / 2
  const centerY = canvasHeight / 2
  
  return {
    x: canvasPoint.x - centerX,
    y: centerY - canvasPoint.y
  }
}

/**
 * Snap a mathematical point to the nearest grid intersection
 */
export const snapToGrid = (mathPoint: Point, gridSize: number = 40): Point => {
  return {
    x: Math.round(mathPoint.x / gridSize) * gridSize,
    y: Math.round(mathPoint.y / gridSize) * gridSize
  }
}

/**
 * Draw coordinate system with axes and grid - REMOVED
 * Now we draw on a clean background without grid
 */
export const drawCoordinateSystem = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  _phaseColor: string = '#00ffff'
): void => {
  // Draw a subtle background to make the canvas visible
  ctx.fillStyle = 'rgba(0, 0, 0, 0.05)' // Very subtle dark background
  ctx.fillRect(0, 0, width, height)
}

/**
 * Draw background image
 */
export const drawBackgroundImage = (
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  width: number,
  height: number
): void => {
  console.log('🎨 Drawing background image:', img.width, 'x', img.height, 'on canvas:', width, 'x', height)
  
  // Calculate scaling to fit image in canvas while maintaining aspect ratio
  const imgAspect = img.width / img.height
  const canvasAspect = width / height
  
  console.log('📐 Image aspect:', imgAspect, 'Canvas aspect:', canvasAspect)
  
  let drawWidth, drawHeight, offsetX, offsetY
  
  if (imgAspect > canvasAspect) {
    // Image is wider than canvas
    drawWidth = width * 0.9 // 90% of canvas width
    drawHeight = drawWidth / imgAspect
    offsetX = (width - drawWidth) / 2
    offsetY = (height - drawHeight) / 2
    console.log('📏 Image wider - draw size:', drawWidth, 'x', drawHeight, 'offset:', offsetX, offsetY)
  } else {
    // Image is taller than canvas
    drawHeight = height * 0.9 // 90% of canvas height
    drawWidth = drawHeight * imgAspect
    offsetX = (width - drawWidth) / 2
    offsetY = (height - drawHeight) / 2
    console.log('📏 Image taller - draw size:', drawWidth, 'x', drawHeight, 'offset:', offsetX, offsetY)
  }
  
  // Draw image with transparency
  ctx.globalAlpha = 0.3
  ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight)
  ctx.globalAlpha = 1.0
  
  console.log('✅ Background image drawn')
}

/**
 * Draw mode indicator
 */
export const drawModeIndicator = (
  ctx: CanvasRenderingContext2D,
  _width: number,
  _height: number,
  phaseColor: string,
  _isCurveClosed: boolean,
  isCurveConfigured: boolean,
  isCurveFixed: boolean
): void => {
  const phase = !isCurveConfigured ? 'DRAW' : !isCurveFixed ? 'CONFIG' : 'RUN'
  
  // Ensure proper text rendering
  ctx.save()
  ctx.fillStyle = phaseColor
  ctx.font = 'bold 16px Orbitron, monospace'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  
  // Clear any potential text distortion
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  
  // Add text shadow for better visibility
  ctx.shadowColor = phaseColor
  ctx.shadowBlur = 8
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY = 0
  
  ctx.fillText(`PHASE: ${phase}`, 20, 20)
  
  ctx.restore()
}

/**
 * Draw curve points
 */
export const drawCurve = (
  ctx: CanvasRenderingContext2D,
  points: Point[],
  width: number,
  height: number,
  color: string = '#00ffff'
): void => {
  if (points.length < 2) return
  
  ctx.beginPath()
  const firstPoint = mathToCanvas(points[0], width, height)
  ctx.moveTo(firstPoint.x, firstPoint.y)
  
  for (let i = 1; i < points.length; i++) {
    const point = mathToCanvas(points[i], width, height)
    ctx.lineTo(point.x, point.y)
  }
  
  ctx.strokeStyle = color
  ctx.lineWidth = 2
  ctx.stroke()
}

/**
 * Draw original points
 */
export const drawOriginalPoints = (
  ctx: CanvasRenderingContext2D,
  points: Point[],
  width: number,
  height: number,
  color: string = '#ff6b6b'
): void => {
  points.forEach((point) => {
    const canvasPoint = mathToCanvas(point, width, height)
    
    ctx.beginPath()
    ctx.arc(canvasPoint.x, canvasPoint.y, 6, 0, 2 * Math.PI)
    ctx.fillStyle = color
    ctx.fill()
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 2
    ctx.stroke()
  })
}

/**
 * Draw uniform points
 */
export const drawUniformPoints = (
  ctx: CanvasRenderingContext2D,
  points: Point[],
  width: number,
  height: number,
  color: string = '#4ecdc4'
): void => {
  points.forEach((point) => {
    const canvasPoint = mathToCanvas(point, width, height)
    
    ctx.beginPath()
    ctx.arc(canvasPoint.x, canvasPoint.y, 3, 0, 2 * Math.PI)
    ctx.fillStyle = color
    ctx.fill()
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 1
    ctx.stroke()
  })
}

/**
 * Draw center of mass
 */
export const drawCenterOfMass = (
  ctx: CanvasRenderingContext2D,
  center: Point,
  width: number,
  height: number,
  color: string = '#ffd93d'
): void => {
  const canvasPoint = mathToCanvas(center, width, height)
  
  ctx.beginPath()
  ctx.arc(canvasPoint.x, canvasPoint.y, 8, 0, 2 * Math.PI)
  ctx.fillStyle = color
  ctx.fill()
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 2
  ctx.stroke()
}

/**
 * Draw Fourier circles
 */
export const drawFourierCircles = (
  ctx: CanvasRenderingContext2D,
  components: FourierComponent[],
  width: number,
  height: number,
  color: string = '#6c5ce7',
  alpha: number = 0.8,
  centerPoint: Point = { x: 0, y: 0 },
  time: number = 0
): void => {
  const epicycles = generateEpicycles(components, centerPoint, time)
  
  epicycles.forEach((epicycle) => {
    const center = mathToCanvas(epicycle.center, width, height)
    
    ctx.beginPath()
    ctx.arc(center.x, center.y, epicycle.radius, 0, 2 * Math.PI)
    ctx.strokeStyle = color
    ctx.globalAlpha = alpha
    ctx.lineWidth = 1
    ctx.stroke()
    ctx.globalAlpha = 1.0
  })
}

/**
 * Draw Fourier circles from animation frame
 */
export const drawFourierCirclesFromFrame = (
  ctx: CanvasRenderingContext2D,
  animationData: AnimationFrame[],
  width: number,
  height: number,
  color: string = '#6c5ce7',
  alpha: number = 0.8
): void => {
  animationData.forEach((frame) => {
    const center = mathToCanvas(frame.position, width, height)
    
    ctx.beginPath()
    ctx.arc(center.x, center.y, frame.amplitude, 0, 2 * Math.PI)
    ctx.strokeStyle = color
    ctx.globalAlpha = alpha
    ctx.lineWidth = 1
    ctx.stroke()
    ctx.globalAlpha = 1.0
  })
}

/**
 * Draw Fourier path (sampled over one period)
 */
export const drawFourierPath = (
  ctx: CanvasRenderingContext2D,
  components: FourierComponent[],
  width: number,
  height: number,
  color: string = '#e17055',
  centerPoint: Point = { x: 0, y: 0 },
  samples: number = 128,
  maxComponents: number = 50
): void => {
  if (components.length < 1) return
  ctx.beginPath()
  for (let i = 0; i <= samples; i++) {
    const t = (i / samples) * 2 * Math.PI
    const p = generateFourierPath(components, centerPoint, t, maxComponents)
    const canvasPoint = mathToCanvas(p, width, height)
    if (i === 0) ctx.moveTo(canvasPoint.x, canvasPoint.y)
    else ctx.lineTo(canvasPoint.x, canvasPoint.y)
  }
  ctx.strokeStyle = color
  ctx.lineWidth = 2
  ctx.stroke()
}

/**
 * Draw Fourier path point
 */
export const drawFourierPathPoint = (
  ctx: CanvasRenderingContext2D,
  animationData: AnimationFrame[],
  width: number,
  height: number,
  color: string = '#e17055'
): void => {
  if (animationData.length === 0) return
  
  const lastFrame = animationData[animationData.length - 1]
  const point = mathToCanvas(lastFrame.position, width, height)
  
  ctx.beginPath()
  ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI)
  ctx.fillStyle = color
  ctx.fill()
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 2
  ctx.stroke()
}

/**
 * Draw Fourier trail
 */
export const drawFourierTrail = (
  ctx: CanvasRenderingContext2D,
  trail: Point[],
  width: number,
  height: number,
  color: string = '#00b894'
): void => {
  if (trail.length < 2) return
  
  ctx.beginPath()
  const firstPoint = mathToCanvas(trail[0], width, height)
  ctx.moveTo(firstPoint.x, firstPoint.y)
  
  for (let i = 1; i < trail.length; i++) {
    const point = mathToCanvas(trail[i], width, height)
    ctx.lineTo(point.x, point.y)
  }
  
  ctx.strokeStyle = color
  ctx.lineWidth = 2
  ctx.stroke()
}
