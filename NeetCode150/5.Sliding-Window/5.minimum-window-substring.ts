import { runTests } from "#functions/code-tester.js";

// LeetCode 76

// o(m + n) time where [m = s.length & n = t.length]
// o(u) space where [u = unique characters]
// function minWindow(s: string, t: string): string {
//   if (t.length > s.length || t === "") return "";

//   const need = new Map<string, number>();
//   const window = new Map<string, number>();

//   for (const ch of t) {
//     need.set(ch, (need.get(ch) ?? 0) + 1);
//   }

//   let have = 0;
//   const needCount = need.size;

//   let l = 0;

//   let minStart = 0;
//   let minLength = Infinity;

//   for (let r = 0; r < s.length; r++) {
//     const ch = s[r];

//     if (need.has(ch)) {
//       window.set(ch, (window.get(ch) ?? 0) + 1);

//       if (window.get(ch) === need.get(ch)) {
//         have++;
//       }
//     }

//     while (have === needCount) {
//       const windowLength = r - l + 1;

//       if (windowLength < minLength) {
//         minLength = windowLength;
//         minStart = l;
//       }

//       const leftChar = s[l];

//       if (window.has(leftChar)) {
//         window.set(leftChar, window.get(leftChar)! - 1);

//         if (window.get(leftChar)! < need.get(leftChar)!) {
//           have--;
//         }
//       }

//       l++;
//     }
//   }

//   return minLength === Infinity ? "" : s.slice(minStart, minStart + minLength);
// }

// o(1) space optmization with constraints
function minWindow(s: string, t: string): string {
  if (t.length > s.length) return "";

  const need = new Int32Array(128);
  const window = new Int32Array(128);

  // Number of distinct characters we need to satisfy.
  let required = 0;

  for (let i = 0; i < t.length; i++) {
    const code = t.charCodeAt(i);

    if (need[code] === 0) required++;
    need[code]++;
  }

  // Number of distinct characters currently satisfied.
  let formed = 0;

  let l = 0;
  let minStart = 0;
  let minLength = Infinity;

  for (let r = 0; r < s.length; r++) {
    const code = s.charCodeAt(r);

    // Only track characters that are required.
    if (need[code] > 0) {
      window[code]++;

      // Character just reached its required frequency.
      if (window[code] === need[code]) {
        formed++;
      }
    }

    // Window contains all required characters.
    while (formed === required) {
      const windowLength = r - l + 1;

      if (windowLength < minLength) {
        minLength = windowLength;
        minStart = l;
      }

      const leftCode = s.charCodeAt(l);

      if (need[leftCode] > 0) {
        // Removing this makes the window invalid.
        if (window[leftCode] === need[leftCode]) {
          formed--;
        }

        window[leftCode]--;
      }

      l++;
    }
  }

  return minLength === Infinity ? "" : s.slice(minStart, minStart + minLength);
}

runTests(minWindow, [
  { input: ["OUZODYXAZV", "XYZ"], output: "YXAZ" },
  { input: ["xyz", "xyz"], output: "xyz" },
  { input: ["x", "xy"], output: "" },
  { input: ["ADOBECODEBANC", "ABC"], output: "BANC" },
]);
