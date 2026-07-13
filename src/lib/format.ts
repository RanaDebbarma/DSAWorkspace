// ============================================================================
// 1. STANDARD SOLUTION TEMPLATE (Arrays, Strings, Math, etc.)
// ============================================================================
/*
import { runTests } from "#functions/code-tester.js";

function solve(nums: number[]): number {
  return 0;
}

runTests(solve, [
  { input: [[1, 2, 3]], output: 0 }
]);
*/


// ============================================================================
// 2. LINKED LIST TEMPLATE
// ============================================================================
/*
import { runTests } from "#functions/code-tester.js";
import { createLinkedList, ListNode } from "#functions/linked-list.js";

function solve(head: ListNode | null): ListNode | null {
  return head;
}

// Note: smartCompare automatically compares Linked Lists recursively!
runTests(solve, [
  {
    input: [createLinkedList([1, 2, 3])],
    output: createLinkedList([1, 2, 3])
  }
]);
*/


// ============================================================================
// 3. BINARY TREE TEMPLATE
// ============================================================================
/*
import { runTests } from "#functions/code-tester.js";
import { createBinaryTree, TreeNode } from "#functions/tree.js";

function solve(root: TreeNode | null): TreeNode | null {
  return root;
}

// Note: smartCompare automatically compares Binary Trees recursively!
runTests(solve, [
  {
    input: [createBinaryTree([1, null, 2, 3])],
    output: createBinaryTree([1, null, 2, 3])
  }
]);
*/


// ============================================================================
// 4. GRAPH TEMPLATE
// ============================================================================
/*
import { runTests } from "#functions/code-tester.js";
import { createGraph, GraphNode } from "#functions/graph.js";

function solve(node: GraphNode | null): GraphNode | null {
  return node;
}

// Note: smartCompare automatically handles cycles and compares Graph structures!
runTests(solve, [
  {
    input: [createGraph([[2, 4], [1, 3], [2, 4], [1, 3]])],
    output: createGraph([[2, 4], [1, 3], [2, 4], [1, 3]])
  }
]);
*/


// ============================================================================
// 5. CLASS DESIGN / SYSTEM DESIGN TEMPLATE
// ============================================================================
/*
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
    operations: ["MinStack", "push", "push", "getMin", "pop", "top", "getMin"],
    args: [[], [-2], [0], [], [], [], []],
    expected: [null, null, null, -2, null, -2, -2]
  }
]);
*/
