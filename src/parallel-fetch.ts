import { parallelGet } from './parallel-get';

type FetchParams = Parameters<typeof fetch>;
type FetchReturn = ReturnType<typeof fetch>;

export function parallelFetch(
  input: FetchParams[0],
  init?: FetchParams[1]
): FetchReturn {
  const method = (init && init.method) || "GET";
  if (method === "GET") {
    // only GET requests are parallelized
    return parallelGet(input, init);
  } else {
    return fetch(input, init);
  }
}
