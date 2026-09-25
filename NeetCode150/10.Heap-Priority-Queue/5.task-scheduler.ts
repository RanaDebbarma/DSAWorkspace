import { runTests } from "#functions/code-tester.js";

// LeetCode 621

function leastInterval(tasks: string[], n: number): number {
  const freq = new Map<string, number>();

  for (const task of tasks) {
    freq.set(task, (freq.get(task) ?? 0) + 1);
  }

  // Max heap: highest frequency first
  const heap = new Heap<{ task: string; freq: number }>(
    (a, b) => b.freq - a.freq,
  );

  for (const [task, count] of freq) {
    heap.push({ task, freq: count });
  }

  // Tasks waiting for their cooldown to finish
  const cooldown: { task: string; freq: number; readyAt: number }[] = [];

  let time = 0;

  while (heap.size > 0 || cooldown.length > 0) {
    time++;

    // Move tasks whose cooldown has expired back into the heap
    if (cooldown.length && cooldown[0].readyAt === time) {
      heap.push(cooldown.shift()!);
    }

    if (heap.size > 0) {
      const task = heap.pop()!;

      task.freq--;

      if (task.freq > 0) {
        cooldown.push({
          task: task.task,
          freq: task.freq,
          readyAt: time + n + 1,
        });
      }
    }
  }

  return time;
}

class Heap<T = number> {
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

runTests(leastInterval, [
  { input: [["X", "X", "Y", "Y"], 2], output: 5 },
  { input: [["A", "A", "A", "B", "C"], 3], output: 9 },
  { input: [["A", "A", "A", "B", "B", "B"], 2], output: 8 },
  { input: [["A", "C", "A", "B", "D", "B"], 1], output: 6 },
  { input: [["A", "A", "A", "B", "B", "B"], 3], output: 10 },
]);
