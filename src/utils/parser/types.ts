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
