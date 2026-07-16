import { isDeepStrictEqual } from "node:util";
import { ListNode, compareLinkedLists } from "#functions/linked-list.js";
import { TreeNode, compareBinaryTrees } from "#functions/tree.js";
import { GraphNode, compareGraphs } from "#functions/graph.js";

/**
 * Smart recursively compares two values.
 * Automatically selects specialized comparators for ListNodes, TreeNodes, and GraphNodes.
 */
export function smartCompare(actual: any, expected: any): boolean {
  if (actual === expected) return true;
  if (actual === null || actual === undefined || expected === null || expected === undefined) {
    return actual === expected;
  }

  if (actual instanceof ListNode || expected instanceof ListNode) {
    return compareLinkedLists(actual as ListNode | null, expected as ListNode | null);
  }

  if (actual instanceof TreeNode || expected instanceof TreeNode) {
    return compareBinaryTrees(actual as TreeNode | null, expected as TreeNode | null);
  }

  if (actual instanceof GraphNode || expected instanceof GraphNode) {
    return compareGraphs(actual as GraphNode | null, expected as GraphNode | null);
  }

  if (Array.isArray(actual) && Array.isArray(expected)) {
    if (actual.length !== expected.length) return false;
    for (let i = 0; i < actual.length; i++) {
      if (!smartCompare(actual[i], expected[i])) return false;
    }
    return true;
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
