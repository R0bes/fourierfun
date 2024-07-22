import { Point } from './utils/Point'
import { calcEquidistantPoints } from './utils/math-stuff'

export class Grid {
    
    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;

    private cellSize: number;
    private size: Point;
    private gridDimension: Point;
    private textDimension: Point;
    private textPaddingDimension: Point;

    public showGrid: boolean;
    public gridSize: number;

    private drawMode: boolean = false;
    private drawing: Point[] = [];

    private equidistantPoints: Point[] = [];
  
    private gridChars: string[][];

    constructor(cellSize: number = 20) {
        
        this.canvas = document.createElement("canvas");

        let minPadding = 10;

        let windowSize = new Point(window.innerWidth, window.innerHeight).sub(minPadding);

        this.cellSize = cellSize;
        this.gridDimension = new Point(Math.floor(windowSize.x / cellSize), Math.floor(windowSize.y / cellSize));

        this.size = this.gridDimension.mul(cellSize);

        this.canvas.id = 'canvas';
        this.canvas.width = this.size.x;
        this.canvas.height = this.size.y;
        this.canvas.style.position = 'absolute';
        this.canvas.style.border = '1px solid black';

        document.body.append(this.canvas);

        this.canvas.addEventListener('mousedown', e => {
            this.drawMode = true;
            this.drawing = [];
            this.equidistantPoints = [];
        });
        this.canvas.addEventListener('mousemove', e => {
            if (!this.drawMode) return;
            this.drawing.push(new Point(e.clientX - this.canvas.offsetLeft, e.clientY - this.canvas.offsetTop));
        });
        this.canvas.addEventListener('mouseup', e => {
            this.drawMode = false;
            this.calculateNewInput();
        });
        
        this.context = this.canvas.getContext("2d");
        
        
        this.context.font = `${cellSize}px Courier New`; //monofont
        const metrics = this.context.measureText('0');
        this.textDimension = new Point(metrics.width, metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent);
        this.textPaddingDimension = this.textDimension.mul(-1).add(cellSize).div(2);

        // grid data
        this.gridChars = Array.from({length: this.gridDimension.x}, () => Array(this.gridDimension.y).fill('O'));
    }

    public clear() {
        this.context.clearRect(0, 0, this.size.x, this.size.y);
    }

    public drawPoints(points: Point[], radius: number = 2, color: string = 'black') {
        this.context.fillStyle = color;
        points.forEach(point => {
            this.context.beginPath();
            this.context.arc(point.x, point.y, radius, 0, Math.PI * 2);
            this.context.fill();
            this.context.closePath();
        });
    }

    private calculateNewInput(radius: number = 2) {
        this.equidistantPoints = calcEquidistantPoints(this.drawing, 1024);

        this.equidistantPoints.forEach(point => {
            let x = Math.floor(point.x / this.cellSize);
            let y = Math.floor(point.y / this.cellSize);
            if (x >= 0 && x < this.gridDimension.x && y >= 0 && y < this.gridDimension.y) {
                this.gridChars[x][y] = 'X';
            }
        });
    }

    public render() {
        this.clear();
    
        // draw grid
        this.context.lineWidth = 0.5;
        this.context.globalAlpha = 0.5;
        for (let x = 0; x < this.gridDimension.x; x++) {
          for (let y = 0; y < this.gridDimension.y; y++) {
            this.context.strokeRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
          }
        }
        // draw chars
        this.context.lineWidth = 0.8;
        this.context.globalAlpha = 0.7;
        this.context.fillStyle = 'black';
        this.gridChars.forEach((col, x) => col.forEach((char, y) => {

            let charPos = new Point(x, y + 1).mul(this.cellSize)            
            charPos = new Point (charPos.x + this.textPaddingDimension.x, charPos.y - this.textPaddingDimension.y);
            
            this.context.fillText(char, charPos.x, charPos.y);
        }));

        // draw input
        this.drawPoints(this.drawing, 2, 'red');
        this.drawPoints(this.equidistantPoints, 1, 'blue');
    }
}