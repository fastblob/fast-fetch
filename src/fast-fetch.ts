import { GET, type GETInit } from './get'
import { HEAD, type HEADInit } from './head'

type FetchParams = Parameters<typeof fetch>
type OtherInit = Exclude<FetchParams[1], GETInit | HEADInit>

export async function fastFetch (
  input: FetchParams[0],
  init?: GETInit | HEADInit | OtherInit
): ReturnType<typeof fetch> {
  if (init?.method === 'GET' || init?.method === undefined) {
    return await GET(input, init as GETInit)
  }

  if (init?.method === 'HEAD') {
    return await HEAD(input, init as HEADInit)
  }

  return await fetch(input, init)
}
