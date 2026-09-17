import { runTests } from "#functions/code-tester.js";

// LeetCode 79

function exist(board: string[][], word: string): boolean {
  const rows = board.length;
  const cols = board[0].length;

  // Quick rejection: word cannot fit in the board.
  if (word.length > rows * cols) return false;

  // Optional frequency pruning.
  const count = new Int32Array(128);

  for (const row of board) {
    for (const char of row) {
      count[char.charCodeAt(0)]++;
    }
  }

  for (const char of word) {
    if (--count[char.charCodeAt(0)] < 0) return false;
  }

  // Search from every cell.
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (dfs(row, col, 0)) return true;
    }
  }

  return false;

  function dfs(row: number, col: number, i: number): boolean {
    if (
      row < 0 ||
      row >= rows ||
      col < 0 ||
      col >= cols ||
      board[row][col] !== word[i]
    ) {
      return false;
    }

    if (i === word.length - 1) return true;

    const cell = board[row][col];
    board[row][col] = "#";

    const found =
      dfs(row - 1, col, i + 1) ||
      dfs(row + 1, col, i + 1) ||
      dfs(row, col - 1, i + 1) ||
      dfs(row, col + 1, i + 1);

    board[row][col] = cell;

    return found;
  }
}

runTests(exist, [
  {
    input: [
      [
        ["A", "B", "C", "D"],
        ["S", "A", "A", "T"],
        ["A", "C", "A", "E"],
      ],
      "CAT",
    ],
    output: true,
  },
  {
    input: [
      [
        ["A", "B", "C", "D"],
        ["S", "A", "A", "T"],
        ["A", "C", "A", "E"],
      ],
      "BAT",
    ],
    output: false,
  },
]);
