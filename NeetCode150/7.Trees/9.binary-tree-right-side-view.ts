import { runTests } from "#functions/code-tester.js";
import { createBinaryTree, TreeNode } from "#ds/tree.js";

// LeetCode 199

const solve = function rightSideView(root: TreeNode | null): number[] {
  if (!root) return [];

  const result: number[] = [];
  const queue: TreeNode[] = [root];
  let pointer = 0;

  while (pointer < queue.length) {
    const levelSize = queue.length - pointer;

    for (let i = 0; i < levelSize; i++) {
      const currentNode = queue[pointer++];

      if (currentNode.right) queue.push(currentNode.right);
      if (currentNode.left) queue.push(currentNode.left);

      if (i === 0) result.push(currentNode.val);
    }
  }

  return result;
};

runTests(
  solve,
  [
    {
      input: [createBinaryTree([1, 2, 3, null, 5, null, 4])],
      output: [1, 3, 4],
    },
    {
      input: [createBinaryTree([1, 2, 3, 4, null, null, null, 5])],
      output: [1, 3, 4, 5],
    },
    {
      input: [createBinaryTree([1, null, 3])],
      output: [1, 3],
    },
    {
      input: [createBinaryTree([])],
      output: [],
    },
  ],
  { visualizeInput: true },
);
