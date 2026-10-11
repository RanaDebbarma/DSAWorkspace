import { runTests } from "#functions/code-tester.js";

// LeetCode 684

// O(n^2) time and O(n) space complexity -------- Brute Force
// function findRedundantConnection(edges: number[][]): number[] {
//   const n = edges.length;
//   for (let i = n - 1; i >= 0; i--) {
//     if (isConnected(i)) return edges[i];
//   }
//   return [];

//   function isConnected(except: number): boolean {
//     const graph: number[][] = Array.from({length: n + 1}, () => []);

//     for (const [i, [a, b]] of edges.entries()) {
//       if (i === except) continue;
//       graph[a].push(b);
//       graph[b].push(a);
//     }

//     const stack: number[] = [1];
//     const visited = new Set<number>([1]);

//     while (stack.length) {
//       const node = stack.pop()!;

//       for (const neighbor of graph[node]) {
//         if (visited.has(neighbor)) continue;
//         stack.push(neighbor);
//         visited.add(neighbor);
//       }
//     }

//     return visited.size === n;
//   }
// }

// O(nα(n)) time and o(n) space complexity ------- uninon find
// α = inverse Ackermann function / n(α) ~ 1
function findRedundantConnection(edges: number[][]): number[] {
  const n = edges.length + 1;
  const parent = Array.from({ length: n }, (_, i) => i);
  const size = Array(n).fill(1);

  for (const [a, b] of edges) {
    // If both nodes are already connected, this edge creates a cycle.
    if (!union(a, b)) return [a, b];
  }

  return [];

  // Find the root with path compression.
  function findParent(x: number): number {
    if (x === parent[x]) return x;
    return (parent[x] = findParent(parent[x]));
  }

  // Merge two sets using union by size.
  function union(a: number, b: number): boolean {
    let rootA = findParent(a);
    let rootB = findParent(b);

    // Same root means both nodes are already connected.
    if (rootA === rootB) return false;

    // Always attach the smaller set to the larger set.
    if (size[rootA] < size[rootB]) {
      [rootA, rootB] = [rootB, rootA];
    }

    parent[rootB] = rootA;
    size[rootA] += size[rootB];

    return true;
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
