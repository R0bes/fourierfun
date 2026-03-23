import { Point } from '../types'

/**
 * Convert image file to canvas and extract contours
 */
export const processImageToCurve = async (file: File): Promise<Point[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const img = new Image()
      
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          
          if (!ctx) {
            reject(new Error('Could not get canvas context'))
            return
          }
          
          // Set canvas size to image size
          canvas.width = img.width
          canvas.height = img.height
          
          // Draw image to canvas
          ctx.drawImage(img, 0, 0)
          
          // Extract contours based on file type
          if (file.type === 'image/svg+xml') {
            // For SVG, we'll extract paths directly
            extractSVGPaths(file).then(resolve).catch(reject)
          } else {
            // For raster images (PNG, JPG), extract contours
            const contours = extractImageContours(ctx, canvas.width, canvas.height)
            resolve(contours)
          }
        } catch (error) {
          reject(error)
        }
      }
      
      img.onerror = () => reject(new Error('Could not load image'))
      img.src = e.target?.result as string
    }
    
    reader.onerror = () => reject(new Error('Could not read file'))
    reader.readAsDataURL(file)
  })
}

/**
 * Load image and return it for background display
 */
export const loadImageForBackground = async (file: File): Promise<HTMLImageElement> => {
  console.log('📁 Reading file for background:', file.name)
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      console.log('📖 File read successfully, creating image...')
      const img = new Image()
      
      img.onload = () => {
        console.log('🖼️ Image loaded for background:', img.width, 'x', img.height)
        resolve(img)
      }
      
      img.onerror = () => {
        console.error('❌ Could not load image')
        reject(new Error('Could not load image'))
      }
      img.src = e.target?.result as string
    }
    
    reader.onerror = () => {
      console.error('❌ Could not read file')
      reject(new Error('Could not read file'))
    }
    reader.readAsDataURL(file)
  })
}

/**
 * Extract contours from raster image using advanced edge detection
 */
const extractImageContours = (ctx: CanvasRenderingContext2D, width: number, height: number): Point[] => {
  console.log('🔍 Starting advanced contour extraction from image:', width, 'x', height)
  
  // Get image data
  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data
  console.log('📊 Image data loaded:', data.length, 'pixels')
  
  // Convert to grayscale with better algorithm
  const grayscale = convertToGrayscale(data, width, height)
  console.log('🎨 Converted to grayscale')
  
  // Apply Gaussian blur to reduce noise
  const blurred = applyGaussianBlur(grayscale, width, height, 1.0)
  console.log('🌫️ Applied Gaussian blur')
  
  // Apply adaptive threshold
  const thresholded = applyAdaptiveThreshold(blurred, width, height)
  console.log('🎯 Applied adaptive threshold')
  
  // Apply Sobel edge detection
  const edges = applySobel(thresholded, width, height)
  console.log('⚡ Applied Sobel edge detection')
  
  // Apply morphological operations to clean up edges
  const cleaned = applyMorphologicalOperations(edges, width, height)
  console.log('🧹 Applied morphological operations')
  
  // Find contours using Moore neighborhood tracing
  const contours = traceContours(cleaned, width, height)
  console.log('🔗 Found', contours.length, 'contours')
  
  if (contours.length === 0) {
    console.log('❌ No contours found')
    return []
  }
  
  // Find the best contour (largest and most complete)
  const bestContour = findBestContour(contours)
  console.log('🏆 Best contour has', bestContour.length, 'points')
  
  // Smooth the contour
  const smoothedContour = smoothContour(bestContour)
  console.log('✨ Smoothed contour to', smoothedContour.length, 'points')
  
  // Scale to canvas coordinates
  const scaledContour = scaleContoursToCanvas([smoothedContour], width, height)
  console.log('📏 Scaled contour to canvas coordinates:', scaledContour.length, 'points')
  
  return scaledContour
}

/**
 * Convert RGBA data to grayscale using luminance formula
 */
