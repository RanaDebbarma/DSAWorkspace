import { runTests } from "#functions/code-tester.js";
import { createBinaryTree, TreeNode } from "#ds/tree.js";

// LeetCode 297

function serialize(root: TreeNode | null): string {
  return "";
}

function deserialize(data: string): TreeNode | null {
  return null;
}

function serializeAndDeserializeBT(root: TreeNode | null): TreeNode | null {
  const serialized = serialize(root);
  return deserialize(serialized);
}

runTests(serializeAndDeserializeBT, [
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
], {showHint: false});
