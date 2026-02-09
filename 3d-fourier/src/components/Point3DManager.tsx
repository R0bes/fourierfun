import React, { useState, useCallback, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import { Sphere, Line } from '@react-three/drei'
import * as THREE from 'three'

interface Point3D {
  x: number
  y: number
  z: number
  id: string
}

interface Point3DManagerProps {
  onPointsChange: (points: Point3D[]) => void
  isActive: boolean
  onActiveChange: (active: boolean) => void
}

export const Point3DManager: React.FC<Point3DManagerProps> = ({
  onPointsChange,
  isActive,
  onActiveChange
}) => {
  const [points, setPoints] = useState<Point3D[]>([])
  const [isDrawing, setIsDrawing] = useState(false)
  const { camera, raycaster, mouse } = useThree()
  const planeRef = useRef<THREE.Mesh>(null)

  // Handle mouse click in 3D space
  const handleClick = useCallback((event: React.MouseEvent) => {
    if (!isActive) return

    event.preventDefault()
    
    // Get mouse position in normalized device coordinates
    const rect = event.currentTarget.getBoundingClientRect()
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

    // Create a plane at z=0 for intersection
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)
    raycaster.setFromCamera(mouse, camera)

    // Find intersection with plane
    const intersectionPoint = new THREE.Vector3()
    raycaster.ray.intersectPlane(plane, intersectionPoint)

    if (intersectionPoint) {
      const newPoint: Point3D = {
        x: intersectionPoint.x,
        y: intersectionPoint.y,
        z: intersectionPoint.z,
        id: `point-${Date.now()}-${Math.random()}`
      }

      setPoints(prev => {
        const newPoints = [...prev, newPoint]
        onPointsChange(newPoints)
        return newPoints
      })
    }
  }, [isActive, camera, raycaster, mouse, onPointsChange])

  // Handle right click to close curve
  const handleRightClick = useCallback((event: React.MouseEvent) => {
    if (!isActive || points.length < 2) return

    event.preventDefault()
    
    // Close the curve by connecting to the first point
    const firstPoint = points[0]
    const closedPoints = [...points, firstPoint]
    
    setPoints(closedPoints)
    onPointsChange(closedPoints)
    setIsDrawing(false)
  }, [isActive, points, onPointsChange])

  // Handle double right click to fix curve
  const handleDoubleRightClick = useCallback((event: React.MouseEvent) => {
    if (!isActive || points.length < 2) return

    event.preventDefault()
    
    // Fix the curve - stop editing
    setIsDrawing(false)
    onActiveChange(false)
  }, [isActive, points, onActiveChange])

  // Clear all points
  const clearPoints = useCallback(() => {
    setPoints([])
    onPointsChange([])
    setIsDrawing(false)
  }, [onPointsChange])

  // Start/stop drawing
  const toggleDrawing = useCallback(() => {
    if (points.length === 0) {
      setIsDrawing(true)
      onActiveChange(true)
    } else {
      setIsDrawing(false)
      onActiveChange(false)
    }
  }, [points.length, onActiveChange])

  return (
    <group>
      {/* Invisible plane for raycasting */}
      <mesh
        ref={planeRef}
        position={[0, 0, 0]}
        visible={false}
        onClick={handleClick}
        onContextMenu={handleRightClick}
        onDoubleClick={handleDoubleRightClick}
      >
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Render existing points */}
      {points.map((point, index) => (
        <group key={point.id}>
          {/* Point sphere */}
          <Sphere
            args={[0.1, 16, 16]}
            position={[point.x, point.y, point.z]}
          >
            <meshStandardMaterial
              color="#ff00ff"
              transparent={true}
              opacity={0.8}
              emissive="#ff00ff"
              emissiveIntensity={0.3}
            />
          </Sphere>

          {/* Connection line to next point */}
          {index < points.length - 1 && (
            <Line
              points={[
                [point.x, point.y, point.z],
                [points[index + 1].x, points[index + 1].y, points[index + 1].z]
              ]}
              color="#00ffff"
              lineWidth={2}
              transparent={true}
              opacity={0.6}
            />
          )}

          {/* Close line to first point if curve is closed */}
          {index === points.length - 1 && points.length > 2 && (
            <Line
              points={[
                [point.x, point.y, point.z],
                [points[0].x, points[0].y, points[0].z]
              ]}
              color="#00ff80"
              lineWidth={2}
              transparent={true}
              opacity={0.6}
            />
          )}
        </group>
      ))}

      {/* Control UI (floating in 3D space) */}
      {isActive && (
        <group position={[0, 0, 5]}>
          {/* Start/Stop button */}
          <mesh
            position={[-2, 2, 0]}
            onClick={toggleDrawing}
          >
            <boxGeometry args={[0.5, 0.2, 0.1]} />
            <meshStandardMaterial
              color={isDrawing ? "#ff4444" : "#44ff44"}
              transparent={true}
              opacity={0.8}
            />
          </mesh>

          {/* Clear button */}
          <mesh
            position={[2, 2, 0]}
            onClick={clearPoints}
          >
            <boxGeometry args={[0.5, 0.2, 0.1]} />
            <meshStandardMaterial
              color="#ff8844"
              transparent={true}
              opacity={0.8}
            />
          </mesh>

          {/* Instructions */}
          <mesh position={[0, 1.5, 0]}>
            <boxGeometry args={[3, 0.1, 0.1]} />
            <meshStandardMaterial
              color="#ffffff"
              transparent={true}
              opacity={0.6}
            />
          </mesh>
        </group>
      )}
    </group>
  )
}
