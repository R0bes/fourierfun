import { Canvas, Checkbox, Slider, Color } from './draw-stuff.js';
import { normalizePath, getFourierData } from './math-stuff.js';

document.addEventListener('DOMContentLoaded', () => {

  let drawBackgroundColor = Color.WHITE;
  let animateBackgroundColor = Color.BLACK;
  let inputPointsColor = Color.RED;
  let inputPathColor = Color.interpolate(Color.WHITE, animateBackgroundColor, 0.8);
  let normalizedPointsColor = Color.CYAN;
  let shineColor = Color.YELLOW;
  let animationBackgroundPathColor = Color.interpolate(shineColor, animateBackgroundColor, 0.8);
  let fourierPointColor = Color.YELLOW;
  let amplitudesColor = Color.RED;
  let circlesColor = Color.GREEN;

  let inputPoints = [];
  let normalizedPoints = [];
  let fourierPath = [];
  let fourierAnimation = [];

  let normalizedPointsInitialExponent = 3;
  let normalizedPointsAmount = Math.pow(2, normalizedPointsInitialExponent);

  let animationSpeed = 2;
  let animationSteps = 100;
  let currentAnimationStep = 0;
  let clock = 0;

  let frequenciesAmount = 4;  
  let fourierAlpha = 40;

  let showInputPoints = false;
  let showInputPath = true;
  let showFouruierPath = true;
  let showNormalizedPoints = false;
  let showCircles = true;
  let showAmplitudes = true;
  let showShine = true;

  let closeLoop = true;
  let drawMode = false;
  let recalc = false;

  new Checkbox('input-points-checkbox', showInputPoints).component.addEventListener('input', function() { showInputPoints = this.checked; });
  new Checkbox('input-path-checkbox', showInputPath).component.addEventListener('input', function() { showInputPath = this.checked; });
  new Checkbox('fourier-path-checkbox', showFouruierPath).component.addEventListener('input', function() { showFouruierPath = this.checked; });
  new Checkbox('normalized-points-checkbox', showNormalizedPoints).component.addEventListener('input', function() { showNormalizedPoints = this.checked; });
  new Checkbox('show-circles-checkbox', showCircles).component.addEventListener('input', function() { showCircles = this.checked; });
  new Checkbox('show-amplitudes-checkbox', showCircles).component.addEventListener('input', function() { showAmplitudes = this.checked; });
  new Checkbox('show-shine-checkbox', showCircles).component.addEventListener('input', function() { showShine = this.checked; });
  new Checkbox('close-loop-checkbox', closeLoop).component.addEventListener('input', function() {
    closeLoop = this.checked;
    setLoopClosed(this.checked);
    recalc = true;
  });

  new Slider('speed-slider', animationSpeed).component.addEventListener('input', function() { animationSpeed = this.value; });
  new Slider('frequence-slider', frequenciesAmount).component.addEventListener('input', function() { frequenciesAmount = this.value; recalc = true; });
  new Slider('alpha-slider', fourierAlpha).component.addEventListener('input', function() { fourierAlpha = this.value; });
  new Slider('normalized-slider', normalizedPointsInitialExponent).component.addEventListener('input', function() {
    normalizedPointsInitialExponent = this.value;
    normalizedPointsAmount = Math.pow(2, normalizedPointsInitialExponent);
    recalc = true;
  });  

  const canvas = new Canvas('canvas', drawBackgroundColor);
  
  canvas.component.addEventListener('mousedown', function() {  
    inputPoints = [];
    normalizedPoints = [];
    drawMode = true;
  });
  canvas.component.addEventListener('mousemove', function(e) {
    if (drawMode) inputPoints.push(canvas.transformCoordinates({x: e.clientX, y: e.clientY}));
  });
  canvas.component.addEventListener('mouseup', function() {
    if(closeLoop) setLoopClosed(true);
    drawMode = false;
    recalc = true;
  });

  function setLoopClosed(closed) {
    if(closed) inputPoints.push(inputPoints[0]);
    else inputPoints.pop();
  }

  setInterval(() => {

    if ((clock += animationSpeed) <= 10) return;
    clock = 0;
    
    if (inputPoints.length == 0) return;

    canvas.clear();
    canvas.drawBackground(drawMode ? drawBackgroundColor : animateBackgroundColor);

    if(showInputPath) canvas.drawPath(inputPoints, inputPathColor);    
    if(showInputPoints) canvas.drawPoints(inputPoints, 2, inputPointsColor);
    
    if(drawMode) return;
    
    // fourier calculation
    if (recalc) {
      recalc = false;

      fourierPath = [];
      fourierAnimation = [];
  
      normalizedPoints = normalizePath(inputPoints, normalizedPointsAmount);
      let fourierData = getFourierData(normalizedPoints).sort((a, b) => b.amplitude - a.amplitude);
  
      let stepSize = 1 / animationSteps;
  
      for (let animationStep = 0; animationStep < animationSteps; animationStep++) {
  
        let fourierAnimationStep = [];
        let pos = { x: 0, y: 0 };
  
        for (let i = 0; i < fourierData.length ; i++) {
          const angle = 2 * Math.PI * fourierData[i].freq * animationStep * stepSize + fourierData[i].phase;
          pos = { x: pos.x + fourierData[i].amplitude * Math.cos(angle), y: pos.y + fourierData[i].amplitude * Math.sin(angle) };
          fourierAnimationStep.push({ position: pos, angle: angle, amplitude: fourierData[i].amplitude });
        }
        
        fourierPath.push(pos);
        fourierAnimation.push(fourierAnimationStep);
      }
    }
    
    if(showNormalizedPoints) canvas.drawPoints(normalizedPoints, 2, normalizedPointsColor);  

    // animation
    currentAnimationStep = ++currentAnimationStep % animationSteps;
  
    let animationStepData = fourierAnimation[currentAnimationStep];

    for (let i = 1; i < frequenciesAmount; i++) {
      if (showAmplitudes) canvas.drawPath([animationStepData[i-1].position, animationStepData[i].position], amplitudesColor, 2, fourierAlpha / 100 * 2);
      if (showCircles ) canvas.drawCircle(animationStepData[i-1].position, animationStepData[i].amplitude, animationStepData[i].angle, circlesColor, 1, fourierAlpha / 100);
      if (i == frequenciesAmount - 1) canvas.drawPoints([animationStepData[i].position], 3, fourierPointColor, 1);
    }
 
    if(showFouruierPath) canvas.drawPath(fourierPath, animationBackgroundPathColor, 1, 0.4);

    if (showShine) {    
      let shinePoints = fourierPath.length / 3;
      let shineStart = currentAnimationStep + 1;

      canvas.drawPathInterpolated((shinePoints > shineStart ? 
        [ ...fourierPath.slice(fourierPath.length - shinePoints + shineStart - 1, fourierPath.length - 1), ...fourierPath.slice(0, shineStart) ] :
        fourierPath.slice(shineStart - shinePoints, shineStart)).reverse(), shineColor, animationBackgroundPathColor, 2);
    }
  }, 20); // ms
});