import * as p from "@clack/prompts";
import fs from "node:fs";
import path from "node:path";
import { titleFormat, toCamelCase } from "#utils/title-helper.js";
import { TEMPLATES } from "#templates/boilerplates.js";

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Scan target directory for files like `N.*.ts` and return the next number, or null. */
function detectNextNumber(dir: string): number | null {
  if (!fs.existsSync(dir)) return null;
  const entries = fs.readdirSync(dir);
  const nums: number[] = [];

  for (const entry of entries) {
    const match = entry.match(/^(\d+)\./);
    if (match) nums.push(parseInt(match[1], 10));
  }

  if (nums.length === 0) return null;
  return Math.max(...nums) + 1;
}

/** Build the output filename from optional number + slug. */
function buildFilename(number: string, slug: string): string {
  const num = number.trim();
  const name = slug.trim() || "untitled";
  return num ? `${num}.${name}.ts` : `${name}.ts`;
}

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

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const targetDir = process.env.INIT_CWD || process.cwd();
  const argFile = process.argv[2]; // e.g. `pnpm new practice.ts` or `pnpm template practice.ts`

  p.intro("  ✦ DSA Template & File Generator  ");

  let outputPath = "";
  let rawName = "";

  if (argFile) {
    // Direct file argument provided: e.g. `pnpm new practice.ts` or `pnpm template practice.ts`
    outputPath = path.resolve(targetDir, argFile);
    const basename = path.basename(outputPath);
    rawName = basename.replace(/\.ts$/i, "").replace(/^\d+\./, "");
    p.log.info(`Target file: ${path.relative(process.cwd(), outputPath)}`);
  } else {
    // No CLI argument provided. Ask whether to create a new file or populate an existing file.
    const existingTsFiles = listTsFilesInDir(targetDir);
    let mode: "new" | "existing" = "new";

    if (existingTsFiles.length > 0) {
      const modeChoice = await p.select({
        message: "What would you like to do?",
        options: [
          { label: "🆕 Create a new problem file (e.g. 13.my-problem.ts)", value: "new" },
          { label: "📝 Populate template into an existing file", value: "existing" },
        ],
      });

      if (p.isCancel(modeChoice)) {
        p.cancel("Cancelled.");
        process.exit(0);
      }
      mode = modeChoice as "new" | "existing";
    }

    if (mode === "existing") {
      const fileOptions = [
        ...existingTsFiles.map((f) => ({ label: f, value: f })),
        { label: "✏️  Enter a custom file path...", value: "custom" },
      ];

      const chosenFile = await p.select({
        message: "Select target file to populate template into",
        options: fileOptions,
      });

      if (p.isCancel(chosenFile)) {
        p.cancel("Cancelled.");
        process.exit(0);
      }

      if (chosenFile === "custom") {
        const customPath = await p.text({
          message: "Enter target file path",
          placeholder: "e.g. ./playground/practice/practice.ts",
          initialValue: "",
        });

        if (p.isCancel(customPath) || !(customPath as string).trim()) {
          p.cancel("Cancelled.");
          process.exit(0);
        }

        outputPath = path.resolve(targetDir, (customPath as string).trim());
      } else {
        outputPath = path.resolve(targetDir, chosenFile as string);
      }

      const basename = path.basename(outputPath);
      rawName = basename.replace(/\.ts$/i, "").replace(/^\d+\./, "");
    } else {
      // Create new problem file workflow
      const detected = detectNextNumber(targetDir);
      const detectedHint = detected !== null ? `(auto-detected: ${detected})` : "(none found)";

      const numberInput = await p.text({
        message: `Problem number ${detectedHint}`,
        placeholder: detected !== null ? String(detected) : "e.g. 42 (leave blank for no prefix)",
        initialValue: detected !== null ? String(detected) : "",
      });

      if (p.isCancel(numberInput)) {
        p.cancel("Cancelled.");
        process.exit(0);
      }

      const nameInput = await p.text({
        message: "Problem name",
        placeholder: "e.g. Valid Sudoku (leave blank for 'untitled')",
        initialValue: "",
      });

      if (p.isCancel(nameInput)) {
        p.cancel("Cancelled.");
        process.exit(0);
      }

      rawName = (nameInput as string).trim() || "untitled";
      const slug = titleFormat(rawName);
      const filename = buildFilename(numberInput as string, slug);
      outputPath = path.join(targetDir, filename);
    }
  }

  // Derive function name
  const fnName = toCamelCase(rawName) || "solution";

  // Check Clipboard for testcases & infer signature/template
  let clipboardCasesStr: string | undefined = undefined;
  let sig: import("#utils/testcase-parser.js").SignatureInfo | undefined = undefined;
  let inferredTemplateType: string | undefined = undefined;

  try {
    const { execSync } = await import("node:child_process");
    const rawClipboard = execSync("powershell -command Get-Clipboard", { encoding: "utf-8" });
    const {
      parseLeetCodeText,
      formatParsedCasesForTs,
      inferFunctionSignature,
      detectTemplateType,
    } = await import("#utils/testcase-parser.js");

    const parsed = parseLeetCodeText(rawClipboard);
    if (parsed.length > 0) {
      inferredTemplateType = detectTemplateType(parsed);
      clipboardCasesStr = formatParsedCasesForTs(parsed, inferredTemplateType);
      sig = inferFunctionSignature(parsed, inferredTemplateType);
      p.log.info(
        `✔ Auto-filled ${parsed.length} testcase(s) & inferred signature (${sig.paramsCode}): ${sig.returnType}`
      );
    }
  } catch {
    // Ignore clipboard read errors
  }

  // Template selection
  const templateChoice = await p.select({
    message: "Select boilerplate template",
    initialValue: inferredTemplateType || "standard",
    options: TEMPLATES.map((t) => ({
      label: t.label,
      value: t.value,
    })),
  });

  if (p.isCancel(templateChoice)) {
    p.cancel("Cancelled.");
    process.exit(0);
  }

  // Re-format clipboard cases if user picked a template different from auto-inferred
  if (clipboardCasesStr && inferredTemplateType && templateChoice !== inferredTemplateType) {
    try {
      const { execSync } = await import("node:child_process");
      const rawClipboard = execSync("powershell -command Get-Clipboard", { encoding: "utf-8" });
      const { parseLeetCodeText, formatParsedCasesForTs, inferFunctionSignature } = await import(
        "#utils/testcase-parser.js"
      );
      const parsed = parseLeetCodeText(rawClipboard);
      clipboardCasesStr = formatParsedCasesForTs(parsed, templateChoice as string);
      sig = inferFunctionSignature(parsed, templateChoice as string);
    } catch {
      // Ignore
    }
  }

  const chosen = TEMPLATES.find((t) => t.value === templateChoice)!;
  const content = chosen.fn(fnName, clipboardCasesStr, sig);

  // If target file exists and is non-empty, prompt for confirmation
  if (fs.existsSync(outputPath)) {
    const stat = fs.statSync(outputPath);
    if (stat.size > 0) {
      p.log.warn(
        `File already exists (${stat.size} bytes): ${path.relative(process.cwd(), outputPath)}`
      );
      const overwrite = await p.confirm({
        message: "Populate template and overwrite current file contents?",
        initialValue: true,
      });
      if (!overwrite || p.isCancel(overwrite)) {
        p.cancel("Aborted — file was not modified.");
        process.exit(0);
      }
    }
  } else {
    // Create parent directory if it doesn't exist
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  fs.writeFileSync(outputPath, content, "utf-8");

  // Automatically open in VS Code
  try {
    const { execSync } = await import("node:child_process");
    execSync(`code "${outputPath}"`);
  } catch {
    // Ignore if 'code' CLI is not in PATH
  }

  const relativeOutput = path.relative(process.cwd(), outputPath);
  p.outro(`  ✔ Populated & opened: ${relativeOutput}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
