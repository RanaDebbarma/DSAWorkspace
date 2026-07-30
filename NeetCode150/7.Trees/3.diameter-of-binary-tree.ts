import { runTests } from "#functions/code-tester.js";
import { createBinaryTree, TreeNode } from "#functions/tree.js";

// LeetCode 543

// o(n^2) time and o(n) space complexity
// const solve = function diameterOfBinaryTree(root: TreeNode | null): number {
//   if (!root) return 0;

//   let diameter = 0;
//   const stack: TreeNode[] = [root];

//   while (stack.length) {
//     const currentNode = stack.pop()!;

//     diameter = Math.max(diameter, diameterOfSubTree(currentNode));

//     if (currentNode.left) stack.push(currentNode.left);
//     if (currentNode.right) stack.push(currentNode.right);
//   }

//   return diameter;

//   function diameterOfSubTree(node: TreeNode | null) {
//     if (!node) return 0;
//     return height(node.left) + height(node.right);
//   }

//   function height(node: TreeNode | null): number {
//     if (!node) return 0;
//     return 1 + Math.max(height(node.left), height(node.right));
//   }
// };

// o(n) time and space complexity
const solve = function diameterOfBinaryTree(root: TreeNode | null): number {
  let diameter = 0;

  dfs(root);
  return diameter;

  function dfs(node: TreeNode | null): number {
    if (!node) return 0;

    const left = dfs(node.left);
    const right = dfs(node.right);

    diameter = Math.max(diameter, left + right);

    return 1 + Math.max(left, right);
  }
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
