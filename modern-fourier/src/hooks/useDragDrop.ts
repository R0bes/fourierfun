import { useState, useCallback } from 'react'
import { DragState } from '../types'

export const useDragDrop = () => {
  const [dragState, setDragState] = useState<DragState>({
    isDraggingCenter: false,
    draggedPointIndex: null
  })

  const startDraggingCenter = useCallback(() => {
    setDragState(prev => ({ ...prev, isDraggingCenter: true }))
  }, [])

  const stopDraggingCenter = useCallback(() => {
    setDragState(prev => ({ ...prev, isDraggingCenter: false }))
  }, [])

  const startDraggingPoint = useCallback((index: number) => {
    setDragState(prev => ({ ...prev, draggedPointIndex: index }))
  }, [])

  const stopDraggingPoint = useCallback(() => {
    setDragState(prev => ({ ...prev, draggedPointIndex: null }))
  }, [])

  const toggleDraggingPoint = useCallback((index: number) => {
    console.log('🟡 TOGGLE DRAGGING POINT aufgerufen! Index:', index, 'Zeitstempel:', new Date().toISOString())
    setDragState(prev => {
      const newIndex = prev.draggedPointIndex === index ? null : index
      console.log('🟡 TOGGLE DRAGGING POINT - Alter Index:', prev.draggedPointIndex, 'Neuer Index:', newIndex)
      return {
        ...prev,
        draggedPointIndex: newIndex
      }
    })
  }, [])

  const stopAllDragging = useCallback(() => {
    console.log('🟡 STOP ALL DRAGGING aufgerufen! Zeitstempel:', new Date().toISOString())
    setDragState({
      isDraggingCenter: false,
      draggedPointIndex: null
    })
  }, [])

  return {
    dragState,
    startDraggingCenter,
    stopDraggingCenter,
    startDraggingPoint,
    stopDraggingPoint,
    toggleDraggingPoint,
    stopAllDragging
  }
}
