import { runTests } from "#functions/code-tester.js";

// LeetCode 207

// first approach
// function canFinish(numCourses: number, prerequisites: number[][]): boolean {
//   const reqMap = new Map<number, number[]>();
//   const visited = new Set<number>();

//   for (const [req, course] of prerequisites) {
//     if (!reqMap.has(course)) {
//       reqMap.set(course, []);
//     }
//     reqMap.get(course)!.push(req);
//   }

//   for (let c = 0; c < numCourses; c++) {
//     if (!dfs(c, visited)) return false;
//   }

//   return true;

//   function dfs(node: number, visited: Set<number>): boolean {
//     if (visited.has(node)) return false;

//     const currNode = reqMap.get(node)!;

//     if (!currNode) return true;

//     visited.add(node);

//     for(const n of currNode) {
//       if (!dfs(n, visited)) return false;
//     }

//     visited.delete(node);

//     return true;
//   }
// }

// DFS + 3-state
function canFinish(numCourses: number, prerequisites: number[][]): boolean {
  const prereqMap = new Map<number, number[]>();

  // Build adjacency list: course -> prerequisites
  for (const [prereq, course] of prerequisites) {
    if (!prereqMap.has(course)) {
      prereqMap.set(course, []);
    }
    prereqMap.get(course)!.push(prereq);
  }

  // 0 = unvisited
  // 1 = currently visiting (in current DFS path)
  // 2 = fully processed (no cycle found)
  const state = new Uint8Array(numCourses);

  for (let course = 0; course < numCourses; course++) {
    if (state[course] === 0 && !hasCycle(course)) return false;
  }

  return true;

  function hasCycle(node: number): boolean {
    // Found node already in current DFS path → cycle
    if (state[node] === 1) return false;

    // Already checked this node and its dependencies
    if (state[node] === 2) return true;

    state[node] = 1;

    for (const prereq of prereqMap.get(node) ?? []) {
      if (!hasCycle(prereq)) return false;
    }

    // Fully processed
    state[node] = 2;

    return true;
  }
}

runTests(canFinish, [
  { input: [2, [[0, 1]]], output: true },
  {
    input: [
      2,
      [
        [0, 1],
        [1, 0],
      ],
    ],
    output: false,
  },
  {
    input: [
      4,
      [
        [1, 0],
        [2, 0],
        [3, 1],
        [3, 2],
      ],
    ],
    output: true,
  },
  {
    input: [
      4,
      [
        [1, 0],
        [3, 2],
        [2, 3],
      ],
    ],
    output: false,
  },
]);
