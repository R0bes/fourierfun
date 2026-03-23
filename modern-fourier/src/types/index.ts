import type { MachineColors, MachineAlphas } from '../utils/colorPalette'

export interface Point {
  x: number
  y: number
}

export interface BezierSegment {
  p1: Point
  c1: Point
  c2: Point
  p2: Point
}

export interface FourierComponent {
  amplitude: number
  phase: number
  freq: number
}

export interface AnimationFrame {
  position: Point
  angle: number
  amplitude: number
}

export interface CurveAnalysis {
  pointCount: number
  drawnLength: number
  closingLength: number
  closedCurveLength: number
}

export interface CurveData {
  drawnPoints: Point[]
  completeCurve: Point[]
  uniformPoints: Point[]
  centerOfMass: Point | null
  isCurveClosed: boolean
  isCurveFixed: boolean
  isCurveConfigured: boolean // New phase: Config
  fourierComponents: FourierComponent[]
  animationTime: number
  fourierAnimation: AnimationFrame[][]
  currentAnimationStep: number
  animationSteps: number
  curveAnalysis: CurveAnalysis | null
  backgroundImage: HTMLImageElement | null // Background image for reference
  processedImage: HTMLCanvasElement | null // Processed image for editing
}

export interface Settings {
  showPoints: boolean
  showUniformPoints: boolean
  showCenterOfMass: boolean
  autoCalculateCenter: boolean
  numUniformPoints: number
  activeTab: 'curve' | 'animation' | 'controls'
  legendPosition: { x: number; y: number }
  legendVisible: boolean
  gridSnap: boolean
  showFourierCircles: boolean
  showFourierConnections: boolean
  showFourierTrail: boolean
  showFourierPath: boolean
  fourierAlpha: number
  animationPeriod: number
  maxFourierComponents: number
  // Draw mode settings
  drawMode: 'points' | 'line' | 'image'
  // Color settings
  colorOriginalPoints: string
  colorUniformPoints: string
  colorCenterOfMass: string
  colorFourierCircles: string
  colorFourierConnections: string
  colorFourierTrail: string
  colorFourierPath: string
  // Image processing settings
  imageBrightness: number
  imageContrast: number
  imageThreshold: number
  imageBlur: number
  imageEdgeDetection: 'none' | 'sobel' | 'canny' | 'laplacian'
  imageMorphology: boolean
  imageInvert: boolean
  // Grid overlay
  showGrid: boolean
  gridCellSize: number
  gridRainbowMode: boolean
  gridParticleSystem: boolean
  // Fourier overlays
  showFrequencySpectrum: boolean
  showPhaseDiagram: boolean
  spectrumPanelX: number
  spectrumPanelY: number
  phasePanelX: number
  phasePanelY: number
  // GIF recording defaults
  recordingDurationMs: number
  recordingFrameRate: number
}

export interface DragState {
  isDraggingCenter: boolean
  draggedPointIndex: number | null
}

export interface Machine {
  id: string
  name: string
  curveData: CurveData
  colors: MachineColors
  alphas: MachineAlphas
}

/** Full multi-machine app state (machines + active id + id sequence). */
export interface MultiMachineState {
  machines: Machine[]
  activeMachineId: string
  nextMachineSeq: number
}
