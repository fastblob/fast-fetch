import { DownloadWorker } from "../worker/DownloadWorker";
import { RangeProvider } from "../range";
import type { ParallelGetConfig, FetchInput } from "../types";
import type { Metadata } from "../metadata";
import { getContentLength } from "../metadata";
import { DownloadStreamer } from "./DownloadStreamer";

export class DownloadManger {
  readonly metadata: Metadata;
  readonly urls: FetchInput[];
  readonly workers: DownloadWorker[];
  readonly rangeProvider: RangeProvider;
  readonly streamer: DownloadStreamer;

  constructor(init: ParallelGetConfig, metadata: Metadata, urls: FetchInput[]) {
    this.metadata = metadata;
    this.urls = urls;
    this.workers = urls.map((url) => new DownloadWorker(url, init));

    const contentLength = getContentLength(metadata.headers);
    this.rangeProvider = new RangeProvider(contentLength);

    this.streamer = new DownloadStreamer(this.rangeProvider.maxRangeIndex);
  }

  async fetch(): Promise<Response> {
    this.workers.map((worker) =>
      this.asyncWorkToWorker(worker)
    );

    return new Response(this.streamer.ReadableStream, this.metadata);
  }

  async asyncWorkToWorker(worker: DownloadWorker) {
    const doneSignal = this.rangeProvider.doneSignal;

    while (true) {
      if (doneSignal.aborted) {
        return;
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
