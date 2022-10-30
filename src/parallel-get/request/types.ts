type FetchParams = Parameters<typeof fetch>;
export type FetchInput = FetchParams[0];

export type ParallelGetSubConfig = {
  parallelFetch?: {
    mirrorURLs?: FetchInput[];
    maxRetries?: number;
    retryDelay?: number;
    onHeaders?: (headersInfo: {
      headers: Headers;
      url: string;
      elapsedTime: number;
    }) => void;
    onChunkDownloaded?: (chunkInfo: {
      range: [number, number];
      chunk: Uint8Array;
      url: string;
      elapsedTime: number;
    }) => void;
  };
};


export type ParallelGetConfig = FetchParams[1] & ParallelGetSubConfig | undefined;
