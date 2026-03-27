import { GenericMachine } from './GenericMachine';
import { Point } from './utils/Point';
import { ColorManager, NEON_COLORS } from './utils/ColorPalette';
import { Grid } from './Grid';

export class GenericMultiMachine {
    private machines: GenericMachine[] = [];
    private activeMachine: GenericMachine | null = null;
    private isDrawing: boolean = false;
    private currentDrawing: Point[] = [];
    private nextMachineId: number = 1;
    
    // Grid properties
    private cellSize: number = 20;
    private showGrid: boolean = true;
    private imageThreshold: number = 128;
    private gridDimension: Point;
    private textDimension: Point;
    private textPaddingDimension: Point;
    private gridChars: string[][];
    private heat: number[][];
    private fourierFormula: string[] = [];
    private fourierFormulaColors: string[] = [];
    private backgroundClock: number = 0;
    
    // Additional properties
    private showCharTrail: boolean = true;
    private characterTrailLength: number = 33;
    private characterTrailIntensity: number = 1.0;
    private lineThickness: number = 3;
    private samples: number = 1024;
    
    // Extended Grid properties
    private showFrequencySpectrum: boolean = true; // Standardmäßig anzeigen
    private showPhaseDiagram: boolean = true; // Standardmäßig anzeigen
    /** Master toggle: both canvas panels (spectrum + phase row) */
    public fourierPanelsExpanded: boolean = true;
    private showHarmonics: boolean = true;
    /** Top row: spectrum left, phase right (aligned heights) */
    private spectrumPosition: Point = new Point(16, 16);
    private phaseDiagramPosition: Point = new Point(308, 16);
    private spectrumSize: Point = new Point(280, 110);
    private phaseDiagramSize: number = 110;
    
    // Grid instance
    private grid: Grid;
    
    // Recording properties
    private isRecording: boolean = false;
    private recordingFrames: string[] = [];
    private recordingDuration: number = 5000; // 5 seconds default
    private recordingStartTime: number = 0;
    private recordingFrameRate: number = 30; // 30 FPS
    private recordingFrameInterval: number = 1000 / 30; // ~33ms
    private lastRecordingFrame: number = 0;
    
    constructor() {
        // Create initial machine
        this.createMachine('Machine 1');
        this.setActiveMachine(this.machines[0].id);
        
        // Initialize grid
        this.initializeGrid();
        
        // Initialize grid instance
        const canvas = document.getElementById('canvas') as HTMLCanvasElement;
        if (canvas) {
            this.grid = new Grid(canvas.width, canvas.height, this.cellSize);
        }
    }
    
    private initializeGrid(): void {
        this.gridDimension = new Point(0, 0);
        this.textDimension = new Point(0, 0);
        this.textPaddingDimension = new Point(0, 0);
        this.gridChars = [];
        this.heat = [];
    }
    
