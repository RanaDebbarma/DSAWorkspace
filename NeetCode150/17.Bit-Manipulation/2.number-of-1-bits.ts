import { runTests } from "#functions/code-tester.js";

// LeetCode 191

// time: O(k), k = number of set bits
// space: O(1)
// Brian Kernighan's Algorithm
function hammingWegiht(n: number): number {
  let ones = 0;

  while (n !== 0) {
    // Subtracting 1 flips the rightmost set bit to 0
    // and turns all trailing 0s into 1s.
    // AND removes the rightmost set bit and trailing bits.
    n &= n - 1;

    // Each iteration removes exactly one set bit.
    ones++;
  }

  return ones;
}

runTests(hammingWegiht, [
  { input: [11], output: 3 },
  { input: [128], output: 1 },
  { input: [2147483645], output: 30 },
  { input: [23], output: 4 },
  { input: [2147483645], output: 30 },
]);
