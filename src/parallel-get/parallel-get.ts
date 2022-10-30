import type { ParallelGetConfig } from "./types";
import { getHeaders } from "./headers";
import {DownloadManger} from "./manager";

type FetchParams = Parameters<typeof fetch>;
type FetchReturn = ReturnType<typeof fetch>;

export async function parallelGet(
  input: FetchParams[0],
  init?: ParallelGetConfig
): FetchReturn {
  const headers = await getHeaders(input, init);
  const urls = [input, ...(init?.parallelFetch?.mirrorURLs || [])] as string[];
  const manager = new DownloadManger(init, headers, urls);
  return await manager.fetch();
}
