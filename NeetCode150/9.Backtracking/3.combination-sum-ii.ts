import { runTests } from "#functions/code-tester.js";

// LeetCode 40

function combinationSum2(nums: number[], target: number): number[][] {
  const res: number[][] = [];

  nums.sort((a, b) => a - b); // Sort for duplicate skipping + pruning

  backtrack(0, [], 0);

  return res;

  function backtrack(i: number, comb: number[], sum: number) {
    if (sum === target) {
      res.push([...comb]); // Save a copy of the combination
      return;
    }

    if (i >= nums.length || sum > target) return; // Stop invalid paths

    comb.push(nums[i]);
    backtrack(i + 1, comb, sum + nums[i]); // Use element once
    comb.pop();

    // Skip duplicate values at the same recursion level
    while (i + 1 < nums.length && nums[i] === nums[i + 1]) i++;

    backtrack(i + 1, comb, sum); // Skip current element
  }
}

runTests(
  combinationSum2,
  [
    {
      input: [[9, 2, 2, 4, 6, 1, 5], 8],
      output: [
        [1, 2, 5],
        [2, 2, 4],
        [2, 6],
      ],
    },
    {
      input: [[1, 2, 3, 4, 5], 7],
      output: [
        [1, 2, 4],
        [2, 5],
        [3, 4],
      ],
    },
  ],
  { showHint: false },
);
