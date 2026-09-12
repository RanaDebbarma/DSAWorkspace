import { runTests } from "#functions/code-tester.js";

// LeetCode 212

class TrieNode {
  children: (TrieNode | undefined)[] = new Array(26);
  word: string | null = null;

  insert(word: string) {
    let node: TrieNode = this;

    // Build the Trie path for the word
    for (let i = 0; i < word.length; i++) {
      const code = word.charCodeAt(i) - 97;

      if (!node.children[code]) {
        node.children[code] = new TrieNode();
      }

      node = node.children[code];
    }

    // Mark the end of a complete word
    node.word = word;
  }
}

function findWords(board: string[][], words: string[]): string[] {
  const root = new TrieNode();
  const res: string[] = [];

  // Build Trie from all words
  for (const word of words) {
    root.insert(word);
  }

  const ROWS = board.length;
  const COLS = board[0].length;

  // Try starting DFS from every cell
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      dfs(r, c, root);
    }
  }

  return res;

  function dfs(r: number, c: number, node: TrieNode) {
    // Out of bounds
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return;

    const char = board[r][c];

    // Already visited in current path
    if (char === "#") return;

    const index = char.charCodeAt(0) - 97;
    const next = node.children[index];

    // Not a valid Trie prefix
    if (!next) return;

    // Found a complete word
    if (next.word !== null) {
      res.push(next.word);
      next.word = null; // Prevent duplicates
    }

    // Mark current cell as visited
    board[r][c] = "#";

    // Explore all 4 directions
    dfs(r - 1, c, next);
    dfs(r + 1, c, next);
    dfs(r, c - 1, next);
    dfs(r, c + 1, next);

    // Backtrack: restore the cell
    board[r][c] = char;
  }
}

runTests(
  findWords,
  [
    {
      input: [
        [
          ["a", "b", "c", "d"],
          ["s", "a", "a", "t"],
          ["a", "c", "k", "e"],
          ["a", "c", "d", "n"],
        ],
        ["bat", "cat", "back", "backend", "stack"],
      ],
      output: ["cat", "back", "backend"],
    },
    {
      input: [
        [
          ["o", "a", "a", "n"],
          ["e", "t", "a", "e"],
          ["i", "h", "k", "r"],
          ["i", "f", "l", "v"],
        ],
        ["oath", "pea", "eat", "rain"],
      ],
      output: ["eat", "oath"],
    },
    {
      input: [
        [
          ["x", "o"],
          ["x", "o"],
        ],
        ["xoxo"],
      ],
      output: [],
    },
  ],
  { showHint: false, unordered: true },
);
