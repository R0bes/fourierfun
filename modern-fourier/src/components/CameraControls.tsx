import React, { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

const CameraControls: React.FC = () => {
  const { camera, gl } = useThree()
  const controlsRef = useRef<OrbitControls | null>(null)

  useEffect(() => {
    // Create OrbitControls
    const controls = new OrbitControls(camera, gl.domElement)
    controls.enabled = false // Start disabled - only drawing mode
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.screenSpacePanning = false
    controls.minDistance = 2
    controls.maxDistance = 20
    controls.maxPolarAngle = Math.PI / 2
    
    controlsRef.current = controls

    // Handle Alt key
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.altKey) {
        controls.enabled = true
        console.log('🎥 Camera controls enabled (Alt pressed)')
      }
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      if (!event.altKey) {
        controls.enabled = false
        console.log('🎨 Drawing mode enabled (Alt released)')
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keyup', handleKeyUp)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('keyup', handleKeyUp)
      controls.dispose()
    }
  }, [camera, gl])

  // Update controls
  useEffect(() => {
    const animate = () => {
      if (controlsRef.current) {
        controlsRef.current.update()
      }
      requestAnimationFrame(animate)
    }
    animate()
  }, [])

  return null // This component only handles controls
}

export default CameraControls
