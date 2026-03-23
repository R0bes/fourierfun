import { CurveData } from '../types'

export function emptyCurveData(): CurveData {
  return {
    drawnPoints: [],
    completeCurve: [],
    uniformPoints: [],
    centerOfMass: null,
    isCurveClosed: false,
    isCurveFixed: false,
    isCurveConfigured: false,
    fourierComponents: [],
    animationTime: 0,
    fourierAnimation: [],
    currentAnimationStep: 0,
    animationSteps: 100,
    curveAnalysis: null,
    backgroundImage: null,
    processedImage: null
  }
}
