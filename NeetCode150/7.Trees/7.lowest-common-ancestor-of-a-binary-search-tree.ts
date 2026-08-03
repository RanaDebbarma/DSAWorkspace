import { runTests } from "#functions/code-tester.js";
import { createBinaryTree, TreeNode } from "#functions/tree.js";

// LeetCode 235: Lowest Common Ancestor of a Binary Search Tree

const solve = function lowestCommonAncestor(
  root: TreeNode | null,
  p: TreeNode | null,
  q: TreeNode | null,
): TreeNode | null {
  let curr = root;
  while (curr && p && q) {
    if (p.val < curr.val && q.val < curr.val) {
      curr = curr.left;
    } else if (p.val > curr.val && q.val > curr.val) {
      curr = curr.right;
    } else {
      return curr;
    }
  }
  return null;
};

const tree1 = createBinaryTree([6, 2, 8, 0, 4, 7, 9, null, null, 3, 5])!;
const tree2 = createBinaryTree([2, 1])!;

runTests(
  solve,
  [
    {
      input: [tree1, tree1.find(2), tree1.find(8)],
      output: tree1.find(6),
    },
    {
      input: [tree1, tree1.find(2), tree1.find(4)],
      output: tree1.find(2),
    },
    {
      input: [tree2, tree2.find(2), tree2.find(1)],
      output: tree2.find(2),
    },
  ],
  { visualizeInput: true },
);
