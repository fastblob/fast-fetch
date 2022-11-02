import type { Logger } from "../logger";

type FetchParams = Parameters<typeof fetch>;
export type FetchInput = FetchParams[0];

export type GETSubConfig = {
  parallelFetch?: {
    mirrorURLs?: FetchInput[];
    maxRetries?: number;
    retryDelay?: number;
    logger?: Logger;
  };
};

export type GETInit =
  | (FetchParams[1] & GETSubConfig)
  | undefined;
