import { execSync } from "node:child_process";

/**
 * Reads text from system clipboard via PowerShell on Windows.
 */
export function readClipboard(): string {
  try {
    return execSync("powershell -command Get-Clipboard", { encoding: "utf-8" });
  } catch {
    return "";
  }
}

export interface ParamInfo {
  name: string;
  value: any;
}

export interface StandardTestCase {
  type: "standard";
  params: ParamInfo[];
  input: any[];
  output: any;
}

export interface ClassTestCase {
  type: "class";
  operations: string[];
  args: any[][];
  expected: any[];
}

export type ParsedResult = StandardTestCase | ClassTestCase;

// Safe JS/JSON evaluator for types
export function parseValue(str: string): any {
  const trimmed = str.trim();
  if (!trimmed) return undefined;

  try {
    return JSON.parse(trimmed);
  } catch {
    try {
      const jsonCompatible = trimmed
        .replace(/'/g, '"')
        .replace(/\bNone\b/g, "null")
        .replace(/\bTrue\b/g, "true")
        .replace(/\bFalse\b/g, "false")
        .replace(/\bundefined\b/g, "null");
      return JSON.parse(jsonCompatible);
    } catch {
      return trimmed;
    }
  }
}

/**
 * Extracts top-level JSON arrays from text by tracking bracket depth and string escaping.
 */
export function extractTopLevelJsonArrays(text: string): any[] {
  const results: any[] = [];
  let i = 0;
  while (i < text.length) {
    if (text[i] === "[") {
      let depth = 0;
      let inString = false;
      let stringChar = "";
      let escaped = false;
      let j = i;

      for (; j < text.length; j++) {
        const char = text[j];
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
        if (char === '"' || char === "'") {
          inString = true;
          stringChar = char;
          continue;
        }
        if (char === "[") {
          depth++;
        } else if (char === "]") {
          depth--;
          if (depth === 0) {
            const candidate = text.slice(i, j + 1);
            const val = parseValue(candidate);
            if (Array.isArray(val)) {
              results.push(val);
              i = j + 1;
              break;
            }
          }
        }
      }
      if (j >= text.length) {
        i++;
      }
    } else {
      i++;
    }
  }
  return results;
}

/**
 * Main parser function handling both Standard problems and Class Design problems.
 */
export function parseLeetCodeText(text: string): ParsedResult[] {
  const cleanText = text.replace(/\r\n/g, "\n");

  if (cleanText.includes('["') || cleanText.includes("['")) {
    const classResult = tryParseClassDesign(cleanText);
    if (classResult) return [classResult];
  }

  return parseStandardTestCases(cleanText);
}

/**
 * Parses Class Design testcases (e.g. MinStack, LRUCache, Trie)
 */
export function tryParseClassDesign(text: string): ClassTestCase | null {
  if (/(?:^|\s|,|\n)[a-zA-Z_$][a-zA-Z0-9_$]*\s*=/g.test(text)) {
    return null;
  }

  const topArrays = extractTopLevelJsonArrays(text);
  if (topArrays.length < 2) return null;

  // 1. Standard 3-array format: [ops, args, expected]
  if (topArrays.length >= 3) {
    for (let i = 0; i <= topArrays.length - 3; i++) {
      const ops = topArrays[i];
      const args = topArrays[i + 1];
      const expected = topArrays[i + 2];

      if (
        Array.isArray(ops) &&
        ops.length > 0 &&
        ops.every((op) => typeof op === "string" && /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(op.trim())) &&
        Array.isArray(args) &&
        args.length === ops.length &&
        args.every((arg) => Array.isArray(arg)) &&
        Array.isArray(expected) &&
        expected.length === ops.length
      ) {
        return {
          type: "class",
          operations: ops,
          args: args,
          expected: expected,
        };
      }
    }
  }

  // 2. Interleaved / single-input array format (NeetCode format): [flatInput, expected]
  for (let i = 0; i <= topArrays.length - 2; i++) {
    const flatInput = topArrays[i];
    const expected = topArrays[i + 1];

    if (
      Array.isArray(flatInput) &&
      Array.isArray(expected) &&
      expected.length > 0 &&
      (expected[0] === null || expected[0] === undefined)
    ) {
      const parsed = parseInterleavedClassDesign(flatInput, expected);
      if (parsed) return parsed;
    }
  }

  return null;
}

/**
 * Parses interleaved / flat Class Design input arrays (e.g. NeetCode clipboard format)
 * where operations and arguments are combined in a single array.
 */
export function parseInterleavedClassDesign(flatInput: any[], expected: any[]): ClassTestCase | null {
  const N = expected.length;
  if (!Array.isArray(flatInput) || flatInput.length < N || N === 0) return null;

  // First item MUST be a valid string identifier (Class constructor name)
  if (typeof flatInput[0] !== "string" || !/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(flatInput[0].trim())) {
    return null;
  }

  // Collect candidate string identifier indices
  const validIndices: number[] = [];
  for (let idx = 0; idx < flatInput.length; idx++) {
    if (typeof flatInput[idx] === "string" && /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(flatInput[idx].trim())) {
      validIndices.push(idx);
    }
  }

  if (validIndices.length < N || validIndices[0] !== 0) return null;

  let bestIndices: number[] | null = null;

  if (validIndices.length === N) {
    bestIndices = validIndices;
  } else {
    let bestScore = -Infinity;

    function evaluateCombination(indices: number[]) {
      const opArgsByName = new Map<string, any[][]>();
      const opExpectedTypesByName = new Map<string, Set<string>>();
      const selectedOpNames = new Set(indices.map((idx) => flatInput[idx].trim()));

      function getValType(val: any): string {
        if (val === null || val === undefined) return "void";
        if (typeof val === "boolean") return "boolean";
        if (typeof val === "number") return "number";
        if (typeof val === "string") return "string";
        if (Array.isArray(val)) return "array";
        return "object";
      }

      let score = 0;

      for (let k = 0; k < N; k++) {
        const idx = indices[k];
        const opName = flatInput[idx].trim();

        const nextIdx = k + 1 < N ? indices[k + 1] : flatInput.length;
        const rawArgs = flatInput.slice(idx + 1, nextIdx);

        // Penalize if rawArgs contains strings that are selected as operation names elsewhere
        for (const argItem of rawArgs) {
          if (typeof argItem === "string" && selectedOpNames.has(argItem.trim())) {
            score -= 2000;
          }
        }

        let finalArgs: any[];
        if (rawArgs.length === 1 && Array.isArray(rawArgs[0])) {
          finalArgs = rawArgs[0];
        } else {
          finalArgs = rawArgs;
        }

        if (!opArgsByName.has(opName)) {
          opArgsByName.set(opName, []);
          opExpectedTypesByName.set(opName, new Set());
        }
        opArgsByName.get(opName)!.push(finalArgs);
        opExpectedTypesByName.get(opName)!.add(getValType(expected[k]));
      }

      for (const [opName, callArgsList] of opArgsByName.entries()) {
        const occurrences = callArgsList.length;
        const argCounts = new Set(callArgsList.map((a) => a.length));
        const expTypes = opExpectedTypesByName.get(opName)!;

        // Check if return value types in expected array match across calls
        if (expTypes.size === 1) {
          score += 200 * occurrences;
        } else {
          score -= 800; // Inconsistent return types for the same method name!
        }

        if (occurrences >= 2) {
          if (argCounts.size === 1) {
            score += 300 * occurrences; // High reward for repeated method name with consistent arg count
          } else {
            score -= 1000; // Heavy penalty for inconsistent arg counts across calls
          }
        } else {
          // Single occurrence (e.g. constructor or single-use method)
          if (opName === flatInput[indices[0]].trim()) {
            score += 100; // Constructor
          } else {
            const argCount = callArgsList[0].length;
            if (argCount <= 4) {
              score += 20;
            } else {
              score -= 200; // Too many leftover arguments for a single method call
            }
          }
        }
      }

      if (score > bestScore) {
        bestScore = score;
        bestIndices = [...indices];
      }
    }

    function searchCombos(curr: number[], startValidIdx: number) {
      if (curr.length === N) {
        evaluateCombination(curr);
        return;
      }
      const needed = N - curr.length;
      const available = validIndices.length - startValidIdx;
      if (available < needed) return;

      for (let i = startValidIdx; i < validIndices.length; i++) {
        curr.push(validIndices[i]);
        searchCombos(curr, i + 1);
        curr.pop();
        if (bestScore >= 400 && validIndices.length > 30) {
          break;
        }
      }
    }

    searchCombos([0], 1);
  }

  if (!bestIndices) return null;

  const operations: string[] = [];
  const args: any[][] = [];

  for (let k = 0; k < N; k++) {
    const idx = (bestIndices as number[])[k];
    const opName = flatInput[idx].trim();
    operations.push(opName);

    const nextIdx = k + 1 < N ? (bestIndices as number[])[k + 1] : flatInput.length;
    const rawArgs = flatInput.slice(idx + 1, nextIdx);

    if (rawArgs.length === 1 && Array.isArray(rawArgs[0])) {
      args.push(rawArgs[0]);
    } else {
      args.push(rawArgs);
    }
  }

  return {
    type: "class",
    operations,
    args,
    expected,
  };
}

/**
 * Extracts param names & values from an Input block.
 */
export function extractParamsAndInputs(inputSegment: string): { params: ParamInfo[]; input: any[] } {
  const params: ParamInfo[] = [];
  const input: any[] = [];

  const paramRegex = /(?:^|\s|,|\n)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=/g;
  const matches: { param: string; index: number; valStart: number }[] = [];
  let m: RegExpExecArray | null;

  while ((m = paramRegex.exec(inputSegment)) !== null) {
    matches.push({
      param: m[1],
      index: m.index,
      valStart: m.index + m[0].length,
    });
  }

  if (matches.length > 0) {
    for (let i = 0; i < matches.length; i++) {
      const start = matches[i].valStart;
      const end = i + 1 < matches.length ? matches[i + 1].index : inputSegment.length;
      let rawVal = inputSegment.slice(start, end).trim();

      if (rawVal.endsWith(",")) {
        rawVal = rawVal.slice(0, -1).trim();
      }

      const parsedVal = parseValue(rawVal);
      params.push({ name: matches[i].param, value: parsedVal });
      input.push(parsedVal);
    }
    return { params, input };
  }

  // Fallback if no `param =` syntax found
  const lines = inputSegment
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  lines.forEach((line, idx) => {
    const val = parseValue(line);
    params.push({ name: `arg${idx + 1}`, value: val });
    input.push(val);
  });

  return { params, input };
}

export function parseOutputSegment(outputSegment: string): any {
  const trimmed = outputSegment.trim();
  if (!trimmed) return undefined;

  try {
    return JSON.parse(trimmed);
  } catch {}

  try {
    const jsonCompatible = trimmed
      .replace(/'/g, '"')
      .replace(/\bNone\b/g, "null")
      .replace(/\bTrue\b/g, "true")
      .replace(/\bFalse\b/g, "false")
      .replace(/\bundefined\b/g, "null");
    return JSON.parse(jsonCompatible);
  } catch {}

  const firstLine = trimmed.split("\n")[0].trim();
  try {
    return JSON.parse(firstLine);
  } catch {}

  try {
    const jsonCompatible = firstLine
      .replace(/'/g, '"')
      .replace(/\bNone\b/g, "null")
      .replace(/\bTrue\b/g, "true")
      .replace(/\bFalse\b/g, "false")
      .replace(/\bundefined\b/g, "null");
    return JSON.parse(jsonCompatible);
  } catch {}

  const topArrays = extractTopLevelJsonArrays(trimmed);
  if (topArrays.length > 0) {
    return topArrays[0];
  }

  return parseValue(firstLine) ?? parseValue(trimmed);
}

/**
 * Parses standard problem testcases across multiple `Example N:` blocks
 */
export function parseStandardTestCases(text: string): StandardTestCase[] {
  const results: StandardTestCase[] = [];

  const exampleBlocks = text.split(/(?:Example\s+\d+:?)/i).filter((b) => b.trim());
  const blocksToProcess = exampleBlocks.length > 0 ? exampleBlocks : [text];

  for (const block of blocksToProcess) {
    const inputIndex = block.search(/Input\s*:?/i);
    const outputIndex = block.search(/Output\s*:?/i);

    if (inputIndex === -1 || outputIndex === -1) continue;

    const inputSegment = block.slice(inputIndex, outputIndex).replace(/Input\s*:?/i, "").trim();

    let outputSegment = block.slice(outputIndex).replace(/Output\s*:?/i, "");
    const explanationIndex = outputSegment.search(/Explanation\s*:?/i);
    if (explanationIndex !== -1) {
      outputSegment = outputSegment.slice(0, explanationIndex);
    }
    outputSegment = outputSegment.trim();

    const { params, input } = extractParamsAndInputs(inputSegment);
    const outputVal = parseOutputSegment(outputSegment);

    if (input.length > 0) {
      results.push({
        type: "standard",
        params,
        input,
        output: outputVal,
      });
    }
  }

  return results;
}
