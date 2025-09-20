import React, { useRef } from 'react'
import { useFourier } from '../hooks/useFourier'
import * as THREE from 'three'

const DrawingCanvas: React.FC = () => {
  const { startDrawing, continueDrawing, finishDrawing, isDrawing } = useFourier()
  const meshRef = useRef<THREE.Mesh>(null)
  
  const handlePointerDown = (event: any) => {
    event.stopPropagation()
    console.log('🎨 Starting to draw at:', event.point)
    
    const intersection = event.point
    if (intersection) {
      startDrawing({ x: intersection.x, y: intersection.y })
    }
  }
  
  const handlePointerMove = (event: any) => {
    if (!isDrawing) return
    
    event.stopPropagation()
    
    const intersection = event.point
    if (intersection) {
      continueDrawing({ x: intersection.x, y: intersection.y })
    }
  }
  
  const handlePointerUp = (event: any) => {
    if (isDrawing) {
      event.stopPropagation()
      finishDrawing()
    }
  }
  
  return (
    <mesh 
      ref={meshRef} 
      position={[0, 0, 0]}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <planeGeometry args={[10, 10]} />
      <meshBasicMaterial 
        color="#444444" 
        transparent={true} 
        opacity={0.5}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

export default DrawingCanvas