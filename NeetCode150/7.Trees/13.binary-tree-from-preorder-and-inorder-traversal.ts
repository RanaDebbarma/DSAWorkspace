import { runTests } from "#functions/code-tester.js";
import { createBinaryTree, TreeNode } from "#ds/tree.js";

// LeetCode 105

// o(n) time and space
function buildTree(preorder: number[], inorder: number[]): TreeNode | null {
  // Map each value to its index in inorder for O(1) lookup.
  const inorderIndex = new Map<number, number>();

  for (let i = 0; i < inorder.length; i++) {
    inorderIndex.set(inorder[i], i);
  }

  let preorderIndex = 0;

  return buildSubtree(0, inorder.length - 1);

  function buildSubtree(
    inorderLeft: number,
    inorderRight: number,
  ): TreeNode | null {
    // No nodes in this subtree.
    if (inorderLeft > inorderRight) return null;

    // Preorder gives the root before its children.
    const rootValue = preorder[preorderIndex++];
    const root = new TreeNode(rootValue);

    // Inorder tells us where to split left and right subtrees.
    const rootIndex = inorderIndex.get(rootValue)!;

    root.left = buildSubtree(inorderLeft, rootIndex - 1);
    root.right = buildSubtree(rootIndex + 1, inorderRight);

    return root;
  }
}

runTests(buildTree, [
  {
    input: [
      [1, 2, 3, 4],
      [2, 1, 3, 4],
    ],
    output: createBinaryTree([1, 2, 3, null, null, null, 4]),
  },
  { input: [[1], [1]], output: createBinaryTree([1]) },
  {
    input: [
      [3, 9, 20, 15, 7],
      [9, 3, 15, 20, 7],
    ],
    output: createBinaryTree([3, 9, 20, null, null, 15, 7]),
  },

  // Edge
  {
    input: [
      [1, 2, 4, 5, 8, 3, 6, 7, 9],
      [4, 2, 8, 5, 1, 6, 3, 9, 7],
    ],
    output: createBinaryTree([
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      null,
      null,
      8,
      null,
      null,
      null,
      9,
      null,
    ]),
  },
]);
