import { runTests } from "#functions/code-tester.js";

// LeetCode 286

// Optimal soln
function islandsAndTreasure(grid: number[][]): number[][] {
  const ROWS = grid.length;
  const COLS = grid[0].length;

  const queue: [number, number][] = [];

  // Start BFS from every treasure
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (grid[r][c] === 0) {
        queue.push([r, c]);
      }
    }
  }

  let head = 0;

  while (head < queue.length) {
    const [r, c] = queue[head++];

    const neighbors = [
      [r - 1, c],
      [r + 1, c],
      [r, c - 1],
      [r, c + 1],
    ];

    for (const [nr, nc] of neighbors) {
      if (
        nr < 0 ||
        nr >= ROWS ||
        nc < 0 ||
        nc >= COLS ||
        grid[nr][nc] !== 2147483647
      ) {
        continue;
      }

      grid[nr][nc] = grid[r][c] + 1;
      queue.push([nr, nc]);
    }
  }

  return grid;
}

// not optimal
// function islandsAndTreasure(grid: number[][]): number[][] {
//   const ROWS = grid.length;
//   const COLS = grid[0].length;

//   for (let r = 0; r < ROWS; r++) {
//     for (let c = 0; c < COLS; c++) {
//       if (grid[r][c] === 0) {
//         dfs(r, c, 0);
//       }
//     }
//   }

//   return grid;

//   function dfs(r: number, c: number, distance: number): void {
//     if (
//       r < 0 ||
//       r >= ROWS ||
//       c < 0 ||
//       c >= COLS ||
//       grid[r][c] === -1 ||
//       grid[r][c] < distance
//     )
//       return;

//     grid[r][c] = distance;

//     dfs(r - 1, c, distance + 1);
//     dfs(r + 1, c, distance + 1);
//     dfs(r, c - 1, distance + 1);
//     dfs(r, c + 1, distance + 1);

//     return;
//   }
// }

runTests(
  islandsAndTreasure,
  [
    {
      input: [
        [
          [2147483647, -1, 0, 2147483647],
          [2147483647, 2147483647, 2147483647, -1],
          [2147483647, -1, 2147483647, -1],
          [0, -1, 2147483647, 2147483647],
        ],
      ],
      output: [
        [3, -1, 0, 1],
        [2, 2, 1, -1],
        [1, -1, 2, -1],
        [0, -1, 3, 4],
      ],
    },
    {
      input: [
        [
          [0, -1],
          [2147483647, 2147483647],
        ],
      ],
      output: [
        [0, -1],
        [1, 2],
      ],
    },
  ],
  {
    showStringInput: false,
    gridMapping: {
      2147483647: { label: ".", color: "#74b9ff" },
      [-1]: { label: "W", color: "#ff7675" },
      0: { label: "T", color: "#ffce0a" },
    },
  },
);
