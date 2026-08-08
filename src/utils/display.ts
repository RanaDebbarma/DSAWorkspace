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

export interface NormalizedGraphEdge {
  target: number;
  weight?: number;
}

export interface NormalizedGraphNode {
  val: number;
  neighbors: NormalizedGraphEdge[];
}

export interface NormalizedGraph {
  nodes: Map<number, NormalizedGraphNode>;
  isDirected: boolean;
  isWeighted: boolean;
  edgeCount: number;
  components: number[][];
}

export function graphToNormalized(node: GraphNode | null): NormalizedGraph | null {
  if (!node) return null;

  const visited = new Set<GraphNode>();
  const nodesMap = new Map<number, NormalizedGraphNode>();
  const queue: GraphNode[] = [node];
  visited.add(node);

  let rawEdgeCount = 0;

  while (queue.length > 0) {
    const curr = queue.shift()!;
    const neighbors: NormalizedGraphEdge[] = [];

    for (const nbr of curr.neighbors) {
      neighbors.push({ target: nbr.val });
      rawEdgeCount++;
      if (!visited.has(nbr)) {
        visited.add(nbr);
        queue.push(nbr);
      }
    }

    nodesMap.set(curr.val, { val: curr.val, neighbors });
  }

  // Check directedness
  let isDirected = false;
  for (const [uVal, uNode] of nodesMap) {
    for (const edge of uNode.neighbors) {
      const vNode = nodesMap.get(edge.target);
      const hasBack = vNode?.neighbors.some(e => e.target === uVal);
      if (!hasBack) {
        isDirected = true;
        break;
      }
    }
    if (isDirected) break;
  }

  const components = getGraphComponents(nodesMap);

  return {
    nodes: nodesMap,
    isDirected,
    isWeighted: false,
    edgeCount: isDirected ? rawEdgeCount : Math.floor(rawEdgeCount / 2),
    components,
  };
}

export function edgeListToNormalizedGraph(edges: number[][], numNodes?: number): NormalizedGraph | null {
  if (!Array.isArray(edges)) return null;

  const nodesMap = new Map<number, NormalizedGraphNode>();
  let isWeighted = false;
  let rawEdgeCount = 0;

  const ensureNode = (val: number) => {
    if (!nodesMap.has(val)) {
      nodesMap.set(val, { val, neighbors: [] });
    }
    return nodesMap.get(val)!;
  };

  for (const row of edges) {
    if (!Array.isArray(row) || row.length < 2) continue;
    const u = Number(row[0]);
    const v = Number(row[1]);
    if (isNaN(u) || isNaN(v)) return null;

    const w = row.length >= 3 && typeof row[2] === "number" ? row[2] : undefined;
    if (w !== undefined) isWeighted = true;

    ensureNode(u);
    ensureNode(v);

    const uNode = nodesMap.get(u)!;
    uNode.neighbors.push({ target: v, weight: w });
    rawEdgeCount++;
  }

  if (numNodes !== undefined && typeof numNodes === "number") {
    for (let i = 0; i < numNodes; i++) {
      ensureNode(i);
    }
  }

  if (nodesMap.size === 0) return null;

  // Check directedness
  let isDirected = false;
  for (const [uVal, uNode] of nodesMap) {
    for (const edge of uNode.neighbors) {
      const vNode = nodesMap.get(edge.target);
      const hasBack = vNode?.neighbors.some(e => e.target === uVal);
      if (!hasBack) {
        isDirected = true;
        break;
      }
    }
    if (isDirected) break;
  }

  const components = getGraphComponents(nodesMap);

  return {
    nodes: nodesMap,
    isDirected,
    isWeighted,
    edgeCount: isDirected ? rawEdgeCount : Math.floor(rawEdgeCount / 2),
    components,
  };
}

function getGraphComponents(nodesMap: Map<number, NormalizedGraphNode>): number[][] {
  const visited = new Set<number>();
  const components: number[][] = [];
  const sortedVals = Array.from(nodesMap.keys()).sort((a, b) => a - b);

  for (const val of sortedVals) {
    if (visited.has(val)) continue;

    const comp: number[] = [];
    const queue = [val];
    visited.add(val);

    while (queue.length > 0) {
      const curr = queue.shift()!;
      comp.push(curr);
      const node = nodesMap.get(curr);
      if (node) {
        for (const edge of node.neighbors) {
          if (!visited.has(edge.target)) {
            visited.add(edge.target);
            queue.push(edge.target);
          }
        }
      }
    }
    comp.sort((a, b) => a - b);
    components.push(comp);
  }

  return components;
}

/**
 * Generates 2D ASCII spatial box/ring layouts for small connected graphs (N <= 6).
 */
