# LeetCode / NeetCode Local Workspace

Welcome to your local practice environment for solving and testing LeetCode/NeetCode problems in TypeScript. This setup includes a custom, zero-boilerplate testing framework, custom data structure parsers, system-design class runners, and CLI helper scripts.

---

## 📂 Directory Structure

```
NeetCode150/              # Contains categorized folders with solutions
LeetCode/                 # Flat folder for standalone LeetCode problems
src/                      # Core infrastructure files
├── functions/
│   ├── code-tester.ts    # Main test runner (runTests, runClassTests)
│   ├── linked-list.ts    # ListNode definition, array-to-list parsers, and stringifiers
│   ├── tree.ts           # TreeNode definition, BFS-level tree builders, and serializers
│   └── graph.ts          # GraphNode definition, cycle-safe cloning, and adjList builders
├── utils/                # Internal test runner & CLI helper utilities
│   ├── clone.ts          # Input/Node structure cloning
│   ├── compare.ts        # Comparison engine (smartCompare, unordered arrays, legacy aliases)
│   ├── diff.ts           # Structured/Colored console diff rendering
│   ├── display.ts        # Serialization, parameters parsing, and visual formatters
│   └── title-helper.ts   # Kebab-case title formatting + camelCase derivation
│   └── testcase-parser.ts # LeetCode testcase parser (clipboard transformer)
├── templates/
│   └── boilerplates.ts   # Exported boilerplate template functions (used by CLI)
├── tests/
│   └── feature-test.ts   # Framework feature test suite (run with: pnpm test)
└── scripts/
    ├── new.ts            # CLI tool to scaffold new problem files interactively
    ├── add-tests.ts      # CLI tool to parse copied LeetCode testcases from clipboard
    └── copy-title.ts     # CLI tool to format problem titles and copy to clipboard
playground/               # Sandbox directory for practice, testing, or quick scratchpads
package.json              # Project scripts and dependency configuration
tsconfig.json             # TypeScript path mappings (#functions/*, #utils/*, #templates/*)
```

---

## 🚀 Quick Start Guide

### Step 1: Scaffold a New Problem File

Run the interactive file generator from **inside the target directory**:

```bash
# Navigate to the category first
cd "NeetCode150/1.Array & Hashing"

# Then run:
pnpm new
```

The CLI will guide you through three prompts:

```
✦ DSA File Generator

◆ Problem number (auto-detected: 10)
│  Press Enter to accept, or type to override (e.g. an LC number like 1299)
│  Leave blank for no number prefix.

◆ Problem name
│  e.g. Valid Sudoku  (leave blank for 'untitled')

◆ Select a template
│  ❯ Standard          (arrays, strings, math)
│    Linked List
│    Cyclic Linked List
│    Binary Tree
│    Graph
│    Class Design      (MinStack, LRU Cache, etc.)
│    Multi-Param Tree  (LCA, path problems)

✔  Created & opened: 10.valid-sudoku.ts
```

**How numbering works:**
- If the directory already contains numbered files (`1.foo.ts`, `9.bar.ts`), the tool **auto-detects the next number** (e.g. `10`) as the default.
- You can **type any number** to override — useful for LeetCode problem numbers like `1299`.
- **Leave blank** to create a file with no number prefix (e.g. `valid-sudoku.ts`).

The generated file will have your function already named correctly (e.g. `validSudoku`), opened in VS Code, and ready to run.

---

### Step 2: Auto-Fill Test Cases (`pnpm add-tests`)

You don't need to manually type test case objects!

1. **Copy** any text block straight off LeetCode (supports single or multiple example blocks, explanations, raw lines, and `runClassTests` formats):

```text
Example 1:

Input:
nums = [2,5,6,9]
target = 9

Output: [[2,2,5],[9]]
Explanation:
2 + 2 + 5 = 9. We use 2 twice, and 5 once.
9 = 9. We use 9 once.

Example 2:

Input:
nums = [3,4,5]
target = 16

Output: [[3,3,3,3,4],[3,3,5,5],[4,4,4,4],[3,4,4,5]]
```

2. Run:
```bash
pnpm add-tests
```

3. Press **`Ctrl + V`** inside `runTests(solve, [...])` in your file! The clipboard is transformed into clean TypeScript objects:

```typescript
  { input: [[2, 5, 6, 9], 9], output: [[2, 2, 5], [9]] },
  { input: [[3, 4, 5], 16], output: [[3, 3, 3, 3, 4], [3, 3, 5, 5], [4, 4, 4, 4], [3, 4, 4, 5]] },
```

> 💡 **Bonus**: If you copy LeetCode test cases *before* running `pnpm new`, `pnpm new` will detect them in your clipboard and automatically pre-fill your new file!

---

### Step 3: Run the Code

Run any solution file directly using `tsx` from the workspace root:

```bash
pnpm exec tsx "NeetCode150/1.Array & Hashing/10.valid-sudoku.ts"
```

Or for playground sandboxes:
```bash
pnpm exec tsx playground/practice.ts
```

---

### Step 4: Run the Framework Feature Tests
To verify the test runner, visualizers, comparators, and all framework features are working correctly:
```bash
pnpm test
```
This runs [src/tests/feature-test.ts] — a comprehensive suite that exercises every feature of the framework across all data structure types.

---

## 🛠 Scripts Reference

