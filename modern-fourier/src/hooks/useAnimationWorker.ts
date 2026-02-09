import { useEffect, useRef, useCallback } from 'react'
import { FourierComponent, Point } from '../types'

interface AnimationWorkerMessage {
  type: 'start' | 'stop' | 'updateSpeed'
  fourierComponents?: FourierComponent[]
  centerOfMass?: Point
  animationSpeed?: number
}

interface AnimationWorkerResponse {
  type: 'animationFrame'
  time: number
  pathPoint: Point
}

export const useAnimationWorker = (
  fourierComponents: FourierComponent[],
  centerOfMass: Point,
  animationSpeed: number,
  isActive: boolean,
  onAnimationFrame: (time: number, pathPoint: Point) => void
) => {
  const workerRef = useRef<Worker | null>(null)

  // Initialize worker
  useEffect(() => {
    workerRef.current = new Worker(new URL('../workers/animationWorker.ts', import.meta.url))
    
    workerRef.current.onmessage = (event: MessageEvent<AnimationWorkerResponse>) => {
      if (event.data.type === 'animationFrame') {
        onAnimationFrame(event.data.time, event.data.pathPoint)
      }
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate()
        workerRef.current = null
      }
    }
  }, [onAnimationFrame])

  // Start/stop animation based on isActive
  useEffect(() => {
    if (!workerRef.current) return

    if (isActive && fourierComponents.length > 0) {
      const message: AnimationWorkerMessage = {
        type: 'start',
        fourierComponents,
        centerOfMass,
        animationSpeed
      }
      workerRef.current.postMessage(message)
    } else {
      workerRef.current.postMessage({ type: 'stop' })
    }
  }, [isActive, fourierComponents, centerOfMass, animationSpeed])

  // Update speed when it changes
  useEffect(() => {
    if (!workerRef.current || !isActive) return

    workerRef.current.postMessage({
      type: 'updateSpeed',
      animationSpeed
    })
  }, [animationSpeed, isActive])

  return {
    startAnimation: useCallback(() => {
      if (workerRef.current && fourierComponents.length > 0) {
        workerRef.current.postMessage({
          type: 'start',
          fourierComponents,
          centerOfMass,
          animationSpeed
        })
      }
    }, [fourierComponents, centerOfMass, animationSpeed]),
    
    stopAnimation: useCallback(() => {
      if (workerRef.current) {
        workerRef.current.postMessage({ type: 'stop' })
      }
    }, [])
  }
}
