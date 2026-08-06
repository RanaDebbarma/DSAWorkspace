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

/**
 * Renders a binary tree top-down using inorder rank for column positions,
 * supporting dynamic cell widths for node highlights (e.g. [p], [q]) with perfect alignment.
 */
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

/**
 * Colors a matrix cell based on its raw value type and common DSA semantics.
 *
 * Priority order:
 *   null / undefined  → dim gray        (absent / missing)
 *   boolean true      → bold mint green (positive / pass)
 *   boolean false     → bold warm red   (negative / fail)
 *   number < 0        → warm red        (negative value)
 *   number === 0      → muted gray      (zero / neutral)
 *   number > 0        → cyan            (positive value)
 *   "."               → faint gray      (empty placeholder)
 *   "#"               → coral red       (wall / obstacle)
 *   "*"               → amber           (path / visited marker)
 *   "0"               → light blue      (string-zero, e.g. water)
 *   "1"               → mint green      (string-one, e.g. land)
 *   "X" / "x"         → warm red        (blocked / invalid)
 *   "S"               → bold teal       (start node)
 *   "E"               → bold pink       (end node)
 *   other single char → light gold      (generic marker)
 *   multi-char string → white           (label / general)
 */
function colorMatrixCell(val: any, str: string): string {
  if (val === null || val === undefined) return chalk.dim(str);

  if (typeof val === "boolean") {
    return val
      ? chalk.bold.hex("#55efc4")(str)   // true  → mint green
      : chalk.bold.hex("#ff7675")(str);  // false → warm red
  }

  if (typeof val === "number") {
    if (val < 0)   return chalk.hex("#ff7675")(str);  // negative → warm red
    if (val === 0) return chalk.hex("#636e72")(str);  // zero     → muted gray
    return chalk.cyan(str);                            // positive → cyan
  }

  if (typeof val === "string") {
    switch (val) {
      case ".":  return chalk.hex("#555f6e")(str);          // empty placeholder → dark gray
      case "#":  return chalk.hex("#e17055")(str);          // wall / obstacle   → coral red
      case "*":  return chalk.hex("#fdcb6e")(str);          // path / visited    → amber
      case "0":  return chalk.hex("#74b9ff")(str);          // string zero       → light blue
      case "1":  return chalk.hex("#55efc4")(str);          // string one        → mint green
      case "X":
      case "x":  return chalk.hex("#ff7675")(str);          // blocked / invalid → warm red
      case "S":  return chalk.bold.hex("#00cec9")(str);     // start node        → teal
      case "E":  return chalk.bold.hex("#fd79a8")(str);     // end node          → pink
      default:
        if (val.length === 1) return chalk.hex("#ffeaa7")(str); // single char  → light gold
        return chalk.white(str);                               // multi-char     → white
    }
  }

  return chalk.white(str);
}

/**
 * Visualizes a 2D array / matrix grid as an aligned ASCII table.
 */
export function matrixToString(matrix: any[][]): string {
  if (!Array.isArray(matrix) || matrix.length === 0) return "[]";
  if (!Array.isArray(matrix[0])) return JSON.stringify(matrix);

  const rows = matrix.length;
  const cols = Math.max(...matrix.map((r) => (Array.isArray(r) ? r.length : 0)));
  if (cols === 0) return "[]";

  const colWidths = Array(cols).fill(1);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const valStr = String(matrix[r]?.[c] ?? "");
      colWidths[c] = Math.max(colWidths[c], valStr.length);
    }
  }

  const topBorder = "┌" + colWidths.map((w) => "─".repeat(w + 2)).join("┬") + "┐";
  const midBorder = "├" + colWidths.map((w) => "─".repeat(w + 2)).join("┼") + "┤";
  const botBorder = "└" + colWidths.map((w) => "─".repeat(w + 2)).join("┴") + "┘";

  const lines: string[] = [chalk.gray(topBorder)];

  for (let r = 0; r < rows; r++) {
    const cells = [];
    for (let c = 0; c < cols; c++) {
      const rawVal = matrix[r]?.[c];
      const valStr = String(rawVal ?? "").padStart(colWidths[c]);
      cells.push(` ${colorMatrixCell(rawVal, valStr)} `);
    }
    lines.push(chalk.gray("│") + cells.join(chalk.gray("│")) + chalk.gray("│"));
    if (r < rows - 1) {
      lines.push(chalk.gray(midBorder));
    }
  }

  lines.push(chalk.gray(botBorder));
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
