import { Settings } from '../types'

const STORAGE_KEY = 'fourier-settings'

/**
 * Save settings to localStorage
 */
export const saveSettings = (settings: Settings): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch (error) {
    console.warn('Failed to save settings to localStorage:', error)
  }
}

/**
 * Load settings from localStorage
 */
export const loadSettings = (): Partial<Settings> => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      return JSON.parse(saved)
    }
  } catch (error) {
    console.warn('Failed to load settings from localStorage:', error)
  }
  return {}
}

/**
 * Get default settings
 */
export const getDefaultSettings = (): Settings => ({
  showPoints: true,
  showUniformPoints: true,
  showCenterOfMass: true,
  autoCalculateCenter: true,
  numUniformPoints: 32,
  activeTab: 'curve',
  legendPosition: { x: 800, y: 400 }, // Fixed default position
  legendVisible: true,
  gridSnap: false,
  showFourierCircles: true,
  showFourierConnections: true,
  showFourierTrail: true,
  showFourierPath: true,
  fourierAlpha: 0.8,
  animationPeriod: 15.0, // 15 Sekunden für eine komplette Periode
  maxFourierComponents: 20,
  // Draw mode settings
  drawMode: 'points', // Default to points mode
  // Color settings
  colorOriginalPoints: '#ff6b6b', // Rot für Original-Punkte
  colorUniformPoints: '#4ecdc4', // Türkis für Uniform-Punkte
  colorCenterOfMass: '#ffd93d', // Gelb für Mittelpunkt
  colorFourierCircles: '#6c5ce7', // Lila für Fourier-Kreise
  colorFourierConnections: '#a29bfe', // Hell-Lila für Verbindungen
  colorFourierTrail: '#00b894', // Grün für Trail
  colorFourierPath: '#e17055', // Orange für Path-Punkt
  // Image processing settings
  imageBrightness: 0,
  imageContrast: 0,
  imageThreshold: 128,
  imageBlur: 0,
  imageEdgeDetection: 'none',
  imageMorphology: false,
  imageInvert: false
})
