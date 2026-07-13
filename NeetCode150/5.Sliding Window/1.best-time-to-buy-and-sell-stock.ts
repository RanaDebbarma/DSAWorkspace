import { runTests, TestCase } from "#functions/code-tester.js";

// const myFunc = function maxProfit(prices: number[]): number {
// let max = 0;

// let buy = 0;
// let sell = 1;

// while (sell < prices.length) {
//   if (prices[buy] >= prices[sell]) {
//     buy = sell;
//     sell = buy + 1;
//   } else {
//     const diff = prices[sell] - prices[buy];
//     if (diff > max) max = diff;
//     sell++;
//   }
// }

// return max;
// };

// GPT soln
const myFunc = function maxProfit(prices: number[]): number {
  let minPrice = Infinity;
  let maxProfit = 0;

  for (const price of prices) {
    minPrice = Math.min(minPrice, price);
    maxProfit = Math.max(maxProfit, price - minPrice);
  }

  return maxProfit;
};

const inputs: TestCase<typeof myFunc>[] = [
  // Leetcode
  { input: [[7, 1, 5, 3, 6, 4]], output: 5 },
  { input: [[7, 6, 4, 3, 1]], output: 0 },

  // Neetcode
  { input: [[10, 1, 5, 6, 7, 1]], output: 6 },
  { input: [[10, 8, 7, 5, 2]], output: 0 },
];

runTests(myFunc, inputs);
