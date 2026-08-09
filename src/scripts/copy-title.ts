import { execSync } from "node:child_process";
import path from "node:path";
import { titleFormat } from "#utils/title-helper.js";
import { findWorkspaceTsFiles } from "#utils/file-detector.js";

let userInput = process.argv.slice(2).join(" ").trim();

if (!userInput) {
  const detectedFiles = findWorkspaceTsFiles();
  if (detectedFiles.length > 0) {
    const topFile = detectedFiles[0];
    const basename = path.basename(topFile.absolutePath, ".ts").replace(/^\d+\./, "");
    userInput = basename.replace(/[-_]/g, " ");
  }
}

const title = userInput.length ? userInput : "untitled";
const formatted = titleFormat(title);

// Native Windows clip utility reads the input stream flawlessly.
// No nested quoting, no character-escaping, no shell stream pollution.
execSync("clip", { input: formatted });

console.log(formatted);
