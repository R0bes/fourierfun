import { Point } from './utils/Point';
import { calcEquidistantPoints, computeFourierDFT } from './utils/math-stuff';
import { ComponentColors, ComponentColorMode, GradientColors, ColorManager } from './utils/ColorPalette';

export interface FourierComponent {
    amplitude: number;
    phase: number;
    freq: number;
}

export class GenericMachine {
    public id: string;
    public name: string;
    public drawing: Point[] = [];
    public equidistantPoints: Point[] = [];
    public fourierComponents: FourierComponent[] = [];
    public fourierPath: Point[] = [];
    public fourierAnimation: { position: Point; angle: number; amplitude: number }[][] = [];
    
    // Animation properties
    public frequenciesAmount: number = 10;
    public animationSpeed: number = 5;
    public fourierAlpha: number = 0.8;
    public showCircles: boolean = true;
    public showAmplitudes: boolean = true;
    public showTrail: boolean = true;
    public trailLength: number = 100;
    public trailBrightness: number = 1.5;
    public lineThickness: number = 3;
    public samples: number = 1024;
    
    // Character Trail properties
    public showCharacterTrail: boolean = true;
    public characterTrailLength: number = 33;
    public characterTrailIntensity: number = 1.0;
    
    // Extended properties
    public showHarmonics: boolean = true;
    public harmonicsCount: number = 5;
    public showFrequencySpectrum: boolean = false;
    public spectrumHeight: number = 100;
    public showPhaseDiagram: boolean = false;
    public animationEasing: 'linear' | 'easeInOut' | 'bounce' = 'easeInOut';
    public colorGradient: boolean = true;
    public glowIntensity: number = 1.0;
    
    // Color management
    private colorManager: ColorManager;
    private componentColors: ComponentColors;
    private componentColorModes: ComponentColorMode;
    private gradientColors: GradientColors;
    
    // Animation state
    private animationSteps: number = 200;
    private currentAnimationStep: number = 0;
    private clock: number = 0;
    private centroid: Point = Point.Zero;
    private trail: Point[] = [];
    
    constructor(id: string, name: string) {
        this.id = id;
        this.name = name;
        this.colorManager = ColorManager.getInstance();
        this.componentColors = this.colorManager.getDefaultColors();
        this.componentColorModes = this.colorManager.getDefaultColorModes();
        this.gradientColors = this.colorManager.getDefaultGradientColors();
        
        // Initialize animation
        this.initializeAnimation();
    }
    
    private initializeAnimation(): void {
        this.animationSteps = 200;
        this.currentAnimationStep = 0;
        this.clock = 0;
        this.centroid = Point.Zero;
        this.trail = [];
    }
    
    // Color management methods
    getComponentColors(): ComponentColors {
        return this.colorManager.getColorsForMachine(this.id);
    }
    
    setComponentColor(component: keyof ComponentColors, color: string): void {
        this.colorManager.setComponentColor(this.id, component, color);
        this.componentColors = this.getComponentColors();
    }
    
    getColor(component: keyof ComponentColors): string {
        return this.componentColors[component];
    }
    
    // Fourier calculation
    calculateFourier(): void {
        if (this.drawing.length < 3) return;
        
        // Use the original drawing for Fourier analysis
        this.equidistantPoints = calcEquidistantPoints(this.drawing, this.samples);
        const allComponents = computeFourierDFT(this.equidistantPoints);
        
        // Limit to the specified number of frequencies (excluding DC component)
        // We show frequenciesAmount components, but the DC component (index 0) is not displayed
        this.fourierComponents = allComponents.slice(0, this.frequenciesAmount + 1);
        
        this.generateFourierPath();
        this.generateAnimation();
    }
    
    private calculateCentroid(points: Point[]): Point {
        if (points.length === 0) return Point.Zero;
        
        let sumX = 0, sumY = 0;
        for (const point of points) {
            sumX += point.x;
            sumY += point.y;
        }
        
        return new Point(sumX / points.length, sumY / points.length);
    }
    
    
    private generateFourierPath(): void {
        this.fourierPath = [];
        const steps = 500; // Mehr Schritte für glatteren Pfad
        
        for (let i = 0; i < steps; i++) {
            const t = (i / steps) * 2 * Math.PI;
            const point = this.calculateFourierPoint(t);
            this.fourierPath.push(point);
        }
        
        // Schließe den Pfad, indem der erste Punkt am Ende wiederholt wird
        if (this.fourierPath.length > 0) {
            this.fourierPath.push(this.fourierPath[0]);
        }
    }
    
