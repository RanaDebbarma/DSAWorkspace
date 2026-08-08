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
| `pnpm new` | Interactively scaffold a new problem file with numbering, boilerplate, and auto-opens in VS Code |
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

7. **`visualizeInput` — Structured Input Display**:
   Pass `{ visualizeInput: true }` as the third argument to `runTests` to print a rich visual of your inputs before each test:
   - **Binary Trees**: Rendered top-down in a grid with branch connectors.
   - **Grids / 2D Arrays**: Printed as a box-drawing table.
   - **Linked Lists**: Printed as `1 → 2 → 3 → null`.
   - **Multi-param Trees (LCA, etc.)**: When multiple `TreeNode` arguments belong to the same tree, `visualizeInput` automatically merges them into a single tree diagram with the sub-nodes (e.g. `p`, `q`) **highlighted in color** using their parameter names as labels.

8. **`TreeNode.find(val)` — Node Reference Lookup**:
   For problems that take multiple tree node references (e.g. `p`, `q` in LCA), use `root.find(val)` to get a reference to a specific node within an existing tree instance rather than constructing a separate tree.
   ```typescript
   const tree = createBinaryTree([6, 2, 8, 0, 4])!;
   tree.find(2)  // returns the TreeNode with val=2 inside tree
   ```
