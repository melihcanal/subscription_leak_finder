import type { RawTransaction } from "./types";

type CsvParseResult = {
  headers: string[];
  rows: string[][];
};

const REQUIRED_HEADERS = ["date", "description", "amount"] as const;

export function parseCsv(text: string): CsvParseResult {
  const rows: string[][] = [];
  let row: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];

    if (char === '"') {
      const next = text[i + 1];
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
        continue;
      }
      inQuotes = !inQuotes;
      continue;
    }

    if (!inQuotes && (char === ",")) {
      row.push(current);
      current = "";
      continue;
    }

    if (!inQuotes && (char === "\n" || char === "\r")) {
      if (char === "\r" && text[i + 1] === "\n") {
        i += 1;
      }
      row.push(current);
      current = "";
      rows.push(row);
      row = [];
      continue;
    }

    current += char;
  }

  if (current.length > 0 || row.length > 0) {
    row.push(current);
    rows.push(row);
  }

  while (rows.length > 0 && rows[rows.length - 1].every((cell) => cell.trim() === "")) {
    rows.pop();
  }

  const headers = rows.shift() ?? [];
  if (headers.length > 0) {
    headers[0] = headers[0].replace(/^\ufeff/, "");
  }

  return { headers, rows };
}

export function parseCsvTransactions(text: string): RawTransaction[] {
  const { headers, rows } = parseCsv(text);
  const normalizedHeaders = headers.map((header) => header.trim().toLowerCase());
  const indexMap = Object.fromEntries(
    REQUIRED_HEADERS.map((required) => [required, normalizedHeaders.indexOf(required)])
  ) as Record<(typeof REQUIRED_HEADERS)[number], number>;

  const missing = REQUIRED_HEADERS.filter((header) => indexMap[header] === -1);
  if (missing.length > 0) {
    throw new Error(`Missing required columns: ${missing.join(", ")}`);
  }

  return rows
    .map((row) => ({
      date: row[indexMap.date] ?? "",
      description: row[indexMap.description] ?? "",
      amount: row[indexMap.amount] ?? ""
    }))
    .filter((row) => row.date.trim() !== "" || row.description.trim() !== "" || row.amount.trim() !== "");
}
