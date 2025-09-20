import React, { useRef, useMemo, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useFourier } from '../hooks/useFourier'
import * as THREE from 'three'

interface TrailPoint {
  position: THREE.Vector3
  life: number
  maxLife: number
}

const TrailSystem: React.FC = () => {
  const { fourierData, controls } = useFourier()
  const [trails, setTrails] = useState<TrailPoint[]>([])
  const trailRef = useRef<THREE.Points>(null)
  
  // Create trail geometry
  const trailGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry()
    const maxTrailLength = controls.trailLength
    
    const positions = new Float32Array(maxTrailLength * 3)
    const colors = new Float32Array(maxTrailLength * 3)
    const sizes = new Float32Array(maxTrailLength)
    
    // Initialize with zeros
    for (let i = 0; i < maxTrailLength; i++) {
      positions[i * 3] = 0
      positions[i * 3 + 1] = 0
      positions[i * 3 + 2] = 0
      colors[i * 3] = 0
      colors[i * 3 + 1] = 0
      colors[i * 3 + 2] = 0
      sizes[i] = 0
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
    
    return geometry
  }, [controls.trailLength])
  
  // Add new trail point
  const addTrailPoint = (position: THREE.Vector3) => {
    setTrails(prev => {
      const newTrails = [...prev, {
        position: position.clone(),
        life: 1.0,
        maxLife: 1.0
      }]
      
      // Limit trail length
      if (newTrails.length > controls.trailLength) {
        return newTrails.slice(-controls.trailLength)
      }
      
      return newTrails
    })
  }
  
  // Update trails
  useFrame(() => {
    if (!trailRef.current || fourierData.reconstructedPath.length === 0) return
    
    // Add new trail point from reconstructed path
    const currentPoint = fourierData.reconstructedPath[fourierData.reconstructedPath.length - 1]
    if (currentPoint) {
      addTrailPoint(new THREE.Vector3(currentPoint.x, currentPoint.y, 0.03))
    }
    
    // Update trail life and positions
    setTrails(prev => {
      const updatedTrails = prev.map(trail => ({
        ...trail,
        life: Math.max(0, trail.life - 0.02) // Fade out over time
      })).filter(trail => trail.life > 0)
      
      return updatedTrails
    })
    
    // Update geometry
    const positions = trailGeometry.attributes.position.array as Float32Array
    const colors = trailGeometry.attributes.color.array as Float32Array
    const sizes = trailGeometry.attributes.size.array as Float32Array
    
    trails.forEach((trail, index) => {
      if (index < controls.trailLength) {
        // Position
        positions[index * 3] = trail.position.x
        positions[index * 3 + 1] = trail.position.y
        positions[index * 3 + 2] = trail.position.z
        
        // Color based on life and frequency
        const lifeRatio = trail.life / trail.maxLife
        const hue = (index / controls.trailLength + fourierData.animationTime * 0.1) % 1
        const color = new THREE.Color().setHSL(hue, 1, 0.5)
        
        colors[index * 3] = color.r * lifeRatio
        colors[index * 3 + 1] = color.g * lifeRatio
        colors[index * 3 + 2] = color.b * lifeRatio
        
        // Size based on life
        sizes[index] = lifeRatio * 0.1
      }
    })
    
    trailGeometry.attributes.position.needsUpdate = true
    trailGeometry.attributes.color.needsUpdate = true
    trailGeometry.attributes.size.needsUpdate = true
  })
  
  if (!controls.showTrails || fourierData.components.length === 0) return null
  
  return (
    <points ref={trailRef} geometry={trailGeometry}>
      <pointsMaterial
        size={0.05}
        transparent={true}
        opacity={0.8}
        vertexColors={true}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}

export default TrailSystem
