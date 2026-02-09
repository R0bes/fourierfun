// Animation Web Worker
// This worker handles the Fourier animation calculations to avoid blocking the main thread

interface AnimationMessage {
  type: 'start' | 'stop' | 'updateSpeed'
  fourierComponents?: Array<{
    freq: number
    amplitude: number
    phase: number
  }>
  centerOfMass?: { x: number; y: number }
  animationSpeed?: number
  startTime?: number
}

interface AnimationResponse {
  type: 'animationFrame'
  time: number
  pathPoint: { x: number; y: number }
}

let animationId: number | null = null
let fourierComponents: Array<{ freq: number; amplitude: number; phase: number }> = []
let centerOfMass: { x: number; y: number } = { x: 0, y: 0 }
let animationSpeed: number = 1.0
let startTime: number = 0

// Fourier path generation function
function generateFourierPath(
  components: Array<{ freq: number; amplitude: number; phase: number }>,
  center: { x: number; y: number },
  time: number,
  maxComponents: number = 50
): { x: number; y: number } {
  let x = 0
  let y = 0

  const significantComponents = components.slice(0, maxComponents)
  
  for (const component of significantComponents) {
    const angle = component.freq * time + component.phase
    x += component.amplitude * Math.cos(angle)
    y += component.amplitude * Math.sin(angle)
  }

  return { x: x + center.x, y: y + center.y }
}

function animate(currentTime: number) {
  if (!startTime) {
    startTime = currentTime
  }

  const elapsed = (currentTime - startTime) / 1000
  const time = elapsed * animationSpeed

  const pathPoint = generateFourierPath(fourierComponents, centerOfMass, time, 50)

  // Send animation frame to main thread
  self.postMessage({
    type: 'animationFrame',
    time,
    pathPoint
  } as AnimationResponse)

  animationId = requestAnimationFrame(animate)
}

self.onmessage = (event: MessageEvent<AnimationMessage>) => {
  const { type } = event.data

  switch (type) {
    case 'start':
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
      
      fourierComponents = event.data.fourierComponents || []
      centerOfMass = event.data.centerOfMass || { x: 0, y: 0 }
      animationSpeed = event.data.animationSpeed || 1.0
      startTime = 0
      
      animationId = requestAnimationFrame(animate)
      break

    case 'stop':
      if (animationId) {
        cancelAnimationFrame(animationId)
        animationId = null
      }
      break

    case 'updateSpeed':
      animationSpeed = event.data.animationSpeed || 1.0
      break
  }
}
