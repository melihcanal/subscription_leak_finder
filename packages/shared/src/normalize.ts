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
  const cleaned = trimmed.replace(/[^0-9.-]/g, "");
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

function parseDate(raw: string): { date: Date; iso: string } {
  const trimmed = raw.trim();
  if (trimmed === "") {
    const now = new Date();
    return { date: now, iso: now.toISOString().slice(0, 10) };
  }

  const normalized = trimmed.replace(/\s+/g, " ");

  if (normalized.includes("-")) {
    const parts = normalized.split("-");
    if (parts.length === 3 && parts[0].length === 4) {
      const year = Number(parts[0]);
      const month = Number(parts[1]);
      const day = Number(parts[2]);
      if (!Number.isNaN(year) && !Number.isNaN(month) && !Number.isNaN(day)) {
        const iso = toIsoDate(year, month, day);
        return { date: new Date(iso), iso };
      }
    }
  }

  if (normalized.includes("/")) {
    const parts = normalized.split("/");
    if (parts.length === 3) {
      const first = parts[0];
      const second = parts[1];
      const third = parts[2];

      if (first.length === 4) {
        const year = Number(first);
        const month = Number(second);
        const day = Number(third);
        if (!Number.isNaN(year) && !Number.isNaN(month) && !Number.isNaN(day)) {
          const iso = toIsoDate(year, month, day);
          return { date: new Date(iso), iso };
        }
      } else {
        const firstNum = Number(first);
        const secondNum = Number(second);
        const year = Number(third);
        if (!Number.isNaN(year) && !Number.isNaN(firstNum) && !Number.isNaN(secondNum)) {
          const isDayFirst = firstNum > 12 && secondNum <= 12;
          const month = isDayFirst ? secondNum : firstNum;
          const day = isDayFirst ? firstNum : secondNum;
          const iso = toIsoDate(year, month, day);
          return { date: new Date(iso), iso };
        }
      }
    }
  }

  const monthMatch = normalized.match(/(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})/);
  if (monthMatch) {
    const day = Number(monthMatch[1]);
    const monthName = monthMatch[2].toLowerCase();
    const year = Number(monthMatch[3]);
    const month = MONTH_ALIASES[monthName];
    if (month) {
      const iso = toIsoDate(year, month, day);
      return { date: new Date(iso), iso };
    }
  }

  const parsed = new Date(normalized);
  if (!Number.isNaN(parsed.getTime())) {
    return { date: parsed, iso: parsed.toISOString().slice(0, 10) };
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
  const cleaned = lower.replace(/[^a-z0-9\s]/g, " ");
  const noDigits = cleaned.replace(/\d+/g, " ");
  const tokens = noDigits
    .split(/\s+/)
    .filter(Boolean)
    .filter((token) => !STOP_WORDS.has(token));

  const key = tokens.join(" ").trim();
  const fallback = cleaned.split(/\s+/).filter(Boolean).join(" ");
  const displaySource = key !== "" ? key : fallback;

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
