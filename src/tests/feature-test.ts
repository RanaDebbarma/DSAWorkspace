/**
 * feature-test.ts
 *
 * Comprehensive test suite that exercises every feature of the local
 * test-runner framework. Run with:
 *
 *   pnpm exec tsx playground/feature-test.ts
 */

import chalk from "chalk";
import {
  runTests,
  runClassTests,
  compareUnorderedArrays,
  compareUnordered2DArrays,
  compareGroupAnagrams,
  compare3Sum,
} from "#functions/code-tester.js";
import { createLinkedList, createCyclicLinkedList, ListNode } from "#functions/linked-list.js";
import { createBinaryTree, TreeNode } from "#functions/tree.js";
import { createGraph, cloneGraph } from "#functions/graph.js";

// ─────────────────────────────────────────────────────────────────────────────
// SECTION HEADER UTILITY
// ─────────────────────────────────────────────────────────────────────────────
function section(n: number, title: string) {
  console.log(`\n${chalk.bold.magenta(`┌─ §-${n}  ${title}`)}`);
  console.log(chalk.magenta("│"));
}

// =============================================================================
// § 1 — STANDARD PRIMITIVES (number · string · boolean)
// =============================================================================
section(1, "Standard Primitives — number, string, boolean");

function twoSum(nums: number[], target: number): number[] {
  const map = new Map<number, number>();
  for (let i = 0; i < nums.length; i++) {
    const diff = target - nums[i];
    if (map.has(diff)) return [map.get(diff)!, i];
    map.set(nums[i], i);
  }
  return [];
}

runTests(twoSum, [
  { name: "Two Sum — pass",   input: [[2, 7, 11, 15], 9],  output: [0, 1] },
  { name: "Two Sum — pass 2", input: [[3, 2, 4], 6],       output: [1, 2] },
]);

function isPalindrome(s: string): boolean {
  const clean = s.toLowerCase().replace(/[^a-z0-9]/g, "");
  return clean === clean.split("").reverse().join("");
}

runTests(isPalindrome, [
  { name: "Palindrome — pass",   input: ["A man, a plan, a canal: Panama"], output: true  },
  { name: "Palindrome — pass 2", input: ["race a car"],                     output: false },
  { name: "Palindrome — FAIL (intentional diff demo)", input: ["hello"],   output: true  },
]);

// =============================================================================
// § 2 — UNORDERED COMPARATORS
// =============================================================================
section(2, "Unordered Comparators");

function groupAnagrams(strs: string[]): string[][] {
  const map = new Map<string, string[]>();
  for (const s of strs) {
    const key = s.split("").sort().join("");
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(s);
  }
  return [...map.values()];
}

runTests(groupAnagrams, [
  {
    name: "Group Anagrams — pass",
    input: [["eat", "tea", "tan", "ate", "nat", "bat"]],
    output: [["bat"], ["nat", "tan"], ["ate", "eat", "tea"]],
    compare: compareGroupAnagrams,
  },
]);

function threeSum(nums: number[]): number[][] {
  nums.sort((a, b) => a - b);
  const res: number[][] = [];
  for (let i = 0; i < nums.length - 2; i++) {
    if (i > 0 && nums[i] === nums[i - 1]) continue;
    let l = i + 1, r = nums.length - 1;
    while (l < r) {
      const s = nums[i] + nums[l] + nums[r];
      if (s === 0) { res.push([nums[i], nums[l++], nums[r--]]); while (l < r && nums[l] === nums[l-1]) l++; while (l < r && nums[r] === nums[r+1]) r--; }
      else if (s < 0) l++; else r--;
    }
  }
  return res;
}

runTests(threeSum, [
  {
    name: "3Sum — pass",
    input: [[-1, 0, 1, 2, -1, -4]],
    output: [[-1, -1, 2], [-1, 0, 1]],
    compare: compare3Sum,
  },
]);

runTests(<T>(a: T[], b: T[]) => compareUnorderedArrays(a, b), [
  { name: "Unordered 1D — pass", input: [[1, 3, 2], [2, 1, 3]], output: true  },
  { name: "Unordered 1D — pass (identical)", input: [[5], [5]],  output: true  },
]);

