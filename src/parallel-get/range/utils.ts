export function getMapMin<T>(map: Map<T, number>): T {
  let minKey: T;
  let minVal: number | undefined;
  for (const [key, val] of map) {
    if (minVal === undefined || val < minVal) {
      minKey = key;
      minVal = val;
    }
  }
  return minKey!;
}