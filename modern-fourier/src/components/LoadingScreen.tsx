import React, { useState, useEffect } from 'react'

const LoadingScreen: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          setIsLoading(false)
          clearInterval(timer)
          return 100
        }
        return prev + Math.random() * 15
      })
    }, 100)

    return () => clearInterval(timer)
  }, [])

  if (!isLoading) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      color: '#00ff88'
    }}>
      <div style={{
        fontSize: '48px',
        fontWeight: 'bold',
        marginBottom: '20px',
        textShadow: '0 0 20px #00ff88',
        animation: 'pulse 2s infinite'
      }}>
        FOURIER VISUALIZATION
      </div>
      
      <div style={{
        fontSize: '18px',
        marginBottom: '40px',
        opacity: 0.8
      }}>
        Loading spectacular visual effects...
      </div>
      
      <div style={{
        width: '300px',
        height: '4px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '2px',
        overflow: 'hidden',
        marginBottom: '20px'
      }}>
        <div style={{
          width: `${progress}%`,
          height: '100%',
          background: 'linear-gradient(90deg, #00ff88, #ff0088)',
          borderRadius: '2px',
          transition: 'width 0.3s ease',
          boxShadow: '0 0 10px #00ff88'
        }} />
      </div>
      
      <div style={{
        fontSize: '14px',
        opacity: 0.6
      }}>
        {Math.round(progress)}%
      </div>
    </div>
  )
}

export default LoadingScreen
