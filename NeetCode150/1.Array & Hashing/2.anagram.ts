import { runTests } from "#functions/code-tester.js";

// function isAnagram(s: string, t: string): boolean {
//   if (s.length !== t.length) return false;

//   const count = new Array<number>(26).fill(0);
//   for (let i = 0; i < s.length; i++) {
//     const idx = s.codePointAt(i)! - "a".codePointAt(0)!;
//     count[idx]++;
//   }
//   for (let i = 0; i < t.length; i++) {
//     const idx = t.codePointAt(i)! - "a".codePointAt(0)!;
//     count[idx]--;
//     if (count[idx] === -1) return false;
//   }

//   return true;
// }

// for unicode
function isAnagram(s: string, t: string): boolean {
  if (s.length !== t.length) return false;

  const count = new Map<string, number>();

  for (const ch of s) {
    count.set(ch, (count.get(ch) ?? 0) + 1);
  }

  for (const ch of t) {
    const freq = count.get(ch)!;
    if (!freq) return false;
    count.set(ch, freq - 1);
  }
  return true;
}

runTests(isAnagram, [
  { input: ["anagram", "nagaram"], output: true },
  { input: ["rat", "car"], output: false },

  // unicode
  // { input: ["anagram🔥", "naga🔥ram"], output: true },
  // { input: ["rac🙂", "c🙂ar"], output: true },
  // { input: ["rac🙂", "c🔥ar"], output: false },

  // edge
  { input: ["aab", "abb"], output: false },
]);
