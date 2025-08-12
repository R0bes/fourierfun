import { Point } from './Point'

// Cubic interpolation helper function for smooth transitions
export function cubicInterpolate(p0: Point, p1: Point, p2: Point, p3: Point, t: number): Point {
    const t2 = t * t;
    const t3 = t2 * t;
    
    // Catmull-Rom spline coefficients
    const c0 = -0.5 * t3 + t2 - 0.5 * t;
    const c1 = 1.5 * t3 - 2.5 * t2 + 1;
    const c2 = -1.5 * t3 + 2 * t2 + 0.5 * t;
    const c3 = 0.5 * t3 - 0.5 * t2;
    
    return new Point(
        c0 * p0.x + c1 * p1.x + c2 * p2.x + c3 * p3.x,
        c0 * p0.y + c1 * p1.y + c2 * p2.y + c3 * p3.y
    );
}

// Hermite spline interpolation for smooth curve closure
export function hermiteInterpolate(p0: Point, p1: Point, t0: Point, t1: Point, t: number): Point {
    const t2 = t * t;
    const t3 = t2 * t;
    
    // Hermite basis functions
    const h1 = 2 * t3 - 3 * t2 + 1;      // (2t³ - 3t² + 1)
    const h2 = -2 * t3 + 3 * t2;         // (-2t³ + 3t²)
    const h3 = t3 - 2 * t2 + t;          // (t³ - 2t² + t)
    const h4 = t3 - t2;                  // (t³ - t²)
    
    return new Point(
        h1 * p0.x + h2 * p1.x + h3 * t0.x + h4 * t1.x,
        h1 * p0.y + h2 * p1.y + h3 * t0.y + h4 * t1.y
    );
}

function dist(p1: Point, p2: Point) {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}


function lerp(v1: number, v2: number, f: number) {
    return (v2 - v1) * f + v1;
}

function lerpPoints(p1: Point, p2: Point, ratio: number): Point {
    return new Point(
        lerp(p2.x, p1.x, ratio),
        lerp(p2.y, p1.y, ratio));
}

// Catmull-Rom spline interpolation
function catmullRomSpline(p0: Point, p1: Point, p2: Point, p3: Point, t: number): Point {
    const t2 = t * t;
    const t3 = t2 * t;
    
    // Catmull-Rom matrix coefficients
    const c0 = -0.5 * t3 + t2 - 0.5 * t;
    const c1 = 1.5 * t3 - 2.5 * t2 + 1;
    const c2 = -1.5 * t3 + 2 * t2 + 0.5 * t;
    const c3 = 0.5 * t3 - 0.5 * t2;
    
    return new Point(
        c0 * p0.x + c1 * p1.x + c2 * p2.x + c3 * p3.x,
        c0 * p0.y + c1 * p1.y + c2 * p2.y + c3 * p3.y
    );
}

