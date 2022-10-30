import type { FetchInput, ParallelGetConfig } from "./types"

export class RequestConfig {
    readonly input: FetchInput
    readonly init: ParallelGetConfig

    constructor(input: FetchInput, init?: ParallelGetConfig) {
        this.input = input
        this.init = init
    }

    get inputs() {
        return [this.input, ...(this.init?.parallelFetch?.mirrorURLs || [])];
    }

    get parallelConfig() {
        return this.init?.parallelFetch;
    }

}