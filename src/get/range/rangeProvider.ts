import type { Range, RangeIndex } from './types'

export class RangeProvider {
  private readonly ranges: Readonly<Range[]>
  private readonly downloaderCounter: Map<RangeIndex, number> = new Map()
  private readonly controllers: Map<RangeIndex, AbortController> = new Map()
  private readonly selectRangeStrategy

  constructor (
    contentLength: number,
    segmentStrategy: (contentLength: number) => Range[],
    selectRangeStrategy: (
      downloaderCounter: Map<RangeIndex, number>
    ) => RangeIndex
  ) {
    this.selectRangeStrategy = selectRangeStrategy

    // Create the ranges
    this.ranges = segmentStrategy(contentLength)
    // init downloader counter
    for (let i = 0; i < this.ranges.length; i++) {
      this.downloaderCounter.set(i, 0)
    }
  }

  removeDownloader (rangeIndex: RangeIndex): void {
    const count = this.downloaderCounter.get(rangeIndex)
    if (count != null) {
      this.downloaderCounter.set(rangeIndex, count - 1)
    }
  }

  downloadComplete (rangeIndex: RangeIndex): void {
    const controller = this.getController(rangeIndex)
    controller.abort()

    this.downloaderCounter.delete(rangeIndex)
    this.controllers.delete(rangeIndex)
  }

  getRange (): {
    range: Range
    rangeIndex: RangeIndex
    signal: AbortSignal
  } {
    const rangeIndex = this.selectRangeStrategy(this.downloaderCounter)
    const range = this.ranges[rangeIndex]
    const signal = this.getController(rangeIndex).signal

    const count = this.downloaderCounter.get(rangeIndex)
    if (count != null) {
      this.downloaderCounter.set(rangeIndex, count + 1)
    }

    return { range, rangeIndex, signal }
  }

  private getController (rangeIndex: RangeIndex): AbortController {
    const controllerInMap = this.controllers.get(rangeIndex)
    if (controllerInMap != null) {
      return controllerInMap
    }

    const controller = new AbortController()
    this.controllers.set(rangeIndex, controller)
    return controller
  }

  get maxRangeIndex (): RangeIndex {
    return this.ranges.length - 1
  }

  get done (): boolean {
    return this.downloaderCounter.size === 0
  }
}
