import { Point } from './utils/Point';
import { calcEquidistantPoints, computeFourierDFT } from './utils/math-stuff';

export interface FourierComponent {
    amplitude: number;
    phase: number;
    freq: number;
}

export class FourierMachine {
    public id: string;
    public name: string;
    public drawing: Point[] = [];
    public equidistantPoints: Point[] = [];
    public fourierComponents: FourierComponent[] = [];
    public fourierPath: Point[] = [];
    public fourierAnimation: { position: Point; angle: number; amplitude: number }[][] = [];
    
    public frequenciesAmount: number = 10;
    public animationSpeed: number = 5;
    public fourierAlpha: number = 0.4;
    public showCircles: boolean = true;
    public showAmplitudes: boolean = true;
    public showTrail: boolean = true;
    public trailLength: number = 25;
    public trailBrightness: number = 0.8;
    public characterTrailLength: number = 33;
    public characterTrailIntensity: number = 1.0;
    public showOriginalLine: boolean = true;
    public showCharacterTrail: boolean = true;
    public lineThickness: number = 3;
    public samples: number = 1024;
    
    // Neue erweiterte Eigenschaften
    public showHarmonics: boolean = true;
    public harmonicsCount: number = 5;
    public showFrequencySpectrum: boolean = false;
    public spectrumHeight: number = 100;
    public showPhaseDiagram: boolean = false;
    public animationEasing: 'linear' | 'easeInOut' | 'bounce' = 'easeInOut';
    public colorGradient: boolean = true;
    public glowIntensity: number = 1.0;
    
    private animationSteps: number = 200;
    private currentAnimationStep: number = 0;
    private clock: number = 0;
    private centroid: Point = Point.Zero;
    private trail: Point[] = [];
    private machineColor: string;
    private machineGlowColor: string;
    private machineFormula: string[];
    private machineFormulaColors: string[];
    
    constructor(id: string, name: string) {
        this.id = id;
        this.name = name;
        this.setMachineColors();
        this.setMachineFormula();
    }
    
    private setMachineColors() {
        switch (this.id) {
            case 'A':
                this.machineColor = '#FF6B6B';      // Neon Rot
                this.machineGlowColor = '#FF4757';
                break;
            case 'B':
                this.machineColor = '#4ECDC4';      // Neon Türkis
                this.machineGlowColor = '#00D2D3';
                break;
            case 'C':
                this.machineColor = '#45B7D1';      // Neon Blau
                this.machineGlowColor = '#54A0FF';
                break;
            case 'D':
                this.machineColor = '#FCD34D';      // Neon Gelb
                this.machineGlowColor = '#F59E0B';
                break;
            case 'E':
                this.machineColor = '#A855F7';      // Neon Lila
                this.machineGlowColor = '#8B5CF6';
                break;
            default:
                this.machineColor = '#A55EEA';      // Neon Lila
                this.machineGlowColor = '#8B5CF6';
        }
    }
    
    private setMachineFormula() {
        switch (this.id) {
            case 'A':
                this.machineFormula = ['F', 'O', 'U', 'R', 'I', 'E', 'R'];
                this.machineFormulaColors = ['#FF6B6B', '#FF8E8E', '#FFB1B1', '#FFD4D4', '#FFE7E7', '#FFFAFA', '#FFFFFF'];
                break;
            case 'B':
                this.machineFormula = ['T', 'R', 'A', 'N', 'S', 'F', 'O', 'R', 'M'];
                this.machineFormulaColors = ['#4ECDC4', '#6ED7CF', '#8EE1DA', '#AEEBE5', '#CEF5F0', '#EEFFFB', '#FFFFFF'];
                break;
            case 'C':
                this.machineFormula = ['S', 'I', 'G', 'N', 'A', 'L'];
                this.machineFormulaColors = ['#45B7D1', '#6AC5D9', '#8FD3E1', '#B4E1E9', '#D9EFF1', '#FFFFFF'];
                break;
            case 'D':
                this.machineFormula = ['W', 'A', 'V', 'E'];
                this.machineFormulaColors = ['#FCD34D', '#FDE68A', '#FEF3C7', '#FFFBEB', '#FFFFFF'];
                break;
            case 'E':
                this.machineFormula = ['P', 'H', 'A', 'S', 'E'];
                this.machineFormulaColors = ['#A855F7', '#C084FC', '#D8B4FE', '#EDE9FE', '#FFFFFF'];
                break;
            default:
                this.machineFormula = ['M', 'A', 'T', 'H'];
                this.machineFormulaColors = ['#A55EEA', '#B97EF0', '#CD9EF6', '#E1BEFC', '#F5DEFE', '#FFFFFF'];
        }
    }
    
