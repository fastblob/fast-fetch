import { defaultSelectRangeStrategy } from '../range/selectRangeStrategy'
import { defaultSegmentStrategy } from '../range/segmentStrategy'

const placeholder = (): void => {}

export const defaultConfig = {
  mirrorURLs: [],
  maxRetries: 5,
  retryDelay: 3000,
  chunkCallback: () => undefined,
  selectRangeStrategy: defaultSelectRangeStrategy,
  segmentStrategy: defaultSegmentStrategy,
  logger: {
    info: placeholder,
    error: placeholder,
    debug: placeholder,
    warning: placeholder
  }
} as const
