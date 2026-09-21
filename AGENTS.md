# DSAWorkspace — Framework & Agent Instructions

This repository is a local TypeScript practice and testing framework for LeetCode and NeetCode problems. It runs tests with zero external test runner boilerplate using `tsx`.

---

## 🚀 Execution & Commands

* **Run any problem file**:
  ```bash
  pnpm exec tsx "<path-to-file>"
  # Examples:
  # pnpm exec tsx "NeetCode150/10.Heap-Priority-Queue/1.kth-largest-element-in-a-stream.ts"
  # pnpm exec tsx "NeetCode150/7.Trees/1.invert-binary-tree.ts"
  ```
* **Run framework test suite**:
  ```bash
  pnpm test
  ```
* **CLI helper scripts**:
  * `pnpm new`: Interactively scaffolds a new solution file, auto-detecting the most recently modified directory, calculating the next problem number, and parsing test cases from clipboard.
  * `pnpm template [file]`: Applies/replaces boilerplate template into an existing file.
  * `pnpm populate [file]`: Appends parsed LeetCode test cases from clipboard into `runTests` or `runClassTests`.
  * `pnpm title [input]`: Formats problem title and copies slug to clipboard.

---

## 📦 Imports & Subpaths

TypeScript path aliases are configured in `package.json` and `tsconfig.json`:

```typescript
import { runTests, runClassTests } from "#functions/code-tester.js";
import { TreeNode, createBinaryTree } from "#ds/tree.js";
import { ListNode, createLinkedList, createCyclicLinkedList } from "#ds/linked-list.js";
import { GraphNode, createGraph } from "#ds/graph.js";
import { MinPriorityQueue, MaxPriorityQueue, PriorityQueue, MinHeap, MaxHeap } from "#ds/heap.js";
import { smartCompare, compareUnorderedArrays } from "#utils/compare.js";
```

---

## 🧪 Testing Patterns

### 1. Standard Function Problems (`runTests`)
```typescript
import { runTests } from "#functions/code-tester.js";

function solve(...): ReturnType { ... }

runTests(solve, [
  {
    input: [/* arguments matching solve parameters */],
    output: /* expected return value */,
    unordered?: boolean, // Order-insensitive array comparison (optional)
  },
], {
  // TestOptions (all optional):
  // showHeader?: boolean;      // Default: true
  // visualizeInput?: boolean;  // Default: true (renders trees, 2D grids, graphs)
  // showStringInput?: boolean; // Default: true
  // unordered?: boolean;       // Default: false
  // showHint?: boolean;        // Default: true (shows index mismatch hint)
});
```

### 2. Class Design / Interactive OOP Problems (`runClassTests`)
```typescript
import { runClassTests } from "#functions/code-tester.js";

class MyClass { ... }

runClassTests(MyClass, [
  {
    operations: ["MyClass", "methodA", "methodB"],
    args: [[/* constructor args */], [/* methodA args */], [/* methodB args */]],
    expected: [null, expectedA, expectedB],
  },
]);
```

---

## 🔍 Built-in Framework Capabilities

1. **`smartCompare` Comparison Engine**:
   * Automatically deep-compares primitives, objects, `TreeNode`, `ListNode` (handles cycles safely), and `GraphNode`.
   * Floating-point tolerance: Automatically allows `1e-5` difference.
   * Unordered comparisons: Handles 1D and 2D arrays order-insensitively when `{ unordered: true }` or for recognized problems (3Sum, Group Anagrams, Subsets).

2. **Heap & PriorityQueue (`#ds/heap.js`)**:
   * Fully matches LeetCode `@datastructures-js/priority-queue` (`MinPriorityQueue`, `MaxPriorityQueue`, `PriorityQueue`) with `.enqueue()`, `.dequeue()`, `.front()`, `.size()`, and `.isEmpty()`.
   * Also supports standard DSA aliases (`.push()`, `.pop()`, `.peek()`).
   * Includes a compact 20-line copy-paste snippet in comments for NeetCode.io submissions.

3. **Automatic Input Isolation**:
   * All inputs are deep-cloned with `cloneValue()` before running each test case so in-place mutations (e.g., sorting `nums`, reversing linked list) do not corrupt subsequent test runs.

4. **Rich Input Visualizers (on by default)**:
   * **Binary Trees**: Renders top-down ASCII tree with branch connectors. Supports subnode highlighting for LCA problems (`tree.find(val)`).
   * **2D Grids**: Box-drawing table visualizer (auto-detects Sudoku, chess, maze, binary grid, numeric matrix).
   * **Graphs**: Visualizes adjacency lists, raw adjacency maps, and edge lists with automatic directed/undirected detection.
   * **Linked Lists**: Arrow-linked chains (`1 → 2 → 3 → null`).

5. **Console Output Capture**:
   * `console.log()` inside solution code is intercepted and formatted cleanly between the input visualizer and test results.