runTests(<T>(a: T[][], b: T[][]) => compareUnordered2DArrays(a, b), [
  {
    name: "Unordered 2D — pass",
    input: [[[3,1],[2]], [[1,3],[2]]],
    output: true,
  },
]);

// =============================================================================
// § 3 — INPUT CLONING (in-place mutation)
// =============================================================================
section(3, "Input Cloning — in-place mutation safety");

function sortArray(nums: number[]): number[] {
  return nums.sort((a, b) => a - b);
}

runTests(sortArray, [
  {
    name: "Sort — pass (input clone prevents cross-test contamination)",
    input: [[3, 1, 4, 1, 5, 9, 2, 6]],
    output: [1, 1, 2, 3, 4, 5, 6, 9],
  },
  {
    name: "Sort — pass (same unsorted input works again)",
    input: [[3, 1, 4, 1, 5, 9, 2, 6]],
    output: [1, 1, 2, 3, 4, 5, 6, 9],
  },
]);

// =============================================================================
// § 4 — CUSTOM COMPARATOR
// =============================================================================
section(4, "Custom Comparator via `compare` override");

function topKFrequent(nums: number[], k: number): number[] {
  const map = new Map<number, number>();
  for (const n of nums) map.set(n, (map.get(n) ?? 0) + 1);
  return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, k).map(e => e[0]);
}

runTests(topKFrequent, [
  {
    name: "Top-K Frequent — pass (order-insensitive custom compare)",
    input: [[1, 1, 1, 2, 2, 3], 2],
    output: [1, 2],
    compare: (actual, expected) => compareUnorderedArrays(actual, expected),
  },
]);

// =============================================================================
// § 5 — LINKED LIST
// =============================================================================
section(5, "Linked List — standard & cyclic, pass and visual fail");

function reverseList(head: ListNode | null): ListNode | null {
  let prev: ListNode | null = null;
  let curr = head;
  while (curr) {
    const next = curr.next;
    curr.next = prev;
    prev = curr;
    curr = next;
  }
  return prev;
}

runTests(reverseList, [
  { name: "Reverse List — pass",           input: [createLinkedList([1, 2, 3, 4, 5])], output: createLinkedList([5, 4, 3, 2, 1]) },
  { name: "Reverse List — FAIL (visual diff demo)", input: [createLinkedList([1, 2, 3])], output: createLinkedList([3, 9, 1]) },
]);

function hasCycle(head: ListNode | null): boolean {
  let slow = head, fast = head;
  while (fast && fast.next) {
    slow = slow!.next;
    fast = fast.next.next;
    if (slow === fast) return true;
  }
  return false;
}

runTests(hasCycle, [
  { name: "Cyclic List — has cycle",    input: [createCyclicLinkedList([3, 2, 0, -4], 1)], output: true  },
  { name: "Cyclic List — no cycle",     input: [createCyclicLinkedList([1], -1)],           output: false },
]);

// =============================================================================
// § 6 — BINARY TREE
// =============================================================================
section(6, "Binary Tree — pass and visual fail");

function invertTree(root: TreeNode | null): TreeNode | null {
  if (!root) return null;
  [root.left, root.right] = [invertTree(root.right), invertTree(root.left)];
  return root;
}

runTests(invertTree, [
  {
    name: "Invert Tree — pass",
    input: [createBinaryTree([4, 2, 7, 1, 3, 6, 9])],
    output: createBinaryTree([4, 7, 2, 9, 6, 3, 1]),
  },
  {
    name: "Invert Tree — FAIL (visual diff demo)",
    input: [createBinaryTree([1, 2, 3])],
    output: createBinaryTree([1, 4, 5]),
  },
]);

// =============================================================================
// § 7 — GRAPH (undirected cyclic)
// =============================================================================
section(7, "Graph — undirected cyclic, pass and visual fail");

runTests(cloneGraph, [
  {
    name: "Clone Graph — 2D Spatial Box (4 Nodes)",
    input: [createGraph([[2, 4], [1, 3], [2, 4], [1, 3]])],
    output: createGraph([[2, 4], [1, 3], [2, 4], [1, 3]]),
  },
]);

function canFinish(numCourses: number, prerequisites: number[][]): boolean {
  return true;
}

