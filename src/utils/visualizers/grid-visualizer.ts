import chalk from "chalk";

/**
 * Colors a matrix cell based on its raw value type and common DSA semantics.
 */
export function colorMatrixCell(val: any, str: string): string {
  if (val === null || val === undefined) return chalk.dim(str);

  if (typeof val === "boolean") {
    return val
      ? chalk.bold.hex("#55efc4")(str)   // true  ➔ mint green
      : chalk.bold.hex("#ff7675")(str);  // false ➔ warm red
  }

  if (typeof val === "number") {
    if (val < 0)   return chalk.hex("#ff7675")(str);  // negative ➔ warm red
    if (val === 0) return chalk.hex("#636e72")(str);  // zero     ➔ muted gray
    return chalk.cyan(str);                            // positive ➔ cyan
  }

  if (typeof val === "string") {
    switch (val) {
      case ".":  return chalk.hex("#555f6e")(str);          // empty placeholder ➔ dark gray
      case "#":  return chalk.hex("#e17055")(str);          // wall / obstacle   ➔ coral red
      case "*":  return chalk.hex("#fdcb6e")(str);          // path / visited    ➔ amber
      case "0":  return chalk.hex("#74b9ff")(str);          // string zero       ➔ light blue
      case "1":  return chalk.hex("#55efc4")(str);          // string one        ➔ mint green
      case "X":
      case "x":  return chalk.hex("#ff7675")(str);          // blocked / invalid ➔ warm red
      case "S":  return chalk.bold.hex("#00cec9")(str);     // start node        ➔ teal
      case "E":  return chalk.bold.hex("#fd79a8")(str);     // end node          ➔ pink
      default:
        if (val.length === 1) return chalk.hex("#ffeaa7")(str); // single char  ➔ light gold
        return chalk.white(str);                               // multi-char     ➔ white
    }
  }

  return chalk.white(str);
}

/**
 * Visualizes a 2D array / matrix grid as an aligned ASCII table.
 */
export function matrixToString(matrix: any[][]): string {
  if (!Array.isArray(matrix) || matrix.length === 0) return "[]";
  if (!Array.isArray(matrix[0])) return JSON.stringify(matrix);

  const rows = matrix.length;
  const cols = Math.max(...matrix.map((r) => (Array.isArray(r) ? r.length : 0)));
  if (cols === 0) return "[]";

  const colWidths = Array(cols).fill(1);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const valStr = String(matrix[r]?.[c] ?? "");
      colWidths[c] = Math.max(colWidths[c], valStr.length);
    }
  }

  const topBorder = "┌" + colWidths.map((w) => "─".repeat(w + 2)).join("┬") + "┐";
  const midBorder = "├" + colWidths.map((w) => "─".repeat(w + 2)).join("┼") + "┤";
  const botBorder = "└" + colWidths.map((w) => "─".repeat(w + 2)).join("┴") + "┘";

  const lines: string[] = [chalk.gray(topBorder)];

  for (let r = 0; r < rows; r++) {
    const cells = [];
    for (let c = 0; c < cols; c++) {
      const rawVal = matrix[r]?.[c];
      const valStr = String(rawVal ?? "").padStart(colWidths[c]);
      cells.push(` ${colorMatrixCell(rawVal, valStr)} `);
    }
    lines.push(chalk.gray("│") + cells.join(chalk.gray("│")) + chalk.gray("│"));
    if (r < rows - 1) {
      lines.push(chalk.gray(midBorder));
    }
  }

  lines.push(chalk.gray(botBorder));
  return lines.join("\n");
}
