type FetchParams = Parameters<typeof fetch>;

export function HEAD(
  input: FetchParams[0],
  init: FetchParams[1],
  externalSignal?: AbortSignal
): ReturnType<typeof fetch> {
  const controller = new AbortController();
  const signal = controller.signal;

  const fetchSignal = init?.signal;
  if (fetchSignal) {
    fetchSignal.addEventListener("abort", () => {
      controller.abort();
    });
  }

  if (externalSignal) {
    externalSignal.addEventListener("abort", () => {
      controller.abort();
    });
  }

  return fetch(input, { ...init, signal });
}