// Create closed spline curve from points with improved smoothness
function createClosedSpline(points: Point[], numSegments: number = 10): Point[] {
    if (points.length < 3) return points;
    
    const splinePoints: Point[] = [];
    const n = points.length;
    
    // Use more segments for smoother curves
    const segmentsPerPoint = Math.max(numSegments, 52);
    
    for (let i = 0; i < n; i++) {
        const p0 = points[(i - 1 + n) % n];
        const p1 = points[i];
        const p2 = points[(i + 1) % n];
        const p3 = points[(i + 2) % n];
        
        // Calculate tangent vectors for better control
        const tangent1 = new Point(
            p2.x - p0.x,
            p2.y - p0.y
        );
        const tangent2 = new Point(
            p3.x - p1.x,
            p3.y - p1.y
        );
        
        // Normalize tangents
        const len1 = Math.sqrt(tangent1.x * tangent1.x + tangent1.y * tangent1.y);
        const len2 = Math.sqrt(tangent2.x * tangent2.x + tangent2.y * tangent2.y);
        
        if (len1 > 0 && len2 > 0) {
            tangent1.x /= len1;
            tangent1.y /= len1;
            tangent2.x /= len2;
            tangent2.y /= len2;
            
            // Create control points for smoother curves
            const control1 = new Point(
                p1.x + tangent1.x * len1 * 0.25,
                p1.y + tangent1.y * len1 * 0.25
            );
            const control2 = new Point(
                p2.x - tangent2.x * len2 * 0.25,
                p2.y - tangent2.y * len2 * 0.25
            );
            
            for (let j = 0; j < segmentsPerPoint; j++) {
                const t = j / segmentsPerPoint;
                const t2 = t * t;
                const t3 = t2 * t;
                
                // Cubic Bezier spline for smoother interpolation
                const b0 = (1 - t) * (1 - t) * (1 - t);           // (1-t)³
                const b1 = 3 * t * (1 - t) * (1 - t);             // 3t(1-t)²
                const b2 = 3 * t * t * (1 - t);                    // 3t²(1-t)
                const b3 = t * t * t;                              // t³
                
                const interpolatedPoint = new Point(
                    b0 * p1.x + b1 * control1.x + b2 * control2.x + b3 * p2.x,
                    b0 * p1.y + b1 * control1.y + b2 * control2.y + b3 * p2.y
                );
                
                splinePoints.push(interpolatedPoint);
            }
        } else {
            // Fallback to Catmull-Rom if tangents are too small
            for (let j = 0; j < segmentsPerPoint; j++) {
                const t = j / segmentsPerPoint;
                
                // Use Catmull-Rom spline interpolation
                const interpolatedPoint = cubicInterpolate(p0, p1, p2, p3, t);
                
                splinePoints.push(interpolatedPoint);
            }
        }
    }
    
    return splinePoints;
}

export function calcEquidistantPoints(path: Point[], numPoints: number) : Point[] {
    if (path.length < 2) return path;
    
    // Use the new aggressive smoothing approach for better curve quality
    const smoothedPath = smoothDrawnPoints(path, 6);
    const closedPath = createSmoothClosedCurve(smoothedPath, Math.max(56, Math.floor(path.length / 0.5)));
    
    // Create spline curve from the closed path with higher resolution for smoother curves
    const splinePath = createClosedSpline(closedPath, Math.max(52, Math.floor(closedPath.length / 0.1)));
    
    let totalLength = 0;
    let distances = [];
    
    // Calculate distances between Points and total length
    for (let i = 1; i < splinePath.length; i++) {
      let distBetweenPoints = dist(splinePath[i-1], splinePath[i]);
      totalLength += distBetweenPoints;
      distances.push(totalLength);
    }
    
    let normalizedPath: Point[] = [];
    let step = totalLength / (numPoints - 1);
    
    // add first point
    normalizedPath.push(splinePath[0]);
    
    // add every other point
    for (let i = 1; i < numPoints - 1; i++) {
      let targetLength = i * step;
      for (let j = 1; j < distances.length; j++) {
        if (distances[j] >= targetLength) {
          normalizedPath.push(lerpPoints(splinePath[j], splinePath[j-1], (targetLength - distances[j-1]) / (distances[j] - distances[j-1])));
          break;
        }
      } 
    }
    
    // add last point (same as first for closed curve)
    normalizedPath.push(splinePath[0]);
    return normalizedPath;
}


export type FourierComponent = {
  freq: number;
  amplitude: number;
  phase: number;
};