    private calculateFourierPoint(t: number): Point {
        // Start from origin (0,0) - this is the correct Fourier calculation
        let x = 0;
        let y = 0;
        
        for (const component of this.fourierComponents) {
            const angle = component.freq * t + component.phase;
            x += component.amplitude * Math.cos(angle);
            y += component.amplitude * Math.sin(angle);
        }
        
        return new Point(x, y);
    }
    
    private generateAnimation(): void {
        this.fourierAnimation = [];
        const steps = this.animationSteps;
        
        for (let step = 0; step < steps; step++) {
            const t = (step / steps) * 2 * Math.PI;
            const frame: { position: Point; angle: number; amplitude: number }[] = [];
            
            // Start from origin (0,0) - this is the correct Fourier calculation
            let currentX = 0;
            let currentY = 0;
            
            for (const component of this.fourierComponents) {
                const angle = component.freq * t + component.phase;
                const x = currentX + component.amplitude * Math.cos(angle);
                const y = currentY + component.amplitude * Math.sin(angle);
                
                frame.push({
                    position: new Point(x, y),
                    angle: angle,
                    amplitude: component.amplitude
                });
                
                currentX = x;
                currentY = y;
            }
            
            this.fourierAnimation.push(frame);
        }
    }
    
    // Animation update
    update(): void {
        this.clock += this.animationSpeed * 0.01;
        this.currentAnimationStep = Math.floor(this.clock * 10) % this.animationSteps;
        
        // Update trail
        if (this.showTrail && this.fourierAnimation.length > 0) {
            const currentFrame = this.fourierAnimation[this.currentAnimationStep];
            if (currentFrame.length > 0) {
                const lastPoint = currentFrame[currentFrame.length - 1].position;
                this.trail.push(lastPoint);
                
                if (this.trail.length > this.trailLength) {
                    this.trail.shift();
                }
            }
        }
    }
    
    // Rendering methods
    render(context: CanvasRenderingContext2D): void {
        if (this.fourierAnimation.length === 0) return;
        
        const currentFrame = this.fourierAnimation[this.currentAnimationStep];
        if (currentFrame.length === 0) return;
        
        // Calculate time once per frame for rainbow animation
        const time = Date.now() * 0.001;
        
        // No coordinate transformation needed - canvas is now properly sized
        
        // Render circles (only if has valid color)
        if (this.showCircles && this.hasValidColor('circles')) {
            this.renderCircles(context, currentFrame, time);
        }
        
        // Render amplitudes (lines) (only if has valid color)
        if (this.showAmplitudes && this.hasValidColor('amplitudes')) {
            this.renderAmplitudes(context, currentFrame, time);
        }
        
        // Render path first (background) - always render path
        this.renderPath(context, time);
        
        // Render trail on top of path (only if has valid color)
        if (this.showTrail && this.hasValidColor('trail')) {
            this.renderTrail(context, time);
        }
        
        // Render original line (only if has valid color)
        if (this.hasValidColor('path')) {
            this.renderOriginalLine(context);
        }
    }
    
    private renderCircles(context: CanvasRenderingContext2D, frame: any[], time: number): void {
        context.save();
        context.globalAlpha = this.fourierAlpha;
        
        // Render all circles except DC component (index 0)
        for (let i = 1; i < frame.length; i++) {
            const current = frame[i];
            const color = this.getColorForComponent('circles', i, frame.length, time, 0); // Kreise: Offset 0
            
            // Render glow effect
            if (this.glowIntensity > 0) {
                context.shadowColor = color;
                context.shadowBlur = 15 * this.glowIntensity;
                context.strokeStyle = color;
                context.lineWidth = 4;
                context.globalAlpha = 0.6;
                
                context.beginPath();
                context.arc(current.position.x, current.position.y, current.amplitude, 0, 2 * Math.PI);
                context.stroke();
            }
            
            // Render main circle
            context.shadowBlur = 0;
            context.strokeStyle = color;
            context.lineWidth = 2;
            context.globalAlpha = this.fourierAlpha;
            
            context.beginPath();
            context.arc(current.position.x, current.position.y, current.amplitude, 0, 2 * Math.PI);
            context.stroke();
        }
        
        context.restore();
    }
    
