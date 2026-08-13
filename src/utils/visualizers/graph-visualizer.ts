import chalk from "chalk";
import { GraphNode } from "#ds/graph.js";

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

  // If _allNodes is present (set by createGraph from an adjacency map), seed
  // the BFS from every node so disconnected components are fully discovered.
  const seedNodes: GraphNode[] = node._allNodes
    ? Array.from(node._allNodes.values())
    : [node];

  const queue: GraphNode[] = [];
  for (const seed of seedNodes) {
    if (!visited.has(seed)) {
      visited.add(seed);
      queue.push(seed);
    }
  }

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

export function render2DGraphLayout(graph: NormalizedGraph): string | null {
  const nodeVals = Array.from(graph.nodes.keys()).sort((a, b) => a - b);
  const n = nodeVals.length;

  if (n < 2 || n > 6) return null;
  if (graph.isWeighted) return null;
  if (graph.components.length > 1) return null;

  const valStr = (v: number) => chalk.cyan(`(${v})`);

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

  if (n === 3) {
    const [v0, v1, v2] = nodeVals;
    const isTriangle = graph.edgeCount >= 3;
    if (isTriangle) {
      return (
        `    ${valStr(v0)}\n` +
        `   ${chalk.gray("╱")}   ${chalk.gray("╲")}\n` +
        `${valStr(v1)} ${chalk.gray("──")} ${valStr(v2)}`
      );
    }

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

  if (n === 4) {
    const center = nodeVals.find(v => (graph.nodes.get(v)?.neighbors.length || 0) >= 3);
    if (center !== undefined) {
      const leaves = nodeVals.filter(v => v !== center);
      return (
        `    ${valStr(leaves[0])}\n` +
        `     ${chalk.gray("│")}\n` +
        `${valStr(leaves[1])} ${chalk.gray("─")} ${valStr(center)} ${chalk.gray("─")} ${valStr(leaves[2])}`
      );
    }

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

export function graphToString(node: GraphNode | null): string {
  if (!node) return chalk.gray("empty graph");
  const normalized = graphToNormalized(node);
  if (!normalized) return chalk.gray("empty graph");
  return normalizedGraphToString(normalized, "graph");
}

export function edgeListGraphToString(edges: number[][], name = "edges", numNodes?: number): string {
  const normalized = edgeListToNormalizedGraph(edges, numNodes);
  if (!normalized) return JSON.stringify(edges);
  return normalizedGraphToString(normalized, name);
}

// ---------------------------------------------------------------------------
// String-keyed edge list support
// For graphs like [["w","x"],["x","y"]] where node labels are strings.
// ---------------------------------------------------------------------------

export interface NormalizedStringGraphNode {
  val: string;
  neighbors: string[];
}

export interface NormalizedStringGraph {
  nodes: Map<string, NormalizedStringGraphNode>;
  isDirected: boolean;
  edgeCount: number;
  components: string[][];
}

export function edgeListStringToNormalizedGraph(edges: string[][]): NormalizedStringGraph | null {
  if (!Array.isArray(edges) || edges.length === 0) return null;

  const nodesMap = new Map<string, NormalizedStringGraphNode>();
  let rawEdgeCount = 0;

  const ensureNode = (val: string) => {
    if (!nodesMap.has(val)) nodesMap.set(val, { val, neighbors: [] });
    return nodesMap.get(val)!;
  };

  for (const row of edges) {
    if (!Array.isArray(row) || row.length < 2) continue;
    const u = String(row[0]);
    const v = String(row[1]);
    ensureNode(u);
    ensureNode(v);
    nodesMap.get(u)!.neighbors.push(v);
    rawEdgeCount++;
  }

  if (nodesMap.size === 0) return null;

  // Detect directed: if any edge u->v lacks back-edge v->u
  let isDirected = false;
  for (const [uVal, uNode] of nodesMap) {
    for (const vVal of uNode.neighbors) {
      const hasBack = nodesMap.get(vVal)?.neighbors.includes(uVal);
      if (!hasBack) { isDirected = true; break; }
    }
    if (isDirected) break;
  }

  // BFS for components
  const visited = new Set<string>();
  const components: string[][] = [];
  const sortedKeys = Array.from(nodesMap.keys()).sort();
  for (const start of sortedKeys) {
    if (visited.has(start)) continue;
    const comp: string[] = [];
    const queue = [start];
    visited.add(start);
    while (queue.length) {
      const curr = queue.shift()!;
      comp.push(curr);
      for (const nbr of nodesMap.get(curr)?.neighbors ?? []) {
        if (!visited.has(nbr)) { visited.add(nbr); queue.push(nbr); }
      }
    }
    comp.sort();
    components.push(comp);
  }

  return {
    nodes: nodesMap,
    isDirected,
    edgeCount: isDirected ? rawEdgeCount : Math.floor(rawEdgeCount / 2),
    components,
  };
}

export function edgeListStringGraphToString(edges: string[][], name = "edges"): string {
  const graph = edgeListStringToNormalizedGraph(edges);
  if (!graph) return JSON.stringify(edges);

  const vCount = graph.nodes.size;
  const badges: string[] = [`${vCount} nodes`];
  if (graph.components.length > 1) badges.push(`${graph.components.length} components`);
  const header = chalk.gray(`${name} (${badges.join(", ")}):`); 

  const connector = graph.isDirected ? chalk.gray(" ──► ") : chalk.gray(" ── ");
  const showCompHeader = graph.components.length > 1;
  const lines: string[] = [];

  for (let cIdx = 0; cIdx < graph.components.length; cIdx++) {
    const compVals = graph.components[cIdx];
    if (showCompHeader) lines.push(chalk.gray(`Component #${cIdx + 1}:`));
    for (const val of compVals) {
      const node = graph.nodes.get(val);
      if (!node) continue;
      const indent = showCompHeader ? "  " : "";
      const nbrStrs = node.neighbors.map(n => chalk.yellow(n)).join(", ");
      lines.push(`${indent}${chalk.cyan(node.val)}${connector}${chalk.gray("[")}${nbrStrs}${chalk.gray("]")}`); 
    }
  }

  return `${header}\n${lines.join("\n")}`;
}

/**
 * Returns true if the value looks like a string edge list: string[][].
 */
export function isStringEdgeList(value: unknown): value is string[][] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every(
      row =>
        Array.isArray(row) &&
        (row.length === 2 || row.length === 3) &&
        typeof row[0] === "string" &&
        typeof row[1] === "string"
    )
  );
}

/**
 * Returns true if the value looks like an adjacency map: Record<string|number, (string|number)[]>.
 * Heuristic: plain object (not array, not class instance) whose every value is an array.
 */
export function isAdjacencyMap(value: unknown): value is Record<string, (string | number)[]> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  if (Object.getPrototypeOf(value) !== Object.prototype) return false; // reject class instances
  const vals = Object.values(value as object);
  if (vals.length === 0) return false; // empty object — ambiguous, skip
  return vals.every(v => Array.isArray(v));
}

