import { Canvas} from './components/canvas.js';
import { Checkbox } from './components/checkbox.js'
import { Slider } from './components/slider.js'
import { Color } from './utils/color.js'
import { normalizePath, resample2dData, getFourierData, slurp } from './math-stuff.js';

document.addEventListener('DOMContentLoaded', () => {

  let inputBackgroundColor = Color.WHITE;
  let outputBackgroundColor = Color.BLACK;
  let inputPointsColor = new Color(255,0,0);
  let inputPathColor = new Color(0,0,0);
  let normalizedPointsColor = new Color(0,255,255);
  let fourierPathColor = Color.YELLOW;


  let inputPoints = [];
  let normalizedPoints = [];
  let fourierData = [];

  let normalizedPointsInitialExponent = 7;
  let normalizedPointsAmount = Math.pow(2, normalizedPointsInitialExponent);

  let animationSpeed = 5;
  let animationPercentage = 0;
  let frequenciesAmount = 10;

  let showInputPoints = false;
  let showInputPath = true;
  let showNormalizedPoints = true;

  let closeLoop = true;

  let draw = false;
  let animate = false;


  new Checkbox('input-points-checkbox', showInputPoints).component.addEventListener('input', function() {
    showInputPoints = this.checked;
    drawInput();
  });

  new Checkbox('input-path-checkbox', showInputPath).component.addEventListener('input', function() {
    showInputPath = this.checked;
    drawInput();
  });

  new Checkbox('normalized-points-checkbox', showNormalizedPoints).component.addEventListener('input', function() {
    showNormalizedPoints = this.checked;
    drawInput();
  });

  new Checkbox('close-loop-checkbox', closeLoop).component.addEventListener('input', function() {
    closeLoop = this.checked;
    setLoopClosed(this.checked);
    drawInput();
  });
  
  console.log(animationSpeed);
  new Slider('speed-slider', animationSpeed).component.addEventListener('input', function() {
    animationSpeed = this.value;
  });

  new Slider('normalized-slider', normalizedPointsInitialExponent).component.addEventListener('input', function() {
    normalizedPointsInitialExponent = this.value;
    normalizedPointsAmount = Math.pow(2, normalizedPointsInitialExponent);
    inputDataChanged();
  });
  
  new Slider('frequence-slider', frequenciesAmount).component.addEventListener('input', function() {
    frequenciesAmount = this.value;
  });
  


  
  const inputCanvas = new Canvas('inputCanvas', inputBackgroundColor);
  
  // left mouse key pressed in left canvas
  inputCanvas.component.addEventListener('mousedown', function() {

    // reset everything
    reset();

    // start drawing mode
    draw = true;
  });

  // mouse moved in left canvas while holding left mouse key
  inputCanvas.component.addEventListener('mousemove', function(e) {

    // check if drawing mode
    if (!draw) return;

    // push new Point
    inputPoints.push(inputCanvas.transformCoordinates({x: e.clientX, y: e.clientY}));

    // redraw inputCanvas
    drawInput();
  });

  // left mouse key released in left canvas after moving
  inputCanvas.component.addEventListener('mouseup', function() {

    // stop drawing mode
    draw = false;
    
    // close loop
    if(closeLoop)
      setLoopClosed(true);
    
    animate = true;
  });


  // get the output Canvas
  const outputCanvas = new Canvas('outputCanvas', outputBackgroundColor);

  // close or open the current loop 
  function setLoopClosed(closed) {
    // to close the loop, add the first point again as last point
    if(closed) {
      inputPoints.push(inputPoints[0]);
    } 
    // to open the loop, remove the last point again
    else {
      inputPoints.pop();
    }
    inputDataChanged();
  }

  function inputDataChanged() {

    // normalize Input
    normalizedPoints = normalizePath(inputPoints, normalizedPointsAmount);

    console.log(normalizedPointsAmount);

    // calculate Fourier
    fourierData = getFourierData(resample2dData(normalizedPoints)); 
    //fourierData.filter(f => f.amplitude > minAmplitude);
    fourierData.sort((a, b) => b.amplitude - a.amplitude);

    // redraw
    drawInput();
  }

  // reset canvas and data
  function reset() {
    inputCanvas.clear();
    outputCanvas.clear();
    inputPoints = [];
    normalizedPoints = [];
    fourierData = [];
    animate = false;
  }

  // draw input & normalized data
  function drawInput() {
    inputCanvas.clear();
    outputCanvas.clear();
    if(showInputPath) {
      inputCanvas.drawPath(inputPoints, 1, inputPathColor);
    }
    if(showInputPoints){
      inputCanvas.drawPoints(inputPoints, 2, inputPointsColor);
    }
    if(showNormalizedPoints){
      inputCanvas.drawPoints(normalizedPoints, 2, normalizedPointsColor);
    }
  }

  // draw fourier animation
  function drawOutput() {
    inputCanvas.clear();
    inputCanvas.drawPathInterpolated(normalizedPoints.slice(0, -normalizedPointsAmount/2), 2, fourierPathColor, outputBackgroundColor);
    
    // draw circles
    let runningX = 0;
    let runningY = 0;
    
    for (let i = 0; i < frequenciesAmount; i ++) {
        const amplitude = fourierData[i].amplitude;
        const angle = 2 * Math.PI * fourierData[i].freq * animationPercentage + fourierData[i].phase;
        
        runningX += amplitude * Math.cos(angle);
        runningY += amplitude * Math.sin(angle);
        if (i == 0) continue; // skip the constant term
        inputCanvas.drawCircle({ x: runningX, y: runningY }, amplitude, angle, Color.GREEN)
    }
  }
  
  setInterval(() => {
    if(!animate) return;

    animationPercentage = (animationPercentage + animationSpeed*0.01) % 1;
    
    drawOutput();

  }, 100); // ms



  //const panel3 = document.getElementById('panel3');
  //const context3 = panel1.getContext('2d');
  //const panel4 = document.getElementById('panel4');
  //const context4 = panel2.getContext('2d');
  
  //  let draw = false;
  //  let points = [];
  //  let animate = false;
  //  let fourierData = [];
  //
  //  function clearPanel(panel) {
  //    panel.getContext('2d').clearRect(0, 0, panel.width, panel.height);
  //  }
//
  //  function startdraw(e) {
  //      // clear canvas
  //      points = [];
  //      context1.clearRect(0, 0, panel1.width, panel1.height);
//
  //      // start drawing
  //      draw = true;
  //      context1.beginPath();
  //      dodraw(e);
  //  }
//
  //  function dodraw(e) {
  //      if (!draw) return;
  //      context1.lineWidth = 2;
  //      context1.lineCap = 'round';
//
  //      addLineSegment(context1, {x: e.clientX, y: e.clientY});
  //  }
//
  //  function endedraw() {
  //      draw = false;        
  //      
  //      // close the path
  //      addLineSegment(context1, points[0]);
  //      
  //      for (let i = 0; i < points.length; i++) {
  //          drawCircle(context1, points[i], 3, 'red')
  //      }
//
  //      
  //      let evenlyDistributedPoints = evenDistribution(points, 128); // 2^x
  //      
  //      
  //      context2.clearRect(0, 0, panel2.width, panel2.height);
  //      for (let i = 0; i < evenlyDistributedPoints.length; i++) {
  //          drawCircle(context2, evenlyDistributedPoints[i], 3, 'red')
  //      }
//
  //      let minAmplitude=0.01
  //      fourierData = getFourierData(resample2dData(evenlyDistributedPoints, evenlyDistributedPoints.length)).filter(f => f.amplitude > minAmplitude);
  //      fourierData.sort((a, b) => b.amplitude - a.amplitude);
//
  //      animate = true;
  //    }
  //    
  //    let animationPercentage = 1;
  //    let path = [];
  //    setInterval(() => {
  //      if(!animate) {
  //        return;
  //      }
//
  //      animationPercentage += (100 / 10000) % 1;
  //      console.log(animationPercentage)
//
  //      while (animationPercentage > 1) {
  //          animationPercentage --;
  //      }
  //      
  //      context2.clearRect(0, 0, panel2.width, panel2.height);
//
  //      // draw path        
  //      let evenlyDistributedPoints = evenDistribution(points, 64); // 2^x        
  //      
  //      for (let i = 0; i/evenlyDistributedPoints.length < animationPercentage; i++) {
  //          drawCircle(context2, evenlyDistributedPoints[i], 3, 'red')
  //      }
//
//
  //      // draw circles
  //      let runningX = 0;
  //      let runningY = 0;
  //      const numFouriers = Math.round(slurp(2, fourierData.length, 1));
  //      for (let i = 0; i < numFouriers; i ++) {
  //          const amplitude = fourierData[i].amplitude;
  //          const angle = 2 * Math.PI * fourierData[i].freq * animationPercentage + fourierData[i].phase;
  //          runningX += amplitude * Math.cos(angle);
  //          runningY += amplitude * Math.sin(angle);
  //          if (i == 0) {
  //              continue; // we skip the first one because we just don't care about rendering the constant term
  //          }
  //          if (amplitude < 0.5) {
  //              continue; // skip the really tiny ones
  //          }
  //          context2.beginPath();
  //          context2.strokeStyle = 'cyan';
  //          context2.globalAlpha = 0.7;
  //          context2.lineWidth = 1;
  //          context2.moveTo(runningX, runningY);
  //          context2.arc(runningX, runningY, amplitude, angle - Math.PI, angle + Math.PI);
  //          context2.stroke();
  //      }
//
  //      context2.globalAlpha = 1;
//
  //      for (let i = 0; i < path.length - 1; i ++) {
  //          context2.beginPath();
  //          context2.strokeStyle = palette.blue;
  //          context2.lineWidth = 2;
  //          context2.moveTo(path[i].x, path[i].y);
  //          context2.lineTo(path[i+1].x, path[i+1].y);
  //          context2.stroke();
  //      }
  //    }, 100);
//
//
  //  function getFourierData(points) {
  //    if (points.length == 0) {
  //        return [];
  //    }
  //  
  //    const numPoints = points.length / 2;
  //    const fft = new FFT(numPoints);
//
  //    const out = fft.createComplexArray();
  //    fft.transform(out, points);
  //
  //    // Transform into an API of points I find friendlier.
  //    const fftData = [];
  //    for (let i = 0; i < numPoints; i ++) {
  //        // to reorder the frequencies a little nicer, we pick from the front and back altermatively
  //        const j = i % 2 == 0 ? i / 2 : numPoints - ((i+1) / 2);
  //        const x = out[2 * j];
  //        const y = out[2 * j + 1];
  //        const freq = ((j + numPoints / 2) % numPoints) - numPoints / 2;
  //        fftData.push({
  //            freq: freq,
  //            // a little expensive
  //            amplitude: Math.sqrt(x * x + y * y) / numPoints,
  //            // a lottle expensive :(
  //            phase: Math.atan2(y, x),
  //        });
  //    }
  //    // fftData.sort((a, b) => b.amplitude - a.amplitude);
  //    console.log(fftData.length);
  //    return fftData;
  //  }
//
  //  function resample2dData(points, numSamples) {
  //    if (points.length == 0) {
  //        // Can't resample if we don't have ANY points
  //        return [];
  //    }
  //    let newPoints = [];
  //    for (let i = 0; i < numSamples; i ++) {
  //        let position = points.length * (i / numSamples);
  //        let index = Math.floor(position);
  //        let nextIndex = (index + 1) % points.length;
  //        let amt = position - index;
  //        newPoints.push(
  //            /* x */ slurp(points[index].x, points[nextIndex].x, amt),
  //            /* y */ slurp(points[index].y, points[nextIndex].y, amt),
  //        )
  //    }
  //    return newPoints;
  //  }
  //  
  //  function slurp(val1, val2, amt) {
  //    return (val2 - val1) * amt + val1;
  //  }
//
  //  function addLineSegment(context, point) {
  //      context.lineTo(point.x - panel1.offsetLeft, point.y - panel1.offsetTop);
  //      context.stroke();
  //      context.beginPath();
  //      context.moveTo(point.x - panel1.offsetLeft, point.y - panel1.offsetTop);
  //      points.push(point);
  //  }
  //  
  //  function drawCircle(context, center, radius, color = 'black') {
  //      context.beginPath();
  //      context.arc(center.x - panel1.offsetLeft, center.y - panel1.offsetTop, radius, 0, Math.PI * 2, true);
  //      context.fillStyle = color;
  //      context.fill();
  //      context.closePath();
  //  }
//
  //  function dist(point1, point2) {
  //      return Math.sqrt(Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2));
  //  }
//
  //  function lerp(start, end, ratio) {
  //      return start + (end - start) * ratio;
  //  }
//
//
  //  function evenDistribution(points, numPoints) {
  //    let totalLength = 0;
  //    let distances = [0];
  //  
  //    // Calculate distances between Points and total lenght
  //    for (let i = 1; i < points.length; i++) {
  //      let distBetweenPoints = dist(points[i-1], points[i]);
  //      totalLength += distBetweenPoints;
  //      distances.push(totalLength);
  //    }
  //  
  //    let evenlyDistributedPoints = [];
  //    let step = totalLength / (numPoints - 1);
  //  
  //    // add first
  //    evenlyDistributedPoints.push(points[0]);
  //  
  //    for (let i = 1; i < numPoints - 1; i++) {
  //      let targetLength = i * step;
  //      for (let j = 1; j < distances.length; j++) {
  //        if (distances[j] >= targetLength) {
  //          let leftover = targetLength - distances[j-1];
  //          let segmentLength = distances[j] - distances[j-1];
  //          let ratio = leftover / segmentLength;
  //          let newX = lerp(points[j-1].x, points[j].x, ratio);
  //          let newY = lerp(points[j-1].y, points[j].y, ratio);
  //          evenlyDistributedPoints.push({x: newX, y: newY});
  //          break;
  //        }
  //      } 
  //    }
  //      
  //    // add last point
  //    evenlyDistributedPoints.push(points[points.length - 1]);
  //    return evenlyDistributedPoints;
  //  }
  //  
});