    private renderAmplitudes(context: CanvasRenderingContext2D, frame: any[], time: number): void {
        context.save();
        context.globalAlpha = this.fourierAlpha;
        
        // Render all amplitude lines except DC component (index 0)
        for (let i = 1; i < frame.length; i++) {
            const current = frame[i];
            const previous = frame[i - 1];
            const color = this.getColorForComponent('amplitudes', i, frame.length, time, 1); // Amplituden: Offset 1
            
            // Render glow effect
            if (this.glowIntensity > 0) {
                context.shadowColor = color;
                context.shadowBlur = 12 * this.glowIntensity;
                context.strokeStyle = color;
                context.lineWidth = this.lineThickness + 2;
                context.globalAlpha = 0.6;
                
                context.beginPath();
                context.moveTo(previous.position.x, previous.position.y);
                context.lineTo(current.position.x, current.position.y);
                context.stroke();
            }
            
            // Render main line
            context.shadowBlur = 0;
            context.strokeStyle = color;
            context.lineWidth = this.lineThickness;
            context.globalAlpha = this.fourierAlpha;
            
            context.beginPath();
            context.moveTo(previous.position.x, previous.position.y);
            context.lineTo(current.position.x, current.position.y);
            context.stroke();
        }
        
        context.restore();
    }
    
    private renderTrail(context: CanvasRenderingContext2D, time: number): void {
        const colors = this.getComponentColors();
        
        context.save();
        
        // Render glow effect
        if (this.glowIntensity > 0) {
            context.shadowColor = colors.glow;
            context.shadowBlur = 40 * this.glowIntensity; // Intensiverer Glow
            context.strokeStyle = this.getColorForComponent('trail', 0, 1, time, 2); // Trail: Offset 2
            context.lineWidth = 8; // Dickere Linie für besseren Glow
            context.globalAlpha = 0.8 * this.fourierAlpha; // Höhere Alpha für intensiveren Glow
            
            context.beginPath();
            for (let i = 0; i < this.trail.length - 1; i++) {
                const alpha = (i / this.trail.length) * this.trailBrightness * this.fourierAlpha;
                context.globalAlpha = alpha * 0.6;
                
                context.moveTo(this.trail[i].x, this.trail[i].y);
                context.lineTo(this.trail[i + 1].x, this.trail[i + 1].y);
            }
            context.stroke();
        }
        
        // Render main trail
        context.shadowBlur = 0;
        context.strokeStyle = this.getColorForComponent('trail', 0, 1, time, 2); // Trail: Offset 2
        context.lineWidth = 4; // Dickere Hauptlinie
        
        for (let i = 0; i < this.trail.length - 1; i++) {
            const alpha = (i / this.trail.length) * this.trailBrightness * this.fourierAlpha;
            context.globalAlpha = alpha;
            
            context.beginPath();
            context.moveTo(this.trail[i].x, this.trail[i].y);
            context.lineTo(this.trail[i + 1].x, this.trail[i + 1].y);
            context.stroke();
        }
        
        context.restore();
    }
    
    private renderPath(context: CanvasRenderingContext2D, time: number): void {
        const colors = this.getComponentColors();
        
        // Path always renders (no color check)
        context.save();
        
        if (this.fourierPath.length > 1) {
            // Render glow effect
            if (this.glowIntensity > 0) {
                context.shadowColor = colors.glow;
                context.shadowBlur = 15 * this.glowIntensity;
            context.strokeStyle = this.getColorForComponent('path', 0, 1, time, 3); // Path: Offset 3
            context.lineWidth = this.lineThickness + 4;
            context.globalAlpha = 0.4 * this.fourierAlpha;
                
                context.beginPath();
                context.moveTo(this.fourierPath[0].x, this.fourierPath[0].y);
                
                for (let i = 1; i < this.fourierPath.length; i++) {
                    context.lineTo(this.fourierPath[i].x, this.fourierPath[i].y);
                }
                
                // Schließe den Pfad explizit
                context.closePath();
                context.stroke();
            }
            
            // Render main path
            context.shadowBlur = 0;
            context.strokeStyle = this.getColorForComponent('path', 0, 1, time, 3); // Path: Offset 3
            context.lineWidth = this.lineThickness;
            context.globalAlpha = 0.8 * this.fourierAlpha;
            
            context.beginPath();
            context.moveTo(this.fourierPath[0].x, this.fourierPath[0].y);
            
            for (let i = 1; i < this.fourierPath.length; i++) {
                context.lineTo(this.fourierPath[i].x, this.fourierPath[i].y);
            }
            
            // Schließe den Pfad explizit
            context.closePath();
            context.stroke();
        }
        
        context.restore();
    }
    
    private renderOriginalLine(context: CanvasRenderingContext2D): void {
        if (this.drawing.length < 2) return;
        
        const colors = this.getComponentColors();
        
        context.save();
        context.strokeStyle = colors.path;
        context.lineWidth = 2;
        context.globalAlpha = 0.5;
        context.setLineDash([5, 5]);
        
        context.beginPath();
        context.moveTo(this.drawing[0].x, this.drawing[0].y);
        
        for (let i = 1; i < this.drawing.length; i++) {
            context.lineTo(this.drawing[i].x, this.drawing[i].y);
        }
        
        context.stroke();
        context.restore();
    }
    
