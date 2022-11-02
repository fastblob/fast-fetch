type FetchParams = Parameters<typeof fetch>

export async function HEAD (
  input: FetchParams[0],
  init: FetchParams[1],
  externalSignal?: AbortSignal
): ReturnType<typeof fetch> {
  const controller = new AbortController()
  const signal = controller.signal

  const fetchSignal = init?.signal
  if (fetchSignal != null) {
    fetchSignal.addEventListener('abort', () => {
      controller.abort()
    })
  }

  if (externalSignal != null) {
    externalSignal.addEventListener('abort', () => {
      controller.abort()
    })
  }

  return await fetch(input, { ...init, signal })
}
