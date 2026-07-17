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
 */
export function treeToString(root: TreeNode | null): string {
  if (!root) return chalk.gray("empty tree");

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
  if (value instanceof TreeNode)  return treeToString(value);
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
