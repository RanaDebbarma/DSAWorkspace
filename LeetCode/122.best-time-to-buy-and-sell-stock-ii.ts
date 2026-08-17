import { runTests } from "#functions/code-tester.js";

function maxProfit(prices: number[]): number {
  let totalProfit = 0;

  for (let i = 1; i < prices.length; i++) {
    if (prices[i] > prices[i - 1]) {
      totalProfit += prices[i] - prices[i - 1];
    }
  }

  return totalProfit;
}

runTests(maxProfit, [
  { input: [[7, 1, 5, 3, 6, 4]], output: 7 },
  { input: [[1, 2, 3, 4, 5]], output: 4 },
  { input: [[7, 6, 4, 3, 1]], output: 0 },
]);
