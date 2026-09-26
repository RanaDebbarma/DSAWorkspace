import { runTests } from "#functions/code-tester.js";

// LeetCode 621

// intuitive approach
type Task = {
  task: string;
  freq: number;
  readyAt?: number;
};

function leastInterval(tasks: string[], n: number): number {
  const freqMap = new Map<string, number>();

  for (const task of tasks) {
    freqMap.set(task, (freqMap.get(task) ?? 0) + 1);
  }

  const taskHeap = new Heap<Task>((a, b) => b.freq - a.freq);

  for (const [task, freq] of freqMap) {
    taskHeap.push({ task, freq });
  }

  const cooldownQueue: Task[] = [];
  let cooldownFront = 0;
  let time = 0;

  // cpu cycles
  while (taskHeap.size || cooldownFront < cooldownQueue.length) {
    time++;

    while (
      cooldownFront < cooldownQueue.length &&
      cooldownQueue[cooldownFront].readyAt === time
    ) {
      taskHeap.push(cooldownQueue[cooldownFront++]!);
    }

    if (taskHeap.size) {
      const task = taskHeap.pop()!;

      // complete task
      task.freq--;

      if (task.freq) {
        task.readyAt = time + n + 1;
        cooldownQueue.push(task);
      }
    }
  }

  return time;
}

// 2nd approach
// type Task = {
//   freq: number;
//   readyAt?: number;
// };

// function leastInterval(tasks: string[], n: number): number {
//   const countArr = new Array<number>(26).fill(0);

//   for (const task of tasks) {
//     countArr[task.charCodeAt(0) - 65]++;
//   }

//   const taskHeap = new Heap<number>(
//     (a, b) => b - a,
//     countArr.filter((f) => f > 0),
//   );

//   const cooldownQueue: Task[] = [];
//   let cooldownFront = 0;
//   let time = 0;

//   // cpu cycles
//   while (taskHeap.size || cooldownFront < cooldownQueue.length) {
//     time++;

//     while (
//       cooldownFront < cooldownQueue.length &&
//       cooldownQueue[cooldownFront].readyAt === time
//     ) {
//       taskHeap.push(cooldownQueue[cooldownFront++].freq!);
//     }

//     if (taskHeap.size) {
//       // complete task
//       const freq = taskHeap.pop()! - 1;

//       if (freq) {
//         cooldownQueue.push({
//           freq,
//           readyAt: time + n + 1,
//         });
//       }
//     }
//   }

//   return time;
// }

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
