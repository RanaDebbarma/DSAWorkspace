import { runTests } from "#functions/code-tester.js";

// LeetCode 210

// DFS + 3 state
function findOrder(numCourses: number, prerequisites: number[][]): number[] {
  const order: number[] = [];
  const preReqMap = new Map<number, number[]>();

  for (const [course, preReq] of prerequisites) {
    if (!preReqMap.has(course)) {
      preReqMap.set(course, []);
    }
    preReqMap.get(course)!.push(preReq);
  }

  // 0 = unvisited, 1 = visiting, 2 = processed
  const state = new Int32Array(numCourses);

  for (let course = 0; course < numCourses; course++) {
    if (!dfs(course)) return [];
  }

  return order;

  function dfs(course: number): boolean {
    if (state[course] === 1) return false;
    if (state[course] === 2) return true;

    state[course] = 1;

    for (const preReq of preReqMap.get(course) ?? []) {
      if (!dfs(preReq)) return false;
    }

    state[course] = 2;
    order.push(course);
    return true;
  }
}

// Kahn's Algorithm (BFS)

runTests(
  findOrder,
  [
    { input: [1, []], output: [0] },
    { input: [2, [[1, 0]]], output: [0, 1] },
    { input: [3, [[1, 0]]], output: [0, 1, 2] },
    {
      input: [
        3,
        [
          [0, 1],
          [1, 2],
          [2, 0],
        ],
      ],
      output: [],
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
      output: [0, 2, 1, 3],
    },
  ],
  { showHint: false },
);
