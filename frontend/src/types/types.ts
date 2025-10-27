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
  | "TravelAndHolidays";

export interface budgets {
  category: categories;
  budgetAmount: number;
  spentAmount: number;
  remainingAmount: number;
}

export interface chartLineLinearData {
  month: string;
  transactions: [{ day: string; amount: number }];
}
export interface charLinetMultipleData {
  month: string;
  transactions: [{ day: string; income: number; expense: number }];
}
export interface charLinetMultipleCategoriesData {
  month: string;
  category: string;
  totalSpend: number;
}

export interface pieData {
  category: categories;
  totalSpend: number;
  fill: string;
}

export interface chartData {
  month: string;
  category: categories;
  totalSpend: number;
  fill: string;
}
