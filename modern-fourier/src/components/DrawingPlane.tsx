import React, { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useFourier } from '../hooks/useFourier'
import * as THREE from 'three'

const DrawingPlane: React.FC = () => {
  const { isDrawing } = useFourier()
  const meshRef = useRef<THREE.Mesh>(null)
  const [showHint, setShowHint] = useState(true)
  
  // Hide hint after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowHint(false), 5000)
    return () => clearTimeout(timer)
  }, [])
  
  useFrame(() => {
    if (meshRef.current) {
      // Pulsing effect when drawing
      const scale = isDrawing ? 1.05 : 1.0
      meshRef.current.scale.setScalar(scale)
    }
  })
  
  return (
    <group>
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <planeGeometry args={[8, 8]} />
        <meshBasicMaterial 
          color={isDrawing ? "#00ff88" : "#333333"} 
          transparent={true} 
          opacity={isDrawing ? 0.3 : 0.1}
          side={THREE.DoubleSide}
          wireframe={false}
        />
      </mesh>
      
      {/* Hint text */}
      {showHint && (
        <mesh position={[0, 0, 0.01]}>
          <planeGeometry args={[6, 1]} />
          <meshBasicMaterial 
            color="#00ff88" 
            transparent={true} 
            opacity={0.8}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  )
}

export default DrawingPlane
