import { runClassTests } from "#functions/code-tester.js";

// LeetCode 211

class TrieNode {
  children = new Array(26);
  isWord = false;
}

class WordDictionary {
  root: TrieNode;

  constructor() {
    this.root = new TrieNode();
  }

  addWord(word: string): void {
    let node = this.root;

    for (let i = 0; i < word.length; i++) {
      const code = word.charCodeAt(i) - 97;

      if (!node.children[code]) {
        node.children[code] = new TrieNode();
      }

      node = node.children[code];
    }

    node.isWord = true;
  }

  search(word: string): boolean {
    return dfs(this.root, 0);

    function dfs(node: TrieNode, i: number): boolean {
      let curr = node;

      for (; i < word.length; i++) {
        if (word[i] === ".") {
          for (let idx = 0; idx < 26; idx++) {
            if (curr.children[idx]) {
              if (dfs(curr.children[idx], i + 1)) return true;
            }
          }
          return false;
        } else {
          const code = word.charCodeAt(i) - 97;

          if (!curr.children[code]) return false;

          curr = curr.children[code];
        }
      }

      return curr.isWord;
    }
  }
}

runClassTests(WordDictionary, [
  {
    operations: [
      "WordDictionary",
      "addWord",
      "addWord",
      "addWord",
      "search",
      "search",
      "search",
      "search",
    ],
    args: [[], ["day"], ["bay"], ["may"], ["say"], ["day"], [".ay"], ["b.."]],
    expected: [null, null, null, null, false, true, true, true],
  },
]);