export function render2DGraphLayout(graph: NormalizedGraph): string | null {
  const nodeVals = Array.from(graph.nodes.keys()).sort((a, b) => a - b);
  const n = nodeVals.length;

  if (n < 2 || n > 6) return null;
  if (graph.isWeighted) return null; // Weighted graphs use list view for clear weight labels
  if (graph.components.length > 1) return null; // Disconnected graphs use grouped list view

  const valStr = (v: number) => chalk.cyan(`(${v})`);

  // N = 2: (0) ────── (1)
  if (n === 2) {
    const v0 = nodeVals[0];
    const v1 = nodeVals[1];
    const u0 = graph.nodes.get(v0);

    const has0to1 = u0?.neighbors.some(e => e.target === v1);
    const u1 = graph.nodes.get(v1);
    const has1to0 = u1?.neighbors.some(e => e.target === v0);

    let conn = chalk.gray(" ────── ");
    if (has0to1 && has1to0) conn = chalk.gray(" ◄─────► ");
    else if (has0to1) conn = chalk.gray(" ──────► ");
    else if (has1to0) conn = chalk.gray(" ◄────── ");

    return `${valStr(v0)}${conn}${valStr(v1)}`;
  }

  // N = 3: Triangle or Star/Path
  if (n === 3) {
    const [v0, v1, v2] = nodeVals;
    // Check if triangle (all 3 nodes connected to each other)
    const isTriangle = graph.edgeCount >= 3;
    if (isTriangle) {
      return (
        `    ${valStr(v0)}\n` +
        `   ${chalk.gray("╱")}   ${chalk.gray("╲")}\n` +
        `${valStr(v1)} ${chalk.gray("──")} ${valStr(v2)}`
      );
    }

    // Star or Path (find node with 2 neighbors)
    let center = nodeVals.find(v => (graph.nodes.get(v)?.neighbors.length || 0) >= 2);
    if (center !== undefined) {
      const leaves = nodeVals.filter(v => v !== center);
      return (
        `    ${valStr(leaves[0])}\n` +
        `     ${chalk.gray("│")}\n` +
        `${valStr(leaves[1])} ${chalk.gray("─")} ${valStr(center)}`
      );
    }
  }

  // N = 4: Cycle/Box or Star
  if (n === 4) {
    // Check Star (1 center connected to 3 leaves)
    const center = nodeVals.find(v => (graph.nodes.get(v)?.neighbors.length || 0) >= 3);
    if (center !== undefined) {
      const leaves = nodeVals.filter(v => v !== center);
      return (
        `    ${valStr(leaves[0])}\n` +
        `     ${chalk.gray("│")}\n` +
        `${valStr(leaves[1])} ${chalk.gray("─")} ${valStr(center)} ${chalk.gray("─")} ${valStr(leaves[2])}`
      );
    }

    // Cycle / 2x2 Box: (v0) ────── (v1)
    //                   │          │
    //                  (v3) ────── (v2)
    const [v0, v1, v2, v3] = nodeVals;
    return (
      `${valStr(v0)} ${chalk.gray("──────")} ${valStr(v1)}\n` +
      ` ${chalk.gray("│")}          ${chalk.gray("│")}\n` +
      ` ${chalk.gray("│")}          ${chalk.gray("│")}\n` +
      `${valStr(v3)} ${chalk.gray("──────")} ${valStr(v2)}`
    );
  }

  return null;
}

export function normalizedGraphToString(graph: NormalizedGraph, name = "graph"): string {
  const vCount = graph.nodes.size;
  const spatial2D = render2DGraphLayout(graph);

  if (spatial2D) {
    return `${chalk.gray(`${name}:`)}\n${spatial2D}`;
  }

  const badges: string[] = [`${vCount} nodes`];
  if (graph.isWeighted) badges.push("weighted");
  if (graph.components.length > 1) badges.push(`${graph.components.length} components`);

  const header = chalk.gray(`${name} (${badges.join(", ")}):`);

  const lines: string[] = [];
  const showCompHeader = graph.components.length > 1;

  for (let cIdx = 0; cIdx < graph.components.length; cIdx++) {
    const compVals = graph.components[cIdx];
    if (showCompHeader) {
      lines.push(chalk.gray(`Component #${cIdx + 1}:`));
    }

    for (const val of compVals) {
      const node = graph.nodes.get(val);
      if (!node) continue;

      const connector = graph.isDirected ? chalk.gray(" ──► ") : chalk.gray(" ── ");
      const nbrStrs = node.neighbors.map(edge => {
        const wStr = edge.weight !== undefined ? chalk.gray(`(w=${edge.weight}) `) : "";
        return `${wStr}${chalk.yellow(edge.target)}`;
      }).join(", ");

      const indent = showCompHeader ? "  " : "";
      lines.push(`${indent}${chalk.cyan(node.val)}${connector}${chalk.gray("[")}${nbrStrs}${chalk.gray("]")}`);
    }
  }

  return `${header}\n${lines.join("\n")}`;
}

/**
 * Visualizes a GraphNode object.
 */
export function graphToString(node: GraphNode | null): string {
  if (!node) return chalk.gray("empty graph");
  const normalized = graphToNormalized(node);
  if (!normalized) return chalk.gray("empty graph");
  return normalizedGraphToString(normalized, "graph");
}

/**
 * Visualizes an edge list array (e.g. [[0,1],[1,2],[2,0]]).
 */
export function edgeListGraphToString(edges: number[][], name = "edges", numNodes?: number): string {
  const normalized = edgeListToNormalizedGraph(edges, numNodes);
  if (!normalized) return JSON.stringify(edges);
  return normalizedGraphToString(normalized, name);
}

/**
 * Heuristic to detect if a 2D array is a graph edge list vs a 2D matrix grid.
 */
export function isEdgeListParam(pName: string, matrix: any[][]): boolean {
  if (!Array.isArray(matrix) || matrix.length === 0) return false;

  const edgeParamRegex = /edge|prereq|flight|time|connection|adj/i;
  const gridParamRegex = /grid|board|matrix|table/i;

  if (gridParamRegex.test(pName)) return false;
  if (edgeParamRegex.test(pName)) return true;

  // Check row structure: if all rows are [u, v] or [u, v, w] with numbers
  const allRowsAreEdges = matrix.every(
    row => Array.isArray(row) && (row.length === 2 || row.length === 3) && typeof row[0] === "number" && typeof row[1] === "number"
  );

  return allRowsAreEdges;
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
