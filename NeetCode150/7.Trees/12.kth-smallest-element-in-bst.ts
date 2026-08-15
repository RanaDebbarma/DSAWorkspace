import { runTests } from "#functions/code-tester.js";
import { createBinaryTree, TreeNode } from "#ds/tree.js";

// LeetCode 230

// o(n) time and o(h + k) space --------- Reccursive
// function kthSmallest(root: TreeNode | null, k: number): number {
//   const inorder: number[] = [];
//   dfs(root);

//   return inorder[k - 1];

//   function dfs(node: TreeNode | null): void {
//     if (!node || inorder.length >= k) return;

//     dfs(node.left);
//     inorder.push(node.val);
//     dfs(node.right);
//   }
// }

// o(h + k) time and o(h) space ------ iterative
function kthSmallest(root: TreeNode | null, k: number): number {
  const stack: TreeNode[] = [];
  let curr = root;

  while (curr || stack.length) {
    while (curr) {
      stack.push(curr);
      curr = curr.left;
    }

    curr = stack.pop()!;
    k--;
    if (k === 0) return curr.val;

    curr = curr.right;
  }

  return -1;
}

runTests(kthSmallest, [
  // NeetCode
  { input: [createBinaryTree([2, 1, 3]), 1], output: 1 },
  { input: [createBinaryTree([4, 3, 5, 2, null]), 4], output: 5 },

  // LeetCode
  { input: [createBinaryTree([3, 1, 4, null, 2]), 1], output: 1 },
  { input: [createBinaryTree([5, 3, 6, 2, 4, null, null, 1]), 3], output: 3 },
]);
