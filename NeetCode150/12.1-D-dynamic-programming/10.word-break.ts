import { runCompare, runTests, TestCase } from "#functions/code-tester.js";

// LeetCode 139

// n: s.length; k: wordDict.length; L: max dic word length;

// time: O(k^n * k * L)
// time: O(n)
// Brute-Force
function wordBreak_BF(s: string, wordDict: string[]): boolean {
  const n = s.length;

  return dfs(0);

  // Attempts to segment the string starting from index i.
  function dfs(i: number): boolean {
    // Successfully consumed the entire string.
    if (i === n) return true;

    // Try every dictionary word at the current position.
    for (const word of wordDict) {
      // Skip words that would extend beyond the string.
      if (i + word.length > n) continue;

      // Check whether the current word matches the substring starting at i.
      let idx = 0;
      while (idx < word.length && s[i + idx] === word[idx]) idx++;

      // If the entire word matches, recursively try segmenting
      // the remaining string starting immediately after that word.
      if (idx === word.length && dfs(i + idx)) return true;
    }

    // No dictionary word leads to a valid segmentation.
    return false;
  }
}

// time: O(n x k x L)
// time: O(n)
// Top-down memoization
function wordBreak_TDM(s: string, wordDict: string[]): boolean {
  const n = s.length;
  const memo = new Array(n).fill(-1);

  return dfs(0);

  function dfs(i: number): boolean {
    if (i === n) return true;

    if (memo[i] !== -1) return memo[i] === 1;

    for (const word of wordDict) {
      if (i + word.length > n) continue;

      let idx = 0;
      while (idx < word.length && word[idx] === s[i + idx]) idx++;

      if (idx === word.length && dfs(i + idx)) {
        memo[i] = 1;
        return true;
      }
    }

    memo[i] = 0;
    return false;
  }
}


const cases: TestCase<typeof wordBreak_TDM>[] = [
  { input: ["leetcode", ["leet", "code"]], output: true },
  { input: ["applepenapple", ["apple", "pen"]], output: true },
  {
    input: ["catsandog", ["cats", "dog", "sand", "and", "cat"]],
    output: false,
  },
  { input: ["catsincars", ["cats", "cat", "sin", "in", "car"]], output: false },
];

runTests(wordBreak_TDM, cases);
runCompare([wordBreak_BF, wordBreak_TDM], cases);