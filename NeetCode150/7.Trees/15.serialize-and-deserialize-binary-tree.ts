import { runTests } from "#functions/code-tester.js";
import { createBinaryTree, TreeNode } from "#ds/tree.js";

// LeetCode 297

function serialize(root: TreeNode | null): string {
  const arr: (number | null)[] = [];

  dfs(root);

  return JSON.stringify(arr);

  function dfs(node: TreeNode | null) {
    if (!node) {
      arr.push(null);
      return;
    }

    arr.push(node.val);

    dfs(node.left);
    dfs(node.right);
  }
}

function deserialize(data: string): TreeNode | null {
  const arr = JSON.parse(data);
  let i = 0;

  return build();

  function build(): TreeNode | null {
    const val = arr[i];
    i++;

    if (val === null) return null;

    const node = new TreeNode(val);

    node.left = build();
    node.right = build();

    return node;
  }
}

function serializeAndDeserializeBT(root: TreeNode | null): TreeNode | null {
  const serialized = serialize(root);
  return deserialize(serialized);
}

runTests(
  serializeAndDeserializeBT,
  [
    {
      input: [createBinaryTree([1, 2, 3, null, null, 4, 5])],
      output: createBinaryTree([1, 2, 3, null, null, 4, 5]),
    },
    {
      input: [createBinaryTree([])],
      output: createBinaryTree([]),
    },
    {
      input: [createBinaryTree([1])],
      output: createBinaryTree([1]),
    },
    {
      input: [createBinaryTree([1, 2])],
      output: createBinaryTree([1, 2]),
    },
  ],
  { showHint: false },
);