    // Machine management
    createMachine(name?: string): GenericMachine {
        const id = `machine_${this.nextMachineId++}`;
        const machineName = name || `Machine ${this.nextMachineId}`;
        const machine = new GenericMachine(id, machineName);
        
        this.machines.push(machine);
        
        // Set random solid colors from NEON_COLORS (no rainbow), alpha 1
        const pickRandom = () => NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)];
        const c1 = pickRandom(), c2 = pickRandom(), c3 = pickRandom(), c4 = pickRandom(), c5 = pickRandom(), cGlow = pickRandom();
        machine.setComponentColor('circles', c1.hex);
        machine.setComponentColor('amplitudes', c2.hex);
        machine.setComponentColor('trail', c3.hex);
        machine.setComponentColor('path', c4.hex);
        machine.setComponentColor('drawn', c5.hex);
        machine.setComponentColor('glow', cGlow.glow);
        machine.setComponentAlphas({ circles: 1, amplitudes: 1, trail: 1, path: 1, drawn: 1, glow: 1 });
        return machine;
    }
    
    removeMachine(machineId: string): boolean {
        const index = this.machines.findIndex(m => m.id === machineId);
        if (index === -1) return false;
        
        // If removing active machine, switch to another
        if (this.activeMachine?.id === machineId) {
            this.machines.splice(index, 1);
            if (this.machines.length > 0) {
                this.setActiveMachine(this.machines[0].id);
            } else {
                this.activeMachine = null;
            }
        } else {
            this.machines.splice(index, 1);
        }
        
        return true;
    }
    
    setActiveMachine(machineId: string): boolean {
        const machine = this.machines.find(m => m.id === machineId);
        if (!machine) return false;
        
        this.activeMachine = machine;
        return true;
    }
    
    getActiveMachine(): GenericMachine | null {
        return this.activeMachine;
    }
    
    getAllMachines(): GenericMachine[] {
        return [...this.machines];
    }
    
    getMachine(machineId: string): GenericMachine | null {
        return this.machines.find(m => m.id === machineId) || null;
    }
    
    // Drawing methods
    startDrawing(x: number, y: number): void {
        if (!this.activeMachine) return;
        
        this.isDrawing = true;
        this.currentDrawing = [];
        this.activeMachine.clearDrawing();
        
        const point = new Point(x, y);
        this.activeMachine.addPoint(point);
        this.currentDrawing.push(point);
    }
    
    continueDrawing(x: number, y: number): void {
        if (!this.isDrawing || !this.activeMachine) return;
        
        const point = new Point(x, y);
        this.activeMachine.addPoint(point);
        this.currentDrawing.push(point);
    }
    
    finishDrawing(): void {
        if (!this.isDrawing || !this.activeMachine) return;
        
        this.isDrawing = false;
        
        if (this.activeMachine.needsFourierCalculation()) {
            this.activeMachine.calculateFourier();
        }
    }
    
    
    // Color management
    setMachineComponentColor(machineId: string, component: 'circles' | 'amplitudes' | 'trail' | 'path' | 'drawn' | 'glow', color: string): boolean {
        const machine = this.getMachine(machineId);
        if (!machine) return false;
        
        machine.setComponentColor(component, color);
        return true;
    }
    
    getMachineComponentColors(machineId: string) {
        const machine = this.getMachine(machineId);
        return machine ? machine.getComponentColors() : null;
    }

    setMachineComponentAlpha(machineId: string, component: 'circles' | 'amplitudes' | 'trail' | 'path' | 'drawn' | 'glow', alpha: number): boolean {
        const machine = this.getMachine(machineId);
        if (!machine) return false;
        machine.setComponentAlpha(component, alpha);
        return true;
    }

    getMachineComponentAlphas(machineId: string) {
        const machine = this.getMachine(machineId);
        return machine ? machine.getComponentAlphas() : null;
    }
    
    
    setSamplesForAllMachines(samples: number): void {
        this.samples = samples;
        this.machines.forEach(machine => {
            machine.samples = samples;
            if (machine.hasDrawing()) {
                machine.calculateFourier();
            }
        });
    }
    
    // Clear methods
    clearAllMachines(): void {
        this.machines = [];
        this.activeMachine = null;
        this.nextMachineId = 1;
        this.currentDrawing = [];
        this.isDrawing = false;
    }
    
    clearActiveMachine(): void {
        if (this.activeMachine) {
            this.activeMachine.clearDrawing();
        }
    }
    
    // Update and render
    update(): void {
        this.machines.forEach(machine => machine.update());
        this.backgroundClock += 0.01;
        
        // Handle recording
        if (this.isRecording) {
            const currentTime = Date.now();
            if (currentTime - this.lastRecordingFrame >= this.recordingFrameInterval) {
                this.captureFrame();
                this.lastRecordingFrame = currentTime;
                
                // Check if recording duration is reached
                if (currentTime - this.recordingStartTime >= this.recordingDuration) {
                    this.stopRecording();
                }
            }
        }
    }
    
    render(context: CanvasRenderingContext2D): void {
        // Clear canvas
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
        
        // Render cyberpunk frame
        this.renderCyberpunkFrame(context);
        
        // Render grid if enabled
        if (this.showGrid && this.grid) {
            this.grid.update(0.016); // 60 FPS
            this.grid.render(context);
        }
        
        // Render all machines
        this.machines.forEach(machine => {
            machine.render(context);
        });
        
        // Render additional visualizations (side-by-side top row when expanded)
        if (this.fourierPanelsExpanded) {
            if (this.showFrequencySpectrum) {
                this.renderFrequencySpectrum(context);
            }
            if (this.showPhaseDiagram) {
                this.renderPhaseDiagram(context);
            }
        }
        
        // Render character trails
        if (this.showCharTrail) {
            this.renderCharacterTrails(context);
        }
        
        // Render current drawing
        if (this.isDrawing && this.currentDrawing.length > 1) {
            this.renderCurrentDrawing(context);
        }
    }
    
    private renderGrid(context: CanvasRenderingContext2D): void {
        context.save();
        context.strokeStyle = 'rgba(168, 85, 247, 0.1)';
        context.lineWidth = 1;
        
        const width = context.canvas.width;
        const height = context.canvas.height;
        
        // Vertical lines
        for (let x = 0; x <= width; x += this.cellSize) {
            context.beginPath();
            context.moveTo(x, 0);
            context.lineTo(x, height);
            context.stroke();
        }
        
        // Horizontal lines
        for (let y = 0; y <= height; y += this.cellSize) {
            context.beginPath();
            context.moveTo(0, y);
            context.lineTo(width, y);
            context.stroke();
        }
        
        context.restore();
    }
    
    private renderFrequencySpectrum(context: CanvasRenderingContext2D): void {
        if (!this.activeMachine || this.activeMachine.getFourierCoefficients().length === 0) return;
        
        context.save();
        
        // Background
        context.fillStyle = 'rgba(0, 0, 0, 0.8)';
        context.fillRect(this.spectrumPosition.x, this.spectrumPosition.y, this.spectrumSize.x, this.spectrumSize.y);
        
        // Border
        context.strokeStyle = this.activeMachine.getColor('path');
        context.lineWidth = 2;
        context.strokeRect(this.spectrumPosition.x, this.spectrumPosition.y, this.spectrumSize.x, this.spectrumSize.y);

        const colors = this.activeMachine.getComponentColors();
        context.fillStyle = colors.path;
        context.font = '11px monospace';
        context.textAlign = 'left';
        context.globalAlpha = 0.95;
        context.fillText('Spectrum', this.spectrumPosition.x + 6, this.spectrumPosition.y + 14);
        
        // Use current animation frame for dynamic spectrum
        const currentFrame = this.activeMachine.getCurrentAnimationFrame();
        if (!currentFrame || currentFrame.length === 0) {
            context.restore();
            return;
        }
        
        // Calculate current amplitudes from animation frame (skip DC component)
        const nonDCFrame = currentFrame.slice(1); // Skip DC component (index 0)
        const currentAmplitudes = nonDCFrame.map(frame => frame.amplitude);
        const maxAmplitude = Math.max(...currentAmplitudes);
        const barWidth = this.spectrumSize.x / currentAmplitudes.length;
        const chartBottomPad = 6;
        const chartTopPad = 22;
        const chartHeight = this.spectrumSize.y - chartTopPad - chartBottomPad;
        
        for (let i = 0; i < currentAmplitudes.length; i++) {
            const amplitude = currentAmplitudes[i];
            const barHeight = maxAmplitude > 0 ? (amplitude / maxAmplitude) * chartHeight : 0;
            
            const x = this.spectrumPosition.x + i * barWidth + 2;
            const y = this.spectrumPosition.y + this.spectrumSize.y - chartBottomPad - barHeight;
            const width = barWidth - 4;
            
            // Get color for this frequency bar (with time for animation)
            const time = Date.now() * 0.001;
            const barColor = this.activeMachine.getColorForComponent('circles', i, currentAmplitudes.length, time, 0);
            
            // Glow effect
            if (this.activeMachine.showGlow) {
                context.shadowColor = colors.glow;
                context.shadowBlur = 8;
                context.fillStyle = barColor;
                context.globalAlpha = 0.7;
                
                context.fillRect(x, y, width, barHeight);
            }
            
            // Main bar
            context.shadowBlur = 0;
            context.fillStyle = barColor;
            context.globalAlpha = 0.9;
            
            context.fillRect(x, y, width, barHeight);
            
            // Frequency label (every 5th bar)
            if (i % 5 === 0) {
                context.fillStyle = colors.path;
                context.font = '10px monospace';
                context.textAlign = 'center';
                context.fillText(i.toString(), x + width/2, this.spectrumPosition.y + this.spectrumSize.y - 2);
            }
        }
        
        context.restore();
    }
    
    private renderPhaseDiagram(context: CanvasRenderingContext2D): void {
        if (!this.activeMachine || this.activeMachine.getFourierCoefficients().length === 0) return;
        
        context.save();
        
        // Background
        context.fillStyle = 'rgba(0, 0, 0, 0.7)';
        context.fillRect(this.phaseDiagramPosition.x, this.phaseDiagramPosition.y, this.phaseDiagramSize, this.phaseDiagramSize);

        const colors = this.activeMachine.getComponentColors();
        context.fillStyle = colors.path;
        context.font = '11px monospace';
        context.textAlign = 'left';
        context.globalAlpha = 0.95;
        context.fillText('Phase', this.phaseDiagramPosition.x + 6, this.phaseDiagramPosition.y + 14);
        
        const centerX = this.phaseDiagramPosition.x + this.phaseDiagramSize / 2;
        const centerY = this.phaseDiagramPosition.y + this.phaseDiagramSize / 2;
        const radius = this.phaseDiagramSize / 2 - 10;
        
        // Draw phase vectors using current animation frame
        const currentFrame = this.activeMachine.getCurrentAnimationFrame();
        if (!currentFrame || currentFrame.length === 0) {
            context.restore();
            return;
        }
        
        const components = this.activeMachine.getFourierCoefficients();
        
        // Skip DC component (index 0) and normalize the rest
        const nonDCFrame = currentFrame.slice(1); // Remove DC component
        const maxNonDCAmplitude = Math.max(...nonDCFrame.map(f => f.amplitude));
        
        for (let i = 1; i < currentFrame.length; i++) { // Start from 1, show all non-DC components
            const frameData = currentFrame[i];
            const component = components[i];
            const angle = frameData.angle; // Use current animation angle
            const length = (frameData.amplitude / maxNonDCAmplitude) * radius * 0.8; // Normalize to non-DC max
            
            const endX = centerX + Math.cos(angle) * length;
            const endY = centerY + Math.sin(angle) * length;
            
            // Get color for this phase vector (with time for animation)
            const time = Date.now() * 0.001;
            const vectorColor = this.activeMachine.getColorForComponent('circles', i, currentFrame.length, time, 0);
            
            // Glow effect
            if (this.activeMachine.showGlow) {
                context.shadowColor = colors.glow;
                context.shadowBlur = 10;
                context.strokeStyle = vectorColor;
                context.lineWidth = 4;
                context.globalAlpha = 0.6;
                
                context.beginPath();
                context.moveTo(centerX, centerY);
                context.lineTo(endX, endY);
                context.stroke();
            }
            
            // Main line
            context.shadowBlur = 0;
            context.strokeStyle = vectorColor;
            context.lineWidth = 2;
            context.globalAlpha = 0.8;
            
            context.beginPath();
            context.moveTo(centerX, centerY);
            context.lineTo(endX, endY);
            context.stroke();
            
            // End point
            context.fillStyle = vectorColor;
            context.beginPath();
            context.arc(endX, endY, 3, 0, 2 * Math.PI);
            context.fill();
        }
        
        // Circle outline
        context.strokeStyle = colors.path;
        context.lineWidth = 2;
        context.globalAlpha = 0.5;
        context.beginPath();
        context.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        context.stroke();
        
        context.restore();
    }
    
    // Resize handling
    handleResize(): void {
        // Handle canvas resize if needed
    }
    
    // Image processing: load image, threshold to points, map to canvas (fit aspect ratio), limit points
    async processImageUpload(file: File): Promise<void> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    if (!ctx) {
                        reject(new Error('Could not get canvas context'));
                        return;
                    }
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);
                    let data: Uint8ClampedArray;
                    try {
                        data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
                    } catch (err) {
                        reject(new Error('Bild konnte nicht ausgelesen werden (z. B. CORS). Bitte anderes Bild wählen.'));
                        return;
                    }
                    const threshold = this.imageThreshold ?? 128;
                    const points: Point[] = [];
                    const sampleRate = Math.max(1, Math.min(4, Math.floor(256 / Math.max(1, threshold))));
                    for (let y = 0; y < canvas.height; y += sampleRate) {
                        for (let x = 0; x < canvas.width; x += sampleRate) {
                            const idx = (y * canvas.width + x) * 4;
                            const a = data[idx + 3];
                            if (a < 128) continue;
                            const gray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
                            if (gray < threshold) {
                                points.push(new Point(x, y));
                            }
                        }
                    }
                    if (points.length < 3) {
                        reject(new Error('Nicht genug dunkle Pixel im Bild. Bild-Schwelle anpassen oder Bild mit klaren Linien verwenden.'));
                        return;
                    }
                    const mainCanvas = document.getElementById('canvas') as HTMLCanvasElement;
                    const targetWidth = mainCanvas ? mainCanvas.width : window.innerWidth - 320;
                    const targetHeight = mainCanvas ? mainCanvas.height : window.innerHeight;
                    const scale = Math.min(targetWidth / canvas.width, targetHeight / canvas.height);
                    const offsetX = (targetWidth - canvas.width * scale) / 2;
                    const offsetY = (targetHeight - canvas.height * scale) / 2;
                    const maxPoints = 4000;
                    const step = points.length <= maxPoints ? 1 : Math.ceil(points.length / maxPoints);
                    const mapped: Point[] = [];
                    for (let i = 0; i < points.length; i += step) {
                        const p = points[i];
                        mapped.push(new Point(
                            offsetX + (p.x / canvas.width) * canvas.width * scale,
                            offsetY + (p.y / canvas.height) * canvas.height * scale
                        ));
                    }
                    const activeMachine = this.getActiveMachine();
                    if (!activeMachine) {
                        reject(new Error('Keine aktive Maschine. Bitte eine Maschine auswählen.'));
                        return;
                    }
                    activeMachine.clearDrawing();
                    for (const point of mapped) {
                        activeMachine.addPoint(point);
                    }
                    activeMachine.calculateFourier();
                    console.log(`Bild verarbeitet: ${mapped.length} Punkte (von ${points.length} gefunden)`);
                    resolve();
                };
                img.onerror = () => reject(new Error('Fehler beim Laden des Bildes'));
                img.src = e.target?.result as string;
            };
            reader.onerror = () => reject(new Error('Fehler beim Lesen der Datei'));
            reader.readAsDataURL(file);
        });
    }
    
    // Recording methods
    startRecording(duration: number = 5000): void {
        if (this.isRecording) return;
        
        this.isRecording = true;
        this.recordingFrames = [];
        this.recordingDuration = duration;
        this.recordingStartTime = Date.now();
        this.lastRecordingFrame = 0;
        
        console.log(`🎬 Recording gestartet für ${duration}ms`);
    }
    
    stopRecording(): void {
        if (!this.isRecording) return;
        
        this.isRecording = false;
        console.log(`🎬 Recording beendet. ${this.recordingFrames.length} Frames aufgenommen.`);
        
        // Export as GIF
        this.exportAsGIF();
    }
    
    private captureFrame(): void {
        const canvas = document.getElementById('canvas') as HTMLCanvasElement;
        if (!canvas) return;
        
        const frameData = canvas.toDataURL('image/png');
        this.recordingFrames.push(frameData);
    }
    
    private async exportAsGIF(): Promise<void> {
        if (this.recordingFrames.length === 0) return;
        
        try {
            // Create a simple animated GIF using canvas
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            
            // Set canvas size
            const originalCanvas = document.getElementById('canvas') as HTMLCanvasElement;
            if (!originalCanvas) return;
            
            canvas.width = originalCanvas.width;
            canvas.height = originalCanvas.height;
            
            // Create frames
            const frames: ImageData[] = [];
            for (const frameData of this.recordingFrames) {
                const img = new Image();
                await new Promise((resolve) => {
                    img.onload = () => {
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                        ctx.drawImage(img, 0, 0);
                        frames.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
                        resolve(void 0);
                    };
                    img.src = frameData;
                });
            }
            
            // For now, just download the first frame as PNG
            // TODO: Implement proper GIF creation
            const link = document.createElement('a');
            link.download = `fourier-animation-${Date.now()}.png`;
            link.href = this.recordingFrames[0];
            link.click();
            
            console.log(`✅ Animation exportiert: ${this.recordingFrames.length} Frames`);
            
        } catch (error) {
            console.error('❌ Fehler beim Exportieren der Animation:', error);
        }
    }
    
    isCurrentlyRecording(): boolean {
        return this.isRecording;
    }
    
    getRecordingProgress(): number {
        if (!this.isRecording) return 0;
        const elapsed = Date.now() - this.recordingStartTime;
        return Math.min(elapsed / this.recordingDuration, 1);
    }

    // Utility methods
    getMachineCount(): number {
        return this.machines.length;
    }
    
    // Grid property methods
    setGridProperty(property: string, value: any): void {
        switch (property) {
            case 'showGrid':
                this.showGrid = value;
                if (this.grid) {
                    this.grid.setShowGrid(value);
                }
                break;
            case 'rainbowMode':
                if (this.grid) {
                    this.grid.setRainbowMode(value);
                }
                break;
            case 'particleSystem':
                if (this.grid) {
                    this.grid.setParticleSystem(value);
                }
                break;
            case 'cellSize':
                this.cellSize = value;
                if (this.grid) {
                    this.grid.setCellSize(value);
                }
                break;
            case 'cell':
                // Handle cell styling if needed
                break;
            case 'imageThreshold':
                this.imageThreshold = value;
                break;
            case 'showFrequencySpectrum':
                this.showFrequencySpectrum = value;
                break;
            case 'showPhaseDiagram':
                this.showPhaseDiagram = value;
                break;
            case 'fourierPanelsExpanded':
                this.fourierPanelsExpanded = value;
                break;
            case 'showCharTrail':
                this.showCharTrail = value;
                break;
            case 'characterTrailLength':
                this.characterTrailLength = value;
                break;
            case 'characterTrailIntensity':
                this.characterTrailIntensity = value;
                break;
        }
    }
    
    getActiveMachineId(): string | null {
        return this.activeMachine?.id || null;
    }
    
    // Machine management methods
    renameMachine(machineId: string, newName: string): boolean {
        const machine = this.getMachine(machineId);
        if (!machine) return false;
        
        machine.name = newName;
        return true;
    }
    
    deleteMachine(machineId: string): boolean {
        const index = this.machines.findIndex(m => m.id === machineId);
        if (index === -1) return false;
        
        // If deleting the active machine, switch to another one
        if (this.activeMachine?.id === machineId) {
            this.machines.splice(index, 1);
            if (this.machines.length > 0) {
                this.activeMachine = this.machines[0];
            } else {
                this.activeMachine = null;
            }
        } else {
            this.machines.splice(index, 1);
        }
        
        return true;
    }
    
    
    getActiveMachineName(): string | null {
        return this.activeMachine?.name || null;
    }
    
    private renderCurrentDrawing(context: CanvasRenderingContext2D): void {
        if (this.currentDrawing.length < 2) return;
        
        context.save();
        context.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        context.lineWidth = 2;
        context.lineCap = 'round';
        context.lineJoin = 'round';
        
        context.beginPath();
        context.moveTo(this.currentDrawing[0].x, this.currentDrawing[0].y);
        
        for (let i = 1; i < this.currentDrawing.length; i++) {
            context.lineTo(this.currentDrawing[i].x, this.currentDrawing[i].y);
        }
        
        context.stroke();
        context.restore();
    }
    
    private renderCyberpunkFrame(context: CanvasRenderingContext2D): void {
        const canvas = context.canvas;
        const width = canvas.width;
        const height = canvas.height;
        const margin = 20;
        const cornerSize = 30;
        const glowIntensity = 0.8;
        
        context.save();
        
        // Outer glow effect
        context.shadowColor = '#00FFFF';
        context.shadowBlur = 20;
        context.strokeStyle = 'rgba(0, 255, 255, 0.3)';
        context.lineWidth = 3;
        
        // Draw outer frame
        context.beginPath();
        context.rect(margin, margin, width - 2 * margin, height - 2 * margin);
        context.stroke();
        
        // Inner frame with different color
        context.shadowColor = '#FF00FF';
        context.shadowBlur = 15;
        context.strokeStyle = 'rgba(255, 0, 255, 0.4)';
        context.lineWidth = 2;
        
        context.beginPath();
        context.rect(margin + 5, margin + 5, width - 2 * margin - 10, height - 2 * margin - 10);
        context.stroke();
        
        // Corner decorations
        context.shadowBlur = 10;
        context.strokeStyle = 'rgba(0, 255, 255, 0.8)';
        context.lineWidth = 2;
        
        // Top-left corner
        context.beginPath();
        context.moveTo(margin, margin + cornerSize);
        context.lineTo(margin, margin);
        context.lineTo(margin + cornerSize, margin);
        context.stroke();
        
        // Top-right corner
        context.beginPath();
        context.moveTo(width - margin - cornerSize, margin);
        context.lineTo(width - margin, margin);
        context.lineTo(width - margin, margin + cornerSize);
        context.stroke();
        
        // Bottom-left corner
        context.beginPath();
        context.moveTo(margin, height - margin - cornerSize);
        context.lineTo(margin, height - margin);
        context.lineTo(margin + cornerSize, height - margin);
        context.stroke();
        
        // Bottom-right corner
        context.beginPath();
        context.moveTo(width - margin - cornerSize, height - margin);
        context.lineTo(width - margin, height - margin);
        context.lineTo(width - margin, height - margin - cornerSize);
        context.stroke();
        
        // Animated corner dots
        const time = Date.now() * 0.001;
        const dotSize = 4;
        const dotGlow = Math.sin(time * 2) * 0.5 + 0.5;
        
        context.shadowColor = '#00FF00';
        context.shadowBlur = 8 * dotGlow;
        context.fillStyle = `rgba(0, 255, 0, ${0.6 + dotGlow * 0.4})`;
        
        // Corner dots
        context.beginPath();
        context.arc(margin, margin, dotSize, 0, 2 * Math.PI);
        context.fill();
        
        context.beginPath();
        context.arc(width - margin, margin, dotSize, 0, 2 * Math.PI);
        context.fill();
        
        context.beginPath();
        context.arc(margin, height - margin, dotSize, 0, 2 * Math.PI);
        context.fill();
        
        context.beginPath();
        context.arc(width - margin, height - margin, dotSize, 0, 2 * Math.PI);
        context.fill();
        
        context.restore();
    }
    
    private renderCharacterTrails(context: CanvasRenderingContext2D): void {
        // Render character trails for all machines (only if enabled)
        if (!this.showCharTrail) {
            console.log('Character Trail disabled');
            return;
        }
        
        console.log('Character Trail enabled, machines:', this.machines.length);
        
        for (const machine of this.machines) {
            const coeffs = machine.getFourierCoefficients();
            console.log('Machine', machine.name, 'coefficients:', coeffs.length);
            if (coeffs.length > 0) {
                this.renderMachineCharacterTrail(context, machine);
            }
        }
    }
    
    private renderMachineCharacterTrail(context: CanvasRenderingContext2D, machine: GenericMachine): void {
        if (!machine.getCurrentAnimationFrame() || machine.getCurrentAnimationFrame()!.length === 0) {
            console.log('No animation frame for machine', machine.name);
            return;
        }
        
        const currentFrame = machine.getCurrentAnimationFrame()!;
        console.log('Rendering character trail for machine', machine.name, 'frame length:', currentFrame.length);
        const stepData = currentFrame;
        
        // Draw multiple trail positions based on characterTrailLength
        const trailSteps = Math.min(this.characterTrailLength, stepData.length);
        const stepIncrement = Math.max(1, Math.floor(stepData.length / trailSteps));
        
        context.save();
        context.font = '16px monospace';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        
        for (let i = 0; i < trailSteps; i += stepIncrement) {
            const stepIndex = Math.min(i, stepData.length - 1);
            const pos = stepData[stepIndex].position;
            const gridX = Math.floor(pos.x / this.cellSize);
            const gridY = Math.floor(pos.y / this.cellSize);
            
            if (gridX >= 0 && gridX < Math.floor(context.canvas.width / this.cellSize) &&
                gridY >= 0 && gridY < Math.floor(context.canvas.height / this.cellSize)) {
                
                // Calculate alpha based on position in trail
                const alpha = (i / trailSteps) * this.characterTrailIntensity;
                context.globalAlpha = alpha;
                
                // Get character from machine formula with animation
                const formula = machine.getMachineFormula();
                const time = Date.now() * 0.001;
                const animatedIndex = Math.floor((time * 2 + i) * 10) % formula.length;
                const character = formula[animatedIndex];
                
                // Get color from machine
                const colors = machine.getComponentColors();
                context.fillStyle = colors.path;
                
                // Add glow effect
                if (machine.showGlow) {
                    context.shadowColor = colors.glow;
                    context.shadowBlur = 8;
                }
                
                context.fillText(character, pos.x, pos.y);
            }
        }
        
        context.restore();
    }
}
