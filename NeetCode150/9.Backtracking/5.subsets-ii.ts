import { runTests } from "#functions/code-tester.js";

// LeetCode 90

// function subsetsWithDup(nums: number[]): number[][] {
//   const res: number[][] = [];

//   nums.sort((a, b) => a - b);

//   backtrack(0, []);

//   return res;

//   function backtrack(i: number, subset: number[]) {
//     if (i >= nums.length) {
//       res.push([...subset]);
//       return;
//     }

//     subset.push(nums[i]);
//     backtrack(i + 1, subset);
//     subset.pop();

//     while (i + 1 < nums.length && nums[i] === nums[i + 1]) i++;
//     backtrack(i + 1, subset);
//   }
// }

// alternate
function subsetsWithDup(nums: number[]): number[][] {
  const res: number[][] = [];

  nums.sort((a, b) => a - b);

  backtrack(0, []);

  return res;

  function backtrack(i: number, subset: number[]) {
    res.push([...subset]);

    for (let j = i; j < nums.length; j++) {
      if (j > i && nums[j] === nums[j - 1]) continue;

      subset.push(nums[j]);
      backtrack(j + 1, subset);
      subset.pop();
    }
  }
}

runTests(subsetsWithDup, [
  { input: [[1, 2, 1]], output: [[], [1], [1, 2], [1, 1], [1, 2, 1], [2]] },
  { input: [[7, 7]], output: [[], [7], [7, 7]] },
]);
