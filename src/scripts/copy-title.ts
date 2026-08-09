import { execSync } from "node:child_process";
import { titleFormat } from "#utils/title-helper.js";

const userInput = process.argv.slice(2).join(" ");
const title = userInput.length ? userInput : "Lowest Common Ancestor of a Binary Search Tree";
const formatted = titleFormat(title);

// Native Windows clip utility reads the input stream flawlessly.
// No nested quoting, no character-escaping, no shell stream pollution.
execSync("clip", { input: formatted });

console.log(formatted);