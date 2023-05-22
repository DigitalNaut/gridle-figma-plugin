export type AbortSignal<T> = {
  aborted: boolean;
  type?: T;
  lastUpdate?: number;
};

export class AbortController<T> {
  private aborted = false;
  private type: T | undefined;
  signal: AbortSignal<T>;

  constructor() {
    this.signal = {
      aborted: this.aborted,
      type: this.type,
      lastUpdate: 0,
    };
  }

  public abort(type: T): void {
    this.signal.aborted = true;
    this.signal.type = type;
    this.signal.lastUpdate = Date.now();
  }
}
