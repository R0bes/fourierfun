export class Point {

    public x: number;
    public y: number;

    public static Zero: Point = new Point(0, 0);

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    public add(value: number) {
        return new Point(this.x + value, this.y + value);
    }

    public sub(value: number) {
        return new Point(this.x - value, this.y - value);
    }

    public mul(value: number) {
        return new Point(this.x * value, this.y * value);
    }

    public div(value: number) {
        return new Point(this.x / value, this.y / value);
    }

    public addV(other: Point) {
        return new Point(this.x + other.x, this.y + other.y);
    }

    public subV(other: Point) {
        return new Point(this.x - other.x, this.y - other.y);
    }
    
    public mulV(other: Point) {
        return new Point(this.x * other.x, this.y * other.y);
    }
    
    public divV(other: Point) {
        return new Point(this.x / other.x, this.y / other.y);
    }
}