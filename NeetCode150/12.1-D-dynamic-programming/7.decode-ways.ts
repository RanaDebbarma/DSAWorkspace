import { runCompare, runTests, TestCase } from "#functions/code-tester.js";

// LeetCode 91

// time: O(2^n)
// space: O(n)
// brute-force
function numDecodings_BF(s: string): number {
  const n = s.length;

  return dfs(0);

  function dfs(i: number): number {
    if (i === n) return 1;

    // invlaid
    if (s[i] === "0") return 0;

    // take single digit
    let ways = dfs(i + 1);

    // take double digit
    if (i + 1 < n && Number(s.slice(i, i + 2)) <= 26) {
      ways += dfs(i + 2);
    }

    return ways;
  }
}

// time: O(n)
// space: O(n)
// top-down + memo
function numDecodings_TDM(s: string): number {
  const n = s.length;
  const memo: (number | undefined)[] = Array(n);

  return dfs(0);

  function dfs(i: number): number {
    if (i === n) return 1;
    if (s[i] === "0") return 0;

    if (memo[i] !== undefined) return memo[i];

    memo[i] = dfs(i + 1);

    if (i + 1 < n && Number(s.slice(i, i + 2)) <= 26) {
      memo[i] += dfs(i + 2);
    }

    return memo[i];
  }
}

// time: O(n)
// space: O(n)
// bottom-up + tabulation
function numDecodings_BUT(s: string): number {
  const n = s.length;
  const dp = Array(n + 1).fill(0);

  dp[0] = 1;

  for (let i = 1; i <= n; i++) {
    // Choice 1: Decode one digit
    if (s[i - 1] !== "0") {
      dp[i] += dp[i - 1];
    }

    // Choice 2: Decode two digits
    if (i < 2) continue;
    const twoDigit = Number(s.substring(i - 2, i));
    if (twoDigit >= 10 && twoDigit <= 26) {
      dp[i] += dp[i - 2];
    }
  }

  return dp[n];
}

// time: O(n)
// space: O(1)
// bottom-up + space optimized
function numDecodings_BUSO(s: string): number {
  const n = s.length;
  let prev2 = 1, // dp[i - 2]
    prev1 = 1; // dp[i - 1]

  for (let i = 1; i <= n; i++) {
    let curr = 0;

    // single digit;
    if (s[i - 1] !== "0") {
      curr = prev1;
    }

    // double digit
    if (i >= 2) {
      const twoDigit = Number(s[i - 2] + s[i - 1]);
      if (twoDigit >= 10 && twoDigit <= 26) {
        curr += prev2;
      }
    }

    prev2 = prev1;
    prev1 = curr;
  }

  return prev1;
}

const cases: TestCase<typeof numDecodings_BF>[] = [
  { input: ["12"], output: 2 },
  { input: ["01"], output: 0 },
  { input: ["12"], output: 2 },
  { input: ["226"], output: 3 },
  { input: ["06"], output: 0 },
  { input: ["10"], output: 1 },
];

runTests(numDecodings_BUSO, cases);
runCompare(
  [numDecodings_BF, numDecodings_TDM, numDecodings_BUT, numDecodings_BUSO],
  cases,
);
