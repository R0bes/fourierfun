import { useState, useEffect, useRef } from 'react'
import { useControls } from 'leva'

export interface AudioData {
  frequencyData: Uint8Array
  timeDomainData: Uint8Array
  volume: number
  bass: number
  mid: number
  treble: number
}

export const useAudio = () => {
  const [audioData, setAudioData] = useState<AudioData>({
    frequencyData: new Uint8Array(256),
    timeDomainData: new Uint8Array(256),
    volume: 0,
    bass: 0,
    mid: 0,
    treble: 0
  })
  
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const animationRef = useRef<number>()
  
  const {
    sensitivity,
    smoothing,
    bassRange,
    midRange,
    trebleRange
  } = useControls({
    sensitivity: { value: 1.0, min: 0.1, max: 3.0, step: 0.1 },
    smoothing: { value: 0.8, min: 0.0, max: 1.0, step: 0.01 },
    bassRange: { value: [0, 4], min: 0, max: 32, step: 1 },
    midRange: { value: [4, 16], min: 0, max: 32, step: 1 },
    trebleRange: { value: [16, 32], min: 0, max: 32, step: 1 }
  })

  const startListening = async () => {
    try {
      setError(null)
      
      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        } 
      })
      
      // Create audio context
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      analyserRef.current = audioContextRef.current.createAnalyser()
      microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream)
      
      // Configure analyser
      analyserRef.current.fftSize = 512
      analyserRef.current.smoothingTimeConstant = smoothing
      
      // Connect nodes
      microphoneRef.current.connect(analyserRef.current)
      
      setIsListening(true)
      
      // Start analysis loop
      analyzeAudio()
      
    } catch (err) {
      setError('Microphone access denied or not available')
      console.error('Audio setup error:', err)
    }
  }

  const stopListening = () => {
    if (microphoneRef.current) {
      microphoneRef.current.disconnect()
    }
    if (audioContextRef.current) {
      audioContextRef.current.close()
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
    
    setIsListening(false)
    setAudioData({
      frequencyData: new Uint8Array(256),
      timeDomainData: new Uint8Array(256),
      volume: 0,
      bass: 0,
      mid: 0,
      treble: 0
    })
  }

  const analyzeAudio = () => {
    if (!analyserRef.current) return
    
    const frequencyData = new Uint8Array(analyserRef.current.frequencyBinCount)
    const timeDomainData = new Uint8Array(analyserRef.current.frequencyBinCount)
    
    analyserRef.current.getByteFrequencyData(frequencyData)
    analyserRef.current.getByteTimeDomainData(timeDomainData)
    
    // Calculate volume
    const volume = frequencyData.reduce((sum, value) => sum + value, 0) / frequencyData.length
    
    // Calculate frequency bands
    const bass = calculateFrequencyBand(frequencyData, bassRange[0], bassRange[1])
    const mid = calculateFrequencyBand(frequencyData, midRange[0], midRange[1])
    const treble = calculateFrequencyBand(frequencyData, trebleRange[0], trebleRange[1])
    
    setAudioData({
      frequencyData,
      timeDomainData,
      volume: volume * sensitivity,
      bass: bass * sensitivity,
      mid: mid * sensitivity,
      treble: treble * sensitivity
    })
    
    animationRef.current = requestAnimationFrame(analyzeAudio)
  }

  const calculateFrequencyBand = (data: Uint8Array, start: number, end: number): number => {
    const slice = data.slice(start, end)
    return slice.reduce((sum, value) => sum + value, 0) / slice.length
  }

  // Auto-start listening
  useEffect(() => {
    startListening()
    
    return () => {
      stopListening()
    }
  }, [])

  // Update smoothing when changed
  useEffect(() => {
    if (analyserRef.current) {
      analyserRef.current.smoothingTimeConstant = smoothing
    }
  }, [smoothing])

  return {
    audioData,
    isListening,
    error,
    startListening,
    stopListening,
    controls: {
      sensitivity,
      smoothing,
      bassRange,
      midRange,
      trebleRange
    }
  }
}
