import type { Range, RangeIndex } from './types'
import { defaultSegmentStrategy } from './segmentStrategy'
import { defaultSelectRangeStrategy } from './selectRangeStrategy'

export class RangeProvider {
  readonly contentLength: number
  private readonly ranges: Readonly<Range[]>
  private readonly downloaderCounter: Map<RangeIndex, number> = new Map()
  private readonly controllers: Map<RangeIndex, AbortController> = new Map()
  private readonly segmentStrategy = defaultSegmentStrategy
  private readonly selectRangeStrategy = defaultSelectRangeStrategy

  private readonly doneController = new AbortController()

  constructor (
    contentLength: number,
    segmentStrategy?: (contentLength: number) => Range[],
    selectRangeStrategy?: (
      downloaderCounter: Map<RangeIndex, number>
    ) => RangeIndex
  ) {
    this.contentLength = contentLength
    if (segmentStrategy != null) {
      this.segmentStrategy = segmentStrategy
    }
    if (selectRangeStrategy != null) {
      this.selectRangeStrategy = selectRangeStrategy
    }

    // Create the ranges
    this.ranges = this.segmentStrategy(contentLength)
    // init downloader counter
    for (let i = 0; i < this.ranges.length; i++) {
      this.downloaderCounter.set(i, 0)
    }
  }

  removeDownloader (rangeIndex: RangeIndex) {
    if (this.downloaderCounter.has(rangeIndex)) {
      this.downloaderCounter.set(
        rangeIndex,
        this.downloaderCounter.get(rangeIndex)! - 1
      )
    }
  }

  downloadComplete (rangeIndex: RangeIndex) {
    const controller = this.getController(rangeIndex)
    controller.abort()

    this.downloaderCounter.delete(rangeIndex)
    if (this.downloaderCounter.size === 0) {
      this.rangesDone()
    }
  }

  getRange (): {
    range: Range
    rangeIndex: RangeIndex
    signal: AbortSignal
  } {
    const rangeIndex = this.selectRangeStrategy(this.downloaderCounter)
    const range = this.ranges[rangeIndex]
    const signal = this.getController(rangeIndex).signal
    this.downloaderCounter.set(
      rangeIndex,
      this.downloaderCounter.get(rangeIndex)! + 1
    )
    return { range, rangeIndex, signal }
  }

  private getController (rangeIndex: RangeIndex): AbortController {
    if (!this.controllers.has(rangeIndex)) {
      this.controllers.set(rangeIndex, new AbortController())
    }
    return this.controllers.get(rangeIndex)!
  }

  private rangesDone (): void {
    this.doneController.abort()
  }

  get doneSignal (): AbortSignal {
    return this.doneController.signal
  }

  get maxRangeIndex (): RangeIndex {
    return this.ranges.length - 1
  }
}
