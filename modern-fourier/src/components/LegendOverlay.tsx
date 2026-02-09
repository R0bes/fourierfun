import React, { useState, useRef } from 'react'
import { CurveData, Settings } from '../types'

interface LegendOverlayProps {
  curveData: CurveData
  settings: Settings
  onUpdateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void
}

export const LegendOverlay: React.FC<LegendOverlayProps> = ({
  curveData,
  settings,
  onUpdateSetting
}) => {
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const overlayRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current || (e.target as HTMLElement).closest('.legend-header')) {
      setIsDragging(true)
      const rect = overlayRef.current?.getBoundingClientRect()
      if (rect) {
        setDragOffset({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        })
      }
    }
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newPosition = {
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      }
      onUpdateSetting('legendPosition', newPosition)
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, dragOffset])

  const getPhaseControls = () => {
    if (!curveData.isCurveClosed) {
      // Phase 1: Drawing
      return (
        <div>
          <h4 style={{ 
            margin: '0 0 12px 0', 
            color: '#00ff80',
            fontFamily: 'Orbitron, monospace',
            fontWeight: '600',
            fontSize: '14px',
            letterSpacing: '1px'
          }}>
            PHASE 1: DRAW
          </h4>
          <ul style={{ 
            margin: 0, 
            paddingLeft: '20px', 
            fontSize: '13px',
            color: '#00ffff',
            fontFamily: 'Rajdhani, sans-serif',
            fontWeight: '500'
          }}>
            <li><strong>Linksklick:</strong> Punkt hinzufügen</li>
            <li><strong>Rechtsklick:</strong> Kurve schließen {curveData.drawnPoints.length >= 3 ? '✓' : `(min. 3 Punkte: ${curveData.drawnPoints.length}/3)`}</li>
            <li><strong>Leertaste:</strong> Kurve schließen {curveData.drawnPoints.length >= 3 ? '✓' : `(min. 3 Punkte: ${curveData.drawnPoints.length}/3)`}</li>
          </ul>
        </div>
      )
    } else if (!curveData.isCurveFixed) {
      // Phase 2: Editing
      return (
        <div>
          <h4 style={{ 
            margin: '0 0 12px 0', 
            color: '#00ffff',
            fontFamily: 'Orbitron, monospace',
            fontWeight: '600',
            fontSize: '14px',
            letterSpacing: '1px'
          }}>
            PHASE 2: EDIT
          </h4>
          <ul style={{ 
            margin: 0, 
            paddingLeft: '20px', 
            fontSize: '13px',
            color: '#00ffff',
            fontFamily: 'Rajdhani, sans-serif',
            fontWeight: '500'
          }}>
            <li><strong>Linksklick auf Punkt:</strong> Verschieben</li>
            <li><strong>Linksklick auf Kurve:</strong> Punkt einfügen</li>
            <li><strong>Rechtsklick auf Punkt:</strong> Punkt löschen {curveData.drawnPoints.length > 3 ? '✓' : `(min. 3 Punkte: ${curveData.drawnPoints.length}/3)`}</li>
            <li><strong>Leertaste:</strong> Fourier starten</li>
          </ul>
        </div>
      )
    } else {
      // Phase 3: Fourier
      return (
        <div>
          <h4 style={{ 
            margin: '0 0 12px 0', 
            color: '#ff00ff',
            fontFamily: 'Orbitron, monospace',
            fontWeight: '600',
            fontSize: '14px',
            letterSpacing: '1px'
          }}>
            PHASE 3: RUN
          </h4>
          <ul style={{ 
            margin: 0, 
            paddingLeft: '20px', 
            fontSize: '13px',
            color: '#ff00ff',
            fontFamily: 'Rajdhani, sans-serif',
            fontWeight: '500'
          }}>
            <li><strong>Fourier Transformation:</strong> Läuft...</li>
            <li><strong>Berechnung:</strong> In Bearbeitung</li>
          </ul>
        </div>
      )
    }
  }

  if (!settings.legendVisible) return null

  return (
    <div
      ref={overlayRef}
      className="legend-header"
      style={{
        position: 'fixed',
        left: settings.legendPosition.x,
        top: settings.legendPosition.y,
        background: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(20px)',
        color: '#00ffff',
        padding: '16px',
        borderRadius: '12px',
        border: '1px solid rgba(0, 255, 255, 0.3)',
        fontSize: '14px',
        minWidth: '220px',
        zIndex: 1000,
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        boxShadow: 
          '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 20px rgba(0, 255, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        fontFamily: 'Rajdhani, sans-serif',
        fontWeight: '500'
      }}
      onMouseDown={handleMouseDown}
    >
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '8px'
      }}>
        <span style={{ 
          fontWeight: 'bold', 
          color: '#00ffff',
          fontFamily: 'Orbitron, monospace',
          fontSize: '16px',
          letterSpacing: '1px'
        }}>
          CONTROLS
        </span>
        <button
          onClick={() => onUpdateSetting('legendVisible', false)}
          style={{
            background: 'rgba(0, 255, 255, 0.1)',
            border: '1px solid rgba(0, 255, 255, 0.3)',
            color: '#00ffff',
            cursor: 'pointer',
            fontSize: '16px',
            padding: '4px',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '4px',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(0, 255, 255, 0.2)'
            e.currentTarget.style.boxShadow = '0 0 10px rgba(0, 255, 255, 0.5)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(0, 255, 255, 0.1)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          ×
        </button>
      </div>
      {getPhaseControls()}
    </div>
  )
}
