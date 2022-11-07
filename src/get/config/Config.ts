import { defaultConfig } from './default'
import type { FastFetchGetConfig, FetchInput, ChunkCallback, SegmentStrategy, Logger, SelectRangeStrategy } from './types'

export class Config {
  readonly config: FastFetchGetConfig

  constructor (config: FastFetchGetConfig) {
    this.config = config
  }

  get maxRetries (): number {
    return this.config.maxRetries ?? defaultConfig.maxRetries
  }

  get retryDelay (): number {
    return this.config.retryDelay ?? defaultConfig.retryDelay
  }

  get chunkCallback (): ChunkCallback {
    return this.config.chunkCallback ?? defaultConfig.chunkCallback
  }

  get segmentStrategy (): SegmentStrategy {
    return this.config.segmentStrategy ?? defaultConfig.segmentStrategy
  }

  get selectRangeStrategy (): SelectRangeStrategy {
    return this.config.selectRangeStrategy ?? defaultConfig.selectRangeStrategy
  }

  get logger (): Logger {
    return {
      ...defaultConfig.logger,
      ...this.config.logger
    }
  }

  get mirrorURLs (): FetchInput[] {
    return this.config.mirrorURLs ?? []
  }
}