| Command | Description |
|---|---|
| `pnpm new` | Interactively scaffold a new numbered problem file or populate an existing file |
| `pnpm template [file]` | Populate boilerplate template into an existing file (e.g. `pnpm template practice.ts`) |
| `pnpm new practice.ts` | Target a specific file directly with boilerplate & clipboard testcases |
| `pnpm add-tests` | Parses copied LeetCode testcases from clipboard into TS objects ready to paste (`Ctrl+V`) |
| `pnpm title "My Problem Name"` | Formats a title to kebab-case and copies it to your clipboard |
| `pnpm test` | Runs the full framework feature test suite |

---

## 📋 Available Boilerplate Templates

The CLI (`pnpm new`) lets you pick from these templates at creation time:

| Template | Use case |
|---|---|
| **Standard** | Arrays, strings, math — the default for most problems |
| **Linked List** | Problems with `ListNode` inputs/outputs |
| **Cyclic Linked List** | Cycle-detection problems (e.g. LC 141) |
| **Binary Tree** | Problems with `TreeNode` inputs/outputs |
| **Graph** | Problems with `GraphNode` and adjacency lists |
| **Class Design** | System design problems (MinStack, LRU Cache, etc.) |
| **Multi-Param Tree** | LCA and path problems with multiple node refs in the same tree |

---

## ✨ Features Breakdown

1. **Zero-Boilerplate Comparison (`smartCompare`)**:
   The test runner automatically inspects your solution outputs and arguments. If it sees nested arrays, `ListNode`s, `TreeNode`s, or cyclic `GraphNode`s, it selects the correct structural comparator out-of-the-box — no custom comparators needed.
   - **Unordered 2D arrays** (Subsets, Combinations, Group Anagrams, 3Sum): Automatically compared without caring about order of rows or elements.
   - **Floating-point results** (Pow, geometry, probability): Compared with `1e-5` tolerance automatically.

2. **LeetCode-Style Parameter Display**:
   The test runner extracts your function's parameter names at runtime. The console output formats inputs with their exact variable names:
   - `nums = [1,2,3,1]`
   - `root = [4,2,7,1,3,6,9]`
   - `s = "abc", k = 2`

3. **Execution Timing**:
   Every test case tracks execution time using high-precision timers (`performance.now()`).

4. **Input Preservation**:
   The test runner deep-clones all arguments before running your function, so in-place mutations (reversing a list, sorting an array) never corrupt subsequent test cases.

5. **Cycle-Safe Graph Testing**:
   Cyclic graph structures are serialized into stable, sorted adjacency lists without causing stack overflows.

6. **`TreeNode.find(val)` — Node Reference Lookup**:
   For problems that take multiple tree node refs (e.g. `p`, `q` in LCA), locate a node within an existing tree:
   ```typescript
   const tree = createBinaryTree([6, 2, 8, 0, 4])!;
   tree.find(2)  // returns the TreeNode with val=2 inside tree
   ```

---

## ⚙️ Test Options Reference

The third argument to `runTests(fn, tests, options)` controls display behavior. All options default to `true` and `visualizeInput` is **on by default**.

```typescript
runTests(solve, tests, {
  showHeader?: boolean;       // Show the "RUNS solve()" banner. Default: true
  visualizeInput?: boolean;   // Render rich visual inputs per test. Default: true
  showStringInput?: boolean;  // Show `param = value` lines below visuals. Default: true
});
```

### Option Details

| Option | Default | Description |
|---|---|---|
| `showHeader` | `true` | Displays the `RUNS fn()` banner at the top |
| `visualizeInput` | **`true`** | Renders structured visual diagrams before each test case |
| `showStringInput` | `true` | Prints plain `param = value` lines (can suppress when using visuals only) |

### Visualizer Output by Type

When `visualizeInput: true` (the default), each input is rendered before every test case:

| Input Type | Visual Output |
|---|---|
| **Binary Tree** | Top-down ASCII tree with branch connectors |
| **2D Grid / Matrix** | Box-drawing table with row/column borders |
| **Linked List** | `1 → 2 → 3 → null` arrow chain |
| **Graph** | Adjacency-list representation |
| **Multi-param Trees (LCA, etc.)** | Single unified tree diagram with `p [green]` and `q [yellow]` node labels |

### Examples

```typescript
// Default — visualizeInput is ON
runTests(levelOrder, [
  { input: [createBinaryTree([3, 9, 20, null, null, 15, 7])], output: [[3], [9, 20], [15, 7]] },
]);

// Suppress visualizer (plain param = value output only)
runTests(twoSum, tests, { visualizeInput: false });

// Suppress all input display entirely (output-only)
runTests(solve, tests, { visualizeInput: false, showStringInput: false });

// Tree problems with highlighted sub-nodes for LCA
runTests(lowestCommonAncestor, tests, { visualizeInput: true });
```

### Unordered Comparison Helpers

For problems where output order doesn't matter, import directly:

```typescript
import { compareUnorderedArrays, compareUnordered2DArrays } from "#functions/code-tester.js";

// 1D unordered (e.g. find all targets)
runTests(fn, [{ input: [...], output: [...], compare: (actual, expected) => compareUnorderedArrays(actual, expected) }]);

// 2D unordered (e.g. Group Anagrams, 3Sum)
// NOTE: smartCompare handles these automatically for primitive 2D arrays — no need to pass compare manually.
```

---
