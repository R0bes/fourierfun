export class Color {
    constructor(red, green, blue) {
        this.red = red;
        this.green = green;
        this.blue = blue;
    }

    static BLACK = new Color(0,0,0);
    static WHITE = new Color(255,255,255);
    static RED = new Color(255,0,0);
    static GREEN = new Color(0,255,0);
    static BLUE = new Color(0,0,255);
    static CYAN = new Color(0,255,255);
    static MAGENTA = new Color(255,0,255);
    static YELLOW = new Color(255,255,0);

    get rgb() {
        return 'rgb(' + this.red + ',' + this.green + ',' + this.blue + ')';
    }

    get r() {
        return this.red;
    }
    set r(value) {
        this.red = value;
    }

    get g() {
        return this.green;
    }
    set g(value) {
        this.green = value;
    }

    get b() {
        return this.blue;
    }
    set b(value) {
        this.blue = value;
    }

    static interpolate(color1, color2, factor) {
        let r = Math.round(color1.r + factor * (color2.r - color1.r));
        let g = Math.round(color1.g + factor * (color2.g - color1.g));
        let b = Math.round(color1.b + factor * (color2.b - color1.b));

        return new Color(r, g, b);
    }
}