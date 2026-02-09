import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Line, Sphere, Circle, Trail } from '@react-three/drei'
import * as THREE from 'three'
import { Fourier3DComponent, Point3D } from '../types'
import { calculateFourier3D } from '../utils/fourier3D'

interface FourierCircles3DProps {
  components: Fourier3DComponent[]
  time: number
  showTrails?: boolean
  trailLength?: number
  showCircles?: boolean
  showPoints?: boolean
  opacity?: number
}

export const FourierCircles3D: React.FC<FourierCircles3DProps> = React.memo(({
  components,
  time,
  showTrails = true,
  trailLength = 100,
  showCircles = true,
  showPoints = true,
  opacity = 0.8
}) => {
  const groupRef = useRef<THREE.Group>(null)
  const trailRef = useRef<THREE.Group>(null)
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  
  // Berechne Fourier-Punkte
  const points = useMemo(() => {
    return calculateFourier3D(components, time, 100)
  }, [components, time])
  
  // Berechne Epicycle-Positionen für jeden Kreis
  const epicyclePositions = useMemo(() => {
    const positions: THREE.Vector3[] = []
    let currentX = 0
    let currentY = 0
    let currentZ = 0
    
    for (const component of components) {
      const angle = component.frequency * time + component.phase
      const x = currentX + component.amplitude * Math.cos(angle)
      const y = currentY + component.amplitude * Math.sin(angle)
      const z = currentZ + component.zOffset
      
      positions.push(new THREE.Vector3(x, y, z))
      
      currentX = x
      currentY = y
      currentZ = z
    }
    
    return positions
  }, [components, time])
  
  // Trail-Punkte für Animation
  const trailPoints = useMemo(() => {
    if (!showTrails || points.length === 0) return []
    
    const trail: THREE.Vector3[] = []
    const startIndex = Math.max(0, points.length - trailLength)
    
    for (let i = startIndex; i < points.length; i++) {
      trail.push(new THREE.Vector3(points[i].x, points[i].y, points[i].z))
    }
    
    return trail
  }, [points, showTrails, trailLength])
  
  // Hologram-Shader-Material
  const hologramMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: time },
        opacity: { value: opacity },
        color: { value: new THREE.Color('#00ffff') }
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vPosition;
        void main() {
          vUv = uv;
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform float opacity;
        uniform vec3 color;
        varying vec2 vUv;
        varying vec3 vPosition;
        
        void main() {
          // Hologram-Effekt
          float scanLine = sin(vPosition.y * 20.0 + time * 10.0) * 0.5 + 0.5;
          float flicker = sin(time * 30.0) * 0.1 + 0.9;
          
          // Glow-Effekt
          float glow = 1.0 - length(vUv - 0.5) * 2.0;
          glow = pow(glow, 2.0);
          
          vec3 finalColor = color * scanLine * flicker * glow;
          gl_FragColor = vec4(finalColor, opacity * glow);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide
    })
  }, [time, opacity])
  
  // Animation für Epicycles
  useFrame((state, delta) => {
    if (groupRef.current) {
      // Sanfte Rotation für visuellen Effekt
      groupRef.current.rotation.y += 0.001
    }
    
    // Update Shader Uniforms
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = time
    }
  })
  
  return (
    <group ref={groupRef}>
      {/* Haupt-Trail mit Hologram-Effekt */}
      {showTrails && trailPoints.length > 1 && (
        <Line
          points={trailPoints}
          color="#00ffff"
          lineWidth={3}
          transparent
          opacity={opacity * 0.8}
        >
          <primitive object={hologramMaterial} ref={materialRef} />
        </Line>
      )}
      
      {/* Epicycles mit verbesserten Effekten */}
      {showCircles && components.map((component, index) => {
        const position = epicyclePositions[index]
        const prevPosition = index > 0 ? epicyclePositions[index - 1] : new THREE.Vector3(0, 0, 0)
        
        return (
          <group key={index}>
            {/* Hologram-Kreis */}
            <Circle
              args={[component.amplitude, 64]}
              position={prevPosition}
              rotation={[0, 0, 0]}
            >
              <meshBasicMaterial
                color={component.color}
                transparent
                opacity={opacity * 0.2}
                side={THREE.DoubleSide}
                emissive={component.color}
                emissiveIntensity={0.1}
              />
            </Circle>
            
            {/* Verbindungslinie mit Glow */}
            <Line
              points={[prevPosition, position]}
              color={component.color}
              lineWidth={2}
              transparent
              opacity={opacity * 0.6}
            />
            
            {/* Endpunkt mit Hologram-Effekt */}
            <Sphere
              args={[0.08, 16, 16]}
              position={position}
            >
              <meshBasicMaterial
                color={component.color}
                emissive={component.color}
                emissiveIntensity={0.5}
                transparent
                opacity={opacity}
              />
            </Sphere>
            
            {/* Zusätzlicher Glow-Ring */}
            <Circle
              args={[0.15, 32]}
              position={position}
              rotation={[Math.PI / 2, 0, 0]}
            >
              <meshBasicMaterial
                color={component.color}
                transparent
                opacity={opacity * 0.3}
                side={THREE.DoubleSide}
                emissive={component.color}
                emissiveIntensity={0.2}
              />
            </Circle>
          </group>
        )
      })}
      
      {/* Haupt-Punkt mit erweiterten Effekten */}
      {showPoints && points.length > 0 && (
        <group>
          {/* Haupt-Sphäre */}
          <Sphere
            args={[0.12, 20, 20]}
            position={[
              points[points.length - 1].x,
              points[points.length - 1].y,
              points[points.length - 1].z
            ]}
          >
            <meshBasicMaterial
              color="#ffffff"
              emissive="#ffffff"
              emissiveIntensity={0.8}
              transparent
              opacity={opacity}
            />
          </Sphere>
          
          {/* Glow-Ring */}
          <Circle
            args={[0.2, 32]}
            position={[
              points[points.length - 1].x,
              points[points.length - 1].y,
              points[points.length - 1].z
            ]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <meshBasicMaterial
              color="#00ffff"
              transparent
              opacity={opacity * 0.4}
              side={THREE.DoubleSide}
              emissive="#00ffff"
              emissiveIntensity={0.3}
            />
          </Circle>
          
          {/* Äußerer Ring */}
          <Circle
            args={[0.3, 32]}
            position={[
              points[points.length - 1].x,
              points[points.length - 1].y,
              points[points.length - 1].z
            ]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <meshBasicMaterial
              color="#ff00ff"
              transparent
              opacity={opacity * 0.2}
              side={THREE.DoubleSide}
              emissive="#ff00ff"
              emissiveIntensity={0.1}
            />
          </Circle>
        </group>
      )}
      
      {/* Z-Achse Indikatoren mit verbesserten Effekten */}
      {components.some(comp => comp.zOffset !== 0) && (
        <group>
          {components.map((component, index) => {
            if (component.zOffset === 0) return null
            
            const position = epicyclePositions[index]
            
            return (
              <group key={`z-${index}`}>
                {/* Z-Achse Linie */}
                <Line
                  points={[
                    new THREE.Vector3(position.x, position.y, position.z),
                    new THREE.Vector3(position.x, position.y, position.z + component.zOffset)
                  ]}
                  color="#ff00ff"
                  lineWidth={2}
                  transparent
                  opacity={opacity * 0.5}
                  dashed
                  dashSize={0.1}
                  gapSize={0.1}
                />
                
                {/* Z-Achse Endpunkt */}
                <Sphere
                  args={[0.05, 12, 12]}
                  position={[
                    position.x,
                    position.y,
                    position.z + component.zOffset
                  ]}
                >
                  <meshBasicMaterial
                    color="#ff00ff"
                    emissive="#ff00ff"
                    emissiveIntensity={0.3}
                    transparent
                    opacity={opacity * 0.7}
                  />
                </Sphere>
              </group>
            )
          })}
        </group>
      )}
    </group>
  )
})
