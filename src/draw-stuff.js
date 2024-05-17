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
      if (index === 0) {
        // move to first point
        this.context.moveTo(point.x, point.y);
      } else {
        // draw line to any other point
        this.context.lineTo(point.x, point.y);
      }
    });    
    this.context.stroke();
  }

  drawPoints(points, radius = 1, color  = 'red') {
    points.forEach(point => {
      this.context.beginPath();
      this.context.arc(point.x, point.y, radius, 0, Math.PI * 2, true);
      this.context.fillStyle = color;
      this.context.fill();
      this.context.closePath();
    });
  }

  drawCircle(center, radius, angle, lineWidth = 1, color  = 'cyan', globalAlpha = 0.7) {
    this.context.strokeStyle = color;
    this.context.globalAlpha = globalAlpha;
    this.context.lineWidth = lineWidth;

    this.context.moveTo(center.x, center.y);
    this.context.arc(center.x, center.y, radius, angle - Math.PI, angle + Math.PI);
    this.context.stroke();
  }
}
