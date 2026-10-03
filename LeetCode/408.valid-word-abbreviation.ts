import { runTests } from "#functions/code-tester.js";

// LeetCode 408

function validWordAbbreviation(word: string, abbr: string): boolean {
  if (word.length < abbr.length) return false;

  let w = 0;
  let a = 0;

  while (w < word.length && a < abbr.length) {
    if (abbr[a] >= "0" && abbr[a] <= "9") {
      if (abbr[a] === "0") return false;

      let num = 0;
      while (a < abbr.length && abbr[a] >= "0" && abbr[a] <= "9") {
        num = num * 10 + Number(abbr[a]);
        a++;
      }
      w += num;
    } else {
      if (word[w] !== abbr[a]) return false;

      w++;
      a++;
    }
  }

  return w === word.length && a === abbr.length;
}

runTests(validWordAbbreviation, [
  { input: ["apple", "a3e"], output: true },
  { input: ["international", "i9l"], output: false },
  { input: ["abbreviation", "abbreviation"], output: true },
]);