/**
 * Renders an adjacency map (Record<string, string[]>) as a graph visualization.
 * Normalizes all keys and neighbor values to strings for the string graph pipeline.
 */
export function adjMapToString(map: Record<string, (string | number)[]>, name = "graph"): string {
  // Convert to string[][] edge list (one entry per directed edge in the map)
  // Then feed into the string graph normalizer which handles directed detection & components.
  const nodesMap = new Map<string, NormalizedStringGraphNode>();

  const ensureNode = (val: string) => {
    if (!nodesMap.has(val)) nodesMap.set(val, { val, neighbors: [] });
    return nodesMap.get(val)!;
  };

  for (const [key, neighbors] of Object.entries(map)) {
    ensureNode(key);
    for (const nbr of neighbors) {
      const nbrStr = String(nbr);
      ensureNode(nbrStr);
      nodesMap.get(key)!.neighbors.push(nbrStr);
    }
  }

  if (nodesMap.size === 0) return chalk.gray(`${name}: (empty)`);

  let isDirected = false;
  let rawEdgeCount = 0;
  for (const [uVal, uNode] of nodesMap) {
    for (const vVal of uNode.neighbors) {
      rawEdgeCount++;
      const hasBack = nodesMap.get(vVal)?.neighbors.includes(uVal);
      if (!hasBack) { isDirected = true; }
    }
  }

  const visited = new Set<string>();
  const components: string[][] = [];
  const sortedKeys = Array.from(nodesMap.keys()).sort();
  for (const start of sortedKeys) {
    if (visited.has(start)) continue;
    const comp: string[] = [];
    const queue = [start];
    visited.add(start);
    while (queue.length) {
      const curr = queue.shift()!;
      comp.push(curr);
      // traverse both explicit neighbors AND back-edges for undirected traversal
      for (const nbr of nodesMap.get(curr)?.neighbors ?? []) {
        if (!visited.has(nbr)) { visited.add(nbr); queue.push(nbr); }
      }
    }
    comp.sort();
    components.push(comp);
  }

  const graph: NormalizedStringGraph = {
    nodes: nodesMap,
    isDirected,
    edgeCount: isDirected ? rawEdgeCount : Math.floor(rawEdgeCount / 2),
    components,
  };

  const vCount = graph.nodes.size;
  const badges: string[] = [`${vCount} nodes`];
  if (graph.components.length > 1) badges.push(`${graph.components.length} components`);
  const header = chalk.gray(`${name} (${badges.join(", ")}):`); 

  const connector = graph.isDirected ? chalk.gray(" ──► ") : chalk.gray(" ── ");
  const showCompHeader = graph.components.length > 1;
  const lines: string[] = [];

  for (let cIdx = 0; cIdx < graph.components.length; cIdx++) {
    const compVals = graph.components[cIdx];
    if (showCompHeader) lines.push(chalk.gray(`Component #${cIdx + 1}:`));
    for (const val of compVals) {
      const node = graph.nodes.get(val);
      if (!node) continue;
      const indent = showCompHeader ? "  " : "";
      const nbrStrs = node.neighbors.map(n => chalk.yellow(n)).join(", ");
      lines.push(`${indent}${chalk.cyan(node.val)}${connector}${chalk.gray("[")}${nbrStrs}${chalk.gray("]")}`); 
    }
  }

  return `${header}\n${lines.join("\n")}`;
}

export function isEdgeListParam(pName: string, matrix: any[][]): boolean {
  if (!Array.isArray(matrix) || matrix.length === 0) return false;

  const edgeParamRegex = /edge|prereq|flight|time|connection|adj/i;
  const gridParamRegex = /grid|board|matrix|table/i;

  if (gridParamRegex.test(pName)) return false;
  if (edgeParamRegex.test(pName)) return true;

  const allRowsAreEdges = matrix.every(
    row =>
      Array.isArray(row) &&
      (row.length === 2 || row.length === 3) &&
      ((typeof row[0] === "number" && typeof row[1] === "number") ||
       (typeof row[0] === "string" && typeof row[1] === "string"))
  );

  return allRowsAreEdges;
}
