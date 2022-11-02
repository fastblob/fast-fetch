import type { FetchInput, GETInit, FastFetchGetConfig, ChunkCallback } from './types'
import type { Logger } from '../logger'
import { defaultConfig } from './defaultConfig'

export class GETRequestConfig {
  readonly input: FetchInput
  readonly init: GETInit

  constructor (input: FetchInput, init: GETInit) {
    this.input = input
    this.init = init
  }

  get inputs (): FetchInput[] {
    return [this.input, ...(this.init?.fastFetch?.mirrorURLs ?? [])]
  }

  private get fastFetchConfig (): FastFetchGetConfig | undefined {
    return this.init?.fastFetch
  }

  get logger (): Logger {
    const placeholder = (): void => {}

    return {
      info: this.fastFetchConfig?.logger?.info ?? placeholder,
      error: this.fastFetchConfig?.logger?.error ?? placeholder,
      debug: this.fastFetchConfig?.logger?.debug ?? placeholder,
      warning: this.fastFetchConfig?.logger?.warning ?? placeholder
    }
  }

  get maxRetries (): number {
    return this.fastFetchConfig?.maxRetries ?? defaultConfig.maxRetries
  }

  get retryDelay (): number {
    return this.fastFetchConfig?.retryDelay ?? defaultConfig.retryDelay
  }

  get chunkCallback (): ChunkCallback {
    return this.fastFetchConfig?.chunkCallback ?? (() => undefined)
  }
}
