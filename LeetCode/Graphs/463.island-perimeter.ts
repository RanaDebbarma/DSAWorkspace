import { runTests } from "#functions/code-tester.js";

// LeetCode 463

function islandPerimeter(grid: number[][]): number {
  const ROWS = grid.length;
  const COLS = grid[0].length;
  const DIRS = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];

  let perimeter = 0;

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (grid[r][c] === 1) {
        dfs(r, c);
        return perimeter;
      }
    }
  }

  return perimeter;

  function dfs(r: number, c: number) {
    const stack: [number, number][] = [[r, c]];
    grid[r][c] = -1;

    while (stack.length) {
      const [currR, currC] = stack.pop()!;

      for (const [dr, dc] of DIRS) {
        const nr = currR + dr;
        const nc = currC + dc;

        if (
          nr < 0 ||
          nr >= ROWS ||
          nc < 0 ||
          nc >= COLS ||
          grid[nr][nc] === 0
        ) {
          perimeter++;
          continue;
        }

        if (grid[nr][nc] === -1) continue;
        
        if (grid[nr][nc] === 1) {
          // mark visited
          grid[nr][nc] = -1;
          stack.push([nr, nc]);
        }
      }
    }
  }
}

runTests(
  islandPerimeter,
  [
    {
      input: [
        [
          [1, 1, 0, 0],
          [1, 0, 0, 0],
          [1, 1, 1, 0],
          [0, 0, 1, 1],
        ],
      ],
      output: 18,
    },
    { input: [[[1, 0]]], output: 4 },
    { input: [[[1]]], output: 4 },
    {
      input: [
        [
          [0, 1, 0, 0],
          [1, 1, 1, 0],
          [0, 1, 0, 0],
          [1, 1, 0, 0],
        ],
      ],
      output: 16,
    },
  ],
  { showStringInput: false },
);
