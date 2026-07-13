import {
  runTests,
  TestCase,
  compareGroupAnagrams,
} from "#functions/code-tester.js";

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
  const groups = new Map<string, string[]>();
  const a = "a".charCodeAt(0); // 97

  for (const word of strs) {
    const signature = convertKey(word);
    const existing = groups.get(signature);

    if (existing) {
      existing.push(word);
    } else {
      groups.set(signature, [word]);
    }
  }
  return [...groups.values()];
  
  function convertKey(str: string): string {
    const count = new Array(26).fill(0);
    for (const s of str) {
      const idx = s.charCodeAt(0) - a;
      count[idx]++;
    }
    return count.join("#");
  }
}

const inputs: TestCase<typeof groupAnagrams>[] = [
  {
    input: [["eat", "tea", "tan", "ate", "nat", "bat"]],
    output: [["bat"], ["nat", "tan"], ["ate", "eat", "tea"]],
    compare: compareGroupAnagrams,
  },
  { input: [[""]], output: [[""]], compare: compareGroupAnagrams },
  { input: [["a"]], output: [["a"]], compare: compareGroupAnagrams },
];

runTests(groupAnagrams, inputs);
