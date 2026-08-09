import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import * as p from "@clack/prompts";
import {
  parseLeetCodeText,
  formatParsedCasesForTs,
  detectTemplateType,
  readClipboard,
  ParsedResult,
} from "#utils/testcase-parser.js";

/** Find all .ts files in target directory. */
function listTsFilesInDir(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  try {
    return fs
      .readdirSync(dir)
      .filter((file) => file.endsWith(".ts") && !file.endsWith(".d.ts"));
  } catch {
    return [];
  }
}

/** Detect template type from target file content or fallback to parsed cases. */
export function detectFileTemplate(fileContent: string, fallbackCases: ParsedResult[]): string {
  if (fileContent.includes("runClassTests")) return "class-design";
  if (fileContent.includes("createBinaryTree") || fileContent.includes("#ds/tree.js")) return "binary-tree";
  if (fileContent.includes("createCyclicLinkedList")) return "cyclic-linked-list";
  if (fileContent.includes("createLinkedList") || fileContent.includes("#ds/linked-list.js")) return "linked-list";
  if (fileContent.includes("createGraph") || fileContent.includes("#ds/graph.js")) return "graph";
  
  return detectTemplateType(fallbackCases);
}

/** Appends formatted test cases into runTests or runClassTests array in fileContent. */
export function appendTestCasesToFile(fileContent: string, formattedCasesStr: string): string {
  const match = fileContent.match(/(runTests|runClassTests)\s*\(\s*([^,]+),\s*\[/);
  if (!match || match.index === undefined) {
    const trimmed = fileContent.trimEnd();
    return `${trimmed}\n\nrunTests(solution, [\n${formattedCasesStr}\n]);\n`;
  }

  const arrayStartIdx = match.index + match[0].length - 1;

  let depth = 0;
  let arrayEndIdx = -1;
  let inString = false;
  let stringChar = "";
  let escaped = false;

  for (let i = arrayStartIdx; i < fileContent.length; i++) {
    const char = fileContent[i];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (char === "\\") {
      escaped = true;
      continue;
    }
    if (inString) {
      if (char === stringChar) {
        inString = false;
      }
      continue;
    }
    if (char === '"' || char === "'" || char === "`") {
      inString = true;
      stringChar = char;
      continue;
    }
    if (char === "[") {
      depth++;
    } else if (char === "]") {
      depth--;
      if (depth === 0) {
        arrayEndIdx = i;
        break;
      }
    }
  }

  if (arrayEndIdx === -1) {
    return `${fileContent.trimEnd()}\n\n// Appended Testcases:\n${formattedCasesStr}\n`;
  }

  const beforeEnd = fileContent.slice(0, arrayEndIdx);
  const afterEnd = fileContent.slice(arrayEndIdx);

  const trimmedBefore = beforeEnd.trimEnd();
  const needsComma = !trimmedBefore.endsWith(",") && !trimmedBefore.endsWith("[");
  const commaSeparator = needsComma ? "," : "";

  return `${trimmedBefore}${commaSeparator}\n${formattedCasesStr}\n${afterEnd.trimStart()}`;
}

async function main() {
  const targetDir = process.env.INIT_CWD || process.cwd();
  const argFile = process.argv[2];

  p.intro("  ✦ Appending Testcases to Problem File  ");

  // Read Clipboard
  const rawClipboard = readClipboard();

  if (!rawClipboard.trim()) {
    p.cancel("Clipboard is empty! Copy testcase text from LeetCode first.");
    process.exit(0);
  }

  const parsed = parseLeetCodeText(rawClipboard);
  if (parsed.length === 0) {
    p.log.warn("Clipboard preview:\n" + rawClipboard.trim().slice(0, 150));
    p.cancel("No valid LeetCode test cases found in clipboard.");
    process.exit(0);
  }

  p.log.info(`✔ Parsed ${parsed.length} testcase(s) from clipboard`);

  // Target file resolution
  let outputPath = "";
  if (argFile) {
    outputPath = path.resolve(targetDir, argFile);
  } else {
    const existingTsFiles = listTsFilesInDir(targetDir);
    if (existingTsFiles.length === 0) {
      const customPath = await p.text({
        message: "No .ts files found in current folder. Enter target file path:",
        placeholder: "e.g. practice.ts",
      });
      if (p.isCancel(customPath) || !(customPath as string).trim()) {
        p.cancel("Cancelled.");
        process.exit(0);
      }
      outputPath = path.resolve(targetDir, (customPath as string).trim());
    } else {
      const chosenFile = await p.select({
        message: "Select target file to append testcases to",
        options: [
          ...existingTsFiles.map((f) => ({ label: f, value: f })),
          { label: "✏️  Enter custom file path...", value: "custom" },
        ],
      });

      if (p.isCancel(chosenFile)) {
        p.cancel("Cancelled.");
        process.exit(0);
      }

      if (chosenFile === "custom") {
        const customPath = await p.text({
          message: "Enter target file path",
          placeholder: "e.g. ./playground/practice/practice.ts",
        });
        if (p.isCancel(customPath) || !(customPath as string).trim()) {
          p.cancel("Cancelled.");
          process.exit(0);
        }
        outputPath = path.resolve(targetDir, (customPath as string).trim());
      } else {
        outputPath = path.resolve(targetDir, chosenFile as string);
      }
    }
  }

  if (!fs.existsSync(outputPath)) {
    p.cancel(`File does not exist: ${path.relative(process.cwd(), outputPath)}`);
    process.exit(1);
  }

  const existingContent = fs.readFileSync(outputPath, "utf-8");
  const templateType = detectFileTemplate(existingContent, parsed);
  const formattedCases = formatParsedCasesForTs(parsed, templateType);

  const updatedContent = appendTestCasesToFile(existingContent, formattedCases);
  fs.writeFileSync(outputPath, updatedContent, "utf-8");

  // Open file in VS Code
  try {
    execSync(`code "${outputPath}"`);
  } catch {
    // Ignore if 'code' CLI is not installed
  }

  const relativePath = path.relative(process.cwd(), outputPath);
  p.outro(`  ✔ Appended ${parsed.length} testcase(s) into: ${relativePath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
