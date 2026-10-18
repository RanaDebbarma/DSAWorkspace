import { runCompare, runTests, TestCase } from "#functions/code-tester.js";

// LeetCode 647

// time: O(n^2)
// space: O(n^2)
// Bottom-Up --- Tabulation
// function countSubstrings_BU(s: string): number {
//   const n = s.length;
//   const dp: boolean[][] = Array.from({ length: n }, () => Array(n).fill(false));

//   let palindromes = 0;

//   for (let left = n - 1; left >= 0; left--) {
//     for (let right = left; right < n; right++) {
//       dp[left][right] =
//         s[left] === s[right] &&
//         (right - left + 1 <= 2 || dp[left + 1][right - 1]);

//       if (dp[left][right]) palindromes++;
//     }
//   }

//   return palindromes;
// }

// Time: O(n²)
// Space: O(n²)
// Bottom-Up — Tabulation (with helper funtion)
function countSubstrings_BU(s: string): number {
  const n = s.length;
  const dp: boolean[][] = Array.from({ length: n }, () => Array(n).fill(false));

  let palindromes = 0;

  for (let left = n - 1; left >= 0; left--) {
    for (let right = left; right < n; right++) {
      if (isPalindrome(left, right)) palindromes++;
    }
  }

  return palindromes;

  function isPalindrome(left: number, right: number): boolean {
    dp[left][right] =
      s[left] === s[right] && (right - left <= 1 || dp[left + 1][right - 1]);

    return dp[left][right];
  }
}

// Time: O(n²)
// Space: O(1)
// Expand Around Center
function countSubstrings_EAC(s: string): number {
  const n = s.length;
  let palindromes = 0;

  for (let i = 0; i < n; i++) {
    expand(i, i);
    expand(i, i + 1);
  }

  return palindromes;

  function expand(left: number, right: number): void {
    while (left >= 0 && right < n && s[left] === s[right]) {
      palindromes++;
      left--;
      right++;
    }
  }
}

const cases: TestCase<typeof countSubstrings_BU>[] = [
  { input: ["abc"], output: 3 },
  { input: ["aaa"], output: 6 },
];

runTests(countSubstrings_EAC, cases);
runCompare([countSubstrings_BU, countSubstrings_EAC], cases, {
  showTests: false,
  fnDisplay: "number",
});
