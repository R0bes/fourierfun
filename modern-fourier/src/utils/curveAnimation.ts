import { FourierComponent, AnimationFrame } from '../types'

export function generateAnimation(components: FourierComponent[], steps: number = 100): AnimationFrame[][] {
  const animation: AnimationFrame[][] = []

  for (let step = 0; step < steps; step++) {
    const t = (step / steps) * 2 * Math.PI
    const frame: AnimationFrame[] = []

    let currentX = 0
    let currentY = 0

    for (const component of components) {
      const angle = component.freq * t + component.phase
      const x = currentX + component.amplitude * Math.cos(angle)
      const y = currentY + component.amplitude * Math.sin(angle)

      frame.push({
        position: { x, y },
        angle,
        amplitude: component.amplitude
      })

      currentX = x
      currentY = y
    }

    animation.push(frame)
  }

  return animation
}
