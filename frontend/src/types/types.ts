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

export interface budgets {
  category: categories;
  budgetAmount: number;
  spentAmount: number;
  remainingAmount?: number;
}

export interface chartLineLinearData {
  month: string;
  transactions: { day: string; amount: number }[];
}
export interface charLinetMultipleData {
  month: string;
  transactions: { day: string; income: number; expense: number }[];
}
export interface charLinetMultipleCategoriesData {
  month: string;
  category: string;
  totalSpend: number;
}

export type categoryMonthlyAggregate = {
  month: string;
  category: categories;

  totalSpend: number;
};

export interface pieChart {
  category: categories;
  totalSpend: number;
  fill: string;
}

export interface pieChart2 {
  month: string;
  category: categories;
  totalSpend: number;
  fill: string;
}
