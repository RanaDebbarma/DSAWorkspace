import { execSync } from "node:child_process";
import { titleFormat } from "#lib/helper.js";

// This will now print perfectly without causing any side-channel crashes

// const title = process.argv.slice(2).join(" ");
const title = "Linked List Cycle";
const formatted = titleFormat(title);

// Native Windows clip utility reads the input stream flawlessly.
// No nested quoting, no character-escaping, no shell stream pollution.
execSync("clip", { input: formatted });

console.log(formatted);


// prev
// const title = "Two Sum II Input Array Is Sorted";

// const formatted = titleFormat(title);
// // Safely doubles the single quotes so Windows PowerShell doesn't break
// const safeString = formatted.replaceAll("'", "''");
// execSync(`powershell -command "Set-Clipboard '${safeString}'"`);

// console.log(formatted);