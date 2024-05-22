import { Canvas} from './components/canvas.js';
import { Checkbox } from './components/checkbox.js'
import { Slider } from './components/slider.js'
import { Color } from './utils/color.js'
import { normalizePath, resample2dData, getFourierData, slurp } from './math-stuff.js';

document.addEventListener('DOMContentLoaded', () => {

  let drawBackgroundColor = Color.WHITE;
  let animateBackgroundColor = Color.BLACK;
  let inputPointsColor = Color.RED;
  let inputPathColor = Color.interpolate(Color.WHITE, animateBackgroundColor, 0.8);
  let normalizedPointsColor = Color.CYAN;
  let shineColor = Color.YELLOW;
  let animationBackgroundPathColor = Color.interpolate(shineColor, animateBackgroundColor, 0.8);


  let inputPoints = [];
  let normalizedPoints = [];
  let fourierData = [];

  let normalizedPointsInitialExponent = 3;
  let normalizedPointsAmount = Math.pow(2, normalizedPointsInitialExponent);

  let animationSpeed = 2;
  let animationSteps = 100;
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

  let draw = false;
  let animate = false;


  new Checkbox('input-points-checkbox', showInputPoints).component.addEventListener('input', function() {
    showInputPoints = this.checked;
    render();
  });

  new Checkbox('input-path-checkbox', showInputPath).component.addEventListener('input', function() {
    showInputPath = this.checked;
    render();
  });

  new Checkbox('fourier-path-checkbox', showFouruierPath).component.addEventListener('input', function() {
    showFouruierPath = this.checked;
    render();
  });
  
  new Checkbox('normalized-points-checkbox', showNormalizedPoints).component.addEventListener('input', function() {
    showNormalizedPoints = this.checked;
    render();
  });

  new Checkbox('close-loop-checkbox', closeLoop).component.addEventListener('input', function() {
    closeLoop = this.checked;
    setLoopClosed(this.checked);
    inputDataChanged();
    render();
  });
  
  new Slider('speed-slider', animationSpeed).component.addEventListener('input', function() {
    animationSpeed = this.value;
    render();
  });

  new Slider('normalized-slider', normalizedPointsInitialExponent).component.addEventListener('input', function() {
    normalizedPointsInitialExponent = this.value;
    normalizedPointsAmount = Math.pow(2, normalizedPointsInitialExponent);
    inputDataChanged();
    render();
  });
  
  new Slider('frequence-slider', frequenciesAmount).component.addEventListener('input', function() {
    frequenciesAmount = this.value;
  });
  
  new Checkbox('show-circles-checkbox', showCircles).component.addEventListener('input', function() {
    showCircles = this.checked;
  });
  
  new Checkbox('show-amplitudes-checkbox', showCircles).component.addEventListener('input', function() {
    showAmplitudes = this.checked;
  });
  
  new Checkbox('show-shine-checkbox', showCircles).component.addEventListener('input', function() {
    showShine = this.checked;
  });
  
  new Slider('alpha-slider', fourierAlpha).component.addEventListener('input', function() {
    fourierAlpha = this.value;
  });

  
  const canvas = new Canvas('canvas', drawBackgroundColor);
  
  // left mouse key pressed in left canvas
  canvas.component.addEventListener('mousedown', function() {

    // switch mode
    draw = true;
    animate = false;

    canvas.background = drawBackgroundColor;

    // reset everything
    reset();
  });

  // mouse moved in left canvas while holding left mouse key
  canvas.component.addEventListener('mousemove', function(e) {

    // check if drawing mode
    if (!draw) return;

    // push new Point
    inputPoints.push(canvas.transformCoordinates({x: e.clientX, y: e.clientY}));

    // redraw inputCanvas
    render();
  });

  // left mouse key released in left canvas after moving
  canvas.component.addEventListener('mouseup', function() {

    // switch mode
    draw = false;
    animate = true;

    canvas.background = animateBackgroundColor;
    
    // close loop? 
    if(closeLoop) setLoopClosed(true);
    
    inputDataChanged();
    render();
  });


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
  }

  
  function inputDataChanged() {

    // normalize Input
    normalizedPoints = normalizePath(inputPoints, normalizedPointsAmount);

    calculateFourier();
  }


  // reset canvas and data
  function reset() {
    canvas.clear();
    inputPoints = [];
    normalizedPoints = [];
    fourierData = [];
    animate = false;
  }

  let fourierPath = [];
  let fourierAnimation = [];

  function calculateFourier() {

    fourierData = getFourierData(resample2dData(normalizedPoints));
    //fourierData.filter(f => f.amplitude > minAmplitude);
    fourierData.sort((a, b) => b.amplitude - a.amplitude);

    fourierPath = [];
    fourierAnimation = [];

    let stepSize = 1 / animationSteps;

    for (let animationStep = 0; animationStep < animationSteps; animationStep++) {

      let fourierAnimationStep = [];

      let posX = 0;
      let posY = 0;

      for (let i = 0; i < fourierData.length ; i++) {

        const angle = 2 * Math.PI * fourierData[i].freq * animationStep * stepSize + fourierData[i].phase;
        
        posX += fourierData[i].amplitude * Math.cos(angle);
        posY += fourierData[i].amplitude * Math.sin(angle);
        
        fourierAnimationStep.push({
          position: {
            x: posX,
            y: posY
          },
          angle: angle,
          amplitude: fourierData[i].amplitude
        });
      }

      fourierPath.push({x: posX, y: posY});
      fourierAnimation.push(fourierAnimationStep);
    }
  }

  // draw input & normalized data
  function render(animationStep = 0) {

    canvas.clear();
    canvas.drawBackground();

    if(showInputPath) {
      canvas.drawPath(inputPoints, inputPathColor);
    }
    if(showInputPoints) {
      canvas.drawPoints(inputPoints, 2, inputPointsColor);
    }
    if(showNormalizedPoints) {
      canvas.drawPoints(normalizedPoints, 2, normalizedPointsColor);
    }

    if(!animate) return;


    let shinePoints = fourierPath.length / 3; // L
    let shineStart = Math.floor(currentAnimationStep + 2); // S

    let shinePath = [];

    if (shinePoints <= shineStart) {
      shinePath = fourierPath.slice(shineStart - shinePoints, shineStart);
    } else {
      let tmp1 = fourierPath.slice(fourierPath.length - shinePoints + shineStart - 1, fourierPath.length - 1);
      let tmp2 = fourierPath.slice(0, shineStart);
      shinePath = [...tmp1, ...tmp2];
    }

    let animationStepData = fourierAnimation[currentAnimationStep]; 

    canvas.lineWidth = 2;   
    for (let i = 1; i < frequenciesAmount; i++) {
      
      canvas.alpha = fourierAlpha / 100 * 2;
      if (showAmplitudes) {
        canvas.drawPath([animationStepData[i-1].position, animationStepData[i].position], Color.RED);
      }

      canvas.alpha = fourierAlpha / 100;
      if (showCircles ) {
        canvas.drawCircle(animationStepData[i-1].position, animationStepData[i].amplitude, animationStepData[i].angle, Color.GREEN);
      }
      
      canvas.alpha = 1;
      if (i == frequenciesAmount - 1) {
        canvas.drawPoints([animationStepData[i].position], 3, Color.YELLOW);
      }
    }
 
    canvas.alpha = fourierAlpha / 100;
    if(showFouruierPath) {
      canvas.drawPath(fourierPath, animationBackgroundPathColor);
    }

    canvas.alpha = 1;
    if (showShine) {
      canvas.drawPathInterpolated(shinePath.reverse(), shineColor, animationBackgroundPathColor);
    }
  }
  
  let currentAnimationStep = 0;
  let clock = 0;
  setInterval(() => {
    if(!animate) return;

    clock += animationSpeed * 10;

    if (clock >= 100) {
      clock = 0;
      currentAnimationStep = ++currentAnimationStep % animationSteps;
    }
    
    render();

  }, 20); // ms
});
