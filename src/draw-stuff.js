export class CanvasHandler {
    
  constructor(canvasID) {
    this.canvas = document.getElementById(canvasID);
    this.context = this.canvas.getContext('2d');
  }

  clear() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawPath(points, lineWidth = 2, lineCap = 'round') {
    this.context.lineWidth = lineWidth;
    this.context.lineCap = lineCap;
    this.context.beginPath();
    
    points.forEach((point, index) => {
      let canvas_point = this.transform(point);
      if (index === 0) {
        // move to first point
        this.context.moveTo(canvas_point.x, canvas_point.y);
      } else {
        // draw line to any other point
        this.context.lineTo(canvas_point.x, canvas_point.y);
      }
    });    
    this.context.stroke();
  }

  drawPoints(points, radius, color  = 'red') {    
    points.forEach(point => {
      let canvas_point = this.transform(point);
      this.context.beginPath();
      this.context.arc(canvas_point.x, canvas_point.y, radius, 0, Math.PI * 2, true);
      this.context.fillStyle = color;
      this.context.fill();
      this.context.closePath();
    });
  }

  transform(point) {
    return {x: point.x - this.canvas.offsetLeft, y: point.y - this.canvas.offsetTop};
  }
}