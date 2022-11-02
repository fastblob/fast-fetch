import type { GETRequestConfig } from '../request'

export interface Metadata {
  headers: Headers
  status: number
  statusText: string
}

export async function getMetadata (
  requestConfig: GETRequestConfig
): Promise<Metadata> {
  const controller = new AbortController()
  const signal = controller.signal

  const fetchSignal = requestConfig?.init?.signal
  if (fetchSignal != null) {
    fetchSignal.addEventListener('abort', () => {
      controller.abort()
    })
  }

  const promises = requestConfig.inputs.map(async (input) =>
    await fetch(input, {
      ...requestConfig.init,
      method: 'HEAD',
      signal
    })
  )

  const response = await Promise.any(promises)

  const headers = response.headers
  const status = response.status
  const statusText = response.statusText

  controller.abort()

  return { headers, status, statusText }
}
