import { runTests } from "#functions/code-tester.js";
import { createBinaryTree, TreeNode } from "#functions/tree.js";

// LeetCode 102

const solve = function levelOrder(root: TreeNode | null): number[][] {
  if (!root) return [];

  const result: number[][] = [];
  const queue: TreeNode[] = [root];
  let pointer = 0;

  while (pointer < queue.length) {
    const levelSize = queue.length - pointer;
    const currentLevel: number[] = [];

    for (let i = 0; i < levelSize; i++) {
      const currentNode = queue[pointer++];
      currentLevel.push(currentNode.val);

      if (currentNode.left) queue.push(currentNode.left);
      if (currentNode.right) queue.push(currentNode.right);
    }

    result.push(currentLevel);
  }

  return result;
};

runTests(
  solve,
  [
    {
      input: [createBinaryTree([1, 2, 3, 4, 5, 6, 7])],
      output: [[1], [2, 3], [4, 5, 6, 7]],
    },
    {
      input: [createBinaryTree([1])],
      output: [[1]],
    },
    {
      input: [createBinaryTree([])],
      output: [],
    },
  ],
  { visualizeInput: true },
);
