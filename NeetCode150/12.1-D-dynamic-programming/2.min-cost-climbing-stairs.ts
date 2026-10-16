import { runTests } from "#functions/code-tester.js";

// LeetCode 746

// O(n) time & O(n) space complexity ---- Top-Down + Memoization
// function minCostClimbingStairs(cost: number[]): number {
//   const n = cost.length;
//   const climbCost: number[] = new Array(n + 1).fill(-1);
  
//   return Math.min(minCost(0), minCost(1));

//   function minCost(step: number): number {
//     if (step >= n) return 0;

//     if (climbCost[step] !== -1) return climbCost[step];

//     const oneStep = minCost(step + 1);
//     const twoStep = minCost(step + 2);

//     climbCost[step] = cost[step] + Math.min(oneStep, twoStep);

//     return climbCost[step];
//   }
// }

// O(n) time & O(n) space complexity ---- Bottom-up + tabulation
// function minCostClimbingStairs(cost: number[]): number {
//   const n = cost.length;
//   const climbCost: number[] = new Array(n + 1).fill(0);

//   for (let i = 2; i <= n; i++) {
//     const oneStep = climbCost[i - 1] + cost[i - 1];
//     const twoStep = climbCost[i - 2] + cost[i - 2];

//     climbCost[i] = Math.min(oneStep, twoStep);
//   }

//   return climbCost[n];
// }

// O(n) time & O(1) space complexity ---- Bottom-up + tabulation + space optimization
function minCostClimbingStairs(cost: number[]): number {
  const n = cost.length;

  // Base cases: starting at either of the first two stairs costs nothing.
  let prev2 = 0; // step - 2 = 0
  let prev1 = 0; // step - 1 = 1

  for (let step = 2; step <= n; step++) {
    // Calculate the minimum cost to reach the current position.
    const oneStep = prev1 + cost[step - 1];
    const twoSteps = prev2 + cost[step - 2];
    const curr = Math.min(oneStep, twoSteps);

    // Keep only the previous two DP values.
    prev2 = prev1;
    prev1 = curr;
  }

  // Position n represents the top beyond the last stair.
  return prev1;
}

runTests(minCostClimbingStairs, [
  { input: [[10, 15, 20]], output: 15 },
  { input: [[1, 100, 1, 1, 1, 100, 1, 1, 100, 1]], output: 6 },
]);