runTests(canFinish, [
  {
    name: "Course Schedule — Large DAG (8 Nodes, non-2D)",
    input: [8, [[1, 0], [2, 0], [3, 1], [3, 2], [4, 3], [5, 4], [6, 5], [7, 6]]],
    output: true,
  },
]);

function countComponents(n: number, edges: number[][]): number {
  return 3;
}

runTests(countComponents, [
  {
    name: "Connected Components — Disconnected Graph (8 Nodes, 3 Components)",
    input: [8, [[0, 1], [1, 2], [3, 4], [5, 6], [6, 7]]],
    output: 3,
  },
]);

function networkDelayTime(times: number[][], n: number, k: number): number {
  return 2;
}

runTests(networkDelayTime, [
  {
    name: "Weighted Graph — Network Delay Time",
    input: [[[2, 1, 1], [2, 3, 2], [3, 4, 1]], 4, 2],
    output: 2,
  },
]);


// =============================================================================
// § 8 — CLASS DESIGN / SYSTEM DESIGN (runClassTests)
// =============================================================================
section(8, "Class Design — runClassTests (MinStack)");

class MinStack {
  private stack: number[] = [];
  private minStack: number[] = [];

  push(val: number): void {
    this.stack.push(val);
    this.minStack.push(Math.min(val, this.minStack.at(-1) ?? val));
  }
  pop(): void {
    this.stack.pop();
    this.minStack.pop();
  }
  top(): number { return this.stack.at(-1)!; }
  getMin(): number { return this.minStack.at(-1)!; }
}

runClassTests(MinStack, [
  {
    name: "MinStack — standard operations pass",
    operations: ["MinStack", "push", "push", "push", "getMin", "pop", "top", "getMin"],
    args:       [[], [-2], [0], [-3], [], [], [], []],
    expected:   [null, null, null, null, -3, null, 0, -2],
  },
  {
    name: "MinStack — FAIL (visual diff demo)",
    operations: ["MinStack", "push", "getMin"],
    args:       [[], [5], []],
    expected:   [null, null, 99],
  },
]);

// =============================================================================
// § 9 — 2D MATRIX GRID VISUALIZATION
// =============================================================================
section(9, "2D Matrix Grid Visualization (visualizeInput: true)");

function numIslands(grid: string[][]): number {
  if (!grid.length) return 0;
  let count = 0;
  const rows = grid.length, cols = grid[0].length;

  function dfs(r: number, c: number) {
    if (r < 0 || r >= rows || c < 0 || c >= cols || grid[r][c] === "0") return;
    grid[r][c] = "0";
    dfs(r + 1, c); dfs(r - 1, c); dfs(r, c + 1); dfs(r, c - 1);
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === "1") {
        count++;
        dfs(r, c);
      }
    }
  }
  return count;
}

runTests(numIslands, [
  {
    name: "Num Islands — 2D Matrix Grid Visualizer",
    input: [[
      ["1", "1", "0", "0", "0"],
      ["1", "1", "0", "0", "0"],
      ["0", "0", "1", "0", "0"],
      ["0", "0", "0", "1", "1"]
    ]],
    output: 3,
  }
], { visualizeInput: true });

// =============================================================================
// § 10 — TREE NODE HIGHLIGHT VISUALIZATION (LCA)
// =============================================================================
section(10, "Tree Node Highlight Visualization (LCA with visualizeInput: true)");

function lowestCommonAncestor(
  root: TreeNode | null,
  p: TreeNode | null,
  q: TreeNode | null
): TreeNode | null {
  let curr = root;
  while (curr && p && q) {
    if (p.val < curr.val && q.val < curr.val) curr = curr.left;
    else if (p.val > curr.val && q.val > curr.val) curr = curr.right;
    else return curr;
  }
  return null;
}

const lcaTree = createBinaryTree([6, 2, 8, 0, 4, 7, 9, null, null, 3, 5])!;

runTests(lowestCommonAncestor, [
  {
    name: "LCA — Unified Tree with Highlighted p & q",
    input: [lcaTree, lcaTree.find(2), lcaTree.find(8)],
    output: 6,
  }
], { visualizeInput: true });

