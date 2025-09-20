import React, { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useFourier } from '../hooks/useFourier'
import * as THREE from 'three'

const FourierCircles: React.FC = () => {
  const { fourierData, controls } = useFourier()
  
  // Create circle geometries
  const circles = useMemo(() => {
    return fourierData.components.map((component, index) => {
      const geometry = new THREE.CircleGeometry(component.amplitude * controls.circleSize, 32)
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(index / Math.max(fourierData.components.length, 1), 1, 0.5),
        transparent: true,
        opacity: 0.7,
        side: THREE.DoubleSide
      })
      
      return { geometry, material, component, index }
    })
  }, [fourierData.components, controls.circleSize])
  
  useFrame((state) => {
    const time = state.clock.elapsedTime * controls.animationSpeed
    
    circles.forEach((circle, index) => {
      const { component } = circle
      
      // Calculate position based on Fourier component
      const angle = component.frequency * time + component.phase
      const radius = component.amplitude * controls.circleSize
      
      const x = radius * Math.cos(angle)
      const y = radius * Math.sin(angle)
      
      // Update circle position
      const circleMesh = state.scene.children.find(child => 
        child.userData.circleIndex === index
      ) as THREE.Mesh
      
      if (circleMesh) {
        circleMesh.position.set(x, y, 0.02)
      }
    })
  })
  
  if (!controls.showCircles || fourierData.components.length === 0) return null
  
  return (
    <group>
      {circles.map((circle, index) => (
        <mesh
          key={index}
          geometry={circle.geometry}
          material={circle.material}
          userData={{ circleIndex: index }}
        />
      ))}
    </group>
  )
}

export default FourierCircles