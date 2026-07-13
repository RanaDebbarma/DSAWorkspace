//-------- (Input Array is Sorted) ------------------------//

import { runTests, TestCase } from "#functions/code-tester.js";

function twoSum(numbers: number[], target: number): number[] {
  let [l, r] = [0, numbers.length - 1];

  while (l < r) {
    const sum = numbers[l] + numbers[r];
    if (sum < target) l++;
    if (sum > target) r--;
    if (sum === target) return [l + 1, r + 1];
  }

  return [];
}

const inputs: TestCase<typeof twoSum>[] = [
  { input: [[2, 7, 11, 15], 9], output: [1, 2] },
  { input: [[2, 3, 4], 6], output: [1, 3] },
  { input: [[-1, 0], -1], output: [1, 2] },
];

runTests(twoSum, inputs);
