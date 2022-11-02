import type { Range } from '../range/types'
import type { FetchInput, GETRequestConfig, GETInit } from '../request'

export class DownloadWorker {
  readonly input: FetchInput
  readonly requestConfig: GETRequestConfig

  private errorPromise = Promise.resolve()
  private currentRetry = 0

  constructor (input: FetchInput, requestConfig: GETRequestConfig) {
    this.input = input
    this.requestConfig = requestConfig
  }

  async download (range: Range, signal: AbortSignal): Promise<Blob> {
    await this.errorPromise
    const [start, end] = range

    const controller = new AbortController()
    signal.addEventListener('abort', () => {
      controller.abort()
    })

    const response = await fetch(this.input, {
      ...this.init,
      headers: {
        ...this.init?.headers,
        Range: `bytes=${start}-${end}`
      },
      signal
    })
    if (!response.ok) {
      controller.abort()
      this.error()
      throw new Error(`Failed to download at range  ${range[0]}-${range[1]}`)
    }

    const blob = await response.blob()

    if (blob.size !== end - start + 1) {
      this.error()
      throw new Error(
        `Failed to download at range ${range[0]}-${range[1]}, size mismatch`
      )
    }

    return blob
  }

  private error (): void {
    this.currentRetry++
    this.errorPromise = new Promise((resolve) =>
      setTimeout(resolve, this.retryDelay)
    )
  }

  get working (): boolean {
    return this.currentRetry < this.maxRetries
  }

  get init (): GETInit {
    return this.requestConfig.init
  }

  get maxRetries (): number {
    return this.requestConfig.maxRetries
  }

  get retryDelay (): number {
    return this.requestConfig.retryDelay
  }
}
