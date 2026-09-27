import { runTests } from "#functions/code-tester.js";
import { createGraph, GraphNode } from "#ds/graph.js";

// LeetCode 133

function cloneGraph(node: GraphNode | null): GraphNode | null {
  return node;
}

// Note: smartCompare automatically handles cycles and compares Graph structures!
runTests(cloneGraph, [
  {
    input: [createGraph([[2], [1, 3], [2]])],
    output: createGraph([[2], [1, 3], [2]]),
  },
  { input: [createGraph([[]])], output: createGraph([[]]) },
  { input: [createGraph([])], output: createGraph([]) },
  {
    input: [
      createGraph([
        [2, 4],
        [1, 3],
        [2, 4],
        [1, 3],
      ]),
    ],
    output: createGraph([
      [2, 4],
      [1, 3],
      [2, 4],
      [1, 3],
    ]),
  },
]);
