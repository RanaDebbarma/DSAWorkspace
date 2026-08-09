import { runTests } from "#functions/code-tester.js";

// O(n * klogk)
// function groupAnagrams(strs: string[]): string[][] {

//   const res: string[][] = []
//   const sortedStrs = new Map

//   strs.forEach(str => {
//     const key = str.split("").sort().join("")
//     if(sortedStrs.has(key)) {
//       sortedStrs.get(key).push(str)
//     } else {
//       sortedStrs.set(key, [str])
//     }
//   })

//   for (const entry of sortedStrs) {
//     res.push(entry[1])
//   }

//   return res
// }

// O(n * k) Optimization with constaint
function groupAnagrams(strs: string[]): string[][] {
  const groupMap = new Map<string, string[]>();

  for (const word of strs) {
    const signature = convertKey(word);
    const group = groupMap.get(signature) ?? [];

    group.push(word);
    groupMap.set(signature, group);
  }
  return Array.from(groupMap.values());

  function convertKey(word: string): string {
    const freq = new Int32Array(26);
    const OFFSET = 97; // "a".charCodeAt(0)

    for (let i = 0; i < word.length; i++) {
      const idx = word.charCodeAt(i) - OFFSET;
      freq[idx]++;
    }
    return freq.join("#");
  }
}

runTests(groupAnagrams, [
  {
    input: [["eat", "tea", "tan", "ate", "nat", "bat"]],
    output: [["bat"], ["nat", "tan"], ["ate", "eat", "tea"]],
  },
  { input: [[""]], output: [[""]] },
  { input: [["a"]], output: [["a"]] },
]);
