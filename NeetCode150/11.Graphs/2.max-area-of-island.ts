import { runTests } from "#functions/code-tester.js";

// LeetCode 695

function maxAreaOfIsland(grid: number[][]): number {
  let maxArea = 0;

  const ROWS = grid.length;
  const COLS = grid[0].length;

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (grid[r][c] === 1) {
        maxArea = Math.max(maxArea, findArea(r, c));
      }
    }
  }

  return maxArea;

  function findArea(r: number, c: number): number {
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return 0;
    if (grid[r][c] === 0) return 0;

    grid[r][c] = 0;

    return (
      1 +
      findArea(r - 1, c) +
      findArea(r + 1, c) +
      findArea(r, c - 1) +
      findArea(r, c + 1)
    );
  }
}

runTests(
  maxAreaOfIsland,
  [
    {
      input: [
        [
          [0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0],
          [0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 0, 0],
          [0, 1, 0, 0, 1, 1, 0, 0, 1, 1, 1, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
        ],
      ],
      output: 6,
    },
    { input: [[[0, 0, 0, 0, 0, 0, 0, 0]]], output: 0 },
    {
      input: [
        [
          [0, 1, 1, 0, 1],
          [1, 0, 1, 0, 1],
          [0, 1, 1, 0, 1],
          [0, 1, 0, 0, 1],
        ],
      ],
      output: 6,
    },
  ],
  { showStringInput: false },
);
