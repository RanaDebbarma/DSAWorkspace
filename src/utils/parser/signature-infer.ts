import { ParsedResult, StandardTestCase } from "./text-parser.js";

export interface SignatureInfo {
  paramsCode: string;
  returnType: string;
  defaultReturn: string;
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
        ? rawOutputType
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
