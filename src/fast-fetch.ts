import { GET, type GETInit } from './get'
import { HEAD, type HEADInit } from './head'

type FetchParams = Parameters<typeof fetch>

export async function fastFetch (
  input: FetchParams[0],
  init?: GETInit | HEADInit
): ReturnType<typeof fetch> {
  const method = init?.method ?? 'GET'
  if (method === 'GET') {
    return await GET(input, init)
  }

  if (method === 'HEAD') {
    return await HEAD(input, init)
  }

  return await fetch(input, init)
}
