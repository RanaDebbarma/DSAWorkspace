import { runTests, TestCase } from "#functions/code-tester.js";

function twoSum(nums: number[], target: number): number[] {
  const hash = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (hash.has(complement)) {
      return [hash.get(complement), i];
    } else {
      hash.set(nums[i], i);
    }
  }
  return [];
}

const inputs: TestCase<typeof twoSum>[] = [
  { input: [[2, 7, 11, 15], 9], output: [0, 1] },
  { input: [[3, 4, 5, 6], 7], output: [0, 1] },
];

runTests(twoSum, inputs);
