import * as p from "@clack/prompts";
import fs from "node:fs";
import path from "node:path";
import { toCamelCase } from "#utils/title-helper.js";
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

async function main() {
  const targetDir = process.env.INIT_CWD || process.cwd();
  const argFile = process.argv[2]; // optional: pnpm template practice.ts

  p.intro("  ✦ Write Template to File  ");

  let outputPath = "";

  if (argFile) {
    outputPath = path.resolve(targetDir, argFile);
    p.log.info(`Target: ${path.relative(process.cwd(), outputPath)}`);
  } else {
    const wsRoot = getWorkspaceRoot(targetDir);
    const detectedFiles = findWorkspaceTsFiles(targetDir, { includeSrc: true });

    const promptCustomPath = async (): Promise<string> => {
      const val = await p.text({
        message: "Enter file path",
        placeholder: "e.g. playground/practice/practice.ts",
      });
      if (p.isCancel(val) || !(val as string).trim()) {
        p.cancel("Cancelled.");
        process.exit(0);
      }
      return path.resolve(wsRoot, (val as string).trim());
    };

    if (detectedFiles.length === 0) {
      outputPath = await promptCustomPath();
    } else {
      const recentFile = detectedFiles[0];
      p.log.info(`Recent:   ${recentFile.relativePath}`);

      const selectOptions = [
        {
          label: `✦  ${recentFile.relativePath}  (most recent)`,
          value: recentFile.absolutePath,
        },
        ...detectedFiles.slice(1, 7).map((f) => ({
          label: `   ${f.relativePath}${f.isInTargetDir ? "  📁" : ""}`,
          value: f.absolutePath,
        })),
        { label: "✏️   Enter a different file path...", value: "custom" },
      ];

      const chosen = await p.select({
        message: "Write template to:",
        initialValue: recentFile.absolutePath,
        options: selectOptions,
      });
      if (p.isCancel(chosen)) { p.cancel("Cancelled."); process.exit(0); }
      outputPath = chosen === "custom" ? await promptCustomPath() : (chosen as string);
    }
  }

  if (!fs.existsSync(outputPath)) {
    p.cancel(`File not found: ${path.relative(process.cwd(), outputPath)}`);
    process.exit(1);
  }

  const basename = path.basename(outputPath);
  const rawName = basename.replace(/\.ts$/i, "").replace(/^\d+\./, "");
  const fnName = toCamelCase(rawName) || "solution";

  // ── Check Clipboard for testcases & infer signature ──────────────────────
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
    message: "Template:",
    initialValue: inferredTemplateType || "standard",
    options: TEMPLATES.map((t) => ({ label: t.label, value: t.value })),
  });
  if (p.isCancel(templateChoice)) { p.cancel("Cancelled."); process.exit(0); }

  if (clipboardCasesStr && inferredTemplateType && templateChoice !== inferredTemplateType && rawClipboard.trim()) {
    const parsed = parseLeetCodeText(rawClipboard);
    clipboardCasesStr = formatParsedCasesForTs(parsed, templateChoice as string);
    sig = inferFunctionSignature(parsed, templateChoice as string);
  }

  // ── Overwrite confirmation ───────────────────────────────────────────────
  const stat = fs.statSync(outputPath);
  if (stat.size > 0) {
    p.log.warn(`File has content (${stat.size} bytes) — will be overwritten`);
    const ok = await p.confirm({
      message: "Overwrite with new template?",
      initialValue: true,
    });
    if (!ok || p.isCancel(ok)) {
      p.cancel("Aborted.");
      process.exit(0);
    }
  }

  const chosen = TEMPLATES.find((t) => t.value === templateChoice)!;
  const content = chosen.fn(fnName, clipboardCasesStr, sig);
  fs.writeFileSync(outputPath, content, "utf-8");

  // ── Open in VS Code ──────────────────────────────────────────────────────
  try {
    const { execSync } = await import("node:child_process");
    execSync(`code "${outputPath}"`);
  } catch {
    // ignore if code CLI not in PATH
  }

  p.outro(`  ✔ Template written: ${path.relative(process.cwd(), outputPath)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
