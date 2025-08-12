import { FourierMachine } from './FourierMachine';
import { Point } from './utils/Point';
import { smoothDrawnPoints, createSmoothClosedCurve } from './utils/math-stuff';
import { Grid } from './Grid';

export class MultiMachine {
    private machines: FourierMachine[] = [];
    private activeMachine: FourierMachine | null = null;
    private isDrawing: boolean = false;
    private currentDrawing: Point[] = [];
    
    // Grid properties
    private cellSize: number = 20;
    private showGrid: boolean = true;
    private gridDimension: Point;
    private textDimension: Point;
    private textPaddingDimension: Point;
    private gridChars: string[][];
    private heat: number[][];
    private fourierFormula: string[] = [];
    private fourierFormulaColors: string[] = [];
    private backgroundClock: number = 0;
    
    // Additional properties for missing functionality
    private showCharTrail: boolean = true;
    private showOriginalLine: boolean = true;
    private characterTrailLength: number = 33;
    private characterTrailIntensity: number = 1.0;
    private lineThickness: number = 3;
    private samples: number = 1024;
    private imageThreshold: number = 128;
    private cell: number = 20;
    private thick: number = 3;
    
    // Neue erweiterte Grid-Eigenschaften
    private showFrequencySpectrum: boolean = false;
    private showPhaseDiagram: boolean = false;
    private showHarmonics: boolean = true;
    private spectrumPosition: Point = new Point(50, 50);
    private phaseDiagramPosition: Point = new Point(50, 200);
    private spectrumSize: Point = new Point(300, 120);
    private phaseDiagramSize: number = 150;
    
    // Neue Grid-Instanz
    private advancedGrid: Grid;
    
    constructor() {
        // Erstelle fünf Standard-Maschinen mit Buchstaben
        this.createMachine('A', 'A');
        this.createMachine('B', 'B');
        this.createMachine('C', 'C');
        this.createMachine('D', 'D');
        this.createMachine('E', 'E');
        
        // Initialize grid
        this.initializeGrid();
        
        // Initialize advanced grid
        this.advancedGrid = new Grid(window.innerWidth, window.innerHeight, this.cellSize);
    }
    
    private initializeGrid() {
        console.log('🔧 Initializing grid...');
        
        // Initialize grid dimensions
        this.recomputeLayout(new Point(window.innerWidth, window.innerHeight));
        console.log(`📐 Grid dimensions: ${this.gridDimension.x}x${this.gridDimension.y}, cellSize: ${this.cellSize}`);
        
        // Initialize Fourier formula
        this.updateFourierFormula();
        
        // Initialize grid characters
        this.initGridChars();
        console.log(`📝 Grid chars initialized: ${this.gridChars.length}x${this.gridChars[0]?.length || 0}`);
        
        // Initialize heat map
        this.initHeat();
        
        console.log('✅ Grid initialization complete');
    }
    
    private recomputeLayout(windowSize: Point) {
        console.log(`🔄 Recomputing layout for window: ${windowSize.x}x${windowSize.y}`);
        
        this.textDimension = new Point(this.cellSize * 0.8, this.cellSize * 0.8);
        this.textPaddingDimension = this.textDimension.mul(-1).add(this.cellSize).div(2);
        
        // Grid data
        this.gridDimension = new Point(
            Math.floor(windowSize.x / this.cellSize), 
            Math.floor(windowSize.y / this.cellSize)
        );
        
        console.log(`📏 New grid dimensions: ${this.gridDimension.x}x${this.gridDimension.y}`);
    }
    
