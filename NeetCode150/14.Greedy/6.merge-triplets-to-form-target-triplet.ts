import { runCompare, runTests, TestCase } from "#functions/code-tester.js";

// LeetCode 1899

// time: O(2^n)
// space: O(n)
// Brute-Force (Back-Tracking)
function mergeTriplets_BF(triplets: number[][], target: number[]): boolean {
  const n = triplets.length;

  return dfsMerge(0, [0, 0, 0]);

  function dfsMerge(idx: number, merged: number[]): boolean {
    if (merged.every((val, i) => val === target[i])) return true;
    if (idx >= n) return false;

    const triplet = triplets[idx];

    // pruning
    if (triplet.some((val, i) => val > target[i])) {
      return dfsMerge(idx + 1, merged);
    }

    // exclude
    if (dfsMerge(idx + 1, merged)) return true;

    // include
    const next = merged.map((val, i) => Math.max(val, triplet[i]));
    if (dfsMerge(idx + 1, next)) return true;

    return false;
  }
}

// time: O(n)
// space: O(1)
// Optimized (Greedy)
function mergeTriplets(triplets: number[][], target: number[]): boolean {
  const merged = [0, 0, 0];

  for (const triplet of triplets) {
    // Skip triplets that exceed any target coordinate
    if (triplet.some((val, i) => val > target[i])) continue;

    // Merge valid triplets using coordinate-wise maximum
    for (let i = 0; i < 3; i++) {
      merged[i] = Math.max(merged[i], triplet[i]);
    }
  }

  // Check whether all target coordinates were achieved
  return merged.every((val, i) => val === target[i]);
}

const cases: TestCase<typeof mergeTriplets>[] = [
  // leetcode
  {
    input: [
      [
        [2, 5, 3],
        [1, 8, 4],
        [1, 7, 5],
      ],
      [2, 7, 5],
    ],
    output: true,
  },
  {
    input: [
      [
        [3, 4, 5],
        [4, 5, 6],
      ],
      [3, 2, 5],
    ],
    output: false,
  },
  {
    input: [
      [
        [2, 5, 3],
        [2, 3, 4],
        [1, 2, 5],
        [5, 2, 3],
      ],
      [5, 5, 5],
    ],
    output: true,
  },

  // neetcode
  {
    input: [
      [
        [1, 2, 3],
        [7, 1, 1],
      ],
      [7, 2, 3],
    ],
    output: true,
  },
  {
    input: [
      [
        [2, 5, 6],
        [1, 4, 4],
        [5, 7, 5],
      ],
      [5, 4, 6],
    ],
    output: false,
  },
];

runTests(mergeTriplets, cases, { visualizeInput: false });
runCompare([mergeTriplets_BF, mergeTriplets], cases);
