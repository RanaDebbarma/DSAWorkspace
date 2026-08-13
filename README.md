# LeetCode / NeetCode Local Workspace

Welcome to your local practice environment for solving and testing LeetCode/NeetCode problems in TypeScript. This setup includes a custom, zero-boilerplate testing framework, custom data structure parsers, system-design class runners, and CLI helper scripts.

---

## 📂 Directory Structure

```
NeetCode150/              # Contains categorized folders with solutions
LeetCode/                 # Flat folder for standalone LeetCode problems
src/                      # Core infrastructure files
├── ds/                   # Data structure definitions (classes + builders + serializers)
│   ├── linked-list.ts    # ListNode, Node, create/clone/compare/stringify helpers
│   ├── tree.ts           # TreeNode, BFS tree builder, clone, compare, serializer
│   └── graph.ts          # GraphNode, adjacency list builder, clone, compare
├── functions/            # Test framework entry point
│   └── code-tester.ts    # runTests, runClassTests, TestCase, ClassTestCase types
├── utils/                # Internal test runner & CLI helper utilities
│   ├── clone.ts          # Deep input cloning (arrays, ListNode, TreeNode, GraphNode)
│   ├── compare.ts        # Comparison engine (smartCompare, unordered arrays, aliases)
│   ├── console-capture.ts # Intercepts console.log calls during test execution
│   ├── diff.ts           # Structured/colored console diff rendering
│   ├── display.ts        # Serialization, parameter parsing, visual formatters (facade)
│   ├── testcase-parser.ts # LeetCode testcase parser facade (re-exports parser/*)
│   ├── title-helper.ts   # Kebab-case title formatting + camelCase derivation
│   ├── parser/           # Modular testcase parser sub-modules
│   │   ├── text-parser.ts     # Raw text/JSON parsing, clipboard I/O
│   │   ├── signature-infer.ts # TypeScript type + function signature inference
│   │   └── code-formatter.ts  # Testcase value stringification & TS code generation
│   └── visualizers/      # Modular ASCII visualizer sub-modules
│       ├── tree-visualizer.ts  # Binary tree top-down & sideways ASCII renderer
│       ├── grid-visualizer.ts  # 2D matrix box-drawing table renderer
│       └── graph-visualizer.ts # Graph spatial layout & adjacency-list renderer
├── templates/
│   └── boilerplates.ts   # Exported boilerplate template functions (used by CLI)
├── tests/
│   └── feature-test.ts   # Framework feature test suite (run with: pnpm test)
└── scripts/
    ├── new.ts            # CLI tool to scaffold new problem files interactively
    ├── template.ts       # CLI tool to write/replace boilerplate template into an existing file
    ├── populate.ts       # CLI tool to append parsed LeetCode testcases into existing files
    └── copy-title.ts     # Internal utility to format & clipboard-copy problem titles
playground/               # Sandbox directory for practice, testing, or quick scratchpads
package.json              # Project scripts and dependency configuration
tsconfig.json             # TypeScript path mappings (#functions/*, #ds/*, #utils/*, #templates/*)
```

---

## 🚀 Quick Start Guide

### Step 1: Scaffold a New Problem File (`pnpm new`)

Run the interactive file generator from anywhere in your workspace:

```bash
pnpm new
```

The CLI automatically detects your **most recently modified file** and offers its directory as the default location:

```
◆  Recent:   NeetCode150/3.Stack/5.daily-temperatures.ts
◆  Terminal: .

◆  Create new file in:
   ✦  NeetCode150/3.Stack
   📁  .  (terminal dir)
   📂  Choose a different directory...
   📝  Populate template into an existing file
```

After choosing a location, the CLI will prompt for problem details:

```
◆ Problem number (auto-detected: 6)
│  Press Enter to accept, or type to override (e.g. an LC number like 1299)
│  Leave blank for no number prefix.

◆ Problem name
│  e.g. Car Fleet  (leave blank for 'untitled')

◆ Select a template
│  ❯ Standard          (arrays, strings, math)
│    Linked List
│    Cyclic Linked List
│    Binary Tree
│    Graph
│    Class Design      (MinStack, LRU Cache, etc.)
│    Multi-Param Tree  (LCA, path problems)

✔  Created & opened: NeetCode150/3.Stack/6.car-fleet.ts
```

