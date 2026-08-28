import { runClassTests } from "#functions/code-tester.js";

// LeetCode 208

class PrefixTree {
  constructor() {}

  insert(word: string): void {}

  search(word: string): boolean {
    return true;
  }

  startsWith(prefix: string): boolean {
    return true;
  }
}

runClassTests(PrefixTree, [
  {
    operations: [
      "Trie",
      "insert",
      "search",
      "search",
      "startsWith",
      "insert",
      "search",
    ],
    args: [[], ["apple"], ["apple"], ["app"], ["app"], ["app"], ["app"]],
    expected: [null, null, true, false, true, null, true],
  },
  {
    operations: [
      "Trie",
      "insert",
      "search",
      "search",
      "startsWith",
      "insert",
      "search",
    ],
    args: [[], ["dog"], ["dog"], ["do"], ["do"], ["do"], ["do"]],
    expected: [null, null, true, false, true, null, true],
  },
]);
