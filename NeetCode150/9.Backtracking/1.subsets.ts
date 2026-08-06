import { runTests } from "#functions/code-tester.js";

// LeetCode 78

// o(n * 2^n) & o(n) space complexity
// There are 2^n subsets 
// copying each subset into anser takes upto o(n) time
const solve = function subsets(nums: number[]): number[][] {
  if (!nums.length) return [];

  const ans: number[][] = [];
  const subset: number[] = [];

  dfs(0);

  return ans;

  function dfs(i: number) {
    if (i >= nums.length) {
      // save a copy of subset
      ans.push([...subset]);
      return;
    }

    // include num
    subset.push(nums[i]);
    dfs(i + 1);
    
    // exlude num
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
