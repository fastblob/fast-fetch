type RangeIndex = number

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

function getMapMinOrZero<T> (map: Map<T, number>): T {
  let minKey: T | undefined
  let minVal: number | undefined
  for (const [key, val] of map) {
    if (val === 0) {
      return key
    }

    if (minVal === undefined || val < minVal) {
      minKey = key
      minVal = val
    }
  }

  if (minKey === undefined) {
    throw new Error('Map is empty')
  }

  return minKey
}
