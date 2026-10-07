import { runTests } from "#functions/code-tester.js";

// LeetCode 261

function validTree(n: number, edges: number[][]): boolean {
  // A tree with n nodes must have exactly n - 1 edges
  if (edges.length !== n - 1) return false;

  const graph: number[][] = Array.from({ length: n }, () => []);
  const visited = new Set<number>();

  // Build an undirected adjacency list
  for (const [a, b] of edges) {
    graph[a].push(b);
    graph[b].push(a);
  }

  const queue: number[] = [0];
  visited.add(0);
  let head = 0;

  // BFS to check if all nodes are connected
  while (head < queue.length) {
    const node = queue[head++];

    for (const neighbor of graph[node]) {
      if (visited.has(neighbor)) continue;

      visited.add(neighbor);
      queue.push(neighbor);
    }
  }

  // All n nodes must be reachable
  return visited.size === n;
}

runTests(validTree, [
  {
    input: [
      5,
      [
        [0, 1],
        [0, 2],
        [0, 3],
        [1, 4],
      ],
    ],
    output: true,
  },
  {
    input: [
      5,
      [
        [0, 1],
        [1, 2],
        [2, 3],
        [1, 3],
        [1, 4],
      ],
    ],
    output: false,
  },
]);
