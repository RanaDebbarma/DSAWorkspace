import chalk from "chalk";
import { ListNode, linkedListToString, Node, randomListToArray } from "#ds/linked-list.js";
import { TreeNode, binaryTreeToArray } from "#ds/tree.js";
import { GraphNode, graphToAdjList } from "#ds/graph.js";

import { treeToString } from "./visualizers/tree-visualizer.js";
import { graphToString, edgeListStringGraphToString, isStringEdgeList, isAdjacencyMap, adjMapToString } from "./visualizers/graph-visualizer.js";

export * from "./visualizers/tree-visualizer.js";
export * from "./visualizers/grid-visualizer.js";
export * from "./visualizers/graph-visualizer.js";

/**
 * Extracts the parameter names of a function at runtime.
 */
export function getParamNames(fn: Function): string[] {
  const fnStr = fn.toString().replace(/[\r\n\s]+/g, " ").trim();
  
  let paramsStr = "";
  const parenMatch = fnStr.match(/^(?:async\s+)?(?:function\s*[^(]*\s*)?\(([^)]*)\)/);
  if (parenMatch) {
    paramsStr = parenMatch[1];
  } else {
    const arrowMatch = fnStr.match(/^([^=]+)=>/);
    if (arrowMatch) {
      paramsStr = arrowMatch[1].trim();
    }
  }

  if (!paramsStr.trim()) return [];

  return paramsStr
    .split(",")
    .map((p) => {
      let name = p.split("=")[0].trim();
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
 * Indents all lines of a multiline string except the first, to align with console labels.
 */
export function padMultiline(str: string, indentSize: number): string {
  const lines = str.split("\n");
  if (lines.length <= 1) return str;
  const padding = " ".repeat(indentSize);
  return lines[0] + "\n" + lines.slice(1).map(line => padding + line).join("\n");
}

/**
 * Indents ALL lines of a multiline string (including the first) uniformly.
 * Use this for standalone block outputs (trees, grids) where all lines must stay column-aligned.
 */
export function indentAll(str: string, indentSize: number): string {
  const padding = " ".repeat(indentSize);
  return str.split("\n").map(line => padding + line).join("\n");
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

  // Render string edge lists (e.g. [["w","x"],["x","y"]]) as a graph visualization
  if (isStringEdgeList(value)) return edgeListStringGraphToString(value);

  // Render adjacency maps (e.g. { 0: ["8","1"], a: ["b","c"] }) as a graph visualization
  if (isAdjacencyMap(value)) return adjMapToString(value);
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
