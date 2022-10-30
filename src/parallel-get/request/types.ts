import type { Logger } from "../logger";

type FetchParams = Parameters<typeof fetch>;
export type FetchInput = FetchParams[0];

export type ParallelGetSubConfig = {
  parallelFetch?: {
    mirrorURLs?: FetchInput[];
    maxRetries?: number;
    retryDelay?: number;
    logger?: Logger;
  };
};

export type ParallelGetConfig =
  | (FetchParams[1] & ParallelGetSubConfig)
  | undefined;
