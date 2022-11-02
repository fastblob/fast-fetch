import { DownloadWorker } from '../worker/DownloadWorker'
import { RangeProvider } from '../range'
import type { Metadata } from '../metadata'
import { getContentLength } from '../metadata'
import { DownloadStreamer } from './DownloadStreamer'
import type { GETRequestConfig } from '../request'

export class DownloadManger {
  readonly metadata: Metadata
  readonly requestConfig: GETRequestConfig
  readonly workers: DownloadWorker[]
  readonly rangeProvider: RangeProvider
  readonly streamer: DownloadStreamer

  constructor (requestConfig: GETRequestConfig, metadata: Metadata) {
    this.requestConfig = requestConfig
    this.metadata = metadata
    this.workers = requestConfig.inputs.map(
      (input) => new DownloadWorker(input, requestConfig)
    )
    requestConfig.logger.info(`Workers Count: ${this.workers.length}`)

    const contentLength = getContentLength(metadata.headers)
    this.rangeProvider = new RangeProvider(contentLength)
    requestConfig.logger.info(`Content length: ${contentLength}`)

    this.streamer = new DownloadStreamer(this.rangeProvider.maxRangeIndex)
  }

  async fetch (): Promise<Response> {
    void this.startFetching()
    return new Response(this.streamer.ReadableStream, this.metadata)
  }

  // start fetching
  async startFetching (): Promise<void> {
    this.requestConfig.logger.info('Start fetching.')

    const promises = this.workers.map(async (worker, idx) =>
      await this.assignWorkToWorker(worker, idx)
    )
    try {
      await Promise.any(promises)
      this.requestConfig.logger.info('Fetching done.')
    } catch {
      this.requestConfig.logger.error('All workers failed, stream aborted.')
      // all workers failed
      this.streamer.abort('All workers failed')
    }
  }

  async assignWorkToWorker (worker: DownloadWorker, workerIndex: number): Promise<void> {
    const doneSignal = this.rangeProvider.doneSignal

    while (true) {
      if (doneSignal.aborted) {
        return
      }

      if (!worker.working) {
        this.requestConfig.logger.warning(
          `Worker ${workerIndex} is not working.`
        )
        throw new Error('Worker is not working')
      }

      const { range, rangeIndex, signal } = this.rangeProvider.getRange()
      try {
        this.requestConfig.logger.debug(
          `Worker ${workerIndex} is fetching range ${rangeIndex}.`
        )
        const blob = await worker.download(range, signal)
        this.requestConfig.chunkCallback(blob, range, worker.input)

        this.requestConfig.logger.debug(
          `Worker ${workerIndex} fetched range ${rangeIndex} successfully.`
        )

        // notify range provider that this range is done
        this.rangeProvider.downloadComplete(rangeIndex)
        // notify streamer that this range is done and pass blob
        this.streamer.queueBlob(rangeIndex, blob)
      } catch (e) {
        if ((e as DOMException)?.name !== 'AbortError') {
          // worker failed other than AbortError
          this.requestConfig.logger.error(
            `Worker ${workerIndex} failed to fetch range ${rangeIndex}: ${(e as DOMException).message}.`
          )
        }

        this.rangeProvider.removeDownloader(rangeIndex)
      }
    }
  }
}
