import chalk from "chalk";
import { ListNode, linkedListToString } from "#functions/linked-list.js";
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
 * Automatically serializes ListNodes, TreeNodes, and GraphNodes.
 */
export function formatValue(value: unknown): unknown {
  if (value === null || value === undefined) {
    return value;
  }

  if (value instanceof ListNode) {
    return linkedListToString(value);
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
 * Like formatValue but always returns a printable string (for inline display).
 */
export function serializeForDisplay(value: unknown): string {
  if (value === null || value === undefined) return String(value);

  if (value instanceof ListNode)  return linkedListToString(value);
  if (value instanceof TreeNode)  return JSON.stringify(binaryTreeToArray(value));
  if (value instanceof GraphNode) return JSON.stringify(graphToAdjList(value));

  if (typeof value === "string") return `"${value}"`;

  return JSON.stringify(formatValue(value)) ?? String(value);
}

/**
 * Draws a visual divider in the console.
 */
export function drawDivider(char = "─", colorFn = chalk.gray) {
  const width = process.stdout.columns || 80;
  const line = char.repeat(width);
  console.log(colorFn(line));
}
