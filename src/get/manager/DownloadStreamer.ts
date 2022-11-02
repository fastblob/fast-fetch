import { type RangeIndex } from '../range'

export class DownloadStreamer {
  private readonly maxRangeIndex: number
  private readonly blobQueue: Map<RangeIndex, Blob> = new Map()
  private currentRangeIndexToDo = 0
  private readonly stream: TransformStream<Uint8Array, Uint8Array> =
    new TransformStream()

  private writingLock = false

  constructor (maxRangeIndex: number, signal?: AbortSignal | null) {
    this.maxRangeIndex = maxRangeIndex
    if (signal != null) {
      signal.addEventListener('abort', () => {
        this.abort()
      })
    }
  }

  get ReadableStream (): ReadableStream<Uint8Array> {
    return this.stream.readable
  }

  queueBlob (index: RangeIndex, blob: Blob): void {
    this.blobQueue.set(index, blob)
    void this.write()
  }

  abort (reason?: any): void {
    void this.stream.writable.getWriter().abort(reason)
  }

  private async write (): Promise<void> {
    if (this.writingLock) {
      return
    }

    this.writingLock = true
    const blob = this.blobQueue.get(this.currentRangeIndexToDo)
    if (blob != null) {
      this.blobQueue.delete(this.currentRangeIndexToDo)
      this.currentRangeIndexToDo++
      try {
        await blob.stream().pipeTo(this.stream.writable, {
          preventClose: true
        })
      } catch (e) {
        // if pipeTo failed, abort the stream
        this.abort(e)
      }
    }
    if (this.currentRangeIndexToDo > this.maxRangeIndex) {
      void this.stream.writable.getWriter().close()
    }
    this.writingLock = false

    if (this.blobQueue.has(this.currentRangeIndexToDo)) {
      void this.write()
    }
  }
}
