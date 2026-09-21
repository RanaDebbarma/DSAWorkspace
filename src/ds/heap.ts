/**
 * Generic Binary Heap / Priority Queue implementation.
 * Fully compatible with LeetCode's `@datastructures-js/priority-queue` API:
 *   - `MinPriorityQueue`
 *   - `MaxPriorityQueue`
 *   - `PriorityQueue`
 *
 * Provides both LeetCode methods (`enqueue`, `dequeue`, `front`, `size()`, `isEmpty()`)
 * and standard DSA aliases (`push`, `pop`, `peek`).
 */

export type PriorityQueueComparator<T> = (a: T, b: T) => number;

export type PriorityQueueOptions<T> =
  | PriorityQueueComparator<T>
  | {
      compare?: PriorityQueueComparator<T>;
      priority?: (element: T) => number;
    };

function resolveCompare<T>(
  options?: PriorityQueueOptions<T>,
  isMin: boolean = true,
): PriorityQueueComparator<T> {
  if (typeof options === "function") {
    return options;
  }
  if (options && typeof options === "object") {
    if (options.compare) {
      return options.compare;
    }
    if (options.priority) {
      const getPriority = options.priority;
      return isMin
        ? (a, b) => getPriority(a) - getPriority(b)
        : (a, b) => getPriority(b) - getPriority(a);
    }
  }
  // Default comparator for primitives
  return isMin
    ? (a: any, b: any) => (a < b ? -1 : a > b ? 1 : 0)
    : (a: any, b: any) => (a > b ? -1 : a < b ? 1 : 0);
}

export class PriorityQueue<T = number> {
  protected heap: T[] = [];
  protected compare: PriorityQueueComparator<T>;

  constructor(options?: PriorityQueueOptions<T>) {
    this.compare = resolveCompare(options, true);
  }

  /** Number of elements in the queue. Supports both `size()` method and `.size` getter. */
  size(): number {
    return this.heap.length;
  }

  /** Whether the queue is empty. */
  isEmpty(): boolean {
    return this.heap.length === 0;
  }

  /** Peeks at the front element without removing it. */
  front(): T | undefined {
    return this.heap[0];
  }

  /** Standard DSA alias for front(). */
  peek(): T | undefined {
    return this.heap[0];
  }

  /** Adds an element into the priority queue. */
  enqueue(val: T): void {
    this.heap.push(val);
    this.bubbleUp(this.heap.length - 1);
  }

  /** Standard DSA alias for enqueue(). */
  push(val: T): void {
    this.enqueue(val);
  }

  /** Removes and returns the highest-priority element. */
  dequeue(): T | undefined {
    if (this.heap.length === 0) return undefined;
    const top = this.heap[0];
    const bottom = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = bottom;
      this.bubbleDown(0);
    }
    return top;
  }

  /** Standard DSA alias for dequeue(). */
  pop(): T | undefined {
    return this.dequeue();
  }

  /** Clears all elements from the queue. */
  clear(): void {
    this.heap = [];
  }

  /** Returns a shallow copy of internal elements array. */
  toArray(): T[] {
    return [...this.heap];
  }

  private bubbleUp(idx: number): void {
    while (idx > 0) {
      const parent = (idx - 1) >> 1;
      if (this.compare(this.heap[idx], this.heap[parent]) < 0) {
        [this.heap[idx], this.heap[parent]] = [
          this.heap[parent],
          this.heap[idx],
        ];
        idx = parent;
      } else {
        break;
      }
    }
  }

  private bubbleDown(idx: number): void {
    const len = this.heap.length;
    while ((idx << 1) + 1 < len) {
      let best = (idx << 1) + 1;
      const right = best + 1;

      if (right < len && this.compare(this.heap[right], this.heap[best]) < 0) {
        best = right;
      }

      if (this.compare(this.heap[best], this.heap[idx]) < 0) {
        [this.heap[idx], this.heap[best]] = [this.heap[best], this.heap[idx]];
        idx = best;
      } else {
        break;
      }
    }
  }
}

/**
 * Min-Priority Queue (LeetCode compatible).
 * Smaller values take priority.
 */
export class MinPriorityQueue<T = number> extends PriorityQueue<T> {
  constructor(options?: PriorityQueueOptions<T>) {
    super();
    this.compare = resolveCompare(options, true);
  }
}

/**
 * Max-Priority Queue (LeetCode compatible).
 * Larger values take priority.
 */
export class MaxPriorityQueue<T = number> extends PriorityQueue<T> {
  constructor(options?: PriorityQueueOptions<T>) {
    super();
    this.compare = resolveCompare(options, false);
  }
}

// Friendly DSA aliases
export const MinHeap = MinPriorityQueue;
export const MaxHeap = MaxPriorityQueue;

// =============================================================================
// 📋 COMPACT COPY-PASTE SNIPPET FOR NEETCODE.IO SUBMISSIONS (JS / TS)
// Select the code inside the block below — clean code with NO leading asterisks:
// =============================================================================
/*
class MinHeap<T = number> {
  private h: T[] = [];
  constructor(private c: (a: T, b: T) => number = (a: any, b: any) => a - b) {}
  push(v: T) { this.h.push(v); this.up(this.h.length - 1); }
  pop(): T | undefined {
    if (!this.h.length) return undefined;
    const top = this.h[0], bot = this.h.pop()!;
    if (this.h.length) { this.h[0] = bot; this.down(0); }
    return top;
  }
  peek(): T | undefined { return this.h[0]; }
  size(): number { return this.h.length; }
  private up(i: number) {
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.c(this.h[i], this.h[p]) < 0) { [this.h[i], this.h[p]] = [this.h[p], this.h[i]]; i = p; }
      else break;
    }
  }
  private down(i: number) {
    const n = this.h.length;
    while ((i << 1) + 1 < n) {
      let b = (i << 1) + 1, r = b + 1;
      if (r < n && this.c(this.h[r], this.h[b]) < 0) b = r;
      if (this.c(this.h[b], this.h[i]) < 0) { [this.h[i], this.h[b]] = [this.h[b], this.h[i]]; i = b; }
      else break;
    }
  }
}
*/
