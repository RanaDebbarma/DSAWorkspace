import { runTests } from "#functions/code-tester.js";

// LeetCode 71

// time: O(n)
// space: O(n)
function simplifyPath(path: string): string {
  const len = path.length;
  const simplifiedPath: string[] = [];

  let i = 0;
  while (i < len) {
    while (i < len && path[i] === "/") i++;

    const start = i;
    while (i < len && path[i] !== "/") i++;

    const fileName = path.slice(start, i);

    if (fileName === "..") simplifiedPath.length && simplifiedPath.pop();
    else if (fileName && fileName !== ".") simplifiedPath.push(fileName);
  }

  return `/${simplifiedPath.join("/")}`;
}

runTests(
  simplifyPath,
  [
    { input: ["/home/"], output: "/home" },
    { input: ["/home//foo/"], output: "/home/foo" },
    {
      input: ["/home/user/Documents/../Pictures"],
      output: "/home/user/Pictures",
    },
    { input: ["/../"], output: "/" },
    { input: ["/.../a/../b/c/../d/./"], output: "/.../b/d" },
    { input: ["/a/b/../../.."], output: "/" },
  ],
  { showHint: false },
);
