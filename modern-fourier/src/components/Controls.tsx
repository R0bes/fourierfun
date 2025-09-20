import React from 'react'
import { useFourier } from '../hooks/useFourier'

const Controls: React.FC = () => {
  const { drawing, clearDrawing, controls } = useFourier()

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      background: 'rgba(0, 0, 0, 0.9)',
      padding: '20px',
      borderRadius: '10px',
      border: '1px solid rgba(0, 255, 136, 0.3)',
      color: '#00ff88',
      fontFamily: 'monospace',
      fontSize: '14px',
      zIndex: 1000,
      maxWidth: '300px',
      maxHeight: '80vh',
      overflow: 'auto'
    }}>
      <h3 style={{ margin: '0 0 15px 0', textShadow: '0 0 10px #00ff88' }}>
        🎨 Fourier Drawing
      </h3>
      
      <div style={{ marginBottom: '15px', fontSize: '14px' }}>
        <strong>Drawing Points:</strong> {drawing.length}
      </div>
      
      <button
        onClick={clearDrawing}
        style={{
          background: 'rgba(0, 255, 136, 0.2)',
          border: '1px solid #00ff88',
          borderRadius: '5px',
          color: '#00ff88',
          padding: '8px 16px',
          cursor: 'pointer',
          marginBottom: '15px',
          fontSize: '14px'
        }}
      >
        🗑️ Clear Drawing
      </button>
      
      <div style={{ marginTop: '20px', fontSize: '12px', opacity: 0.7 }}>
        <div><strong>🎨 How to draw:</strong></div>
        <div>1. Click and drag on the gray plane</div>
        <div>2. Watch Fourier circles animate!</div>
        <div style={{ marginTop: '10px' }}>
          <div><strong>🖱️ Mouse Controls:</strong></div>
          <div>• <strong>Left-click + drag:</strong> Orbit camera</div>
          <div>• <strong>Scroll wheel:</strong> Zoom camera</div>
          <div>• <strong>Right-click + drag:</strong> Pan camera</div>
          <div>• <strong>Click on gray plane:</strong> Draw</div>
        </div>
        <div style={{ marginTop: '10px' }}>
          <div>🎛️ Leva panel: Adjust parameters</div>
        </div>
      </div>
    </div>
  )
}

export default Controls