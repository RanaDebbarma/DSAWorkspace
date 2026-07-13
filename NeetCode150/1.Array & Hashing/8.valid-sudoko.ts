const board1 = [
  ["1", "2", ".", ".", "3", ".", ".", ".", "."],
  ["4", ".", ".", "5", ".", ".", ".", ".", "."],
  [".", "9", "8", ".", ".", ".", ".", ".", "3"],

  ["5", ".", ".", ".", "6", ".", ".", ".", "4"],
  [".", ".", ".", "8", ".", "3", ".", ".", "5"],
  ["7", ".", ".", ".", "2", ".", ".", ".", "6"],

  [".", ".", ".", ".", ".", ".", "2", ".", "."],
  [".", ".", ".", "4", "1", "9", ".", ".", "8"],
  [".", ".", ".", ".", "8", ".", ".", "7", "9"],
];
const board2 = [
  ["1", "2", ".", ".", "3", ".", ".", ".", "."],
  ["4", ".", ".", "5", ".", ".", ".", ".", "."],
  [".", "9", "1", ".", ".", ".", ".", ".", "3"],

  ["5", ".", ".", ".", "6", ".", ".", ".", "4"],
  [".", ".", ".", "8", ".", "3", ".", ".", "5"],
  ["7", ".", ".", ".", "2", ".", ".", ".", "6"],

  [".", ".", ".", ".", ".", ".", "2", ".", "."],
  [".", ".", ".", "4", "1", "9", ".", ".", "8"],
  [".", ".", ".", ".", "8", ".", ".", "7", "9"],
];

function isValidSudoku(board: string[][]): boolean {
  // validator function
  function validate(arr: string[]) {
    const seen = new Set();
    for (const box of arr) {
      if (box === ".") continue;
      if (seen.has(box)) return false;
      seen.add(box);
    }
    return true;
  }

  // function to create sub-box
  function boxMaker(rowIdx: number, colIdx: number) {
    const box: string[] = [];
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        box.push(board[rowIdx + i][colIdx + j]);
      }
    }
    return box;
  }

  for (let i = 0; i < board.length; i++) {
    const row = board[i];

    // row validation
    if (!validate(row)) return false;

    const col = [];
    for (let j = 0; j < row.length; j++) {
      col.push(board[j][i]);

      if (j % 3 === 0 && i % 3 === 0) {
        const subBox = boxMaker(i, j);

        // subBox validation
        if (!validate(subBox)) return false;
      }
    }

    // column validation
    if (!validate(col)) return false;
  }

  return true;
}

console.log(isValidSudoku(board1)); // true
console.log(isValidSudoku(board2)); // false
