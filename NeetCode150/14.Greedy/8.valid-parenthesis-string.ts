import { runCompare, runTests, TestCase } from "#functions/code-tester.js";

// LeetCode 678

// time: O(n)
// space: O(1)
// greedy
function checkValidString(s: string): boolean {
  let minOpen = 0;
  let maxOpen = 0;

  for (const ch of s) {
    if (ch === "(") {
      minOpen++;
      maxOpen++;
    } else if (ch === ")") {
      minOpen--;
      maxOpen--;
    } else {
      minOpen--;
      maxOpen++;
    }

    if (maxOpen < 0) return false;

    minOpen = Math.max(0, minOpen);
  }

  return minOpen === 0;
}

const cases: TestCase<typeof checkValidString>[] = [
  // leetcode
  { input: ["()"], output: true },
  { input: ["(*)"], output: true },
  { input: ["(*))"], output: true },
  { input: ["("], output: false },

  // neetcode
  { input: ["((**)"], output: true },
  { input: ["(((*)"], output: false },

  // edge
  { input: [")("], output: false },
];

runTests(checkValidString, cases);
runCompare([checkValidString], cases);
