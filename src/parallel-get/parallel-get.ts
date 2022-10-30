import type { ParallelGetConfig } from "./types";
import { getMetadata } from "./metadata";
import { DownloadManger } from "./manager";

type FetchParams = Parameters<typeof fetch>;
type FetchReturn = ReturnType<typeof fetch>;

export async function parallelGet(
  input: FetchParams[0],
  init?: ParallelGetConfig
): FetchReturn {
  try {
    const inputs = [input, ...(init?.parallelFetch?.mirrorURLs || [])];
    const metadata = await getMetadata(inputs, init);

    if (metadata.status !== 200) {
      throw new Error(`Status code is not 200: ${metadata.status}`);
    }

    const manager = new DownloadManger(init, metadata, inputs);
    return await manager.fetch();
  } catch {
    // fallback to normal fetch
    return fetch(input, init);
  }
}
