import { runTests } from "#functions/code-tester.js";

// LeetCode 91

function numDecodings(s: string): number {
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

  console.log(dp);
  return dp[n];
}

runTests(numDecodings, [
  { input: ["12"], output: 2 },
  { input: ["01"], output: 0 },
  { input: ["12"], output: 2 },
  { input: ["226"], output: 3 },
  { input: ["06"], output: 0 },
]);
