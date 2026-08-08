import { runTests } from "#functions/code-tester.js";

// LeetCode 392

const solve = function isSubsequence(s: string, t: string): boolean {
  
  let i = 0;
  for (const ch of t) {
    if (ch === s[i]) {
      i++;
    }
  }

  return s.length === i;
};

runTests(solve, [
  { input: ["abc", "lahbgdc"], output: true },
  { input: ["axc", "ahbgdc"], output: false },
  { input: ["node", "neetcode"], output: true },
]);
