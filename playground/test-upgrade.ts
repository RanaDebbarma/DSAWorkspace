import { runTests, runClassTests } from "#functions/code-tester.js";
import { createBinaryTree, TreeNode } from "#functions/tree.js";
import { createGraph, cloneGraph, GraphNode } from "#functions/graph.js";

console.log("=== 1. TREE VERIFICATION ===");

function invertTree(root: TreeNode | null): TreeNode | null {
  if (!root) return null;
  const left = invertTree(root.left);
  const right = invertTree(root.right);
  root.left = right;
  root.right = left;
  return root;
}

runTests(invertTree, [
  {
    name: "Standard Binary Tree",
    input: [createBinaryTree([4, 2, 7, 1, 3, 6, 9])],
    output: createBinaryTree([4, 7, 2, 9, 6, 3, 1])
  }
]);

console.log("\n=== 2. GRAPH VERIFICATION ===");

runTests(cloneGraph, [
  {
    name: "Cyclic Undirected Graph",
    input: [createGraph([[2, 4], [1, 3], [2, 4], [1, 3]])],
    output: createGraph([[2, 4], [1, 3], [2, 4], [1, 3]])
  }
]);

console.log("\n=== 3. CLASS DESIGN VERIFICATION ===");

class MinStack {
  private stack: number[] = [];
  private minStack: number[] = [];

  push(val: number): void {
    this.stack.push(val);
    if (this.minStack.length === 0 || val <= this.minStack[this.minStack.length - 1]) {
      this.minStack.push(val);
    }
  }

  pop(): void {
    const val = this.stack.pop();
    if (val !== undefined && val === this.minStack[this.minStack.length - 1]) {
      this.minStack.pop();
    }
  }

  top(): number {
    return this.stack[this.stack.length - 1];
  }

  getMin(): number {
    return this.minStack[this.minStack.length - 1];
  }
}

runClassTests(MinStack, [
  {
    name: "Interactive MinStack Operations",
    operations: ["MinStack", "push", "push", "push", "getMin", "pop", "top", "getMin"],
    args: [[], [-2], [0], [-3], [], [], [], []],
    expected: [null, null, null, null, -3, null, 0, -2]
  }
]);
