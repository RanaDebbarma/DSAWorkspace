import { ClassTestCase, ParsedResult, StandardTestCase } from "./text-parser.js";

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
