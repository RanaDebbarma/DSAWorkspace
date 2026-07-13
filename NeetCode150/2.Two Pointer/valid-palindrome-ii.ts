const s =
  "aguokepatgbnvfqmgmlcupuufxoohdfpgjdmysgvhmvffcnqxjjxqncffvmhvgsymdjgpfdhooxfuupuculmgmqfvnbgtapekouga"; // True

const a = "aca"; // True
const b = "abbadc"; // False
const c = "abbda"; // True
const d = "acdccba"; // False
const e = "ab"; // True
const f = "eceec"; // True
const g = "eeecc"; // False

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
// console.log(checkPalindrome(a, 0, a.length - 1), "True");
// console.log(checkPalindrome(b, 0, b.length - 1), "False");

console.log(validPalindrome(s), "True");
console.log(validPalindrome(a), "True");
console.log(validPalindrome(b), "False");
console.log(validPalindrome(c), "True");
console.log(validPalindrome(d), "False");
console.log(validPalindrome(e), "True");
console.log(validPalindrome(f), "True");
console.log(validPalindrome(g), "False");
