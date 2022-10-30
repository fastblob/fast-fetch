import type { ParallelGetConfig } from "./types";

type FetchParams = Parameters<typeof fetch>;
type FetchReturn = ReturnType<typeof fetch>;

export function parallelGet(
  input: FetchParams[0],
  init?: ParallelGetConfig
): FetchReturn {
  return fetch(input, init);
}