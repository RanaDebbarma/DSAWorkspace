import { runTests } from "#functions/code-tester.js";

// LeetCode 78

// o(n * 2^n) & o(n) space complexity
// There are 2^n subsets
// copying each subset into anser takes upto o(n) time
const solve = function subsets(nums: number[]): number[][] {
  const ans: number[][] = [];

  backtrack(0, []);

  return ans;

  function backtrack(i: number, subset: number[]): void {
    if (i >= nums.length) {
      // save a copy of subset
      ans.push([...subset]);
      return;
    }

    // include num
    subset.push(nums[i]);
    backtrack(i + 1, subset);

    // exlude num
    subset.pop();
    backtrack(i + 1, subset);
  }
};

// alternate approach
function subsets(nums: number[]): number[][] {
  const res: number[][] = [];

  function backtrack(start: number, path: number[]): void {
    // Every state is a valid subset, so we push a copy of the current path
    res.push([...path]);

    for (let i = start; i < nums.length; i++) {
      // Include nums[i]
      path.push(nums[i]);
      // Move to the next index
      backtrack(i + 1, path);
      // Backtrack by removing the last element
      path.pop();
    }
  }

  backtrack(0, []);
  return res;
}

runTests(solve, [
  {
    input: [[1, 2, 3]],
    output: [[], [1], [2], [1, 2], [3], [1, 3], [2, 3], [1, 2, 3]],
  },
  { input: [[0]], output: [[], [0]] },
]);

runTests(subsets, [
  {
    input: [[1, 2, 3]],
    output: [[], [1], [2], [1, 2], [3], [1, 3], [2, 3], [1, 2, 3]],
  },
  { input: [[0]], output: [[], [0]] },
]);
