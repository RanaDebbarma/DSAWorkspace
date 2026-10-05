import { isDeepStrictEqual } from "node:util";
import {
  ListNode,
  compareLinkedLists,
  Node,
  randomListHasNoSharedNodes,
  randomListToArray,
} from "#ds/linked-list.js";
import { TreeNode, compareBinaryTrees } from "#ds/tree.js";
import { GraphNode, compareGraphs, graphHasNoSharedNodes } from "#ds/graph.js";

export type CompareOptions = {
  unordered?: boolean;
  fnName?: string;
};

/**
 * Smart recursively compares two values.
 * Automatically selects specialized comparators for ListNodes, TreeNodes, and GraphNodes.
 */
export function smartCompare(
  actual: any,
  expected: any,
  actualInput?: any[],
  options?: CompareOptions,
): boolean {
  if (actual === expected) return true;
  if (actual === null || actual === undefined || expected === null || expected === undefined) {
    return actual === expected;
  }

  // Handle floating point tolerance for non-integers (e.g. LC Pow(x, n), Geometry, Probabilities)
  if (typeof actual === "number" && typeof expected === "number") {
    if (!Number.isInteger(actual) || !Number.isInteger(expected)) {
      return Math.abs(actual - expected) < 1e-5;
    }
  }

  if (actual instanceof ListNode || expected instanceof ListNode) {
    if (actual instanceof ListNode && typeof expected === "number") {
      return actual.val === expected;
    }
    if (expected instanceof ListNode && typeof actual === "number") {
      return expected.val === actual;
    }
    return compareLinkedLists(actual as ListNode | null, expected as ListNode | null);
  }

  if (actual instanceof Node || expected instanceof Node) {
    const original = actualInput?.find((value) => value instanceof Node) as Node | undefined;
    return compareRandomLists(
      actual as Node | null,
      expected as Node | null,
      original ?? null,
    );
  }

  if (actual instanceof TreeNode || expected instanceof TreeNode) {
    if (actual instanceof TreeNode && typeof expected === "number") {
      return actual.val === expected;
    }
    if (expected instanceof TreeNode && typeof actual === "number") {
      return expected.val === actual;
    }
    return compareBinaryTrees(actual as TreeNode | null, expected as TreeNode | null);
  }

  if (actual instanceof GraphNode || expected instanceof GraphNode) {
    const originalNode = actualInput?.find((v) => v instanceof GraphNode) as GraphNode | undefined;
    return (
      compareGraphs(actual as GraphNode | null, expected as GraphNode | null) &&
      graphHasNoSharedNodes(originalNode ?? null, actual as GraphNode | null)
    );
  }

  if (Array.isArray(actual) && Array.isArray(expected)) {
    if (actual.length !== expected.length) return false;

    if (options?.unordered) {
      const is2D =
        (actual.length > 0 && Array.isArray(actual[0])) ||
        (expected.length > 0 && Array.isArray(expected[0]));
      return is2D
        ? compareUnordered2DArrays(actual, expected)
        : compareUnorderedArrays(actual, expected);
    }

    // Auto-detect 2D arrays of primitives (subsets / combinations / permutations).
    // Both outer order and inner order are treated as unordered.
    const is2DPrimitive = (arr: any[]): boolean =>
      arr.length === 0 ||
      (Array.isArray(arr[0]) && arr.every(
        (row) => Array.isArray(row) && row.every((v) => v === null || typeof v !== "object")
      ));

    if (is2DPrimitive(actual) && is2DPrimitive(expected)) {
      return compareUnordered2DArrays(actual, expected);
    }

    // Default: ordered element-wise comparison
    let matchesOrdered = true;
    for (let i = 0; i < actual.length; i++) {
      if (!smartCompare(actual[i], expected[i], undefined, options)) {
        matchesOrdered = false;
        break;
      }
    }
    if (matchesOrdered) return true;

    // Auto-detect Topological Sort / Course Schedule valid permutations
    if (compareTopologicalSort(actual, expected, actualInput, options)) {
      return true;
    }

    return false;
  }

  return isDeepStrictEqual(actual, expected);
}

/**
 * Compare two arrays where the order of elements does not matter.
 */
export function compareUnorderedArrays<T>(actual: T[], expected: T[]): boolean {
  if (actual.length !== expected.length) return false;

  const visited = new Set<number>();
  for (const actItem of actual) {
    let found = false;
    for (let i = 0; i < expected.length; i++) {
      if (visited.has(i)) continue;
      if (smartCompare(actItem, expected[i])) {
        visited.add(i);
        found = true;
        break;
      }
    }
    if (!found) return false;
  }
  return true;
}

