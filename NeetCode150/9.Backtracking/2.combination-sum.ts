import { runTests } from "#functions/code-tester.js";

// LeetCode 39

function combinationSum(nums: number[], target: number): number[][] {
  const res: number[][] = [];

  backtrack(0, [], 0);

  return res;

  function backtrack(i: number, comb: number[], sum: number) {
    // Found a valid combination
    if (sum === target) {
      res.push([...comb]);
      return;
    }

    // Out of bounds or exceeded target
    if (i >= nums.length || sum > target) return;

    // Choose current number — can reuse it
    comb.push(nums[i]);
    backtrack(i, comb, sum + nums[i]);

    // Undo choice
    comb.pop();

    // Skip current number
    backtrack(i + 1, comb, sum);
  }
}

runTests(
  combinationSum,
  [
    { input: [[2, 5, 6, 9], 9], output: [[2, 2, 5], [9]] },
    {
      input: [[3, 4, 5], 16],
      output: [
        [3, 3, 3, 3, 4],
        [3, 3, 5, 5],
        [4, 4, 4, 4],
        [3, 4, 4, 5],
      ],
    },
    { input: [[3], 5], output: [] },
  ],
  { showHint: false },
);
