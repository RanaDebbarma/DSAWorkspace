import { runTests } from "#functions/code-tester.js";
import { createBinaryTree, TreeNode } from "#ds/tree.js";

// LeetCode 100

// Two binary trees are considered equivalent if they share the
// exact same structure and the nodes have the same values.

// recursive approach
const solve = function isSameTree(
  p: TreeNode | null,
  q: TreeNode | null,
): boolean {
  if (!p && !q) return true;
  if (!p || !q || p.val !== q.val) return false;

  return isSameTree(p.left, q.left) && isSameTree(p.right, q.right);
};

// iterative approach ------ (rare case)
// const solve = function isSameTree(p: TreeNode | null, q: TreeNode | null): boolean {
//   const queue: (TreeNode | null)[] = [p, q];

//   while (queue.length > 0) {
//     const node1 = queue.shift();
//     const node2 = queue.shift();

//     if (!node1 && !node2) continue;
//     if (!node1 || !node2 || node1.val !== node2.val) return false;

//     queue.push(node1.left, node2.left);
//     queue.push(node1.right, node2.right);
//   }

//   return true;
// }

runTests(
  solve,
  [
    {
      input: [createBinaryTree([1, 2, 3]), createBinaryTree([1, 2, 3])],
      output: true,
    },
    {
      input: [createBinaryTree([4, 7]), createBinaryTree([4, null, 7])],
      output: false,
    },
    {
      input: [createBinaryTree([1, 2, 3]), createBinaryTree([1, 3, 2])],
      output: false,
    },
  ],
  { visualizeInput: true },
);
