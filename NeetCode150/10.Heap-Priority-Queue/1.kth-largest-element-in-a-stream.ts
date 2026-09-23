import { runClassTests } from "#functions/code-tester.js";

// LeetCode 703

class Heap<T = number> {
  private h: T[] = [];

  constructor(
    private readonly compare: (a: T, b: T) => number = (a: any, b: any) =>
      a - b,
  ) {}

  get size() {
    return this.h.length;
  }
  peek(): T | undefined {
    return this.h[0];
  }
  enqueue(val: T): void {
    this.h.push(val);
    this.bubbleUp(this.h.length - 1);
  }
  dequeue(): T | undefined {
    if (this.h.length === 0) return undefined;
    const top = this.h[0];
    const bot = this.h.pop()!;

    if (this.h.length) {
      this.h[0] = bot;
      this.bubbleDown(0);
    }

    return top;
  }
  replace(val: T) {
    if (this.h.length === 0) {
      this.enqueue(val);
      return;
    }
    this.h[0] = val;
    this.bubbleDown(0);
  }

  private swap(first: number, second: number): void {
    [this.h[first], this.h[second]] = [this.h[second], this.h[first]];
  }
  private bubbleUp(i: number): void {
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.compare(this.h[i], this.h[p]) < 0) {
        this.swap(i, p);
        i = p;
      } else break;
    }
  }
  private bubbleDown(i: number): void {
    const n = this.h.length;
    while ((i << 1) + 1 < n) {
      let b = (i << 1) + 1;
      const r = b + 1;

      if (r < n && this.compare(this.h[r], this.h[b]) < 0) b = r;

      if (this.compare(this.h[b], this.h[i]) < 0) {
        this.swap(i, b);
        i = b;
      } else break;
    }
  }
}

class KthLargest {
  minHeap: Heap<number>;
  k: number;

  constructor(k: number, nums: number[]) {
    this.k = k;
    this.minHeap = new Heap<number>((a, b) => a - b);

    for (const num of nums) {
      this.add(num);
    }
  }

  add(val: number): number {
    if (this.minHeap.size < this.k) {
      this.minHeap.enqueue(val);
    } else {
      const min = this.minHeap.peek();

      if (min !== undefined && min < val) {
        this.minHeap.replace(val);
      }
    }
    return this.minHeap.peek()!;
  }
}

runClassTests(KthLargest, [
  {
    operations: ["KthLargest", "add", "add", "add", "add", "add"],
    args: [[3, [4, 5, 8, 2]], [3], [5], [10], [9], [4]],
    expected: [null, 4, 5, 5, 8, 8],
  },
  {
    operations: ["KthLargest", "add", "add", "add", "add"],
    args: [[4, [7, 7, 7, 7, 8, 3]], [2], [10], [9], [9]],
    expected: [null, 7, 7, 7, 8],
  },
  {
    operations: ["KthLargest", "add", "add", "add", "add", "add"],
    args: [[3, [1, 2, 3, 3]], [3], [5], [6], [7], [8]],
    expected: [null, 3, 3, 3, 5, 6],
  },
]);
