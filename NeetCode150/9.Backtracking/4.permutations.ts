import { runTests } from "#functions/code-tester.js";

// LeetCode 46

// function permute(nums: number[]): number[][] {
//   const res: number[][] = [];
//   const used = new Array(nums.length).fill(false);

//   backtrack([]);

//   return res;

//   function backtrack(perm: number[]) {
//     // Complete permutation found
//     if (perm.length === nums.length) {
//       res.push([...perm]);
//       return;
//     }

//     // Try every unused number
//     for (let i = 0; i < nums.length; i++) {
//       if (used[i]) continue;

//       // Choose
//       used[i] = true;
//       perm.push(nums[i]);

//       // Explore
//       backtrack(perm);

//       // Undo choice
//       used[i] = false;
//       perm.pop();
//     }
//   }
// }

// alternate
function permute(nums: number[]): number[][] {
  const res: number[][] = [];

  backtrack(0);

  return res;

  function backtrack(start: number) {
    // Base case: if we've fixed all positions, add a copy of nums
    if (start === nums.length) {
      res.push([...nums]);
      return;
    }

    for (let i = start; i < nums.length; i++) {
      // Swap to place nums[i] at the current 'start' position
      [nums[start], nums[i]] = [nums[i], nums[start]];

      // Recurse for the next position
      backtrack(start + 1);

      // Backtrack: swap back to restore the original state
      [nums[start], nums[i]] = [nums[i], nums[start]];
    }
  }
}

runTests(
  permute,
  [
    {
      input: [[1, 2, 3]],
      output: [
        [1, 2, 3],
        [1, 3, 2],
        [2, 1, 3],
        [2, 3, 1],
        [3, 1, 2],
        [3, 2, 1],
      ],
    },
    {
      input: [[0, 1]],
      output: [
        [0, 1],
        [1, 0],
      ],
    },
    { input: [[1]], output: [[1]] },
  ],
  { showHint: false },
);
