import { DownloadWorker } from "../worker/DownloadWorker";
import { RangeProvider } from "../range";
import type { Metadata } from "../metadata";
import { getContentLength } from "../metadata";
import { DownloadStreamer } from "./DownloadStreamer";
import type { RequestConfig } from "../request";

export class DownloadManger {
  readonly metadata: Metadata;
  readonly requestConfig: RequestConfig;
  readonly workers: DownloadWorker[];
  readonly rangeProvider: RangeProvider;
  readonly streamer: DownloadStreamer;

  constructor(requestConfig: RequestConfig, metadata: Metadata) {
    this.requestConfig = requestConfig;
    this.metadata = metadata;
    this.workers = requestConfig.inputs.map(
      (input) => new DownloadWorker(input, requestConfig.init)
    );
    requestConfig.parallelConfig?.logger?.info?.(`Workers Count: ${this.workers.length}`);

    const contentLength = getContentLength(metadata.headers);
    this.rangeProvider = new RangeProvider(contentLength);
    requestConfig.parallelConfig?.logger?.info?.(`Content length: ${contentLength}`);

    this.streamer = new DownloadStreamer(this.rangeProvider.maxRangeIndex);
  }

  async fetch(): Promise<Response> {
    this.startFetching();
    return new Response(this.streamer.ReadableStream, this.metadata);
  }

  // start fetching
  async startFetching() {
    this.logger?.info?.(`Start fetching.`);

    const promises = this.workers.map((worker) =>
      this.assignWorkToWorker(worker)
    );
    try {
      await Promise.any(promises);
      this.logger?.info?.(`Fetching done.`);
    } catch {
      this.logger?.error?.(`All workers failed, stream aborted.`);
      // all workers failed
      this.streamer.abort("All workers failed");
    }
  }

  async assignWorkToWorker(worker: DownloadWorker) {
    const doneSignal = this.rangeProvider.doneSignal;

    while (true) {
      if (doneSignal.aborted) {
        return;
      }

      if (!worker.working) {
        this.logger?.warning?.(`Worker ${worker.url} is not working.`);
        throw new Error("Worker is not working");
      }

      const { range, rangeIndex, signal } = this.rangeProvider.getRange();
      try {
        this.logger?.debug?.(
          `Worker ${worker.url} is fetching range ${rangeIndex}.`
        );
        const blob = await worker.download(range, signal);
        this.logger?.debug?.(
          `Worker ${worker.url} fetched range ${rangeIndex} successfully.`
        );

        // notify range provider that this range is done
        this.rangeProvider.downloadComplete(rangeIndex);
        // notify streamer that this range is done and pass blob
        this.streamer.queueBlob(rangeIndex, blob);
      } catch (e) {
        if ((e as DOMException)?.name !== "AbortError") {
          // worker failed other than AbortError
          this.logger?.error?.(
            `Worker ${worker.url} failed to fetch range ${rangeIndex}: ${e}.`
          );
        }

        this.rangeProvider.removeDownloader(rangeIndex);
      }
    }
  }

  private get logger() {
    return this.requestConfig.parallelConfig?.logger;
  }
}
