import { runTests } from "#functions/code-tester.js";
import { createBinaryTree, TreeNode } from "#ds/tree.js";

function maxPathSum(root: TreeNode | null): number {
  return 0;
}

// Note: smartCompare automatically compares Binary Trees recursively!
runTests(maxPathSum, [
  { input: [createBinaryTree([1, 2, 3])], output: 6 },
  {
    input: [createBinaryTree([-15, 10, 20, null, null, 15, 5, -5])],
    output: 40,
  },
  { input: [createBinaryTree([1, 2, 3])], output: 6 },
  { input: [createBinaryTree([-10, 9, 20, null, null, 15, 7])], output: 42 },
]);
