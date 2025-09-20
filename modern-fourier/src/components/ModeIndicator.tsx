import React, { useState, useEffect } from 'react'

const ModeIndicator: React.FC = () => {
  const [isAltPressed, setIsAltPressed] = useState(false)
  const [showIndicator, setShowIndicator] = useState(true)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.altKey) {
        setIsAltPressed(true)
      }
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      if (!event.altKey) {
        setIsAltPressed(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keyup', handleKeyUp)

    // Hide indicator after 15 seconds
    const timer = setTimeout(() => setShowIndicator(false), 15000)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('keyup', handleKeyUp)
      clearTimeout(timer)
    }
  }, [])

  if (!showIndicator) return null

  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      background: isAltPressed ? 'rgba(0, 100, 255, 0.9)' : 'rgba(0, 255, 136, 0.9)',
      color: '#ffffff',
      padding: '20px 30px',
      borderRadius: '15px',
      border: `3px solid ${isAltPressed ? '#0066ff' : '#00ff88'}`,
      fontSize: '20px',
      fontWeight: 'bold',
      textAlign: 'center',
      zIndex: 1000,
      transition: 'all 0.3s ease',
      boxShadow: `0 0 30px ${isAltPressed ? 'rgba(0, 100, 255, 0.5)' : 'rgba(0, 255, 136, 0.5)'}`,
      fontFamily: 'monospace'
    }}>
      {isAltPressed ? (
        <>
          <div>🎥 CAMERA MODE</div>
          <div style={{ fontSize: '14px', marginTop: '8px', opacity: 0.9 }}>
            Click + drag to orbit • Scroll to zoom • Right-click to pan
          </div>
        </>
      ) : (
        <>
          <div>🎨 DRAWING MODE</div>
          <div style={{ fontSize: '14px', marginTop: '8px', opacity: 0.9 }}>
            Click + drag on gray plane to draw
          </div>
        </>
      )}
      
      <div style={{ 
        fontSize: '12px', 
        marginTop: '10px', 
        opacity: 0.7,
        borderTop: '1px solid rgba(255, 255, 255, 0.3)',
        paddingTop: '8px'
      }}>
        Hold <strong>Alt</strong> to switch to camera mode
      </div>
    </div>
  )
}

export default ModeIndicator
