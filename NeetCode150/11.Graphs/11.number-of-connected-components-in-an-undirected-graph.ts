import { runTests } from "#functions/code-tester.js";

// LeetCode 323

// recursive
// function countComponents(n: number, edges: number[][]): number {
//   const graph: number[][] = Array.from({ length: n }, () => []);
//   const visited = new Set<number>();

//   for (const [a, b] of edges) {
//     graph[a].push(b);
//     graph[b].push(a);
//   }

//   let component = 0;

//   for (let node = 0; node < n; node++) {
//     if (visited.has(node)) continue;
//     component++;

//     dfs(node);
//   }

//   return component;

//   function dfs(node: number) {
//     visited.add(node);

//     for (const neighbor of graph[node]) {
//       if (visited.has(neighbor)) continue;
//       dfs(neighbor);
//     }
//   }
// }

// itterative
function countComponents(n: number, edges: number[][]): number {
  const graph: number[][] = Array.from({ length: n }, () => []);
  const visited = new Set<number>();

  for (const [a, b] of edges) {
    graph[a].push(b);
    graph[b].push(a);
  }

  let component = 0;

  for (let node = 0; node < n; node++) {
    if (visited.has(node)) continue;
    component++;

    const stack: number[] = [node];
    visited.add(node);

    while (stack.length) {
      const curr = stack.pop()!;

      for (const neighbor of graph[curr]) {
        if (visited.has(neighbor)) continue;

        visited.add(neighbor);
        stack.push(neighbor);
      }
    }
  }

  return component;
}

runTests(countComponents, [
  {
    input: [
      5,
      [
        [0, 1],
        [1, 2],
        [3, 4],
      ],
    ],
    output: 2,
  },
  {
    input: [
      5,
      [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 4],
      ],
    ],
    output: 1,
  },
]);
