import { runTests } from "#functions/code-tester.js";

// LeetCode 200

function numIslands(grid: string[][]): number {
  let islands = 0;

  const ROWS = grid.length;
  const COLS = grid[0].length;

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (grid[r][c] === "1") {
        islands++;
        findLand(r, c);
      }
    }
  }

  return islands;

  function findLand(r: number, c: number): void {
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return;
    if (grid[r][c] === "0") return;

    grid[r][c] = "0";

    findLand(r - 1, c);
    findLand(r + 1, c);
    findLand(r, c - 1);
    findLand(r, c + 1);
  }
}

runTests(
  numIslands,
  [
    {
      input: [
        [
          ["0", "1", "1", "1", "0"],
          ["0", "1", "0", "1", "0"],
          ["1", "1", "0", "0", "0"],
          ["0", "0", "0", "0", "0"],
        ],
      ],
      output: 1,
    },
    {
      input: [
        [
          ["1", "1", "0", "0", "1"],
          ["1", "1", "0", "0", "1"],
          ["0", "0", "1", "0", "0"],
          ["0", "0", "0", "1", "1"],
        ],
      ],
      output: 4,
    },
  ],
  { showStringInput: false },
);
