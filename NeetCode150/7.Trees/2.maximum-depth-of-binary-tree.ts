import { runTests } from "#functions/code-tester.js";
import { createBinaryTree, TreeNode } from "#ds/tree.js";

// LeetCode 104

// O(n) time and o(h) soace complexity
// (h -> worst case: n, best case: logn)
const solve = function maxDepth(root: TreeNode | null): number {
  if (!root) return 0;
  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
};

// itterative
function maxDepth(root: TreeNode | null): number {
  if (!root) return 0;

  let depth = 0;
  let head = 0;
  const queue: TreeNode[] = [root];

  while (head < queue.length) {
    const levelSize = queue.length - head;

    for (let i = 0; i < levelSize; i++) {
      const curr = queue[head];
      head++;

      curr.left && queue.push(curr.left);
      curr.right && queue.push(curr.right);
    }

    depth++;
  }

  return depth;
}

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
