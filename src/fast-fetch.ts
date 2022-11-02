import { parallelGet } from "./get";
import type {  GETInit } from "./get";

type FetchParams = Parameters<typeof fetch>;

export function fastFetch(
  input: FetchParams[0],
  init?: GETInit
): ReturnType<typeof fetch> {
  const method = (init && init.method) || "GET";
  if (method === "GET") {
    // only GET requests are parallelized
    return parallelGet(input, init);
  } else {
    return fetch(input, init);
  }
}
