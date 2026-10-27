import { runCompare, runTests, TestCase } from "#functions/code-tester.js";

// LeetCode 5

// time: O(n^3)
// space: O(n)
// Brute-Force
function longestPalindrome_BF(s: string): string {
  const n = s.length;
  let res = "";

  for (let start = 0; start < n; start++) {
    for (let end = start; end < n; end++) {
      if (isPalindrome(start, end)) {
        const length = end - start + 1;
        if (length < res.length) continue;

        res = s.slice(start, end + 1);
      }
    }
  }

  return res;

  function isPalindrome(start: number, end: number): boolean {
    while (start < end) {
      if (s[start++] !== s[end--]) return false;
    }
    return true;
  }
}

// time: O(n^2)
// space: O(n^2)
// Bottom-Up --- Tabulation
function longestPalindrome_BU(s: string): string {
  const n = s.length;
  let res = "";

  // dp[start][end] stores whether s[start...end] is a palindrome
  const dp = Array.from({ length: n }, () => Array(n));

  // Process start in reverse so inner substring results are available
  for (let start = n - 1; start >= 0; start--) {
    for (let end = start; end < n; end++) {
      if (isPalindrome(start, end)) {
        const length = end - start + 1;
        if (length <= res.length) continue;

        res = s.slice(start, end + 1);
      }
    }
  }

  return res;

  function isPalindrome(start: number, end: number): boolean {
    // Matching outer characters + a palindromic inner substring
    // Substrings of length <= 3 need no inner check
    dp[start][end] =
      s[start] === s[end] && (end - start <= 2 || dp[start + 1][end - 1]);

    return dp[start][end];
  }
}

// Time: O(n²)
// Space: O(1) auxiliary space (excluding the returned string)
// Expand Around Center
function longestPalindrome_EAC(s: string): string {
  const n = s.length;
  let res = "";

  for (let center = 0; center < n; center++) {
    // Odd-length palindrome: one character at the center.
    expandAroundCenter(center, center);

    // Even-length palindrome: center lies between two characters.
    expandAroundCenter(center, center + 1);
  }

  return res;

  function expandAroundCenter(left: number, right: number): void {
    // Expand while the characters match.
    while (left >= 0 && right < n && s[left] === s[right]) {
      left--;
      right++;
    }

    // Pointers have crossed the palindrome's boundaries.
    // The actual palindrome is s[left + 1...right - 1].
    // length = (right - 1) - (left + 1) + 1;
    const length = right - left - 1;

    if (length > res.length) {
      res = s.slice(left + 1, right);
    }
  }
}

const cases: TestCase<typeof longestPalindrome_EAC>[] = [
  // { input: ["ababd"], output: "bab" },
  // { input: ["abbc"], output: "bb" },
  { input: ["babad"], output: "aba" },
  { input: ["cbbd"], output: "bb" },
  { input: ["ac"], output: "c" },
  { input: ["a"], output: "a" },
];

runTests([longestPalindrome_EAC], cases);
runCompare(
  [longestPalindrome_BF, longestPalindrome_BU, longestPalindrome_EAC],
  cases,
);
