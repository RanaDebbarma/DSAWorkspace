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

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  // Use INIT_CWD set by pnpm/npm when invoked from a subfolder, fallback to process.cwd()
  const targetDir = process.env.INIT_CWD || process.cwd();

  p.intro("  ✦ DSA File Generator  ");

  // ── Step 1: Number ──────────────────────────────────────────────────────
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

  // ── Step 2: Name ─────────────────────────────────────────────────────────
  const nameInput = await p.text({
    message: "Problem name",
    placeholder: "e.g. Valid Sudoku (leave blank for 'untitled')",
    initialValue: "",
  });

  if (p.isCancel(nameInput)) {
    p.cancel("Cancelled.");
    process.exit(0);
  }

  const rawName = (nameInput as string).trim() || "untitled";
  const slug = titleFormat(rawName);       // "valid-sudoku"
  const fnName = toCamelCase(rawName);     // "validSudoku"

  // ── Step 3: Template ─────────────────────────────────────────────────────
  const templateChoice = await p.select({
    message: "Select a template",
    options: TEMPLATES.map((t) => ({
      label: t.label,
      value: t.value,
    })),
  });

  if (p.isCancel(templateChoice)) {
    p.cancel("Cancelled.");
    process.exit(0);
  }

  // ── Generate ─────────────────────────────────────────────────────────────
  const chosen = TEMPLATES.find((t) => t.value === templateChoice)!;
  const content = chosen.fn(fnName);

  const filename = buildFilename(numberInput as string, slug);
  const outputPath = path.join(targetDir, filename);

  if (fs.existsSync(outputPath)) {
    p.log.warn(`File already exists: ${filename}`);
    const overwrite = await p.confirm({
      message: "Overwrite it?",
      initialValue: false,
    });
    if (!overwrite || p.isCancel(overwrite)) {
      p.cancel("Aborted — file was not overwritten.");
      process.exit(0);
    }
  }

  fs.writeFileSync(outputPath, content, "utf-8");

  const relativeOutput = path.relative(process.cwd(), outputPath);
  p.outro(`  ✔ Created: ${relativeOutput}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
