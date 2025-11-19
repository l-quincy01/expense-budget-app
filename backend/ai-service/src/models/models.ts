export type categories =
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

export interface userMonthlyTransactions {
  userId: string;
  dashboardName: string;
  month: string;
  transactions: { day: string; amount: number }[];
}

export interface userMonthlyIncomeExpenseTransactions {
  userId: string;
  dashboardName: string;
  month: string;
  startingBalance: number;
  transactions: {
    day: string;
    income: number;
    expense: number;
  }[];
}

export interface userMonthlyCategoryExpenditure {
  userId: string;
  dashboardName: string;
  month: string;
  category: categories;
  totalSpend: number;
}

export interface overview {
  moneyIn: number;
  moneyOut: number;
  month: string;
  startingBalance: number;
  totalBudget?: number;
}
export interface budgets {
  category: categories;
  budgetAmount: number;
  spentAmount: number;
}

export interface dashboard {
  userId: string;
  name: string;
  overview: overview[];
  budgets?: budgets;
  userMonthlyTransactions: userMonthlyTransactions[];
  userMonthlyIncomeExpenseTransactions: userMonthlyIncomeExpenseTransactions[];
  userMonthlyCategoryExpenditure: userMonthlyCategoryExpenditure[];
}

export interface DashboardDoc {
  userId: string;
  name: string;

  overview: {
    moneyIn: number;
    moneyOut: number;
    month: string;
    startingBalance: number;
    totalBudget?: number;
  }[];

  budgets?: {
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
    budgetAmount: number;
    spentAmount: number;
  };

  userMonthlyTransactions: {
    userId: string;
    dashboardName: string;
    month: string;
    transactions: { day: string; amount: number }[];
  }[];

  userMonthlyIncomeExpenseTransactions: {
    userId: string;
    dashboardName: string;
    month: string;
    startingBalance: number;
    transactions: { day: string; income: number; expense: number }[];
  }[];

  userMonthlyCategoryExpenditure: {
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

  createdAt?: Date;
  updatedAt?: Date;
}
