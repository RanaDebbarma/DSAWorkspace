import { runTests } from "#functions/code-tester.js";

const myFunc = function searchMatrix(
  matrix: number[][],
  target: number,
): boolean {
  let l = 0;
  let r = matrix.length - 1;
  let row: number[] | undefined;

  // find correct row o(logm)
  while (l <= r) {
    const mid = Math.floor((l + r) / 2);

    const currentRow = matrix[mid];
    const low = currentRow[0];
    const high = currentRow[currentRow.length - 1];

    if (target >= low && target <= high) {
      row = currentRow;
      break;
    }

    if (target < low) {
      r = mid - 1;
    } else {
      l = mid + 1;
    }
  }

  // target is not within any row's range
  if (!row) return false;

  // re-initialize pointers
  l = 0;
  r = row.length - 1;

  // find element in row o(logn)
  while (l <= r) {
    const mid = Math.floor((l + r) / 2);
    if (row[mid] === target) {
      return true;
    }
    if (row[mid] < target) {
      l = mid + 1;
    } else {
      r = mid - 1;
    }
  }

  return false;
};

runTests(myFunc, [
  {
    input: [
      [
        [1, 3, 5, 7],
        [10, 11, 16, 20],
        [23, 30, 34, 60],
      ],
      7,
    ],
    output: true,
  },
  {
    input: [
      [
        [1, 3, 5, 7],
        [10, 11, 16, 20],
        [23, 30, 34, 60],
      ],
      13,
    ],
    output: false,
  },
]);
