import { runTests } from "#functions/code-tester.js";
import { createGraph, GraphNode } from "#ds/graph.js";

// LeetCode 133

// class Node {
//   public val: number | null = null;
//   public neighbors: Node[] = [];
// }

function cloneGraph(node: GraphNode | null): GraphNode | null {
  if (!node) return node;

  const stack: GraphNode[] = [node];
  const clones = new Map<GraphNode, GraphNode>();
  
  clones.set(node, new GraphNode(node.val));

  while (stack.length) {
    const currNode = stack.pop()!;
    const cloneNode = clones.get(currNode)!;

    for (const neighbor of currNode.neighbors) {
      if (!clones.has(neighbor)) {
        clones.set(neighbor, new GraphNode(neighbor.val));
        stack.push(neighbor);
      }

      cloneNode.neighbors.push(clones.get(neighbor)!);
    }
  }

  return clones.get(node)!;
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
