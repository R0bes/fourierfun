import React, { useState, useEffect } from 'react'
import { Settings, CurveData, Machine } from '../types'

interface MenuProps {
  settings: Settings
  curveData: CurveData
  machines: Machine[]
  activeMachineId: string
  activeMachine: Machine | null
  profileNames: string[]
  isRecording: boolean
  onUpdateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void
  onClearCurve: () => void
  onConfigureCurve: () => void
  onStartCurve: () => void
  onPreviousPhase: () => void
  onNextPhase: () => void
  onLoadImage: (file: File) => void
  onProcessImage: () => void
  onExtractPoints: () => void
  onCreateMachine: () => void
  onDeleteMachine: (id: string) => void
  onRenameMachine: (id: string, name: string) => void
  onSetActiveMachine: (id: string) => void
  onUpdateMachineColors: (id: string, colors: Partial<Machine['colors']>) => void
  onUpdateMachineAlphas: (id: string, alphas: Partial<Machine['alphas']>) => void
  onSaveProfile: (name: string) => void
  onLoadProfile: (name: string) => void
  onDeleteProfile: (name: string) => void
  onStartRecording: () => void
  onStopRecording: () => void
}

export const Menu: React.FC<MenuProps> = ({
  settings,
  curveData,
  machines,
  activeMachineId,
  activeMachine,
  profileNames,
  isRecording,
  onUpdateSetting,
  onClearCurve,
  onConfigureCurve,
  onStartCurve,
  onPreviousPhase,
  onNextPhase,
  onLoadImage,
  onProcessImage,
  onExtractPoints,
  onCreateMachine,
  onDeleteMachine,
  onRenameMachine,
  onSetActiveMachine,
  onUpdateMachineColors,
  onUpdateMachineAlphas,
  onSaveProfile,
  onLoadProfile,
  onDeleteProfile,
  onStartRecording,
  onStopRecording
}) => {
  const [activeTab, setActiveTab] = useState<'phase1' | 'phase2' | 'phase3'>('phase1')
  const [profileName, setProfileName] = useState('')
  const [profileToLoad, setProfileToLoad] = useState('')

  // Automatically switch tabs based on phase
  useEffect(() => {
    if (!curveData.isCurveConfigured) {
      setActiveTab('phase1') // Draw phase (includes both open and closed curve)
    } else if (!curveData.isCurveFixed) {
      setActiveTab('phase2') // Config phase
    } else {
      setActiveTab('phase3') // Run phase
    }
  }, [curveData.isCurveClosed, curveData.isCurveConfigured, curveData.isCurveFixed])

  // Determine phase color
  const phaseColor = !curveData.isCurveConfigured 
    ? '#00ff80' // Green for Phase 1 (Draw - both open and closed)
    : !curveData.isCurveFixed 
    ? '#ffff00' // Yellow for Phase 2 (Config)
    : '#ff00ff' // Magenta for Phase 3 (Run)

  // Keyboard navigation for phase switching
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Only handle number keys 1, 2, 3
      if (event.key === '1' && !curveData.isCurveConfigured) {
        setActiveTab('phase1')
        event.preventDefault()
      } else if (event.key === '2' && curveData.isCurveConfigured && !curveData.isCurveFixed) {
        setActiveTab('phase2')
        event.preventDefault()
      } else if (event.key === '3' && curveData.isCurveFixed) {
        setActiveTab('phase3')
        event.preventDefault()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [curveData.isCurveClosed, curveData.isCurveConfigured, curveData.isCurveFixed])

  return (
    <div className="hologram-effect" style={{
      padding: '24px',
      height: '100%',
      overflowY: 'auto'
    }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '24px'
      }}>
        <h1 style={{
          fontSize: '20px',
          fontFamily: 'Orbitron, monospace',
          fontWeight: 'bold',
          color: phaseColor,
          textShadow: `0 0 20px ${phaseColor}`,
          letterSpacing: '2px',
          marginBottom: '24px'
        }}>
          FOURIER VISUALIZER
        </h1>
        
        {/* Phase Tabs with Navigation */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '24px',
          alignItems: 'center'
        }}>
          {/* Previous Button */}
          <button
            className="cyber-button"
            onClick={onPreviousPhase}
            disabled={!curveData.isCurveConfigured}
            style={{
              fontSize: '16px',
              padding: '10px',
              borderColor: phaseColor,
              color: phaseColor,
              opacity: !curveData.isCurveConfigured ? 0.3 : 1,
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <span className="button-text">←</span>
            <span className="button-border"></span>
          </button>

          {/* Phase Tabs */}
          <button
            className={`cyber-tab ${activeTab === 'phase1' ? 'active' : ''}`}
            onClick={() => setActiveTab('phase1')}
            style={{
              flex: 1,
              fontSize: '16px',
              padding: '14px',
              borderColor: activeTab === 'phase1' ? phaseColor : '#00ff80',
              color: activeTab === 'phase1' ? phaseColor : '#00ff80',
              backgroundColor: activeTab === 'phase1' ? `${phaseColor}20` : 'transparent'
            }}
          >
            DRAW
          </button>
          <button
            className={`cyber-tab ${activeTab === 'phase2' ? 'active' : ''}`}
            onClick={() => setActiveTab('phase2')}
            style={{
              flex: 1,
              fontSize: '16px',
              padding: '14px',
              borderColor: activeTab === 'phase2' ? phaseColor : '#ffff00',
              color: activeTab === 'phase2' ? phaseColor : '#ffff00',
              backgroundColor: activeTab === 'phase2' ? `${phaseColor}20` : 'transparent'
            }}
          >
            CONFIG
          </button>
          <button
            className={`cyber-tab ${activeTab === 'phase3' ? 'active' : ''}`}
            onClick={() => setActiveTab('phase3')}
            style={{
              flex: 1,
              fontSize: '16px',
              padding: '14px',
              borderColor: activeTab === 'phase3' ? phaseColor : '#ff00ff',
              color: activeTab === 'phase3' ? phaseColor : '#ff00ff',
              backgroundColor: activeTab === 'phase3' ? `${phaseColor}20` : 'transparent'
            }}
          >
            RUN
          </button>

          {/* Next Button */}
          <button
            className="cyber-button"
            onClick={onNextPhase}
            disabled={curveData.isCurveFixed || !curveData.isCurveClosed}
            style={{
              fontSize: '16px',
              padding: '10px',
              borderColor: phaseColor,
              color: phaseColor,
              opacity: (curveData.isCurveFixed || !curveData.isCurveClosed) ? 0.3 : 1,
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <span className="button-text">→</span>
            <span className="button-border"></span>
          </button>
        </div>

        {/* Machines */}
        <div className="digital-frame circuit-border" style={{ borderColor: phaseColor + '40', marginBottom: '24px', padding: '16px' }}>
          <h3 style={{ fontFamily: 'Orbitron, monospace', fontSize: '16px', color: phaseColor, marginTop: 0 }}>MACHINES</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ color: phaseColor, fontSize: '14px' }}>
              Active
              <select
                value={activeMachineId}
                onChange={(e) => onSetActiveMachine(e.target.value)}
                style={{ marginLeft: '8px', width: '100%', maxWidth: '280px' }}
              >
                {machines.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </label>
            <label style={{ color: phaseColor, fontSize: '14px' }}>
              Name
              <input
                type="text"
                value={activeMachine?.name ?? ''}
                onChange={(e) => onRenameMachine(activeMachineId, e.target.value)}
                style={{ marginLeft: '8px', width: '100%', maxWidth: '280px' }}
              />
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" className="cyber-button" onClick={onCreateMachine}>
                <span className="button-text">+ Machine</span>
              </button>
              <button
                type="button"
                className="cyber-button"
                disabled={machines.length <= 1}
                onClick={() => onDeleteMachine(activeMachineId)}
              >
                <span className="button-text">Delete</span>
              </button>
            </div>
          </div>
        </div>

        {/* Colors (active machine) */}
        {activeMachine && (
          <div className="digital-frame circuit-border" style={{ borderColor: phaseColor + '40', marginBottom: '24px', padding: '16px' }}>
            <h3 style={{ fontFamily: 'Orbitron, monospace', fontSize: '16px', color: phaseColor, marginTop: 0 }}>COLORS / ALPHA</h3>
            {(
              [
                ['circles', 'Circles'],
                ['amplitudes', 'Amplitudes'],
                ['trail', 'Trail'],
                ['path', 'Path'],
                ['drawn', 'Drawn'],
                ['glow', 'Glow'],
                ['uniformPoints', 'Uniform'],
                ['centerOfMass', 'Center']
              ] as const
            ).map(([key, label]) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                <span style={{ color: phaseColor, width: '100px', fontSize: '13px' }}>{label}</span>
                <input
                  type="color"
                  value={activeMachine.colors[key] as string}
                  onChange={(e) => onUpdateMachineColors(activeMachineId, { [key]: e.target.value } as never)}
                />
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={activeMachine.alphas[key as keyof typeof activeMachine.alphas] ?? 1}
                  onChange={(e) =>
                    onUpdateMachineAlphas(activeMachineId, { [key]: parseFloat(e.target.value) } as never)
                  }
                  style={{ flex: 1, minWidth: '120px' }}
                />
              </div>
            ))}
          </div>
        )}

        {/* Profiles */}
        <div className="digital-frame circuit-border" style={{ borderColor: phaseColor + '40', marginBottom: '24px', padding: '16px' }}>
          <h3 style={{ fontFamily: 'Orbitron, monospace', fontSize: '16px', color: phaseColor, marginTop: 0 }}>PROFILES</h3>
          <input
            type="text"
            placeholder="Profile name"
            value={profileName}
            onChange={(e) => setProfileName(e.target.value)}
            style={{ width: '100%', marginBottom: '8px' }}
          />
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
            <button type="button" className="cyber-button" onClick={() => onSaveProfile(profileName || 'default')}>
              <span className="button-text">Save</span>
            </button>
            <select value={profileToLoad} onChange={(e) => setProfileToLoad(e.target.value)} style={{ flex: 1, minWidth: '120px' }}>
              <option value="">Load…</option>
              {profileNames.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <button type="button" className="cyber-button" onClick={() => profileToLoad && onLoadProfile(profileToLoad)}>
              <span className="button-text">Load</span>
            </button>
            <button type="button" className="cyber-button" onClick={() => profileToLoad && onDeleteProfile(profileToLoad)}>
              <span className="button-text">Delete</span>
            </button>
          </div>
        </div>

        {/* Grid */}
        <div className="digital-frame circuit-border" style={{ borderColor: phaseColor + '40', marginBottom: '24px', padding: '16px' }}>
          <h3 style={{ fontFamily: 'Orbitron, monospace', fontSize: '16px', color: phaseColor, marginTop: 0 }}>GRID</h3>
          <label style={{ color: phaseColor, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input type="checkbox" checked={settings.showGrid} onChange={(e) => onUpdateSetting('showGrid', e.target.checked)} />
            Show grid
          </label>
          <label style={{ color: phaseColor, display: 'block', marginTop: '8px' }}>
            Cell size {settings.gridCellSize}
            <input
              type="range"
              min={8}
              max={48}
              value={settings.gridCellSize}
              onChange={(e) => onUpdateSetting('gridCellSize', Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </label>
          <label style={{ color: phaseColor, display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
            <input type="checkbox" checked={settings.gridRainbowMode} onChange={(e) => onUpdateSetting('gridRainbowMode', e.target.checked)} />
            Rainbow
          </label>
          <label style={{ color: phaseColor, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input type="checkbox" checked={settings.gridParticleSystem} onChange={(e) => onUpdateSetting('gridParticleSystem', e.target.checked)} />
            Particles
          </label>
        </div>

        {/* Overlays */}
        <div className="digital-frame circuit-border" style={{ borderColor: phaseColor + '40', marginBottom: '24px', padding: '16px' }}>
          <h3 style={{ fontFamily: 'Orbitron, monospace', fontSize: '16px', color: phaseColor, marginTop: 0 }}>OVERLAYS</h3>
          <label style={{ color: phaseColor, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={settings.showFrequencySpectrum}
              onChange={(e) => onUpdateSetting('showFrequencySpectrum', e.target.checked)}
            />
            Frequency spectrum
          </label>
          <label style={{ color: phaseColor, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input type="checkbox" checked={settings.showPhaseDiagram} onChange={(e) => onUpdateSetting('showPhaseDiagram', e.target.checked)} />
            Phase diagram
          </label>
        </div>

        {/* Recording */}
        <div className="digital-frame circuit-border" style={{ borderColor: phaseColor + '40', marginBottom: '24px', padding: '16px' }}>
          <h3 style={{ fontFamily: 'Orbitron, monospace', fontSize: '16px', color: phaseColor, marginTop: 0 }}>RECORDING (GIF)</h3>
          <label style={{ color: phaseColor, display: 'block' }}>
            Duration (ms) {settings.recordingDurationMs}
            <input
              type="range"
              min={1000}
              max={15000}
              step={500}
              value={settings.recordingDurationMs}
              onChange={(e) => onUpdateSetting('recordingDurationMs', Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </label>
          <label style={{ color: phaseColor, display: 'block', marginTop: '8px' }}>
            FPS {settings.recordingFrameRate}
            <input
              type="range"
              min={5}
              max={60}
              value={settings.recordingFrameRate}
              onChange={(e) => onUpdateSetting('recordingFrameRate', Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </label>
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <button type="button" className="cyber-button" disabled={isRecording} onClick={onStartRecording}>
              <span className="button-text">Start</span>
            </button>
            <button type="button" className="cyber-button" disabled={!isRecording} onClick={onStopRecording}>
              <span className="button-text">Stop &amp; export</span>
            </button>
          </div>
        </div>

        {/* Status Info */}
        <div className="digital-frame circuit-border" style={{
          borderColor: phaseColor + '40',
          marginBottom: '24px'
        }}>
          <h3 style={{
            fontFamily: 'Orbitron, monospace',
            fontSize: '18px',
            color: phaseColor,
            margin: '0 0 16px 0',
            textShadow: `0 0 10px ${phaseColor}`
          }}>
            STATUS
          </h3>
          
          <div style={{ marginBottom: '12px' }}>
            <div style={{
              fontSize: '16px',
              color: phaseColor,
              fontFamily: 'Rajdhani, sans-serif',
              fontWeight: '500',
              marginBottom: '8px'
            }}>
              Punkte: {curveData.drawnPoints.length}
            </div>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <div style={{
              fontSize: '16px',
              color: phaseColor,
              fontFamily: 'Rajdhani, sans-serif',
              fontWeight: '500',
              marginBottom: '8px'
            }}>
              Kurve geschlossen: {curveData.isCurveClosed ? 'Ja' : 'Nein'}
            </div>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <div style={{
              fontSize: '16px',
              color: phaseColor,
              fontFamily: 'Rajdhani, sans-serif',
              fontWeight: '500',
              marginBottom: '8px'
            }}>
              Kurve fixiert: {curveData.isCurveFixed ? 'Ja' : 'Nein'}
            </div>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <div style={{
              fontSize: '16px',
              color: phaseColor,
              fontFamily: 'Rajdhani, sans-serif',
              fontWeight: '500',
              marginBottom: '8px'
            }}>
              Uniform-Punkte: {curveData.uniformPoints.length}
            </div>
          </div>
        </div>

        {/* Curve Analysis */}
        {curveData.curveAnalysis && (
          <div className="digital-frame circuit-border" style={{
            borderColor: phaseColor + '40',
            marginBottom: '24px'
          }}>
            <h3 style={{
              fontFamily: 'Orbitron, monospace',
              fontSize: '18px',
              color: phaseColor,
              margin: '0 0 16px 0',
              textShadow: `0 0 10px ${phaseColor}`
            }}>
              KURVENANALYSE
            </h3>
            
            <div style={{ marginBottom: '12px' }}>
              <div style={{
                fontSize: '16px',
                color: phaseColor,
                fontFamily: 'Rajdhani, sans-serif',
                fontWeight: '500',
                marginBottom: '8px'
              }}>
                Punkte auf Kurve: {curveData.curveAnalysis.pointCount}
              </div>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <div style={{
                fontSize: '16px',
                color: phaseColor,
                fontFamily: 'Rajdhani, sans-serif',
                fontWeight: '500',
                marginBottom: '8px'
              }}>
                Gezeichnete Strecke: {curveData.curveAnalysis.drawnLength} px
              </div>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <div style={{
                fontSize: '16px',
                color: phaseColor,
                fontFamily: 'Rajdhani, sans-serif',
                fontWeight: '500',
                marginBottom: '8px'
              }}>
                Schließende Strecke: {curveData.curveAnalysis.closingLength} px
              </div>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <div style={{
                fontSize: '16px',
                color: phaseColor,
                fontFamily: 'Rajdhani, sans-serif',
                fontWeight: '500',
                marginBottom: '8px'
              }}>
                Geschlossene Kurve: {curveData.curveAnalysis.closedCurveLength} px
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Phase 1: Draw */}
      {activeTab === 'phase1' && (
        <div>
          <div className="digital-frame circuit-border" style={{
            borderColor: phaseColor + '40',
            marginBottom: '24px'
          }}>
            <h3 style={{
              fontFamily: 'Orbitron, monospace',
              fontSize: '18px',
              color: phaseColor,
              margin: '0 0 16px 0',
              textShadow: `0 0 10px ${phaseColor}`
            }}>
              PHASE 1: DRAW
            </h3>
            
            <div style={{ marginBottom: '16px' }}>
              <p style={{
                fontSize: '16px',
                color: phaseColor,
                fontFamily: 'Rajdhani, sans-serif',
                margin: '0 0 12px 0',
                lineHeight: '1.4'
              }}>
                {settings.drawMode === 'points' 
                  ? (curveData.drawnPoints.length === 0 
                      ? "Klicke auf das Canvas, um den ersten Punkt hinzuzufügen. Die Kurve schließt sich automatisch."
                      : "Klicke auf das Canvas, um weitere Punkte hinzuzufügen. Linksklick auf Kurve fügt Punkte ein.")
                  : settings.drawMode === 'line'
                  ? "Ziehe mit der Maus, um eine durchgezogene Linie zu zeichnen. Beim Loslassen schließt sich die Kurve."
                  : "Lade ein Bild hoch, um es in eine Kurve umzuwandeln. Das System extrahiert automatisch die Konturen."
                }
              </p>
            </div>

            {/* Draw Mode Toggle */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                fontSize: '16px',
                color: phaseColor,
                fontFamily: 'Rajdhani, sans-serif',
                fontWeight: '500',
                display: 'block',
                marginBottom: '8px'
              }}>
                Zeichenmodus
              </label>
              <div style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '8px'
              }}>
                <button
                  className={`cyber-tab ${settings.drawMode === 'points' ? 'active' : ''}`}
                  onClick={() => onUpdateSetting('drawMode', 'points')}
                  style={{
                    flex: 1,
                    fontSize: '14px',
                    padding: '10px',
                    borderColor: settings.drawMode === 'points' ? phaseColor : '#00ff80',
                    color: settings.drawMode === 'points' ? phaseColor : '#00ff80',
                    backgroundColor: settings.drawMode === 'points' ? `${phaseColor}20` : 'transparent'
                  }}
                >
                  POINTS
                </button>
                <button
                  className={`cyber-tab ${settings.drawMode === 'line' ? 'active' : ''}`}
                  onClick={() => onUpdateSetting('drawMode', 'line')}
                  style={{
                    flex: 1,
                    fontSize: '14px',
                    padding: '10px',
                    borderColor: settings.drawMode === 'line' ? phaseColor : '#00ff80',
                    color: settings.drawMode === 'line' ? phaseColor : '#00ff80',
                    backgroundColor: settings.drawMode === 'line' ? `${phaseColor}20` : 'transparent'
                  }}
                >
                  LINE
                </button>
                <button
                  className={`cyber-tab ${settings.drawMode === 'image' ? 'active' : ''}`}
                  onClick={() => onUpdateSetting('drawMode', 'image')}
                  style={{
                    flex: 1,
                    fontSize: '14px',
                    padding: '10px',
                    borderColor: settings.drawMode === 'image' ? phaseColor : '#00ff80',
                    color: settings.drawMode === 'image' ? phaseColor : '#00ff80',
                    backgroundColor: settings.drawMode === 'image' ? `${phaseColor}20` : 'transparent'
                  }}
                >
                  IMAGE
                </button>
              </div>
            </div>

            <button
              className="cyber-button"
              onClick={onClearCurve}
              style={{
                width: '100%',
                marginBottom: '12px'
              }}
            >
              Kurve löschen
            </button>
          </div>

          {/* Image Upload Section */}
          {settings.drawMode === 'image' && (
            <div className="digital-frame circuit-border" style={{
              borderColor: phaseColor + '40',
              marginBottom: '24px'
            }}>
              <h3 style={{
                fontFamily: 'Orbitron, monospace',
                fontSize: '18px',
                color: phaseColor,
                margin: '0 0 16px 0',
                textShadow: `0 0 10px ${phaseColor}`
              }}>
                BILD HOCHLADEN
              </h3>
              
              <div style={{ marginBottom: '12px' }}>
                <input
                  type="file"
                  accept=".png,.jpg,.jpeg,.svg"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      onLoadImage(file)
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: 'transparent',
                    border: `2px solid ${phaseColor}40`,
                    borderRadius: '8px',
                    color: phaseColor,
                    fontFamily: 'Rajdhani, sans-serif',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                />
              </div>

              <div style={{
                fontSize: '14px',
                color: phaseColor + 'CC',
                fontFamily: 'Rajdhani, sans-serif',
                textAlign: 'center',
                marginTop: '8px'
              }}>
                Unterstützt: PNG, JPG, SVG
              </div>
            </div>
          )}

          {/* Image Processing Section */}
          {settings.drawMode === 'image' && curveData.backgroundImage && (
            <div className="digital-frame circuit-border" style={{
              borderColor: phaseColor + '40',
              marginBottom: '24px'
            }}>
              <h3 style={{
                fontFamily: 'Orbitron, monospace',
                fontSize: '18px',
                color: phaseColor,
                margin: '0 0 16px 0',
                textShadow: `0 0 10px ${phaseColor}`
              }}>
                BILDBEARBEITUNG
              </h3>

              {/* Brightness Control */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  color: phaseColor,
                  fontFamily: 'Rajdhani, sans-serif',
                  marginBottom: '8px'
                }}>
                  Helligkeit: {settings.imageBrightness}
                </label>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={settings.imageBrightness}
                  onChange={(e) => onUpdateSetting('imageBrightness', parseInt(e.target.value))}
                  className="cyber-range"
                  style={{
                    width: '100%',
                    accentColor: phaseColor
                  }}
                />
              </div>

              {/* Contrast Control */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  color: phaseColor,
                  fontFamily: 'Rajdhani, sans-serif',
                  marginBottom: '8px'
                }}>
                  Kontrast: {settings.imageContrast}
                </label>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={settings.imageContrast}
                  onChange={(e) => onUpdateSetting('imageContrast', parseInt(e.target.value))}
                  className="cyber-range"
                  style={{
                    width: '100%',
                    accentColor: phaseColor
                  }}
                />
              </div>

              {/* Threshold Control */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  color: phaseColor,
                  fontFamily: 'Rajdhani, sans-serif',
                  marginBottom: '8px'
                }}>
                  Threshold: {settings.imageThreshold}
                </label>
                <input
                  type="range"
                  min="0"
                  max="255"
                  value={settings.imageThreshold}
                  onChange={(e) => onUpdateSetting('imageThreshold', parseInt(e.target.value))}
                  className="cyber-range"
                  style={{
                    width: '100%',
                    accentColor: phaseColor
                  }}
                />
              </div>

              {/* Invert Checkbox */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '14px',
                  color: phaseColor,
                  fontFamily: 'Rajdhani, sans-serif',
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    checked={settings.imageInvert}
                    onChange={(e) => onUpdateSetting('imageInvert', e.target.checked)}
                    style={{
                      marginRight: '8px',
                      accentColor: phaseColor
                    }}
                  />
                  Invertieren
                </label>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="cyber-button"
                  onClick={onProcessImage}
                  style={{
                    flex: 1,
                    fontSize: '14px',
                    padding: '10px'
                  }}
                >
                  VERARBEITEN
                </button>
                <button
                  className="cyber-button"
                  onClick={onExtractPoints}
                  style={{
                    flex: 1,
                    fontSize: '14px',
                    padding: '10px'
                  }}
                >
                  PUNKTE EXTRAHIEREN
                </button>
              </div>
            </div>
          )}

          <div className="digital-frame circuit-border" style={{
            borderColor: phaseColor + '40',
            marginBottom: '24px'
          }}>
            <h3 style={{
              fontFamily: 'Orbitron, monospace',
              fontSize: '18px',
              color: phaseColor,
              margin: '0 0 16px 0',
              textShadow: `0 0 10px ${phaseColor}`
            }}>
              ANZEIGE
            </h3>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                fontSize: '16px',
                color: phaseColor,
                fontFamily: 'Rajdhani, sans-serif',
                fontWeight: '500',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  className="cyber-checkbox"
                  checked={settings.showPoints}
                  onChange={(e) => onUpdateSetting('showPoints', e.target.checked)}
                  style={{ marginRight: '12px' }}
                />
                Original-Punkte anzeigen
              </label>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                fontSize: '16px',
                color: phaseColor,
                fontFamily: 'Rajdhani, sans-serif',
                fontWeight: '500',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  className="cyber-checkbox"
                  checked={settings.showUniformPoints}
                  onChange={(e) => onUpdateSetting('showUniformPoints', e.target.checked)}
                  style={{ marginRight: '12px' }}
                />
                Uniform-Punkte anzeigen
              </label>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                fontSize: '16px',
                color: phaseColor,
                fontFamily: 'Rajdhani, sans-serif',
                fontWeight: '500',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  className="cyber-checkbox"
                  checked={settings.showCenterOfMass}
                  onChange={(e) => onUpdateSetting('showCenterOfMass', e.target.checked)}
                  style={{ marginRight: '12px' }}
                />
                Schwerpunkt anzeigen
              </label>
            </div>
          </div>

          {curveData.isCurveClosed && (
            <button 
              className="cyber-button" 
              onClick={onConfigureCurve}
              style={{ borderColor: phaseColor, color: phaseColor }}
            >
              <span className="button-text">Zur Konfiguration (Leertaste)</span>
              <span className="button-border"></span>
            </button>
          )}
        </div>
      )}

      {/* Phase 2: Config */}
      {activeTab === 'phase2' && (
        <div>
          <div className="digital-frame circuit-border" style={{
            borderColor: phaseColor + '40',
            marginBottom: '24px'
          }}>
            <h3 style={{
              fontFamily: 'Orbitron, monospace',
              fontSize: '18px',
              color: phaseColor,
              margin: '0 0 16px 0',
              textShadow: `0 0 10px ${phaseColor}`
            }}>
              PHASE 2: CONFIG
            </h3>
            
            <div style={{ marginBottom: '16px' }}>
              <p style={{
                fontSize: '16px',
                color: phaseColor,
                fontFamily: 'Rajdhani, sans-serif',
                margin: '0 0 12px 0',
                lineHeight: '1.4'
              }}>
                Hier werden die Epizyklen angezeigt, aber noch nicht animiert. Du kannst die Fourier-Komponenten konfigurieren.
              </p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                fontSize: '16px',
                color: phaseColor,
                fontFamily: 'Rajdhani, sans-serif',
                fontWeight: '500',
                display: 'block',
                marginBottom: '8px'
              }}>
                Anzahl Fourier-Komponenten
              </label>
              <input
                type="range"
                className="cyber-range"
                min="5"
                max="50"
                value={settings.maxFourierComponents}
                onChange={(e) => onUpdateSetting('maxFourierComponents', parseInt(e.target.value))}
                style={{ width: '100%', marginBottom: '8px' }}
              />
              <div style={{
                fontSize: '14px',
                color: phaseColor,
                textAlign: 'center',
                fontFamily: 'Rajdhani, sans-serif'
              }}>
                {settings.maxFourierComponents}
              </div>
            </div>
          </div>

          <button 
            className="cyber-button" 
            onClick={onStartCurve}
            style={{ borderColor: phaseColor, color: phaseColor }}
          >
            <span className="button-text">Animation starten (Leertaste)</span>
            <span className="button-border"></span>
          </button>
        </div>
      )}

      {/* Phase 3: Run */}
      {activeTab === 'phase3' && (
        <div>
          <div className="digital-frame circuit-border" style={{
            borderColor: phaseColor + '40',
            marginBottom: '24px'
          }}>
            <h3 style={{
              fontFamily: 'Orbitron, monospace',
              fontSize: '18px',
              color: phaseColor,
              margin: '0 0 16px 0',
              textShadow: `0 0 10px ${phaseColor}`
            }}>
              PHASE 4: RUN
            </h3>
            
            <div style={{ marginBottom: '16px' }}>
              <p style={{
                fontSize: '16px',
                color: phaseColor,
                fontFamily: 'Rajdhani, sans-serif',
                margin: '0 0 12px 0',
                lineHeight: '1.4'
              }}>
                Die Fourier-Animation läuft automatisch. Hier kannst du die Anzeige-Einstellungen anpassen.
              </p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                fontSize: '16px',
                color: phaseColor,
                fontFamily: 'Rajdhani, sans-serif',
                fontWeight: '500',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  className="cyber-checkbox"
                  checked={settings.showFourierCircles}
                  onChange={(e) => onUpdateSetting('showFourierCircles', e.target.checked)}
                  style={{ marginRight: '12px' }}
                />
                Fourier-Kreise anzeigen
              </label>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                fontSize: '16px',
                color: phaseColor,
                fontFamily: 'Rajdhani, sans-serif',
                fontWeight: '500',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  className="cyber-checkbox"
                  checked={settings.showFourierConnections}
                  onChange={(e) => onUpdateSetting('showFourierConnections', e.target.checked)}
                  style={{ marginRight: '12px' }}
                />
                Fourier-Verbindungen anzeigen
              </label>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                fontSize: '16px',
                color: phaseColor,
                fontFamily: 'Rajdhani, sans-serif',
                fontWeight: '500',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  className="cyber-checkbox"
                  checked={settings.showFourierTrail}
                  onChange={(e) => onUpdateSetting('showFourierTrail', e.target.checked)}
                  style={{ marginRight: '12px' }}
                />
                Fourier-Spur anzeigen
              </label>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                fontSize: '16px',
                color: phaseColor,
                fontFamily: 'Rajdhani, sans-serif',
                fontWeight: '500',
                marginBottom: '8px',
                display: 'block'
              }}>
                Animation-Periode: {settings.animationPeriod.toFixed(1)}s
              </label>
              <input
                type="range"
                className="cyber-range"
                min="5"
                max="30"
                step="0.5"
                value={settings.animationPeriod}
                onChange={(e) => onUpdateSetting('animationPeriod', parseFloat(e.target.value))}
                style={{
                  width: '100%',
                  marginBottom: '8px'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                fontSize: '16px',
                color: phaseColor,
                fontFamily: 'Rajdhani, sans-serif',
                fontWeight: '500',
                marginBottom: '8px',
                display: 'block'
              }}>
                Max. Fourier-Komponenten: {settings.maxFourierComponents}
              </label>
              <input
                type="range"
                className="cyber-range"
                min="5"
                max="50"
                step="5"
                value={settings.maxFourierComponents}
                onChange={(e) => onUpdateSetting('maxFourierComponents', parseInt(e.target.value))}
                style={{
                  width: '100%',
                  marginBottom: '8px'
                }}
              />
            </div>
          </div>
        </div>
      )}

    </div>
  )
}