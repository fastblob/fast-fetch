import type { FetchInput, GETInit } from './types'
import { Config } from '../config'

export class GETRequestConfig {
  readonly input: FetchInput
  readonly init: GETInit
  readonly config: Config

  constructor (input: FetchInput, init: GETInit) {
    this.input = input
    this.init = init
    this.config = new Config(init?.fastFetch ?? {})
  }

  get inputs (): FetchInput[] {
    return [this.input, ...(this.config.mirrorURLs)]
  }
}
