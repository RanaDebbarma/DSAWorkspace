/**
 * json-repair.ts
 *
 * Low-level JSON utilities:
 *   - repairJson       — tolerant fixer for malformed JSON strings
 *   - convertArgValue  — coerces string values from interleaved arrays to proper JS types
 *   - parseValue       — safe evaluator with repair fallback
 *   - extractTopLevelJsonArrays — bracket-depth scanner for arrays in arbitrary text
 */

/**
 * Attempts to repair malformed JSON strings:
 *   - Missing commas between adjacent tokens (main NeetCode clipboard bug)
 *   - Single-quoted strings → double-quoted
 *   - Unquoted identifiers → auto-quoted strings
 *   - Python literals: None → null, True → true, False → false
 *   - Trailing commas before ] or }
 *
 * Only activates when the input starts with `[` or `{`.
 */
export function repairJson(str: string): string {
  const trimmed = str.trim();
  if (!trimmed.startsWith("[") && !trimmed.startsWith("{")) {
    return trimmed;
  }

  let res = "";
  let inString = false;
  let stringChar = "";
  let escaped = false;
  let lastToken = ""; // "VALUE" | "COMMA" | "COLON" | "OPEN"

  const isWS = (ch: string) => /\s/.test(ch);

  let i = 0;
  while (i < trimmed.length) {
    const ch = trimmed[i];

    // ── Inside a string ──────────────────────────────────────────────────────
    if (inString) {
      if (escaped) {
        // \' inside single-quoted string is just a literal apostrophe
        res += stringChar === "'" && ch === "'" ? "'" : "\\" + ch;
        escaped = false;
        i++;
        continue;
      }
      if (ch === "\\") { escaped = true; i++; continue; }
      if (ch === stringChar) {
        // Close the string — always emit a double-quote
        inString = false;
        res += '"';
        lastToken = "VALUE";
        i++;
        continue;
      }
      if (ch === '"' && stringChar === "'") {
        // Need to escape any embedded double-quotes when converting ' → "
        res += '\\"';
        i++;
        continue;
      }
      res += ch;
      i++;
      continue;
    }

    // ── Outside a string ─────────────────────────────────────────────────────
    if (ch === '"' || ch === "'") {
      if (lastToken === "VALUE") res += ", "; // inject missing comma
      inString = true;
      stringChar = ch;
      res += '"';
      i++;
      continue;
    }

    if (ch === "[" || ch === "{") {
      if (lastToken === "VALUE") res += ", ";
      res += ch;
      lastToken = "OPEN";
      i++;
      continue;
    }

    if (ch === "]" || ch === "}") {
      // Strip trailing comma before closing bracket
      const t = res.trimEnd();
      if (t.endsWith(",")) res = t.slice(0, -1);
      res += ch;
      lastToken = "VALUE";
      i++;
      continue;
    }

    if (ch === ",") { res += ch; lastToken = "COMMA"; i++; continue; }
    if (ch === ":") { res += ch; lastToken = "COLON"; i++; continue; }
    if (isWS(ch))  { res += ch; i++; continue; }

    // ── Bare word (number / boolean / null / unquoted identifier) ────────────
    let word = "";
    while (
      i < trimmed.length &&
      !isWS(trimmed[i]) &&
      !',:]}{"\''.includes(trimmed[i])
    ) {
      word += trimmed[i++];
    }

    if (word) {
      if (lastToken === "VALUE") res += ", ";
      if      (word === "None" || word === "undefined") res += "null";
      else if (word === "True")  res += "true";
      else if (word === "False") res += "false";
      else if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(word) && word !== "true" && word !== "false" && word !== "null")
        res += `"${word}"`;
      else res += word;
      lastToken = "VALUE";
    }
  }

  return res;
}

/**
 * Coerces string values that come from the interleaved NeetCode format
 * (where args like `"1"` or `"3"` should be numbers) to their proper JS types.
 * Arrays are recursively coerced.
 */
export function convertArgValue(val: any): any {
  if (typeof val === "string") {
    const t = val.trim();
    if (t === "true")  return true;
    if (t === "false") return false;
    if (t === "null")  return null;
    if (/^-?\d+(?:\.\d+)?$/.test(t)) {
      const n = Number(t);
      if (!Number.isNaN(n)) return n;
    }
  } else if (Array.isArray(val)) {
    return val.map(convertArgValue);
  }
  return val;
}

/**
 * Safe JS/JSON value evaluator with a repair fallback:
 *   1. Try strict JSON.parse
 *   2. Try repairJson → JSON.parse  (handles NeetCode missing commas etc.)
 *   3. Try simple regex replacements for Python literals
 *   4. Return raw string as last resort
 */
export function parseValue(str: string): any {
  const trimmed = str.trim();
  if (!trimmed) return undefined;

  try { return JSON.parse(trimmed); } catch {}

  try { return JSON.parse(repairJson(trimmed)); } catch {}

  try {
    return JSON.parse(
      trimmed
        .replace(/'/g, '"')
        .replace(/\bNone\b/g, "null")
        .replace(/\bTrue\b/g, "true")
        .replace(/\bFalse\b/g, "false")
        .replace(/\bundefined\b/g, "null"),
    );
  } catch {}

  return trimmed;
}

/**
 * Scans arbitrary text and extracts every top-level JSON array it can find,
 * using bracket depth + string-escape tracking (not a full JSON lexer).
 */
export function extractTopLevelJsonArrays(text: string): any[] {
  const results: any[] = [];
  let i = 0;

  while (i < text.length) {
    if (text[i] !== "[") { i++; continue; }

    let depth = 0;
    let inStr = false;
    let strCh = "";
    let esc   = false;
    let j     = i;

    for (; j < text.length; j++) {
      const c = text[j];
      if (esc)          { esc = false; continue; }
      if (c === "\\")   { esc = true;  continue; }
      if (inStr)        { if (c === strCh) inStr = false; continue; }
      if (c === '"' || c === "'") { inStr = true; strCh = c; continue; }
      if (c === "[")    { depth++; }
      else if (c === "]") {
        depth--;
        if (depth === 0) {
          const val = parseValue(text.slice(i, j + 1));
          if (Array.isArray(val)) {
            results.push(val);
            i = j + 1;
          }
          break;
        }
      }
    }

    if (j >= text.length) i++;
  }

  return results;
}
