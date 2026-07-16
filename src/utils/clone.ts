import { ListNode, cloneLinkedList } from "#functions/linked-list.js";
import { TreeNode, cloneBinaryTree } from "#functions/tree.js";
import { GraphNode, cloneGraph } from "#functions/graph.js";

/**
 * Deep clones any value recursively.
 * Special-cases ListNodes, TreeNodes, and GraphNodes.
 */
export function cloneValue(value: unknown): unknown {
  if (value === null || value === undefined) {
    return value;
  }

  if (value instanceof ListNode) {
    return cloneLinkedList(value);
  }

  if (value instanceof TreeNode) {
    return cloneBinaryTree(value);
  }

  if (value instanceof GraphNode) {
    return cloneGraph(value);
  }

  if (Array.isArray(value)) {
    return value.map(cloneValue);
  }

  if (typeof value === "object") {
    try {
      return structuredClone(value);
    } catch {
      return value; // fallback
    }
  }

  return value;
}
