import type { FastFetchGetConfig } from '../config'

type FetchParams = Parameters<typeof fetch>
export type FetchInput = FetchParams[0]

interface FastFetchGETInit {
  fastFetch?: FastFetchGetConfig
}

export type GETInit = (FetchParams[1] & FastFetchGETInit & { method: 'GET' | undefined }) | undefined
