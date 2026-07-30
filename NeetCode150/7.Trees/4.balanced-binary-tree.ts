import { runTests } from "#functions/code-tester.js";
import { createBinaryTree, TreeNode } from "#functions/tree.js";

// LeetCode 110

// A height-balanced binary tree is defined as a binary tree in which the left and
// right subtrees of every node differ in height by no more than 1.

// o(n^2) time and o(h) space
// const solve = function isBalanced(root: TreeNode | null): boolean {
//   if (!root) return true;

//   const left = height(root.left);
//   const right = height(root.right);
//   const difference = Math.abs(left - right);

//   return difference <= 1 && isBalanced(root.left) && isBalanced(root.right);

//   function height(node: TreeNode | null): number {
//     if (!node) return 0;
//     return 1 + Math.max(height(node.left), height(node.right));
//   }
// };

// o(n) time and space -------- (optimal solution)
const solve = function isBalanced(root: TreeNode | null): boolean {
  return height(root) !== -1;

  function height(node: TreeNode | null): number {
    if (!node) return 0;

    const left = height(node.left);
    if (left === -1) return -1;

    const right = height(node.right);
    if (right === -1) return -1;

    if (Math.abs(left - right) > 1) return -1;
    return 1 + Math.max(left, right);
  }
};

runTests(
  solve,
  [
    {
      input: [createBinaryTree([3, 9, 20, null, null, 15, 7])],
      output: true,
    },
    {
      input: [createBinaryTree([1, 2, 2, 3, 3, null, null, 4, 4])],
      output: false,
    },
    {
      input: [createBinaryTree([])],
      output: true,
    },

    // Edge
    {
      input: [createBinaryTree([1, 2, 3, null, null, 4, null, 5])],
      output: false,
    },
    {
      input: [createBinaryTree([1, 2, 3, 4, null, null, 5, 6])],
      output: false,
    },
  ],
  { visualizeInput: true },
);
