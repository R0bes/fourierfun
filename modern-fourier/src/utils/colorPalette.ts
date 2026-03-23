/**
 * Neon palette and per-component colors (aligned with main app ColorPalette concepts).
 */

export interface ComponentColors {
  circles: string
  amplitudes: string
  trail: string
  path: string
  drawn: string
  glow: string
}

export interface ComponentAlphas {
  circles: number
  amplitudes: number
  trail: number
  path: number
  drawn: number
  glow: number
}

/** Extra colors used by modern-fourier canvas (uniform samples, center). */
export interface MachineExtraColors {
  uniformPoints: string
  centerOfMass: string
}

export interface MachineColors extends ComponentColors, MachineExtraColors {}

export interface MachineAlphas extends ComponentAlphas {
  uniformPoints: number
  centerOfMass: number
}

export interface NeonColor {
  name: string
  hex: string
  glow: string
}

export const NEON_COLORS: NeonColor[] = [
  { name: 'Neon Red', hex: '#FF6B6B', glow: '#FF4757' },
  { name: 'Neon Turquoise', hex: '#4ECDC4', glow: '#00D2D3' },
  { name: 'Neon Blue', hex: '#45B7D1', glow: '#54A0FF' },
  { name: 'Neon Yellow', hex: '#FCD34D', glow: '#F59E0B' },
  { name: 'Neon Purple', hex: '#A855F7', glow: '#8B5CF6' },
  { name: 'Neon Green', hex: '#2ECC71', glow: '#27AE60' },
  { name: 'Neon Orange', hex: '#FF9F43', glow: '#FF6348' },
  { name: 'Neon Pink', hex: '#FF6B9D', glow: '#FF3838' },
  { name: 'Neon Cyan', hex: '#00CEC9', glow: '#00B894' },
  { name: 'Neon Magenta', hex: '#E84393', glow: '#D63031' },
  { name: 'Metallic Gray', hex: '#708090', glow: '#2F4F4F' }
]

const pickRandom = (): NeonColor => NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)]

export function createRandomMachineColors(): MachineColors {
  const c1 = pickRandom()
  const c2 = pickRandom()
  const c3 = pickRandom()
  const c4 = pickRandom()
  const c5 = pickRandom()
  const c6 = pickRandom()
  return {
    circles: c1.hex,
    amplitudes: c2.hex,
    trail: c3.hex,
    path: c4.hex,
    drawn: c5.hex,
    glow: c6.glow,
    uniformPoints: c2.hex,
    centerOfMass: c4.hex
  }
}

export function createDefaultMachineAlphas(): MachineAlphas {
  return {
    circles: 1,
    amplitudes: 1,
    trail: 1,
    path: 1,
    drawn: 1,
    glow: 1,
    uniformPoints: 1,
    centerOfMass: 1
  }
}

/** Solid color per bar/vector index (simple hue shift). */
export function colorForComponentIndex(
  baseHex: string,
  index: number,
  total: number,
  time: number
): string {
  if (total <= 0) return baseHex
  const hueShift = (index / total) * 60 + Math.sin(time + index * 0.1) * 15
  // Parse hex to RGB, apply rough hue - for simplicity blend with HSL
  const n = baseHex.replace('#', '')
  const r = parseInt(n.slice(0, 2), 16)
  const g = parseInt(n.slice(2, 4), 16)
  const b = parseInt(n.slice(4, 6), 16)
  const shift = hueShift * (Math.PI / 180)
  const cos = Math.cos(shift)
  const sin = Math.sin(shift)
  const nr = Math.min(255, Math.max(0, r * cos - g * sin + 20))
  const ng = Math.min(255, Math.max(0, g * cos + r * sin * 0.3))
  const nb = Math.min(255, Math.max(0, b + sin * 30))
  return `rgb(${Math.round(nr)},${Math.round(ng)},${Math.round(nb)})`
}
