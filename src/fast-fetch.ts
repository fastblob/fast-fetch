import { GET, type GETInit } from "./get";
import { HEAD, type HEADInit } from "./head";

type FetchParams = Parameters<typeof fetch>;

export function fastFetch(
  input: FetchParams[0],
  init?: GETInit | HEADInit
): ReturnType<typeof fetch> {
  const method = (init && init.method) || "GET";
  if (method === "GET") {
    return GET(input, init);
  }

  if (method === "HEAD") {
    return HEAD(input, init);
  }

  return fetch(input, init);
}
