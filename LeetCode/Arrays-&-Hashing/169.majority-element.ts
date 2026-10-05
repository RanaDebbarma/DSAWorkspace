import { runTests } from "#functions/code-tester.js";

// LeetCode 169

// intuitive o(n) time and o(n) space complexity
// function majorityElement(nums: number[]): number {
//   const count = new Map<number, number>();
//   let maj = 0;
//   let maxFreq = 0;

//   for (const num of nums) {
//     count.set(num, (count.get(num) ?? 0) + 1);
//     const freq = count.get(num)!;

//     if (maxFreq < freq) {
//       maxFreq = freq;
//       maj = num;
//     }
//   }

//   return maj;
// }

// Boyer–Moore Voting Algorithm ------ o(n) time and o(1) space
function majorityElement(nums: number[]): number {
  let res = 0;
  let count = 0;

  for (const num of nums) {
    // Pick a new candidate when the current one is cancelled out
    if (count === 0) res = num;

    // Same value supports candidate, different value cancels it
    if (num === res) count++;
    else count--;
  }

  return res;
}

runTests(majorityElement, [
  { input: [[5, 5, 1, 1, 1, 5, 5]], output: 5 },
  { input: [[2, 2, 2]], output: 2 },
]);
