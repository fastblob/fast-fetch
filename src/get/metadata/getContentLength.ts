export function getContentLength (headers: Headers): number {
  const contentLengthStr = headers.get('Content-Length')
  if (contentLengthStr === null || contentLengthStr === '') {
    throw new Error('Content-Length header is missing')
  }
  const contentLength = parseInt(contentLengthStr)
  return contentLength
}
