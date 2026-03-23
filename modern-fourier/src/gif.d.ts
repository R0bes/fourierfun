declare module 'gif.js' {
  interface GIFOptions {
    workers?: number
    workerScript?: string
    width: number
    height: number
    quality?: number
    repeat?: number
  }

  interface AddFrameOptions {
    delay?: number
    copy?: boolean
  }

  export default class GIF {
    constructor(options: GIFOptions)
    addFrame(
      image: HTMLCanvasElement | CanvasRenderingContext2D | ImageData,
      options?: AddFrameOptions
    ): void
    on(event: 'finished', handler: (blob: Blob) => void): void
    render(): void
  }
}
