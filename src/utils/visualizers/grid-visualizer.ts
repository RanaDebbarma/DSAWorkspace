import chalk from "chalk";

export type GridMode = "auto" | "board" | "maze" | "binary" | "sudoku" | "numeric";

export type MatrixToStringOptions = {
  mode?: GridMode;
};

/**
 * Automatically infers the most appropriate GridMode by inspecting the cells of the matrix.
 */
export function detectGridMode(matrix: any[][]): Exclude<GridMode, "auto"> {
  let stringCount = 0;
  let numberCount = 0;

  let generalLetterCount = 0; // letters other than S, E, X
  let hasMazeMarkers = false; // '#', '*', or isolated 'S'/'E' with maze context
  let hasDigit2Through9 = false;
  let hasBinaryString = false; // '0' or '1'
  let hasSOrE = false;
  let hasNegativeNumbers = false;
  let hasNumberGreaterThanOne = false;

  for (const row of matrix) {
    if (!Array.isArray(row)) continue;
    for (const cell of row) {
      if (cell === null || cell === undefined) continue;

      if (typeof cell === "number") {
        numberCount++;
        if (cell < 0) hasNegativeNumbers = true;
        if (cell > 1) hasNumberGreaterThanOne = true;
      } else if (typeof cell === "string") {
        stringCount++;
        const s = cell.trim();
        if (s === "#" || s === "*") {
          hasMazeMarkers = true;
        } else if (s === "0" || s === "1") {
          hasBinaryString = true;
        } else if (/^[2-9]$/.test(s)) {
          hasDigit2Through9 = true;
        } else if (/^[a-zA-Z]$/.test(s)) {
          const upper = s.toUpperCase();
          if (upper === "S" || upper === "E") {
            hasSOrE = true;
          } else if (upper !== "X") {
            generalLetterCount++;
          }
        }
      }
    }
  }

  // 1. If primarily numbers
  if (numberCount > 0 && stringCount === 0) {
    if (!hasNegativeNumbers && !hasNumberGreaterThanOne && numberCount > 0) {
      return "binary"; // 0-1 numeric grid (e.g. islands, rotting oranges)
    }
    return "numeric";
  }

  // 2. If general alphabet letters exist (e.g., A, B, C, D in Word Search / Boggle)
  if (generalLetterCount > 0) {
    return "board";
  }

  // 3. If contains digits 2-9 or dots without general letters (e.g., Sudoku)
  if (hasDigit2Through9) {
    return "sudoku";
  }

  // 4. If maze markers like '#' or '*' are present, or S/E with pathfinding context
  if (hasMazeMarkers || hasSOrE) {
    return "maze";
  }

  // 5. If primarily binary strings '0' and '1'
  if (hasBinaryString) {
    return "binary";
  }

  // Fallback
  return "board";
}

/**
 * Colors a matrix cell based on its raw value type and the active grid mode.
 */
export function colorMatrixCell(val: any, str: string, mode: Exclude<GridMode, "auto"> = "board"): string {
  if (val === null || val === undefined) return chalk.dim(str);

  if (typeof val === "boolean") {
    return val
      ? chalk.bold.hex("#55efc4")(str)   // true  ➔ mint green
      : chalk.bold.hex("#ff7675")(str);  // false ➔ warm red
  }

  if (typeof val === "number") {
    if (mode === "binary") {
      if (val === 0) return chalk.hex("#74b9ff")(str);  // water ➔ light blue
      if (val === 1) return chalk.hex("#55efc4")(str);  // land / fresh ➔ mint green
      if (val === 2) return chalk.hex("#fdcb6e")(str);  // rotten / obstacle ➔ amber
    }
    if (val < 0)   return chalk.hex("#ff7675")(str);  // negative ➔ warm red
    if (val === 0) return chalk.hex("#636e72")(str);  // zero     ➔ muted gray
    return chalk.cyan(str);                            // positive ➔ cyan
  }

  if (typeof val === "string") {
    // Mode: "board" (Word Search, letters, Boggle)
    // S, E, X are regular characters! Only explicit traversal markers remain styled.
    if (mode === "board") {
      switch (val) {
        case ".": return chalk.hex("#555f6e")(str);          // placeholder ➔ dark gray
        case "#": return chalk.hex("#e17055")(str);          // obstacle / backtrack mark ➔ coral red
        case "*": return chalk.hex("#fdcb6e")(str);          // path / visited ➔ amber
        default:
          if (val.length === 1) return chalk.hex("#ffeaa7")(str); // single char ➔ light gold
          return chalk.white(str);
      }
    }

    // Mode: "sudoku" (digits 1-9, empty dots)
    if (mode === "sudoku") {
      if (val === ".") return chalk.hex("#555f6e")(str);      // empty cell ➔ dark gray
      if (/^[0-9]$/.test(val)) return chalk.hex("#ffeaa7")(str); // uniform gold for all digits
      return chalk.white(str);
    }

    // Mode: "binary" (Number of Islands, etc.)
    if (mode === "binary") {
      switch (val) {
        case "0": return chalk.hex("#74b9ff")(str);          // water ➔ light blue
        case "1": return chalk.hex("#55efc4")(str);          // land ➔ mint green
        case "2": return chalk.hex("#fdcb6e")(str);          // obstacle / rotten ➔ amber
        case ".": return chalk.hex("#555f6e")(str);          // dark gray
        default:
          return val.length === 1 ? chalk.hex("#ffeaa7")(str) : chalk.white(str);
      }
    }

    // Mode: "maze" (Pathfinding BFS/DFS)
    if (mode === "maze") {
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
          if (val.length === 1) return chalk.hex("#ffeaa7")(str);
          return chalk.white(str);
      }
    }

    // Mode: "numeric"
    if (val.length === 1) return chalk.hex("#ffeaa7")(str);
    return chalk.white(str);
  }

  return chalk.white(str);
}

/**
 * Visualizes a 2D array / matrix grid as an aligned ASCII table.
 */
export function matrixToString(
  matrix: any[][],
  options?: MatrixToStringOptions | GridMode,
): string {
  if (!Array.isArray(matrix) || matrix.length === 0) return "[]";
  if (!Array.isArray(matrix[0])) return JSON.stringify(matrix);

  const rawMode: GridMode = typeof options === "string" ? options : (options?.mode ?? "auto");
  const resolvedMode: Exclude<GridMode, "auto"> =
    rawMode === "auto" ? detectGridMode(matrix) : rawMode;

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
      cells.push(` ${colorMatrixCell(rawVal, valStr, resolvedMode)} `);
    }
    lines.push(chalk.gray("│") + cells.join(chalk.gray("│")) + chalk.gray("│"));
    if (r < rows - 1) {
      lines.push(chalk.gray(midBorder));
    }
  }

  lines.push(chalk.gray(botBorder));
  return lines.join("\n");
}