/**
 * Compare two 2D arrays where the order of outer lists and inner items does not matter.
 * This generalizes comparators like Group Anagrams and 3Sum.
 */
export function compareUnordered2DArrays<T>(actual: T[][], expected: T[][]): boolean {
  if (actual.length !== expected.length) return false;

  const visited = new Set<number>();
  for (const actRow of actual) {
    let found = false;
    for (let i = 0; i < expected.length; i++) {
      if (visited.has(i)) continue;
      if (compareUnorderedArrays(actRow, expected[i])) {
        visited.add(i);
        found = true;
        break;
      }
    }
    if (!found) return false;
  }
  return true;
}

// Legacy comparators (maintained for backward compatibility with solved problems)
export function compareGroupAnagrams(actual: string[][], expected: string[][]): boolean {
  return compareUnordered2DArrays(actual, expected);
}

export function compare3Sum(actual: number[][], expected: number[][]): boolean {
  return compareUnordered2DArrays(actual, expected);
}

export function compareRandomLists(
  actual: Node | null,
  expected: Node | null,
  original: Node | null = null,
): boolean {
  const actualArr = randomListToArray(actual);
  const expectedArr = randomListToArray(expected);
  return (
    isDeepStrictEqual(actualArr, expectedArr) &&
    randomListHasNoSharedNodes(original, actual)
  );
}

/**
 * Auto-detect and compare alternative valid Topological Sort orders (e.g. Course Schedule II).
 * Verifies that `actual` is a valid permutation of courses/nodes satisfying all edge constraints
 * matching the direction exhibited by `expected`.
 */
export function compareTopologicalSort(
  actual: any,
  expected: any,
  actualInput?: any[],
  options?: CompareOptions,
): boolean {
  if (!Array.isArray(actual) || !Array.isArray(expected)) return false;
  if (actual.length !== expected.length) return false;

  const graphData = extractGraphInputs(actualInput);
  if (!graphData) return false;

  const { n, edges } = graphData;
  if (expected.length !== n || actual.length !== n) return false;

  // Both must be valid permutations of 0..n-1
  if (!isPermutationOfN(expected, n) || !isPermutationOfN(actual, n)) {
    return false;
  }

  // If no edges exist:
  // If fnName is available, only allow unconstrained permutations if it represents an ordering/schedule problem.
  if (edges.length === 0) {
    if (options?.fnName && !/(order|schedule|topo|course)/i.test(options.fnName)) {
      return false;
    }
    return true;
  }

  // Pre-calculate index positions
  const posExp = new Int32Array(n);
  for (let i = 0; i < n; i++) posExp[expected[i]] = i;

  const posAct = new Int32Array(n);
  for (let i = 0; i < n; i++) posAct[actual[i]] = i;

  // Determine edge direction by examining expected output:
  // 1. Prerequisites style ([course, prereq] -> prereq must appear before course)
  const isPrereqStyle = edges.every(([course, prereq]) => posExp[prereq] < posExp[course]);

  // 2. Direct edge style ([u, v] -> u must appear before v)
  const isDirectEdgeStyle = edges.every(([u, v]) => posExp[u] < posExp[v]);

  if (!isPrereqStyle && !isDirectEdgeStyle) {
    return false;
  }

  if (isPrereqStyle) {
    return edges.every(([course, prereq]) => posAct[prereq] < posAct[course]);
  }

  return edges.every(([u, v]) => posAct[u] < posAct[v]);
}

function isPermutationOfN(arr: number[], n: number): boolean {
  if (arr.length !== n) return false;
  const seen = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    const val = arr[i];
    if (typeof val !== "number" || !Number.isInteger(val) || val < 0 || val >= n || seen[val] === 1) {
      return false;
    }
    seen[val] = 1;
  }
  return true;
}

function extractGraphInputs(actualInput?: any[]): { n: number; edges: [number, number][] } | null {
  if (!actualInput || !Array.isArray(actualInput) || actualInput.length < 2) return null;

  let n: number | null = null;
  let edges: [number, number][] | null = null;

  for (const arg of actualInput) {
    if (typeof arg === "number" && Number.isInteger(arg) && arg >= 0 && n === null) {
      n = arg;
    } else if (
      Array.isArray(arg) &&
      edges === null &&
      arg.every(
        (e) => Array.isArray(e) && e.length === 2 && typeof e[0] === "number" && typeof e[1] === "number",
      )
    ) {
      edges = arg as [number, number][];
    }
  }

  if (n !== null && edges !== null) {
    const validEdges = edges.every(([u, v]) => u >= 0 && u < n! && v >= 0 && v < n!);
    if (validEdges) {
      return { n, edges };
    }
  }

  return null;
}

