/**
 * class-parser.ts
 *
 * Parses Class Design testcases from LeetCode / NeetCode clipboard text.
 *
 * Supported input formats:
 *   A) LeetCode two-array format  — [ops]\n[[args...]]
 *   B) NeetCode interleaved format — [op, arg, op, arg, ...]  (single flat array)
 *   C) Raw triple format           — [ops], [args], [expected] (no Input/Output headers)
 *
 * Exported functions (in call order):
 *   tryParseClassDesign       — top-level entry; handles multi-example blocks
 *   tryParseClassBlock        — parses one Input/Output block
 *   parseInterleavedClassDesign — heuristic solver for NeetCode flat arrays
 */

import { ClassTestCase } from "./types.js";
import { extractTopLevelJsonArrays, convertArgValue, parseValue } from "./json-repair.js";

// ── Inline output-segment parser (avoids circular dep with text-parser.ts) ──
function parseOutputSegment(outputSegment: string): any {
  const trimmed = outputSegment.trim();
  if (!trimmed) return undefined;

  try { return JSON.parse(trimmed); } catch {}

  const fix = (s: string) =>
    s.replace(/'/g, '"')
     .replace(/\bNone\b/g, "null")
     .replace(/\bTrue\b/g, "true")
     .replace(/\bFalse\b/g, "false")
     .replace(/\bundefined\b/g, "null");

  try { return JSON.parse(fix(trimmed)); } catch {}

  const firstLine = trimmed.split("\n")[0].trim();
  try { return JSON.parse(firstLine); } catch {}
  try { return JSON.parse(fix(firstLine)); } catch {}

  const arrays = extractTopLevelJsonArrays(trimmed);
  if (arrays.length > 0) return arrays[0];

  return parseValue(firstLine) ?? parseValue(trimmed);
}


// ─── Identifier regex ────────────────────────────────────────────────────────
const IDENT = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;

/** Returns true when every element of `arr` is a valid JS identifier string. */
function isOpsArray(arr: any[]): boolean {
  return arr.length > 0 && arr.every((op) => typeof op === "string" && IDENT.test(op.trim()));
}

/**
 * Tries to parse one `Input: ... Output: ...` block as a ClassTestCase.
 * Handles both LeetCode two-array and NeetCode interleaved formats.
 */
export function tryParseClassBlock(block: string): ClassTestCase | null {
  const inputIndex  = block.search(/Input\s*:?/i);
  const outputIndex = block.search(/Output\s*:?/i);

  if (inputIndex === -1 || outputIndex === -1 || inputIndex >= outputIndex) return null;

  const inputSegment = block.slice(inputIndex, outputIndex).replace(/Input\s*:?/i, "").trim();

  let outputSegment = block.slice(outputIndex).replace(/Output\s*:?/i, "");
  const explIdx = outputSegment.search(/Explanation\s*:?/i);
  if (explIdx !== -1) outputSegment = outputSegment.slice(0, explIdx);
  outputSegment = outputSegment.trim();

  const inputArrays = extractTopLevelJsonArrays(inputSegment);
  const outputVal   = parseOutputSegment(outputSegment);

  // ── Format A: two arrays [ops] + [[args…]] ────────────────────────────────
  if (inputArrays.length >= 2 && Array.isArray(outputVal)) {
    const [ops, args] = inputArrays;
    const expected    = outputVal;

    if (
      isOpsArray(ops) &&
      Array.isArray(args) && args.length === ops.length && args.every(Array.isArray) &&
      Array.isArray(expected) && expected.length === ops.length &&
      (expected[0] === null || expected[0] === undefined)
    ) {
      return { type: "class", operations: ops, args, expected };
    }
  }

  // ── Format B: one interleaved flat array ──────────────────────────────────
  if (inputArrays.length === 1 && Array.isArray(outputVal)) {
    return parseInterleavedClassDesign(inputArrays[0], outputVal);
  }

  return null;
}

/**
 * Top-level class-design parser.
 * Tries (in order):
 *   1. Split on "Example N:" headers and parse each block
 *   2. Parse the whole text as a single Input/Output block
 *   3. Raw arrays with no Input/Output headers (triple or pair)
 */
export function tryParseClassDesign(text: string): ClassTestCase[] | null {
  // 1. Example blocks
  const exampleBlocks = text.split(/(?:Example\s+\d+:?)/i).filter((b) => b.trim());
  if (exampleBlocks.length > 0) {
    const results = exampleBlocks.map(tryParseClassBlock).filter(Boolean) as ClassTestCase[];
    if (results.length > 0) return results;
  }

  // 2. Single block
  const single = tryParseClassBlock(text);
  if (single) return [single];

  // 3. Raw arrays (no Input/Output headers)
  const topArrays = extractTopLevelJsonArrays(text);
  if (topArrays.length < 2) return null;

  // 3a. [ops], [args], [expected] triples
  const triples = parseRawTriples(topArrays);
  if (triples.length > 0) return triples;

  // 3b. [flatInput], [expected] pairs (NeetCode raw paste)
  const pairs = parseRawPairs(topArrays);
  if (pairs.length > 0) return pairs;

  return null;
}

function parseRawTriples(topArrays: any[]): ClassTestCase[] {
  const results: ClassTestCase[] = [];
  let i = 0;
  while (i <= topArrays.length - 3) {
    const [ops, args, expected] = topArrays.slice(i, i + 3);
    if (
      isOpsArray(ops) &&
      Array.isArray(args) && args.length === ops.length && args.every(Array.isArray) &&
      Array.isArray(expected) && expected.length === ops.length &&
      (expected[0] === null || expected[0] === undefined)
    ) {
      results.push({ type: "class", operations: ops, args, expected });
      i += 3;
    } else break;
  }
  return results;
}

function parseRawPairs(topArrays: any[]): ClassTestCase[] {
  const results: ClassTestCase[] = [];
  let j = 0;
  while (j <= topArrays.length - 2) {
    const [flatInput, expected] = topArrays.slice(j, j + 2);
    if (
      Array.isArray(flatInput) && Array.isArray(expected) &&
      expected.length > 0 && (expected[0] === null || expected[0] === undefined)
    ) {
      const parsed = parseInterleavedClassDesign(flatInput, expected);
      if (parsed) { results.push(parsed); j += 2; continue; }
    }
    break;
  }
  return results;
}

/**
 * Parses the NeetCode interleaved format where operations and arguments are
 * mixed in a single flat array:
 *   ["ClassName", "method", arg1, "method", arg2, ...]
 *
 * Uses a scored search to find the best assignment of string tokens to
 * operation positions, rewarding consistent argument counts and return types.
 */
export function parseInterleavedClassDesign(flatInput: any[], expected: any[]): ClassTestCase | null {
  const N = expected.length;
  if (!Array.isArray(flatInput) || flatInput.length < N || N === 0) return null;

  // First token must be a valid identifier (class constructor name)
  if (typeof flatInput[0] !== "string" || !IDENT.test(flatInput[0].trim())) return null;

  // All candidate operation indices (positions of string identifiers)
  const validIndices: number[] = flatInput
    .map((v, idx) => (typeof v === "string" && IDENT.test(v.trim()) ? idx : -1))
    .filter((idx) => idx !== -1);

  if (validIndices.length < N || validIndices[0] !== 0) return null;

  // ── Fast path: exactly N identifiers ──────────────────────────────────────
  let bestIndices: number[] | null = validIndices.length === N ? validIndices : null;

  // ── Scored search: pick N indices from validIndices ────────────────────────
  if (!bestIndices) {
    let bestScore = -Infinity;

    const evaluate = (indices: number[]) => {
      const opArgsByName      = new Map<string, any[][]>();
      const opExpTypedByName  = new Map<string, Set<string>>();
      const selectedOpNames   = new Set(indices.map((idx) => flatInput[idx].trim()));

      const valType = (val: any): string => {
        if (val === null || val === undefined) return "void";
        if (typeof val === "boolean") return "boolean";
        if (typeof val === "number")  return "number";
        if (typeof val === "string")  return "string";
        if (Array.isArray(val))       return "array";
        return "object";
      };

      let score = 0;

      for (let k = 0; k < N; k++) {
        const idx    = indices[k];
        const opName = flatInput[idx].trim();
        const nextIdx = k + 1 < N ? indices[k + 1] : flatInput.length;
        const rawArgs = flatInput.slice(idx + 1, nextIdx);

        // Penalise args that are themselves selected op names
        for (const arg of rawArgs) {
          if (typeof arg === "string" && selectedOpNames.has(arg.trim())) score -= 2000;
        }

        const finalArgs = rawArgs.length === 1 && Array.isArray(rawArgs[0]) ? rawArgs[0] : rawArgs;

        if (!opArgsByName.has(opName)) {
          opArgsByName.set(opName, []);
          opExpTypedByName.set(opName, new Set());
        }
        opArgsByName.get(opName)!.push(finalArgs);
        opExpTypedByName.get(opName)!.add(valType(expected[k]));
      }

      for (const [opName, callArgsList] of opArgsByName.entries()) {
        const occ      = callArgsList.length;
        const argSizes = new Set(callArgsList.map((a) => a.length));
        const expTypes = opExpTypedByName.get(opName)!;

        score += expTypes.size === 1 ? 200 * occ : -800;

        if (occ >= 2) {
          score += argSizes.size === 1 ? 300 * occ : -1000;
        } else {
          score += opName === flatInput[indices[0]].trim()
            ? 100
            : callArgsList[0].length <= 4 ? 20 : -200;
        }
      }

      if (score > bestScore) { bestScore = score; bestIndices = [...indices]; }
    };

    const search = (curr: number[], startIdx: number) => {
      if (curr.length === N) { evaluate(curr); return; }
      const needed    = N - curr.length;
      const available = validIndices.length - startIdx;
      if (available < needed) return;

      for (let i = startIdx; i < validIndices.length; i++) {
        curr.push(validIndices[i]);
        search(curr, i + 1);
        curr.pop();
        if (bestScore >= 400 && validIndices.length > 30) break;
      }
    };

    search([0], 1);
  }

  if (!bestIndices) return null;

  // ── Build result ──────────────────────────────────────────────────────────
  const operations: string[] = [];
  const args: any[][] = [];

  for (let k = 0; k < N; k++) {
    const idx     = (bestIndices as number[])[k];
    const nextIdx = k + 1 < N ? (bestIndices as number[])[k + 1] : flatInput.length;
    const rawArgs = flatInput.slice(idx + 1, nextIdx);
    const clean   = rawArgs.map(convertArgValue);

    operations.push(flatInput[idx].trim());
    args.push(clean.length === 1 && Array.isArray(clean[0]) ? clean[0] : clean);
  }

  return { type: "class", operations, args, expected };
}
