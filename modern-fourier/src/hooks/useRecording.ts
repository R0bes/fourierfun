import { useCallback, useRef, useState } from 'react'

export function useRecording() {
  const [isRecording, setIsRecording] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const framesRef = useRef<string[]>([])

  const stopInterval = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const exportGifFromFrames = useCallback(
    async (frames: string[], width: number, height: number, frameDelayMs: number) => {
      if (frames.length === 0) return
      const GIF = (await import('gif.js')).default
      const gif = new GIF({
        workers: 2,
        workerScript: '/gif.worker.js',
        width,
        height,
        quality: 10,
        repeat: 0
      })

      for (const dataUrl of frames) {
        const img = new Image()
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve()
          img.onerror = () => reject(new Error('frame load'))
          img.src = dataUrl
        })
        const c = document.createElement('canvas')
        c.width = width
        c.height = height
        const cx = c.getContext('2d')
        if (!cx) return
        cx.drawImage(img, 0, 0)
        gif.addFrame(cx, { copy: true, delay: frameDelayMs })
      }

      gif.on('finished', (blob: Blob) => {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `fourier-animation-${Date.now()}.gif`
        a.click()
        URL.revokeObjectURL(url)
      })
      gif.render()
    },
    []
  )

  const startRecording = useCallback(
    (canvas: HTMLCanvasElement, durationMs: number, fps: number) => {
      if (isRecording) return
      setIsRecording(true)
      framesRef.current = []
      const intervalMs = Math.max(1, Math.round(1000 / fps))
      const maxFrames = Math.max(1, Math.ceil(durationMs / intervalMs))
      let count = 0
      stopInterval()
      timerRef.current = setInterval(() => {
        framesRef.current.push(canvas.toDataURL('image/png'))
        count++
        if (count >= maxFrames) {
          stopInterval()
          setIsRecording(false)
          void exportGifFromFrames(framesRef.current, canvas.width, canvas.height, intervalMs)
        }
      }, intervalMs)
    },
    [exportGifFromFrames, isRecording, stopInterval]
  )

  const stopRecording = useCallback(
    (canvas: HTMLCanvasElement | null, fps: number) => {
      if (!isRecording) return
      stopInterval()
      setIsRecording(false)
      const intervalMs = Math.max(1, Math.round(1000 / fps))
      if (canvas && framesRef.current.length > 0) {
        void exportGifFromFrames(framesRef.current, canvas.width, canvas.height, intervalMs)
      }
    },
    [exportGifFromFrames, isRecording, stopInterval]
  )

  return { isRecording, startRecording, stopRecording }
}
