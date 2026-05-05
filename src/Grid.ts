import { Point } from './utils/Point';

export interface GridCell {
    x: number;
    y: number;
    char: string;
    heat: number;
    color: string;
    animation: number;
}

export interface FourierComponent {
    amplitude: number;
    phase: number;
    freq: number;
}

export class Grid {
    private cellSize: number = 20;
    private showGrid: boolean = true;
    private gridDimension: Point;
    private cells: GridCell[][];
    private animationClock: number = 0;
    private rainbowMode: boolean = false;
    private characterMode: boolean = true;
    private characterColor: string = '#FFFFFF';
    private particleSystem: boolean = false;
    private currentFormula: string = '';
    
    constructor(width: number, height: number, cellSize: number = 20) {
        this.cellSize = cellSize;
        this.gridDimension = this.getGridDimensions(width, height);
        this.initializeCells();
        this.setPlaceholderFormula();
    }
    
    private getGridDimensions(width: number, height: number): Point {
        return new Point(
            Math.max(1, Math.floor(width / this.cellSize)),
            Math.max(1, Math.floor(height / this.cellSize))
        );
    }

    private initializeCells() {
        this.cells = Array.from(
            { length: this.gridDimension.x },
            (_, x) => Array.from(
                { length: this.gridDimension.y },
                (_, y) => ({
                    x,
                    y,
                    char: this.getRandomChar(),
                    heat: 0,
                    color: this.getRandomColor(),
                    animation: Math.random() * Math.PI * 2
                })
            )
        );
    }
    
