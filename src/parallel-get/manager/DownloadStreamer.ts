import { type RangeIndex } from "../range";

export class DownloadStreamer {
  private readonly maxRangeIndex: number;
  private readonly blobQueue: Map<RangeIndex, Blob> = new Map();
  private currentRangeIndexToDo = 0;
  private stream: TransformStream<Uint8Array, Uint8Array> =
    new TransformStream();
  private writingLock = false;

  constructor(maxRangeIndex: number) {
    this.maxRangeIndex = maxRangeIndex;
  }

  get ReadableStream(): ReadableStream<Uint8Array> {
    return this.stream.readable;
  }

  queueBlob(index: RangeIndex, blob: Blob): void {
    this.blobQueue.set(index, blob);
    this.write();
  }

  private async write() {
    if (this.writingLock) {
      return;
    }

    this.writingLock = true;
    const blob = this.blobQueue.get(this.currentRangeIndexToDo);
    if (blob) {
      this.blobQueue.delete(this.currentRangeIndexToDo);
      this.currentRangeIndexToDo++;
      await blob.stream().pipeTo(this.stream.writable, {
        preventClose: true,
      });
    }
    if (this.currentRangeIndexToDo > this.maxRangeIndex) {
      this.stream.writable.getWriter().close();
    }
    this.writingLock = false;

    if (this.blobQueue.has(this.currentRangeIndexToDo)) {
      this.write();
    }
  }
}
