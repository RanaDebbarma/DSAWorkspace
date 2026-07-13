export class TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;

  constructor(val = 0, left: TreeNode | null = null, right: TreeNode | null = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

/**
 * Creates a binary tree from a level-order (BFS) array representation.
 * Standard LeetCode format, e.g., [1, null, 2, 3] ➔ Tree.
 */
export function createBinaryTree(values: (number | null)[]): TreeNode | null {
  if (values.length === 0 || values[0] === null) return null;

  const root = new TreeNode(values[0]);
  const queue: TreeNode[] = [root];
  let i = 1;

  while (queue.length > 0 && i < values.length) {
    const curr = queue.shift()!;

    // Left child
    if (i < values.length) {
      const leftVal = values[i++];
      if (leftVal !== null) {
        curr.left = new TreeNode(leftVal);
        queue.push(curr.left);
      }
    }

    // Right child
    if (i < values.length) {
      const rightVal = values[i++];
      if (rightVal !== null) {
        curr.right = new TreeNode(rightVal);
        queue.push(curr.right);
      }
    }
  }

  return root;
}

/**
 * Serializes a binary tree to a level-order array representation, trimming trailing nulls.
 */
export function binaryTreeToArray(root: TreeNode | null): (number | null)[] {
  if (!root) return [];

  const result: (number | null)[] = [];
  const queue: (TreeNode | null)[] = [root];

  while (queue.length > 0) {
    const curr = queue.shift();
    if (curr) {
      result.push(curr.val);
      queue.push(curr.left);
      queue.push(curr.right);
    } else {
      result.push(null);
    }
  }

  // Trim trailing nulls to match LeetCode output style
  while (result.length > 0 && result[result.length - 1] === null) {
    result.pop();
  }

  return result;
}

/**
 * Deep clones a binary tree.
 */
export function cloneBinaryTree(root: TreeNode | null): TreeNode | null {
  if (!root) return null;

  const copy = new TreeNode(root.val);
  copy.left = cloneBinaryTree(root.left);
  copy.right = cloneBinaryTree(root.right);

  return copy;
}

/**
 * Compares two binary trees for structural identity and identical node values.
 */
export function compareBinaryTrees(a: TreeNode | null, b: TreeNode | null): boolean {
  if (!a && !b) return true;
  if (!a || !b) return false;

  return (
    a.val === b.val &&
    compareBinaryTrees(a.left, b.left) &&
    compareBinaryTrees(a.right, b.right)
  );
}
