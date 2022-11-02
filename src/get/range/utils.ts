export function getMapMinOrZero<T> (map: Map<T, number>): T {
  let minKey: T
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
  return minKey!
}
