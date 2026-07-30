import { runTests } from "#functions/code-tester.js";
import { createBinaryTree, TreeNode } from "#functions/tree.js";

// LeetCode 572

// o(n * m) time & o(h) space
// where [ n = nodes in root, m = nodes in subRoot, h = height ]
const solve = function isSubtree(
  root: TreeNode | null,
  subRoot: TreeNode | null,
): boolean {
  if (!subRoot) return true;
  if (!root) return false;

  if (isSameTree(root, subRoot)) return true;

  return isSubtree(root.left, subRoot) || isSubtree(root.right, subRoot);

  function isSameTree(p: TreeNode | null, q: TreeNode | null): boolean {
    if (!p && !q) return true;
    if (!p || !q || p.val !== q.val) return false;

    return isSameTree(p.left, q.left) && isSameTree(p.right, q.right);
  }
};

// Knuth-Morris-Pratt (KMP) algorithm
// o(n + m) time and o(n + m) space
// const solve = function isSubtree(
//   root: TreeNode | null,
//   subRoot: TreeNode | null,
// ): boolean {
//   const serializedRoot = serialize(root);
//   const serializedSubRoot = serialize(subRoot);

//   // Check if subRoot's string format is a substring of root's string format
//   return serializedRoot.includes(serializedSubRoot);

//   function serialize(node: TreeNode | null): string {
//     if (!node) return ",#"; // Null marker with delimiter
//     return `,${node.val}${serialize(node.left)}${serialize(node.right)}`;
//   }
// };

runTests(
  solve,
  [
    {
      input: [createBinaryTree([3, 4, 5, 1, 2]), createBinaryTree([4, 1, 2])],
      output: true,
    },
    {
      input: [
        createBinaryTree([3, 4, 5, 1, 2, null, null, null, null, 0]),
        createBinaryTree([4, 1, 2]),
      ],
      output: false,
    },
    // Edge
    {
      input: [
        createBinaryTree([1, 2, null, 3, null, 4, null]),
        createBinaryTree([3, 4]),
      ],
      output: true,
    },
  ],
  { visualizeInput: true },
);
