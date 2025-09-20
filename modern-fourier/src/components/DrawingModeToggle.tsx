import React from 'react'

const DrawingModeToggle: React.FC = () => {
  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      left: '20px',
      background: 'rgba(0, 0, 0, 0.8)',
      padding: '15px',
      borderRadius: '10px',
      border: '1px solid rgba(0, 255, 136, 0.3)',
      color: '#00ff88',
      fontFamily: 'monospace',
      fontSize: '14px',
      zIndex: 1000
    }}>
      <div style={{ marginBottom: '10px', fontWeight: 'bold' }}>
        🎨 Drawing Mode
      </div>
      
      <div style={{ marginBottom: '10px', fontSize: '12px', opacity: 0.7 }}>
        <div>Click and drag on gray plane to draw!</div>
        <div>Watch Fourier circles reconstruct your drawing</div>
      </div>
    </div>
  )
}

export default DrawingModeToggle