    public getMachineColor(): string {
        return this.machineColor;
    }
    
    public getMachineGlowColor(): string {
        return this.machineGlowColor;
    }
    
    public getCurrentAnimationStep(): number {
        return this.currentAnimationStep;
    }
    
    public getMachineFormula(): string[] {
        return this.machineFormula;
    }
    
    public getMachineFormulaColors(): string[] {
        return this.machineFormulaColors;
    }

    public addPoint(point: Point) {
        this.drawing.push(point);
    }
    
    public clear() {
        this.drawing = [];
        this.equidistantPoints = [];
        this.fourierComponents = [];
        this.fourierPath = [];
        this.fourierAnimation = [];
        this.currentAnimationStep = 0;
        this.trail = [];
    }
    
    public calculateFourier() {
        if (this.drawing.length < 3) return;
        
        // Berechne äquidistante Punkte mit samples-basierter Präzision
        const sampleCount = Math.max(this.frequenciesAmount * 4, this.samples / 4);
        this.equidistantPoints = calcEquidistantPoints(this.drawing, sampleCount);
        
        // Berechne Zentroid
        let sumX = 0, sumY = 0;
        for (const point of this.equidistantPoints) {
            sumX += point.x;
            sumY += point.y;
        }
        this.centroid = new Point(sumX / this.equidistantPoints.length, sumY / this.equidistantPoints.length);
        
        // Berechne Fourier-Koeffizienten mit samples-basierter Präzision
        this.fourierComponents = computeFourierDFT(this.equidistantPoints);
        
        // Erstelle Animation
        this.createAnimation();
    }
    
    private createAnimation() {
        this.fourierAnimation = [];
        
        for (let step = 0; step < this.animationSteps; step++) {
            const t = 1 - (step / this.animationSteps);
            let pos = new Point(0, 0);
            const stepData: { position: Point; angle: number; amplitude: number }[] = [];
            
            // Erste Position (Zentroid)
            stepData.push({
                position: this.centroid,
                angle: 0,
                amplitude: 0
            });
            
            // Berechne Position für jeden Frequenz-Koeffizienten
            for (let i = 0; i < this.frequenciesAmount; i++) {
                const comp = this.fourierComponents[i];
                const angle = comp.phase + 2 * Math.PI * comp.freq * t;
                const x = pos.x + comp.amplitude * Math.cos(angle);
                const y = pos.y + comp.amplitude * Math.sin(angle);
                
                stepData.push({
                    position: new Point(x, y),
                    angle: angle,
                    amplitude: comp.amplitude
                });
                
                pos = new Point(x, y);
            }
            
            this.fourierAnimation.push(stepData);
        }
    }
    
    public update() {
        // Animation-Update
        if (this.fourierAnimation.length > 0) {
            if ((this.clock += this.animationSpeed) > 10) {
                this.clock = 0;
                this.currentAnimationStep = (this.currentAnimationStep + 1) % this.animationSteps;
            }
            
            // Trail-Update
            const stepData = this.fourierAnimation[this.currentAnimationStep];
            if (stepData.length > 0) {
                const lastPos = stepData[stepData.length - 1].position;
                this.trail.push(lastPos);
                if (this.trail.length > this.trailLength) {
                    this.trail.shift();
                }
            }
        }
    }
    
