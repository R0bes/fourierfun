import React, { useState } from 'react'
import { useFourier } from '../hooks/useFourier'

const InfoPanel: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true)
  const { drawing, fourierData, isCalculating, isDrawing } = useFourier()

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          background: 'rgba(0, 0, 0, 0.8)',
          border: '1px solid rgba(0, 255, 136, 0.3)',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          color: '#00ff88',
          cursor: 'pointer',
          fontSize: '20px',
          zIndex: 1000
        }}
      >
        ℹ️
      </button>
    )
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '20px',
      background: 'rgba(0, 0, 0, 0.9)',
      padding: '20px',
      borderRadius: '10px',
      border: '1px solid rgba(0, 255, 136, 0.3)',
      color: '#00ff88',
      fontFamily: 'monospace',
      fontSize: '12px',
      maxWidth: '300px',
      zIndex: 999
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3 style={{ margin: 0, textShadow: '0 0 10px #00ff88' }}>📊 Status</h3>
        <button
          onClick={() => setIsVisible(false)}
          style={{
            background: 'none',
            border: 'none',
            color: '#00ff88',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          ✕
        </button>
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>Drawing Status:</strong> {isDrawing ? '✏️ Drawing...' : '✋ Ready'}
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>Drawing Points:</strong> {drawing.length}
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>Fourier Components:</strong> {fourierData.components.length}
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>Calculation Status:</strong> {isCalculating ? '🔄 Calculating...' : '✅ Ready'}
      </div>
      
      <div style={{ marginTop: '15px', fontSize: '10px', opacity: 0.7 }}>
        <div>Interactive Fourier Drawing</div>
        <div>Built with React + Three.js + WebGL</div>
        <div>Real-time Fourier transformation</div>
      </div>
    </div>
  )
}

export default InfoPanel