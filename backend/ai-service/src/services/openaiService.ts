import OpenAI from "openai";
import { lookup as mimeLookup } from "mime-types";

/* Helpers ------- */

function toDataUrl(filename: string, buf: Buffer) {
  const mime = mimeLookup(filename) || "application/pdf";
  return `data:${mime};base64,${buf.toString("base64")}`;
}

const client = new OpenAI();

function stripCodeFences(s: string) {
  const t = s.trim();
  if (t.startsWith("```")) {
    return t
      .replace(/^```[a-zA-Z]*\n?/, "")
      .replace(/\n?```$/, "")
      .trim();
  }
  return t;
}
function removeNumberCommas(s: string): string {
  return s.replace(/(\d),(\d)/g, "$1$2");
}

function normalizeQuotes(s: string) {
  return s
    .replace(/[\u201C\u201D\u201E\u201F\u2033]/g, '"')
    .replace(/[\u2018\u2019\u2032]/g, "'");
}

function removeTrailingCommas(s: string) {
  return s.replace(/,\s*([}\]])/g, "$1");
}

function coerceNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const normalized = value.replace(/,/g, "");
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function extractTopLevelJSONArray(s: string): string | null {
  const first = s.indexOf("[");
  const last = s.lastIndexOf("]");
  if (first === -1 || last === -1 || last <= first) return null;
  return s.substring(first, last + 1);
}

function safeParseJSONArray<T = any>(raw: string, label: string): T[] {
  const preview = (txt: string) =>
    txt.length > 500 ? `${txt.slice(0, 500)}…` : txt;

  let txt = normalizeQuotes(stripCodeFences(raw)).trim();

  if (!txt.startsWith("[")) {
    const extracted = extractTopLevelJSONArray(txt);
    if (extracted) txt = extracted;
  }

  txt = removeNumberCommas(txt);
  txt = removeTrailingCommas(txt);

  try {
    const parsed = JSON.parse(txt);
    if (!Array.isArray(parsed))
      throw new Error(`${label}: parsed JSON is not an array`);
    return parsed as T[];
  } catch {
    throw new Error(`${label} JSON parse error. Raw preview:\n${preview(txt)}`);
  }
}

function validDay(d: string) {
  return /^(0[1-9]|[12][0-9]|3[01])$/.test(d);
}

function normMonthName(s: string) {
  return String(s).trim();
}

/*--- */

async function callResponsesRaw(
  pdfs: { filename: string; buffer: Buffer }[],
  inputText: string
): Promise<string> {
  const content = [
    ...pdfs.map((f) => ({
      type: "input_file" as const,
      filename: f.filename,
      file_data: toDataUrl(f.filename, f.buffer),
    })),
    { type: "input_text" as const, text: inputText },
  ];

  const resp = await client.responses.create({
    model: "chatgpt-4o-latest",
    temperature: 0,
    input: [{ role: "user", content }],
  });

  let text: string | undefined = (resp as any).output_text;
  if (!text) {
    const out = (resp as any).output ?? [];
    for (const item of out) {
      if (item?.type === "message") {
        for (const c of item?.content ?? []) {
          if ((c.type === "text" || c.type === "output_text") && c.text) {
            text = c.text as string;
            break;
          }
        }
      }
      if (text) break;
    }
  }
  if (!text) throw new Error("OpenAI returned no text");
  return stripCodeFences(text);
}

/* Prompts ---------------*/

function promptTransactionsRaw(userId: string) {
  return [
    `You are extracting bank statement data for user "${userId}".`,
    `Return ONLY raw JSON (no code fences, no commentary).`,
    `Output MUST be a JSON ARRAY of objects shaped exactly like this example:`,
    ``,
    `[`,
    `  {`,
    `    "month": "September",`,
    `    "transactions": [`,
    `      { "day": "28", "amount": 59.5 },`,
    `      { "day": "29", "amount": 9782.33 }`,
    `    ]`,
    `  },`,
    `  {`,
    `    "month": "October",`,
    `    "transactions": [`,
    `      { "day": "01", "amount": -53.0 },`,
    `      { "day": "02", "amount": -53.0 }`,
    `    ]`,
    `  }`,
    `]`,
    ``,
    `Rules:`,
    ` All numbers must be written WITHOUT commas DO NOT INCLUDE THOUSANDS SEPARATORS (e.g., 4413.87 not 4,413.87). `,
    `- ALL TRANSACTIONS must be included do not omit ANY transactions`,
    `- Include ALL months and dates/days EXACTLY as it is present in the PDFs.`,
    `- Transactions must be in the CORRECT order, chronological order`,
    `- Use full month names like "September", "October".`,
    `- Positive amounts = credits (marked by cr); negative amounts = debits.`,
    `- Day must be zero-padded "01".."31".`,
    `- Output must be valid JSON with ONLY the array.`,
    `Data Structure ( YOUR OUTPUT must STRICTLY match this structure):`,
    `
    {
    dashboardName: string;
    month: string;
    transactions: { day: string; amount: number }[];
  }[]
    `,
  ].join("\n");
}

