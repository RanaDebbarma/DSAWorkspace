import { runTests } from "#functions/code-tester.js";
import { createBinaryTree, TreeNode } from "#functions/tree.js";

// LeetCode 226

// o(n) time & o(h) space(h: height of tree) ------- recursive
// const solve = function invertTree(root: TreeNode | null): TreeNode | null {
//   if (!root) return null;

//   [root.left, root.right] = [root.right, root.left];

//   invertTree(root.left);
//   invertTree(root.right);

//   return root;
// };

// slightly more efficient recurssive
const solve = function invertTree(root: TreeNode | null): TreeNode | null {
  if (!root) return root;

  const left = invertTree(root.left);
  const right = invertTree(root.right);

  root.left = right;
  root.right = left;

  return root;
};


// Note: smartCompare automatically compares Binary Trees recursively!
runTests(solve, [
  {
    input: [createBinaryTree([1, 2, 3, 4, 5, 6, 7])],
    output: createBinaryTree([1, 3, 2, 7, 6, 5, 4]),
  },
  {
    input: [createBinaryTree([3, 2, 1])],
    output: createBinaryTree([3, 1, 2]),
  },
  {
    input: [createBinaryTree([])],
    output: createBinaryTree([]),
  },
]);
