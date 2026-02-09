import React, { useState } from 'react'

interface Point3D {
  x: number
  y: number
  z: number
  id: string
}

interface Menu3DProps {
  onPointsChange: (points: Point3D[]) => void
  onClearPoints: () => void
  onToggle3DActive: (active: boolean) => void
  is3DActive: boolean
  points3D: Point3D[]
  showCircles: boolean
  onShowCirclesChange: (show: boolean) => void
  showTrails: boolean
  onShowTrailsChange: (show: boolean) => void
  trailLength: number
  onTrailLengthChange: (length: number) => void
  trailColor: string
  onTrailColorChange: (color: string) => void
  animationSpeed: number
  onAnimationSpeedChange: (speed: number) => void
  maxCoefficients: number
  onMaxCoefficientsChange: (max: number) => void
  useDualArm: boolean
  onUseDualArmChange: (use: boolean) => void
  armOffset: number
  onArmOffsetChange: (offset: number) => void
  secondArmColor: string
  onSecondArmColorChange: (color: string) => void
}

export const Menu3D: React.FC<Menu3DProps> = ({
  onPointsChange,
  onClearPoints,
  onToggle3DActive,
  is3DActive,
  points3D,
  showCircles,
  onShowCirclesChange,
  showTrails,
  onShowTrailsChange,
  trailLength,
  onTrailLengthChange,
  trailColor,
  onTrailColorChange,
  animationSpeed,
  onAnimationSpeedChange,
  maxCoefficients,
  onMaxCoefficientsChange,
  useDualArm,
  onUseDualArmChange,
  armOffset,
  onArmOffsetChange,
  secondArmColor,
  onSecondArmColorChange
}) => {
  // Generate random 3D points
  const generateRandomPoints = () => {
    const numPoints = Math.floor(Math.random() * 8) + 4 // 4-11 points
    const points: Point3D[] = []
    
    for (let i = 0; i < numPoints; i++) {
      // Generate truly random 3D coordinates
      const x = (Math.random() - 0.5) * 8 // -4 to 4
      const y = (Math.random() - 0.5) * 8 // -4 to 4
      const z = (Math.random() - 0.5) * 8 // -4 to 4
      
      points.push({
        x,
        y,
        z,
        id: `random-${Date.now()}-${i}`
      })
    }
    
    onPointsChange(points)
  }

  // Generate specific shapes
  const generateShape = (shape: 'sphere' | 'helix' | 'cube' | 'star' | 'draw-cube') => {
    let points: Point3D[] = []
    
    switch (shape) {
      case 'sphere':
        for (let i = 0; i < 20; i++) {
          const phi = Math.acos(-1 + (2 * i) / 20)
          const theta = Math.sqrt(20 * Math.PI) * phi
          points.push({
            x: 3 * Math.sin(phi) * Math.cos(theta),
            y: 3 * Math.sin(phi) * Math.sin(theta),
            z: 3 * Math.cos(phi),
            id: `sphere-${i}`
          })
        }
        break
        
      case 'helix':
        for (let i = 0; i < 30; i++) {
          const t = (i / 30) * 4 * Math.PI
          points.push({
            x: 2 * Math.cos(t),
            y: 2 * Math.sin(t),
            z: (t - 2 * Math.PI) * 0.5, // Proper 3D helix
            id: `helix-${i}`
          })
        }
        break
        
      case 'cube':
        const cubePoints = [
          [-2, -2, -2], [2, -2, -2], [2, 2, -2], [-2, 2, -2],
          [-2, -2, 2], [2, -2, 2], [2, 2, 2], [-2, 2, 2],
          [0, -2, -2], [0, 2, -2], [0, -2, 2], [0, 2, 2], // Add more points for better 3D structure
          [-2, 0, -2], [2, 0, -2], [-2, 0, 2], [2, 0, 2]
        ]
        points = cubePoints.map(([x, y, z], i) => ({
          x, y, z, id: `cube-${i}`
        }))
        break
        
      case 'star':
        for (let i = 0; i < 12; i++) {
          const angle = (i / 12) * 2 * Math.PI
          const radius = i % 2 === 0 ? 3 : 1.5
          const height = Math.sin(angle * 3) * 2 // More pronounced 3D variation
          points.push({
            x: radius * Math.cos(angle),
            y: radius * Math.sin(angle),
            z: height,
            id: `star-${i}`
          })
        }
        break
        
      case 'draw-cube':
        // Generate points that form a cube outline for the robot arm to trace
        const cubeSize = 3
        const cubeOutline = [
          // Bottom face
          [-cubeSize, -cubeSize, -cubeSize], [cubeSize, -cubeSize, -cubeSize],
          [cubeSize, -cubeSize, -cubeSize], [cubeSize, cubeSize, -cubeSize],
          [cubeSize, cubeSize, -cubeSize], [-cubeSize, cubeSize, -cubeSize],
          [-cubeSize, cubeSize, -cubeSize], [-cubeSize, -cubeSize, -cubeSize],
          
          // Vertical edges
          [-cubeSize, -cubeSize, -cubeSize], [-cubeSize, -cubeSize, cubeSize],
          [cubeSize, -cubeSize, -cubeSize], [cubeSize, -cubeSize, cubeSize],
          [cubeSize, cubeSize, -cubeSize], [cubeSize, cubeSize, cubeSize],
          [-cubeSize, cubeSize, -cubeSize], [-cubeSize, cubeSize, cubeSize],
          
          // Top face
          [-cubeSize, -cubeSize, cubeSize], [cubeSize, -cubeSize, cubeSize],
          [cubeSize, -cubeSize, cubeSize], [cubeSize, cubeSize, cubeSize],
          [cubeSize, cubeSize, cubeSize], [-cubeSize, cubeSize, cubeSize],
          [-cubeSize, cubeSize, cubeSize], [-cubeSize, -cubeSize, cubeSize]
        ]
        
        points = cubeOutline.map(([x, y, z], i) => ({
          x, y, z, id: `draw-cube-${i}`
        }))
        break
    }
    
    onPointsChange(points)
  }

  return (
    <div className="menu-3d">
      <h2 className="menu-title">3D FOURIER</h2>
      
      {/* 3D Point Controls */}
      <div className="control-group">
        <h3 className="control-subtitle">3D Points</h3>
        
        <button 
          className={`control-button ${is3DActive ? 'active' : ''}`}
          onClick={() => onToggle3DActive(!is3DActive)}
        >
          {is3DActive ? 'Stop Adding Points' : 'Start Adding Points'}
        </button>
        
        <button 
          className="control-button"
          onClick={generateRandomPoints}
        >
          Random Points
        </button>
        
        <div className="shape-buttons">
          <button className="shape-button" onClick={() => generateShape('sphere')}>
            Sphere
          </button>
          <button className="shape-button" onClick={() => generateShape('helix')}>
            Helix
          </button>
          <button className="shape-button" onClick={() => generateShape('cube')}>
            Cube
          </button>
          <button className="shape-button" onClick={() => generateShape('star')}>
            Star
          </button>
          <button className="shape-button" onClick={() => generateShape('draw-cube')}>
            Draw Cube
          </button>
        </div>
        
        <button 
          className="control-button clear"
          onClick={onClearPoints}
        >
          Clear All Points
        </button>
      </div>

      {/* Visualization Controls */}
      <div className="control-group">
        <h3 className="control-subtitle">Visualization</h3>
        
        <div className="control-row">
          <label className="control-label">
            Dual Arm Mode: {useDualArm ? 'ON' : 'OFF'}
          </label>
          <button
            className="control-button small"
            onClick={() => onUseDualArmChange(!useDualArm)}
          >
            {useDualArm ? 'Single Arm' : 'Dual Arm'}
          </button>
        </div>
        
        {useDualArm && (
          <>
            <div className="control-row">
              <label className="control-label" htmlFor="arm-offset-slider">
                Arm Offset: {(armOffset / Math.PI).toFixed(2)}π
              </label>
              <input
                id="arm-offset-slider"
                type="range"
                className="control-slider"
                min="0"
                max="6.28"
                step="0.1"
                value={armOffset}
                onChange={(e) => onArmOffsetChange(parseFloat(e.target.value))}
                title="Arm Offset in radians"
              />
            </div>
            
            <div className="control-row">
              <label className="control-label" htmlFor="second-arm-color">
                Second Arm Color:
              </label>
              <div className="color-picker">
                <input
                  id="second-arm-color"
                  type="color"
                  value={secondArmColor}
                  onChange={(e) => onSecondArmColorChange(e.target.value)}
                  className="color-input"
                  title="Second Arm Color"
                />
                <span className="color-preview" style={{ backgroundColor: secondArmColor }}></span>
              </div>
            </div>
            
            <div className="offset-controls">
              <button 
                className="offset-button"
                onClick={() => onArmOffsetChange(0)}
              >
                0π
              </button>
              <button 
                className="offset-button"
                onClick={() => onArmOffsetChange(Math.PI / 2)}
              >
                π/2
              </button>
              <button 
                className="offset-button"
                onClick={() => onArmOffsetChange(Math.PI)}
              >
                π
              </button>
              <button 
                className="offset-button"
                onClick={() => onArmOffsetChange(3 * Math.PI / 2)}
              >
                3π/2
              </button>
              <button 
                className="offset-button"
                onClick={() => onArmOffsetChange(2 * Math.PI)}
              >
                2π
              </button>
            </div>
          </>
        )}
        
        <div className="control-row">
          <label className="control-label">
            Show Circles: {showCircles ? 'ON' : 'OFF'}
          </label>
          <button
            className="control-button small"
            onClick={() => onShowCirclesChange(!showCircles)}
          >
            {showCircles ? 'Hide' : 'Show'}
          </button>
        </div>
        
        <div className="control-row">
          <label className="control-label">
            Show Trails: {showTrails ? 'ON' : 'OFF'}
          </label>
          <button
            className="control-button small"
            onClick={() => onShowTrailsChange(!showTrails)}
          >
            {showTrails ? 'Hide' : 'Show'}
          </button>
        </div>
        
        <div className="control-row">
          <label className="control-label" htmlFor="trail-length-slider">
            Trail Length: {trailLength}
          </label>
          <input
            id="trail-length-slider"
            type="range"
            className="control-slider"
            min="10"
            max="300"
            step="10"
            value={trailLength}
            onChange={(e) => onTrailLengthChange(parseInt(e.target.value))}
            title="Trail Length"
          />
        </div>
        
        <div className="control-row">
          <label className="control-label" htmlFor="trail-color-picker">
            Trail Color:
          </label>
          <div className="color-picker">
            <input
              id="trail-color-picker"
              type="color"
              value={trailColor}
              onChange={(e) => onTrailColorChange(e.target.value)}
              className="color-input"
              title="Trail Color"
            />
            <span className="color-preview" style={{ backgroundColor: trailColor }}></span>
          </div>
        </div>
        
            <div className="control-row">
              <label className="control-label" htmlFor="animation-speed-slider">
                Animation Speed: {animationSpeed.toFixed(2)}x
              </label>
              <input
                id="animation-speed-slider"
                type="range"
                className="control-slider"
                min="0.01"
                max="2.0"
                step="0.01"
                value={animationSpeed}
                onChange={(e) => onAnimationSpeedChange(parseFloat(e.target.value))}
                title="Animation Speed"
              />
            </div>
            
            <div className="speed-controls">
              <button 
                className="speed-button slow"
                onClick={() => onAnimationSpeedChange(Math.max(0.01, animationSpeed - 0.1))}
              >
                Slower
              </button>
              <button 
                className="speed-button pause"
                onClick={() => onAnimationSpeedChange(0)}
              >
                Pause
              </button>
              <button 
                className="speed-button play"
                onClick={() => onAnimationSpeedChange(animationSpeed === 0 ? 0.5 : animationSpeed)}
              >
                Play
              </button>
              <button 
                className="speed-button fast"
                onClick={() => onAnimationSpeedChange(Math.min(2.0, animationSpeed + 0.1))}
              >
                Faster
              </button>
            </div>
        
            <div className="control-row">
              <label className="control-label" htmlFor="max-coefficients-slider">
                Max Fourier Coefficients: {maxCoefficients}
              </label>
              <input
                id="max-coefficients-slider"
                type="range"
                className="control-slider"
                min="1"
                max="200"
                step="1"
                value={maxCoefficients}
                onChange={(e) => onMaxCoefficientsChange(parseInt(e.target.value))}
                title="Max Fourier Coefficients"
              />
            </div>
            
            <div className="coefficient-controls">
              <button 
                className="coefficient-button minus-10"
                onClick={() => onMaxCoefficientsChange(Math.max(1, maxCoefficients - 10))}
              >
                -10
              </button>
              <button 
                className="coefficient-button minus-1"
                onClick={() => onMaxCoefficientsChange(Math.max(1, maxCoefficients - 1))}
              >
                -1
              </button>
              <button 
                className="coefficient-button plus-1"
                onClick={() => onMaxCoefficientsChange(Math.min(200, maxCoefficients + 1))}
              >
                +1
              </button>
              <button 
                className="coefficient-button plus-10"
                onClick={() => onMaxCoefficientsChange(Math.min(200, maxCoefficients + 10))}
              >
                +10
              </button>
            </div>
      </div>

      {/* Status */}
      <div className="status-display">
        <div className="status-title">Status</div>
        <div className="status-value">3D Points: {points3D.length}</div>
        <div className="status-value">Mode: {is3DActive ? 'Adding Points' : 'Viewing'}</div>
        <div className="status-value">Circles: {showCircles ? 'ON' : 'OFF'}</div>
        <div className="status-value">Trails: {showTrails ? 'ON' : 'OFF'}</div>
        <div className="status-value">Max Coefficients: {maxCoefficients}</div>
      </div>
    </div>
  )
}