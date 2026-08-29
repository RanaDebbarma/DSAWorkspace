import { runClassTests } from "#functions/code-tester.js";

// LeetCode 208
class TrieNode {
  children = new Array(26).fill(null);
  isWord = false;
}

class PrefixTree {
  private root: TrieNode;

  constructor() {
    this.root = new TrieNode();
  }

  insert(word: string): void {
    let node = this.root;

    for (let i = 0; i < word.length; i++) {
      const idx = word.charCodeAt(i) - 97;

      if(!node.children[idx]) {
        node.children[idx] = new TrieNode()
      }

      node = node.children[idx];
    }

    node.isWord = true;
  }

  search(word: string): boolean {
    let node = this.root;

    for(let i = 0; i < word.length; i++) {
      const idx = word.charCodeAt(i) - 97;

      if (!node.children[idx]) return false;

      node = node.children[idx];
    }

    return node.isWord;
  }

  startsWith(prefix: string): boolean {
    let node = this.root;

    for(let i = 0; i < prefix.length; i++) {
      const idx = prefix.charCodeAt(i) - 97;

      if (!node.children[idx]) return false;

      node = node.children[idx];
    }

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