    // Drawing methods
    addPoint(point: Point): void {
        this.drawing.push(point);
    }
    
    clearDrawing(): void {
        this.drawing = [];
        this.equidistantPoints = [];
        this.fourierComponents = [];
        this.fourierPath = [];
        this.fourierAnimation = [];
        this.trail = [];
        this.initializeAnimation();
    }
    
    // Utility methods
    getCurrentDrawing(): Point[] {
        return [...this.drawing];
    }
    
    getFourierCoefficients(): FourierComponent[] {
        return [...this.fourierComponents];
    }
    
    hasDrawing(): boolean {
        return this.drawing.length > 0;
    }
    
    needsFourierCalculation(): boolean {
        return this.drawing.length >= 3 && this.fourierComponents.length === 0;
    }
    
    // Color Mode Methods
    setComponentColorMode(component: keyof ComponentColorMode, mode: 'solid' | 'random' | 'gradient'): void {
        this.colorManager.setComponentColorMode(this.id, component, mode);
        this.componentColorModes = this.colorManager.getColorModesForMachine(this.id);
    }
    
    getComponentColorMode(component: keyof ComponentColorMode): 'solid' | 'random' | 'gradient' {
        return this.componentColorModes[component];
    }
    
    setGradientColors(start: string, end: string): void {
        this.colorManager.setGradientColors(this.id, start, end);
        this.gradientColors = this.colorManager.getGradientColorsForMachine(this.id);
    }
    
    getGradientColors(): GradientColors {
        return this.gradientColors;
    }
    
    // Get color for component - simplified without modes
    getColorForComponent(component: keyof ComponentColors, index: number = 0, total: number = 1, time?: number, componentOffset?: number): string {
        const color = this.componentColors[component];
        
        // Handle special colors
        if (color === 'rainbow') {
            if (time !== undefined && componentOffset !== undefined) {
                return this.getAnimatedRainbowColor(index, total, time, componentOffset);
            }
            return this.getRainbowColor(index, total);
        }
        
        if (color === 'matching') {
            return this.getMatchingColor(index, total);
        }
        
        return color;
    }
    
    // Generate rainbow color based on index - optimized version
    private getRainbowColor(index: number, total: number): string {
        const baseHue = (index / Math.max(total - 1, 1)) * 360;
        return `hsl(${baseHue}, 100%, 50%)`;
    }
    
    // Generate animated rainbow color - called once per frame
    private getAnimatedRainbowColor(index: number, total: number, time: number, componentOffset: number = 0): string {
        const baseHue = (index / Math.max(total - 1, 1)) * 360;
        const componentHueOffset = componentOffset * 120; // 120 Grad Versatz pro Komponente
        const animatedHue = (baseHue + time * 60 + componentHueOffset) % 360;
        const lightness = 50 + Math.sin(time * 2 + index * 0.5 + componentOffset) * 10;
        return `hsl(${animatedHue}, 100%, ${lightness}%)`;
    }
    
    // Generate matching color for circles and amplitudes - same color for same frequency
    private getMatchingColor(index: number, total: number): string {
        // Use a deterministic random seed based on index for consistent colors
        const seed = index * 137.508; // Golden angle approximation
        const hue = (seed * 360) % 360;
        const saturation = 80 + (index % 3) * 10; // Vary saturation slightly
        const lightness = 50 + (index % 2) * 10; // Vary lightness slightly
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    }
    
    // Check if component has a valid color (not transparent/empty)
    hasValidColor(component: keyof ComponentColors): boolean {
        const color = this.componentColors[component];
        return color && color !== 'transparent' && color !== 'rgba(0,0,0,0)' && color !== '';
    }
    
    // Get current animation frame for dynamic spectrum
    getCurrentAnimationFrame(): { position: Point; angle: number; amplitude: number }[] | null {
        if (this.fourierAnimation.length === 0) return null;
        return this.fourierAnimation[this.currentAnimationStep] || null;
    }
    
    getMachineFormula(): string[] {
        // Return a more interesting formula with various characters
        const baseChars = this.name.split('').map(char => char.toUpperCase()).filter(char => /[A-Z0-9]/.test(char));
        
        // Add some mathematical and special characters for more variety
        const mathChars = ['+', '-', '*', '/', '=', 'π', '∑', '∫', '∞', 'α', 'β', 'γ', 'δ', 'ε', 'θ', 'λ', 'μ', 'σ', 'φ', 'ψ', 'ω'];
        const numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
        
        // Combine all characters
        return [...baseChars, ...mathChars, ...numbers];
    }
}
