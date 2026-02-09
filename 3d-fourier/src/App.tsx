import { useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { CameraControls } from './components/CameraControls'
import { Menu3D } from './components/Menu3D'
import { Point3DManager } from './components/Point3DManager'
import { Fourier3DTransformReal } from './components/Fourier3DTransformReal'
import { DualArmFourier3D } from './components/DualArmFourier3D'
import './App.css'

function App() {
  const [showCircles, setShowCircles] = useState(true)
  const [showTrails, setShowTrails] = useState(true)
  const [trailLength, setTrailLength] = useState(200)
  const [trailColor, setTrailColor] = useState("#00ffff")
  const [points3D, setPoints3D] = useState<{ x: number; y: number; z: number; id: string }[]>([])
  const [is3DActive, setIs3DActive] = useState(false)
  const [animationSpeed, setAnimationSpeed] = useState(1.0)
  const [maxCoefficients, setMaxCoefficients] = useState(20)
  const [time, setTime] = useState(0)
  const [useDualArm, setUseDualArm] = useState(true)
  const [armOffset, setArmOffset] = useState(Math.PI) // Half period offset
  const [secondArmColor, setSecondArmColor] = useState("#ff8000")

  // Animation loop
  const AnimatedFourierTransform = () => {
    useFrame((_, delta) => {
      setTime(prevTime => prevTime + delta * animationSpeed)
    })

    if (useDualArm) {
      return (
        <DualArmFourier3D
          points3D={points3D}
          time={time}
          showCircles={showCircles}
          showTrails={showTrails}
          trailLength={trailLength}
          trailColor={trailColor}
          showCompletePath={true}
          maxCoefficients={maxCoefficients}
          armOffset={armOffset}
          secondArmColor={secondArmColor}
        />
      )
    } else {
      return (
        <Fourier3DTransformReal
          points3D={points3D}
          time={time}
          showCircles={showCircles}
          showTrails={showTrails}
          trailLength={trailLength}
          trailColor={trailColor}
          showCompletePath={true}
          maxCoefficients={maxCoefficients}
        />
      )
    }
  }

  return (
    <div className="app">
      {/* 3D Scene */}
      <div className="scene-container">
        <Canvas
          camera={{ 
            position: [0, 0, 25], 
            fov: 75,
            near: 0.1,
            far: 1000
          }}
          style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)' }}
        >
              {/* Enhanced 3D Lighting */}
              <ambientLight intensity={0.4} />
              <directionalLight position={[20, 20, 10]} intensity={1.5} />
              <pointLight position={[-20, -20, -10]} color="#00ffff" intensity={1.0} />
              <pointLight position={[20, -20, 10]} color="#ff00ff" intensity={0.8} />
              <pointLight position={[0, 20, -20]} color="#00ff80" intensity={0.6} />
          
              {/* 3D Point Manager */}
              <Point3DManager
                onPointsChange={setPoints3D}
                isActive={is3DActive}
                onActiveChange={setIs3DActive}
              />

              {/* Fourier Transform */}
              <AnimatedFourierTransform />
          
          {/* Camera Controls */}
          <CameraControls />
        </Canvas>
      </div>

      {/* 3D Menu */}
          <Menu3D
            onPointsChange={setPoints3D}
            onClearPoints={() => setPoints3D([])}
            onToggle3DActive={setIs3DActive}
            is3DActive={is3DActive}
            points3D={points3D}
            showCircles={showCircles}
            onShowCirclesChange={setShowCircles}
            showTrails={showTrails}
            onShowTrailsChange={setShowTrails}
            trailLength={trailLength}
            onTrailLengthChange={setTrailLength}
            trailColor={trailColor}
            onTrailColorChange={setTrailColor}
            animationSpeed={animationSpeed}
            onAnimationSpeedChange={setAnimationSpeed}
            maxCoefficients={maxCoefficients}
            onMaxCoefficientsChange={setMaxCoefficients}
            useDualArm={useDualArm}
            onUseDualArmChange={setUseDualArm}
            armOffset={armOffset}
            onArmOffsetChange={setArmOffset}
            secondArmColor={secondArmColor}
            onSecondArmColorChange={setSecondArmColor}
          />
    </div>
  )
}

export default App