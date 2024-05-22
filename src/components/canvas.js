import { Component } from './component.js';
import { Color } from '../utils/color.js'

export class Canvas extends Component {
    
    constructor(canvasID, backgroundColor = Color.WHITE) {
        super(canvasID);
        this.canvas = this.component;
        this.context = this.canvas.getContext('2d');

        this.context.lineWidth = 1;
        this.context.lineCap = 'round';

        this.backgroundColor = backgroundColor;
        this.drawBackground();
    }

    transformCoordinates(point) {
      return { x: point.x - this.canvas.offsetLeft, y: point.y - this.canvas.offsetTop }
    }
  
    clear() {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawBackground() {
      this.context.fillStyle = this.backgroundColor.rgb;
      this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    set background(value) {
      this.backgroundColor = value;
    }

    set alpha(value) {
      this.context.globalAlpha = value;
    }

    set lineWidth(value) {
      this.context.lineWidth = value;
    }
  
    drawPoints(points, radius = 1, color = Color.RED) {
      points.forEach(point => {
        this.context.beginPath();
        this.context.arc(point.x, point.y, radius, 0, Math.PI * 2);
        this.context.fillStyle = color.rgb;
        this.context.fill();
        this.context.closePath();
      });
    }
  
    drawPath(points, color = Color.BLACK) {

      this.context.strokeStyle = color.rgb;

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
  
    drawPathInterpolated(points, startColor, endColor) {

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
  
    drawCircle(center, radius, angle, color = Color.CYAN) {
      this.context.strokeStyle = color.rgb;

      this.context.beginPath();
      this.context.arc(center.x, center.y, radius, angle - Math.PI, angle + Math.PI);
      this.context.stroke();
          
    }
  }
  