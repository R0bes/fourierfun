import { GenericMultiMachine } from './GenericMultiMachine';

window.onload = () => {
  // Canvas und Context Setup ZUERST
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  if (!canvas) {
    console.error('Canvas nicht gefunden!');
    return;
  }
  
  const context = canvas.getContext('2d');
  if (!context) {
    console.error('2D Context nicht gefunden!');
    return;
  }
  
  // Canvas-Größe setzen - auf den sichtbaren Bereich beschränken
  const menuWidth = 300; // Width of the right menu
  canvas.width = window.innerWidth - menuWidth;
  canvas.height = window.innerHeight;
  
  // Jetzt erst GenericMultiMachine erstellen (nach Canvas-Setup)
  const multiMachine = new GenericMultiMachine();
  
  // Setze MultiMachine global verfügbar für HTML
  (window as any).multiMachine = multiMachine;

  // wire controls
  const $ = (id: string) => document.getElementById(id) as HTMLInputElement;
  const freq = $('freq');
  const speed = $('speed');
  const alpha = $('alpha');
  const toggleCircles = $('toggleCircles') as HTMLInputElement;
  const toggleLines = $('toggleLines') as HTMLInputElement;
  const toggleTrail = $('toggleTrail') as HTMLInputElement;
  const trailLength = $('trailLength');
  const trailBrightness = $('trailBrightness');
  
  // Grid controls
  const toggleGrid = $('toggleGrid') as HTMLInputElement;
  const cellSize = $('cellSize') as HTMLInputElement;
  const reset = document.getElementById('reset') as HTMLButtonElement;

  // Neue Grid-Controls
  const toggleRainbowMode = $('toggleRainbowMode') as HTMLInputElement;
  const toggleParticleSystem = $('toggleParticleSystem') as HTMLInputElement;

  // Additional controls that were missing
  const cell = $('cell');
  const samples = $('samples');
  const toggleCharTrail = $('toggleCharTrail') as HTMLInputElement;
  const characterTrailLength = $('characterTrailLength');
  const characterTrailIntensity = $('characterTrailIntensity');
  const imageThreshold = $('imageThreshold');
  const imageUpload = document.getElementById('imageUpload') as HTMLInputElement;
  const uploadImage = document.getElementById('uploadImage') as HTMLButtonElement;

  // Neue Controls für erweiterte Visualisierungen
  const toggleHarmonics = $('toggleHarmonics') as HTMLInputElement;
  const harmonicsCount = $('harmonicsCount');
  const toggleFrequencySpectrum = $('toggleFrequencySpectrum') as HTMLInputElement;
  const togglePhaseDiagram = $('togglePhaseDiagram') as HTMLInputElement;
  const glowIntensity = $('glowIntensity');

  // Helper function to update control values
  const updateControlValue = (id: string, value: string | number) => {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = String(value);
    }
  };
  
  // Setze updateControlValue global verfügbar für HTML
  (window as any).updateControlValue = updateControlValue;

  // Einstellungen für die aktive Maschine
  if (freq) freq.oninput = () => { 
    const activeMachine = multiMachine.getActiveMachine();
    if (activeMachine) {
      activeMachine.frequenciesAmount = parseInt(freq.value, 10);
      if (activeMachine.drawing.length >= 3) activeMachine.calculateFourier();
    }
  };
  if (speed) speed.oninput = () => { 
    multiMachine.getAllMachines().forEach(machine => {
      machine.animationSpeed = parseFloat(speed.value);
    });
  };
  if (alpha) alpha.oninput = () => { 
    multiMachine.getAllMachines().forEach(machine => {
      machine.fourierAlpha = parseFloat(alpha.value);
    });
  };
  if (toggleCircles) toggleCircles.oninput = () => { 
    multiMachine.getAllMachines().forEach(machine => {
      machine.showCircles = toggleCircles.checked;
    });
  };
  if (toggleLines) toggleLines.oninput = () => { 
    multiMachine.getAllMachines().forEach(machine => {
      machine.showAmplitudes = toggleLines.checked;
    });
  };
  if (toggleTrail) toggleTrail.oninput = () => { 
    multiMachine.getAllMachines().forEach(machine => {
      machine.showTrail = toggleTrail.checked;
    });
  };
  if (trailLength) trailLength.oninput = () => { 
    multiMachine.getAllMachines().forEach(machine => {
      machine.trailLength = parseInt(trailLength.value, 10);
    });
  };
  if (trailBrightness) trailBrightness.oninput = () => { 
    multiMachine.getAllMachines().forEach(machine => {
      machine.trailBrightness = parseFloat(trailBrightness.value);
    });
  };
  if (reset) reset.onclick = () => { multiMachine.clearAllMachines(); };

  // Grid controls
  if (toggleGrid) toggleGrid.oninput = () => { 
    multiMachine.setGridProperty('showGrid', toggleGrid.checked);
  };
  
  // Neue Grid-Controls
  
  if (toggleRainbowMode) toggleRainbowMode.oninput = () => { 
    multiMachine.setGridProperty('rainbowMode', toggleRainbowMode.checked);
  };
  
  if (toggleParticleSystem) toggleParticleSystem.oninput = () => { 
    multiMachine.setGridProperty('particleSystem', toggleParticleSystem.checked);
  };
  
  if (cellSize) cellSize.oninput = () => {
    multiMachine.setGridProperty('cellSize', parseInt(cellSize.value, 10));
  };

  // Additional control handlers
  if (cell) cell.oninput = () => {
    // This could be used for grid cell styling
    updateControlValue('cellValue', cell.value);
    // TODO: Implement grid cell styling based on cell value
    console.log('Cell styling changed to:', cell.value);
    
    // Connect to grid styling - could affect cell appearance
    const cellValue = parseInt(cell.value, 10);
    // This could be used to control grid cell visual properties
    // For now, just log the change
    multiMachine.setGridProperty('cell', cellValue);
  };


  if (samples) samples.oninput = () => {
    // This could be used for Fourier calculation precision
    updateControlValue('samplesValue', samples.value);
    const sampleCount = parseInt(samples.value, 10);
    multiMachine.setSamplesForAllMachines(sampleCount);
  };

  if (toggleCharTrail) toggleCharTrail.oninput = () => {
    // This could be used to toggle character trail rendering
    console.log('Char trail toggled:', toggleCharTrail.checked);
    multiMachine.setGridProperty('showCharTrail', toggleCharTrail.checked);
  };


  if (characterTrailLength) characterTrailLength.oninput = () => {
    updateControlValue('characterTrailLengthValue', characterTrailLength.value);
    // This could be used to control character trail length
    multiMachine.setGridProperty('characterTrailLength', parseInt(characterTrailLength.value, 10));
  };

  if (characterTrailIntensity) characterTrailIntensity.oninput = () => { 
    multiMachine.setGridProperty('characterTrailIntensity', parseFloat(characterTrailIntensity.value));
    updateControlValue('characterTrailIntensityValue', characterTrailIntensity.value);
  };
  
  // Neue Controls für erweiterte Visualisierungen
  if (toggleHarmonics) toggleHarmonics.oninput = () => { 
    multiMachine.setGridProperty('showHarmonics', toggleHarmonics.checked);
  };
  
  if (harmonicsCount) harmonicsCount.oninput = () => { 
    const value = parseInt(harmonicsCount.value, 10);
    multiMachine.getAllMachines().forEach(machine => {
      machine.harmonicsCount = value;
    });
    updateControlValue('harmonicsCountValue', harmonicsCount.value);
  };
  
  if (toggleFrequencySpectrum) toggleFrequencySpectrum.oninput = () => { 
    multiMachine.setGridProperty('showFrequencySpectrum', toggleFrequencySpectrum.checked);
  };
  
  if (togglePhaseDiagram) togglePhaseDiagram.oninput = () => { 
    multiMachine.setGridProperty('showPhaseDiagram', togglePhaseDiagram.checked);
  };
  
  if (glowIntensity) glowIntensity.oninput = () => { 
    const value = parseFloat(glowIntensity.value);
    multiMachine.getAllMachines().forEach(machine => {
      machine.glowIntensity = value;
    });
    updateControlValue('glowIntensityValue', glowIntensity.value);
  };

  if (imageThreshold) imageThreshold.oninput = () => {
    updateControlValue('imageThresholdValue', imageThreshold.value);
    // This could be used for image processing threshold
    const threshold = parseInt(imageThreshold.value, 10);
    console.log('Image threshold changed to:', threshold);
    multiMachine.setGridProperty('imageThreshold', threshold);
  };

  if (uploadImage && imageUpload) {
    uploadImage.onclick = () => {
      imageUpload.click();
    };
    
    imageUpload.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        console.log('Image selected:', file.name);
        try {
          await multiMachine.processImageUpload(file);
          console.log('✅ Bild erfolgreich verarbeitet!');
        } catch (error) {
          console.error('❌ Fehler bei der Bildverarbeitung:', error);
          alert(`Fehler bei der Bildverarbeitung: ${error}`);
        }
      }
    };
  }

  // Maschinen-Auswahl mit Radio-Buttons
  const machineRadios = document.querySelectorAll('input[name="machine"]') as NodeListOf<HTMLInputElement>;
  machineRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      if (radio.checked) {
        multiMachine.setActiveMachine(radio.value);
        // Farbanzeige aktualisieren
        const updateColorDisplay = (window as any).updateColorDisplay;
        if (updateColorDisplay) {
          updateColorDisplay(radio.value);
        }
        // Aktive Maschinen-Info aktualisieren
        const updateActiveMachineInfo = (window as any).updateActiveMachineInfo;
        if (updateActiveMachineInfo) {
          updateActiveMachineInfo(radio.value);
        }
      }
    });
  });

  // Canvas Event Listener
  let isDrawing = false;
  
  canvas.addEventListener('pointerdown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    multiMachine.startDrawing(x, y);
    isDrawing = true;
  });
  
  canvas.addEventListener('pointermove', (e) => {
    if (!isDrawing) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    multiMachine.continueDrawing(x, y);
  });
  
  canvas.addEventListener('pointerup', () => {
    if (isDrawing) {
      multiMachine.finishDrawing();
      isDrawing = false;
    }
  });

  // Resize handling
  const handleResize = () => {
    const menuWidth = 300; // Width of the right menu
    canvas.width = window.innerWidth - menuWidth;
    canvas.height = window.innerHeight;
    multiMachine.handleResize();
  };
  
  window.addEventListener('resize', handleResize);
  


  // Animation Loop
  const loop = () => {
    // Canvas leeren
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    // Alle Maschinen updaten und rendern
    multiMachine.update();
    multiMachine.render(context);
    
    requestAnimationFrame(loop);
  };

  requestAnimationFrame(loop);
};