> 💡 **Smart Numbering**: If the target directory contains numbered files (`1.foo.ts`, `5.bar.ts`), the tool **auto-detects the next number** (e.g. `6`) as default.

> 💡 **Clipboard Auto-Fill**: If you copy LeetCode example test cases to your clipboard *before* running `pnpm new`, the CLI auto-detects the test cases and pre-fills them in your new file!

---

### Step 2: Write Template to an Existing File (`pnpm template`)

To populate or overwrite an existing file (like `playground/practice/practice.ts` or any active file) with a fresh template:

```bash
pnpm template
# or specify target directly:
pnpm template practice.ts
```

The CLI auto-detects your most recently modified file and lets you pick a template to write directly into it. If LeetCode test cases are in your clipboard, it auto-fills them into the template as well!

---

### Step 3: Append Test Cases to an Existing File (`pnpm populate`)

Append test cases to any solution file without re-writing the code:

1. **Copy** any example text block from LeetCode (supports single or multiple example blocks, explanations, raw lines, and `runClassTests` formats):

```text
Example 1:

Input:
nums = [2,5,6,9]
target = 9

Output: [[2,2,5],[9]]
```

2. Run:
```bash
pnpm populate
# or specify file directly:
pnpm populate practice.ts
```

3. The script pre-selects your most recently modified file and appends formatted test case objects into `runTests(solve, [...])`.

---

### Step 4: Copy Problem Titles (`pnpm title`)

Need clean problem titles for file naming or documentation?

```bash
pnpm title "13. 3Sum Closest"
# Copies formatted title to clipboard: 3.3sum-closest.ts
```

Or run `pnpm title` with no arguments to copy the formatted title of your most recently modified file.

---

### Step 5: Run the Code

Run any solution file directly using `tsx` from the workspace root:

```bash
pnpm exec tsx "NeetCode150/1.Array & Hashing/10.valid-sudoku.ts"
```

Or for playground practice:
```bash
pnpm exec tsx playground/practice/practice.ts
```

---

### Step 6: Run Framework Feature Tests
```bash
pnpm test
```

---

## 🛠 Scripts Reference

| Command | Description |
|---|---|
| `pnpm new` | Scaffold a new problem file with smart directory auto-detection & template selection |
| `pnpm new practice.ts` | Target a specific filename directly with boilerplate & pre-filled clipboard test cases |
| `pnpm template [file]` | Write/replace boilerplate template directly into an existing file |
| `pnpm populate [file]` | Appends parsed LeetCode test cases from clipboard directly into an existing file |
| `pnpm title [input]` | Formats problem title & copies filename slug / title to clipboard |
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

5. **Cycle-Safe & Standalone Graph Visualizations**:
   - **`GraphNode` Objects**: Cyclic graph structures are serialized into stable, sorted adjacency lists without stack overflows.
   - **Raw Adjacency Maps**: Objects like `{ 0: ["8", "1"], 1: ["0"] }` or `{ a: ["b", "c"] }` automatically visualize as clean graph component layouts without requiring `createGraph()`.
   - **Edge Lists (String & Numeric)**: Tuples like `[["w", "x"], ["x", "y"]]` or `[[0, 1], [1, 2]]` auto-render as graph layouts with configurable directed (`──►`) or undirected (`──`) edge rendering and component grouping.
   - **Graph Direction Resolution (`isDirected`)**:
     By default, raw edge lists default to **undirected** (`isDirected: false`), automatically building bidirectional adjacency and grouping components accurately. Direction is resolved via:
     1. **Per-Test Case Override**: `{ input: [...], output: ..., isDirected: true }`
     2. **Suite-Level Option**: `runTests(fn, tests, { isDirected: true })`
     3. **Parameter Name Heuristic**: Parameters matching `/directed|prereq|flight|dag|order|dependency/i` (e.g. `prerequisites`, `directedEdges`) default to directed (`isDirected: true`).

6. **Class Design Testing (`runClassTests`)**:
   Interactive / OOP problems (MinStack, LRU Cache, MedianFinder, Trie) execute step-by-step with a formatted execution trace table showing step index, operation name + arguments, expected vs actual values, and pass/fail indicators.

