import { runTests } from "#functions/code-tester.js";

// LeetCode 997

function findJudge(n: number, trust: number[][]): number {
  // Track net score: in-degree minus out-degree for each person
  const trustScores = new Array(n + 1).fill(0);

  for (const [ai, bi] of trust) {
    trustScores[ai]--; // Out-degree: ai trusts someone (cannot be the judge)
    trustScores[bi]++; // In-degree: bi is trusted by someone
  }

  // Judge must have in-degree of (n - 1) and 
  // out-degree of 0 -> net score equals n - 1
  for (let i = 1; i <= n; i++) {
    if (trustScores[i] === n - 1) return i;
  }

  return -1;
}

runTests(
  findJudge,
  [
    {
      input: [
        4,
        [
          [1, 3],
          [4, 3],
          [2, 3],
        ],
      ],
      output: 3,
    },
    {
      input: [
        3,
        [
          [1, 3],
          [2, 3],
          [3, 1],
          [3, 2],
        ],
      ],
      output: -1,
    },
    { input: [2, [[1, 2]]], output: 2 },
    {
      input: [
        3,
        [
          [1, 3],
          [2, 3],
        ],
      ],
      output: 3,
    },
    {
      input: [
        3,
        [
          [1, 3],
          [2, 3],
          [3, 1],
        ],
      ],
      output: -1,
    },
  ],
  { isDirected: true },
);
