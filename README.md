# fast-fetch
`fetch` fastly in browser.


[![CI](https://github.com/fastblob/fast-fetch/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/fastblob/fast-fetch/actions/workflows/ci.yml)


## How It Works

`fast-fetch` is a drop-in replacement of `fetch` API, it segments the request into multiple chunks, and fetch them in parallel, then merge them into a single response.

## Usage

```js
import fetch from '@fastblob/fast-fetch';
const response = await fetch('https://example.com/test.bin', {
  fastFetch: {
    mirrorURLs: ['https://anotherexample.com/test.bin']
  }
});
```

## Configuration

``` ts
// src/get/request/types.ts

type FetchInput =  Parameters<typeof fetch>[0]

interface FastFetchGetConfig {
  mirrorURLs?: FetchInput[] // mirror URLs
  maxRetries?: number // max retry for each mirror
  retryDelay?: number // delay between retries
  logger?: Partial<Logger> // logger
}
```

## Note

Only `GET` and `HEAD` requests are supported. Other methods will use the original `fetch` API.

## License

MIT