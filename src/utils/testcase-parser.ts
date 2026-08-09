/**
 * Parses raw text copied from LeetCode problem descriptions or testcase panels
 * into formatted TypeScript test objects for `runTests` or `runClassTests`.
 */

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

export interface SignatureInfo {
  paramsCode: string;
  returnType: string;
  defaultReturn: string;
}

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
 * Detects the recommended template type from parsed testcases.
 */
export function detectTemplateType(cases: ParsedResult[]): string {
  if (cases.length === 0) return "standard";
  if (cases[0].type === "class") return "class-design";

  const first = cases[0] as StandardTestCase;
  if (first.params && first.params.length > 0) {
    const p0Name = first.params[0].name.toLowerCase();
    if (p0Name.startsWith("root") || p0Name === "tree") return "binary-tree";
    if (p0Name.startsWith("head") || p0Name === "list") return "linked-list";
    if (p0Name === "node" || p0Name === "graph" || p0Name === "adjlist") return "graph";
  }
  return "standard";
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
function tryParseClassDesign(text: string): ClassTestCase | null {
  // If the text contains explicit parameter assignments like `strs =`, `nums =`, etc.,
  // it is a standard function testcase, not a class design problem.
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
function extractParamsAndInputs(inputSegment: string): { params: ParamInfo[]; input: any[] } {
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

function parseOutputSegment(outputSegment: string): any {
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
function parseStandardTestCases(text: string): StandardTestCase[] {
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

/**
 * Infer TypeScript type string from a runtime value
 */
export function inferTsType(val: any): string {
  if (val === null || val === undefined) return "any";
  if (typeof val === "number") return "number";
  if (typeof val === "boolean") return "boolean";
  if (typeof val === "string") return "string";

  if (Array.isArray(val)) {
    if (val.length === 0) return "any[]";
    const elemType = inferTsType(val[0]);
    return `${elemType}[]`;
  }

  return "any";
}

/**
 * Infer complete function signature (params, return type, default return value)
 * taking into account template context (e.g. "binary-tree", "linked-list", "graph").
 */
export function inferFunctionSignature(
  parsedCases: ParsedResult[],
  template?: string
): SignatureInfo {
  if (parsedCases.length === 0 || parsedCases[0].type !== "standard") {
    if (template === "binary-tree") {
      return { paramsCode: "root: TreeNode | null", returnType: "TreeNode | null", defaultReturn: "root" };
    }
    if (template === "linked-list" || template === "cyclic-linked-list") {
      return { paramsCode: "head: ListNode | null", returnType: "ListNode | null", defaultReturn: "head" };
    }
    if (template === "graph") {
      return { paramsCode: "node: GraphNode | null", returnType: "GraphNode | null", defaultReturn: "node" };
    }
    return { paramsCode: "nums: number[]", returnType: "number", defaultReturn: "0" };
  }

  const firstCase = parsedCases[0] as StandardTestCase;

  // Graph Template
  if (template === "graph") {
    const rawOutputType = inferTsType(firstCase.output);
    const returnType =
      Array.isArray(firstCase.output) && Array.isArray(firstCase.output[0])
        ? rawOutputType // e.g. number[][]
        : Array.isArray(firstCase.output)
        ? "GraphNode | null"
        : rawOutputType;

    let defaultReturn = "node";
    if (returnType === "GraphNode | null") defaultReturn = "node";
    else if (returnType === "boolean") defaultReturn = "false";
    else if (returnType === "string") defaultReturn = '""';
    else if (returnType.endsWith("[]")) defaultReturn = "[]";
    else if (returnType === "number") defaultReturn = "0";

    const paramStrings: string[] = [];
    firstCase.params.forEach((p, idx) => {
      const pName = p.name === "arg1" || idx === 0 ? "node" : p.name;
      const pType = idx === 0 ? "GraphNode | null" : inferTsType(p.value);
      paramStrings.push(`${pName}: ${pType}`);
    });

    return {
      paramsCode: paramStrings.join(", "),
      returnType,
      defaultReturn,
    };
  }

  // Binary Tree Template
  if (template === "binary-tree") {
    const rawOutputType = inferTsType(firstCase.output);
    const returnType =
      Array.isArray(firstCase.output) && (firstCase.output.length === 0 || Array.isArray(firstCase.output[0]))
        ? rawOutputType
        : Array.isArray(firstCase.output)
        ? "TreeNode | null"
        : rawOutputType;

    let defaultReturn = "root";
    if (returnType === "TreeNode | null") defaultReturn = "root";
    else if (returnType === "boolean") defaultReturn = "false";
    else if (returnType === "string") defaultReturn = '""';
    else if (returnType.endsWith("[]")) defaultReturn = "[]";
    else if (returnType === "number") defaultReturn = "0";

    const paramStrings: string[] = [];
    firstCase.params.forEach((p, idx) => {
      const pName = p.name === "arg1" || idx === 0 ? "root" : p.name;
      const pType = idx === 0 ? "TreeNode | null" : inferTsType(p.value);
      paramStrings.push(`${pName}: ${pType}`);
    });

    return {
      paramsCode: paramStrings.join(", "),
      returnType,
      defaultReturn,
    };
  }

  // Linked List Template
  if (template === "linked-list" || template === "cyclic-linked-list") {
    const rawOutputType = inferTsType(firstCase.output);
    const returnType =
      Array.isArray(firstCase.output) && Array.isArray(firstCase.output[0])
        ? rawOutputType
        : Array.isArray(firstCase.output)
        ? "ListNode | null"
        : rawOutputType;

    let defaultReturn = "head";
    if (returnType === "ListNode | null") defaultReturn = "head";
    else if (returnType === "boolean") defaultReturn = "false";
    else if (returnType === "string") defaultReturn = '""';
    else if (returnType.endsWith("[]")) defaultReturn = "[]";
    else if (returnType === "number") defaultReturn = "0";

    const paramStrings: string[] = [];
    firstCase.params.forEach((p, idx) => {
      const pName = p.name === "arg1" || idx === 0 ? "head" : p.name;
      const pType = idx === 0 ? "ListNode | null" : inferTsType(p.value);
      paramStrings.push(`${pName}: ${pType}`);
    });

    return {
      paramsCode: paramStrings.join(", "),
      returnType,
      defaultReturn,
    };
  }

  // Standard Template
  const paramStrings: string[] = [];
  firstCase.params.forEach((p, idx) => {
    const pName = p.name || `arg${idx + 1}`;
    const pType = inferTsType(p.value);
    paramStrings.push(`${pName}: ${pType}`);
  });

  const paramsCode = paramStrings.length > 0 ? paramStrings.join(", ") : "nums: number[]";

  const returnType = inferTsType(firstCase.output);
  let defaultReturn = "0";

  if (returnType === "boolean") defaultReturn = "false";
  else if (returnType === "string") defaultReturn = '""';
  else if (returnType.endsWith("[]")) defaultReturn = "[]";
  else if (returnType === "number") defaultReturn = "0";
  else if (returnType === "any") defaultReturn = "null";

  return {
    paramsCode,
    returnType,
    defaultReturn,
  };
}

/**
 * Pretty-stringifies JS values with spaces after commas and clean formatting
 */
export function stringifyTsValue(val: any, inline = true): string {
  if (val === undefined) return "undefined";
  if (val === null || typeof val !== "object") return JSON.stringify(val);

  if (Array.isArray(val)) {
    if (val.length === 0) return "[]";

    const isFlatPrimitives = val.every((item) => typeof item !== "object" || item === null);
    if (isFlatPrimitives) {
      const itemsStr = val.map((v) => JSON.stringify(v)).join(", ");
      if (itemsStr.length < 60 || inline) {
        return `[${itemsStr}]`;
      }
    }

    const itemsStr = val.map((v) => stringifyTsValue(v, true)).join(", ");
    if (itemsStr.length < 80) {
      return `[${itemsStr}]`;
    }

    const lines = val.map((v) => `  ${stringifyTsValue(v, false)}`);
    return `[\n${lines.join(",\n")}\n]`;
  }

  return JSON.stringify(val);
}

/**
 * Formats parsed testcase objects into clean, pretty TypeScript code string.
 * Automatically wraps Tree, Linked List, and Graph inputs/outputs with proper builder functions.
 */
export function formatParsedCasesForTs(cases: ParsedResult[], template?: string): string {
  if (cases.length === 0) return "";

  if (cases[0].type === "class") {
    const c = cases[0] as ClassTestCase;
    return `{
  operations: ${stringifyTsValue(c.operations)},
  args: ${stringifyTsValue(c.args)},
  expected: ${stringifyTsValue(c.expected)},
},`;
  }

  const stdCases = cases as StandardTestCase[];
  const formatted = stdCases.map((c) => {
    const inputParts = c.input.map((val, idx) => {
      if (template === "binary-tree" && idx === 0 && Array.isArray(val)) {
        return `createBinaryTree(${stringifyTsValue(val)})`;
      }
      if (template === "linked-list" && idx === 0 && Array.isArray(val)) {
        return `createLinkedList(${stringifyTsValue(val)})`;
      }
      if (template === "cyclic-linked-list" && idx === 0 && Array.isArray(val)) {
        const pos = c.input[1] !== undefined ? c.input[1] : 0;
        return `createCyclicLinkedList(${stringifyTsValue(val)}, ${pos})`;
      }
      if (template === "graph" && idx === 0 && Array.isArray(val)) {
        return `createGraph(${stringifyTsValue(val)})`;
      }
      return stringifyTsValue(val);
    });

    const inputStr = `[${inputParts.join(", ")}]`;

    let outputStr = stringifyTsValue(c.output);
    if (template === "binary-tree" && Array.isArray(c.output) && c.output.length > 0 && !Array.isArray(c.output[0])) {
      outputStr = `createBinaryTree(${stringifyTsValue(c.output)})`;
    } else if (template === "linked-list" && Array.isArray(c.output) && c.output.length > 0 && !Array.isArray(c.output[0])) {
      outputStr = `createLinkedList(${stringifyTsValue(c.output)})`;
    } else if (template === "graph" && Array.isArray(c.output) && c.output.length > 0 && Array.isArray(c.output[0]) && typeof c.output[0][0] === "number") {
      outputStr = `createGraph(${stringifyTsValue(c.output)})`;
    }

    return `  { input: ${inputStr}, output: ${outputStr} },`;
  });

  return formatted.join("\n");
}
