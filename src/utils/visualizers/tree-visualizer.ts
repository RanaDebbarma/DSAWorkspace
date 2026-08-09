import chalk from "chalk";
import { TreeNode } from "#functions/tree.js";

export type NodeHighlight = {
  label?: string;
  color?: (str: string) => string;
};

export type TreeHighlightMap = Map<TreeNode, NodeHighlight>;

export function containsTreeNode(root: TreeNode | null, target: TreeNode | null): boolean {
  if (!root || !target) return false;
  if (root === target) return true;
  return containsTreeNode(root.left, target) || containsTreeNode(root.right, target);
}

/**
 * Visualizes a binary tree using a rotated or vertical ASCII layout.
 * Supports highlighting target nodes (e.g. p, q in LCA).
 */
export function treeToString(
  root: TreeNode | null,
  vertical = true,
  highlights?: TreeHighlightMap
): string {
  if (!root) return chalk.gray("empty tree");

  if (vertical) {
    return treeToStringVertical(root, highlights);
  }

  const lines: string[] = [];

  function buildLines(node: TreeNode | null, prefix: string, isLeft: boolean | null) {
    if (!node) return;

    if (node.right) {
      buildLines(
        node.right,
        prefix + (isLeft === true ? chalk.gray("│   ") : "    "),
        false
      );
    }

    const hl = highlights?.get(node);
    const labelStr = `${node.val}${hl?.label ? ` [${hl.label}]` : ""}`;
    const coloredVal = hl?.color ? hl.color(labelStr) : chalk.cyan(labelStr);

    let nodeStr = prefix;
    if (isLeft === null) {
      nodeStr += `── ${coloredVal}`;
    } else if (isLeft) {
      nodeStr += `${chalk.gray("└──")} ${coloredVal}`;
    } else {
      nodeStr += `${chalk.gray("┌──")} ${coloredVal}`;
    }
    lines.push(nodeStr);

    if (node.left) {
      buildLines(
        node.left,
        prefix + (isLeft === false ? chalk.gray("│   ") : "    "),
        true
      );
    }
  }

  buildLines(root, "", null);
  return lines.join("\n");
}

function treeToStringVertical(root: TreeNode, highlights?: TreeHighlightMap): string {
  const colMap = new Map<TreeNode, number>();
  let counter = 0;
  function assignCols(node: TreeNode | null) {
    if (!node) return;
    assignCols(node.left);
    colMap.set(node, counter++);
    assignCols(node.right);
  }
  assignCols(root);

  type LevelNode = { node: TreeNode; parent: TreeNode | null; isLeft: boolean | null };
  const levels: LevelNode[][] = [];
  let queue: LevelNode[] = [{ node: root, parent: null, isLeft: null }];
  while (queue.length > 0) {
    levels.push(queue);
    const next: LevelNode[] = [];
    for (const { node } of queue) {
      if (node.left)  next.push({ node: node.left,  parent: node, isLeft: true });
      if (node.right) next.push({ node: node.right, parent: node, isLeft: false });
    }
    queue = next;
  }

  let maxLabelLen = 1;
  function findMaxLen(n: TreeNode | null) {
    if (!n) return;
    const hl = highlights?.get(n);
    const plain = `${n.val}${hl?.label ? ` [${hl.label}]` : ""}`;
    maxLabelLen = Math.max(maxLabelLen, plain.length);
    findMaxLen(n.left);
    findMaxLen(n.right);
  }
  findMaxLen(root);

  const cellWidth = Math.max(3, maxLabelLen + 2);
  const totalCols = counter;
  const totalWidth = totalCols * cellWidth;

  const getCenter = (node: TreeNode) => colMap.get(node)! * cellWidth + Math.floor(cellWidth / 2);

  const outputLines: string[] = [];

  for (let d = 0; d < levels.length; d++) {
    const level = levels[d];
    const branchChars = Array(totalWidth).fill(" ");

    type PlacedNode = { startPos: number; plainText: string; formattedText: string };
    const placedNodes: PlacedNode[] = [];

    for (const { node, parent, isLeft } of level) {
      const pos = getCenter(node);
      const hl = highlights?.get(node);
      const valStr = String(node.val);
      const tagStr = hl?.label ? ` [${hl.label}]` : "";

      const coloredVal = hl?.color ? hl.color(valStr) : chalk.cyan(valStr);
      const coloredTag = hl?.color ? hl.color(tagStr) : chalk.yellow(tagStr);

      const valStartPos = Math.max(0, pos - Math.floor(valStr.length / 2));
      const plainText = valStr + tagStr;
      const formattedText = coloredVal + coloredTag;

      placedNodes.push({ startPos: valStartPos, plainText, formattedText });

      if (parent !== null) {
        const parentPos = getCenter(parent);
        if (isLeft) {
          branchChars[pos] = "┌";
          for (let p = pos + 1; p < parentPos; p++) branchChars[p] = "─";
          branchChars[parentPos] = branchChars[parentPos] === "└" ? "┴" : "┘";
        } else {
          branchChars[parentPos] = branchChars[parentPos] === "┘" ? "┴" : "└";
          for (let p = parentPos + 1; p < pos; p++) branchChars[p] = "─";
          branchChars[pos] = "┐";
        }
      }
    }

    if (d > 0) {
      outputLines.push(chalk.gray(branchChars.join("").trimEnd()));
    }

    placedNodes.sort((a, b) => a.startPos - b.startPos);
    let nodeRow = "";
    let currentIdx = 0;
    for (const pn of placedNodes) {
      if (pn.startPos > currentIdx) {
        nodeRow += " ".repeat(pn.startPos - currentIdx);
        currentIdx = pn.startPos;
      }
      nodeRow += pn.formattedText;
      currentIdx += pn.plainText.length;
    }
    outputLines.push(nodeRow.trimEnd());
  }

  return outputLines.join("\n");
}