function promptIncomeExpenseRaw(userId: string) {
  return [
    `You are extracting bank statement data for user "${userId}".`,
    `Return ONLY raw JSON (no code fences, no commentary).`,
    `Output MUST be a JSON ARRAY of objects shaped exactly like this example:`,
    ``,
    `[`,
    `  {`,
    `    "month": "September",`,
    `    "startingBalance": "4000",`,
    `    "transactions": [`,
    `      { "day": "11", "income": 0, "expense": 59.5 },`,
    `      { "day": "12", "income": 0, "expense": 59.5 }`,
    `    ]`,
    `  },`,
    `  {`,
    `    "month": "October",`,
    `    "startingBalance": "4000",`,
    `    "transactions": [`,
    `      { "day": "01", "income": 0, "expense": 53.0 },`,
    `      { "day": "02", "income": 0, "expense": 53.0 }`,
    `    ]`,
    `  }`,
    `]`,
    ``,
    `Rules:`,
    `- All numbers must be written WITHOUT commas DO NOT INCLUDE THOUSANDS SEPARATORS (e.g., 4413.87 not 4,413.87). `,
    `- ALL TRANSACTIONS must be included do not omit ANY`,
    `- Include ALL months and dates/days EXACTLY as it is present in the PDFs.`,
    `- Transactions must be in the CORRECT order, chronological order`,
    `- "income" is individual credit shown for that transaction (marked by cr) (>= 0).`,
    `- "expense" is the individual debit for that transaction (>= 0).`,
    `- Day must be zero-padded "01".."31" and must match exactly as it is in the document.`,
    `- "startingBalance": The balance at the start of the month (before that month’s first transaction).`,
    `- Output must be valid JSON with ONLY the array.`,

    `Data Structure ( YOUR OUTPUT must STRICTLY match this structure):`,
    `
{
    userId: string;
    dashboardName: string;
    month: string;
    startingBalance: number;
    transactions: { day: string; income: number; expense: number }[];
  }[]
    `,
  ].join("\n");
}

function promptCategoriesRaw(userId: string) {
  return [
    `You are extracting category totals for user "${userId}".`,
    `Return ONLY raw JSON (no code fences, no commentary).`,
    `Output MUST be a JSON ARRAY of objects shaped exactly like this example:`,
    ``,
    `[`,
    `  { "month": "January",  "category": "Groceries",             "totalSpend": 520.35 },`,
    `  { "month": "January",  "category": "Transport",             "totalSpend": 240.5  },`,
    `  { "month": "January",  "category": "EatingOutAndTreats",    "totalSpend": 310.2  },`,

    `]`,
    ``,
    `Rules:`,
    ` All numbers must be written WITHOUT commas DO NOT INCLUDE THOUSANDS SEPARATORS (e.g., 4413.87 not 4,413.87). `,
    `- Return a flat array with one row per (month, category).`,
    `- "totalSpend" = sum of debits for that category in that month, as a positive number.`,
    `- Use the exact category taxonomy.`,
    `- Use full month names.`,
    `- Choose the appropriate categories as per the description of the transaction.`,

    `- Output must be valid JSON with ONLY the array.`,

    `Data Structure ( YOUR OUTPUT must STRICTLY match this structure):`,
    `
{
    userId: string;
    dashboardName: string;
    month: string;
    category:
      | "GeneralRetail"
      | "Transport"
      | "EatingOutAndTreats"
      | "Fuel"
      | "Groceries"
      | "ProfessionalServices"
      | "CarUseAndServices"
      | "DonationsAndGiving"
      | "GiftsAndFlowers"
      | "Hobbies"
      | "HomewareAndAppliances"
      | "MusicGamingApps"
      | "OutdoorAndAdventure"
      | "PharmaciesAndWellbeing"
      | "TravelAndHolidays"
      | "Other";
    totalSpend: number;
  }[];

    `,
  ].join("\n");
}

function promptOverviewRaw(userId: string) {
  return [
    `You are extracting a per-month overview for user "${userId}".`,
    `Return ONLY raw JSON (no code fences, no commentary).`,
    `Output MUST be a JSON ARRAY of objects shaped exactly like this example:`,
    ``,
    `[`,
    `  { "month": "September", "moneyIn": 12500.00, "moneyOut": 8930.45, "startingBalance": 250.00 },`,
    `  { "month": "October",   "moneyIn": 13100.00, "moneyOut": 7421.19, "startingBalance": 380.10 }`,
    `]`,
    ``,
    `Definitions:`,
    `- "moneyIn": Total of all credits in that month.`,
    `- "moneyOut": Total of all debits in that month, as a positive number.`,
    `- "startingBalance": The balance at the start of the month.`,
    `Rules:`,
    ` All numbers must be written WITHOUT commas DO NOT INCLUDE THOUSANDS SEPARATORS (e.g., 4413.87 not 4,413.87). `,
    `- Use full month names.`,
    `- Output must be valid JSON with ONLY the array.`,
  ].join("\n");
}

