import { runTests } from "#functions/code-tester.js";

// LeetCode 417

// recursive version
// function pacificAtlantic(heights: number[][]): number[][] {
//   const ROWS = heights.length;
//   const COLS = heights[0].length;
//   const DIRS = [
//     [-1, 0],
//     [1, 0],
//     [0, -1],
//     [0, 1],
//   ];

//   const pacific = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
//   const atlantic = Array.from({ length: ROWS }, () => Array(COLS).fill(false));

//   // Pacific: top + left
//   // Atlantic: bottom + right
//   for (let r = 0; r < ROWS; r++) {
//     dfs(r, 0, pacific);
//     dfs(r, COLS - 1, atlantic);
//   }

//   for (let c = 0; c < COLS; c++) {
//     dfs(0, c, pacific);
//     dfs(ROWS - 1, c, atlantic);
//   }

//   const res: number[][] = [];

//   for (let r = 0; r < ROWS; r++) {
//     for (let c = 0; c < COLS; c++) {
//       if (pacific[r][c] && atlantic[r][c]) {
//         res.push([r, c]);
//       }
//     }
//   }

//   return res;

//   function dfs(r: number, c: number, visited: boolean[][]): void {
//     if (r < 0 || r >= ROWS || c < 0 || c >= COLS || visited[r][c]) {
//       return;
//     }

//     visited[r][c] = true;

//     for (const [dr, dc] of DIRS) {
//       const nr = r + dr;
//       const nc = c + dc;

//       if (
//         nr < 0 ||
//         nr >= ROWS ||
//         nc < 0 ||
//         nc >= COLS ||
//         heights[nr][nc] < heights[r][c]
//       )
//         continue;

//       dfs(nr, nc, visited);
//     }
//   }
// }

// iterative version
function pacificAtlantic(heights: number[][]): number[][] {
  const ROWS = heights.length;
  const COLS = heights[0].length;
  const DIRS = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];

  const pacific = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
  const atlantic = Array.from({ length: ROWS }, () => Array(COLS).fill(false));

  for (let r = 0; r < ROWS; r++) {
    dfs(r, 0, pacific);
    dfs(r, COLS - 1, atlantic);
  }

  for (let c = 0; c < COLS; c++) {
    dfs(0, c, pacific);
    dfs(ROWS - 1, c, atlantic);
  }

  const res: number[][] = [];

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (pacific[r][c] && atlantic[r][c]) {
        res.push([r, c]);
      }
    }
  }

  return res;

  function dfs(r: number, c: number, visited: boolean[][]): void {
    const stack: [number, number][] = [[r, c]];

    while (stack.length) {
      const [r, c] = stack.pop()!;

      if (visited[r][c]) continue;

      visited[r][c] = true;

      for (const [dr, dc] of DIRS) {
        const nr = r + dr;
        const nc = c + dc;

        if (
          nr >= 0 &&
          nr < ROWS &&
          nc >= 0 &&
          nc < COLS &&
          !visited[nr][nc] &&
          heights[nr][nc] >= heights[r][c]
        ) {
          stack.push([nr, nc]);
        }
      }
    }
  }
}

// scallable to billions of cells (unnecessary for lc)
// function pacificAtlantic(heights: number[][]): number[][] {
//   const ROWS = heights.length;
//   const COLS = heights[0].length;
//   const SIZE = ROWS * COLS;

//   const PACIFIC = 1;
//   const ATLANTIC = 2;

//   // 1 byte per cell:
//   // 00 = neither
//   // 01 = Pacific
//   // 10 = Atlantic
//   // 11 = both
//   const reach = new Uint8Array(SIZE);

//   // Maximum possible DFS stack size is SIZE.
//   const stack = new Uint32Array(SIZE);

//   function dfs(start: number, ocean: number): void {
//     let top = 0;
//     stack[top++] = start;

//     while (top > 0) {
//       const i = stack[--top];

//       // Already visited for this ocean.
//       if (reach[i] & ocean) continue;

//       reach[i] |= ocean;

//       const r = Math.floor(i / COLS);
//       const c = i - r * COLS;
//       const height = heights[r][c];

//       // Up
//       if (r > 0) {
//         const ni = i - COLS;

//         if (!(reach[ni] & ocean) && heights[r - 1][c] >= height) {
//           stack[top++] = ni;
//         }
//       }

//       // Down
//       if (r + 1 < ROWS) {
//         const ni = i + COLS;

//         if (!(reach[ni] & ocean) && heights[r + 1][c] >= height) {
//           stack[top++] = ni;
//         }
//       }

//       // Left
//       if (c > 0) {
//         const ni = i - 1;

//         if (!(reach[ni] & ocean) && heights[r][c - 1] >= height) {
//           stack[top++] = ni;
//         }
//       }

//       // Right
//       if (c + 1 < COLS) {
//         const ni = i + 1;

//         if (!(reach[ni] & ocean) && heights[r][c + 1] >= height) {
//           stack[top++] = ni;
//         }
//       }
//     }
//   }

//   // Pacific border
//   for (let r = 0; r < ROWS; r++) {
//     dfs(r * COLS, PACIFIC);
//   }

//   for (let c = 0; c < COLS; c++) {
//     dfs(c, PACIFIC);
//   }

//   // Atlantic border
//   for (let r = 0; r < ROWS; r++) {
//     dfs(r * COLS + COLS - 1, ATLANTIC);
//   }

//   for (let c = 0; c < COLS; c++) {
//     dfs((ROWS - 1) * COLS + c, ATLANTIC);
//   }

//   const res: number[][] = [];

//   for (let i = 0; i < SIZE; i++) {
//     if (reach[i] === (PACIFIC | ATLANTIC)) {
//       const r = Math.floor(i / COLS);
//       const c = i - r * COLS;

//       res.push([r, c]);
//     }
//   }

//   return res;
// }

runTests(
  pacificAtlantic,
  [
    {
      input: [
        [
          [4, 2, 7, 3, 4],
          [7, 4, 6, 4, 7],
          [6, 3, 5, 3, 6],
        ],
      ],
      output: [
        [0, 2],
        [0, 4],
        [1, 0],
        [1, 1],
        [1, 2],
        [1, 3],
        [1, 4],
        [2, 0],
      ],
    },
    {
      input: [[[1], [1]]],
      output: [
        [0, 0],
        [1, 0],
      ],
    },
    {
      input: [
        [
          [1, 2, 2, 3, 5],
          [3, 2, 3, 4, 4],
          [2, 4, 5, 3, 1],
          [6, 7, 1, 4, 5],
          [5, 1, 1, 2, 4],
        ],
      ],
      output: [
        [0, 4],
        [1, 3],
        [1, 4],
        [2, 2],
        [3, 0],
        [3, 1],
        [4, 0],
      ],
    },
    { input: [[[1]]], output: [[0, 0]] },
  ],
  { showStringInput: false },
);
