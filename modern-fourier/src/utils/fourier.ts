import { Point, FourierComponent } from '../types'

/**
 * Compute Discrete Fourier Transform (DFT) for complex-valued signal
 * Points are calculated relative to the center
 */
export const computeFourierDFT = (points: Point[], cp: Point): FourierComponent[] => {
  const N = points.length
  if (N === 0) return []

  const components: FourierComponent[] = []
  
  // Frequency range symmetrical around 0
  const half = Math.floor(N / 2)
  for (let k = -half; k < half; k++) {
    let real = 0
    let imag = 0
    
    for (let n = 0; n < N; n++) {
      const theta = (-2 * Math.PI * k * n) / N
      const cosTheta = Math.cos(theta)
      const sinTheta = Math.sin(theta)
      
      // Calculate points relative to center of mass
      const x = points[n].x - cp.x
      const y = points[n].y - cp.y
      
      // (x + i y) * (cos - i sin)
      real += x * cosTheta + y * sinTheta
      imag += y * cosTheta - x * sinTheta
    }
    
    real /= N
    imag /= N
    const amplitude = Math.hypot(real, imag)
    const phase = Math.atan2(imag, real)
    
    components.push({ freq: k, amplitude, phase })
  }

  // Sort by amplitude descending
  components.sort((a, b) => b.amplitude - a.amplitude)
  return components
}

/**
 * Generate Fourier path from components at given time
 */
export const generateFourierPath = (
  components: FourierComponent[],
  cp: Point,
  time: number,
  maxComponents: number = 50
): Point => {
  let x = 0
  let y = 0

  // Use only the most significant components
  const significantComponents = components.slice(0, maxComponents)
  
  for (const component of significantComponents) {
    const angle = component.freq * time + component.phase
    x += component.amplitude * Math.cos(angle)
    y += component.amplitude * Math.sin(angle)
  }

  // Add offset at the end
  return { x: x + cp.x, y: y + cp.y }
}

/**
 * Generate epicycles with connections for visualization
 * Returns both circles and connections in a unified format
 */
export const generateEpicycles = (
  components: FourierComponent[],
  cp: Point,
  time: number,
  maxComponents: number = 50
): Array<{ 
  start: Point; 
  end: Point; 
  radius: number; 
  angle: number; 
  frequency: number;
  center: Point;
}> => {
  const epicycles: Array<{ 
    start: Point; 
    end: Point; 
    radius: number; 
    angle: number; 
    frequency: number;
    center: Point;
  }> = []
  
  let currentCenter = { x: 0, y: 0 } 
  
  const significantComponents = components.slice(0, maxComponents)
  
  for (const component of significantComponents) {
    const angle = component.freq * time + component.phase
    const radius = component.amplitude
    
    // Calculate the end point of this circle's radius
    const endPoint = {
      x: currentCenter.x + radius * Math.cos(angle),
      y: currentCenter.y + radius * Math.sin(angle)
    }
    
    // Add center offset for absolute positioning
    const absoluteCenter = {
      x: currentCenter.x + cp.x,
      y: currentCenter.y + cp.y
    }
    
    const absoluteEnd = {
      x: endPoint.x + cp.x,
      y: endPoint.y + cp.y
    }
    
    epicycles.push({
      start: absoluteCenter,
      end: absoluteEnd,
      radius,
      angle,
      frequency: component.freq,
      center: absoluteCenter
    })

    // Update center for next epicycle
    currentCenter = endPoint
  }

  return epicycles
}