import type { NormalizedTransaction, RawTransaction } from "./types";

const STOP_WORDS = new Set([
  "payment",
  "purchase",
  "card",
  "debit",
  "credit",
  "pos",
  "online",
  "transfer",
  "autopay",
  "recurring",
  "subscription",
  "co",
  "inc",
  "ltd",
  "com",
  "www",
  "the",
  "and",
  "of"
]);

const MONTH_ALIASES: Record<string, number> = {
  jan: 1,
  feb: 2,
  mar: 3,
  apr: 4,
  may: 5,
  jun: 6,
  jul: 7,
  aug: 8,
  sep: 9,
  oct: 10,
  nov: 11,
  dec: 12
};

function parseAmount(raw: string): number {
  const trimmed = raw.trim();
  if (trimmed === "") {
    return 0;
  }

  const isNegative = trimmed.includes("(") && trimmed.includes(")");
  const cleaned = trimmed.replaceAll(/[^0-9.-]/g, "");
  const value = Number.parseFloat(cleaned);
  if (Number.isNaN(value)) {
    return 0;
  }
  return isNegative ? -Math.abs(value) : value;
}

function toIsoDate(year: number, month: number, day: number): string {
  const safeMonth = String(month).padStart(2, "0");
  const safeDay = String(day).padStart(2, "0");
  return `${year}-${safeMonth}-${safeDay}`;
}

type ParsedDate = { date: Date; iso: string };

function parseIsoLike(value: string): ParsedDate | null {
  if (!value.includes("-")) {
    return null;
  }

  const parts = value.split("-");
  if (parts.length !== 3 || parts[0].length !== 4) {
    return null;
  }

  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);
  if ([year, month, day].some((part) => Number.isNaN(part))) {
    return null;
  }

  const iso = toIsoDate(year, month, day);
  return { date: new Date(iso), iso };
}

function parseSlashDate(value: string): ParsedDate | null {
  if (!value.includes("/")) {
    return null;
  }

  const parts = value.split("/");
  if (parts.length !== 3) {
    return null;
  }

  const [first, second, third] = parts;
  if (first.length === 4) {
    const year = Number(first);
    const month = Number(second);
    const day = Number(third);
    if ([year, month, day].some((part) => Number.isNaN(part))) {
      return null;
    }
    const iso = toIsoDate(year, month, day);
    return { date: new Date(iso), iso };
  }

  const firstNum = Number(first);
  const secondNum = Number(second);
  const year = Number(third);
  if ([firstNum, secondNum, year].some((part) => Number.isNaN(part))) {
    return null;
  }

  const isDayFirst = firstNum > 12 && secondNum <= 12;
  const month = isDayFirst ? secondNum : firstNum;
  const day = isDayFirst ? firstNum : secondNum;
  const iso = toIsoDate(year, month, day);
  return { date: new Date(iso), iso };
}

function parseMonthNameDate(value: string): ParsedDate | null {
  const monthMatch = /(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})/.exec(value);
  if (!monthMatch) {
    return null;
  }

  const day = Number(monthMatch[1]);
  const monthName = monthMatch[2].toLowerCase();
  const year = Number(monthMatch[3]);
  const month = MONTH_ALIASES[monthName];
  if (!month || [day, year].some((part) => Number.isNaN(part))) {
    return null;
  }

  const iso = toIsoDate(year, month, day);
  return { date: new Date(iso), iso };
}

function parseNativeDate(value: string): ParsedDate | null {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return { date: parsed, iso: parsed.toISOString().slice(0, 10) };
}

function parseDate(raw: string): ParsedDate {
  const trimmed = raw.trim();
  if (trimmed === "") {
    const now = new Date();
    return { date: now, iso: now.toISOString().slice(0, 10) };
  }

  const normalized = trimmed.replaceAll(/\s+/g, " ");
  const parsed =
    parseIsoLike(normalized) ||
    parseSlashDate(normalized) ||
    parseMonthNameDate(normalized) ||
    parseNativeDate(normalized);

  if (parsed) {
    return parsed;
  }

  const fallback = new Date();
  return { date: fallback, iso: fallback.toISOString().slice(0, 10) };
}

function titleCase(value: string): string {
  return value
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function normalizeMerchant(description: string): { key: string; display: string; tokens: string[] } {
  const lower = description.toLowerCase();
  const cleaned = lower.replaceAll(/[^a-z0-9\s]/g, " ");
  const noDigits = cleaned.replaceAll(/\d+/g, " ");
  const tokens = noDigits
    .split(/\s+/)
    .filter(Boolean)
    .filter((token) => !STOP_WORDS.has(token));

  const key = tokens.join(" ").trim();
  const fallback = cleaned.split(/\s+/).filter(Boolean).join(" ");
  const displaySource = key || fallback;

  return {
    key: displaySource.trim(),
    display: titleCase(displaySource.trim()),
    tokens: tokens.length > 0 ? tokens : fallback.split(/\s+/).filter(Boolean)
  };
}

export function normalizeTransaction(raw: RawTransaction): NormalizedTransaction {
  const description = raw.description.trim();
  const amount = parseAmount(raw.amount);
  const { date, iso } = parseDate(raw.date);
  const merchant = normalizeMerchant(description);

  return {
    date,
    dateIso: iso,
    description,
    merchant: merchant.display,
    merchantKey: merchant.key,
    amount,
    tokens: merchant.tokens
  };
}
