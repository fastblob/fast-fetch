import type { ParallelGetConfig } from "./types";
import { getMetadata } from "./metadata";
import { DownloadManger } from "./manager";

type FetchParams = Parameters<typeof fetch>;
type FetchReturn = ReturnType<typeof fetch>;

export async function parallelGet(
  input: FetchParams[0],
  init?: ParallelGetConfig
): FetchReturn {
  const metadata = await getMetadata(input, init);
  const urls = [input, ...(init?.parallelFetch?.mirrorURLs || [])];
  const manager = new DownloadManger(init, metadata, urls);
  return await manager.fetch();
}
