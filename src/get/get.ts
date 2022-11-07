import type { GETInit, FetchInput } from './request'
import { getMetadata } from './metadata'
import { DownloadManger } from './manager'
import { GETRequestConfig } from './request'

export async function GET (input: FetchInput, init?: GETInit): Promise<Response> {
  const requestConfig = new GETRequestConfig(input, init)
  try {
    const metadata = await getMetadata(requestConfig)

    if (metadata.status !== 200) {
      const message = `Status code is not 200: ${metadata.status}`
      requestConfig.config.logger.error(message)
      throw new Error(message)
    }

    const manager = new DownloadManger(requestConfig, metadata)
    return manager.response
  } catch {
    requestConfig.config.logger.error('Fallback to normal fetch')
    // fallback to normal fetch
    return await fetch(input, init)
  }
}
