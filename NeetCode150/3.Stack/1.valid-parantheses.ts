import { runTests, TestCase } from "#functions/code-tester.js";

function isValid(s: string): boolean {
  // if length is odd it returns
  if (s.length & 1) return false;

  const pairs: Record<string, string> = {
    ")": "(",
    "]": "[",
    "}": "{",
  };

  const stack: string[] = [];

  for (const ch of s) {
    if (pairs[ch] === undefined) {
      stack.push(ch);
    } else if (stack.pop() !== pairs[ch]) {
      return false;
    }
  }

  return stack.length === 0;
}

const inputs: TestCase<typeof isValid>[] = [
  // { input: ["()"], output: true },
  // { input: ["()[]{}"], output: true },
  // { input: ["(]"], output: false },
  { input: ["([])"], output: true },
  { input: ["([)]"], output: false },
  
  // Edge
  { input: ["]"], output: false },
];

runTests(isValid, inputs, true);
