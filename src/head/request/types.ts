type FetchParams = Parameters<typeof fetch>;
export type FetchInput = FetchParams[0];

export type FastFetchHEADConfig = {
  mirrorURLs?: FetchInput[];
};

type FastFetchInit = {
  fastFetch?: FastFetchHEADConfig;
};

export type HEADInit = (FetchParams[1] & FastFetchInit) | undefined;
