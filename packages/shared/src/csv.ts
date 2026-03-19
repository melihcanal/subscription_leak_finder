import type {RawTransaction} from "./types";

type CsvParseResult = {
    headers: string[];
    rows: string[][];
};

type CsvState = {
    rows: string[][];
    row: string[];
    current: string;
    inQuotes: boolean;
};

type QuoteOutcome = {
    handled: boolean;
    consumedNext: boolean;
};

type DelimiterOutcome = {
    handled: boolean;
    skipNext: boolean;
};

const REQUIRED_HEADERS = ["date", "description", "amount"] as const;
const BOM_REGEX = /^\ufeff/g;

function stripBom(value: string): string {
    return value.replaceAll(BOM_REGEX, "");
}

function isRowEmpty(row: string[]): boolean {
    return row.every((cell) => cell.trim() === "");
}

function createState(): CsvState {
    return {rows: [], row: [], current: "", inQuotes: false};
}

function pushCell(state: CsvState): void {
    state.row.push(state.current);
    state.current = "";
}

function pushRow(state: CsvState): void {
    pushCell(state);
    state.rows.push(state.row);
    state.row = [];
}

function handleQuote(state: CsvState, char: string, next?: string): QuoteOutcome {
    if (char !== '"') {
        return {handled: false, consumedNext: false};
    }
    if (state.inQuotes && next === '"') {
        state.current += '"';
        return {handled: true, consumedNext: true};
    }
    state.inQuotes = !state.inQuotes;
    return {handled: true, consumedNext: false};
}

function handleDelimiter(state: CsvState, char: string, next?: string): DelimiterOutcome {
    if (state.inQuotes) {
        return {handled: false, skipNext: false};
    }
    if (char === ",") {
        pushCell(state);
        return {handled: true, skipNext: false};
    }
    if (char === "\r" || char === "\n") {
        pushRow(state);
        return {handled: true, skipNext: char === "\r" && next === "\n"};
    }
    return {handled: false, skipNext: false};
}

function finalizeRows(state: CsvState): void {
    if (state.current.length > 0 || state.row.length > 0) {
        pushRow(state);
    }
    while (state.rows.length > 0 && isRowEmpty(state.rows.at(-1) ?? [])) {
        state.rows.pop();
    }
}

export function parseCsv(text: string): CsvParseResult {
    const state = createState();

    for (let i = 0; i < text.length; i += 1) {
        const char = text[i];
        const next = text[i + 1];

        const quoteOutcome = handleQuote(state, char, next);
        if (quoteOutcome.handled) {
            if (quoteOutcome.consumedNext) {
                i += 1;
            }
            continue;
        }

        const delimiterOutcome = handleDelimiter(state, char, next);
        if (delimiterOutcome.handled) {
            if (delimiterOutcome.skipNext) {
                i += 1;
            }
            continue;
        }

        state.current += char;
    }

    finalizeRows(state);

    const headers = state.rows.shift() ?? [];
    if (headers.length > 0) {
        headers[0] = stripBom(headers[0]);
    }

    return {headers, rows: state.rows};
}

function buildIndexMap(normalizedHeaders: string[]): Record<(typeof REQUIRED_HEADERS)[number], number> {
    return Object.fromEntries(
        REQUIRED_HEADERS.map((required) => [required, normalizedHeaders.indexOf(required)])
    ) as Record<(typeof REQUIRED_HEADERS)[number], number>;
}

export function parseCsvTransactions(text: string): RawTransaction[] {
    const {headers, rows} = parseCsv(text);
    const normalizedHeaders = headers.map((header) => header.trim().toLowerCase());
    const indexMap = buildIndexMap(normalizedHeaders);

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

