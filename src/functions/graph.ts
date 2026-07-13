export class GraphNode {
  val: number;
  neighbors: GraphNode[];

  constructor(val = 0, neighbors: GraphNode[] = []) {
    this.val = val;
    this.neighbors = neighbors;
  }
}

/**
 * Creates a graph from a standard LeetCode adjacency list representation.
 * (1-indexed nodes, adjList[i] contains neighbors of node i+1).
 */
export function createGraph(adjList: number[][]): GraphNode | null {
  if (adjList.length === 0) return null;

  const nodesMap = new Map<number, GraphNode>();

  // First pass: Instantiate all nodes
  for (let i = 1; i <= adjList.length; i++) {
    nodesMap.set(i, new GraphNode(i));
  }

  // Second pass: Populate neighbors
  for (let i = 0; i < adjList.length; i++) {
    const node = nodesMap.get(i + 1)!;
    node.neighbors = adjList[i].map((neighborVal) => nodesMap.get(neighborVal)!);
  }

  // Return the first node
  return nodesMap.get(1) || null;
}

/**
 * Serializes a graph starting from a node back to a standard LeetCode adjacency list.
 */
export function graphToAdjList(node: GraphNode | null): number[][] {
  if (!node) return [];

  const visited = new Set<number>();
  const nodes: GraphNode[] = [];
  const queue: GraphNode[] = [node];
  visited.add(node.val);

  // Traverse the graph to find all nodes
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

  // Sort nodes by their value to guarantee stable order
  nodes.sort((a, b) => a.val - b.val);

  const adjList: number[][] = [];
  for (const n of nodes) {
    adjList.push(n.neighbors.map((neighbor) => neighbor.val));
  }

  return adjList;
}

/**
 * Deep clones a graph using cycle-safe DFS traversal.
 */
export function cloneGraph(node: GraphNode | null): GraphNode | null {
  if (!node) return null;

  const cloneMap = new Map<number, GraphNode>();

  function dfs(curr: GraphNode): GraphNode {
    if (cloneMap.has(curr.val)) {
      return cloneMap.get(curr.val)!;
    }

    const clone = new GraphNode(curr.val);
    cloneMap.set(curr.val, clone);

    for (const neighbor of curr.neighbors) {
      clone.neighbors.push(dfs(neighbor));
    }

    return clone;
  }

  return dfs(node);
}

/**
 * Compares two graphs by converting them to their adjacency list formats.
 */
export function compareGraphs(a: GraphNode | null, b: GraphNode | null): boolean {
  if (!a && !b) return true;
  if (!a || !b) return false;

  const adjA = graphToAdjList(a);
  const adjB = graphToAdjList(b);

  if (adjA.length !== adjB.length) return false;

  for (let i = 0; i < adjA.length; i++) {
    const neighborsA = adjA[i];
    const neighborsB = adjB[i];

    if (neighborsA.length !== neighborsB.length) return false;

    // Check values of neighbors
    for (let j = 0; j < neighborsA.length; j++) {
      if (neighborsA[j] !== neighborsB[j]) return false;
    }
  }

  return true;
}
