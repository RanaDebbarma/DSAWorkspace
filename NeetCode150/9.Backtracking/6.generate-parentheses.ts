import { runTests } from "#functions/code-tester.js";

// LeetCode 22

function generateParentheses(n: number): string[] {
  let strs: string[] = [];

  backtrack(0, 0, "");

  return strs;

  function backtrack(open: number, close: number, str: string) {
    // Complete valid combination
    if (open === n && close === n) {
      strs.push(str);
      return;
    }

    // Can add '(' while under the limit
    if (open < n) {
      backtrack(open + 1, close, str + "(");
    }

    // Can add ')' only when it won't make the string invalid
    if (open > close) {
      backtrack(open, close + 1, str + ")");
    }
  }
}

runTests(
  generateParentheses,
  [
    { input: [1], output: ["()"] },
    { input: [3], output: ["((()))", "(()())", "(())()", "()(())", "()()()"] },
  ],
  { showHint: false },
);
