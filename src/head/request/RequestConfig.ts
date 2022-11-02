import type { FetchInput, HEADInit } from "./types";

export class HEADRequestConfig {
  readonly input: FetchInput;
  readonly init: HEADInit;

  constructor(input: FetchInput, init?: HEADInit) {
    this.input = input;
    this.init = init;
  }

  get inputs(): FetchInput[] {
    return [this.input, ...(this.init?.fastFetch?.mirrorURLs || [])];
  }
}
