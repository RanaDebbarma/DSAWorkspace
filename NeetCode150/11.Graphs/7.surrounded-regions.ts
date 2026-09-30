import { matrixToString, runTests } from "#functions/code-tester.js";
import chalk from "chalk";

// LeetCode 130

// O(R + C) time and space complexity
function solve(board: string[][]): string[][] {
  const ROWS = board.length;
  const COLS = board[0].length;

  // Four-direction movement
  const DIRS = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];

  // Mark all border-connected O's as safe
  for (let r = 0; r < ROWS; r++) {
    dfs(r, 0);
    dfs(r, COLS - 1);
  }

  for (let c = 0; c < COLS; c++) {
    dfs(0, c);
    dfs(ROWS - 1, c);
  }

  // Capture surrounded O's and restore safe O's
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c] === "O") {
        board[r][c] = "X";
      } else if (board[r][c] === "S") {
        board[r][c] = "O";
      }
    }
  }

  return board;

  function dfs(r: number, c: number) {
    // Skip non-O cells
    if (board[r][c] !== "O") return;

    const stack: [number, number][] = [[r, c]];

    // S = safe / connected to border
    board[r][c] = "S";

    while (stack.length) {
      const [currR, currC] = stack.pop()!;

      for (const [dr, dc] of DIRS) {
        const nr = currR + dr;
        const nc = currC + dc;

        // Visit unmarked O neighbors
        if (
          nr >= 0 &&
          nr < ROWS &&
          nc >= 0 &&
          nc < COLS &&
          board[nr][nc] === "O"
        ) {
          board[nr][nc] = "S";
          stack.push([nr, nc]);
        }
      }
    }
  }
}

runTests(
  solve,
  [
    {
      input: [
        [
          ["X", "X", "X", "X"],
          ["X", "O", "O", "X"],
          ["X", "X", "O", "X"],
          ["X", "O", "X", "X"],
        ],
      ],
      output: [
        ["X", "X", "X", "X"],
        ["X", "X", "X", "X"],
        ["X", "X", "X", "X"],
        ["X", "O", "X", "X"],
      ],
    },
    { input: [[["X"]]], output: [["X"]] },
  ],
  {
    showStringInput: false,
    gridMapping: {
      X: chalk.cyan("X"),
      O: chalk.yellow("O"),
    },
  },
);
