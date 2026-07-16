import { runTests } from "#functions/code-tester.js";

function longestConsecutive(nums: number[]): number {
  if (nums.length === 0) return 0;

  const set = new Set<number>(nums);
  let maxLength = 0;

  for (const num of set) {
    // count only when num is first element of the sequence
    if (!set.has(num - 1)) {
      let currLength = 1;
      let current = num;

      // count sequence length
      while (set.has(current + 1)) {
        currLength++;
        current++;
      }
      maxLength = Math.max(maxLength, currLength);
    }
  }
  return maxLength;
}

runTests(longestConsecutive, [
  { input: [[100, 4, 200, 1, 3, 2]], output: 4 },
  { input: [[0, 3, 7, 2, 5, 8, 4, 6, 0, 1]], output: 9 },
  { input: [[1, 0, 1, 2]], output: 3 },
]);
