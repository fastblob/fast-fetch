import type { ParallelGetConfig, FetchInput } from "../types";

type FetchParams = Parameters<typeof fetch>;

export type Metadata = {
  headers: Headers;
  status: number;
  statusText: string;
};

export async function getMetadata(
  inputs: FetchInput[],
  init?: ParallelGetConfig
): Promise<Metadata> {
  const controller = new AbortController();
  const signal = controller.signal;

  const promises = inputs.map((input) =>
    fetch(input, {
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
