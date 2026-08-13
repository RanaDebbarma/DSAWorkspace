export class GraphNode {
  val: number;
  neighbors: GraphNode[];
  /**
   * Optional: populated by createGraph(adjMap) to carry ALL nodes in the graph
   * (including those in disconnected components). Used by the visualizer and
   * other tools that need to traverse the full graph, not just one component.
   */
  _allNodes?: Map<number, GraphNode>;

  constructor(val = 0, neighbors: GraphNode[] = []) {
    this.val = val;
    this.neighbors = neighbors;
  }
}

/**
 * Creates a graph from a standard LeetCode adjacency list representation.
 * (1-indexed nodes, adjList[i] contains neighbors of node i+1).
 */
export function createGraph(adjList: number[][]): GraphNode | null;

/**
 * Creates a graph from an adjacency map representation.
 * Keys are explicit node values; values are arrays of neighbor values.
 * e.g. { 0: [1, 5], 1: [0], 5: [0], 2: [3], 3: [2] }
 */
export function createGraph(adjMap: Record<number, number[]>): GraphNode | null;

export function createGraph(
  input: number[][] | Record<number, number[]>,
): GraphNode | null {
  // Detect format: number[][] (LeetCode) vs Record<number, number[]> (adjacency map)
  if (Array.isArray(input)) {
    // --- LeetCode format: 1-indexed, adjList[i] = neighbors of node (i+1) ---
    if (input.length === 0) return null;

    const nodesMap = new Map<number, GraphNode>();

    // First pass: Instantiate all nodes
    for (let i = 1; i <= input.length; i++) {
      nodesMap.set(i, new GraphNode(i));
    }

    // Second pass: Populate neighbors
    for (let i = 0; i < input.length; i++) {
      const node = nodesMap.get(i + 1)!;
      node.neighbors = input[i].map((neighborVal) => nodesMap.get(neighborVal)!);
    }

    return nodesMap.get(1) || null;
  } else {
    // --- Adjacency map format: keys are node values, values are neighbor arrays ---
    const keys = Object.keys(input).map(Number);
    if (keys.length === 0) return null;

    const nodesMap = new Map<number, GraphNode>();

    // First pass: Instantiate all nodes
    for (const key of keys) {
      nodesMap.set(key, new GraphNode(key));
    }

    // Second pass: Populate neighbors
    for (const key of keys) {
      const node = nodesMap.get(key)!;
      node.neighbors = input[key].map((neighborVal) => {
        // Coerce to number: callers may pass string values (e.g. "8" instead of 8).
        // Without this, GraphNode.val would be a string, breaking back-edge checks
        // in the visualizer (e.target === uVal compares string vs number → always false),
        // which causes every undirected graph to be misdetected as directed.
        const numVal = Number(neighborVal);
        // Auto-create neighbor node if it wasn't listed as a key
        if (!nodesMap.has(numVal)) {
          nodesMap.set(numVal, new GraphNode(numVal));
        }
        return nodesMap.get(numVal)!;
      });
    }

    // Return the node with the smallest key as the entry point,
    // and attach _allNodes so the visualizer can reach every component.
    const entryNode = nodesMap.get(Math.min(...nodesMap.keys()));
    if (entryNode) {
      entryNode._allNodes = nodesMap;
    }
    return entryNode || null;
  }
}

/**
 * Serializes a graph starting from a node back to a standard LeetCode adjacency list.
 * If the graph was created from an adjacency map (and has _allNodes), all nodes
 * across disconnected components are included.
 */
export function graphToAdjList(node: GraphNode | null): number[][] {
  if (!node) return [];

  const visited = new Set<number>();
  const nodes: GraphNode[] = [];

  // Seed from all nodes if available (adjacency map graphs with disconnected components)
  const seedNodes: GraphNode[] = node._allNodes
    ? Array.from(node._allNodes.values())
    : [node];

  const queue: GraphNode[] = [];
  for (const seed of seedNodes) {
    if (!visited.has(seed.val)) {
      visited.add(seed.val);
      queue.push(seed);
    }
  }

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
 * If the graph has _allNodes (adjacency map), all components are cloned
 * and _allNodes is propagated to the cloned entry node.
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

  // If _allNodes is present, clone every node (including disconnected components)
  if (node._allNodes) {
    for (const n of node._allNodes.values()) {
      dfs(n);
    }
    const entryClone = cloneMap.get(node.val)!;
    entryClone._allNodes = cloneMap;
    return entryClone;
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
