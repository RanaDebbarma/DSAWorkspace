import { runTests } from "#functions/code-tester.js";
import { createBinaryTree, TreeNode } from "#functions/tree.js";

// LeetCode 543

const solve = function diameterOfBinaryTree(root: TreeNode | null): number {
  return 0;
};

runTests(
  solve,
  [
    {
      input: [createBinaryTree([1, null, 2, 3, 4, 5])],
      output: 3,
    },
    {
      input: [createBinaryTree([1, 2, 3])],
      output: 2,
    },
    {
      input: [createBinaryTree([])],
      output: 0,
    },
  ],
  { visualizeInput: true },
);
