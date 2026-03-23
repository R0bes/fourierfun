import React, { useCallback, useRef } from 'react'
import { DrawingCanvas } from './components/DrawingCanvas'
import { Menu } from './components/Menu'
import { useMachines } from './hooks/useMachines'
import { useSettings } from './hooks/useSettings'
import { useDragDrop } from './hooks/useDragDrop'
import { useRecording } from './hooks/useRecording'
import { saveProfileToStorage, loadProfilesMap, deleteProfileFromStorage, type ProfileSnapshot } from './utils/profiles'

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const {
    curveData,
    machines,
    activeMachineId,
    activeMachine,
    addPoint,
    addLinePoints,
    closeCurve,
    configureCurve,
    startCurve,
    updatePoint,
    insertPoint,
    deletePoint,
    updateUniformPoints,
    updateCenterOfMass,
    updateCenterOfMassAutomatically,
    initializeCenterOfMass,
    startFourier,
    stopFourier,
    updateAnimationTime,
    updateAnimationStep,
    clearCurve,
    goToDrawPhase,
    loadImage,
    processImage,
    extractPointsFromProcessedImage,
    createMachine,
    deleteMachine,
    renameMachine,
    setActiveMachine,
    updateMachineColors,
    updateMachineAlphas,
    replaceMachinesState,
    machineState
  } = useMachines()

  const { settings, updateSetting } = useSettings()
  const { dragState, startDraggingCenter, stopDraggingCenter, toggleDraggingPoint, stopAllDragging } = useDragDrop()
  const { isRecording, startRecording, stopRecording } = useRecording()

  const handleCloseCurve = () => {
    closeCurve(settings.autoCalculateCenter)
  }

  const handleAddPoint = (point: { x: number; y: number }) => {
    addPoint(point)
  }

  const handleAddLinePoints = (points: { x: number; y: number }[]) => {
    addLinePoints(points)
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
    updateCenterOfMass(false, point)
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
      stopFourier()
    } else if (curveData.isCurveConfigured) {
      goToDrawPhase()
    }
  }

  const handleNextPhase = () => {
    if (!curveData.isCurveConfigured) {
      if (curveData.isCurveClosed) {
        handleConfigureCurve()
      }
    } else if (!curveData.isCurveFixed) {
      handleStartCurve()
    }
  }

  React.useEffect(() => {
    updateSetting('legendVisible', true)
  }, [curveData.isCurveClosed, curveData.isCurveFixed])

  const handleUpdateSetting = useCallback(
    <K extends keyof typeof settings>(key: K, value: (typeof settings)[K]) => {
      updateSetting(key, value)
      if (key === 'numUniformPoints') {
        updateUniformPoints(value as number, settings.autoCalculateCenter)
        updateCenterOfMassAutomatically(settings.autoCalculateCenter)
      }
      if (key === 'autoCalculateCenter') {
        updateCenterOfMassAutomatically(value as boolean)
      }
      if (key.startsWith('image')) {
        processImage({ ...settings, [key]: value })
      }
    },
    [updateSetting, settings, updateUniformPoints, updateCenterOfMassAutomatically, processImage]
  )

  const handleLoadImage = (file: File) => {
    loadImage(file)
  }

  const handleProcessImage = () => {
    processImage(settings)
  }

  const handleExtractPoints = () => {
    const points = extractPointsFromProcessedImage()
    if (points.length > 0) {
      addLinePoints(points)
    }
  }

  const getPhaseClass = () => {
    if (!curveData.isCurveClosed) {
      return 'phase-1-scene'
    } else if (!curveData.isCurveConfigured) {
      return 'phase-1-scene'
    } else if (!curveData.isCurveFixed) {
      return 'phase-2-scene'
    } else {
      return 'phase-3-scene'
    }
  }

  const handleSaveProfile = useCallback(
    (name: string) => {
      const snapshot: ProfileSnapshot = {
        ...machineState,
        settings: { ...settings }
      }
      saveProfileToStorage(name.trim(), snapshot)
    },
    [machineState, settings]
  )

  const handleLoadProfile = useCallback(
    (name: string) => {
      const map = loadProfilesMap()
      const snap = map[name]
      if (!snap) return
      const { settings: savedSettings, machines, activeMachineId, nextMachineSeq } = snap
      replaceMachinesState({ machines, activeMachineId, nextMachineSeq })
      ;(Object.keys(savedSettings) as (keyof typeof savedSettings)[]).forEach((key) => {
        updateSetting(key, savedSettings[key] as never)
      })
    },
    [replaceMachinesState, updateSetting]
  )

  const handleDeleteProfile = useCallback((name: string) => {
    deleteProfileFromStorage(name)
  }, [])

  const handleStartRecording = useCallback(() => {
    const el = canvasRef.current
    if (!el) return
    startRecording(el, settings.recordingDurationMs, settings.recordingFrameRate)
  }, [startRecording, settings.recordingDurationMs, settings.recordingFrameRate])

  const handleStopRecording = useCallback(() => {
    stopRecording(canvasRef.current, settings.recordingFrameRate)
  }, [stopRecording, settings.recordingFrameRate])

  const profileNames = Object.keys(loadProfilesMap())

  return (
    <div
      className={getPhaseClass()}
      style={{
        display: 'flex',
        height: '100vh',
        padding: '20px',
        gap: '20px',
        position: 'relative'
      }}
    >
      <div
        style={{
          flex: 1,
          position: 'relative'
        }}
      >
        <div
          className="glass-container"
          style={{
            width: '100%',
            height: '100%',
            padding: '0px',
            position: 'relative'
          }}
        >
          <DrawingCanvas
            ref={canvasRef}
            curveData={curveData}
            settings={settings}
            activeMachine={activeMachine}
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

      <div
        className="glass-container"
        style={{
          width: '480px',
          height: 'fit-content',
          maxHeight: 'calc(100vh - 40px)',
          overflowY: 'auto'
        }}
      >
        <Menu
          settings={settings}
          curveData={curveData}
          machines={machines}
          activeMachineId={activeMachineId}
          activeMachine={activeMachine}
          profileNames={profileNames}
          isRecording={isRecording}
          onUpdateSetting={handleUpdateSetting}
          onClearCurve={clearCurve}
          onConfigureCurve={handleConfigureCurve}
          onStartCurve={handleStartCurve}
          onPreviousPhase={handlePreviousPhase}
          onNextPhase={handleNextPhase}
          onLoadImage={handleLoadImage}
          onProcessImage={handleProcessImage}
          onExtractPoints={handleExtractPoints}
          onCreateMachine={() => createMachine()}
          onDeleteMachine={deleteMachine}
          onRenameMachine={renameMachine}
          onSetActiveMachine={setActiveMachine}
          onUpdateMachineColors={updateMachineColors}
          onUpdateMachineAlphas={updateMachineAlphas}
          onSaveProfile={handleSaveProfile}
          onLoadProfile={handleLoadProfile}
          onDeleteProfile={handleDeleteProfile}
          onStartRecording={handleStartRecording}
          onStopRecording={handleStopRecording}
        />
      </div>
    </div>
  )
}

export default App
