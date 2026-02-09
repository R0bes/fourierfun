import React from 'react'
import { OrbitControls } from '@react-three/drei'

export const CameraControls: React.FC = () => {
  return (
    <OrbitControls
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      autoRotate={false}
      autoRotateSpeed={2}
      minDistance={5}
      maxDistance={50}
      minPolarAngle={Math.PI / 6}
      maxPolarAngle={Math.PI - Math.PI / 6}
      enableDamping={true}
      dampingFactor={0.05}
    />
  )
}
