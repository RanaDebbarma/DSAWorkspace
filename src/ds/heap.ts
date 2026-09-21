/**
 * Generic Binary Heap / Priority Queue implementation.
 * Fully compatible with LeetCode's `@datastructures-js/priority-queue` API:
 *   - `MinPriorityQueue`
 *   - `MaxPriorityQueue`
 *   - `PriorityQueue`
 *
 * Provides both LeetCode methods (`enqueue`, `dequeue`, `front`, `size()`, `isEmpty()`)
 * and standard DSA aliases (`push`, `pop`, `peek`).
 *
 * Supports instantiation with an array / iterable in O(N) linear time (Floyd's algorithm):
 *   - `new MinHeap([5, 3, 8, 1, 2])`
 *   - `MinPriorityQueue.fromArray([5, 3, 8, 1, 2])`
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

function isIterable<T>(val: unknown): val is Iterable<T> {
  return (
    val != null &&
    typeof (val as Record<string | symbol, unknown>)[Symbol.iterator] === "function"
  );
}

function parseArgs<T>(
  arg1?: PriorityQueueOptions<T> | Iterable<T>,
  arg2?: PriorityQueueOptions<T> | Iterable<T>,
): { options?: PriorityQueueOptions<T>; initialValues?: Iterable<T> } {
  if (isIterable<T>(arg1)) {
    return {
      initialValues: arg1,
      options: isIterable<T>(arg2)
        ? undefined
        : (arg2 as PriorityQueueOptions<T> | undefined),
    };
  }
  return {
    options: arg1 as PriorityQueueOptions<T> | undefined,
    initialValues: isIterable<T>(arg2) ? (arg2 as Iterable<T>) : undefined,
  };
}

export class PriorityQueue<T = number> {
  protected heap: T[] = [];
  protected compare: PriorityQueueComparator<T>;

  constructor(options?: PriorityQueueOptions<T>, initialValues?: Iterable<T>);
  constructor(initialValues?: Iterable<T>, options?: PriorityQueueOptions<T>);
  /** @internal Subclass delegation overload */
  constructor(
    arg1?: PriorityQueueOptions<T> | Iterable<T>,
    arg2?: PriorityQueueOptions<T> | Iterable<T>,
    isMin?: boolean,
  );
  constructor(
    arg1?: PriorityQueueOptions<T> | Iterable<T>,
    arg2?: PriorityQueueOptions<T> | Iterable<T>,
    isMin: boolean = true,
  ) {
    const { options, initialValues } = parseArgs<T>(arg1, arg2);
    this.compare = resolveCompare(options, isMin);
    if (initialValues) {
      this.heap = Array.from(initialValues);
      this.heapify();
    }
  }

  /**
   * Builds a PriorityQueue in O(N) linear time from an array or iterable.
   */
  static fromArray<T = number>(
    values: Iterable<T>,
    options?: PriorityQueueOptions<T>,
  ): PriorityQueue<T> {
    return new PriorityQueue<T>(values, options);
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

  /**
   * Reorganizes internal array into a valid heap in O(N) using Floyd's algorithm.
   */
  protected heapify(): void {
    for (let i = (this.heap.length >> 1) - 1; i >= 0; i--) {
      this.bubbleDown(i);
    }
  }

  protected bubbleUp(idx: number): void {
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

  protected bubbleDown(idx: number): void {
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
  constructor(options?: PriorityQueueOptions<T>, initialValues?: Iterable<T>);
  constructor(initialValues?: Iterable<T>, options?: PriorityQueueOptions<T>);
  constructor(
    arg1?: PriorityQueueOptions<T> | Iterable<T>,
    arg2?: PriorityQueueOptions<T> | Iterable<T>,
  ) {
    super(arg1 as any, arg2 as any, true);
  }

  /**
   * Builds a MinPriorityQueue in O(N) linear time from an array or iterable.
   */
  static override fromArray<T = number>(
    values: Iterable<T>,
    options?: PriorityQueueOptions<T>,
  ): MinPriorityQueue<T> {
    return new MinPriorityQueue<T>(values, options);
  }
}

/**
 * Max-Priority Queue (LeetCode compatible).
 * Larger values take priority.
 */
export class MaxPriorityQueue<T = number> extends PriorityQueue<T> {
  constructor(options?: PriorityQueueOptions<T>, initialValues?: Iterable<T>);
  constructor(initialValues?: Iterable<T>, options?: PriorityQueueOptions<T>);
  constructor(
    arg1?: PriorityQueueOptions<T> | Iterable<T>,
    arg2?: PriorityQueueOptions<T> | Iterable<T>,
  ) {
    super(arg1 as any, arg2 as any, false);
  }

  /**
   * Builds a MaxPriorityQueue in O(N) linear time from an array or iterable.
   */
  static override fromArray<T = number>(
    values: Iterable<T>,
    options?: PriorityQueueOptions<T>,
  ): MaxPriorityQueue<T> {
    return new MaxPriorityQueue<T>(values, options);
  }
}

// Friendly DSA aliases
export const MinHeap = MinPriorityQueue;
export const MaxHeap = MaxPriorityQueue;

// =============================================================================
// 📋 COMPACT COPY-PASTE SNIPPET FOR NEETCODE.IO SUBMISSIONS (JS / TS)
// Supports MinHeap, MaxHeap, or custom comparator Heap.
// Select the code inside the block below — clean code with NO leading asterisks:
// =============================================================================
/*
class Heap<T = number> {
  private h: T[] = [];
  constructor(private c: (a: T, b: T) => number = (a: any, b: any) => a - b, init?: T[]) {
    if (init) { this.h = [...init]; for (let i = (this.h.length >> 1) - 1; i >= 0; i--) this.down(i); }
  }
  push(v: T) { this.h.push(v); this.up(this.h.length - 1); }
  pop(): T | undefined {
    if (!this.h.length) return undefined;
    const top = this.h[0], bot = this.h.pop()!;
    if (this.h.length) { this.h[0] = bot; this.down(0); }
    return top;
  }
  peek(): T | undefined { return this.h[0]; }
  size(): number { return this.h.length; }
  isEmpty(): boolean { return this.h.length === 0; }
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

// Optional
// class MinHeap<T = number> extends Heap<T> { constructor(init?: T[]) { super((a: any, b: any) => a - b, init); } }
// class MaxHeap<T = number> extends Heap<T> { constructor(init?: T[]) { super((a: any, b: any) => b - a, init); } }
*/
