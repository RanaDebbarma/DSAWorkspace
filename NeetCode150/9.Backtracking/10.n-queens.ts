import { matrixToString, runTests } from "#functions/code-tester.js";

// LeetCode 51

function solveNQueens(n: number): string[][] {
  const boards: string[][] = [];

  const colSet = new Set();
  const posDiagSet = new Set(); // r + c
  const negDiagSet = new Set(); // r - c

  const board = Array.from({ length: n }, () => new Array(n).fill("."));

  backtrack(0);

  return boards;

  function backtrack(r: number) {
    if (r === n) {
      const copy = board.map((r) => r.join(""));
      boards.push(copy);
      return;
    }

    for (let c = 0; c < n; c++) {
      if (colSet.has(c) || posDiagSet.has(r + c) || negDiagSet.has(r - c))
        continue;

      colSet.add(c);
      posDiagSet.add(r + c);
      negDiagSet.add(r - c);
      board[r][c] = "Q";

      backtrack(r + 1);

      colSet.delete(c);
      posDiagSet.delete(r + c);
      negDiagSet.delete(r - c);
      board[r][c] = ".";
    }
  }
}

runTests(
  solveNQueens,
  [
    {
      input: [4],
      output: [
        [".Q..", "...Q", "Q...", "..Q."],
        ["..Q.", "Q...", "...Q", ".Q.."],
      ],
    },
    { input: [1], output: [["Q"]] },
  ],
  { showHint: false },
);
