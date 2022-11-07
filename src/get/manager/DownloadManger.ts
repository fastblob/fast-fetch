import { DownloadWorker } from '../worker/DownloadWorker'
import { RangeProvider } from '../range'
import type { Metadata } from '../metadata'
import { getContentLength } from '../metadata'
import { DownloadStreamer } from './DownloadStreamer'
import type { GETRequestConfig } from '../request'

export class DownloadManger {
  private readonly metadata: Metadata
  private readonly requestConfig: GETRequestConfig
  private readonly workers: DownloadWorker[]
  private readonly rangeProvider: RangeProvider
  private readonly streamer: DownloadStreamer
  readonly response: Response

  constructor (requestConfig: GETRequestConfig, metadata: Metadata) {
    this.requestConfig = requestConfig
    this.metadata = metadata
    const inputs = this.requestConfig.inputs
    const workerInputs = [...inputs, ...inputs]
    this.workers = workerInputs.map(
      (input) => new DownloadWorker(input, requestConfig)
    )
    requestConfig.config.logger.info(`Workers Count: ${this.workers.length}`)

    const contentLength = getContentLength(metadata.headers)
    this.rangeProvider = new RangeProvider(contentLength, this.requestConfig.config.segmentStrategy, this.requestConfig.config.selectRangeStrategy)
    requestConfig.config.logger.info(`Content length: ${contentLength}`)

    this.streamer = new DownloadStreamer(this.rangeProvider.maxRangeIndex, requestConfig?.init?.signal)

    void this.startFetching()
    this.response = new Response(this.streamer.ReadableStream, this.metadata)
  }

  // start fetching
  private async startFetching (): Promise<void> {
    this.requestConfig.config.logger.info('Start fetching.')

    const promises = this.workers.map(async (worker, idx) =>
      await this.assignWorkToWorker(worker, idx)
    )
    try {
      await Promise.any(promises)
      this.requestConfig.config.logger.info('Fetching done.')
    } catch {
      this.requestConfig.config.logger.error('All workers failed, stream aborted.')
      // all workers failed
      this.streamer.abort('All workers failed')
    }
  }

  async assignWorkToWorker (worker: DownloadWorker, workerIndex: number): Promise<void> {
    let currentRetry = 0

    while (true) {
      if (this.rangeProvider.done) {
        return
      }

      const { range, rangeIndex, signal: rangeSignal } = this.rangeProvider.getRange()
      try {
        const workController = new AbortController()
        const workSignal = workController.signal
        rangeSignal.addEventListener('abort', () => {
          workController.abort()
        })

        const fetchSignal = this.requestConfig?.init?.signal
        if (fetchSignal != null) {
          fetchSignal.addEventListener('abort', () => {
            workController.abort()
          })
        }

        this.requestConfig.config.logger.debug(
          `Worker ${workerIndex} is fetching range ${rangeIndex}.`
        )
        const blob = await worker.download(range, workSignal)
        this.requestConfig.config.chunkCallback(blob, range, worker.input)

        this.requestConfig.config.logger.debug(
          `Worker ${workerIndex} fetched range ${rangeIndex} successfully.`
        )

        // notify range provider that this range is done
        this.rangeProvider.downloadComplete(rangeIndex)
        // notify streamer that this range is done and pass blob
        this.streamer.queueBlob(rangeIndex, blob)
      } catch (e) {
        if ((e as DOMException)?.name !== 'AbortError') {
          // worker failed other than AbortError
          this.requestConfig.config.logger.error(
            `Worker ${workerIndex} failed to fetch range ${rangeIndex}: ${(e as DOMException).message}.`
          )
          currentRetry += 1
          if (currentRetry > this.requestConfig.config.maxRetries) {
            this.requestConfig.config.logger.error(
              `Worker ${workerIndex} failed to fetch range ${rangeIndex} after ${currentRetry} retries.`
            )
            throw new Error(`Worker ${workerIndex} failed to fetch range after retries ${currentRetry}`)
          }

          this.rangeProvider.removeDownloader(rangeIndex)

          // sleep for retryDelay
          await new Promise((resolve) => setTimeout(resolve, this.requestConfig.config.retryDelay))
          continue
        }

        this.rangeProvider.removeDownloader(rangeIndex)
      }
    }
  }
}
