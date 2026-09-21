import { ParsedResult, StandardTestCase, ClassTestCase } from "./text-parser.js";

export interface SignatureInfo {
  paramsCode: string;
  returnType: string;
  defaultReturn: string;
  className?: string;
  classCode?: string;
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
 * Infer class constructor & method definitions from ClassTestCase objects.
 */
export function inferClassSignature(parsedCases: ParsedResult[]): SignatureInfo {
  const classCases: ClassTestCase[] = parsedCases.map((c) => {
    if (c.type === "class") return c as ClassTestCase;
    const st = c as StandardTestCase;
    return {
      type: "class",
      operations: st.input[0] || [],
      args: st.input[1] || [],
      expected: Array.isArray(st.output) ? st.output : [],
    };
  });

  if (classCases.length === 0) {
    return {
      paramsCode: "",
      returnType: "void",
      defaultReturn: "",
      className: "Solution",
      classCode: `  // Implement class here...
  push(val: number): void {}
  pop(): void {}
  top(): number { return 0; }
  getMin(): number { return 0; }`,
    };
  }

  const first = classCases[0];
  const className = first.operations[0] || "Solution";

  // Constructor parameters
  const ctorArgs = first.args[0] || [];
  const ctorParamStrs = ctorArgs.map((arg, i) => {
    const t = inferTsType(arg);
    let name = `arg${i + 1}`;
    if (t.endsWith("[]")) name = "nums";
    else if (t === "number" && ctorArgs.length === 1) name = "capacity";
    else if (t === "number" && i === 0 && ctorArgs.length === 2 && inferTsType(ctorArgs[1]).endsWith("[]")) name = "k";
    else if (t === "string") name = "val";
    else if (t === "number") name = "val";
    return `${name}: ${t}`;
  });

  const methodsMap = new Map<string, { paramTypes: string[]; returnType: string }>();

  for (const c of classCases) {
    for (let i = 1; i < c.operations.length; i++) {
      const op = c.operations[i];
      if (op === className) continue;
      const opArgs = c.args[i] || [];
      const opExp = c.expected[i];

      const existing = methodsMap.get(op);
      const retType = opExp === null || opExp === undefined ? "void" : inferTsType(opExp);

      if (!existing) {
        methodsMap.set(op, {
          paramTypes: opArgs.map(inferTsType),
          returnType: retType,
        });
      } else if (existing.returnType === "void" && retType !== "void") {
        existing.returnType = retType;
      }
    }
  }

  const lines: string[] = [];
  lines.push("  // Implement class here...");
  if (ctorParamStrs.length > 0) {
    lines.push(`  constructor(${ctorParamStrs.join(", ")}) {}`);
  }

  for (const [op, { paramTypes, returnType }] of methodsMap.entries()) {
    const paramStrs = paramTypes.map((t, idx) => {
      let pName = `arg${idx + 1}`;
      if (op === "get" && idx === 0) pName = "key";
      else if (op === "put" && idx === 0) pName = "key";
      else if (op === "put" && idx === 1) pName = "value";
      else if ((op === "push" || op === "add") && idx === 0) pName = "val";
      else if ((op === "insert" || op === "search") && idx === 0) pName = "word";
      else if (op === "startsWith" && idx === 0) pName = "prefix";
      else if (paramTypes.length === 1 && t === "number") pName = "val";
      else if (t.endsWith("[]")) pName = "nums";
      return `${pName}: ${t}`;
    });

    let defRet = "";
    if (returnType === "number") defRet = " return 0;";
    else if (returnType === "boolean") defRet = " return false;";
    else if (returnType === "string") defRet = ' return "";';
    else if (returnType.endsWith("[]")) defRet = " return [];";

    const body = defRet ? `${defRet} ` : "";
    lines.push(`  ${op}(${paramStrs.join(", ")}): ${returnType} {${body}}`);
  }

  return {
    paramsCode: ctorParamStrs.join(", "),
    returnType: "void",
    defaultReturn: "",
    className,
    classCode: lines.join("\n"),
  };
}

/**
 * Infer complete function signature (params, return type, default return value)
 * taking into account template context (e.g. "binary-tree", "linked-list", "graph", "class-design").
 */
export function inferFunctionSignature(
  parsedCases: ParsedResult[],
  template?: string
): SignatureInfo {
  if (parsedCases.length > 0 && (parsedCases[0].type === "class" || template === "class-design")) {
    return inferClassSignature(parsedCases);
  }

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
