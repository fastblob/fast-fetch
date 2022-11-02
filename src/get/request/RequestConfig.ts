import type { FetchInput, GETInit } from "./types"

export class GETRequestConfig {
    readonly input: FetchInput
    readonly init: GETInit

    constructor(input: FetchInput, init?: GETInit) {
        this.input = input
        this.init = init
    }

    get inputs() {
        return [this.input, ...(this.init?.fastFetch?.mirrorURLs || [])];
    }

    get parallelConfig() {
        return this.init?.fastFetch;
    }

}