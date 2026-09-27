import { runClassTests } from "#functions/code-tester.js";

// LeetCode 295

class MedianFinder {
  lowerHalf: CustomHeap<number>; // maxHeap
  upperHalf: CustomHeap<number>; // minHeap

  constructor() {
    this.lowerHalf = new CustomHeap<number>((a, b) => b - a);
    this.upperHalf = new CustomHeap<number>((a, b) => a - b);
  }

  addNum(val: number): void {
// Push to lowerHalf first, then shift the largest element to upperHalf
    this.lowerHalf.push(val);
    this.upperHalf.push(this.lowerHalf.pop()!);

    // Maintain the size invariant: lowerHalf can have equal elements or 1 more than upperHalf
    if (this.lowerHalf.size < this.upperHalf.size) {
      this.lowerHalf.push(this.upperHalf.pop()!);
    }
  }

  findMedian(): number {
    if (this.lowerHalf.size > this.upperHalf.size) {
      return this.lowerHalf.peek()!;
    }

    return (this.lowerHalf.peek()! + this.upperHalf.peek()!) / 2;
  }
}

class CustomHeap<T = number> {
  h: T[] = [];
  constructor(
    private c: (a: T, b: T) => number = (a: any, b: any) => a - b,
    init?: T[],
  ) {
    if (init) {
      this.h = [...init];
      for (let i = (this.h.length >> 1) - 1; i >= 0; i--) this.down(i);
    }
  }
  push(v: T) {
    this.h.push(v);
    this.up(this.h.length - 1);
  }
  pop(): T | undefined {
    if (!this.h.length) return undefined;
    const top = this.h[0],
      bot = this.h.pop()!;
    if (this.h.length) {
      this.h[0] = bot;
      this.down(0);
    }
    return top;
  }
  peek(): T | undefined {
    return this.h[0];
  }
  get size(): number {
    return this.h.length;
  }
  isEmpty(): boolean {
    return this.h.length === 0;
  }
  private up(i: number) {
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.c(this.h[i], this.h[p]) < 0) {
        [this.h[i], this.h[p]] = [this.h[p], this.h[i]];
        i = p;
      } else break;
    }
  }
  private down(i: number) {
    const n = this.h.length;
    while ((i << 1) + 1 < n) {
      let b = (i << 1) + 1,
        r = b + 1;
      if (r < n && this.c(this.h[r], this.h[b]) < 0) b = r;
      if (this.c(this.h[b], this.h[i]) < 0) {
        [this.h[i], this.h[b]] = [this.h[b], this.h[i]];
        i = b;
      } else break;
    }
  }
}

runClassTests(MedianFinder, [
  {
    operations: [
      "MedianFinder",
      "addNum",
      "addNum",
      "findMedian",
      "addNum",
      "findMedian",
    ],
    args: [[], [1], [2], [], [3], []],
    expected: [null, null, null, 1.5, null, 2],
  },
  {
    operations: [
      "MedianFinder",
      "addNum",
      "findMedian",
      "addNum",
      "findMedian",
      "addNum",
      "findMedian",
    ],
    args: [[], [1], [], [3], [], [2], []],
    expected: [null, null, 1, null, 2, null, 2],
  },
  {
    operations: [
      "MedianFinder",
      "addNum",
      "addNum",
      "addNum",
      "addNum",
      "addNum",
      "addNum",
      "findMedian",
    ],
    args: [[], [1], [7], [3], [5], [9], [2]],
    expected: [null, null, null, null, null, null, null, 4],
  },
]);
