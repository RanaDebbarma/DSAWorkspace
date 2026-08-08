import { execSync } from "node:child_process";
import * as p from "@clack/prompts";
import { parseLeetCodeText, formatParsedCasesForTs } from "#utils/testcase-parser.js";

async function main() {
  p.intro("  ✦ LeetCode Test Case Parser  ");

  let rawClipboard = "";
  try {
    rawClipboard = execSync("powershell -command Get-Clipboard", { encoding: "utf-8" });
  } catch {
    p.cancel("Could not read clipboard.");
    process.exit(1);
  }

  if (!rawClipboard.trim()) {
    p.cancel("Clipboard is empty! Copy example text from LeetCode first.");
    process.exit(0);
  }

  const parsed = parseLeetCodeText(rawClipboard);

  if (parsed.length === 0) {
    p.log.warn("Clipboard preview:\n" + rawClipboard.trim().slice(0, 150));
    p.cancel("No valid LeetCode test cases found in clipboard.");
    process.exit(0);
  }

  const formatted = formatParsedCasesForTs(parsed);

  // Copy formatted TS test case code back to clipboard
  execSync("clip", { input: formatted });

  if (parsed[0].type === "class") {
    p.outro("  ✔ Parsed Class Design test case! Clipboard updated — press Ctrl+V in your file.");
  } else {
    p.outro(`  ✔ Parsed ${parsed.length} test case(s)! Clipboard updated — press Ctrl+V in your file.`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
