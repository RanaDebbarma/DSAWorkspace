import { runTests } from "#functions/code-tester.js";
import { createBinaryTree, TreeNode } from "#ds/tree.js";

// LeetCode 337

// function rob(root: TreeNode | null): number {
//   if (!root) return 0;

//   const res = dfs(root);

//   return Math.max(res[0], res[1]);

//   function dfs(node: TreeNode | null): [number, number] {
//     if (!node) return [0, 0];

//     const left = dfs(node.left);
//     const right = dfs(node.right);

//     const robCurrent = node.val + left[1] + right[1];
//     const skipCurrent =
//       Math.max(left[0], left[1]) + Math.max(right[0], right[1]);

//     return [robCurrent, skipCurrent];
//   }
// }

function rob(root: TreeNode | null): number {
  // Define a clear return type for our helper
  type Result = { rob: number; skip: number };

  function dfs(node: TreeNode | null): Result {
    if (!node) return { rob: 0, skip: 0 };

    const left = dfs(node.left);
    const right = dfs(node.right);

    // If we rob this node, we must skip its children
    const robCurrent = node.val + left.skip + right.skip;

    // If we skip this node, we take the best of rob/skip for each child independently
    const skipCurrent = 
      Math.max(left.rob, left.skip) + 
      Math.max(right.rob, right.skip);

    return { rob: robCurrent, skip: skipCurrent };
  }

  const result = dfs(root);
  return Math.max(result.rob, result.skip);
}

runTests(rob, [
  { input: [createBinaryTree([3, 2, 3, null, 3, null, 1])], output: 7 },
  { input: [createBinaryTree([3, 4, 5, 1, 3, null, 1])], output: 9 },
]);
