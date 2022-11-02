import type { Range } from "../range/types";
import type { FetchInput, ParallelGetConfig } from "../request";

export class DownloadWorker {
  readonly input: FetchInput;
  readonly init: ParallelGetConfig;
  readonly maxRetries: number = 5;
  readonly retryDelay: number = 3000;
  private errorPromise = Promise.resolve();
  private currentRetry = 0;

  constructor(input: FetchInput, init: ParallelGetConfig) {
    this.input = input;
    this.init = init;
    if (init?.parallelFetch?.maxRetries) {
      this.maxRetries = init.parallelFetch.maxRetries;
    }
    if (init?.parallelFetch?.retryDelay) {
      this.retryDelay = init.parallelFetch.retryDelay;
    }
  }

  async download(range: Range, signal: AbortSignal): Promise<Blob> {
    await this.errorPromise;
    const [start, end] = range;

    const controller = new AbortController();
    signal.addEventListener("abort", () => {
      controller.abort();
    });

    const response = await fetch(this.input, {
      ...this.init,
      headers: {
        ...this.init?.headers,
        Range: `bytes=${start}-${end}`,
      },
      signal,
    });
    if (!response.ok) {
      controller.abort();
      this.error();
      throw new Error(`Failed to download ${this.input} at range ${range}`);
    }

    const blob = await response.blob();

    if (blob.size !== end - start + 1) {
      this.error();
      throw new Error(
        `Failed to download ${this.input} at range ${range}, size mismatch`
      );
    }

    return blob;
  }

  private error() {
    this.currentRetry++;
    this.errorPromise = new Promise((resolve) =>
      setTimeout(resolve, this.retryDelay)
    );
  }

  get working(): boolean {
    return this.currentRetry < this.maxRetries;
  }
}