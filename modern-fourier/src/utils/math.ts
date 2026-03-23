import { Point } from '../types'

/**
 * Calculate a point on a cubic Bezier curve
 */
export const cubicBezierPoint = (
  p0: Point,
  c1: Point,
  c2: Point,
  p1: Point,
  t: number
): Point => {
  const mt = 1 - t
  const mt2 = mt * mt
  const mt3 = mt2 * mt
  const t2 = t * t
  const t3 = t2 * t

  return {
    x: mt3 * p0.x + 3 * mt2 * t * c1.x + 3 * mt * t2 * c2.x + t3 * p1.x,
    y: mt3 * p0.y + 3 * mt2 * t * c1.y + 3 * mt * t2 * c2.y + t3 * p1.y
  }
}

/**
 * Generate points along a Bezier segment
 */
export const generateBezierSegment = (
  p1: Point,
  c1: Point,
  c2: Point,
  p2: Point,
  segments: number = 20
): Point[] => {
  const points: Point[] = []
  for (let i = 0; i <= segments; i++) {
    const t = i / segments
    points.push(cubicBezierPoint(p1, c1, c2, p2, t))
  }
  return points
}

/**
 * Calculate control points for smooth Bezier curves
 */
export const calculateControlPoints = (
  points: Point[],
  index: number,
  isClosed: boolean = false
): { c1: Point; c2: Point } => {
  const p1 = points[index]
  
  // For closed curves, p2 is the next point (wrapping around)
  let p2: Point
  if (isClosed && index === points.length - 1) {
    p2 = points[0] // Wrap to first point
  } else {
    p2 = points[index + 1]
  }

  if (!p1 || !p2) {
    return { c1: p1, c2: p2 }
  }

  let pPrev: Point
  let pNext: Point

  if (isClosed) {
    if (index === 0) {
      pPrev = points[points.length - 1] // Last point
    } else {
      pPrev = points[index - 1]
    }

    if (index === points.length - 1) {
      pNext = points[1] // Second point
    } else {
      pNext = points[index + 2] || points[0] // Wrap around if needed
    }
  } else {
    pPrev = points[index - 1] || p1
    pNext = points[index + 2] || p2
  }

  // Calculate control points for smooth curves with conservative tension to avoid overshoots
  const tension = 0.1 // Very conservative to prevent overshoots
  
  // Calculate distance between points to scale tension appropriately
  const dist1 = Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2)
  const dist2 = Math.sqrt((pNext.x - p1.x) ** 2 + (pNext.y - p1.y) ** 2)
  
  // Use smaller tension for shorter distances to prevent overshoots
  const adaptiveTension = Math.min(tension, dist1 * 0.05, dist2 * 0.05)
  
  const c1 = {
    x: p1.x + (p2.x - pPrev.x) * adaptiveTension,
    y: p1.y + (p2.y - pPrev.y) * adaptiveTension
  }
  const c2 = {
    x: p2.x - (pNext.x - p1.x) * adaptiveTension,
    y: p2.y - (pNext.y - p1.y) * adaptiveTension
  }

  return { c1, c2 }
}

/**
 * Generate a complete cubic Bezier curve through all points
 */
export const generateCubicBezierCurve = (points: Point[], isClosed: boolean = false): Point[] => {
  if (points.length < 2) return points

  const curve: Point[] = []

  for (let i = 0; i < points.length - 1; i++) {
    const { c1, c2 } = calculateControlPoints(points, i, isClosed)
    const segment = generateBezierSegment(points[i], c1, c2, points[i + 1])
    curve.push(...segment)
  }

  // If closed, add the closing segment from last to first point
  if (isClosed && points.length > 2) {
    const { c1, c2 } = calculateControlPoints(points, points.length - 1, isClosed)
    const segment = generateBezierSegment(points[points.length - 1], c1, c2, points[0])
    curve.push(...segment)
  }

  return curve
}

/**
 * Generate uniformly distributed points along a curve using arc-length parameterization
 */