// Naive DFT for 2D points -> complex coefficients. One-time compute per input; OK for N<=1024.
export function computeFourierDFT(points: Point[]): FourierComponent[] {
  const N = points.length;
  if (N === 0) return [];

  const components: FourierComponent[] = [];
  // Frequency range symmetrical around 0
  const half = Math.floor(N / 2);
  for (let k = -half; k < half; k++) {
    let real = 0;
    let imag = 0;
    for (let n = 0; n < N; n++) {
      const theta = (-2 * Math.PI * k * n) / N;
      const cosTheta = Math.cos(theta);
      const sinTheta = Math.sin(theta);
      const x = points[n].x;
      const y = points[n].y;
      // (x + i y) * (cos - i sin)
      real += x * cosTheta + y * sinTheta;
      imag += y * cosTheta - x * sinTheta;
    }
    real /= N;
    imag /= N;
    const amplitude = Math.hypot(real, imag);
    const phase = Math.atan2(imag, real);
    components.push({ freq: k, amplitude, phase });
  }

  // Sort by amplitude descending
  components.sort((a, b) => b.amplitude - a.amplitude);
  return components;
}

// Aggressive smoothing function to eliminate hard edges from drawn curves
export function smoothDrawnPoints(points: Point[], smoothingPasses: number = 3): Point[] {
    if (points.length < 3) return points;
    
    let smoothedPoints = [...points];
    
    for (let pass = 0; pass < smoothingPasses; pass++) {
        const newPoints: Point[] = [];
        
        // Behalte immer den ersten und letzten Punkt
        newPoints.push(smoothedPoints[0]);
        
        // Glätte Zwischenpunkte mit einfacher gewichteter Mittelung
        for (let i = 1; i < smoothedPoints.length - 1; i++) {
            const prev = smoothedPoints[i - 1];
            const current = smoothedPoints[i];
            const next = smoothedPoints[i + 1];
            
            // Einfache gewichtete Mittelung: 25% vorheriger, 50% aktueller, 25% nächster Punkt
            const smoothingFactor = 0.25;
            const smoothedPoint = new Point(
                current.x * (1 - 2 * smoothingFactor) + prev.x * smoothingFactor + next.x * smoothingFactor,
                current.y * (1 - 2 * smoothingFactor) + prev.y * smoothingFactor + next.y * smoothingFactor
            );
            
            newPoints.push(smoothedPoint);
        }
        
        // Behalte immer den letzten Punkt
        newPoints.push(smoothedPoints[smoothedPoints.length - 1]);
        
        // Update für nächsten Durchlauf
        smoothedPoints = newPoints;
    }
    
    return smoothedPoints;
}

// Enhanced curve closure with aggressive smoothing
export function createSmoothClosedCurve(points: Point[], numClosingPoints: number = 52): Point[] {
    if (points.length < 3) return points;
    
    // Einfacher, mathematisch korrekter Algorithmus für geschlossene Kurven
    const result = [...points];
    
    // Wenn der erste und letzte Punkt bereits nah beieinander sind, 
    // füge den ersten Punkt am Ende hinzu für perfekte Schließung
    const firstPoint = points[0];
    const lastPoint = points[points.length - 1];
    const distance = Math.sqrt(
        Math.pow(firstPoint.x - lastPoint.x, 2) + 
        Math.pow(firstPoint.y - lastPoint.y, 2)
    );
    
    // Wenn die Punkte nah genug beieinander sind (< 10 Pixel), 
    // schließe die Kurve direkt
    if (distance < 10) {
        result.push(firstPoint);
        return result;
    }
    
    // Ansonsten: Berechne eine glatte Verbindung zwischen erstem und letztem Punkt
    // Verwende eine einfache kubische Interpolation mit natürlichen Tangenten
    
    // Berechne natürliche Tangenten am Anfang und Ende
    const startTangent = new Point(
        points[1].x - points[0].x,
        points[1].y - points[0].y
    );
    const endTangent = new Point(
        points[points.length - 1].x - points[points.length - 2].x,
        points[points.length - 1].y - points[points.length - 2].y
    );
    
    // Normalisiere die Tangenten
    const startLength = Math.sqrt(startTangent.x * startTangent.x + startTangent.y * startTangent.y);
    const endLength = Math.sqrt(endTangent.x * endTangent.x + endTangent.y * endTangent.y);
    
    if (startLength > 0 && endLength > 0) {
        startTangent.x /= startLength;
        startTangent.y /= startLength;
        endTangent.x /= endLength;
        endTangent.y /= endLength;
        
        // Füge wenige, aber ausreichende Zwischenpunkte hinzu (maximal 8)
        const actualClosingPoints = Math.min(numClosingPoints, 8);
        
        for (let i = 1; i <= actualClosingPoints; i++) {
            const t = i / (actualClosingPoints + 1);
            
            // Einfache kubische Interpolation zwischen letztem und erstem Punkt
            // mit natürlichen Tangenten für glatte Übergänge
            const interpolatedPoint = hermiteInterpolate(
                lastPoint,           // Startpunkt (letzter gezeichneter Punkt)
                firstPoint,          // Endpunkt (erster gezeichneter Punkt)
                endTangent,          // Start-Tangente
                startTangent,        // End-Tangente
                t                    // Interpolationsparameter
            );
            
            result.push(interpolatedPoint);
        }
    }
    
    // Füge den ersten Punkt am Ende hinzu für perfekte Schließung
    result.push(firstPoint);
    
    return result;
}

