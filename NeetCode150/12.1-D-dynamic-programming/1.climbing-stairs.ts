import { runTests } from "#functions/code-tester.js";

// LeetCode 70

// o(n) time and space ----- Memoization -- Top-Down DP
function climbStairsRecursive(n: number): number {
  const memo = new Array<number>(n + 1).fill(-1);
  
  return climb(0);
  
  function climb(prog: number): number {
    // Reached the destination or overshot it
    if (prog >= n) return prog === n ? 1 : 0;
    
    // Reuse the cached result
    if (memo[prog] !== -1) return memo[prog];
    
    // Count ways by taking either 1 or 2 steps
    memo[prog] = climb(prog + 1) + climb(prog + 2);
    
    return memo[prog];
  }
}

// o(n) time and space ----- Tabulation -- Bottom-up DP
function climbStairsIterative(n: number): number {
  const dp = new Array<number>(n + 1).fill(0);
  
  dp[0] = 1;
  dp[1] = 1;
  
  // Build answers from smaller subproblems to larger ones
  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
  }
  
  return dp[n];
}

// o(n) time and o(1) space ----- Optimized Tabulation -- Bottom-up DP
function climbStairs(n: number): number {
  if (n <= 2) return n;

  let prev2 = 1;
  let prev1 = 2;

  for (let i = 3; i <= n; i++) {
    const curr = prev1 + prev2;

    prev2 = prev1;
    prev1 = curr;
  }

  return prev1;
}

runTests(climbStairs, [
  { input: [2], output: 2 },
  { input: [3], output: 3 },
]);
