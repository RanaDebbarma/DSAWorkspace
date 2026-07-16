import { runTests } from "#functions/code-tester.js";

// class Solution {
//   encode(strs: string[]): string {
//     const encoded = encodeURIComponent(JSON.stringify(strs));
//     return encoded;
//   }

//   decode(str: string): string[] {
//     const decoded: string[] = JSON.parse(decodeURIComponent(str));
//     return decoded;
//   }
// }

// Intended Leetcode solution
class Solution {
  encode(strs: string[]): string {
    let result: string = "";
    for (const str of strs) {
      result += `${str.length}#${str}`;
    }
    // console.log(result);
    return result;
  }

  // decode(str: string): string[] {
  //   const result: string[] = [];

  //   let i = 0;
  //   while (i < str.length) {
  //     // Extract length
  //     let lengthStr = "";
  //     while (str[i] !== "#" && i < str.length) {
  //       lengthStr += str[i];
  //       i++;
  //     }
  //     // skip over '#'
  //     i++;
  //     const length = Number(lengthStr);

  //     // extract word
  //     const word = str.substring(i, i + length);
  //     result.push(word);

  //     // skip extracted word
  //     i += length;
  //   }

  //   return result;
  // }

  // cleaner
  decode(str: string): string[] {
    const result: string[] = [];
    let i = 0;

    while (i < str.length) {
      // Find the next '#' delimiter starting from index i
      const hashIndex = str.indexOf("#", i);

      // Extract the length and convert to number
      const length = Number(str.substring(i, hashIndex));

      // Move pointer past the '#'
      i = hashIndex + 1;

      // Extract the word based on the length
      const word = str.substring(i, i + length);
      result.push(word);

      // Move pointer past the extracted word
      i += length;
    }

    return result;
  }
}

function customTest(input: string[]): string[] {
  const sol = new Solution();
  return sol.decode(sol.encode(input));
}

runTests(customTest, [
  { input: [["Hello", "World"]], output: ["Hello", "World"] },
  { input: [["Hello", "World!"]], output: ["Hello", "World!"] },
  { input: [["1Hello", "#$World!"]], output: ["1Hello", "#$World!"] },
]);
