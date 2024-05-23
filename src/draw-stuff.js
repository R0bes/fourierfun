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

class Component {
    constructor(elementID) {
        this.component = document.getElementById(elementID);
    }
}

export class Slider extends Component {
    constructor(sliderID, initValue) {
        super(sliderID);
        this.component.value = initValue;
    }
}

export class Checkbox extends Component {
    constructor(checkboxID, initValue) {
        super(checkboxID);
        this.component.checked = initValue;
    }
}


export class Canvas extends Component {
    
    constructor(canvasID) {
        super(canvasID);
        this.canvas = this.component;
        this.context = this.canvas.getContext('2d');
        //this.context.lineCap = 'round';
    }

    transformCoordinates(point) {
      return { x: point.x - this.canvas.offsetLeft, y: point.y - this.canvas.offsetTop }
    }
  
    clear() {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawBackground(color) {
      this.context.fillStyle = color.rgb;
      this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    set alpha(value) {
      this.context.globalAlpha = value;
    }

    set lineWidth(value) {
      this.context.lineWidth = value;
    }

    setStyle(color, lineWith = 1, alpha = 1) {
        this.context.strokeStyle = color.rgb;
        this.context.lineWidth = lineWith;
        this.context.globalAlpha = alpha;
    }
  
    drawPoints(points, radius = 1, color, alpha = 1) {
        this.setStyle(color, 1, alpha);

      points.forEach(point => {
        this.context.beginPath();
        this.context.arc(point.x, point.y, radius, 0, Math.PI * 2);
        this.context.fillStyle = color.rgb;
        this.context.fill();
        this.context.closePath();
      });
    }
  
    drawPath(points, color, lineWith = 1, alpha = 1) {
        this.setStyle(color, lineWith, alpha);

      this.context.beginPath();
      points.forEach((point, index) => {        
        if (index === 0) this.context.moveTo(point.x, point.y);
        else this.context.lineTo(point.x, point.y);
      });
      this.context.stroke();
    }
  
    drawPathInterpolated(points, startColor, endColor, lineWith = 1, alpha = 1) {
        this.setStyle(startColor, lineWith, alpha);

      let currentColor = startColor;
      for (let i = 0; i < points.length - 1; i++) {

        this.context.strokeStyle = currentColor;
        this.context.beginPath();
        this.context.moveTo(points[i].x, points[i].y);
        this.context.lineTo(points[i+1].x, points[i+1].y);
        this.context.stroke();

        currentColor = Color.interpolate(startColor, endColor, i/(points.length - 1)).rgb;
      }
    }
  
    drawCircle(center, radius, angle, color, lineWith = 1, alpha = 1) {
        this.setStyle(color, lineWith, alpha);
      this.context.beginPath();
      this.context.arc(center.x, center.y, radius, angle - Math.PI, angle + Math.PI);
      this.context.stroke();
          
    }
  }