7. **`TreeNode.find(val)` — Node Reference Lookup**:
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
  unordered?: boolean;        // Compare array outputs order-insensitively (1D & 2D). Default: false
  showHint?: boolean;         // Show index failure hint (↳ index [i]: expected X, got Y). Default: true
  isDirected?: boolean;       // Explicitly set graph direction (true/false) across suite. Default: auto
});
```

### Option Details

| Option | Default | Description |
|---|---|---|
| `showHeader` | `true` | Displays the `RUNS fn()` banner at the top |
| `visualizeInput` | **`true`** | Renders structured visual diagrams before each test case |
| `showStringInput` | `true` | Prints plain `param = value` lines (can suppress when using visuals only) |
| `unordered` | `false` | Treats array output order as insensitive (`compareUnorderedArrays` / `compareUnordered2DArrays`) |
| `showHint` | `true` | Shows detailed index mismatch hint on test failure |
| `isDirected` | `auto` | Suite-level default for graph direction (`true` for directed, `false` for undirected). Overridden by per-test `isDirected`. |

> 💡 **Per-Test Case Options**: Individual test case objects in `runTests` also support `unordered?: boolean` and `isDirected?: boolean` for granular per-test control.

### Visualizer Output by Type

When `visualizeInput: true` (the default), each input is rendered before every test case:

| Input Type | Visual Output |
|---|---|
| **Binary Tree** | Top-down ASCII tree with branch connectors |
| **2D Grid / Matrix** | Box-drawing table with row/column borders (`9x9` Sudoku, `3x4` matrices) |
| **Linked List** | `1 → 2 → 3 → null` arrow chain |
| **Graph (`GraphNode` / Adj Map / Edge List)** | Node adjacency list with directed (`──►`) / undirected (`──`) edge rendering & component grouping |
| **Multi-param Trees (LCA, etc.)** | Single unified tree diagram with `p [green]` and `q [yellow]` node labels |

> 💡 **Smart 2D Array Disambiguation**:
> For 2D arrays (`any[][]`), the visualizer automatically distinguishes 2D Grids from Graph Edge Lists:
> - **Parameter Name Precedence**: Parameters named `grid`, `board`, `matrix`, or `table` are **always** rendered as 2D Grids. Parameters named `edges`, `prereqs`, `flights`, `connections`, `times`, or `adj` are **always** rendered as Graph Edge Lists.
> - **Structural Fallback**: For generic parameter names (e.g. `arr`), 2-tuple or 3-tuple rows (`[u, v]` or `[u, v, weight]`) default to Graph Edge Lists, while other dimensions (e.g. `9x9` Sudoku, `3x4` matrix) default to 2D Grids.

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

// Class design testing (interactive data structures)
import { runClassTests } from "#functions/code-tester.js";
import { MinStack } from "./min-stack.js";

runClassTests(MinStack, [
  {
    operations: ["MinStack", "push", "push", "push", "getMin", "pop", "top", "getMin"],
    args: [[], [-2], [0], [-3], [], [], [], []],
    expected: [null, null, null, null, -3, null, 0, -2],
  },
]);
```

### Unordered Comparison Helpers

For problems where 1D or 2D output order doesn't matter (e.g. *Top K Frequent Elements*, *Intersection of Two Arrays*):

```typescript
// 1. Suite-level option (applies to all test cases in the run)
runTests(topKFrequent, [
  { input: [[1, 2, 2, 3, 3, 3], 2], output: [2, 3] },
  { input: [[7, 7], 1], output: [7] },
], { unordered: true });

// 2. Per test case option
runTests(topKFrequent, [
  { input: [[1, 2, 2, 3, 3, 3], 2], output: [2, 3], unordered: true },
]);

// 3. Custom comparator (if custom logic is required)
import { compareUnorderedArrays } from "#functions/code-tester.js";
runTests(fn, [{ input: [...], output: [...], compare: compareUnorderedArrays }]);

// NOTE: smartCompare automatically handles 2D primitive arrays (Group Anagrams, 3Sum) out of the box.
```

---
