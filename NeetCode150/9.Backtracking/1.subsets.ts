import { runTests } from "#functions/code-tester.js";

// LeetCode 78

const solve = function subsets(nums: number[]): number[][] {
  if (!nums.length) return [];

  const ans: number[][] = [];
  const subset: number[] = [];

  dfs(0);

  return ans;

  function dfs(i: number) {
    if (i >= nums.length) {
      ans.push([...subset]);
      return;
    }

    subset.push(nums[i]);
    dfs(i + 1);

    subset.pop();
    dfs(i + 1);
  }
};

runTests(solve, [
  {
    input: [[1, 2, 3]],
    output: [[], [1], [2], [1, 2], [3], [1, 3], [2, 3], [1, 2, 3]],
  },
  { input: [[0]], output: [[], [0]] },
]);
