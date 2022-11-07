import type { Logger } from '../logger'

type FetchParams = Parameters<typeof fetch>
export type FetchInput = FetchParams[0]
export type ChunkCallback = (chunk: Blob, range: [number, number], input: FetchInput) => void

export interface FastFetchGetConfig {
  mirrorURLs?: FetchInput[]
  maxRetries?: number
  retryDelay?: number
  logger?: Partial<Logger>
  chunkCallback?: ChunkCallback
  segmentStrategy?: (contentLength: number) => Array<[number, number]>
}

interface FastFetchGETInit {
  fastFetch?: FastFetchGetConfig
}

export type GETInit = (FetchParams[1] & FastFetchGETInit & { method: 'GET' | undefined }) | undefined
