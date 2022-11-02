type FetchParams = Parameters<typeof fetch>
export type FetchInput = FetchParams[0]

export interface FastFetchHEADConfig {
  mirrorURLs?: FetchInput[]
}

interface FastFetchHEADInit {
  fastFetch?: FastFetchHEADConfig
}

export type HEADInit = (FetchParams[1] & FastFetchHEADInit & { method: 'HEAD' })
