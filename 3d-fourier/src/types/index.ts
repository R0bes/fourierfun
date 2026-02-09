// 3D Fourier Component Interface
export interface Fourier3DComponent {
  amplitude: number
  phase: number
  frequency: number
  zOffset: number
  spiralFactor: number
  heightMap: boolean
  color: string
  opacity: number
}

// Utility Types
export type FourierPreset = 'circle' | 'square' | 'triangle' | 'heart' | 'spiral'