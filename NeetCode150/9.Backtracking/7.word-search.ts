import { runTests } from "#functions/code-tester.js";

// LeetCode 79

function exist(board: string[][], word: string): boolean {
  return false;
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
