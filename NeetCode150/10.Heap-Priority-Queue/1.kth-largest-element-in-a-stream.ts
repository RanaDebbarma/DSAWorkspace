import { runClassTests } from "#functions/code-tester.js";

// LeetCode 703

class KthLargest {
  private heap: number[] = [];
  private readonly k: number;

  constructor(k: number, nums: number[]) {
    this.k = k;

    for (const num of nums) {
      this.insert(num);

      if (this.heap.length > k) {
        this.pop();
      }
    }
  }

  add(val: number): number {
    this.insert(val);

    if (this.heap.length > this.k) {
      this.pop();
    }

    return this.heap[0];
  }

  private insert(val: number): void {
    this.heap.push(val);
    this.bubbleUp(this.heap.length - 1);
  }

  private swap(first: number, second: number): void {
    [this.heap[first], this.heap[second]] = [
      this.heap[second],
      this.heap[first],
    ];
  }

  private bubbleUp(i: number): void {
    if (i === 0) return;

    const p = (i - 1) >> 1;

    if (this.heap[i] < this.heap[p]) {
      this.swap(i, p);
      this.bubbleUp(p);
    }
  }

  private pop(): void {
    if (this.heap.length === 0) return;

    this.heap[0] = this.heap.pop()!;

    this.bubbleDown(0);
  }

  private bubbleDown(i: number): void {
    const left = 2 * i + 1;
    const right = 2 * i + 2;

    if (left >= this.heap.length) return;

    let minIdx = left;

    if (right < this.heap.length && this.heap[right] < this.heap[left]) {
      minIdx = right;
    }
    if (this.heap[minIdx] < this.heap[i]) {
      this.swap(i, minIdx);
      this.bubbleDown(minIdx);
    }
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
