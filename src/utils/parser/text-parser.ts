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
 * Parses Class Design testcases (e.g. MinStack, LRUCache)
 */
export function tryParseClassDesign(text: string): ClassTestCase | null {
  if (/(?:^|\s|,|\n)[a-zA-Z_$][a-zA-Z0-9_$]*\s*=/g.test(text)) {
    return null;
  }

  const topArrays = extractTopLevelJsonArrays(text);
  if (topArrays.length < 3) return null;

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

  return null;
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
