import { defaultSelectRangeStrategy } from '../range/selectRangeStrategy'
import { defaultSegmentStrategy } from '../range/segmentStrategy'

export const defaultConfig = {
  maxRetries: 5,
  retryDelay: 3000,
  sequential: false,
  chunkCallback: () => undefined,
  selectRangeStrategy: defaultSelectRangeStrategy,
  segmentStrategy: defaultSegmentStrategy
} as const
