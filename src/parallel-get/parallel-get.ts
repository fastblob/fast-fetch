import type { ParallelGetConfig, FetchInput } from "./request";
import { getMetadata } from "./metadata";
import { DownloadManger } from "./manager";
import { RequestConfig } from "./request";

export async function parallelGet(input: FetchInput, init?: ParallelGetConfig) {
  const requestConfig = new RequestConfig(input, init);
  try {
    const metadata = await getMetadata(requestConfig);

    if (metadata.status !== 200) {
      const message = `❌ Status code is not 200: ${metadata.status}`
      requestConfig.parallelConfig?.logger?.error?.(message)
      throw new Error(message);
    }

    const manager = new DownloadManger(requestConfig, metadata);
    return await manager.fetch();
  } catch {
    requestConfig.parallelConfig?.logger?.error?.("❌ Fallback to normal fetch")
    // fallback to normal fetch
    return fetch(input, init);
  }
}
