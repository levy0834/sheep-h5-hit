export class SeededRng {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed >>> 0;
  }

  public next(): number {
    this.seed = (1664525 * this.seed + 1013904223) >>> 0;
    return this.seed / 0x100000000;
  }

  public nextInt(maxExclusive: number): number {
    if (maxExclusive <= 1) {
      return 0;
    }
    return Math.floor(this.next() * maxExclusive);
  }

  public pick<T>(values: readonly T[]): T {
    return values[this.nextInt(values.length)];
  }
}
