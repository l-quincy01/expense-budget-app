export interface IPromptBuilder {
  build(userId: string): string;
}

export class TransactionsPrompt implements IPromptBuilder {
  build(userId: string): string {
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
      `  }`,
      `]`,
      ``,
      `Rules:`,
      `- All numbers must be written WITHOUT commas (e.g., 4413.87 not 4,413.87).`,
      `- ALL TRANSACTIONS must be included; do not omit ANY.`,
      `- Include ALL months and dates/days EXACTLY as present in the PDFs.`,
      `- Transactions must be in chronological order.`,
      `- Use full month names like "September".`,
      `- Positive amounts = credits (marked by cr); negative amounts = debits.`,
      `- Day must be zero-padded "01".."31".`,
      `- Output must be valid JSON with ONLY the array.`,
    ].join("\n");
  }
}

export class IncomeExpensePrompt implements IPromptBuilder {
  build(userId: string): string {
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
      `      { "day": "11", "income": 0, "expense": 59.5 }`,
      `    ]`,
      `  }`,
      `]`,
      ``,
      `Rules:`,
      `- All numbers must be written WITHOUT commas (e.g., 4413.87 not 4,413.87).`,
      `- ALL TRANSACTIONS must be included; do not omit ANY.`,
      `- Include ALL months and dates/days EXACTLY as present in the PDFs.`,
      `- Transactions must be in chronological order.`,
      `- "income" is the credit for that transaction (marked by cr) (>= 0).`,
      `- "expense" is the debit for that transaction (>= 0).`,
      `- Day must be zero-padded "01".."31".`,
      `- "startingBalance": balance at the start of the month (before first transaction).`,
      `- Output must be valid JSON with ONLY the array.`,
    ].join("\n");
  }
}

export class CategoriesPrompt implements IPromptBuilder {
  build(userId: string): string {
    return [
      `You are extracting category totals for user "${userId}".`,
      `Return ONLY raw JSON (no code fences, no commentary).`,
      `Output MUST be a JSON ARRAY of objects shaped exactly like this example:`,
      ``,
      `[`,
      `  { "month": "January", "category": "Groceries", "totalSpend": 520.35 }`,
      `]`,
      ``,
      `Rules:`,
      `- All numbers must be written WITHOUT commas (e.g., 4413.87 not 4,413.87).`,
      `- Return a flat array with one row per (month, category).`,
      `- "totalSpend" = sum of debits for that category in that month, as a positive number.`,
      `- Use the exact category taxonomy.`,
      `- Use full month names.`,
      `- Output must be valid JSON with ONLY the array.`,
      ``,
      `Category taxonomy:`,
      `GeneralRetail, Transport, EatingOutAndTreats, Fuel, Groceries, ProfessionalServices, CarUseAndServices,`,
      `DonationsAndGiving, GiftsAndFlowers, Hobbies, HomewareAndAppliances, MusicGamingApps, OutdoorAndAdventure,`,
      `PharmaciesAndWellbeing, TravelAndHolidays, Other`,
    ].join("\n");
  }
}

export class OverviewPrompt implements IPromptBuilder {
  build(userId: string): string {
    return [
      `You are extracting a per-month overview for user "${userId}".`,
      `Return ONLY raw JSON (no code fences, no commentary).`,
      `Output MUST be a JSON ARRAY of objects shaped exactly like this example:`,
      ``,
      `[`,
      `  { "month": "September", "moneyIn": 12500.0, "moneyOut": 8930.45, "startingBalance": 250.0 }`,
      `]`,
      ``,
      `Definitions:`,
      `- "moneyIn": total of all credits in that month.`,
      `- "moneyOut": total of all debits in that month, as a positive number.`,
      `- "startingBalance": balance at the start of the month.`,
      `Rules:`,
      `- All numbers must be written WITHOUT commas (e.g., 4413.87 not 4,413.87).`,
      `- Use full month names.`,
      `- Output must be valid JSON with ONLY the array.`,
    ].join("\n");
  }
}
