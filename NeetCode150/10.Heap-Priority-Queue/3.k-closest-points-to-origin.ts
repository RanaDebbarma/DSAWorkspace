import { runTests } from "#functions/code-tester.js";

// LeetCode 973

function kClosest(points: number[][], k: number): number[][] {
  const res = new Array<number[]>(k);
  const distances = new Array(points.length);

  for (let i = 0; i < points.length; i++) {
    const [x, y] = points[i];
    distances[i] = {
      point: points[i],
      distance: x ** 2 + y ** 2,
    };
  }

  const minHeap = new Heap<{ point: number[]; distance: number }>(
    (a, b) => a.distance - b.distance,
    distances,
  );

  for (let i = 0; i < k; i++) {
    res[i] = minHeap.pop()!.point;
  }

  return res;
}

class Heap<T = number> {
  private h: T[] = [];
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
  size(): number {
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

runTests(kClosest, [
  {
    input: [
      [
        [1, 3],
        [-2, 2],
      ],
      1,
    ],
    output: [[-2, 2]],
  },
  {
    input: [
      [
        [3, 3],
        [5, -1],
        [-2, 4],
      ],
      2,
    ],
    output: [
      [3, 3],
      [-2, 4],
    ],
  },
]);
