type FetchParams = Parameters<typeof fetch>;
type FetchReturn = ReturnType<typeof fetch>;

export function parallelFetch(
  input: FetchParams[0],
  init?: FetchParams[1]
): FetchReturn {
  return fetch(input, init);
}
