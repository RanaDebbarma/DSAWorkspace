import { runTests } from "#functions/code-tester.js";
import { createBinaryTree, TreeNode } from "#functions/tree.js";

// LeetCode 1448

// o(n) time and o(h) space ----- (optimal soln)
const solve = function goodNodes(root: TreeNode | null): number {
  let numberOfGoodNodes = 0;

  dfs(root, -Infinity);
  return numberOfGoodNodes;

  function dfs(node: TreeNode | null, maxSoFar: number) {
    if (!node) return;

    if (node.val >= maxSoFar) numberOfGoodNodes++;

    const newMax = Math.max(maxSoFar, node.val);
    dfs(node.left, newMax);
    dfs(node.right, newMax);
  }
};

runTests(
  solve,
  [
    {
      input: [createBinaryTree([3, 1, 4, 3, null, 1, 5])],
      output: 4,
    },
    {
      input: [createBinaryTree([3, 3, null, 4, 2])],
      output: 3,
    },
    {
      input: [createBinaryTree([1])],
      output: 1,
    },
  ],
  { visualizeInput: true },
);
