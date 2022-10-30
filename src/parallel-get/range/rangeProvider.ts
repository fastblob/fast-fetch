import type { Range, StartRange } from "./types";
import { defaultRangeStrategy } from "./rangeStrategy";
import { getMapMin } from "./utils";

export type RangeIndex = number;

export class RangeProvider {
  readonly contentLength: number;
  private readonly ranges: Readonly<Range[]>;
  private readonly downloaderCounter: Map<RangeIndex, number> = new Map();
  private readonly controllers: Map<RangeIndex, AbortController> = new Map();
  private readonly strategy = defaultRangeStrategy;

  private readonly doneController = new AbortController();

  constructor(
    contentLength: number,
    strategy?: (contentLength: number) => Range[]
  ) {
    this.contentLength = contentLength;
    if (strategy) {
      this.strategy = strategy;
    }

    // Create the ranges
    this.ranges = this.strategy(contentLength);
    // init downloader counter
    for (let i = 0; i < this.ranges.length; i++) {
      this.downloaderCounter.set(i, 0);
    }
  }

  removeDownloader(rangeIndex: RangeIndex) {
    if (this.downloaderCounter.has(rangeIndex)) {
        this.downloaderCounter.set(rangeIndex, this.downloaderCounter.get(rangeIndex)! - 1);
    }
  }

  downloadComplete(rangeIndex: RangeIndex) {
    const controller = this.getController(rangeIndex);
    controller.abort();

    this.downloaderCounter.delete(rangeIndex);
    if (this.downloaderCounter.size === 0) {
      this.rangesDone();
    }
  }

  getRange(): {
    range: Range;
    rangeIndex: RangeIndex;
    signal: AbortSignal;
  } {
    const rangeIndex = getMapMin(this.downloaderCounter);
    const range = this.ranges[rangeIndex];
    const signal = this.getController(rangeIndex).signal;
    this.downloaderCounter.set(rangeIndex, this.downloaderCounter.get(rangeIndex)! + 1);
    return { range, rangeIndex, signal };
  }

  private getController(rangeIndex: RangeIndex): AbortController {
    if (!this.controllers.has(rangeIndex)) {
      this.controllers.set(rangeIndex, new AbortController());
    }
    return this.controllers.get(rangeIndex)!;
  }

  private rangesDone(): void {
    this.doneController.abort();
  }

  get doneSignal(): AbortSignal {
    return this.doneController.signal;
  }
}
