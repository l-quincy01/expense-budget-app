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
export type Category =
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

export const categoryIcons: Record<Category, LucideIcon> = {
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
export interface Overview {
  moneyIn: number;
  moneyOut: number;
  month: string;
  startingBalance: number;
  totalBudget?: number;
}

export interface Budget {
  id: string;
  userId: string;
  dashboardName: string;
  category: Category;
  budgetAmount: number;
  spentAmount: number;
}

export interface userAddedTransactions {
  userId: string;
  dashboardName: string;
  date: string;
  description: string;
  amount: number;
}

/* Auto  data */
export interface userMonthlyTransactions {
  month: string;
  transactions: { day: string; amount: number }[];
}
export interface userMonthlyIncomeExpenseTransactions {
  month: string;
  startingBalance: number;
  transactions: { day: string; income: number; expense: number }[];
}
export interface userMonthlyCategoryExpenditure {
  month: string;
  category: Category;
  totalSpend: number;
}

/*
Dashboard
*/

export interface Dashboard {
  userId: string;
  name: string;
  overview: Overview[];
  budgets?: Budget | Budget[] | null;
  userMonthlyTransactions?: userMonthlyTransactions[];
  userMonthlyIncomeExpenseTransactions?: userMonthlyIncomeExpenseTransactions[];
  userMonthlyCategoryExpenditure?: userMonthlyCategoryExpenditure[];
  createdAt?: string;
  updatedAt?: string;
}

/*Local types */
