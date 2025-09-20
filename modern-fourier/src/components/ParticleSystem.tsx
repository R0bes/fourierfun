import React, { useRef, useMemo, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useAudio } from '../hooks/useAudio'
import { useFourier } from '../hooks/useFourier'
import * as THREE from 'three'
import vertexShader from '../shaders/particle.vert?raw'
import fragmentShader from '../shaders/particle.frag?raw'

interface Particle {
  position: THREE.Vector3
  velocity: THREE.Vector3
  life: number
  size: number
  color: THREE.Color
}

const ParticleSystem: React.FC = () => {
  const meshRef = useRef<THREE.Points>(null)
  const { audioData } = useAudio()
  const { fourierData } = useFourier()
  const { camera } = useThree()
  
  const particleCount = 10000
  
  // Create particle system
  const { geometry, material } = useMemo(() => {
    const geometry = new THREE.BufferGeometry()
    
    // Initialize particle data
    const positions = new Float32Array(particleCount * 3)
    const velocities = new Float32Array(particleCount * 3)
    const lives = new Float32Array(particleCount)
    const sizes = new Float32Array(particleCount)
    const colors = new Float32Array(particleCount * 3)
    
    for (let i = 0; i < particleCount; i++) {
      // Random initial position
      positions[i * 3] = (Math.random() - 0.5) * 10
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10
      
      // Random velocity
      velocities[i * 3] = (Math.random() - 0.5) * 0.1
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.1
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.1
      
      // Random life
      lives[i] = Math.random()
      
      // Random size
      sizes[i] = Math.random() * 0.1 + 0.05
      
      // Random color
      colors[i * 3] = Math.random()
      colors[i * 3 + 1] = Math.random()
      colors[i * 3 + 2] = Math.random()
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3))
    geometry.setAttribute('life', new THREE.BufferAttribute(lives, 1))
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        time: { value: 0 },
        cameraPosition: { value: camera.position },
        color1: { value: new THREE.Color('#00ff88') },
        color2: { value: new THREE.Color('#ff0088') },
        glowIntensity: { value: 2.0 }
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexColors: true
    })
    
    return { geometry, material }
  }, [particleCount, camera.position])
  
  // Update particles
  useFrame((state) => {
    if (!meshRef.current) return
    
    const positions = geometry.attributes.position.array as Float32Array
    const velocities = geometry.attributes.velocity.array as Float32Array
    const lives = geometry.attributes.life.array as Float32Array
    const colors = geometry.attributes.color.array as Float32Array
    
    const time = state.clock.elapsedTime
    
    for (let i = 0; i < particleCount; i++) {
      // Update life
      lives[i] -= 0.01
      if (lives[i] <= 0) {
        lives[i] = 1.0
        // Reset position
        positions[i * 3] = (Math.random() - 0.5) * 10
        positions[i * 3 + 1] = (Math.random() - 0.5) * 10
        positions[i * 3 + 2] = (Math.random() - 0.5) * 10
      }
      
      // Audio-reactive movement
      const audioInfluence = audioData.volume / 255
      const bassInfluence = audioData.bass / 255
      
      // Update velocity based on audio
      velocities[i * 3] += Math.sin(time + i * 0.01) * audioInfluence * 0.01
      velocities[i * 3 + 1] += Math.cos(time + i * 0.01) * bassInfluence * 0.01
      velocities[i * 3 + 2] += Math.sin(time * 0.5 + i * 0.01) * audioInfluence * 0.01
      
      // Update position
      positions[i * 3] += velocities[i * 3]
      positions[i * 3 + 1] += velocities[i * 3 + 1]
      positions[i * 3 + 2] += velocities[i * 3 + 2]
      
      // Fourier-based color modulation
      if (fourierData.components.length > 0) {
        const componentIndex = i % fourierData.components.length
        const component = fourierData.components[componentIndex]
        
        const frequency = component.frequency / 100
        const amplitude = component.amplitude
        
        colors[i * 3] = Math.sin(time * frequency + component.phase) * amplitude * 0.5 + 0.5
        colors[i * 3 + 1] = Math.cos(time * frequency + component.phase) * amplitude * 0.5 + 0.5
        colors[i * 3 + 2] = Math.sin(time * frequency * 1.5 + component.phase) * amplitude * 0.5 + 0.5
      }
    }
    
    geometry.attributes.position.needsUpdate = true
    geometry.attributes.velocity.needsUpdate = true
    geometry.attributes.life.needsUpdate = true
    geometry.attributes.color.needsUpdate = true
    
    // Update material uniforms
    material.uniforms.time.value = time
    material.uniforms.cameraPosition.value.copy(camera.position)
    material.uniforms.glowIntensity.value = audioData.volume / 255 * 5 + 1
  })
  
  return (
    <points ref={meshRef} geometry={geometry} material={material} />
  )
}

export default ParticleSystem
