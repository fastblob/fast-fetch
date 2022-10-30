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

    const contentLength = getContentLength(metadata.headers);
    this.rangeProvider = new RangeProvider(contentLength);

    this.streamer = new DownloadStreamer(this.rangeProvider.maxRangeIndex);
  }

  async fetch(): Promise<Response> {
    this.startFetching();
    return new Response(this.streamer.ReadableStream, this.metadata);
  }

  async startFetching() {
    const promises = this.workers.map((worker) =>
      this.asyncWorkToWorker(worker)
    );
    try {
      await Promise.any(promises);
    } catch {
      // all workers failed
      this.streamer.abort("All workers failed");
    }
  }

  async asyncWorkToWorker(worker: DownloadWorker) {
    const doneSignal = this.rangeProvider.doneSignal;

    while (true) {
      if (doneSignal.aborted) {
        return;
      }

      if (!worker.working) {
        throw new Error("Worker is not working");
      }

      const { range, rangeIndex, signal } = this.rangeProvider.getRange();
      try {
        const blob = await worker.download(range, signal);
        this.rangeProvider.downloadComplete(rangeIndex);
        this.streamer.queueBlob(rangeIndex, blob);
      } catch {
        this.rangeProvider.removeDownloader(rangeIndex);
      }
    }
  }
}
