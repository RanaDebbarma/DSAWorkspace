import { runTests } from "#functions/code-tester.js";

// LeetCode 1436

function destCity(paths: string[][]): string {
  const pathMap =  new Map();

  for (const [from, to] of paths) {
    pathMap.set(from, to);
  }
  
  let curr = paths[0][0];
  while(pathMap.has(curr)) {
    curr = pathMap.get(curr);
  }

  return curr;
}

runTests(destCity, [
  {
    input: [
      [
        ["London", "New York"],
        ["New York", "Lima"],
        ["Lima", "Sao Paulo"],
      ],
    ],
    output: "Sao Paulo",
  },
  {
    input: [
      [
        ["B", "C"],
        ["D", "B"],
        ["C", "A"],
      ],
    ],
    output: "A",
  },
  { input: [[["A", "Z"]]], output: "Z" },
]);
