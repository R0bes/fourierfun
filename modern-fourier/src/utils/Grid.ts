import type { Point } from '../types'

export interface GridCell {
  x: number
  y: number
  char: string
  heat: number
  color: string
  animation: number
}

/** Character grid overlay (ported from main Grid.ts). */
export class GridOverlay {
  private cellSize: number
  private showGrid = true
  private gridDimension: Point
  private cells!: GridCell[][]
  private animationClock = 0
  private rainbowMode = false
  private particleSystem = false

  constructor(width: number, height: number, cellSize: number = 20) {
    this.cellSize = cellSize
    this.gridDimension = {
      x: Math.floor(width / cellSize),
      y: Math.floor(height / cellSize)
    }
    this.initializeCells()
  }

  private initializeCells() {
    this.cells = Array.from({ length: this.gridDimension.x }, (_, x) =>
      Array.from({ length: this.gridDimension.y }, (_, y) => ({
        x,
        y,
        char: this.getRandomChar(),
        heat: 0,
        color: this.getRandomColor(),
        animation: Math.random() * Math.PI * 2
      }))
    )
  }

  private getRandomChar(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()'
    return chars[Math.floor(Math.random() * chars.length)]
  }

  private getRandomColor(): string {
    const colors = [
      '#FF6B6B',
      '#4ECDC4',
      '#45B7D1',
      '#96CEB4',
      '#FFEAA7',
      '#DDA0DD',
      '#98D8C8',
      '#F7DC6F',
      '#BB8FCE',
      '#85C1E9'
    ]
    return colors[Math.floor(Math.random() * colors.length)]
  }

  public update(deltaTime: number) {
    this.animationClock += deltaTime
    for (let x = 0; x < this.gridDimension.x; x++) {
      for (let y = 0; y < this.gridDimension.y; y++) {
        const cell = this.cells[x][y]
        if (cell.heat > 0) {
          cell.heat = Math.max(0, cell.heat - 0.02)
        }
        if (this.rainbowMode) {
          const hue = (this.animationClock * 50 + x * 10 + y * 10) % 360
          cell.color = `hsl(${hue}, 70%, 60%)`
        }
      }
    }
  }

  public render(context: CanvasRenderingContext2D) {
    if (!this.showGrid) return
    context.save()
    this.renderGridLines(context)
    this.renderCells(context)
    if (this.particleSystem) {
      this.renderParticles(context)
    }
    context.restore()
  }

  private renderGridLines(context: CanvasRenderingContext2D) {
    context.strokeStyle = 'rgba(167,139,250,0.3)'
    context.lineWidth = 0.5
    for (let x = 0; x <= this.gridDimension.x; x++) {
      context.beginPath()
      context.moveTo(x * this.cellSize, 0)
      context.lineTo(x * this.cellSize, this.gridDimension.y * this.cellSize)
      context.stroke()
    }
    for (let y = 0; y <= this.gridDimension.y; y++) {
      context.beginPath()
      context.moveTo(0, y * this.cellSize)
      context.lineTo(this.gridDimension.x * this.cellSize, y * this.cellSize)
      context.stroke()
    }
  }

  private renderCells(context: CanvasRenderingContext2D) {
    for (let x = 0; x < this.gridDimension.x; x++) {
      for (let y = 0; y < this.gridDimension.y; y++) {
        const cell = this.cells[x][y]
        if (cell.heat > 0 || this.rainbowMode) {
          const pixelX = x * this.cellSize + this.cellSize / 2
          const pixelY = y * this.cellSize + this.cellSize / 2
          if (cell.heat > 0) {
            context.fillStyle = `rgba(167,139,250,${cell.heat * 0.8})`
            context.fillRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize)
          }
          context.fillStyle = cell.color
          context.font = `bold ${this.cellSize * 0.6}px Arial`
          context.textAlign = 'center'
          context.textBaseline = 'middle'
          context.fillText(cell.char, pixelX, pixelY)
        }
      }
    }
  }

  private renderParticles(context: CanvasRenderingContext2D) {
    const particleCount = 50
    for (let i = 0; i < particleCount; i++) {
      const x =
        (Math.sin(this.animationClock * 0.5 + i) + 1) * (this.gridDimension.x * this.cellSize) / 2
      const y =
        (Math.cos(this.animationClock * 0.3 + i) + 1) * (this.gridDimension.y * this.cellSize) / 2
      context.fillStyle = `rgba(255,255,255,${0.3 + Math.sin(this.animationClock + i) * 0.2})`
      context.beginPath()
      context.arc(x, y, 2, 0, Math.PI * 2)
      context.fill()
    }
  }

  public resize(width: number, height: number) {
    this.gridDimension = {
      x: Math.floor(width / this.cellSize),
      y: Math.floor(height / this.cellSize)
    }
    this.initializeCells()
  }

  setShowGrid(show: boolean) {
    this.showGrid = show
  }

  setRainbowMode(enabled: boolean) {
    this.rainbowMode = enabled
  }

  setParticleSystem(enabled: boolean) {
    this.particleSystem = enabled
  }

  setCellSize(size: number, width: number, height: number) {
    this.cellSize = size
    this.resize(width, height)
  }
}
