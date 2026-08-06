import { runTests } from "#functions/code-tester.js";
import { createBinaryTree, TreeNode } from "#functions/tree.js";

// LeetCode 98

const solve = function isValidBST(root: TreeNode | null): boolean {
  if (!root) return true;

  const stack: { node: TreeNode; min: number | null; max: number | null }[] = [
    { node: root, min: null, max: null },
  ];

  while (stack.length) {
    const { node, min, max } = stack.pop()!;

    if (min !== null && node.val <= min) return false;
    if (max !== null && node.val >= max) return false;

    if (node.left) {
      stack.push({ node: node.left, min, max: node.val });
    }
    if (node.right) {
      stack.push({ node: node.right, min: node.val, max });
    }
  }

  return true;
};

// inorder approach
function isValidBST(root: TreeNode | null): boolean {
  const stack: TreeNode[] = [];
  let current: TreeNode | null = root;
  let prevVal: number | null = null;
  
  while (current !== null || stack.length) {
    while(current !== null) {
      stack.push(current);
      current = current.left;
    }

    current = stack.pop()!;

    // In-order values must be striclty increasing
    if (prevVal !== null && current.val <= prevVal) {
      return false;
    }

    prevVal = current.val;
    current = current.right;
  }

  return true;
}

runTests(
  solve,
  [
    {
      input: [createBinaryTree([2, 1, 3])],
      output: true,
    },
    {
      input: [createBinaryTree([5, 1, 4, null, null, 3, 6])],
      output: false,
    },
  ],
  { visualizeInput: true },
);

runTests(
  isValidBST,
  [
    {
      input: [createBinaryTree([2, 1, 3])],
      output: true,
    },
    {
      input: [createBinaryTree([5, 1, 4, null, null, 3, 6])],
      output: false,
    },
  ],
  { visualizeInput: true },
);
