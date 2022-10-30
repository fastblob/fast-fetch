import type { ParallelGetConfig } from "../types";

type FetchParams = Parameters<typeof fetch>;

export type Metadata = {
  headers: Headers;
  status: number;
  statusText: string;
};

export async function getMetadata(
  input: FetchParams[0],
  init?: FetchParams[1] & ParallelGetConfig
): Promise<Metadata> {
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
  const status = responses.status;
  const statusText = responses.statusText;

  controller.abort();

  return { headers, status, statusText };
}
