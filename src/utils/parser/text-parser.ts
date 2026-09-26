/**
 * text-parser.ts — Entry point for the LeetCode/NeetCode test-case parser.
 *
 * This file wires together the sub-modules and provides the public API:
 *   parseLeetCodeText        — main parser (auto-detects Standard vs Class Design)
 *   parseStandardTestCases   — Standard problem parser
 *   parseOutputSegment       — output-segment value extractor
 *   extractParamsAndInputs   — input-segment param extractor
 *   readClipboard            — Windows clipboard reader
 *
 * Low-level helpers live in sibling files:
 *   types.ts       — shared interfaces (ParamInfo, StandardTestCase, ClassTestCase, …)
 *   json-repair.ts — repairJson, convertArgValue, parseValue, extractTopLevelJsonArrays
 *   class-parser.ts — tryParseClassDesign, tryParseClassBlock, parseInterleavedClassDesign
 */

import { execSync } from "node:child_process";

// Re-export everything so existing imports from "text-parser.js" keep working.
export type { ParamInfo, StandardTestCase, ClassTestCase, ParsedResult } from "./types.js";
export { repairJson, convertArgValue, parseValue, extractTopLevelJsonArrays } from "./json-repair.js";
export { tryParseClassDesign, tryParseClassBlock, parseInterleavedClassDesign } from "./class-parser.js";

import type { ParsedResult, StandardTestCase, ClassTestCase, ParamInfo } from "./types.js";
import { parseValue, extractTopLevelJsonArrays } from "./json-repair.js";
import { tryParseClassDesign } from "./class-parser.js";

// ─────────────────────────────────────────────────────────────────────────────
// Clipboard
// ─────────────────────────────────────────────────────────────────────────────

/** Reads text from the system clipboard via PowerShell on Windows. */
export function readClipboard(): string {
  try {
    return execSync("powershell -command Get-Clipboard", { encoding: "utf-8" });
  } catch {
    return "";
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Output segment
// ─────────────────────────────────────────────────────────────────────────────

export function parseOutputSegment(outputSegment: string): any {
  const trimmed = outputSegment.trim();
  if (!trimmed) return undefined;

  // Try strict JSON
  try { return JSON.parse(trimmed); } catch {}

  // Try Python-literal replacement
  const pythonFixed = trimmed
    .replace(/'/g, '"')
    .replace(/\bNone\b/g, "null")
    .replace(/\bTrue\b/g, "true")
    .replace(/\bFalse\b/g, "false")
    .replace(/\bundefined\b/g, "null");
  try { return JSON.parse(pythonFixed); } catch {}

  // Try first line only (some problems have trailing notes)
  const firstLine = trimmed.split("\n")[0].trim();
  try { return JSON.parse(firstLine); } catch {}
  try {
    return JSON.parse(
      firstLine
        .replace(/'/g, '"')
        .replace(/\bNone\b/g, "null")
        .replace(/\bTrue\b/g, "true")
        .replace(/\bFalse\b/g, "false")
        .replace(/\bundefined\b/g, "null"),
    );
  } catch {}

  // Scan for the first JSON array in the segment
  const topArrays = extractTopLevelJsonArrays(trimmed);
  if (topArrays.length > 0) return topArrays[0];

  return parseValue(firstLine) ?? parseValue(trimmed);
}

// ─────────────────────────────────────────────────────────────────────────────
// Input segment — param extraction
// ─────────────────────────────────────────────────────────────────────────────

/** Extracts named params and their values from a LeetCode `Input:` segment. */
export function extractParamsAndInputs(inputSegment: string): { params: ParamInfo[]; input: any[] } {
  const params: ParamInfo[] = [];
  const input:  any[]       = [];

  // Try `name = value` syntax (LeetCode standard format)
  const paramRegex = /(?:^|\s|,|\n)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=/g;
  const matches: { param: string; index: number; valStart: number }[] = [];
  let m: RegExpExecArray | null;

  while ((m = paramRegex.exec(inputSegment)) !== null) {
    matches.push({ param: m[1], index: m.index, valStart: m.index + m[0].length });
  }

  if (matches.length > 0) {
    for (let i = 0; i < matches.length; i++) {
      const start = matches[i].valStart;
      const end   = i + 1 < matches.length ? matches[i + 1].index : inputSegment.length;
      let rawVal  = inputSegment.slice(start, end).trim().replace(/,$/, "").trim();

      const parsedVal = parseValue(rawVal);
      params.push({ name: matches[i].param, value: parsedVal });
      input.push(parsedVal);
    }
    return { params, input };
  }

  // Fallback: one value per line
  inputSegment
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .forEach((line, idx) => {
      const val = parseValue(line);
      params.push({ name: `arg${idx + 1}`, value: val });
      input.push(val);
    });

  return { params, input };
}

// ─────────────────────────────────────────────────────────────────────────────
// Standard test-case parser
// ─────────────────────────────────────────────────────────────────────────────

/** Parses standard (non-class) LeetCode problems across multiple Example blocks. */
export function parseStandardTestCases(text: string): StandardTestCase[] {
  const results: StandardTestCase[] = [];

  const exampleBlocks = text.split(/(?:Example\s+\d+:?)/i).filter((b) => b.trim());
  const blocks = exampleBlocks.length > 0 ? exampleBlocks : [text];

  for (const block of blocks) {
    const inputIndex  = block.search(/Input\s*:?/i);
    const outputIndex = block.search(/Output\s*:?/i);
    if (inputIndex === -1 || outputIndex === -1) continue;

    const inputSegment = block.slice(inputIndex, outputIndex).replace(/Input\s*:?/i, "").trim();

    let outputSegment = block.slice(outputIndex).replace(/Output\s*:?/i, "");
    const explIdx = outputSegment.search(/Explanation\s*:?/i);
    if (explIdx !== -1) outputSegment = outputSegment.slice(0, explIdx);
    outputSegment = outputSegment.trim();

    const { params, input } = extractParamsAndInputs(inputSegment);
    const outputVal = parseOutputSegment(outputSegment);

    if (input.length > 0) {
      results.push({ type: "standard", params, input, output: outputVal });
    }
  }

  return results;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main entry point
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Main parser — auto-detects whether the clipboard text describes a
 * Standard problem or a Class Design problem, and returns parsed test cases.
 */
export function parseLeetCodeText(text: string): ParsedResult[] {
  const clean = text.replace(/\r\n/g, "\n");

  // 1. Try Class Design first
  const classResults = tryParseClassDesign(clean);
  if (classResults && classResults.length > 0) return classResults;

  // 2. Fall back to Standard
  const standardResults = parseStandardTestCases(clean);

  // 3. Safety net: standard parser may have returned two arrays that are
  //    actually ops + args (edge-case where Input/Output headers are present
  //    but the arrays look like a class design problem).
  const IDENT = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;
  const converted: ClassTestCase[] = [];

  for (const st of standardResults) {
    if (
      st.input.length === 2 &&
      Array.isArray(st.input[0]) && st.input[0].length > 0 &&
      st.input[0].every((op: any) => typeof op === "string" && IDENT.test(op.trim())) &&
      Array.isArray(st.input[1]) && st.input[1].length === st.input[0].length &&
      st.input[1].every((a: any) => Array.isArray(a)) &&
      Array.isArray(st.output) && st.output.length === st.input[0].length &&
      (st.output[0] === null || st.output[0] === undefined)
    ) {
      converted.push({ type: "class", operations: st.input[0], args: st.input[1], expected: st.output });
    }
  }

  if (converted.length === standardResults.length && converted.length > 0) return converted;

  return standardResults;
}