    private updateFourierFormula() {
        this.fourierFormula = ['F', 'O', 'U', 'R', 'I', 'E', 'R', 'T', 'R', 'A', 'N', 'S', 'F', 'O', 'R', 'M'];
        this.fourierFormulaColors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', 
            '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
            '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2', '#FAD7A0'
        ];
    }
    
    private initGridChars() {
        // Initialize grid with Fourier formula characters
        this.gridChars = Array.from(
            { length: this.gridDimension.x }, 
            () => Array(this.gridDimension.y).fill('')
        );
        
        let formulaIndex = 0;
        for (let y = 0; y < this.gridDimension.y; y++) {
            for (let x = 0; x < this.gridDimension.x; x++) {
                if (formulaIndex < this.fourierFormula.length) {
                    this.gridChars[x][y] = this.fourierFormula[formulaIndex++];
                } else {
                    this.gridChars[x][y] = this.fourierFormula[Math.floor(Math.random() * this.fourierFormula.length)] || '0';
                }
            }
        }
    }
    
    private initHeat() {
        this.heat = Array.from(
            { length: this.gridDimension.x }, 
            () => Array(this.gridDimension.y).fill(0)
        );
    }
    
    public setGridProperty(property: string, value: any) {
        switch (property) {
            case 'showGrid':
                this.showGrid = value;
                break;
            case 'cellSize':
                this.cellSize = Math.max(10, Math.min(50, value));
                this.recomputeLayout(new Point(window.innerWidth, window.innerHeight));
                this.initGridChars();
                break;
            case 'showCharTrail':
                this.showCharTrail = value;
                // Update all machines
                for (const machine of this.machines) {
                    machine.showCharacterTrail = this.showCharTrail;
                }
                break;
            case 'showOriginalLine':
                this.showOriginalLine = value;
                // Update all machines
                for (const machine of this.machines) {
                    machine.showOriginalLine = this.showOriginalLine;
                }
                break;
            case 'characterTrailLength':
                this.characterTrailLength = Math.max(10, Math.min(100, value));
                // Update all machines
                for (const machine of this.machines) {
                    machine.characterTrailLength = this.characterTrailLength;
                }
                break;
            case 'characterTrailIntensity':
                this.characterTrailIntensity = Math.max(0.1, Math.min(1.0, value));
                // Update all machines
                for (const machine of this.machines) {
                    machine.characterTrailIntensity = this.characterTrailIntensity;
                }
                break;
            case 'lineThickness':
                this.lineThickness = Math.max(0, Math.min(6, value));
                // Update all machines
                for (const machine of this.machines) {
                    machine.lineThickness = this.lineThickness;
                }
                break;
            case 'samples':
                this.samples = Math.max(64, Math.min(2048, value));
                break;
            case 'imageThreshold':
                this.imageThreshold = Math.max(0, Math.min(255, value));
                break;
            case 'cell':
                this.cell = Math.max(10, Math.min(60, value));
                break;
            case 'thick':
                this.thick = Math.max(0, Math.min(6, value));
                // Update all machines
                for (const machine of this.machines) {
                    machine.lineThickness = this.thick;
                }
                break;
            case 'showFrequencySpectrum':
                this.showFrequencySpectrum = value;
                // Update all machines
                for (const machine of this.machines) {
                    machine.showFrequencySpectrum = this.showFrequencySpectrum;
                }
                break;
            case 'showPhaseDiagram':
                this.showPhaseDiagram = value;
                // Update all machines
                for (const machine of this.machines) {
                    machine.showPhaseDiagram = this.showPhaseDiagram;
                }
                break;
            case 'showHarmonics':
                this.showHarmonics = value;
                // Update all machines
                for (const machine of this.machines) {
                    machine.showHarmonics = this.showHarmonics;
                }
                break;
            case 'wavePattern':
                if (this.advancedGrid) {
                    this.advancedGrid.setProperty('wavePattern', value);
                }
                break;
            case 'rainbowMode':
                if (this.advancedGrid) {
                    this.advancedGrid.setProperty('rainbowMode', value);
                }
                break;
            case 'particleSystem':
                if (this.advancedGrid) {
                    this.advancedGrid.setProperty('particleSystem', value);
                }
                break;
        }
    }
    
    public getSamples(): number {
        return this.samples;
    }
    
    public getCell(): number {
        return this.cell;
    }
    
    public getThick(): number {
        return this.thick;
    }
    
    public setSamplesForAllMachines(samples: number) {
        this.samples = samples;
        // Update all machines with new sample count
        for (const machine of this.machines) {
            machine.samples = samples;
            if (machine.drawing.length >= 3) {
                // Recalculate Fourier with new sample count
                machine.calculateFourier();
            }
        }
    }
    
    public processImageUpload(imageFile: File): Promise<void> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    // Create a canvas to process the image
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    if (!ctx) {
                        reject(new Error('Could not get canvas context'));
                        return;
                    }
                    
                    // Set canvas size to image size
                    canvas.width = img.width;
                    canvas.height = img.height;
                    
                    // Draw image to canvas
                    ctx.drawImage(img, 0, 0);
                    
                    // Get image data for processing
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const data = imageData.data;
                    
                    // Convert to grayscale and find edges based on threshold
                    const points: Point[] = [];
                    const threshold = this.imageThreshold;
                    
                    // Improved edge detection with adaptive sampling
                    const sampleRate = Math.max(1, Math.min(4, Math.floor(256 / threshold))); // Adaptive sampling based on threshold
                    
                    for (let y = 0; y < canvas.height; y += sampleRate) {
                        for (let x = 0; x < canvas.width; x += sampleRate) {
                            const idx = (y * canvas.width + x) * 4;
                            const gray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
                            
                            if (gray < threshold) {
                                // Convert canvas coordinates to screen coordinates
                                const screenX = (x / canvas.width) * window.innerWidth;
                                const screenY = (y / canvas.height) * window.innerHeight;
                                points.push(new Point(screenX, screenY));
                            }
                        }
                    }
                    
                    // If we have enough points, add them to the active machine
                    if (points.length >= 3 && this.activeMachine) {
                        // Clear existing drawing
                        this.activeMachine.clear();
                        
                        // Add all points
                        for (const point of points) {
                            this.activeMachine.addPoint(point);
                        }
                        
                        // Calculate Fourier
                        this.activeMachine.calculateFourier();
                        
                        console.log(`✅ Bild verarbeitet: ${points.length} Punkte gefunden`);
                        resolve();
                    } else {
                        reject(new Error('Nicht genug Punkte im Bild gefunden'));
                    }
                };
                img.onerror = () => reject(new Error('Fehler beim Laden des Bildes'));
                img.src = e.target?.result as string;
            };
            reader.onerror = () => reject(new Error('Fehler beim Lesen der Datei'));
            reader.readAsDataURL(imageFile);
        });
    }
    
    public handleResize() {
        this.recomputeLayout(new Point(window.innerWidth, window.innerHeight));
        this.initGridChars();
        
        // Update advanced grid
        if (this.advancedGrid) {
            this.advancedGrid.resize(window.innerWidth, window.innerHeight);
        }
    }
    
    public createMachine(id: string, name: string): FourierMachine {
        const machine = new FourierMachine(id, name);
        this.machines.push(machine);
        return machine;
    }
    
    public getMachine(id: string): FourierMachine | undefined {
        return this.machines.find(m => m.id === id);
    }
    
    public getAllMachines(): FourierMachine[] {
        return this.machines;
    }
    
    public setActiveMachine(id: string) {
        this.activeMachine = this.getMachine(id);
        if (this.activeMachine) {
            console.log(`🎯 Aktive Maschine: ${this.activeMachine.name}`);
        }
    }

    public getActiveMachine(): FourierMachine | null {
        return this.activeMachine;
    }
    
    public startDrawing(x: number, y: number) {
        if (!this.activeMachine) return;
        
        this.isDrawing = true;
        this.currentDrawing = [];
        this.currentDrawing.push(new Point(x, y));
        
        // Startpunkt sofort zur aktiven Maschine hinzufügen
        this.activeMachine.addPoint(new Point(x, y));
    }
    
    public continueDrawing(x: number, y: number) {
        if (!this.isDrawing || !this.activeMachine) return;
        
        const point = new Point(x, y);
        this.currentDrawing.push(point);
        this.activeMachine.addPoint(point);
    }
    
    public finishDrawing() {
        if (!this.isDrawing || !this.activeMachine) return;
        
        this.isDrawing = false;
        
        // Schließe die Kurve wenn genug Punkte vorhanden
        if (this.currentDrawing.length >= 3) {
            // Verwende sanfte Glättung der gezeichneten Punkte
            const smoothedDrawing = smoothDrawnPoints(this.currentDrawing, 2);
            
            // Erstelle eine glatte geschlossene Kurve
            const smoothClosedCurve = createSmoothClosedCurve(smoothedDrawing, 8);
            
            // Füge alle Punkte der geglätteten Kurve zur Maschine hinzu
            for (const point of smoothClosedCurve) {
                this.activeMachine.addPoint(point);
            }
            
            // Berechne Fourier-Transformation
            this.activeMachine.calculateFourier();
            
            console.log(`✅ ${this.activeMachine.name} gezeichnet mit ${this.currentDrawing.length} Punkten, geglättet auf ${smoothClosedCurve.length} Punkte`);
        }
        
        this.currentDrawing = [];
    }
    
    public update() {
        // Update alle Maschinen
        for (const machine of this.machines) {
            machine.update();
        }
        
        // Update background clock for grid animation
        this.backgroundClock += 0.1;
        
        // Update advanced grid
        if (this.advancedGrid) {
            this.advancedGrid.update(0.016); // 60 FPS
        }
    }
    
    public render(context: CanvasRenderingContext2D) {
        // Zeichne Grid zuerst (im Hintergrund)
        this.renderGrid(context);
        
        // Zeichne erweiterte Grid-Instanz
        if (this.advancedGrid) {
            this.advancedGrid.render(context);
        }
        
        // Zeichne Formel der aktiven Maschine
        if (this.activeMachine) {
            this.activeMachine.renderFormula(context, this.gridDimension, this.cellSize);
        }
        
        // Zeichne alle Maschinen
        for (const machine of this.machines) {
            machine.render(context);
        }
        
        // Zeichne erweiterte Visualisierungen für die aktive Maschine
        if (this.activeMachine && this.activeMachine.fourierComponents.length > 0) {
            // Frequenzspektrum
            if (this.showFrequencySpectrum) {
                this.activeMachine.renderFrequencySpectrum(
                    context, 
                    this.spectrumPosition.x, 
                    this.spectrumPosition.y, 
                    this.spectrumSize.x, 
                    this.spectrumSize.y
                );
            }
            
            // Phasendiagramm
            if (this.showPhaseDiagram) {
                this.activeMachine.renderPhaseDiagram(
                    context, 
                    this.phaseDiagramPosition.x, 
                    this.phaseDiagramPosition.y, 
                    this.phaseDiagramSize
                );
            }
            
            // Harmonische
            if (this.showHarmonics) {
                this.activeMachine.renderHarmonics(context);
            }
        }
        
        // Zeichne Original-Linien aller Maschinen (nur wenn aktiviert)
        if (this.showOriginalLine) {
            for (const machine of this.machines) {
                machine.renderOriginalLine(context);
            }
        }
        
        // Zeichne aktuelle Zeichnung
        if (this.isDrawing && this.currentDrawing.length > 1) {
            context.save();
            context.strokeStyle = '#FF6B6B';
            context.lineWidth = this.lineThickness;
            context.lineCap = 'round';
            context.lineJoin = 'round';
            context.globalAlpha = 0.9;
            context.shadowColor = 'rgba(255,107,107,0.8)';
            context.shadowBlur = 15;
            
            if (this.currentDrawing.length > 2) {
                // Verwende glatte Kurven für bessere Darstellung
                context.beginPath();
                context.moveTo(this.currentDrawing[0].x, this.currentDrawing[0].y);
                
                // Zeichne glatte Kurve mit quadratischen Kurven
                for (let i = 1; i < this.currentDrawing.length - 1; i++) {
                    const current = this.currentDrawing[i];
                    const next = this.currentDrawing[i + 1];
                    
                    // Kontrollpunkt für glatte Kurve
                    const controlX = (current.x + next.x) / 2;
                    const controlY = (current.y + next.y) / 2;
                    
                    context.quadraticCurveTo(current.x, current.y, controlX, controlY);
                }
                
                // Schließe die Kurve glatt, wenn genug Punkte vorhanden
                if (this.currentDrawing.length >= 3) {
                    const last = this.currentDrawing[this.currentDrawing.length - 1];
                    const first = this.currentDrawing[0];
                    const second = this.currentDrawing[1];
                    
                    // Kontrollpunkt für glatten Übergang
                    const controlX = (last.x + first.x) / 2;
                    const controlY = (last.y + first.y) / 2;
                    
                    context.quadraticCurveTo(last.x, last.y, controlX, controlY);
                    context.quadraticCurveTo(first.x, first.y, second.x, second.y);
                }
            } else {
                // Fallback für einfache Linien
                context.beginPath();
                context.moveTo(this.currentDrawing[0].x, this.currentDrawing[0].y);
                for (let i = 1; i < this.currentDrawing.length; i++) {
                    context.lineTo(this.currentDrawing[i].x, this.currentDrawing[i].y);
                }
            }
            
            context.stroke();
            context.restore();
        }
        
        // Zeichne Maschinen-Info
        this.renderMachineInfo(context);
    }
    
    private renderGrid(context: CanvasRenderingContext2D) {
        if (!this.showGrid) {
            console.log('🚫 Grid rendering disabled');
            return;
        }
        
        console.log(`🎨 Rendering grid: ${this.gridDimension.x}x${this.gridDimension.y}, cellSize: ${this.cellSize}`);
        
        // Draw grid lines with cell-based styling
        context.save();
        context.lineWidth = 0.5 + (this.cell / 20); // Cell value affects line thickness
        context.globalAlpha = 0.35 + (this.cell / 100); // Cell value affects transparency
        context.strokeStyle = 'rgba(167,139,250,0.45)';
        
        for (let x = 0; x < this.gridDimension.x; x++) {
            for (let y = 0; y < this.gridDimension.y; y++) {
                context.strokeRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
            }
        }
        
        // Zeichne Grid-Zeichen mit cell-basierter Styling
        if (this.gridChars && this.heat) {
            for (let x = 0; x < this.gridDimension.x; x++) {
                for (let y = 0; y < this.gridDimension.y; y++) {
                    if (this.gridChars[x][y] && this.heat[x][y] > 0) {
                        const heatValue = this.heat[x][y];
                        const alpha = Math.min(0.8, heatValue * 0.8) * (this.cell / 30); // Cell value affects visibility
                        
                        if (alpha > 0.1) {
                            context.fillStyle = `rgba(167,139,250,${alpha})`;
                            context.font = `bold ${this.cellSize * 0.6}px Arial`;
                            context.textAlign = 'center';
                            context.textBaseline = 'middle';
                            
                            const pixelX = x * this.cellSize + this.cellSize / 2;
                            const pixelY = y * this.cellSize + this.cellSize / 2;
                            
                            context.fillText(this.gridChars[x][y], pixelX, pixelY);
                        }
                    }
                }
            }
        }
        
        // Zeichne Buchstabentrails für alle Maschinen
        this.renderCharacterTrails(context);
        
        context.restore();
        console.log('✅ Grid rendering complete');
    }
    
    private renderCharacterTrails(context: CanvasRenderingContext2D) {
        // Zeichne Buchstabentrails für alle Maschinen (nur wenn aktiviert)
        if (!this.showCharTrail) return;
        
        for (const machine of this.machines) {
            if (machine.fourierComponents.length > 0) {
                this.renderMachineCharacterTrail(context, machine);
            }
        }
    }
    
    private renderMachineCharacterTrail(context: CanvasRenderingContext2D, machine: FourierMachine) {
        if (!machine.fourierAnimation || machine.fourierAnimation.length === 0) return;
        
        const stepData = machine.fourierAnimation[machine.getCurrentAnimationStep() || 0];
        if (!stepData || stepData.length === 0) return;
        
        // Zeichne mehrere Trail-Positionen basierend auf characterTrailLength
        const trailSteps = Math.min(this.characterTrailLength, stepData.length);
        const stepIncrement = Math.max(1, Math.floor(stepData.length / trailSteps));
        
        for (let i = 0; i < trailSteps; i += stepIncrement) {
            const stepIndex = Math.min(i, stepData.length - 1);
            const pos = stepData[stepIndex].position;
            const gridX = Math.floor(pos.x / this.cellSize);
            const gridY = Math.floor(pos.y / this.cellSize);
            
            if (gridX >= 0 && gridX < this.gridDimension.x && gridY >= 0 && gridY < this.gridDimension.y) {
                // Aktualisiere Heat-Map für diese Position
                if (this.heat && this.heat[gridX] && this.heat[gridX][gridY] !== undefined) {
                    this.heat[gridX][gridY] = Math.min(1.0, (this.heat[gridX][gridY] || 0) + 0.1);
                }
                
                // Zeichne Buchstaben-Trail mit konfigurierbarer Länge und Intensität
                context.save();
                const trailAlpha = (0.8 * this.characterTrailIntensity) * (1 - i / trailSteps); // Fade out effect
                context.globalAlpha = trailAlpha;
                context.fillStyle = machine.getMachineColor() || '#FF6B6B';
                context.font = `bold ${this.cellSize * 0.6}px Arial`;
                context.textAlign = 'center';
                context.textBaseline = 'middle';
                context.shadowColor = machine.getMachineGlowColor() || '#FF4757';
                context.shadowBlur = 15 * this.characterTrailIntensity;
                
                const pixelX = gridX * this.cellSize + this.cellSize / 2;
                const pixelY = gridY * this.cellSize + this.cellSize / 2;
                
                // Wähle einen Buchstaben basierend auf der Maschinen-ID
                const trailChar = machine.id;
                context.fillText(trailChar, pixelX, pixelY);
                
                context.restore();
            }
        }
    }
    
    private renderMachineInfo(context: CanvasRenderingContext2D) {
        context.save();
        
        // Hintergrund für die Maschinen-Info
        const panelWidth = 280;
        const panelHeight = 120;
        const panelX = 20;
        const panelY = 280; // Moved down to avoid overlap with HTML panel
        
        // Glasmorphismus-Hintergrund
        context.fillStyle = 'rgba(24, 24, 37, 0.85)';
        context.strokeStyle = 'rgba(168, 85, 247, 0.4)';
        context.lineWidth = 1;
        context.shadowColor = 'rgba(0, 0, 0, 0.3)';
        context.shadowBlur = 10;
        
        // Abgerundete Ecken simulieren
        context.beginPath();
        context.moveTo(panelX + 12, panelY);
        context.lineTo(panelX + panelWidth - 12, panelY);
        context.quadraticCurveTo(panelX + panelWidth, panelY, panelX + panelWidth, panelY + 12);
        context.lineTo(panelX + panelWidth, panelY + panelHeight - 12);
        context.quadraticCurveTo(panelX + panelWidth, panelY + panelHeight, panelX + panelWidth - 12, panelY + panelHeight);
        context.lineTo(panelX + 12, panelY + panelHeight);
        context.quadraticCurveTo(panelX, panelY + panelHeight, panelX, panelY + panelHeight - 12);
        context.lineTo(panelX, panelY + 12);
        context.quadraticCurveTo(panelX, panelY, panelX + 12, panelY);
        context.closePath();
        context.fill();
        context.stroke();
        
        // Titel
        context.fillStyle = '#E9D5FF';
        context.font = 'bold 16px Inter, sans-serif';
        context.textAlign = 'left';
        context.shadowColor = 'rgba(168, 85, 247, 0.6)';
        context.shadowBlur = 8;
        context.fillText('📊 Maschinen-Status', panelX + 15, panelY + 25);
        
        // Aktive Maschine Info
        if (this.activeMachine) {
            const hasPoints = this.activeMachine.fourierComponents.length > 0;
            
            // Status-Icon
            const statusIcon = hasPoints ? '✅' : '⭕';
            const statusColor = hasPoints ? '#10B981' : '#6B7280';
            context.fillStyle = statusColor;
            context.font = '16px Arial';
            context.textAlign = 'left';
            context.fillText(statusIcon, panelX + 20, panelY + 55);
            
            // Maschinen-Name
            context.fillStyle = '#FCD34D';
            context.font = 'bold 16px Inter, sans-serif';
            context.fillText(`${this.activeMachine.name}`, panelX + 50, panelY + 55);
            
            // Punkte-Anzahl
            context.fillStyle = '#A78BFA';
            context.font = '14px Inter, sans-serif';
            context.textAlign = 'right';
            context.fillText(`${this.activeMachine.drawing.length} Punkte`, panelX + panelWidth - 20, panelY + 55);
            
            // Fourier-Status
            if (hasPoints) {
                context.fillStyle = '#10B981';
                context.font = '12px Inter, sans-serif';
                context.textAlign = 'left';
                context.fillText(`Fourier: ${this.activeMachine.fourierComponents.length} Komponenten`, panelX + 15, panelY + 80);
            }
        }
        
        context.restore();
    }
    
    public clearMachine(id: string) {
        const machine = this.getMachine(id);
        if (machine) {
            machine.clear();
            console.log(`🗑️ Maschine ${machine.name} geleert`);
        }
    }
    
    public clearAllMachines() {
        for (const machine of this.machines) {
            machine.clear();
        }
        console.log('🗑️ Alle Maschinen geleert');
    }
    
    public setMachineProperty(id: string, property: keyof FourierMachine, value: any) {
        const machine = this.getMachine(id);
        if (machine && property in machine) {
            (machine as any)[property] = value;
        }
    }
}
