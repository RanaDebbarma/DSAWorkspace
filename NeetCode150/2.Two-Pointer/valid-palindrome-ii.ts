import { runTests } from "#functions/code-tester.js";

function validPalindrome(s: string): boolean {
  let l = 0;
  let r = s.length - 1;

  while (l < r) {
    if (s[l] === s[r]) {
      l++;
      r--;
    } else {
      return checkPalindrome(s, l + 1, r) || checkPalindrome(s, l, r - 1);
    }
  }

  return true;
}

function checkPalindrome(s: string, l: number, r: number) {
  while (l < r) {
    if (s[l] !== s[r]) return false;
    l++;
    r--;
  }

  return true;
}

runTests(validPalindrome, [
  { input: ["aca"], output: true },
  { input: ["abbadc"], output: false },
  { input: ["abbda"], output: true },
  { input: ["acdccba"], output: false },
  { input: ["ab"], output: true },
  { input: ["eceec"], output: true },
  {
    input: [
      "aguokepatgbnvfqmgmlcupuufxoohdfpgjdmysgvhmvffcnqxjjxqncffvmhvgsymdjgpfdhooxfuupuculmgmqfvnbgtapekouga",
    ],
    output: true,
  },
]);
