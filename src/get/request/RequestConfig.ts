import type { FetchInput, GETInit } from "./types";
import type { Logger } from "../logger";
import { defaultConfig } from "./defaultConfig";

export class GETRequestConfig {
  readonly input: FetchInput;
  readonly init: GETInit;

  constructor(input: FetchInput, init?: GETInit) {
    this.input = input;
    this.init = init;
  }

  get inputs(): FetchInput[] {
    return [this.input, ...(this.init?.fastFetch?.mirrorURLs || [])];
  }

  private get fastFetchConfig() {
    return this.init?.fastFetch;
  }

  get logger(): Logger {
    return {
      info: this.fastFetchConfig?.logger?.info || (() => {}),
      error: this.fastFetchConfig?.logger?.error || (() => {}),
      debug: this.fastFetchConfig?.logger?.debug || (() => {}),
      warning: this.fastFetchConfig?.logger?.warning || (() => {}),
    };
  }

  get maxRetries(): number {
    return this.fastFetchConfig?.maxRetries || defaultConfig.maxRetries;
  }

  get retryDelay(): number {
    return this.fastFetchConfig?.retryDelay || defaultConfig.retryDelay;
  }
}