const convertToGrayscale = (data: Uint8ClampedArray, width: number, height: number): Uint8Array => {
  const grayscale = new Uint8Array(width * height)
  
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const a = data[i + 3]
    
    // Use luminance formula with alpha consideration
    const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b)
    const alphaAdjusted = Math.round(gray * (a / 255))
    
    grayscale[Math.floor(i / 4)] = alphaAdjusted
  }
  
  return grayscale
}

/**
 * Apply Gaussian blur to reduce noise
 */
const applyGaussianBlur = (data: Uint8Array, width: number, height: number, sigma: number): Uint8Array => {
  const blurred = new Uint8Array(width * height)
  const kernelSize = Math.ceil(3 * sigma) * 2 + 1
  const kernel: number[] = []
  
  // Generate Gaussian kernel
  let sum = 0
  for (let i = 0; i < kernelSize; i++) {
    const x = i - Math.floor(kernelSize / 2)
    const value = Math.exp(-(x * x) / (2 * sigma * sigma))
    kernel[i] = value
    sum += value
  }
  
  // Normalize kernel
  for (let i = 0; i < kernelSize; i++) {
    kernel[i] /= sum
  }
  
  // Apply horizontal blur
  const temp = new Uint8Array(width * height)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let value = 0
      for (let k = 0; k < kernelSize; k++) {
        const kx = x + k - Math.floor(kernelSize / 2)
        if (kx >= 0 && kx < width) {
          value += data[y * width + kx] * kernel[k]
        }
      }
      temp[y * width + x] = Math.round(value)
    }
  }
  
  // Apply vertical blur
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let value = 0
      for (let k = 0; k < kernelSize; k++) {
        const ky = y + k - Math.floor(kernelSize / 2)
        if (ky >= 0 && ky < height) {
          value += temp[ky * width + x] * kernel[k]
        }
      }
      blurred[y * width + x] = Math.round(value)
    }
  }
  
  return blurred
}

/**
 * Apply adaptive threshold to handle varying lighting
 */
const applyAdaptiveThreshold = (data: Uint8Array, width: number, height: number): Uint8Array => {
  const thresholded = new Uint8Array(width * height)
  const blockSize = 15 // Size of neighborhood
  const C = 10 // Constant subtracted from mean
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sum = 0
      let count = 0
      
      // Calculate mean in neighborhood
      for (let by = Math.max(0, y - blockSize); by < Math.min(height, y + blockSize); by++) {
        for (let bx = Math.max(0, x - blockSize); bx < Math.min(width, x + blockSize); bx++) {
          sum += data[by * width + bx]
          count++
        }
      }
      
      const mean = sum / count
      const threshold = mean - C
      
      thresholded[y * width + x] = data[y * width + x] > threshold ? 255 : 0
    }
  }
  
  return thresholded
}

/**
 * Apply Sobel edge detection
 */
const applySobel = (data: Uint8Array, width: number, height: number): boolean[] => {
  const edges = new Array(width * height).fill(false)
  
  // Sobel kernels
  const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1]
  const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1]
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let gx = 0, gy = 0
      
      // Apply Sobel operator
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const idx = (y + ky) * width + (x + kx)
          const gray = data[idx]
          
          const kernelIdx = (ky + 1) * 3 + (kx + 1)
          gx += gray * sobelX[kernelIdx]
          gy += gray * sobelY[kernelIdx]
        }
      }
      
      // Calculate gradient magnitude
      const magnitude = Math.sqrt(gx * gx + gy * gy)
      
      // Adaptive threshold based on local gradient
      const threshold = 30 + (data[y * width + x] / 255) * 50
      if (magnitude > threshold) {
        edges[y * width + x] = true
      }
    }
  }
  
  return edges
}

/**
 * Apply morphological operations to clean up edges
 */
const applyMorphologicalOperations = (edges: boolean[], width: number, height: number): boolean[] => {
  // First pass: erosion to remove noise
  const eroded = new Array(width * height).fill(false)
  const kernel = [
    [true, true, true],
    [true, true, true],
    [true, true, true]
  ]
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let allTrue = true
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          if (kernel[ky + 1][kx + 1] && !edges[(y + ky) * width + (x + kx)]) {
            allTrue = false
            break
          }
        }
        if (!allTrue) break
      }
      eroded[y * width + x] = allTrue && edges[y * width + x]
    }
  }
  
  // Second pass: dilation to restore edge thickness
  const dilated = new Array(width * height).fill(false)
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      if (eroded[y * width + x]) {
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            dilated[(y + ky) * width + (x + kx)] = true
          }
        }
      }
    }
  }
  
  return dilated
}

