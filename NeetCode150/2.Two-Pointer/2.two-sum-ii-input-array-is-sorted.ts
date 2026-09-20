//-------- (Input Array is Sorted) ------------------------//

import { runTests } from "#functions/code-tester.js";

function twoSum(numbers: number[], target: number): number[] {
  let l = 0;
  let r = numbers.length - 1;

  while (l < r) {
    const sum = numbers[l] + numbers[r];

    if (sum === target) return [l + 1, r + 1];
    if (sum < target) l++;
    if (sum > target) r--;
  }

  return [];
}

runTests(twoSum, [
  { input: [[2, 7, 11, 15], 9], output: [1, 2] },
  { input: [[2, 3, 4], 6], output: [1, 3] },
  { input: [[-1, 0], -1], output: [1, 2] },
]);
