import React, { useMemo } from 'react'
import { useFourier } from '../hooks/useFourier'
import * as THREE from 'three'

const DrawingVisualization: React.FC = () => {
  const { drawing, fourierData, controls } = useFourier()
  
  // Create drawing line geometry
  const drawingGeometry = useMemo(() => {
    if (drawing.length === 0) return null
    
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(drawing.length * 3)
    
    drawing.forEach((point, index) => {
      positions[index * 3] = point.x
      positions[index * 3 + 1] = point.y
      positions[index * 3 + 2] = 0.01
    })
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return geometry
  }, [drawing])
  
  if (!controls.showDrawing || !drawingGeometry) return null
  
  return (
    <line geometry={drawingGeometry}>
      <lineBasicMaterial 
        color={controls.color1} 
        linewidth={controls.lineThickness}
        transparent={true}
        opacity={0.8}
      />
    </line>
  )
}

export default DrawingVisualization