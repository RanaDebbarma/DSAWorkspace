import { runTests } from "#functions/code-tester.js";

// LeetCode 310

// O(n^2) time and O(n) space ---------- Brute Force
// function findMinHeightTrees(n: number, edges: number[][]): number[] {
//   const graph: number[][] = Array.from({ length: n }, () => []);

//   for (const [a, b] of edges) {
//     graph[a].push(b);
//     graph[b].push(a);
//   }

//   let roots: number[] = [];

//   let minHeight = Infinity;

//   for (let i = 0; i < n; i++) {
//     const currHeight = height(i);

//     if (currHeight < minHeight) {
//       minHeight = currHeight;
//       roots = [i];
//     } else if (currHeight === minHeight) {
//       roots.push(i);
//     }
//   }

//   return roots;

//   function height(root: number): number {
//     const queue: number[] = [root];
//     const visited = new Set<number>([root]);

//     let head = 0,
//       height = 0;

//     while (head < queue.length) {
//       const lvlSize = queue.length - head;

//       for (let lvl = 0; lvl < lvlSize; lvl++) {
//         const curr = queue[head++];

//         for (const neighbor of graph[curr]) {
//           if (visited.has(neighbor)) continue;

//           queue.push(neighbor);
//           visited.add(neighbor);
//         }
//       }
//       height++;
//     }

//     return height;
//   }
// }

// O(n) time and O(n) space ---------- Optimized approach
function findMinHeightTrees(n: number, edges: number[][]): number[] {
  // A single node is already the center.
  if (n === 1) return [0];

  const graph: number[][] = Array.from({ length: n }, () => []);
  const degree = new Int32Array(n);

  // Build adjacency list and count each node's neighbors.
  for (const [a, b] of edges) {
    graph[a].push(b);
    graph[b].push(a);
    degree[a]++;
    degree[b]++;
  }

  // Initialize the first layer with all leaves.
  let leaves: number[] = [];

  for (let node = 0; node < n; node++) {
    if (degree[node] === 1) leaves.push(node);
  }

  let remainingNodes = n;

  // Trim outer layers until at most two center nodes remain.
  while (remainingNodes > 2) {
    remainingNodes -= leaves.length;

    const nextLeaves: number[] = [];

    // Remove the current leaves and update their neighbors' degrees.
    for (const leaf of leaves) {
      for (const neighbor of graph[leaf]) {
        degree[neighbor]--;

        // A neighbor becomes a leaf when only one connection remains.
        if (degree[neighbor] === 1) {
          nextLeaves.push(neighbor);
        }
      }
    }

    // Process the newly discovered leaves in the next round.
    leaves = nextLeaves;
  }

  // The remaining one or two nodes are the tree's centers.
  return leaves;
}

runTests(findMinHeightTrees, [
  {
    input: [
      5,
      [
        [0, 1],
        [3, 1],
        [2, 3],
        [4, 1],
      ],
    ],
    output: [1, 3],
  },
  {
    input: [
      4,
      [
        [1, 0],
        [2, 0],
        [3, 0],
      ],
    ],
    output: [0],
  },
  {
    input: [1, []],
    output: [0],
  },
]);
