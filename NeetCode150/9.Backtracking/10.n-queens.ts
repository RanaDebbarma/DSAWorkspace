import { matrixToString, runTests } from "#functions/code-tester.js";

// LeetCode 51

// function solveNQueens(n: number): string[][] {
//   const boards: string[][] = [];

//   const colSet = new Set();
//   const posDiagSet = new Set(); // r + c
//   const negDiagSet = new Set(); // r - c

//   const board = Array.from({ length: n }, () => new Array(n).fill("."));

//   backtrack(0);

//   return boards;

//   function backtrack(r: number) {
//     if (r === n) {
//       const copy = board.map((r) => r.join(""));
//       boards.push(copy);
//       return;
//     }

//     for (let c = 0; c < n; c++) {
//       if (colSet.has(c) || posDiagSet.has(r + c) || negDiagSet.has(r - c))
//         continue;

//       colSet.add(c);
//       posDiagSet.add(r + c);
//       negDiagSet.add(r - c);
//       board[r][c] = "Q";

//       backtrack(r + 1);

//       colSet.delete(c);
//       posDiagSet.delete(r + c);
//       negDiagSet.delete(r - c);
//       board[r][c] = ".";
//     }
//   }
// }

// using boolean array instead of set
function solveNQueens(n: number): string[][] {
  const boards: string[][] = [];

  // Track whether each column already has a queen.
  const cols = new Array(n).fill(false);
  // Track occupied \ diagonals using r + c as the diagonal ID.
  const posDiag = new Array(2 * n - 1).fill(false);
  // Track occupied / diagonals using r - c + (n - 1) as the diagonal ID.
  const negDiag = new Array(2 * n - 1).fill(false);

  // Build an empty board.
  const board = Array.from({ length: n }, () => new Array(n).fill("."));

  backtrack(0);

  return boards;

  function backtrack(r: number) {
    // All rows have a queen, so we found a valid board.
    if (r === n) {
      const copy = board.map((r) => r.join(""));
      boards.push(copy);
      return;
    }

    // Try placing a queen in every column of this row.
    for (let c = 0; c < n; c++) {
      // Get unique IDs for the two diagonals.
      const pos = r + c;
      const neg = r - c + n - 1;

      // Skip if the column or either diagonal is already occupied.
      if (cols[c] || posDiag[pos] || negDiag[neg]) continue;

      // Mark the column and diagonals as occupied.
      cols[c] = true;
      posDiag[pos] = true;
      negDiag[neg] = true;

      // Place the queen.
      board[r][c] = "Q";

      // Move to the next row.
      backtrack(r + 1);

      // Backtrack: undo everything before trying the next position.
      cols[c] = false;
      posDiag[pos] = false;
      negDiag[neg] = false;
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
