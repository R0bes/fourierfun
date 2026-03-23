import type { AnimationFrame } from '../types'
import type { MachineColors } from './colorPalette'
import { colorForComponentIndex } from './colorPalette'

export function drawFrequencySpectrumOverlay(
  ctx: CanvasRenderingContext2D,
  animationFrame: AnimationFrame[] | undefined,
  x: number,
  y: number,
  w: number,
  h: number,
  colors: MachineColors,
  showGlow: boolean
): void {
  if (!animationFrame || animationFrame.length < 2) return
  const nonDC = animationFrame.slice(1)
  const amps = nonDC.map((f) => f.amplitude)
  const maxA = Math.max(...amps, 1e-6)
  const barW = w / amps.length
  const time = Date.now() * 0.001

  ctx.save()
  ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'
  ctx.fillRect(x, y, w, h)
  ctx.strokeStyle = colors.path
  ctx.lineWidth = 2
  ctx.strokeRect(x, y, w, h)

  for (let i = 0; i < amps.length; i++) {
    const amplitude = amps[i]
    const barHeight = (amplitude / maxA) * (h - 10)
    const bx = x + i * barW + 2
    const by = y + h - barHeight - 5
    const bw = barW - 4
    const barColor = colorForComponentIndex(colors.circles, i, amps.length, time)
    if (showGlow) {
      ctx.shadowColor = colors.glow
      ctx.shadowBlur = 8
      ctx.fillStyle = barColor
      ctx.globalAlpha = 0.7
      ctx.fillRect(bx, by, bw, barHeight)
    }
    ctx.shadowBlur = 0
    ctx.fillStyle = barColor
    ctx.globalAlpha = 0.9
    ctx.fillRect(bx, by, bw, barHeight)
    if (i % 5 === 0) {
      ctx.fillStyle = colors.path
      ctx.font = '10px monospace'
      ctx.textAlign = 'center'
      ctx.fillText(String(i), bx + bw / 2, y + h - 2)
    }
  }
  ctx.restore()
}

export function drawPhaseDiagramOverlay(
  ctx: CanvasRenderingContext2D,
  animationFrame: AnimationFrame[] | undefined,
  x: number,
  y: number,
  size: number,
  colors: MachineColors,
  showGlow: boolean
): void {
  if (!animationFrame || animationFrame.length < 2) return
  const centerX = x + size / 2
  const centerY = y + size / 2
  const radius = size / 2 - 10
  const nonDC = animationFrame.slice(1)
  const maxNonDC = Math.max(...nonDC.map((f) => f.amplitude), 1e-6)
  const time = Date.now() * 0.001

  ctx.save()
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
  ctx.fillRect(x, y, size, size)

  for (let i = 1; i < animationFrame.length; i++) {
    const frameData = animationFrame[i]
    const angle = frameData.angle
    const length = (frameData.amplitude / maxNonDC) * radius * 0.8
    const endX = centerX + Math.cos(angle) * length
    const endY = centerY + Math.sin(angle) * length
    const vectorColor = colorForComponentIndex(colors.circles, i, animationFrame.length, time)
    if (showGlow) {
      ctx.shadowColor = colors.glow
      ctx.shadowBlur = 10
      ctx.strokeStyle = vectorColor
      ctx.lineWidth = 4
      ctx.globalAlpha = 0.6
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.lineTo(endX, endY)
      ctx.stroke()
    }
    ctx.shadowBlur = 0
    ctx.strokeStyle = vectorColor
    ctx.lineWidth = 2
    ctx.globalAlpha = 0.8
    ctx.beginPath()
    ctx.moveTo(centerX, centerY)
    ctx.lineTo(endX, endY)
    ctx.stroke()
    ctx.fillStyle = vectorColor
    ctx.beginPath()
    ctx.arc(endX, endY, 3, 0, 2 * Math.PI)
    ctx.fill()
  }

  ctx.strokeStyle = colors.path
  ctx.lineWidth = 2
  ctx.globalAlpha = 0.5
  ctx.beginPath()
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
  ctx.stroke()
  ctx.restore()
}