    private getRandomChar(): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
        return chars[Math.floor(Math.random() * chars.length)];
    }
    
    private getRandomColor(): string {
        const colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
            '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    public update(deltaTime: number) {
        this.animationClock += deltaTime;
        
        // Update alle Zellen
        for (let x = 0; x < this.gridDimension.x; x++) {
            for (let y = 0; y < this.gridDimension.y; y++) {
                const cell = this.cells[x][y];
                
                
                // Heat-Fade
                if (cell.heat > 0) {
                    cell.heat = Math.max(0, cell.heat - 0.02);
                }
                
                if (this.rainbowMode && this.characterColor === 'rainbow') {
                    const hue = (this.animationClock * 50 + x * 10 + y * 10) % 360;
                    cell.color = `hsl(${hue}, 70%, 60%)`;
                }
            }
        }
    }
    
    public render(context: CanvasRenderingContext2D) {
        if (!this.showGrid) return;
        
        context.save();
        
        // Zeichne Grid-Linien
        this.renderGridLines(context);
        
        // Zeichne Zellen-Inhalt
        this.renderCells(context);
        
        // Zeichne Partikel-System
        if (this.particleSystem) {
            this.renderParticles(context);
        }
        
        context.restore();
    }
    
    private renderGridLines(context: CanvasRenderingContext2D) {
        context.strokeStyle = 'rgba(167,139,250,0.3)';
        context.lineWidth = 0.5;
        
        for (let x = 0; x <= this.gridDimension.x; x++) {
            context.beginPath();
            context.moveTo(x * this.cellSize, 0);
            context.lineTo(x * this.cellSize, this.gridDimension.y * this.cellSize);
            context.stroke();
        }
        
        for (let y = 0; y <= this.gridDimension.y; y++) {
            context.beginPath();
            context.moveTo(0, y * this.cellSize);
            context.lineTo(this.gridDimension.x * this.cellSize, y * this.cellSize);
            context.stroke();
        }
    }
    
    private renderCells(context: CanvasRenderingContext2D) {
        for (let x = 0; x < this.gridDimension.x; x++) {
            for (let y = 0; y < this.gridDimension.y; y++) {
                const cell = this.cells[x][y];
                
                if (cell.heat > 0 || this.characterMode) {
                    const pixelX = x * this.cellSize + this.cellSize / 2;
                    const pixelY = y * this.cellSize + this.cellSize / 2;
                    
                    // Zeichne Hintergrund
                    if (cell.heat > 0) {
                        context.fillStyle = `rgba(167,139,250,${cell.heat * 0.8})`;
                        context.fillRect(
                            x * this.cellSize,
                            y * this.cellSize,
                            this.cellSize,
                            this.cellSize
                        );
                    }
                    
                    // Zeichne Charakter
                    if (this.characterMode) {
                        const charColor = this.characterColor === 'rainbow' ? cell.color : this.characterColor;
                        context.fillStyle = charColor;
                        context.font = `bold ${this.cellSize * 0.6}px Arial`;
                        context.textAlign = 'center';
                        context.textBaseline = 'middle';
                        context.fillText(cell.char, pixelX, pixelY);
                    }
                }
            }
        }
    }
    
    private renderParticles(context: CanvasRenderingContext2D) {
        // Einfaches Partikel-System
        const particleCount = 50;
        
        for (let i = 0; i < particleCount; i++) {
            const x = (Math.sin(this.animationClock * 0.5 + i) + 1) * this.gridDimension.x * this.cellSize / 2;
            const y = (Math.cos(this.animationClock * 0.3 + i) + 1) * this.gridDimension.y * this.cellSize / 2;
            
            context.fillStyle = `rgba(255,255,255,${0.3 + Math.sin(this.animationClock + i) * 0.2})`;
            context.beginPath();
            context.arc(x, y, 2, 0, Math.PI * 2);
            context.fill();
        }
    }
    
    public setHeat(x: number, y: number, heat: number) {
        if (x >= 0 && x < this.gridDimension.x && y >= 0 && y < this.gridDimension.y) {
            this.cells[x][y].heat = Math.min(1.0, heat);
        }
    }
    
    public setHeatSpread(x: number, y: number, heat: number, radius: number = 1) {
        for (let dx = -radius; dx <= radius; dx++) {
            for (let dy = -radius; dy <= radius; dy++) {
                const nx = x + dx;
                const ny = y + dy;
                if (nx >= 0 && nx < this.gridDimension.x && ny >= 0 && ny < this.gridDimension.y) {
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const falloff = Math.max(0, 1 - distance / (radius + 1));
                    const cellHeat = heat * falloff;
                    this.cells[nx][ny].heat = Math.min(1.0, Math.max(this.cells[nx][ny].heat, cellHeat));
                }
            }
        }
    }
    
    public setProperty(property: string, value: any) {
        switch (property) {
            case 'showGrid':
                this.showGrid = value;
                break;
            case 'rainbowMode':
                this.rainbowMode = value;
                break;
            case 'characterMode':
                this.characterMode = value;
                if (value) {
                    // Wenn Character Mode aktiviert wird, setze rainbowMode für die Anzeige
                    this.rainbowMode = true;
                }
                break;
            case 'characterColor':
                this.characterColor = value;
                break;
            case 'particleSystem':
                this.particleSystem = value;
                break;
            case 'fourierFormula':
                if (!value || value.length === 0) {
                    this.setPlaceholderFormula();
                } else {
                    this.setFourierFormula(value);
                }
                break;
        }
    }
    
    private setFourierFormula(components: FourierComponent[]) {
        if (!components || components.length === 0) {
            this.setPlaceholderFormula();
            return;
        }
        
        const formulaString = this.generateDetailedFourierFormula(components);
        this.setFormulaString(formulaString);
    }
    
    private setFormulaString(formula: string) {
        this.currentFormula = formula;
        this.distributeFormulaToGrid(formula);
    }
    
    private getPlaceholderFormula(): string {
        const totalCells = this.gridDimension.x * this.gridDimension.y;
        const header = 'f(t)=';
        const remaining = Math.max(0, totalCells - header.length);
        return header + '-'.repeat(remaining);
    }
    
    private setPlaceholderFormula() {
        this.setFormulaString(this.getPlaceholderFormula());
    }
    
    private generateDetailedFourierFormula(components: FourierComponent[]): string {
        let formula = 'f(t)=';
        
        // Sortiere nach Frequenz für bessere Lesbarkeit
        const sortedComponents = [...components].sort((a, b) => Math.abs(a.freq) - Math.abs(b.freq));
        
        for (let i = 0; i < sortedComponents.length; i++) {
            const comp = sortedComponents[i];
            
            if (i > 0) {
                formula += '+';
            }
            
            formula += this.buildComponentTerm(comp);
        }
        
        const minLength = this.gridDimension.x * this.gridDimension.y;
        let repeatIndex = 0;
        while (formula.length < minLength) {
            const comp = sortedComponents[repeatIndex % sortedComponents.length];
            formula += '+' + this.buildComponentTerm(comp);
            repeatIndex++;
        }
        
        return formula;
    }
    
    private buildComponentTerm(comp: FourierComponent): string {
        const real = comp.amplitude * Math.cos(comp.phase);
        const imag = comp.amplitude * Math.sin(comp.phase);
        const realStr = real.toFixed(4);
        const imagStr = Math.abs(imag) < 0.0001 ? '' : (imag >= 0 ? '+' : '') + imag.toFixed(4) + 'i';
        
        let coeffStr = '';
        if (Math.abs(real) > 0.0001) {
            coeffStr += realStr;
        }
        if (Math.abs(imag) > 0.0001) {
            if (coeffStr && imag >= 0) coeffStr += '+';
            coeffStr += imagStr;
        }
        if (!coeffStr) {
            coeffStr = '0.0000';
        }
        
        const freq = Math.round(comp.freq);
        if (freq === 0) {
            return coeffStr;
        }
        return `${coeffStr}·e^(i2π·${freq}·t/N)`;
    }
    
    private distributeFormulaToGrid(formula: string) {
        const chars = formula.split('');
        let charIndex = 0;

        // Verteile die Formel und fülle nachfolgende Zellen mit sichtbaren zufälligen Zeichen
        for (let y = 0; y < this.gridDimension.y; y++) {
            for (let x = 0; x < this.gridDimension.x; x++) {
                const cell = this.cells[x][y];
                if (charIndex < chars.length) {
                    cell.char = chars[charIndex];
                } else {
                    cell.char = this.getRandomChar();
                }
                cell.color = this.characterColor === 'rainbow' ? this.getRandomColor() : this.characterColor;
                charIndex++;
            }
        }
    }
    
    public resize(width: number, height: number) {
        this.gridDimension = this.getGridDimensions(width, height);
        this.initializeCells();
        if (this.currentFormula) {
            this.distributeFormulaToGrid(this.currentFormula);
        } else {
            this.setPlaceholderFormula();
        }
    }
    
    // Setter methods for grid properties
    public setShowGrid(show: boolean): void {
        this.showGrid = show;
    }
    
    public setRainbowMode(enabled: boolean): void {
        this.rainbowMode = enabled;
    }

    public setCharacterColor(color: string): void {
        this.characterColor = color;
    }
    
    public setParticleSystem(enabled: boolean): void {
        this.particleSystem = enabled;
    }

    public clearHeat(): void {
        for (let x = 0; x < this.gridDimension.x; x++) {
            for (let y = 0; y < this.gridDimension.y; y++) {
                this.cells[x][y].heat = 0;
            }
        }
    }
    
    public setCellSize(size: number, width?: number, height?: number): void {
        const previousWidth = this.gridDimension.x * this.cellSize;
        const previousHeight = this.gridDimension.y * this.cellSize;
        this.cellSize = size;
        if (typeof width === 'number' && typeof height === 'number') {
            this.resize(width, height);
        } else {
            this.resize(previousWidth, previousHeight);
        }
    }
}