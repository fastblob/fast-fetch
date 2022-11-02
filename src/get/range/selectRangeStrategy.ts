import type { RangeIndex } from './types'
import { getMapMinOrZero } from './utils'

const threshold = 10

export function defaultSelectRangeStrategy (
  downloaderCounter: Map<RangeIndex, number>
): RangeIndex {
  const minRangeIndex = getMapMinOrZero(downloaderCounter)
  const firstIndex = downloaderCounter.keys().next().value as number

  if (minRangeIndex - firstIndex > threshold) {
    return firstIndex
  }

  return minRangeIndex
}
