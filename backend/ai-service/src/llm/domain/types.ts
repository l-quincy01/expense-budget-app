export type PdfInput = { filename: string; buffer: Buffer };

export type monthlyTransactions = {
  month: string;
  transactions: { day: string; amount: number }[];
};

export type incomeExpense = {
  month: string;
  startingBalance?: number | string;
  transactions: { day: string; income: number; expense: number }[];
};

export type category =
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

export type categoryMonthlyTotal = {
  month: string;
  category: category;
  totalSpend: number;
};

export type accountOverview = {
  month: string;
  moneyIn: number;
  moneyOut: number;
  startingBalance: number;
};

export type ExtractAllResult = {
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
    category: category;
    totalSpend: number;
  }[];
  overviewData: accountOverview[];
};
