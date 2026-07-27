import chalk from "chalk";
import { ListNode, linkedListToString, Node, randomListToArray } from "#functions/linked-list.js";
import { TreeNode, binaryTreeToArray } from "#functions/tree.js";
import { GraphNode, graphToAdjList } from "#functions/graph.js";

/**
 * Extracts the parameter names of a function at runtime.
 */
export function getParamNames(fn: Function): string[] {
  const fnStr = fn.toString().replace(/[\r\n\s]+/g, " ").trim();
  
  let paramsStr = "";
  // Check for parenthesis signature (regular functions, async functions, arrow functions)
  const parenMatch = fnStr.match(/^(?:async\s+)?(?:function\s*[^(]*\s*)?\(([^)]*)\)/);
  if (parenMatch) {
    paramsStr = parenMatch[1];
  } else {
    // Arrow function without parenthesis: x => ...
    const arrowMatch = fnStr.match(/^([^=]+)=>/);
    if (arrowMatch) {
      paramsStr = arrowMatch[1].trim();
    }
  }

  if (!paramsStr.trim()) return [];

  return paramsStr
    .split(",")
    .map((p) => {
      // Remove default assignments (e.g. x = 1 ➔ x)
      let name = p.split("=")[0].trim();
      // Remove comments
      name = name.replace(/\/\*.*?\*\//g, "").trim();
      return name;
    })
    .filter((p) => p !== "");
}

/**
 * Formats a value recursively into a clean, human-readable JSON/string format.
 * Automatically serializes ListNodes, TreeNodes, and GraphNodes as arrays/strings.
 */
export function formatValue(value: unknown): unknown {
  if (value === null || value === undefined) {
    return value;
  }

  if (value instanceof ListNode) {
    return linkedListToString(value);
  }

  if (value instanceof Node) {
    return randomListToArray(value);
  }

  if (value instanceof TreeNode) {
    return binaryTreeToArray(value);
  }

  if (value instanceof GraphNode) {
    return graphToAdjList(value);
  }

  if (Array.isArray(value)) {
    return value.map(formatValue);
  }

  return value;
}

/**
 * Visualizes a binary tree using a rotated, clean, vertical ASCII structure.
 * @param vertical - If true, renders the tree top-down (BFS layout) instead of the default sideways view.
 */
export function treeToString(root: TreeNode | null, vertical = false): string {
  if (!root) return chalk.gray("empty tree");

  if (vertical) {
    return treeToStringVertical(root);
  }

  const lines: string[] = [];

  function buildLines(node: TreeNode | null, prefix: string, isLeft: boolean | null) {
    if (!node) return;

    // Traverse right first (will appear at the top of the tree representation)
    if (node.right) {
      buildLines(
        node.right,
        prefix + (isLeft === true ? chalk.gray("│   ") : "    "),
        false
      );
    }

    // Node itself
    let nodeStr = prefix;
    if (isLeft === null) {
      nodeStr += `── ${chalk.cyan(node.val)}`;
    } else if (isLeft) {
      nodeStr += `${chalk.gray("└──")} ${chalk.cyan(node.val)}`;
    } else {
      nodeStr += `${chalk.gray("┌──")} ${chalk.cyan(node.val)}`;
    }
    lines.push(nodeStr);

    // Traverse left
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

/**
 * Renders a binary tree top-down using inorder rank for column positions,
 * so no two nodes overlap. Branch rows use ┌─┘ / └─┐ connectors.
 */
function treeToStringVertical(root: TreeNode): string {
  // Step 1: Assign each node an inorder rank (0-based) — this is its column position
  const colMap = new Map<TreeNode, number>();
  let counter = 0;
  function assignCols(node: TreeNode | null) {
    if (!node) return;
    assignCols(node.left);
    colMap.set(node, counter++);
    assignCols(node.right);
  }
  assignCols(root);

  // Step 2: BFS to collect levels
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

  const totalCols = counter;
  const cellWidth = 3;
  const totalWidth = totalCols * cellWidth;

  const getCenter = (node: TreeNode) => colMap.get(node)! * cellWidth + Math.floor(cellWidth / 2);

  const outputLines: string[] = [];

  for (let d = 0; d < levels.length; d++) {
    const level = levels[d];
    const nodeChars = Array(totalWidth).fill(" ");
    const branchChars = Array(totalWidth).fill(" ");

    for (const { node, parent, isLeft } of level) {
      const pos = getCenter(node);
      const valStr = String(node.val);
      // Center the value label around pos
      const start = pos - Math.floor(valStr.length / 2);
      for (let i = 0; i < valStr.length; i++) {
        if (start + i >= 0 && start + i < totalWidth) {
          nodeChars[start + i] = valStr[i];
        }
      }

      // Draw branch from this node up to parent
      if (parent !== null) {
        const parentPos = getCenter(parent);
        if (isLeft) {
          // Left child: this node opens to the right toward parent
          // pos gets ┌, everything between gets ─, parent col gets ┘ (or ┴ if right sibling also draws here)
          branchChars[pos] = "┌";
          for (let p = pos + 1; p < parentPos; p++) branchChars[p] = "─";
          // Merge at parent col: if right child already placed └ here, upgrade to ┴
          branchChars[parentPos] = branchChars[parentPos] === "└" ? "┴" : "┘";
        } else {
          // Right child: parent col gets └ (or ┴ if left sibling already placed ┘ there)
          branchChars[parentPos] = branchChars[parentPos] === "┘" ? "┴" : "└";
          for (let p = parentPos + 1; p < pos; p++) branchChars[p] = "─";
          branchChars[pos] = "┐";
        }
      }
    }

    if (d > 0) {
      outputLines.push(chalk.gray(branchChars.join("").trimEnd()));
    }
    outputLines.push(chalk.cyan(nodeChars.join("").trimEnd()));
  }

  return outputLines.join("\n");
}

/**
 * Helper to dynamically detect if a graph is undirected (all edges are bidirectional).
 */
function isUndirected(nodes: GraphNode[]): boolean {
  for (const u of nodes) {
    for (const v of u.neighbors) {
      const hasBackEdge = v.neighbors.some(neighbor => neighbor.val === u.val);
      if (!hasBackEdge) {
        return false; // found a directed/unidirectional edge
      }
    }
  }
  return true;
}

/**
 * Visualizes a graph using a structured table mapping each node to neighbors.
 */
export function graphToString(node: GraphNode | null): string {
  if (!node) return chalk.gray("empty graph");

  // Collect all reachable nodes via BFS
  const visited = new Set<number>();
  const nodes: GraphNode[] = [];
  const queue: GraphNode[] = [node];
  visited.add(node.val);

  while (queue.length > 0) {
    const curr = queue.shift()!;
    nodes.push(curr);
    for (const neighbor of curr.neighbors) {
      if (!visited.has(neighbor.val)) {
        visited.add(neighbor.val);
        queue.push(neighbor);
      }
    }
  }

  // Sort nodes by value for a stable visualization
  nodes.sort((a, b) => a.val - b.val);

  const undirected = isUndirected(nodes);
  const connector = undirected ? chalk.gray(" ── ") : chalk.gray(" ──► ");

  const lines = nodes.map(n => {
    const neighborsStr = n.neighbors.map(nbr => chalk.yellow(nbr.val)).join(", ");
    return `${chalk.cyan(n.val)}${connector}${chalk.gray("[")}${neighborsStr}${chalk.gray("]")}`;
  });

  return lines.join("\n");
}

/**
 * Indents all lines of a multiline string except the first, to align with console labels.
 */
export function padMultiline(str: string, indentSize: number): string {
  const lines = str.split("\n");
  if (lines.length <= 1) return str;
  const padding = " ".repeat(indentSize);
  return lines[0] + "\n" + lines.slice(1).map(line => padding + line).join("\n");
}

/**
 * Like formatValue but always returns a printable string (for inline display).
 * Uses visual structures for ListNodes, TreeNodes, and GraphNodes.
 */
export function serializeForDisplay(value: unknown): string {
  if (value === null || value === undefined) return String(value);

  if (value instanceof ListNode)  return linkedListToString(value);
  if (value instanceof TreeNode)  return treeToString(value, true);
  if (value instanceof GraphNode) return graphToString(value);

  if (typeof value === "string") return `"${value}"`;

  return JSON.stringify(formatValue(value)) ?? String(value);
}

/**
 * Draws a visual divider in the console.
 */
export function drawDivider(char = "─", colorFn = chalk.hex('#5d5d5d')) {
  const width = process.stdout.columns || 80;
  const line = char.repeat(width);
  console.log(colorFn(line));
}
