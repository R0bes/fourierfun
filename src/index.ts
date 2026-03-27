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
  
  // Prevent browser scroll/zoom gestures from stealing the stroke; layout comes from updateCanvasLayout (HTML)
  canvas.style.touchAction = 'none'

  const syncCanvasFromLayout = () => {
    const fn = (window as unknown as { updateCanvasLayout?: () => void }).updateCanvasLayout
    if (typeof fn === 'function') {
      fn()
    } else {
      const menuW = window.matchMedia('(max-width: 900px)').matches ? 0 : 320
      canvas.style.left = '0px'
      canvas.style.width = `${window.innerWidth - menuW}px`
      canvas.width = window.innerWidth - menuW
      canvas.height = window.innerHeight
      const mm = (window as unknown as { multiMachine?: { handleResize: () => void } }).multiMachine
      if (mm?.handleResize) mm.handleResize()
    }
  }

  syncCanvasFromLayout()

  // Jetzt erst GenericMultiMachine erstellen (nach Canvas-Setup)
  const multiMachine = new GenericMultiMachine()
  
  // Setze MultiMachine global verfügbar für HTML
  ;(window as any).multiMachine = multiMachine

  syncCanvasFromLayout()

  // wire controls
  const $ = (id: string) => document.getElementById(id) as HTMLInputElement;
  const freq = $('freq');
  const speed = $('speed');
  const toggleCircles = $('toggleCircles') as HTMLInputElement;
  const toggleLines = $('toggleLines') as HTMLInputElement;
  const toggleTrail = $('toggleTrail') as HTMLInputElement;
  const trailLength = $('trailLength');
  
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
  const toggleFourierPanelsExpanded = $('toggleFourierPanelsExpanded') as HTMLInputElement;
  const toggleFrequencySpectrum = $('toggleFrequencySpectrum') as HTMLInputElement;
  const togglePhaseDiagram = $('togglePhaseDiagram') as HTMLInputElement;

  // Recording controls
  const recordingDuration = $('recordingDuration');
  const recordingFrameRate = $('recordingFrameRate');
  const startRecording = document.getElementById('startRecording') as HTMLButtonElement;
  const stopRecording = document.getElementById('stopRecording') as HTMLButtonElement;
  const recordingStatus = document.getElementById('recordingStatus') as HTMLDivElement;
  const recordingProgress = document.getElementById('recordingProgress') as HTMLDivElement;
  const recordingStatusText = document.getElementById('recordingStatusText') as HTMLSpanElement;

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
    const raw = parseInt(trailLength.value, 10);
    multiMachine.getAllMachines().forEach(machine => {
      const max = machine.getMaxTrailLength ? machine.getMaxTrailLength() : 200;
      machine.trailLength = Math.max(0, Math.min(raw, max));
    });
    updateControlValue('trailLengthValue', trailLength.value);
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
  if (toggleFourierPanelsExpanded) toggleFourierPanelsExpanded.oninput = () => {
    multiMachine.setGridProperty('fourierPanelsExpanded', toggleFourierPanelsExpanded.checked);
  };

  if (toggleFrequencySpectrum) toggleFrequencySpectrum.oninput = () => { 
    multiMachine.setGridProperty('showFrequencySpectrum', toggleFrequencySpectrum.checked);
  };
  
  if (togglePhaseDiagram) togglePhaseDiagram.oninput = () => { 
    multiMachine.setGridProperty('showPhaseDiagram', togglePhaseDiagram.checked);
  };

  // Recording control handlers
  if (recordingDuration) recordingDuration.oninput = () => {
    updateControlValue('recordingDurationValue', recordingDuration.value + 's');
  };

  if (recordingFrameRate) recordingFrameRate.oninput = () => {
    updateControlValue('recordingFrameRateValue', recordingFrameRate.value + ' FPS');
  };

  if (startRecording) startRecording.onclick = () => {
    const duration = parseFloat(recordingDuration?.value || '5') * 1000; // Convert to milliseconds
    multiMachine.startRecording(duration);
    
    // Update UI
    startRecording.disabled = true;
    stopRecording.disabled = false;
    recordingStatus.style.display = 'block';
    recordingStatusText.textContent = 'Aufnahme läuft...';
  };

  if (stopRecording) stopRecording.onclick = () => {
    multiMachine.stopRecording();
    
    // Update UI
    startRecording.disabled = false;
    stopRecording.disabled = true;
    recordingStatus.style.display = 'none';
    recordingProgress.style.width = '0%';
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
      imageUpload.value = '';
      imageUpload.click();
    };
    imageUpload.onchange = async (e) => {
      const input = e.target as HTMLInputElement;
      const file = input.files?.[0];
      if (!file) return;
      if (!multiMachine.getActiveMachine()) {
        alert('Bitte zuerst im Tab „Maschine“ eine Maschine auswählen.');
        return;
      }
      try {
        await multiMachine.processImageUpload(file);
        console.log('Bild erfolgreich verarbeitet');
      } catch (error) {
        console.error('Fehler bei der Bildverarbeitung:', error);
        alert(error instanceof Error ? error.message : 'Fehler bei der Bildverarbeitung');
      }
      input.value = '';
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

  // Canvas: pointer capture so touch drags stay on the canvas
  let isDrawing = false
  let activePointerId: number | null = null

  const endStroke = (e: PointerEvent) => {
    if (activePointerId !== null && e.pointerId !== activePointerId) return
    if (activePointerId !== null) {
      try {
        if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId)
      } catch {
        /* ignore */
      }
      activePointerId = null
    }
    if (isDrawing) {
      multiMachine.finishDrawing()
      isDrawing = false
    }
  }

  canvas.addEventListener('pointerdown', (e) => {
    if (!e.isPrimary || e.button !== 0) return
    e.preventDefault()
    canvas.setPointerCapture(e.pointerId)
    activePointerId = e.pointerId
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    multiMachine.startDrawing(x, y)
    isDrawing = true
  })

  canvas.addEventListener('pointermove', (e) => {
    if (!isDrawing || e.pointerId !== activePointerId) return
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    multiMachine.continueDrawing(x, y)
  })

  canvas.addEventListener('pointerup', endStroke)
  canvas.addEventListener('pointercancel', endStroke)

  window.addEventListener('resize', () => syncCanvasFromLayout())
  


  // Animation Loop
  const loop = () => {
    // Canvas leeren
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    // Alle Maschinen updaten und rendern
    multiMachine.update();
    multiMachine.render(context);
    
    // Update recording progress
    if (multiMachine.isCurrentlyRecording()) {
      const progress = multiMachine.getRecordingProgress();
      if (recordingProgress) {
        recordingProgress.style.width = `${progress * 100}%`;
      }
      if (recordingStatusText) {
        const remaining = Math.ceil((1 - progress) * parseFloat(recordingDuration?.value || '5'));
        recordingStatusText.textContent = `Aufnahme läuft... ${remaining}s verbleibend`;
      }
    }
    
    requestAnimationFrame(loop);
  };

  requestAnimationFrame(loop);
};