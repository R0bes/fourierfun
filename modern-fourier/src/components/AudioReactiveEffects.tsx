import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useAudio } from '../hooks/useAudio'
import * as THREE from 'three'

const AudioReactiveEffects: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null)
  const { audioData, controls } = useAudio()
  
  // Create audio-reactive geometry
  const geometry = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(2, 2, 64, 64)
    
    // Add audio-reactive vertex displacement
    const positions = geometry.attributes.position.array as Float32Array
    const originalPositions = [...positions]
    
    geometry.userData.originalPositions = originalPositions
    
    return geometry
  }, [])
  
  // Create audio-reactive material
  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#00ff88',
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide,
      emissive: '#00ff88',
      emissiveIntensity: 0.2
    })
  }, [])
  
  // Update geometry based on audio data
  useFrame(() => {
    if (!meshRef.current || !geometry) return
    
    const positions = geometry.attributes.position.array as Float32Array
    const originalPositions = geometry.userData.originalPositions as Float32Array
    
    // Apply audio-reactive displacement
    for (let i = 0; i < positions.length; i += 3) {
      const x = originalPositions[i]
      const y = originalPositions[i + 1]
      const z = originalPositions[i + 2]
      
      // Use frequency data for displacement
      const frequencyIndex = Math.floor((x + 1) * 0.5 * audioData.frequencyData.length)
      const amplitude = audioData.frequencyData[frequencyIndex] / 255
      
      // Apply displacement
      positions[i + 2] = z + amplitude * 0.5 * controls.sensitivity
    }
    
    geometry.attributes.position.needsUpdate = true
    geometry.computeVertexNormals()
    
    // Update material based on audio
    if (material) {
      const bassIntensity = audioData.bass / 255
      const midIntensity = audioData.mid / 255
      const trebleIntensity = audioData.treble / 255
      
      // Color based on frequency bands
      material.color.setRGB(
        trebleIntensity,
        midIntensity,
        bassIntensity
      )
      
      material.emissiveIntensity = audioData.volume / 255 * 0.5
    }
  })
  
  return (
    <mesh ref={meshRef} geometry={geometry} material={material} position={[0, 0, -1]} />
  )
}

export default AudioReactiveEffects
