import type { ParallelGetConfig } from "../types";

type FetchParams = Parameters<typeof fetch>;

export async function getHeaders(
  input: FetchParams[0],
  init?: FetchParams[1] & ParallelGetConfig
): Promise<Headers> {
  const urls = [input, ...(init?.parallelFetch?.mirrorURLs || [])];
  const controller = new AbortController();
  const signal = controller.signal;

  const promises = urls.map((url) =>
    fetch(url, {
      ...init,
      method: "HEAD",
      signal,
    })
  );

  const responses = await Promise.any(promises);
  const headers = responses.headers;
  controller.abort();

  return headers;
}
