import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Leva } from 'leva'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import DrawingCanvas from './components/DrawingCanvas'
import DrawingVisualization from './components/DrawingVisualization'
import FourierCircles from './components/FourierCircles'
import Controls from './components/Controls'
import InfoPanel from './components/InfoPanel'

function App() {
  return (
    <>
      <Leva 
        titleBar={{ title: 'Fourier Controls' }}
        collapsed={false}
      />
      
      <Canvas
        camera={{ 
          position: [0, 0, 5], 
          fov: 75
        }}
        style={{ background: '#000' }}
      >
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} color="#00ff88" />
          
          {/* Main Components */}
          <DrawingCanvas />
          <DrawingVisualization />
          <FourierCircles />
          
          {/* Camera Controls */}
          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={2}
            maxDistance={20}
          />
        </Suspense>
      </Canvas>
      
      <Controls />
      <InfoPanel />
    </>
  )
}

export default App