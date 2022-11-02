import { parallelGet } from "./get";
import type { ParallelGetConfig } from "./get";

type FetchParams = Parameters<typeof fetch>;

export function fastFetch(
  input: FetchParams[0],
  init?: ParallelGetConfig
): ReturnType<typeof fetch> {
  const method = (init && init.method) || "GET";
  if (method === "GET") {
    // only GET requests are parallelized
    return parallelGet(input, init);
  } else {
    return fetch(input, init);
  }
}
