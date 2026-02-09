import React from 'react'
import { DrawingCanvas } from './components/DrawingCanvas'
import { Menu } from './components/Menu'
import { useCurve } from './hooks/useCurve'
import { useSettings } from './hooks/useSettings'
import { useDragDrop } from './hooks/useDragDrop'

function App() {
  const { curveData, addPoint, addLinePoints, closeCurve, configureCurve, startCurve, updatePoint, insertPoint, deletePoint, updateUniformPoints, updateCenterOfMass, updateCenterOfMassAutomatically, initializeCenterOfMass, startFourier, stopFourier, updateAnimationTime, updateAnimationStep, clearCurve, goToDrawPhase, loadImage, processImage, extractPointsFromProcessedImage } = useCurve()
  const { settings, updateSetting } = useSettings()
  const { dragState, startDraggingCenter, stopDraggingCenter, toggleDraggingPoint, stopAllDragging } = useDragDrop()

  const handleCloseCurve = () => {
    closeCurve(settings.autoCalculateCenter)
  }

  const handleAddPoint = (point: { x: number; y: number }) => {
    addPoint(point)
  }

  const handleAddLinePoints = (points: { x: number; y: number }[]) => {
    // Add all points from the line at once
    addLinePoints(points)
    // Update uniform points and center of mass after adding line points
    updateUniformPoints(settings.numUniformPoints, settings.autoCalculateCenter)
    updateCenterOfMassAutomatically(settings.autoCalculateCenter)
  }

  const handleUpdatePoint = (index: number, point: { x: number; y: number }) => {
    updatePoint(index, point)
    updateUniformPoints(settings.numUniformPoints, settings.autoCalculateCenter)
    updateCenterOfMassAutomatically(settings.autoCalculateCenter)
  }

  const handleInsertPoint = (index: number, point: { x: number; y: number }) => {
    insertPoint(index, point)
    updateUniformPoints(settings.numUniformPoints, settings.autoCalculateCenter)
    updateCenterOfMassAutomatically(settings.autoCalculateCenter)
  }

  const handleDeletePoint = (index: number) => {
    deletePoint(index)
    updateUniformPoints(settings.numUniformPoints, settings.autoCalculateCenter)
    updateCenterOfMassAutomatically(settings.autoCalculateCenter)
  }

  const handleUpdateCenterOfMass = (point: { x: number; y: number }) => {
    updateCenterOfMass(false, point) // Don't auto-calculate when manually dragging
  }

  const handleInitializeCenterOfMass = () => {
    initializeCenterOfMass()
  }

  const handleConfigureCurve = () => {
    configureCurve()
  }

  const handleStartCurve = () => {
    startCurve()
  }

  const handleStartFourier = () => {
    startFourier()
  }

  const handleStopFourier = () => {
    stopFourier()
  }

  const handlePreviousPhase = () => {
    if (curveData.isCurveFixed) {
      // Run -> Config
      // Stop animation and go back to config
      stopFourier()
    } else if (curveData.isCurveConfigured) {
      // Config -> Draw
      // Go back to draw phase
      goToDrawPhase()
    }
    // No going back from draw phase (it's the first phase)
  }

  const handleNextPhase = () => {
    if (!curveData.isCurveConfigured) {
      // Draw -> Config (only if curve is closed)
      if (curveData.isCurveClosed) {
        handleConfigureCurve()
      }
    } else if (!curveData.isCurveFixed) {
      // Config -> Run
      handleStartCurve()
    }
  }

  // Show legend when phase changes
  React.useEffect(() => {
    updateSetting('legendVisible', true)
  }, [curveData.isCurveClosed, curveData.isCurveFixed])

  const handleUpdateSetting = <K extends keyof typeof settings>(key: K, value: typeof settings[K]) => {
    updateSetting(key, value)
    
    // Update uniform points when numUniformPoints changes
    if (key === 'numUniformPoints') {
      updateUniformPoints(value as number, settings.autoCalculateCenter)
      updateCenterOfMassAutomatically(settings.autoCalculateCenter)
    }
    
    // Update center of mass when autoCalculateCenter changes
    if (key === 'autoCalculateCenter') {
      updateCenterOfMassAutomatically(value as boolean)
    }
    
    // Process image when image processing settings change
    if (key.startsWith('image')) {
      processImage({ ...settings, [key]: value })
    }
  }

  const handleLoadImage = (file: File) => {
    loadImage(file)
  }

  const handleProcessImage = () => {
    processImage(settings)
  }

  const handleExtractPoints = () => {
    const points = extractPointsFromProcessedImage()
    if (points.length > 0) {
      // Use the addLinePoints function to create curve from extracted points
      addLinePoints(points)
    }
  }

  // Determine current phase for CSS class
  const getPhaseClass = () => {
    if (!curveData.isCurveClosed) {
      return 'phase-1-scene' // Draw phase (no points yet)
    } else if (!curveData.isCurveConfigured) {
      return 'phase-1-scene' // Still draw phase (but curve is closed)
    } else if (!curveData.isCurveFixed) {
      return 'phase-2-scene' // Config phase
    } else {
      return 'phase-3-scene' // Run phase
    }
  }

  return (
    <div className={getPhaseClass()} style={{
      display: 'flex',
      height: '100vh',
      padding: '20px',
      gap: '20px',
      position: 'relative'
    }}>
      {/* Drawing Canvas - Konva Version */}
      <div style={{ 
        flex: 1,
        position: 'relative'
      }}>
        <div className="glass-container" style={{
          width: '100%',
          height: '100%',
          padding: '0px',
          position: 'relative'
        }}>
                      <DrawingCanvas
                        curveData={curveData}
                        settings={settings}
                        dragState={dragState}
                        onAddPoint={handleAddPoint}
                        onCloseCurve={handleCloseCurve}
                        onUpdatePoint={handleUpdatePoint}
                        onInsertPoint={handleInsertPoint}
                        onDeletePoint={handleDeletePoint}
                        onUpdateCenterOfMass={handleUpdateCenterOfMass}
                        onInitializeCenterOfMass={handleInitializeCenterOfMass}
                        onStartDraggingCenter={startDraggingCenter}
                        onStopDraggingCenter={stopDraggingCenter}
                        onToggleDraggingPoint={toggleDraggingPoint}
                        onStopAllDragging={stopAllDragging}
                        onUpdateSetting={handleUpdateSetting}
                        onConfigureCurve={handleConfigureCurve}
                        onStartCurve={handleStartCurve}
                        onStartFourier={handleStartFourier}
                        onStopFourier={handleStopFourier}
                        onUpdateAnimationTime={updateAnimationTime}
                        onUpdateAnimationStep={updateAnimationStep}
                        onAddLinePoints={handleAddLinePoints}
                      />
        </div>
      </div>

      {/* Menu Panel */}
      <div className="glass-container" style={{
        width: '480px', // 50% breiter (320px * 1.5)
        height: 'fit-content',
        maxHeight: 'calc(100vh - 40px)',
        overflowY: 'auto'
      }}>
                    <Menu
                      settings={settings}
                      curveData={curveData}
                      onUpdateSetting={handleUpdateSetting}
                      onClearCurve={clearCurve}
                      onConfigureCurve={handleConfigureCurve}
                      onStartCurve={handleStartCurve}
                      onPreviousPhase={handlePreviousPhase}
                      onNextPhase={handleNextPhase}
                      onLoadImage={handleLoadImage}
                      onProcessImage={handleProcessImage}
                      onExtractPoints={handleExtractPoints}
                    />
      </div>
    </div>
  )
}

export default App