    public render(context: CanvasRenderingContext2D) {
        if (this.fourierAnimation.length === 0) return;
        
        const stepData = this.fourierAnimation[this.currentAnimationStep];
        const count = Math.min(this.frequenciesAmount, stepData.length);
        
        context.save();
        context.globalAlpha = this.fourierAlpha;
        
        // Zeichne Trail
        if (this.showTrail && this.trail.length > 1) {
            context.strokeStyle = `${this.machineColor}`;
            context.lineWidth = this.lineThickness;
            context.lineCap = 'round';
            context.lineJoin = 'round';
            context.shadowColor = this.machineGlowColor;
            context.shadowBlur = 20;
            
            context.beginPath();
            context.moveTo(this.trail[0].x, this.trail[0].y);
            for (let i = 1; i < this.trail.length; i++) {
                context.lineTo(this.trail[i].x, this.trail[i].y);
            }
            context.stroke();
        }
        
        // Zeichne Kreise
        if (this.showCircles) {
            context.strokeStyle = this.machineColor;
            context.lineWidth = 2;
            context.shadowColor = this.machineGlowColor;
            context.shadowBlur = 15;
            
            // Erster Kreis um Zentroid
            if (count > 0) {
                const first = stepData[0];
                context.beginPath();
                context.arc(this.centroid.x, this.centroid.y, first.amplitude, 0, Math.PI * 2);
                context.stroke();
            }
            
            // Weitere Kreise
            for (let i = 1; i < count; i++) {
                const curr = stepData[i];
                const prev = stepData[i - 1];
                context.beginPath();
                context.arc(prev.position.x, prev.position.y, curr.amplitude, 0, Math.PI * 2);
                context.stroke();
            }
        }
        
        // Zeichne Amplituden-Linien
        if (this.showAmplitudes) {
            context.strokeStyle = this.machineColor;
            context.lineWidth = 3;
            context.shadowColor = this.machineGlowColor;
            context.shadowBlur = 15;
            
            // Erste Linie vom Zentroid
            if (count > 0) {
                const first = stepData[0];
                context.beginPath();
                context.moveTo(this.centroid.x, this.centroid.y);
                context.lineTo(first.position.x, first.position.y);
                context.stroke();
            }
            
            // Weitere Linien
            for (let i = 1; i < count; i++) {
                const curr = stepData[i];
                const prev = stepData[i - 1];
                context.beginPath();
                context.moveTo(prev.position.x, prev.position.y);
                context.lineTo(curr.position.x, curr.position.y);
                context.stroke();
            }
        }
        
        context.restore();
    }
    
    public renderOriginalLine(context: CanvasRenderingContext2D) {
        if (!this.showOriginalLine || this.drawing.length < 2) return;
        
        context.save();
        context.strokeStyle = this.machineColor;
        context.lineWidth = this.lineThickness;
        context.lineCap = 'round';
        context.lineJoin = 'round';
        context.globalAlpha = 0.6;
        context.shadowColor = this.machineGlowColor;
        context.shadowBlur = 10;
        
        // Verwende die glatten äquidistanten Punkte für die Darstellung, falls verfügbar
        const pointsToRender = this.equidistantPoints.length > 0 ? this.equidistantPoints : this.drawing;
        
        if (pointsToRender.length > 2) {
            // Zeichne glatte Kurve mit den äquidistanten Punkten
            context.beginPath();
            context.moveTo(pointsToRender[0].x, pointsToRender[0].y);
            
            // Verwende quadratische Kurven für glattere Übergänge
            for (let i = 1; i < pointsToRender.length - 1; i++) {
                const current = pointsToRender[i];
                const next = pointsToRender[i + 1];
                
                // Berechne Kontrollpunkt für glatte Kurve
                const controlX = (current.x + next.x) / 2;
                const controlY = (current.y + next.y) / 2;
                
                context.quadraticCurveTo(current.x, current.y, controlX, controlY);
            }
            
            // Schließe die Kurve glatt
            if (pointsToRender.length > 2) {
                const last = pointsToRender[pointsToRender.length - 1];
                const first = pointsToRender[0];
                const second = pointsToRender[1];
                
                // Kontrollpunkt für glatten Übergang
                const controlX = (last.x + first.x) / 2;
                const controlY = (last.y + first.y) / 2;
                
                context.quadraticCurveTo(last.x, last.y, controlX, controlY);
                context.quadraticCurveTo(first.x, first.y, second.x, second.y);
            }
        } else {
            // Fallback für einfache Linien
            context.beginPath();
            context.moveTo(pointsToRender[0].x, pointsToRender[0].y);
            for (let i = 1; i < pointsToRender.length; i++) {
                context.lineTo(pointsToRender[i].x, pointsToRender[i].y);
            }
            if (pointsToRender.length > 2) {
                context.lineTo(pointsToRender[0].x, pointsToRender[0].y);
            }
        }
        
        context.stroke();
        
        // Innerer Glow für extra Neon-Effekt
        context.lineWidth = Math.max(1, this.lineThickness / 2);
        context.shadowBlur = 15;
        context.strokeStyle = 'rgba(255,255,255,0.6)';
        context.stroke();
        
        context.restore();
    }
    
