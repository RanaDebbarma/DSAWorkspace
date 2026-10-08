import { runTests } from "#functions/code-tester.js";

// LeetCode 684

// o(n^2) time and o(n) space complexity -------- Brute Force
function findRedundantConnection(edges: number[][]): number[] {
  const n = edges.length;
  for (let i = n - 1; i >= 0; i--) {
    if (isConnected(i)) return edges[i];
  }
  return [];

  function isConnected(except: number): boolean {
    const graph: number[][] = Array.from({length: n + 1}, () => []);

    for (const [i, [a, b]] of edges.entries()) {
      if (i === except) continue;
      graph[a].push(b);
      graph[b].push(a);
    }

    const stack: number[] = [1];
    const visited = new Set<number>([1]);

    while (stack.length) {
      const node = stack.pop()!;

      for (const neighbor of graph[node]) {
        if (visited.has(neighbor)) continue;
        stack.push(neighbor);
        visited.add(neighbor);
      }
    }

    return visited.size === n;
  }
}

runTests(findRedundantConnection, [
  {
    input: [
      [
        [1, 2],
        [1, 3],
        [2, 3],
      ],
    ],
    output: [2, 3],
  },
  {
    input: [
      [
        [1, 2],
        [2, 3],
        [3, 4],
        [1, 4],
        [1, 5],
      ],
    ],
    output: [1, 4],
  },
]);
