import type { ParallelGetConfig, FetchInput } from "../types";

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

  const response = await Promise.any(promises);

  const headers = response.headers;
  const status = response.status;
  const statusText = response.statusText;

  controller.abort();

  return { headers, status, statusText };
}