type TxMonthBlock = {
  month: string;
  transactions: { day: string; amount: number }[];
};

type IEBlock = {
  month: string;
  startingBalance?: number | string;
  transactions: { day: string; income: number; expense: number }[];
};

type CatRow = {
  month: string;
  category:
    | "GeneralRetail"
    | "Transport"
    | "EatingOutAndTreats"
    | "Fuel"
    | "Groceries"
    | "ProfessionalServices"
    | "CarUseAndServices"
    | "DonationsAndGiving"
    | "GiftsAndFlowers"
    | "Hobbies"
    | "HomewareAndAppliances"
    | "MusicGamingApps"
    | "OutdoorAndAdventure"
    | "PharmaciesAndWellbeing"
    | "TravelAndHolidays"
    | "Other";
  totalSpend: number;
};

type OverviewRow = {
  month: string;
  moneyIn: number;
  moneyOut: number;
  startingBalance: number;
};

/* --------------------------------- Main --------------------------------- */

export async function extractAllThree(
  pdfs: { filename: string; buffer: Buffer }[],
  userId: string
): Promise<{
  userMonthlyTransactionsData: {
    userId: string;
    month: string;
    transactions: { day: string; amount: number }[];
  }[];
  userMonthlyIncomeExpenseTransactionsData: {
    userId: string;
    month: string;
    startingBalance: number;
    transactions: { day: string; income: number; expense: number }[];
  }[];
  userMonthlyCategoryExpenditureData: {
    userId: string;
    month: string;
    category: CatRow["category"];
    totalSpend: number;
  }[];
  overviewData: OverviewRow[];
}> {
  const txRaw = await callResponsesRaw(pdfs, promptTransactionsRaw(userId));
  const txBlocks = safeParseJSONArray<TxMonthBlock>(txRaw, "Transactions");

  const userMonthlyTransactionsData = txBlocks.map((m) => ({
    userId,
    month: normMonthName(m.month),
    transactions: (m.transactions ?? [])
      .filter(
        (t) =>
          t &&
          typeof t.amount === "number" &&
          typeof t.day === "string" &&
          validDay(t.day)
      )
      .map((t) => ({ day: t.day, amount: t.amount })),
  }));

  const ieRaw = await callResponsesRaw(pdfs, promptIncomeExpenseRaw(userId));

  const ieBlocks = safeParseJSONArray<IEBlock>(ieRaw, "Income/Expense");

  const userMonthlyIncomeExpenseTransactionsData = ieBlocks.map((m) => {
    const startingBalance = coerceNumber(m.startingBalance) ?? 0;

    return {
      userId,
      month: normMonthName(m.month),
      startingBalance,
      transactions: (m.transactions ?? [])
        .filter(
          (t) =>
            t &&
            typeof t.income === "number" &&
            typeof t.expense === "number" &&
            typeof t.day === "string" &&
            validDay(t.day)
        )
        .map((t) => ({ day: t.day, income: t.income, expense: t.expense })),
    };
  });

  const catsRaw = await callResponsesRaw(pdfs, promptCategoriesRaw(userId));
  const catRows = safeParseJSONArray<CatRow>(catsRaw, "Categories");

  const userMonthlyCategoryExpenditureData = catRows
    .filter(
      (r) =>
        r &&
        typeof r.month === "string" &&
        typeof r.category === "string" &&
        typeof r.totalSpend === "number"
    )
    .map((r) => ({
      userId,
      month: normMonthName(r.month),
      category: r.category as CatRow["category"],
      totalSpend: r.totalSpend,
    }));

  const ovRaw = await callResponsesRaw(pdfs, promptOverviewRaw(userId));
  const ovRows = safeParseJSONArray<OverviewRow>(ovRaw, "Overview");

  const overviewData = ovRows
    .filter(
      (r) =>
        r &&
        typeof r.month === "string" &&
        typeof r.moneyIn === "number" &&
        typeof r.moneyOut === "number" &&
        typeof r.startingBalance === "number"
    )
    .map((r) => ({
      month: normMonthName(r.month),
      moneyIn: r.moneyIn,
      moneyOut: r.moneyOut,
      startingBalance: r.startingBalance,
    }));

  return {
    userMonthlyTransactionsData,
    userMonthlyIncomeExpenseTransactionsData,
    userMonthlyCategoryExpenditureData,
    overviewData,
  };
}
