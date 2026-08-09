import * as p from "@clack/prompts";
import fs from "node:fs";
import path from "node:path";
import { titleFormat, toCamelCase } from "#utils/title-helper.js";
import { TEMPLATES } from "#templates/boilerplates.js";
import {
  readClipboard,
  parseLeetCodeText,
  formatParsedCasesForTs,
  inferFunctionSignature,
  detectTemplateType,
  SignatureInfo,
} from "#utils/testcase-parser.js";
import { findWorkspaceTsFiles, getWorkspaceRoot } from "#utils/file-detector.js";

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

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const targetDir = process.env.INIT_CWD || process.cwd();
  const argFile = process.argv[2]; // e.g. `pnpm new practice.ts`

  p.intro("  ✦ DSA Template & File Generator  ");

  let outputPath = "";
  let rawName = "";

  if (argFile) {
    // Direct file argument: `pnpm new practice.ts` or `pnpm new 5.my-problem.ts`
    outputPath = path.resolve(targetDir, argFile);
    const basename = path.basename(outputPath);
    rawName = basename.replace(/\.ts$/i, "").replace(/^\d+\./, "");
    p.log.info(`Target file: ${path.relative(process.cwd(), outputPath)}`);
  } else {
    const wsRoot = getWorkspaceRoot(targetDir);
    const isAtRoot = path.resolve(targetDir).toLowerCase() === wsRoot.toLowerCase();
    const detectedFiles = findWorkspaceTsFiles(targetDir, { includeSrc: true });

    // ── Step 1: Decide what to do ──────────────────────────────────────────
    type Action = "new_here" | "new_recent" | "new_choose" | "existing";

    let action: Action;

    // Most recently modified file — its folder is where the user is likely working
    const recentFile = detectedFiles[0];
    const recentFolder = recentFile ? path.dirname(recentFile.absolutePath) : targetDir;
    const relRecentFolder = path.relative(wsRoot, recentFolder).replace(/\\/g, "/") || ".";
    const relTermDir = path.relative(wsRoot, targetDir).replace(/\\/g, "/") || ".";
    const recentIsSameAsTerminal = recentFolder.toLowerCase() === path.resolve(targetDir).toLowerCase();

    const locationOptions: { label: string; value: string }[] = [];

    // If recent file's folder is different from terminal dir, show it as the first (auto-detected) option
    if (recentFile && !recentIsSameAsTerminal) {
      locationOptions.push({
        label: `✦ Create here (${relRecentFolder})  (auto-detected)`,
        value: "new_recent",
      });
    }
    locationOptions.push(
      { label: `🆕 Create here (${relTermDir})  (terminal directory)`, value: "new_here" },
      { label: "📂 Create in a different directory...", value: "new_choose" },
      { label: "📝 Populate template into an existing file...", value: "existing" }
    );

    if (recentFile && !recentIsSameAsTerminal) {
      p.log.info(`Recent file: ${recentFile.relativePath}`);
    }

    const choice = await p.select({
      message: "Where would you like to create the new problem file?",
      initialValue: recentFile && !recentIsSameAsTerminal ? "new_recent" : "new_here",
      options: locationOptions,
    });
    if (p.isCancel(choice)) { p.cancel("Cancelled."); process.exit(0); }
    action = choice as Action;

    // ── Step 2: Determine creation dir or existing file ───────────────────
    let creationDir = targetDir;

    if (action === "new_recent") {
      creationDir = recentFolder;
    } else if (action === "new_choose") {
      const customDir = await p.text({
        message: "Enter target directory path",
        placeholder: `e.g. NeetCode150/3.Stack`,
        initialValue: "",
      });
      if (p.isCancel(customDir) || !(customDir as string).trim()) {
        p.cancel("Cancelled.");
        process.exit(0);
      }
      creationDir = path.resolve(wsRoot, (customDir as string).trim());
    }

    if (action === "existing") {
      // ── Browse / custom path for existing file ─────────────────────────
      const promptCustomPath = async (): Promise<string> => {
        const customPath = await p.text({
          message: "Enter target file path",
          placeholder: "e.g. ./playground/practice/practice.ts",
          initialValue: "",
        });
        if (p.isCancel(customPath) || !(customPath as string).trim()) {
          p.cancel("Cancelled.");
          process.exit(0);
        }
        return path.resolve(targetDir, (customPath as string).trim());
      };

      if (detectedFiles.length === 0) {
        outputPath = await promptCustomPath();
      } else {
        const fileOptions = [
          ...detectedFiles.slice(0, 7).map((f) => ({
            label: `${f.relativePath}${f.isInTargetDir ? "  📁" : ""}`,
            value: f.absolutePath,
          })),
          { label: "✏️  Enter a custom file path...", value: "custom" },
        ];

        const chosen = await p.select({
          message: "Select file to populate template into",
          initialValue: detectedFiles[0].absolutePath,
          options: fileOptions,
        });
        if (p.isCancel(chosen)) { p.cancel("Cancelled."); process.exit(0); }
        outputPath = chosen === "custom" ? await promptCustomPath() : (chosen as string);
      }

      const basename = path.basename(outputPath);
      rawName = basename.replace(/\.ts$/i, "").replace(/^\d+\./, "");
    } else {
      // ── Create new file ────────────────────────────────────────────────
      const relFolder = path.relative(process.cwd(), creationDir).replace(/\\/g, "/") || ".";
      p.log.info(`Target directory: ${relFolder}`);

      const detected = detectNextNumber(creationDir);
      const detectedHint = detected !== null ? `(auto-detected: ${detected})` : "(none found)";

      const numberInput = await p.text({
        message: `Problem number ${detectedHint}`,
        placeholder: detected !== null ? String(detected) : "e.g. 42 (leave blank for no prefix)",
        initialValue: detected !== null ? String(detected) : "",
      });
      if (p.isCancel(numberInput)) { p.cancel("Cancelled."); process.exit(0); }

      const nameInput = await p.text({
        message: "Problem name",
        placeholder: "e.g. Valid Sudoku (leave blank for 'untitled')",
        initialValue: "",
      });
      if (p.isCancel(nameInput)) { p.cancel("Cancelled."); process.exit(0); }

      rawName = (nameInput as string).trim() || "untitled";
      const slug = titleFormat(rawName);
      const filename = buildFilename(numberInput as string, slug);
      outputPath = path.join(creationDir, filename);
    }
  }

  // ── Derive function name ─────────────────────────────────────────────────
  const fnName = toCamelCase(rawName) || "solution";

  // ── Check Clipboard for testcases & infer signature/template ────────────
  let clipboardCasesStr: string | undefined = undefined;
  let sig: SignatureInfo | undefined = undefined;
  let inferredTemplateType: string | undefined = undefined;

  const rawClipboard = readClipboard();
  if (rawClipboard.trim()) {
    const parsed = parseLeetCodeText(rawClipboard);
    if (parsed.length > 0) {
      inferredTemplateType = detectTemplateType(parsed);
      clipboardCasesStr = formatParsedCasesForTs(parsed, inferredTemplateType);
      sig = inferFunctionSignature(parsed, inferredTemplateType);
      p.log.info(
        `✔ Auto-filled ${parsed.length} testcase(s) & inferred signature (${sig.paramsCode}): ${sig.returnType}`
      );
    }
  }

  // ── Template selection ───────────────────────────────────────────────────
  const templateChoice = await p.select({
    message: "Select boilerplate template",
    initialValue: inferredTemplateType || "standard",
    options: TEMPLATES.map((t) => ({
      label: t.label,
      value: t.value,
    })),
  });
  if (p.isCancel(templateChoice)) { p.cancel("Cancelled."); process.exit(0); }

  // Re-format clipboard cases if user picked a different template
  if (clipboardCasesStr && inferredTemplateType && templateChoice !== inferredTemplateType && rawClipboard.trim()) {
    const parsed = parseLeetCodeText(rawClipboard);
    clipboardCasesStr = formatParsedCasesForTs(parsed, templateChoice as string);
    sig = inferFunctionSignature(parsed, templateChoice as string);
  }

  const chosen = TEMPLATES.find((t) => t.value === templateChoice)!;
  const content = chosen.fn(fnName, clipboardCasesStr, sig);

  // ── Overwrite confirmation if file exists ────────────────────────────────
  if (fs.existsSync(outputPath)) {
    const stat = fs.statSync(outputPath);
    if (stat.size > 0) {
      p.log.warn(`File already exists (${stat.size} bytes): ${path.relative(process.cwd(), outputPath)}`);
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
