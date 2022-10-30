import { DownloadWorker } from "../worker/DownloadWorker";
import { RangeProvider, type RangeIndex } from "../range/rangeProvider";
import type { ParallelGetConfig, FetchInput } from "../types";
import type { Metadata } from "../metadata";

export class DownloadManger {
  readonly metadata: Metadata;
  readonly urls: FetchInput[];
  readonly workers: DownloadWorker[];
  readonly rangeProvider: RangeProvider;
  readonly blobs: Map<RangeIndex, Blob> = new Map();

  constructor(init: ParallelGetConfig, metadata: Metadata, urls: FetchInput[]) {
    this.metadata = metadata;
    this.urls = urls;
    this.workers = urls.map((url) => new DownloadWorker(url, init));

    const contentLengthStr = metadata.headers.get("Content-Length");
    if (!contentLengthStr) {
      throw new Error("Content-Length header is missing");
    }
    const contentLength = parseInt(contentLengthStr);
    this.rangeProvider = new RangeProvider(contentLength);
  }

  async fetch(): Promise<Response> {
    const promises = this.workers.map((worker) =>
      this.asyncWorkToWorker(worker)
    );
    await Promise.all(promises);

    const blob = this.combineBlobs();
    return new Response(blob, this.metadata);
  }

  combineBlobs(): Blob {
    const blobsMap = new Map([...this.blobs].sort());
    const blobs = [...blobsMap.values()];
    return new Blob(blobs);
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
        this.blobs.set(rangeIndex, blob);
      } catch {
        this.rangeProvider.removeDownloader(rangeIndex);
      }
    }
  }
}
