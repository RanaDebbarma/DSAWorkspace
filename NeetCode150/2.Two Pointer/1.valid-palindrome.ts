import { runTests, TestCase } from "#functions/code-tester.js";

// O(n) time and space complexity
// function isPalindrome(s: string) {
//   const str = s.toLocaleLowerCase().replace(/[^a-z0-9]/g, "");

//   let [left, right] = [0, str.length - 1];

//   while (left < right) {
//     if (!(str[left] === str[right])) return false;
//     left++;
//     right--;
//   }
//   return true;
// }

// O(n) time and o(1) space complexity
// function isPalindrome(s: string): boolean {
//   const [CAP_A, CAP_Z, SM_A, SM_Z, ZERO, NINE] = [..."AZaz09"].map((c) =>
//     c.charCodeAt(0),
//   );

//   function checkAlphaNum(ch: string): boolean {
//     const chCode = ch.charCodeAt(0);
//     return (
//       (chCode >= CAP_A && chCode <= CAP_Z) ||
//       (chCode >= SM_A && chCode <= SM_Z) ||
//       (chCode >= ZERO && chCode <= NINE)
//     );
//   }

//   let [l, r] = [0, s.length - 1];
//   while (l < r) {
//     while (l < r && !checkAlphaNum(s[l])) l++;
//     while (l < r && !checkAlphaNum(s[r])) r--;

//     if (s[l].toLowerCase() !== s[r].toLowerCase()) return false;

//     l++;
//     r--;
//   }

//   return true;
// }

// Readability optimization
function isValidChar(char: string) {
  const code = char.charCodeAt(0);
  return (
    (code >= 97 && code <= 122) ||
    (code >= 65 && code <= 90) ||
    (code >= 48 && code <= 57)
  );
}
function isPalindrome(s: string) {
  let [left, right] = [0, s.length - 1];

  while (left < right) {
    while (left < right && !isValidChar(s[left])) {
      left++;
    }

    while (left < right && !isValidChar(s[right])) {
      right--;
    }

    const lChar = s[left].toLowerCase();
    const rChar = s[right].toLowerCase();
    if (lChar !== rChar) return false;

    left++;
    right--;
  }
  return true;
}

const inputs: TestCase<typeof isPalindrome>[] = [
  { input: ["A man, a plan, a canal: Panama"], output: true },
  { input: ["race a car"], output: false },
  { input: [" "], output: true },
];

runTests(isPalindrome, inputs);
