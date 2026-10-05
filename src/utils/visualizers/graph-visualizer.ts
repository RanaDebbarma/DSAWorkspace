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

export function graphToNormalized(node: GraphNode | null, isDirectedOverride?: boolean): NormalizedGraph | null {
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
  if (typeof isDirectedOverride === "boolean") {
    isDirected = isDirectedOverride;
  } else {
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

export function edgeListToNormalizedGraph(
  edges: number[][],
  numNodes?: number,
  isDirectedOverride?: boolean,
  reverseEdges?: boolean,
): NormalizedGraph | null {
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

  const isDirected = typeof isDirectedOverride === "boolean" ? isDirectedOverride : false;

  for (const row of edges) {
    if (!Array.isArray(row) || row.length < 2) continue;
    const rawU = Number(row[0]);
    const rawV = Number(row[1]);
    if (isNaN(rawU) || isNaN(rawV)) return null;
    const u = reverseEdges ? rawV : rawU;
    const v = reverseEdges ? rawU : rawV;

    const w = row.length >= 3 && typeof row[2] === "number" ? row[2] : undefined;
    if (w !== undefined) isWeighted = true;

    ensureNode(u);
    ensureNode(v);

    const uNode = nodesMap.get(u)!;
    if (!uNode.neighbors.some(e => e.target === v)) {
      uNode.neighbors.push({ target: v, weight: w });
    }

    if (!isDirected) {
      const vNode = nodesMap.get(v)!;
      if (!vNode.neighbors.some(e => e.target === u)) {
        vNode.neighbors.push({ target: u, weight: w });
      }
    }
    rawEdgeCount++;
  }

  if (numNodes !== undefined && typeof numNodes === "number") {
    for (let i = 0; i < numNodes; i++) {
      ensureNode(i);
    }
  }

  if (nodesMap.size === 0) return null;

  const components = getGraphComponents(nodesMap);

  return {
    nodes: nodesMap,
    isDirected,
    isWeighted,
    edgeCount: rawEdgeCount,
    components,
  };
}

function getGraphComponents(nodesMap: Map<number, NormalizedGraphNode>): number[][] {
  const visited = new Set<number>();
  const components: number[][] = [];
  const sortedVals = Array.from(nodesMap.keys()).sort((a, b) => a - b);

  // Build undirected adjacency so connected components represent weakly connected components
  const undirectedAdj = new Map<number, Set<number>>();
  for (const [val, node] of nodesMap) {
    if (!undirectedAdj.has(val)) undirectedAdj.set(val, new Set());
    for (const edge of node.neighbors) {
      undirectedAdj.get(val)!.add(edge.target);
      if (!undirectedAdj.has(edge.target)) undirectedAdj.set(edge.target, new Set());
      undirectedAdj.get(edge.target)!.add(val);
    }
  }

  for (const val of sortedVals) {
    if (visited.has(val)) continue;

    const comp: number[] = [];
    const queue = [val];
    visited.add(val);

    while (queue.length > 0) {
      const curr = queue.shift()!;
      comp.push(curr);
      for (const target of undirectedAdj.get(curr) ?? []) {
        if (!visited.has(target)) {
          visited.add(target);
          queue.push(target);
        }
      }
    }
    comp.sort((a, b) => a - b);
    components.push(comp);
  }

  return components;
}

function hasEdge(graph: NormalizedGraph, from: number, to: number): boolean {
  return graph.nodes.get(from)?.neighbors.some(e => e.target === to) ?? false;
}

/**
 * Renders a linear chain/path for graphs with 3 to 8 nodes where every node
 * has undirected degree <= 2 and exactly 2 endpoints.
 */
function tryRenderLinearPath(graph: NormalizedGraph): string | null {
  const n = graph.nodes.size;
  if (n < 3 || n > 8) return null;

  const undirectedNeighbors = new Map<number, Set<number>>();
  for (const [val, node] of graph.nodes) {
    if (!undirectedNeighbors.has(val)) undirectedNeighbors.set(val, new Set());
    for (const edge of node.neighbors) {
      undirectedNeighbors.get(val)!.add(edge.target);
      if (!undirectedNeighbors.has(edge.target)) undirectedNeighbors.set(edge.target, new Set());
      undirectedNeighbors.get(edge.target)!.add(val);
    }
  }

  let totalDegree = 0;
  const endpoints: number[] = [];
  for (const [val, nbrs] of undirectedNeighbors) {
    const deg = nbrs.size;
    totalDegree += deg;
    if (deg === 1) endpoints.push(val);
    else if (deg !== 2) return null;
  }

  if (totalDegree !== 2 * (n - 1) || endpoints.length !== 2) return null;

  const path: number[] = [endpoints[0]];
  const visited = new Set<number>([endpoints[0]]);
  while (path.length < n) {
    const curr = path[path.length - 1];
    const nextNbrs = Array.from(undirectedNeighbors.get(curr) || []).filter(v => !visited.has(v));
    if (nextNbrs.length !== 1) return null;
    visited.add(nextNbrs[0]);
    path.push(nextNbrs[0]);
  }

  let finalPath = path;
  if (graph.isDirected) {
    let fwdCount = 0;
    let revCount = 0;
    for (let i = 0; i < path.length - 1; i++) {
      if (hasEdge(graph, path[i], path[i + 1])) fwdCount++;
      if (hasEdge(graph, path[i + 1], path[i])) revCount++;
    }
    if (revCount > fwdCount) {
      finalPath = [...path].reverse();
    }
  }

  const valStr = (v: number) => chalk.cyan(`(${v})`);
  const getHConn = (u: number, v: number) => {
    const fwd = hasEdge(graph, u, v);
    const rev = hasEdge(graph, v, u);
    if (graph.isDirected) {
      if (fwd && rev) return " ◄────► ";
      if (fwd) return " ─────► ";
      if (rev) return " ◄───── ";
      return " ────── ";
    }
    return " ────── ";
  };

  let res = valStr(finalPath[0]);
  for (let i = 0; i < finalPath.length - 1; i++) {
    res += chalk.gray(getHConn(finalPath[i], finalPath[i + 1])) + valStr(finalPath[i + 1]);
  }
  return res;
}

function tryRenderStar5(graph: NormalizedGraph, nodeVals: number[]): string | null {
  const valStr = (v: number) => chalk.cyan(`(${v})`);
  const center = nodeVals.find(v => {
    const others = nodeVals.filter(o => o !== v);
    return others.every(o => hasEdge(graph, v, o) || hasEdge(graph, o, v));
  });
  if (center === undefined) return null;

  const leaves = nodeVals.filter(v => v !== center);
  for (let i = 0; i < leaves.length; i++) {
    for (let j = i + 1; j < leaves.length; j++) {
      if (hasEdge(graph, leaves[i], leaves[j]) || hasEdge(graph, leaves[j], leaves[i])) {
        return null;
      }
    }
  }

  const topLeaf = leaves[0];
  const leftLeaf = leaves[1];
  const rightLeaf = leaves[2];
  const botLeaf = leaves[3];

  let topV1 = "│";
  let topV2 = "│";
  if (graph.isDirected) {
    const down = hasEdge(graph, topLeaf, center);
    const up = hasEdge(graph, center, topLeaf);
    if (down && up) { topV1 = "▲"; topV2 = "▼"; }
    else if (up)    { topV1 = "▲"; topV2 = "│"; }
    else if (down)  { topV1 = "│"; topV2 = "▼"; }
  }

  let botV1 = "│";
  let botV2 = "│";
  if (graph.isDirected) {
    const down = hasEdge(graph, center, botLeaf);
    const up = hasEdge(graph, botLeaf, center);
    if (down && up) { botV1 = "▲"; botV2 = "▼"; }
    else if (down)  { botV1 = "│"; botV2 = "▼"; }
    else if (up)    { botV1 = "▲"; botV2 = "│"; }
  }

  let leftConn = "───";
  if (graph.isDirected) {
    const right = hasEdge(graph, leftLeaf, center);
    const left = hasEdge(graph, center, leftLeaf);
    if (right && left) leftConn = "◄─►";
    else if (right) leftConn = "──►";
    else if (left) leftConn = "◄──";
  }

  let rightConn = "───";
  if (graph.isDirected) {
    const right = hasEdge(graph, center, rightLeaf);
    const left = hasEdge(graph, rightLeaf, center);
    if (right && left) rightConn = "◄─►";
    else if (right) rightConn = "──►";
    else if (left) rightConn = "◄──";
  }

  // Exact vertical column alignment:
  // Middle row: `${valStr(leftLeaf)} ${chalk.gray(leftConn)} ${valStr(center)} ...`
  // Width before center: leftWidth + 1 space + leftConn (3 chars) + 1 space = leftWidth + 5
  const leftWidth = String(leftLeaf).length + 2;
  const prefixLen = leftWidth + 5;
  const centerMid = Math.floor((String(center).length + 2) / 2);
  const centerCol = prefixLen + centerMid;

  const topMid = Math.floor((String(topLeaf).length + 2) / 2);
  const botMid = Math.floor((String(botLeaf).length + 2) / 2);

  const topPad = " ".repeat(Math.max(0, centerCol - topMid));
  const botPad = " ".repeat(Math.max(0, centerCol - botMid));
  const padV = " ".repeat(centerCol);

  return (
    `${topPad}${valStr(topLeaf)}\n` +
    `${padV}${chalk.gray(topV1)}\n` +
    `${padV}${chalk.gray(topV2)}\n` +
    `${valStr(leftLeaf)} ${chalk.gray(leftConn)} ${valStr(center)} ${chalk.gray(rightConn)} ${valStr(rightLeaf)}\n` +
    `${padV}${chalk.gray(botV1)}\n` +
    `${padV}${chalk.gray(botV2)}\n` +
    `${botPad}${valStr(botLeaf)}`
  );
}

const GRID_2X3_ADJ_PAIRS = new Set([
  "0,1", "1,2",
  "3,4", "4,5",
  "0,3", "1,4", "2,5",
]);

function render2x3Grid(graph: NormalizedGraph, slots: (number | null)[]): string {
  const valStr = (v: number) => chalk.cyan(`(${v})`);

  const T = [slots[0], slots[1], slots[2]];
  const B = [slots[3], slots[4], slots[5]];

  const getH6 = (left: number | null, right: number | null) => {
    if (left === null || right === null) return "      ";
    const fwd = hasEdge(graph, left, right);
    const rev = hasEdge(graph, right, left);
    if (graph.isDirected) {
      if (fwd && rev) return "◄────►";
      if (fwd) return "─────►";
      if (rev) return "◄─────";
      return "      ";
    }
    if (fwd || rev) return "──────";
    return "      ";
  };

  const getV = (top: number | null, bot: number | null): [string, string] => {
    if (top === null || bot === null) return [" ", " "];
    const fwd = hasEdge(graph, top, bot);
    const rev = hasEdge(graph, bot, top);
    if (graph.isDirected) {
      if (fwd && rev) return ["▲", "▼"];
      if (fwd) return ["│", "▼"];
      if (rev) return ["▲", "│"];
      return [" ", " "];
    }
    if (fwd || rev) return ["│", "│"];
    return [" ", " "];
  };

  const colWidths = [0, 1, 2].map(c => {
    const tLen = T[c] !== null ? String(T[c]).length + 2 : 0;
    const bLen = B[c] !== null ? String(B[c]).length + 2 : 0;
    return Math.max(tLen, bLen, 3);
  });

  const padNode = (node: number | null, colWidth: number) => {
    if (node === null) return " ".repeat(colWidth);
    const rawLen = String(node).length + 2;
    const totalPad = colWidth - rawLen;
    const leftPad = Math.floor(totalPad / 2);
    const rightPad = totalPad - leftPad;
    return " ".repeat(leftPad) + valStr(node) + " ".repeat(rightPad);
  };

  const topConn01 = getH6(T[0], T[1]);
  const topConn12 = getH6(T[1], T[2]);
  const botConn01 = getH6(B[0], B[1]);
  const botConn12 = getH6(B[1], B[2]);

  const [v0_1, v0_2] = getV(T[0], B[0]);
  const [v1_1, v1_2] = getV(T[1], B[1]);
  const [v2_1, v2_2] = getV(T[2], B[2]);

  const rowTop = `${padNode(T[0], colWidths[0])} ${chalk.gray(topConn01)} ${padNode(T[1], colWidths[1])} ${chalk.gray(topConn12)} ${padNode(T[2], colWidths[2])}`;
  const rowBot = `${padNode(B[0], colWidths[0])} ${chalk.gray(botConn01)} ${padNode(B[1], colWidths[1])} ${chalk.gray(botConn12)} ${padNode(B[2], colWidths[2])}`;

  const c0Center = Math.floor(colWidths[0] / 2);
  const c1Center = colWidths[0] + 8 + Math.floor(colWidths[1] / 2);
  const c2Center = colWidths[0] + 8 + colWidths[1] + 8 + Math.floor(colWidths[2] / 2);

  const pad0 = " ".repeat(c0Center);
  const pad01 = " ".repeat(Math.max(1, c1Center - c0Center - 1));
  const pad12 = " ".repeat(Math.max(1, c2Center - c1Center - 1));

  const rowV1 = `${pad0}${chalk.gray(v0_1)}${pad01}${chalk.gray(v1_1)}${pad12}${chalk.gray(v2_1)}`;
  const rowV2 = `${pad0}${chalk.gray(v0_2)}${pad01}${chalk.gray(v1_2)}${pad12}${chalk.gray(v2_2)}`;

  return `${rowTop.trimEnd()}\n${rowV1.trimEnd()}\n${rowV2.trimEnd()}\n${rowBot.trimEnd()}`;
}

function tryRender2x3Grid(graph: NormalizedGraph, nodeVals: number[], n: 5 | 6): string | null {
  let totalEdges = 0;
  for (const [, node] of graph.nodes) {
    totalEdges += node.neighbors.length;
  }

  let bestSlots: (number | null)[] | null = null;
  let bestScore = -Infinity;

  const evaluateAssignment = (slots: (number | null)[]) => {
    const nodeToSlot = new Map<number, number>();
    for (let s = 0; s < 6; s++) {
      if (slots[s] !== null) nodeToSlot.set(slots[s]!, s);
    }

    let covered = 0;
    for (const [u, node] of graph.nodes) {
      const su = nodeToSlot.get(u);
      if (su === undefined) return;
      for (const edge of node.neighbors) {
        const sv = nodeToSlot.get(edge.target);
        if (sv === undefined) return;
        const key = Math.min(su, sv) + "," + Math.max(su, sv);
        if (!GRID_2X3_ADJ_PAIRS.has(key)) return;
        covered++;
      }
    }
    if (covered !== totalEdges) return;

    let score = 0;
    if (graph.isDirected) {
      const checkFlow = (fromSlot: number, toSlot: number) => {
        const u = slots[fromSlot];
        const v = slots[toSlot];
        if (u !== null && v !== null) {
          if (hasEdge(graph, u, v)) score += 2;
          if (hasEdge(graph, v, u)) score -= 2;
        }
      };
      checkFlow(0, 1);
      checkFlow(1, 2);
      checkFlow(3, 4);
      checkFlow(4, 5);
      checkFlow(0, 3);
      checkFlow(1, 4);
      checkFlow(2, 5);
    }

    for (let s = 0; s < 6; s++) {
      const val = slots[s] !== null ? slots[s]! : 999;
      score -= val * Math.pow(10, 5 - s) * 0.000001;
    }

    if (score > bestScore) {
      bestScore = score;
      bestSlots = [...slots];
    }
  };

  if (n === 6) {
    const permute6 = (arr: number[], current: number[] = []) => {
      if (current.length === 6) {
        evaluateAssignment(current);
        return;
      }
      for (let i = 0; i < arr.length; i++) {
        permute6([...arr.slice(0, i), ...arr.slice(i + 1)], [...current, arr[i]]);
      }
    };
    permute6(nodeVals);
  } else {
    for (let emptySlot = 0; emptySlot < 6; emptySlot++) {
      const permute5 = (arr: number[], current: (number | null)[] = []) => {
        if (current.length === 6) {
          evaluateAssignment(current);
          return;
        }
        if (current.length === emptySlot) {
          permute5(arr, [...current, null]);
          return;
        }
        for (let i = 0; i < arr.length; i++) {
          permute5([...arr.slice(0, i), ...arr.slice(i + 1)], [...current, arr[i]]);
        }
      };
      permute5(nodeVals);
    }
  }

  if (!bestSlots) return null;
  return render2x3Grid(graph, bestSlots);
}

export function render2DGraphLayout(graph: NormalizedGraph): string | null {
  const nodeVals = Array.from(graph.nodes.keys()).sort((a, b) => a - b);
  const n = nodeVals.length;

  if (n < 2 || n > 8) return null;
  if (graph.isWeighted) return null;
  if (graph.components.length > 1) return null;

  // 1. Try Linear Path / Chain for N = 3..8
  if (n >= 3 && n <= 8) {
    const linearPath = tryRenderLinearPath(graph);
    if (linearPath) return linearPath;
  }

  const valStr = (v: number) => chalk.cyan(`(${v})`);

  if (n === 2) {
    const v0 = nodeVals[0];
    const v1 = nodeVals[1];
    const has0to1 = hasEdge(graph, v0, v1);
    const has1to0 = hasEdge(graph, v1, v0);

    let conn: string;
    if (graph.isDirected) {
      if (has0to1 && has1to0) conn = chalk.gray(" ◄─────► ");
      else if (has0to1) conn = chalk.gray(" ──────► ");
      else if (has1to0) conn = chalk.gray(" ◄────── ");
      else return null;
    } else {
      if (has0to1 || has1to0) conn = chalk.gray(" ────── ");
      else return null;
    }

    return `${valStr(v0)}${conn}${valStr(v1)}`;
  }

  if (n === 3) {
    const [v0, v1, v2] = nodeVals;
    const pair01 = hasEdge(graph, v0, v1) || hasEdge(graph, v1, v0);
    const pair02 = hasEdge(graph, v0, v2) || hasEdge(graph, v2, v0);
    const pair12 = hasEdge(graph, v1, v2) || hasEdge(graph, v2, v1);

    if (pair01 && pair02 && pair12) {
      let diagL = "╱";
      let diagR = "╲";
      let botConn = "──";

      if (graph.isDirected) {
        const e01 = hasEdge(graph, v0, v1);
        const e10 = hasEdge(graph, v1, v0);
        if (e01 && e10) diagL = "╱";
        else if (e01) diagL = "↙";
        else if (e10) diagL = "↗";

        const e02 = hasEdge(graph, v0, v2);
        const e20 = hasEdge(graph, v2, v0);
        if (e02 && e20) diagR = "╲";
        else if (e02) diagR = "↘";
        else if (e20) diagR = "↖";

        const e12 = hasEdge(graph, v1, v2);
        const e21 = hasEdge(graph, v2, v1);
        if (e12 && e21) botConn = "◄─►";
        else if (e12) botConn = "──►";
        else if (e21) botConn = "◄──";
      }

      return (
        `    ${valStr(v0)}\n` +
        `   ${chalk.gray(diagL)}   ${chalk.gray(diagR)}\n` +
        `${valStr(v1)} ${chalk.gray(botConn)} ${valStr(v2)}`
      );
    }
  }

  if (n === 4) {
    const center = nodeVals.find(v => {
      const others = nodeVals.filter(o => o !== v);
      return others.every(o => hasEdge(graph, v, o) || hasEdge(graph, o, v));
    });

    if (center !== undefined) {
      const leaves = nodeVals.filter(v => v !== center);
      const leafEdges =
        (hasEdge(graph, leaves[0], leaves[1]) || hasEdge(graph, leaves[1], leaves[0]) ? 1 : 0) +
        (hasEdge(graph, leaves[0], leaves[2]) || hasEdge(graph, leaves[2], leaves[0]) ? 1 : 0) +
        (hasEdge(graph, leaves[1], leaves[2]) || hasEdge(graph, leaves[2], leaves[1]) ? 1 : 0);

      if (leafEdges === 0) {
        const topLeaf = leaves[0];
        const leftLeaf = leaves[1];
        const rightLeaf = leaves[2];

        let topV1 = "│";
        let topV2 = "│";
        if (graph.isDirected) {
          const down = hasEdge(graph, topLeaf, center);
          const up = hasEdge(graph, center, topLeaf);
          if (down && up) { topV1 = "▲"; topV2 = "▼"; }
          else if (up)    { topV1 = "▲"; topV2 = "│"; }
          else if (down)  { topV1 = "│"; topV2 = "▼"; }
        }

        let leftConn = "───";
        if (graph.isDirected) {
          const right = hasEdge(graph, leftLeaf, center);
          const left = hasEdge(graph, center, leftLeaf);
          if (right && left) leftConn = "◄─►";
          else if (right) leftConn = "──►";
          else if (left) leftConn = "◄──";
        }

        let rightConn = "───";
        if (graph.isDirected) {
          const right = hasEdge(graph, center, rightLeaf);
          const left = hasEdge(graph, rightLeaf, center);
          if (right && left) rightConn = "◄─►";
          else if (right) rightConn = "──►";
          else if (left) rightConn = "◄──";
        }

        const leftWidth = String(leftLeaf).length + 2;
        const prefixLen = leftWidth + 5;
        const centerMid = Math.floor((String(center).length + 2) / 2);
        const centerCol = prefixLen + centerMid;
        const topMid = Math.floor((String(topLeaf).length + 2) / 2);

        const topPad = " ".repeat(Math.max(0, centerCol - topMid));
        const padV = " ".repeat(centerCol);

        return (
          `${topPad}${valStr(topLeaf)}\n` +
          `${padV}${chalk.gray(topV1)}\n` +
          `${padV}${chalk.gray(topV2)}\n` +
          `${valStr(leftLeaf)} ${chalk.gray(leftConn)} ${valStr(center)} ${chalk.gray(rightConn)} ${valStr(rightLeaf)}`
        );
      }
    }

    const perms: [number, number, number, number][] = [];
    const p = (arr: number[], current: number[] = []) => {
      if (current.length === 4) {
        perms.push(current as [number, number, number, number]);
        return;
      }
      for (let i = 0; i < arr.length; i++) {
        p([...arr.slice(0, i), ...arr.slice(i + 1)], [...current, arr[i]]);
      }
    };
    p(nodeVals);

    let bestPerm: [number, number, number, number] | null = null;
    let bestScore = -Infinity;

    for (const [TL, TR, BL, BR] of perms) {
      const diag1 = hasEdge(graph, TL, BR) || hasEdge(graph, BR, TL);
      const diag2 = hasEdge(graph, TR, BL) || hasEdge(graph, BL, TR);
      if (diag1 || diag2) continue;

      const topExists = hasEdge(graph, TL, TR) || hasEdge(graph, TR, TL);
      const rightExists = hasEdge(graph, TR, BR) || hasEdge(graph, BR, TR);
      const botExists = hasEdge(graph, BL, BR) || hasEdge(graph, BR, BL);
      const leftExists = hasEdge(graph, TL, BL) || hasEdge(graph, BL, TL);

      const perimeterCount = (topExists ? 1 : 0) + (rightExists ? 1 : 0) + (botExists ? 1 : 0) + (leftExists ? 1 : 0);
      if (perimeterCount < 3) continue;

      let totalGraphEdges = 0;
      for (const [, node] of graph.nodes) {
        totalGraphEdges += node.neighbors.length;
      }
      let coveredEdges = 0;
      for (const [u, v] of [[TL, TR], [TR, TL], [TR, BR], [BR, TR], [BL, BR], [BR, BL], [TL, BL], [BL, TL]]) {
        if (hasEdge(graph, u, v)) coveredEdges++;
      }
      if (coveredEdges !== totalGraphEdges) continue;

      let score = 0;
      if (graph.isDirected) {
        if (hasEdge(graph, TL, TR)) score += 2;
        if (hasEdge(graph, TR, TL)) score -= 2;
        if (hasEdge(graph, BL, BR)) score += 2;
        if (hasEdge(graph, BR, BL)) score -= 2;
        if (hasEdge(graph, TL, BL)) score += 2;
        if (hasEdge(graph, BL, TL)) score -= 2;
        if (hasEdge(graph, TR, BR)) score += 2;
        if (hasEdge(graph, BR, TR)) score -= 2;
      }

      score -= (TL * 1000 + TR * 100 + BL * 10 + BR) * 0.0001;

      if (score > bestScore) {
        bestScore = score;
        bestPerm = [TL, TR, BL, BR];
      }
    }

    if (bestPerm) {
      const [TL, TR, BL, BR] = bestPerm;

      const getH6 = (left: number, right: number) => {
        const fwd = hasEdge(graph, left, right);
        const rev = hasEdge(graph, right, left);
        if (graph.isDirected) {
          if (fwd && rev) return "◄────►";
          if (fwd) return "─────►";
          if (rev) return "◄─────";
          return "      ";
        }
        if (fwd || rev) return "──────";
        return "      ";
      };

      const topConn = getH6(TL, TR);
      const botConn = getH6(BL, BR);

      const getV = (top: number, bot: number): [string, string] => {
        const fwd = hasEdge(graph, top, bot);
        const rev = hasEdge(graph, bot, top);
        if (graph.isDirected) {
          if (fwd && rev) return ["▲", "▼"];
          if (fwd) return ["│", "▼"];
          if (rev) return ["▲", "│"];
          return [" ", " "];
        }
        if (fwd || rev) return ["│", "│"];
        return [" ", " "];
      };

      const [leftV1, leftV2] = getV(TL, BL);
      const [rightV1, rightV2] = getV(TR, BR);

      const tlLen = String(TL).length + 2;
      const blLen = String(BL).length + 2;
      const trLen = String(TR).length + 2;

      const leftCol = Math.max(Math.floor(tlLen / 2), Math.floor(blLen / 2));
      const rightCol = tlLen + 1 + 6 + 1 + Math.floor(trLen / 2);
      const betweenSpaces = Math.max(1, rightCol - leftCol - 1);

      const padLeft = " ".repeat(leftCol);
      const padBetween = " ".repeat(betweenSpaces);

      return (
        `${valStr(TL)} ${chalk.gray(topConn)} ${valStr(TR)}\n` +
        `${padLeft}${chalk.gray(leftV1)}${padBetween}${chalk.gray(rightV1)}\n` +
        `${padLeft}${chalk.gray(leftV2)}${padBetween}${chalk.gray(rightV2)}\n` +
        `${valStr(BL)} ${chalk.gray(botConn)} ${valStr(BR)}`
      );
    }
  }

  // 5. N === 5: Star or 2x3 Grid
  if (n === 5) {
    const star5 = tryRenderStar5(graph, nodeVals);
    if (star5) return star5;

    const grid5 = tryRender2x3Grid(graph, nodeVals, 5);
    if (grid5) return grid5;
  }

  // 6. N === 6: 2x3 Grid
  if (n === 6) {
    const grid6 = tryRender2x3Grid(graph, nodeVals, 6);
    if (grid6) return grid6;
  }

  return null;
}

export function normalizedGraphToString(graph: NormalizedGraph, name = "graph"): string {
  const vCount = graph.nodes.size;
  const spatial2D = render2DGraphLayout(graph);

  if (spatial2D) {
    return `${chalk.gray(`${name}:`)}\n${spatial2D.split("\n").map(l => "  " + l).join("\n")}`;
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

  return `${header}\n${lines.map(l => "  " + l).join("\n")}`;
}

export function graphToString(node: GraphNode | null, name = "graph", isDirectedOverride?: boolean): string {
  if (!node) return chalk.gray("empty graph");
  const normalized = graphToNormalized(node, isDirectedOverride);
  if (!normalized) return chalk.gray("empty graph");
  return normalizedGraphToString(normalized, name);
}

export function edgeListGraphToString(edges: number[][], name = "edges", numNodes?: number, isDirectedOverride?: boolean, reverseEdges?: boolean): string {
  const normalized = edgeListToNormalizedGraph(edges, numNodes, isDirectedOverride, reverseEdges);
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

export function edgeListStringToNormalizedGraph(edges: string[][], isDirectedOverride?: boolean): NormalizedStringGraph | null {
  if (!Array.isArray(edges) || edges.length === 0) return null;

  const nodesMap = new Map<string, NormalizedStringGraphNode>();
  let rawEdgeCount = 0;

  const ensureNode = (val: string) => {
    if (!nodesMap.has(val)) nodesMap.set(val, { val, neighbors: [] });
    return nodesMap.get(val)!;
  };

  const isDirected = typeof isDirectedOverride === "boolean" ? isDirectedOverride : false;

  for (const row of edges) {
    if (!Array.isArray(row) || row.length < 2) continue;
    const u = String(row[0]);
    const v = String(row[1]);
    ensureNode(u);
    ensureNode(v);

    const uNode = nodesMap.get(u)!;
    if (!uNode.neighbors.includes(v)) {
      uNode.neighbors.push(v);
    }

    if (!isDirected) {
      const vNode = nodesMap.get(v)!;
      if (!vNode.neighbors.includes(u)) {
        vNode.neighbors.push(u);
      }
    }
    rawEdgeCount++;
  }

  if (nodesMap.size === 0) return null;

  // BFS for weakly connected components
  const visited = new Set<string>();
  const components: string[][] = [];
  const sortedKeys = Array.from(nodesMap.keys()).sort();

  const undirectedAdj = new Map<string, Set<string>>();
  for (const [val, node] of nodesMap) {
    if (!undirectedAdj.has(val)) undirectedAdj.set(val, new Set());
    for (const nbr of node.neighbors) {
      undirectedAdj.get(val)!.add(nbr);
      if (!undirectedAdj.has(nbr)) undirectedAdj.set(nbr, new Set());
      undirectedAdj.get(nbr)!.add(val);
    }
  }

  for (const start of sortedKeys) {
    if (visited.has(start)) continue;
    const comp: string[] = [];
    const queue = [start];
    visited.add(start);
    while (queue.length) {
      const curr = queue.shift()!;
      comp.push(curr);
      for (const nbr of undirectedAdj.get(curr) ?? []) {
        if (!visited.has(nbr)) { visited.add(nbr); queue.push(nbr); }
      }
    }
    comp.sort();
    components.push(comp);
  }

  return {
    nodes: nodesMap,
    isDirected,
    edgeCount: rawEdgeCount,
    components,
  };
}

export function edgeListStringGraphToString(edges: string[][], name = "edges", isDirectedOverride?: boolean): string {
  const graph = edgeListStringToNormalizedGraph(edges, isDirectedOverride);
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

  return `${header}\n${lines.map(l => "  " + l).join("\n")}`;
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
export function adjMapToString(map: Record<string, (string | number)[]>, name = "graph", isDirectedOverride?: boolean): string {
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
      const uNode = nodesMap.get(key)!;
      if (!uNode.neighbors.includes(nbrStr)) {
        uNode.neighbors.push(nbrStr);
      }
    }
  }

  if (nodesMap.size === 0) return chalk.gray(`${name}: (empty)`);

  let isDirected: boolean;
  let rawEdgeCount = 0;
  if (typeof isDirectedOverride === "boolean") {
    isDirected = isDirectedOverride;
  } else {
    isDirected = false;
    for (const [uVal, uNode] of nodesMap) {
      for (const vVal of uNode.neighbors) {
        rawEdgeCount++;
        const hasBack = nodesMap.get(vVal)?.neighbors.includes(uVal);
        if (!hasBack) { isDirected = true; }
      }
    }
  }

  if (!isDirected) {
    for (const [uVal, uNode] of Array.from(nodesMap.entries())) {
      for (const vVal of uNode.neighbors) {
        const vNode = nodesMap.get(vVal);
        if (vNode && !vNode.neighbors.includes(uVal)) {
          vNode.neighbors.push(uVal);
        }
      }
    }
  }

  const visited = new Set<string>();
  const components: string[][] = [];
  const sortedKeys = Array.from(nodesMap.keys()).sort();

  const undirectedAdj = new Map<string, Set<string>>();
  for (const [val, node] of nodesMap) {
    if (!undirectedAdj.has(val)) undirectedAdj.set(val, new Set());
    for (const nbr of node.neighbors) {
      undirectedAdj.get(val)!.add(nbr);
      if (!undirectedAdj.has(nbr)) undirectedAdj.set(nbr, new Set());
      undirectedAdj.get(nbr)!.add(val);
    }
  }

  for (const start of sortedKeys) {
    if (visited.has(start)) continue;
    const comp: string[] = [];
    const queue = [start];
    visited.add(start);
    while (queue.length) {
      const curr = queue.shift()!;
      comp.push(curr);
      for (const nbr of undirectedAdj.get(curr) ?? []) {
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

  return `${header}\n${lines.map(l => "  " + l).join("\n")}`;
}

export function isEdgeListParam(pName: string, matrix: any[][]): boolean {
  if (!Array.isArray(matrix) || matrix.length === 0) return false;

  const edgeParamRegex = /edge|prereq|flight|time|connection|adj/i;
  const nonEdgeParamRegex = /grid|board|matrix|table|interval|point|range|pair|coord/i;

  if (nonEdgeParamRegex.test(pName)) return false;
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