/**
 * Find the best contour from multiple candidates
 */
const findBestContour = (contours: Point[][]): Point[] => {
  if (contours.length === 0) return []
  
  // Score contours based on length and completeness
  let bestContour = contours[0]
  let bestScore = 0
  
  for (const contour of contours) {
    let score = contour.length
    
    // Bonus for closed contours
    if (isContourClosed(contour)) {
      score *= 1.5
    }
    
    // Bonus for contours with good coverage
    const bounds = getContourBounds(contour)
    const area = bounds.width * bounds.height
    if (area > 0) {
      score *= Math.log(area + 1)
    }
    
    if (score > bestScore) {
      bestScore = score
      bestContour = contour
    }
  }
  
  return bestContour
}

/**
 * Check if a contour is closed
 */
const isContourClosed = (contour: Point[]): boolean => {
  if (contour.length < 3) return false
  
  const first = contour[0]
  const last = contour[contour.length - 1]
  const distance = Math.sqrt((last.x - first.x) ** 2 + (last.y - first.y) ** 2)
  
  return distance < 5 // Within 5 pixels
}

/**
 * Get bounding box of contour
 */
const getContourBounds = (contour: Point[]): { x: number, y: number, width: number, height: number } => {
  if (contour.length === 0) return { x: 0, y: 0, width: 0, height: 0 }
  
  let minX = contour[0].x, maxX = contour[0].x
  let minY = contour[0].y, maxY = contour[0].y
  
  for (const point of contour) {
    minX = Math.min(minX, point.x)
    maxX = Math.max(maxX, point.x)
    minY = Math.min(minY, point.y)
    maxY = Math.max(maxY, point.y)
  }
  
  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY
  }
}

/**
 * Smooth contour using moving average
 */
const smoothContour = (contour: Point[]): Point[] => {
  if (contour.length < 3) return contour
  
  const smoothed: Point[] = []
  const windowSize = 3
  
  for (let i = 0; i < contour.length; i++) {
    let sumX = 0, sumY = 0, count = 0
    
    for (let j = -windowSize; j <= windowSize; j++) {
      const idx = (i + j + contour.length) % contour.length
      sumX += contour[idx].x
      sumY += contour[idx].y
      count++
    }
    
    smoothed.push({
      x: sumX / count,
      y: sumY / count
    })
  }
  
  return smoothed
}

/**
 * Trace contours from edge data
 */
const traceContours = (edges: boolean[], width: number, height: number): Point[][] => {
  const visited = new Array(width * height).fill(false)
  const contours: Point[][] = []
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x
      
      if (edges[idx] && !visited[idx]) {
        const contour = traceContour(edges, visited, x, y, width, height)
        if (contour.length > 10) { // Only keep substantial contours
          contours.push(contour)
        }
      }
    }
  }
  
  // Return the largest contour
  return contours.length > 0 ? [contours.reduce((a, b) => a.length > b.length ? a : b)] : []
}

/**
 * Trace a single contour using Moore neighborhood
 */
const traceContour = (edges: boolean[], visited: boolean[], startX: number, startY: number, width: number, height: number): Point[] => {
  const contour: Point[] = []
  const directions = [
    [-1, -1], [-1, 0], [-1, 1], [0, 1],
    [1, 1], [1, 0], [1, -1], [0, -1]
  ]
  
  let x = startX
  let y = startY
  let direction = 0
  
  do {
    contour.push({ x, y })
    visited[y * width + x] = true
    
    // Find next edge pixel
    let found = false
    for (let i = 0; i < 8; i++) {
      const dir = directions[(direction + i) % 8]
      const nx = x + dir[0]
      const ny = y + dir[1]
      
      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        const nIdx = ny * width + nx
        if (edges[nIdx] && !visited[nIdx]) {
          x = nx
          y = ny
          direction = (direction + i) % 8
          found = true
          break
        }
      }
    }
    
    if (!found) break
  } while (x !== startX || y !== startY)
  
  return contour
}

