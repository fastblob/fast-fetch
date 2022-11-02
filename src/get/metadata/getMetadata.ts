import type { GETRequestConfig } from "../request";

export type Metadata = {
  headers: Headers;
  status: number;
  statusText: string;
};

export async function getMetadata(
  requestConfig: GETRequestConfig,
): Promise<Metadata> {
  const controller = new AbortController();
  const signal = controller.signal;

  const promises = requestConfig.inputs.map((input) =>
    fetch(input, {
      ...requestConfig.init,
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
