import { runTests } from "#functions/code-tester.js";

// LeetCode 286

function islandsAndTreasure(grid: number[][]): number[][] {
  return [];
}

runTests(
  islandsAndTreasure,
  [
    {
      input: [
        [
          [2147483647, -1, 0, 2147483647],
          [2147483647, 2147483647, 2147483647, -1],
          [2147483647, -1, 2147483647, -1],
          [0, -1, 2147483647, 2147483647],
        ],
      ],
      output: [
        [3, -1, 0, 1],
        [2, 2, 1, -1],
        [1, -1, 2, -1],
        [0, -1, 3, 4],
      ],
    },
    {
      input: [
        [
          [0, -1],
          [2147483647, 2147483647],
        ],
      ],
      output: [
        [0, -1],
        [1, 2],
      ],
    },
  ],
  {
    showStringInput: false,
    gridMapping: {
      2147483647: { label: ".", color: "#74b9ff" },
      [-1]: { label: "W", color: "#ff7675" },
      0: { label: "T", color: "#ffce0a" },
    },
  },
);
