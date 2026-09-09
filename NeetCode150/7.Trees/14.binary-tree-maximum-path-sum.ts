import { runTests } from "#functions/code-tester.js";
import { createBinaryTree, TreeNode } from "#ds/tree.js";

// LeetCode 124

function maxPathSum(root: TreeNode | null): number {
  let maxSum = -Infinity;

  dfs(root);

  return maxSum;

  function dfs(node: TreeNode | null): number {
    if (!node) return 0;

    // Ignore negative child contributions.
    const leftGain = Math.max(0, dfs(node.left));
    const rightGain = Math.max(0, dfs(node.right));

    // Path through this node can use both children.
    const currentPath = node.val + leftGain + rightGain;

    // Track the best path found anywhere.
    maxSum = Math.max(maxSum, currentPath);

    // Parent can only extend through one child.
    return node.val + Math.max(leftGain, rightGain);
  }
}

runTests(maxPathSum, [
  { input: [createBinaryTree([1, 2, 3])], output: 6 },
  {
    input: [createBinaryTree([-15, 10, 20, null, null, 15, 5, -5])],
    output: 40,
  },
  { input: [createBinaryTree([1, 2, 3])], output: 6 },
  { input: [createBinaryTree([-10, 9, 20, null, null, 15, 7])], output: 42 },
]);
