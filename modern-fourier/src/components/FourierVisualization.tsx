import React, { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useFourier } from '../hooks/useFourier'
import * as THREE from 'three'
import vertexShader from '../shaders/fourier.vert?raw'
import fragmentShader from '../shaders/fourier.frag?raw'

const FourierVisualization: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null)
  const { fourierData, controls } = useFourier()
  const { gl } = useThree()
  
  // Create data texture for shader
  const dataTexture = useMemo(() => {
    const size = 256
    const data = new Float32Array(size * size * 4)
    
    for (let i = 0; i < size * size; i++) {
      const x = (i % size) / size
      const y = Math.floor(i / size) / size
      
      // Generate Fourier-based data
      let r = 0, g = 0, b = 0, a = 1
      
      fourierData.components.forEach((component, index) => {
        const freq = component.frequency / controls.frequencyCount
        const amp = component.amplitude
        
        r += amp * Math.sin(2 * Math.PI * freq * x + component.phase) * 0.5 + 0.5
        g += amp * Math.cos(2 * Math.PI * freq * y + component.phase) * 0.5 + 0.5
        b += amp * Math.sin(2 * Math.PI * freq * (x + y) + component.phase) * 0.5 + 0.5
      })
      
      data[i * 4] = r
      data[i * 4 + 1] = g
      data[i * 4 + 2] = b
      data[i * 4 + 3] = a
    }
    
    const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat, THREE.FloatType)
    texture.needsUpdate = true
    return texture
  }, [fourierData.components, controls.frequencyCount])
  
  // Shader material
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        time: { value: 0 },
        resolution: { value: new THREE.Vector2(gl.domElement.width, gl.domElement.height) },
        fourierData: { value: dataTexture },
        glowIntensity: { value: controls.glowIntensity },
        distortionAmount: { value: controls.distortionAmount },
        color1: { value: new THREE.Color(controls.color1) },
        color2: { value: new THREE.Color(controls.color2) },
        frequencyCount: { value: controls.frequencyCount },
        animationSpeed: { value: controls.animationSpeed }
      },
      transparent: true,
      side: THREE.DoubleSide
    })
  }, [dataTexture, controls, gl.domElement.width, gl.domElement.height])
  
  // Update uniforms
  useFrame((state) => {
    if (material) {
      material.uniforms.time.value = state.clock.elapsedTime
      material.uniforms.glowIntensity.value = controls.glowIntensity
      material.uniforms.distortionAmount.value = controls.distortionAmount
      material.uniforms.color1.value.set(controls.color1)
      material.uniforms.color2.value.set(controls.color2)
      material.uniforms.frequencyCount.value = controls.frequencyCount
      material.uniforms.animationSpeed.value = controls.animationSpeed
    }
  })
  
  return (
    <mesh ref={meshRef} material={material}>
      <planeGeometry args={[4, 4, 64, 64]} />
    </mesh>
  )
}

export default FourierVisualization
