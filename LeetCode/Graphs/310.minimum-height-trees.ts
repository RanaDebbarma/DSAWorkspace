import { runTests } from "#functions/code-tester.js";

// LeetCode 310

// O(n^2) time and O(n) space ---------- Brute Force
function findMinHeightTrees(n: number, edges: number[][]): number[] {
  const graph: number[][] = Array.from({ length: n }, () => []);

  for (const [a, b] of edges) {
    graph[a].push(b);
    graph[b].push(a);
  }

  let roots: number[] = [];

  let minHeight = Infinity;

  for (let i = 0; i < n; i++) {
    const currHeight = height(i);

    if (currHeight < minHeight) {
      minHeight = currHeight;
      roots = [i];
    } else if (currHeight === minHeight) {
      roots.push(i);
    }
  }

  return roots;

  function height(root: number): number {
    const queue: number[] = [root];
    const visited = new Set<number>([root]);

    let head = 0,
      height = 0;

    while (head < queue.length) {
      const lvlSize = queue.length - head;

      for (let lvl = 0; lvl < lvlSize; lvl++) {
        const curr = queue[head++];

        for (const neighbor of graph[curr]) {
          if (visited.has(neighbor)) continue;

          queue.push(neighbor);
          visited.add(neighbor);
        }
      }
      height++;
    }

    return height;
  }
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
