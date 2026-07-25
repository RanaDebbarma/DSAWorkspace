import { runTests } from "#functions/code-tester.js";
import { createBinaryTree, TreeNode } from "#functions/tree.js";

// LeetCode 104

// O(n) time and o(h) soace complexity
// (h -> worst case: n, best case: logn)
const solve = function maxDepth(root: TreeNode | null): number {
  if (!root) return 0;
  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
};

runTests(
  solve,
  [
    {
      input: [createBinaryTree([1, 2, 3, null, null, 4])],
      output: 3,
    },
    {
      input: [createBinaryTree([1, 5, 3])],
      output: 2,
    },
    {
      input: [createBinaryTree([])],
      output: 0,
    },
  ],
  { visualizeInput: true },
);
