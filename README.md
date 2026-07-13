# LeetCode / NeetCode 150 Local Workspace

Welcome to your local practice environment for solving and testing LeetCode/NeetCode 150 problems in TypeScript. This setup includes a custom, zero-boilerplate testing framework, custom data structure parsers, system-design class runners, and CLI helper scripts.

---

## 📂 Directory Structure

```
NeetCode150/              # Contains categorized folders with solutions (untouched)
src/                      # Core infrastructure files
├── functions/
│   ├── code-tester.ts    # Main test runner (runTests, runClassTests)
│   ├── compare.ts        # Modularized comparison engine (smartCompare, unordered arrays, legacy aliases)
│   ├── linked-list.ts    # ListNode definition, array-to-list parsers, and stringifiers
│   ├── tree.ts           # TreeNode definition, BFS-level tree builders, and serializers
│   └── graph.ts          # GraphNode definition, cycle-safe cloning, and adjList builders
├── lib/
│   ├── format.ts         # Copy-pasteable boilerplate-free templates
│   └── helper.ts         # Text utilities (kebab-case title formatting)
└── scripts/
    └── copy-title.ts     # CLI tool to format problem titles and copy to clipboard
playground/               # Sandbox directory for practice, testing, or quick scratchpads
package.json              # Project scripts and dependency configuration
tsconfig.json             # TypeScript path mappings (#functions/*, #lib/*)
```

---

## 🚀 Quick Start Guide

### Step 1: Scaffold a New Problem Name
Instead of manually typing kebab-case file names, run the title-formatting script:
1. Open `src/scripts/copy-title.ts` and set your LeetCode problem title:
   ```typescript
   const title = "Merge Two Sorted Lists";
   ```
2. Run the copy script:
   ```bash
   pnpm run title
   ```
   *This automatically formats the title into `merge-two-sorted-lists` and copies it directly to your clipboard.*

3. Create your solution file inside the correct subfolder under `NeetCode150/` or in `playground/` using that name.

---

### Step 2: Use the Minimal Templates

To start writing your solution, open [src/lib/format.ts](file:///e:/Agent/Antigravity/NeetCode150/src/lib/format.ts), copy the relevant template, and paste it into your solution file.

#### 1. Standard Problems (Arrays, Strings, Math, etc.)
```typescript
import { runTests } from "#functions/code-tester.js";

function solve(nums: number[]): number {
  return 0; // Write your solution here
}

runTests(solve, [
  { input: [[1, 2, 3]], output: 0 }
]);
```

#### 2. Linked List Problems
```typescript
import { runTests } from "#functions/code-tester.js";
import { createLinkedList, ListNode } from "#functions/linked-list.js";

function solve(head: ListNode | null): ListNode | null {
  return head;
}

runTests(solve, [
  {
    input: [createLinkedList([1, 2, 3])],
    output: createLinkedList([1, 2, 3]) // smartCompare auto-verifies lists
  }
]);
```

#### 3. Binary Tree Problems
```typescript
import { runTests } from "#functions/code-tester.js";
import { createBinaryTree, TreeNode } from "#functions/tree.js";

function solve(root: TreeNode | null): TreeNode | null {
  return root;
}

runTests(solve, [
  {
    input: [createBinaryTree([1, null, 2, 3])],
    output: createBinaryTree([1, null, 2, 3]) // smartCompare auto-verifies trees
  }
]);
```

#### 4. Graph Problems (Supports cycles)
```typescript
import { runTests } from "#functions/code-tester.js";
import { createGraph, GraphNode } from "#functions/graph.js";

function solve(node: GraphNode | null): GraphNode | null {
  return node;
}

runTests(solve, [
  {
    input: [createGraph([[2, 4], [1, 3], [2, 4], [1, 3]])],
    output: createGraph([[2, 4], [1, 3], [2, 4], [1, 3]]) // smartCompare handles cycles
  }
]);
```

#### 5. Interactive Class / System Design Problems (MinStack, LRUCache, etc.)
```typescript
import { runClassTests } from "#functions/code-tester.js";

class MinStack {
  // Implement class here...
  push(val: number): void {}
  pop(): void {}
  top(): number { return 0; }
  getMin(): number { return 0; }
}

runClassTests(MinStack, [
  {
    name: "Standard MinStack Operations",
    operations: ["MinStack", "push", "push", "getMin", "pop", "top", "getMin"],
    args: [[], [-2], [0], [], [], [], []],
    expected: [null, null, null, -2, null, -2, -2]
  }
]);
```

---

### Step 3: Run the Code
You can run any solution file directly using `tsx` (TypeScript Execute). 

Run the command from the root of this folder:
```bash
pnpm exec tsx "NeetCode150/6.Linked List/1.reverse-linked-list.ts"
```
Or for playground sandboxes:
```bash
pnpm exec tsx playground/practice.ts
```

---

## ✨ Features Breakdown

1. **Zero-Boilerplate Comparison (`smartCompare`)**:
   Our upgraded testing runner automatically inspects your solution outputs and arguments. If it sees standard objects, nested arrays, `ListNode`s, `TreeNode`s, or cyclic `GraphNode`s, it will recursively compare their structures out-of-the-box. You never need to write custom comparators inside your test cases.
   
2. **LeetCode-Style Parameter Display**:
   Using runtime reflection, the test runner extracts your function's parameter names at runtime. The console output formats inputs with their exact variable names, matching LeetCode's console formatting:
   - `nums = [1,2,3,1]`
   - `root = [4,2,7,1,3,6,9]`
   - `s = "abc", k = 2`

3. **Cycle-Safe Graph Testing**:
   Graphs with cycles (like undirected adjacency networks) won't cause stack overflows. The test runner serializes cyclic structures into stable, sorted adjacency lists safely.
   
4. **Execution Timing**:
   For every test case, the execution time is tracked using high-precision timers (`performance.now()`), allowing you to benchmark and optimize your algorithms immediately.
   
5. **Input Preservation**:
   The test runner deep-clones all arguments before executing your functions. This ensures that solutions utilizing in-place mutations (e.g., sorting an array in-place or reversing a list) do not corrupt parameters for subsequent test cases.

6. **Unordered Array Verification Helpers**:
   For problems returning multiple combinations (e.g., *Group Anagrams*, *3Sum*, *Subsets*), order doesn't matter. You can import and use:
   - `compareUnorderedArrays(actual, expected)`: compares lists regardless of order.
   - `compareUnordered2DArrays(actual, expected)`: compares matrices regardless of row or column order.