export const generateUniformPointsOnCurve = (
  curve: Point[],
  numPoints: number
): Point[] => {
  if (curve.length < 2 || numPoints <= 0) return []

  // Calculate cumulative arc lengths
  const arcLengths: number[] = [0]
  let totalLength = 0

  for (let i = 1; i < curve.length; i++) {
    const dx = curve[i].x - curve[i - 1].x
    const dy = curve[i].y - curve[i - 1].y
    const segmentLength = Math.sqrt(dx * dx + dy * dy)
    totalLength += segmentLength
    arcLengths.push(totalLength)
  }

  if (totalLength === 0) return []

  const uniformPoints: Point[] = []
  const step = totalLength / numPoints

  for (let i = 0; i < numPoints; i++) {
    const targetLength = i * step

    // Find the segment containing the target length
    let segmentIndex = 0
    while (segmentIndex < arcLengths.length - 1 && arcLengths[segmentIndex + 1] < targetLength) {
      segmentIndex++
    }

    if (segmentIndex >= curve.length - 1) {
      uniformPoints.push(curve[curve.length - 1])
      continue
    }

    // Interpolate between the two points
    const segmentStart = arcLengths[segmentIndex]
    const segmentEnd = arcLengths[segmentIndex + 1]
    const segmentLength = segmentEnd - segmentStart

    if (segmentLength === 0) {
      uniformPoints.push(curve[segmentIndex])
    } else {
      const t = (targetLength - segmentStart) / segmentLength
      const p1 = curve[segmentIndex]
      const p2 = curve[segmentIndex + 1]
      
      uniformPoints.push({
        x: p1.x + t * (p2.x - p1.x),
        y: p1.y + t * (p2.y - p1.y)
      })
    }
  }

  return uniformPoints
}

/**
 * Calculate center of mass (arithmetic mean) of points
 */
export const calculateCenterOfMass = (points: Point[]): Point => {
  if (points.length === 0) return { x: 0, y: 0 }

  const sum = points.reduce(
    (acc, point) => ({
      x: acc.x + point.x,
      y: acc.y + point.y
    }),
    { x: 0, y: 0 }
  )

  return {
    x: sum.x / points.length,
    y: sum.y / points.length
  }
}

/**
 * Reduce the number of points in a line while preserving the overall shape
 * Uses Douglas-Peucker algorithm adapted for our use case
 */
export const reduceLinePoints = (points: Point[], tolerance: number = 5): Point[] => {
  if (points.length <= 2) return points

  // First, remove points that are too close to each other
  const filteredPoints: Point[] = [points[0]]
  
  for (let i = 1; i < points.length; i++) {
    const prevPoint = filteredPoints[filteredPoints.length - 1]
    const currentPoint = points[i]
    
    const distance = Math.sqrt(
      (currentPoint.x - prevPoint.x) ** 2 + (currentPoint.y - prevPoint.y) ** 2
    )
    
    // Only keep points that are far enough from the previous point
    if (distance > tolerance) {
      filteredPoints.push(currentPoint)
    }
  }
  
  // Ensure we keep the last point if it's different from the first
  const lastPoint = points[points.length - 1]
  const firstPoint = filteredPoints[0]
  const lastDistance = Math.sqrt(
    (lastPoint.x - firstPoint.x) ** 2 + (lastPoint.y - firstPoint.y) ** 2
  )
  
  if (lastDistance > tolerance && filteredPoints[filteredPoints.length - 1] !== lastPoint) {
    filteredPoints.push(lastPoint)
  }
  
  return filteredPoints
}

/**
 * Iteratively reduce points until the curve looks optimal
 * Uses multiple passes with increasing tolerance to find the best balance
 */
export const iterativelyReduceLinePoints = (points: Point[]): Point[] => {
  if (points.length <= 3) return points

  let currentPoints = [...points]
  let bestPoints = currentPoints
  let bestScore = calculateCurveQuality(currentPoints)
  
  // Try different tolerance levels
  const tolerances = [3, 5, 8, 12, 15, 20, 25, 30]
  
  for (const tolerance of tolerances) {
    const reducedPoints = reduceLinePoints(currentPoints, tolerance)
    
    // Only proceed if we actually reduced points
    if (reducedPoints.length < currentPoints.length && reducedPoints.length >= 3) {
      const score = calculateCurveQuality(reducedPoints)
      
      // If this reduction improves quality or maintains it with fewer points, use it
      if (score >= bestScore * 0.95) { // Allow 5% quality loss for significant point reduction
        bestPoints = reducedPoints
        bestScore = score
        currentPoints = reducedPoints
      }
    }
  }
  
  return bestPoints
}

