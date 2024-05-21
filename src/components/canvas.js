import { Component } from './component.js';
import { Color } from '../utils/color.js'

export class Canvas extends Component {
    
    constructor(canvasID, backgroundColor = Color.WHITE) {
        super(canvasID);
        this.canvas = this.component;
        this.context = this.canvas.getContext('2d');
        this.backgroundColor = backgroundColor;
        this.background();
    }

    transformCoordinates(point) {
      return { x: point.x - this.canvas.offsetLeft, y: point.y - this.canvas.offsetTop }
    }
  
    clear() {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.background();
    }

    background() {
      this.context.fillStyle = this.backgroundColor.rgb;
      this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
  
    drawPoints(points, radius = 1, color  = Color.RED) {
      points.forEach(point => {
        this.context.beginPath();
        this.context.arc(point.x, point.y, radius, 0, Math.PI * 2, true);
        this.context.fillStyle = color.rgb;
        this.context.fill();
        this.context.closePath();
      });
    }
  
    drawPath(points, lineWidth = 2, startColor = Color.BLACK) {

      this.context.lineWidth = lineWidth;
      this.context.lineCap = 'round';
      this.context.strokeStyle = startColor.rgb;

      this.context.beginPath();

      let factor = 1 / points.length;
      
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
  
    drawPathInterpolated(points, lineWidth = 2, startColor, endColor) {

      this.context.lineWidth = lineWidth;
      this.context.lineCap = 'round';

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
  
    drawCircle(center, radius, angle, color  = Color.CYAN, lineWidth = 1, globalAlpha = 0.7) {
      this.context.strokeStyle = color.rgb;
      this.context.globalAlpha = globalAlpha;
      this.context.lineWidth = lineWidth;
  
      this.context.moveTo(center.x, center.y);
      this.context.arc(center.x, center.y, radius, angle - Math.PI, angle + Math.PI);
      this.context.stroke();
    }
  }
  