// Neue erweiterte mathematische Funktionen
export function calculateHarmonics(fourierComponents: any[], count: number): any[] {
    if (fourierComponents.length === 0) return [];
    
    // Sortiere nach Amplitude und wähle die stärksten Harmonischen
    const sorted = [...fourierComponents].sort((a, b) => b.amplitude - a.amplitude);
    return sorted.slice(0, Math.min(count, sorted.length));
}

export function calculateFrequencySpectrum(fourierComponents: any[]): { freq: number; power: number }[] {
    return fourierComponents.map(component => ({
        freq: component.freq,
        power: component.amplitude * component.amplitude
    }));
}

export function calculatePhaseCorrelation(fourierComponents: any[]): number {
    if (fourierComponents.length < 2) return 0;
    
    let correlation = 0;
    for (let i = 0; i < fourierComponents.length - 1; i++) {
        const phaseDiff = Math.abs(fourierComponents[i].phase - fourierComponents[i + 1].phase);
        correlation += Math.cos(phaseDiff);
    }
    
    return correlation / (fourierComponents.length - 1);
}

export function applyEasing(value: number, easing: 'linear' | 'easeInOut' | 'bounce'): number {
    switch (easing) {
        case 'easeInOut':
            return value < 0.5 ? 2 * value * value : 1 - Math.pow(-2 * value + 2, 2) / 2;
        case 'bounce':
            if (value < 1 / 2.75) {
                return 7.5625 * value * value;
            } else if (value < 2 / 2.75) {
                return 7.5625 * (value -= 1.5 / 2.75) * value + 0.75;
            } else if (value < 2.5 / 2.75) {
                return 7.5625 * (value -= 2.25 / 2.75) * value + 0.9375;
            } else {
                return 7.5625 * (value -= 2.625 / 2.75) * value + 0.984375;
            }
        default:
            return value;
    }
}

export function createColorGradient(colors: string[], steps: number): string[] {
    const gradient: string[] = [];
    
    for (let i = 0; i < steps; i++) {
        const t = i / (steps - 1);
        const colorIndex = t * (colors.length - 1);
        const lowIndex = Math.floor(colorIndex);
        const highIndex = Math.min(lowIndex + 1, colors.length - 1);
        const localT = colorIndex - lowIndex;
        
        const lowColor = colors[lowIndex];
        const highColor = colors[highIndex];
        
        // Einfache Interpolation zwischen den Farben
        gradient.push(interpolateColor(lowColor, highColor, localT));
    }
    
    return gradient;
}

function interpolateColor(color1: string, color2: string, t: number): string {
    // Konvertiere Hex zu RGB
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);
    
    if (!rgb1 || !rgb2) return color1;
    
    const r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * t);
    const g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * t);
    const b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * t);
    
    return `rgb(${r}, ${g}, ${b})`;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}