import { runTests } from "#functions/code-tester.js";

// LeetCode 127

// O((m^2) * n) time and O(m * n) space complexity
// m is length of each word
//n is the number of words in wordList
function ladderLength(
  beginWord: string,
  endWord: string,
  wordList: string[],
): number {
  const wordSet = new Set(wordList);

  // The destination must exist in the word list.
  if (!wordSet.has(endWord)) return 0;

  const queue: string[] = [beginWord];
  const visited = new Set<string>([beginWord]);

  let head = 0;
  let transformations = 1; // Count words, including beginWord.

  while (head < queue.length) {
    // Process only the words belonging to the current BFS level.
    const levelSize = queue.length - head;

    for (let level = 0; level < levelSize; level++) {
      const currentWord = queue[head++];

      // BFS guarantees the shortest transformation sequence.
      if (currentWord === endWord) return transformations;

      // Explore all valid one-character transformations.
      for (const nextWord of nextPossibleWords(currentWord)) {
        if (visited.has(nextWord)) continue;

        // Mark visited when enqueuing to prevent duplicates.
        visited.add(nextWord);
        queue.push(nextWord);
      }
    }

    // Move to the next level of transformations.
    transformations++;
  }

  // No valid transformation sequence exists.
  return 0;

  function nextPossibleWords(word: string): string[] {
    const neighbors: string[] = [];
    const characters = word.split("");

    for (let i = 0; i < characters.length; i++) {
      const originalChar = characters[i];

      // Try replacing the current character with every lowercase letter.
      for (let charCode = 97; charCode <= 122; charCode++) {
        const replacementChar = String.fromCharCode(charCode);

        if (replacementChar === originalChar) continue;

        characters[i] = replacementChar;
        const candidate = characters.join("");

        // Keep only valid words that haven't been discovered yet.
        if (wordSet.has(candidate) && !visited.has(candidate)) {
          neighbors.push(candidate);
        }
      }

      // Restore the original character before moving to the next position.
      characters[i] = originalChar;
    }

    return neighbors;
  }
}

runTests(ladderLength, [
  { input: ["cat", "sag", ["bat", "bag", "sag", "dag", "dot"]], output: 4 },
  { input: ["cat", "sag", ["bat", "bag", "sat", "dag", "dot"]], output: 0 },
  {
    input: ["hit", "cog", ["hot", "dot", "dog", "lot", "log", "cog"]],
    output: 5,
  },
  { input: ["hit", "cog", ["hot", "dot", "dog", "lot", "log"]], output: 0 },
]);
