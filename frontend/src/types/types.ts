import {
  ShoppingBag,
  Bus,
  Coffee,
  Fuel,
  ShoppingCart,
  Briefcase,
  Car,
  HeartHandshake,
  Gift,
  Gamepad2,
  Home,
  Music,
  Mountain,
  Pill,
  Plane,
  MoreHorizontal,
  LucideIcon,
} from "lucide-react";

/*----------------- */
export type Profile = {
  userId: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
};

/*----------------- */
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

export const categoryIcons: Record<categories, LucideIcon> = {
  GeneralRetail: ShoppingBag,
  Transport: Bus,
  EatingOutAndTreats: Coffee,
  Fuel: Fuel,
  Groceries: ShoppingCart,
  ProfessionalServices: Briefcase,
  CarUseAndServices: Car,
  DonationsAndGiving: HeartHandshake,
  GiftsAndFlowers: Gift,
  Hobbies: Gamepad2,
  HomewareAndAppliances: Home,
  MusicGamingApps: Music,
  OutdoorAndAdventure: Mountain,
  PharmaciesAndWellbeing: Pill,
  TravelAndHolidays: Plane,
  Other: MoreHorizontal,
};

/* Interfaces ---------------------------------- */

/* User generated data */
export interface budgets {
  category: categories;
  budgetAmount: number;
  spentAmount: number;
}

/* Auto generated data */
export interface userMonthlyTransactions {
  month: string;
  transactions: { day: string; amount: number }[];
}
export interface userMonthlyIncomeExpenseTransactions {
  month: string;
  transactions: { day: string; income: number; expense: number }[];
}
export interface userMonthlyCategoryExpenditure {
  month: string;
  category: categories;
  totalSpend: number;
}
