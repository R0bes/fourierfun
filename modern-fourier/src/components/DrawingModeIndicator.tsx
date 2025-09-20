import React, { useState, useEffect } from 'react'

const DrawingModeIndicator: React.FC = () => {
  const [isCtrlPressed, setIsCtrlPressed] = useState(false)
  const [showIndicator, setShowIndicator] = useState(true)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.shiftKey) {
        setIsCtrlPressed(true)
      }
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      if (!event.shiftKey) {
        setIsCtrlPressed(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keyup', handleKeyUp)

    // Hide indicator after 10 seconds
    const timer = setTimeout(() => setShowIndicator(false), 10000)

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
      background: isCtrlPressed ? 'rgba(0, 255, 136, 0.9)' : 'rgba(0, 0, 0, 0.8)',
      color: isCtrlPressed ? '#000000' : '#00ff88',
      padding: '20px 30px',
      borderRadius: '10px',
      border: '2px solid #00ff88',
      fontSize: '18px',
      fontWeight: 'bold',
      textAlign: 'center',
      zIndex: 1000,
      transition: 'all 0.3s ease',
      boxShadow: '0 0 20px rgba(0, 255, 136, 0.5)'
    }}>
      {isCtrlPressed ? (
        <>
          <div>🎨 DRAWING MODE ACTIVE</div>
          <div style={{ fontSize: '14px', marginTop: '5px' }}>
            Click and drag to draw!
          </div>
        </>
      ) : (
        <>
          <div>⌨️ Hold Shift + Click to Draw</div>
          <div style={{ fontSize: '14px', marginTop: '5px' }}>
            Release Shift to orbit camera
          </div>
        </>
      )}
    </div>
  )
}

export default DrawingModeIndicator
