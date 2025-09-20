export interface ComponentColors {
    circles: string;        // Kreise
    amplitudes: string;     // Amplituden/Linien
    trail: string;          // Path Trail
    path: string;           // Eigentlicher Pfad
    glow: string;           // Glow-Effekt
}

export interface ComponentColorMode {
    circles: 'solid' | 'random' | 'gradient';     // Farbmodus für Kreise
    amplitudes: 'solid' | 'random' | 'gradient';   // Farbmodus für Amplituden
    trail: 'solid' | 'random' | 'gradient';       // Farbmodus für Trail
    path: 'solid' | 'random' | 'gradient';        // Farbmodus für Pfad
    glow: 'solid' | 'random' | 'gradient';        // Farbmodus für Glow
}

export interface GradientColors {
    start: string;          // Startfarbe
    end: string;            // Endfarbe
}

export interface NeonColor {
    name: string;
    hex: string;
    glow: string;
}

export const NEON_COLORS: NeonColor[] = [
    { name: 'Neon Rot', hex: '#FF6B6B', glow: '#FF4757' },
    { name: 'Neon Türkis', hex: '#4ECDC4', glow: '#00D2D3' },
    { name: 'Neon Blau', hex: '#45B7D1', glow: '#54A0FF' },
    { name: 'Neon Gelb', hex: '#FCD34D', glow: '#F59E0B' },
    { name: 'Neon Lila', hex: '#A855F7', glow: '#8B5CF6' },
    { name: 'Neon Grün', hex: '#2ECC71', glow: '#27AE60' },
    { name: 'Neon Orange', hex: '#FF9F43', glow: '#FF6348' },
    { name: 'Neon Pink', hex: '#FF6B9D', glow: '#FF3838' },
    { name: 'Neon Cyan', hex: '#00CEC9', glow: '#00B894' },
    { name: 'Neon Magenta', hex: '#E84393', glow: '#D63031' },
    { name: 'Metallic Grau', hex: '#708090', glow: '#2F4F4F' }
];

export class ColorManager {
    private static instance: ColorManager;
    private colorAssignments: Map<string, ComponentColors> = new Map();
    private colorModes: Map<string, ComponentColorMode> = new Map();
    private gradientColors: Map<string, GradientColors> = new Map();
    
    static getInstance(): ColorManager {
        if (!ColorManager.instance) {
            ColorManager.instance = new ColorManager();
        }
        return ColorManager.instance;
    }
    
    getDefaultColors(): ComponentColors {
        return {
            circles: NEON_COLORS[0].hex,
            amplitudes: NEON_COLORS[0].hex,
            trail: NEON_COLORS[0].hex,
            path: NEON_COLORS[0].hex,
            glow: NEON_COLORS[0].glow
        };
    }
    
    getDefaultColorModes(): ComponentColorMode {
        return {
            circles: 'solid',
            amplitudes: 'solid',
            trail: 'solid',
            path: 'solid',
            glow: 'solid'
        };
    }
    
    getDefaultGradientColors(): GradientColors {
        return {
            start: '#FF6B6B', // Neon Rot
            end: '#4ECDC4'     // Neon Türkis
        };
    }
    
    getColorsForMachine(machineId: string): ComponentColors {
        if (!this.colorAssignments.has(machineId)) {
            this.colorAssignments.set(machineId, this.getDefaultColors());
        }
        return this.colorAssignments.get(machineId)!;
    }
    
    setComponentColor(machineId: string, component: keyof ComponentColors, color: string): void {
        const colors = this.getColorsForMachine(machineId);
        colors[component] = color;
        this.colorAssignments.set(machineId, colors);
    }
    
    getNeonColorByName(name: string): NeonColor | undefined {
        return NEON_COLORS.find(color => color.name === name);
    }
    
    getNeonColorByHex(hex: string): NeonColor | undefined {
        return NEON_COLORS.find(color => color.hex === hex);
    }
    
    getAllNeonColors(): NeonColor[] {
        return [...NEON_COLORS];
    }
    
    // Color Mode Methods
    getColorModesForMachine(machineId: string): ComponentColorMode {
        if (!this.colorModes.has(machineId)) {
            this.colorModes.set(machineId, this.getDefaultColorModes());
        }
        return this.colorModes.get(machineId)!;
    }
    
    setComponentColorMode(machineId: string, component: keyof ComponentColorMode, mode: 'solid' | 'random' | 'gradient'): void {
        const modes = this.getColorModesForMachine(machineId);
        modes[component] = mode;
        this.colorModes.set(machineId, modes);
    }
    
    // Gradient Methods
    getGradientColorsForMachine(machineId: string): GradientColors {
        if (!this.gradientColors.has(machineId)) {
            this.gradientColors.set(machineId, this.getDefaultGradientColors());
        }
        return this.gradientColors.get(machineId)!;
    }
    
    setGradientColors(machineId: string, start: string, end: string): void {
        this.gradientColors.set(machineId, { start, end });
    }
    
    // Utility Methods
    getRandomNeonColor(): string {
        const randomIndex = Math.floor(Math.random() * NEON_COLORS.length);
        return NEON_COLORS[randomIndex].hex;
    }
    
    interpolateColor(start: string, end: string, factor: number): string {
        // Simple color interpolation
        const startRgb = this.hexToRgb(start);
        const endRgb = this.hexToRgb(end);
        
        const r = Math.round(startRgb.r + (endRgb.r - startRgb.r) * factor);
        const g = Math.round(startRgb.g + (endRgb.g - startRgb.g) * factor);
        const b = Math.round(startRgb.b + (endRgb.b - startRgb.b) * factor);
        
        return `rgb(${r}, ${g}, ${b})`;
    }
    
    private hexToRgb(hex: string): { r: number; g: number; b: number } {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    }
}