/**
 * Scale contours to our canvas coordinate system
 */
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

/**
 * Extract paths from SVG file
 */
const extractSVGPaths = async (file: File): Promise<Point[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const svgText = e.target?.result as string
        const parser = new DOMParser()
        const svgDoc = parser.parseFromString(svgText, 'image/svg+xml')
        
        // Find all path elements
        const paths = svgDoc.querySelectorAll('path')
        const allPoints: Point[] = []
        
        paths.forEach(path => {
          const d = path.getAttribute('d')
          if (d) {
            const points = parseSVGPath(d)
            allPoints.push(...points)
          }
        })
        
        // If no paths found, try to extract from other elements
        if (allPoints.length === 0) {
          const rects = svgDoc.querySelectorAll('rect')
          const circles = svgDoc.querySelectorAll('circle')
          
          // Convert basic shapes to points
          rects.forEach(rect => {
            const x = parseFloat(rect.getAttribute('x') || '0')
            const y = parseFloat(rect.getAttribute('y') || '0')
            const width = parseFloat(rect.getAttribute('width') || '0')
            const height = parseFloat(rect.getAttribute('height') || '0')
            
            allPoints.push(
              { x, y },
              { x: x + width, y },
              { x: x + width, y: y + height },
              { x, y: y + height }
            )
          })
          
          circles.forEach(circle => {
            const cx = parseFloat(circle.getAttribute('cx') || '0')
            const cy = parseFloat(circle.getAttribute('cy') || '0')
            const r = parseFloat(circle.getAttribute('r') || '0')
            
            // Create circle approximation
            for (let i = 0; i < 16; i++) {
              const angle = (i / 16) * 2 * Math.PI
              allPoints.push({
                x: cx + r * Math.cos(angle),
                y: cy + r * Math.sin(angle)
              })
            }
          })
        }
        
        // Scale SVG points to our coordinate system (90% of canvas)
        const scaledPoints = scaleContoursToCanvas([allPoints], 1000, 1000)
        resolve(scaledPoints)
      } catch (error) {
        reject(error)
      }
    }
    
    reader.onerror = () => reject(new Error('Could not read SVG file'))
    reader.readAsText(file)
  })
}

/**
 * Parse SVG path data to extract points
 */
const parseSVGPath = (pathData: string): Point[] => {
  const points: Point[] = []
  const commands = pathData.match(/[MmLlHhVvCcSsQqTtAaZz][^MmLlHhVvCcSsQqTtAaZz]*/g) || []
  
  let currentX = 0
  let currentY = 0
  
  commands.forEach(command => {
    const type = command[0]
    const coords = command.slice(1).trim().split(/[\s,]+/).map(Number).filter(n => !isNaN(n))
    
    switch (type.toLowerCase()) {
      case 'm': // Move to (relative)
        currentX += coords[0] || 0
        currentY += coords[1] || 0
        points.push({ x: currentX, y: currentY })
        break
        
      case 'l': // Line to (relative)
        for (let i = 0; i < coords.length; i += 2) {
          currentX += coords[i] || 0
          currentY += coords[i + 1] || 0
          points.push({ x: currentX, y: currentY })
        }
        break
        
      case 'h': // Horizontal line (relative)
        currentX += coords[0] || 0
        points.push({ x: currentX, y: currentY })
        break
        
      case 'v': // Vertical line (relative)
        currentY += coords[0] || 0
        points.push({ x: currentX, y: currentY })
        break
        
      case 'c': // Cubic bezier (relative)
        // Simplified: just use the end point
        currentX += coords[4] || 0
        currentY += coords[5] || 0
        points.push({ x: currentX, y: currentY })
        break
        
      case 'z': // Close path
        // Connect back to start
        if (points.length > 0) {
          points.push({ ...points[0] })
        }
        break
    }
  })
  
  return points
}
