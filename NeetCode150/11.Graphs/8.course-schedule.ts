import { runTests } from "#functions/code-tester.js";

// LeetCode 207

function canFinish(numCourses: number, prerequisites: number[][]): boolean {
  return false;
}

runTests(
  canFinish,
  [
    { input: [2, [[0, 1]]], output: true },
    {
      input: [
        2,
        [
          [0, 1],
          [1, 0],
        ],
      ],
      output: false,
    },
    {
      input: [
        4,
        [
          [1, 0],
          [2, 0],
          [3, 1],
          [3, 2],
        ],
      ],
      output: true,
    },
    {
      input: [
        4,
        [
          [1, 0],
          [3, 2],
          [2, 3],
        ],
      ],
      output: false,
    },
  ],
  { reverseEdges: true },
);