    public renderFormula(context: CanvasRenderingContext2D, gridDimension: Point, cellSize: number) {
        if (!this.machineFormula || this.machineFormula.length === 0 || !this.showCharacterTrail) return;
        
        context.save();
        context.globalAlpha = 0.3 * this.characterTrailIntensity;
        
        const formulaLength = Math.min(this.machineFormula.length, this.characterTrailLength);
        const startX = Math.floor(gridDimension.x / 2) - Math.floor(formulaLength / 2);
        const startY = Math.floor(gridDimension.y / 2);
        
        for (let i = 0; i < formulaLength; i++) {
            const x = startX + i;
            const y = startY;
            
            if (x >= 0 && x < gridDimension.x && y >= 0 && y < gridDimension.y) {
                const char = this.machineFormula[i];
                const color = this.machineFormulaColors[i] || this.machineColor;
                
                context.fillStyle = color;
                context.font = `bold ${cellSize * 0.8}px Arial`;
                context.textAlign = 'center';
                context.textBaseline = 'middle';
                context.shadowColor = this.machineGlowColor;
                context.shadowBlur = 10 * this.characterTrailIntensity;
                
                const pixelX = x * cellSize + cellSize / 2;
                const pixelY = y * cellSize + cellSize / 2;
                
                context.fillText(char, pixelX, pixelY);
            }
        }
        
        context.restore();
    }
    
    public renderFrequencySpectrum(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) {
        if (!this.showFrequencySpectrum || this.fourierComponents.length === 0) return;
        
        context.save();
        context.fillStyle = 'rgba(0,0,0,0.7)';
        context.fillRect(x, y, width, height);
        
        // Zeichne Frequenzbalken
        const barWidth = width / this.fourierComponents.length;
        const maxAmplitude = Math.max(...this.fourierComponents.map(c => c.amplitude));
        
        for (let i = 0; i < this.fourierComponents.length; i++) {
            const component = this.fourierComponents[i];
            const barHeight = (component.amplitude / maxAmplitude) * height * 0.8;
            const barX = x + i * barWidth;
            const barY = y + height - barHeight;
            
            // Farbverlauf basierend auf Frequenz
            const hue = (i / this.fourierComponents.length) * 360;
            context.fillStyle = `hsl(${hue}, 70%, 60%)`;
            
            context.fillRect(barX + 2, barY, barWidth - 4, barHeight);
            
            // Frequenz-Label
            context.fillStyle = 'white';
            context.font = '10px Arial';
            context.textAlign = 'center';
            context.fillText(`${component.freq.toFixed(1)}`, barX + barWidth/2, y + height - 5);
        }
        
        context.restore();
    }
    
    public renderHarmonics(context: CanvasRenderingContext2D) {
        if (!this.showHarmonics || this.fourierComponents.length === 0) return;
        
        context.save();
        context.globalAlpha = 0.3;
        context.lineWidth = 1;
        
        // Zeichne Harmonische als zusätzliche Kreise
        for (let i = 0; i < Math.min(this.harmonicsCount, this.fourierComponents.length); i++) {
            const component = this.fourierComponents[i];
            const radius = component.amplitude * 0.5;
            
            context.strokeStyle = this.machineColor;
            context.setLineDash([5, 5]);
            
            // Zeichne harmonische Kreise um den aktuellen Punkt
            if (this.fourierAnimation.length > 0 && this.fourierAnimation[this.currentAnimationStep]) {
                const currentPos = this.fourierAnimation[this.currentAnimationStep][i]?.position;
                if (currentPos) {
                    context.beginPath();
                    context.arc(currentPos.x, currentPos.y, radius, 0, 2 * Math.PI);
                    context.stroke();
                }
            }
        }
        
        context.setLineDash([]);
        context.restore();
    }
    
    public renderPhaseDiagram(context: CanvasRenderingContext2D, x: number, y: number, size: number) {
        if (!this.showPhaseDiagram || this.fourierComponents.length === 0) return;
        
        context.save();
        context.fillStyle = 'rgba(0,0,0,0.7)';
        context.fillRect(x, y, size, size);
        
        const centerX = x + size / 2;
        const centerY = y + size / 2;
        const maxRadius = size / 3;
        
        // Zeichne Phasenkreise
        for (let i = 0; i < this.fourierComponents.length; i++) {
            const component = this.fourierComponents[i];
            const radius = (component.amplitude / Math.max(...this.fourierComponents.map(c => c.amplitude))) * maxRadius;
            const angle = component.phase;
            
            const pointX = centerX + Math.cos(angle) * radius;
            const pointY = centerY + Math.sin(angle) * radius;
            
            // Phasenpunkt
            context.fillStyle = this.machineColor;
            context.beginPath();
            context.arc(pointX, pointY, 3, 0, 2 * Math.PI);
            context.fill();
            
            // Verbindungslinie zum Zentrum
            context.strokeStyle = this.machineColor;
            context.lineWidth = 1;
            context.beginPath();
            context.moveTo(centerX, centerY);
            context.lineTo(pointX, pointY);
            context.stroke();
        }
        
        context.restore();
    }
}
