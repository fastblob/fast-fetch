import type { HEADInit, FetchInput } from "./request";
import { HEADRequestConfig } from "./request";
import { HEAD as SubHEAD } from "./header";

export async function HEAD(input: FetchInput, init?: HEADInit) {
  const requestConfig = new HEADRequestConfig(input, init);

  // no mirror URLs, fallback to normal fetch
  if (requestConfig.inputs.length === 1) {
    return fetch(input, init);
  }

  // FIXME: cannot abort controller before the response is consumed
  // const controller = new AbortController();
  // const signal = controller.signal;

  const headPromises = requestConfig.inputs.map((input) =>
    SubHEAD(input, init)
  );
  const response = await Promise.any(headPromises);

  return response;
}