/**
 * Calculate a quality score for a curve based on smoothness and point distribution
 */
const calculateCurveQuality = (points: Point[]): number => {
  if (points.length < 3) return 0
  
  let totalAngleChange = 0
  let minDistance = Infinity
  let maxDistance = 0
  
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]
    const curr = points[i]
    const next = points[i + 1] || points[0] // Wrap around for closed curves
    
    // Calculate distance
    const dist = Math.sqrt((curr.x - prev.x) ** 2 + (curr.y - prev.y) ** 2)
    minDistance = Math.min(minDistance, dist)
    maxDistance = Math.max(maxDistance, dist)
    
    // Calculate angle change (smoothness)
    if (next) {
      const angle1 = Math.atan2(curr.y - prev.y, curr.x - prev.x)
      const angle2 = Math.atan2(next.y - curr.y, next.x - curr.x)
      let angleDiff = Math.abs(angle2 - angle1)
      
      // Normalize angle difference
      if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff
      
      totalAngleChange += angleDiff
    }
  }
  
  const avgAngleChange = totalAngleChange / (points.length - 1)
  const distanceVariation = maxDistance / minDistance
  
  // Higher score for:
  // - More points (up to a reasonable limit)
  // - Smaller angle changes (smoother curves)
  // - More uniform distances
  const pointScore = Math.min(points.length / 20, 1) // Cap at 20 points
  const smoothnessScore = Math.max(0, 1 - avgAngleChange / Math.PI) // Lower angle change = better
  const uniformityScore = Math.max(0, 1 - (distanceVariation - 1) / 5) // More uniform = better
  
  return pointScore * 0.3 + smoothnessScore * 0.4 + uniformityScore * 0.3
}

/**
 * Calculate curve analysis metrics
 */
export const calculateCurveAnalysis = (points: Point[], uniformPoints?: Point[]): {
  pointCount: number
  drawnLength: number
  closingLength: number
  closedCurveLength: number
} => {
  if (points.length < 2) {
    return { pointCount: 0, drawnLength: 0, closingLength: 0, closedCurveLength: 0 }
  }

  // Calculate total drawn length
  let drawnLength = 0
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]
    const curr = points[i]
    const distance = Math.sqrt((curr.x - prev.x) ** 2 + (curr.y - prev.y) ** 2)
    drawnLength += distance
  }

  // Calculate closing length (distance from last to first point)
  const firstPoint = points[0]
  const lastPoint = points[points.length - 1]
  const closingLength = Math.sqrt(
    (lastPoint.x - firstPoint.x) ** 2 + (lastPoint.y - firstPoint.y) ** 2
  )

  // Calculate closed curve length using uniform points if available
  let closedCurveLength = 0
  if (uniformPoints && uniformPoints.length > 1) {
    for (let i = 1; i < uniformPoints.length; i++) {
      const prev = uniformPoints[i - 1]
      const curr = uniformPoints[i]
      const distance = Math.sqrt((curr.x - prev.x) ** 2 + (curr.y - prev.y) ** 2)
      closedCurveLength += distance
    }
    // Add distance from last uniform point back to first (for closed curve)
    const lastUniform = uniformPoints[uniformPoints.length - 1]
    const firstUniform = uniformPoints[0]
    const finalDistance = Math.sqrt(
      (firstUniform.x - lastUniform.x) ** 2 + (firstUniform.y - lastUniform.y) ** 2
    )
    closedCurveLength += finalDistance
  } else {
    // Fallback: use drawn length + closing length
    closedCurveLength = drawnLength + closingLength
  }

  return {
    pointCount: points.length,
    drawnLength: Math.round(drawnLength * 100) / 100, // Round to 2 decimal places
    closingLength: Math.round(closingLength * 100) / 100,
    closedCurveLength: Math.round(closedCurveLength * 100) / 100
  }
}
