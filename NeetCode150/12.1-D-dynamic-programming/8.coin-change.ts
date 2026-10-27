import { runCompare, runTests, TestCase } from "#functions/code-tester.js";

// LeetCode 322

// A = amount, C = coins.length
// time: O(A x C)
// space: O(A)
// BFS solution
function coinChange_BFS(coins: number[], amount: number): number {
  const que = [0];
  const visited = new Set<number>([0]);
  let head = 0;

  let numberOfCoins = 0;

  while (head < que.length) {
    const lvlSize = que.length - head;

    for (let lvl = 0; lvl < lvlSize; lvl++) {
      const currAmt = que[head++];

      if (currAmt === amount) return numberOfCoins;

      for (const coin of coins) {
        const nextAmt = currAmt + coin;

        if (nextAmt > amount || visited.has(nextAmt)) continue;

        visited.add(nextAmt);
        que.push(currAmt + coin);
      }
    }

    numberOfCoins++;
  }

  return -1;
}

// A = amount, C = coins.length
// time: O(A x C)
// space: O(A)
// Bottom-Up + tabulation
function coinChange_BUT(coins: number[], amount: number): number {
  const dp = Array(amount + 1).fill(Infinity);

  dp[0] = 0;

  for (let amt = 1; amt <= amount; amt++) {
    for (const coin of coins) {
      if (amt < coin) continue;
      dp[amt] = Math.min(dp[amt], dp[amt - coin] + 1);
    }
  }

  return dp[amount] !== Infinity ? dp[amount] : -1;
}

const cases: TestCase<typeof coinChange_BUT>[] = [
  { input: [[1, 5, 10], 12], output: 3 },
  { input: [[2], 3], output: -1 },
  { input: [[1], 0], output: 0 },
  { input: [[1, 2, 5], 11], output: 3 },
  { input: [[2, 6, 8], 99], output: -1 },
];

runTests(coinChange_BUT, cases);
runCompare([coinChange_BFS, coinChange_BUT], cases);
