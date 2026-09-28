import { runTests } from "#functions/code-tester.js";
import chalk from "chalk";

// LeetCode 994

function orangesRotting(grid: number[][]): number {
  const ROWS = grid.length;
  const COLS = grid[0].length;
  const DIRS = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];

  const queue: [number, number][] = [];
  let head = 0;
  let fresh = 0;

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (grid[r][c] === 1) fresh++;
      if (grid[r][c] === 2) {
        queue.push([r, c]);
      }
    }
  }

  if (fresh === 0) return 0;

  let time = -1;
  while (head < queue.length) {
    const levelSize = queue.length - head;

    for (let i = 0; i < levelSize; i++) {
      const [r, c] = queue[head++];

      for (const [dr, dc] of DIRS) {
        const nr = r + dr;
        const nc = c + dc;

        if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS || grid[nr][nc] !== 1)
          continue;

        grid[nr][nc] = 2;
        queue.push([nr, nc]);
        fresh--;
      }
    }

    time++;
  }

  return fresh === 0 ? time : -1;
}

runTests(
  orangesRotting,
  [
    {
      input: [
        [
          [2, 1, 1],
          [1, 1, 0],
          [0, 1, 1],
        ],
      ],
      output: 4,
    },
    {
      input: [
        [
          [2, 1, 1],
          [0, 1, 1],
          [1, 0, 1],
        ],
      ],
      output: -1,
    },
    { input: [[[0, 2]]], output: 0 },
  ],
  {
    showStringInput: false,
    gridMapping: {
      0: "  ",
      1: chalk.hex("#fac42f")("FO"),
      2: chalk.hex("#8e3016")("RO"),
    },
  },
);
